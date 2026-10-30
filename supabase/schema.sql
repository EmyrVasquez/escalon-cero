-- =============================================================
-- Escalón Cero — esquema de base de datos (Supabase / Postgres)
-- =============================================================

create extension if not exists pgcrypto;

-- -------------------------------------------------------------
-- Casos: contenido público una vez aprobado
-- -------------------------------------------------------------
create table if not exists public.casos (
  id                uuid primary key default gen_random_uuid(),
  created_at        timestamptz not null default now(),
  titulo            text not null check (char_length(titulo) between 5 and 120),
  carrera           text not null,
  rol               text not null check (char_length(rol) <= 120),
  sector            text check (char_length(sector) <= 120),
  contexto          text not null check (char_length(contexto) <= 3000),
  encargo           text not null check (char_length(encargo) <= 3000),
  complicacion      text not null check (char_length(complicacion) <= 3000),
  pregunta          text not null default '¿Qué harías tú?',
  lo_que_hice       text not null check (char_length(lo_que_hice) <= 3000),
  que_paso          text not null check (char_length(que_paso) <= 3000),
  aprendizaje       text not null check (char_length(aprendizaje) <= 3000),
  tipo_veracidad    text not null default 'real_anonimizado'
                    check (tipo_veracidad in ('real_anonimizado', 'basado_en_hechos', 'ilustrativo')),
  validado_empresa  boolean not null default false,
  autor_alias       text check (char_length(autor_alias) <= 80),
  estado            text not null default 'pendiente'
                    check (estado in ('pendiente', 'aprobado', 'rechazado'))
);

create index if not exists casos_estado_carrera_idx on public.casos (estado, carrera);

-- -------------------------------------------------------------
-- Datos privados del autor: verificación de autoría, nunca públicos
-- -------------------------------------------------------------
create table if not exists public.casos_autores (
  caso_id                    uuid primary key references public.casos (id) on delete cascade,
  nombre                     text not null,
  contacto                   text not null,
  consentimiento             boolean not null,
  confirma_sin_confidencial  boolean not null,
  created_at                 timestamptz not null default now()
);

-- -------------------------------------------------------------
-- Respuestas de estudiantes a «¿Qué harías tú?»
-- -------------------------------------------------------------
create table if not exists public.respuestas (
  id                  uuid primary key default gen_random_uuid(),
  caso_id             uuid not null references public.casos (id) on delete cascade,
  respuesta           text not null check (char_length(respuesta) between 10 and 2000),
  carrera_estudiante  text,
  created_at          timestamptz not null default now()
);

create index if not exists respuestas_caso_idx on public.respuestas (caso_id);

-- -------------------------------------------------------------
-- Reacciones a un caso
-- -------------------------------------------------------------
create table if not exists public.reacciones (
  id          uuid primary key default gen_random_uuid(),
  caso_id     uuid not null references public.casos (id) on delete cascade,
  tipo        text not null
              check (tipo in ('me_sirvio', 'no_me_sirvio', 'me_paso_algo_parecido', 'no_suele_pasar')),
  created_at  timestamptz not null default now()
);

create index if not exists reacciones_caso_idx on public.reacciones (caso_id);

-- -------------------------------------------------------------
-- Row Level Security
-- -------------------------------------------------------------
alter table public.casos         enable row level security;
alter table public.casos_autores enable row level security;
alter table public.respuestas    enable row level security;
alter table public.reacciones    enable row level security;

-- Casos: lectura pública solo de los aprobados. La escritura pasa por publicar_caso.
drop policy if exists "leer casos aprobados" on public.casos;
create policy "leer casos aprobados"
  on public.casos for select
  to anon, authenticated
  using (estado = 'aprobado');

-- casos_autores: sin políticas; solo accesible desde el panel de Supabase.

-- Respuestas: se registran para casos aprobados; no son legibles desde la web.
drop policy if exists "enviar respuesta a caso aprobado" on public.respuestas;
create policy "enviar respuesta a caso aprobado"
  on public.respuestas for insert
  to anon, authenticated
  with check (exists (select 1 from public.casos c where c.id = caso_id and c.estado = 'aprobado'));

-- Reacciones: lectura y registro para casos aprobados.
drop policy if exists "leer reacciones de casos aprobados" on public.reacciones;
create policy "leer reacciones de casos aprobados"
  on public.reacciones for select
  to anon, authenticated
  using (exists (select 1 from public.casos c where c.id = caso_id and c.estado = 'aprobado'));

drop policy if exists "enviar reaccion a caso aprobado" on public.reacciones;
create policy "enviar reaccion a caso aprobado"
  on public.reacciones for insert
  to anon, authenticated
  with check (exists (select 1 from public.casos c where c.id = caso_id and c.estado = 'aprobado'));

-- -------------------------------------------------------------
-- publicar_caso: registra un caso como pendiente junto con los datos
-- privados de su autor, en una sola operación.
-- -------------------------------------------------------------
create or replace function public.publicar_caso(
  p_titulo                     text,
  p_carrera                    text,
  p_rol                        text,
  p_sector                     text,
  p_contexto                   text,
  p_encargo                    text,
  p_complicacion               text,
  p_lo_que_hice                text,
  p_que_paso                   text,
  p_aprendizaje                text,
  p_tipo_veracidad             text,
  p_autor_alias                text,
  p_autor_nombre               text,
  p_autor_contacto             text,
  p_consentimiento             boolean,
  p_confirma_sin_confidencial  boolean
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  nuevo_id uuid;
begin
  if not coalesce(p_consentimiento, false) or not coalesce(p_confirma_sin_confidencial, false) then
    raise exception 'Se requiere el consentimiento y confirmar que el caso no incluye información confidencial';
  end if;

  if coalesce(trim(p_autor_nombre), '') = '' or coalesce(trim(p_autor_contacto), '') = '' then
    raise exception 'Se requiere el nombre y un contacto del autor';
  end if;

  insert into public.casos (
    titulo, carrera, rol, sector, contexto, encargo, complicacion,
    lo_que_hice, que_paso, aprendizaje, tipo_veracidad, autor_alias,
    estado, validado_empresa
  )
  values (
    p_titulo, p_carrera, p_rol, nullif(trim(p_sector), ''), p_contexto, p_encargo, p_complicacion,
    p_lo_que_hice, p_que_paso, p_aprendizaje, coalesce(p_tipo_veracidad, 'real_anonimizado'),
    nullif(trim(p_autor_alias), ''),
    'pendiente', false
  )
  returning id into nuevo_id;

  insert into public.casos_autores (caso_id, nombre, contacto, consentimiento, confirma_sin_confidencial)
  values (nuevo_id, p_autor_nombre, p_autor_contacto, p_consentimiento, p_confirma_sin_confidencial);

  return nuevo_id;
end;
$$;

revoke all on function public.publicar_caso(
  text, text, text, text, text, text, text, text, text, text, text, text, text, text, boolean, boolean
) from public;

grant execute on function public.publicar_caso(
  text, text, text, text, text, text, text, text, text, text, text, text, text, text, boolean, boolean
) to anon, authenticated;

-- -------------------------------------------------------------
-- Caso de ejemplo (ilustrativo)
-- -------------------------------------------------------------
insert into public.casos (
  titulo, carrera, rol, sector, contexto, encargo, complicacion,
  lo_que_hice, que_paso, aprendizaje, tipo_veracidad, autor_alias, estado
)
select
  'Las cifras no cuadran la noche antes de la reunión',
  'informatica',
  'Analista junior de datos',
  'Retail',
  'Llevas tres meses en el área de datos de una empresa de retail. Tu jefa confía en ti para los reportes semanales.',
  'Preparar el reporte de ventas del mes para la reunión de gerencia de mañana a las 9:00 a. m.',
  'Al cruzar los datos del ERP con la hoja que lleva el área comercial, las ventas no coinciden: hay una diferencia de casi 8%. Son las 9:00 p. m. y tu jefa no responde.',
  'Entregué el reporte con la cifra del ERP, porque es el sistema oficial, sin mencionar la diferencia.',
  'En la reunión, el gerente comercial objetó la cifra delante de todos. La diferencia venía de devoluciones que el ERP registraba con días de retraso. Mi jefa tuvo que explicar algo que no sabía.',
  'Avisar de una discrepancia antes de entregar, aunque retrase la entrega. Un reporte con una nota de «hay una diferencia y esta es su posible causa» vale más que un número limpio que alguien desmiente en público.',
  'ilustrativo',
  'Equipo Escalón Cero',
  'aprobado'
where not exists (
  select 1 from public.casos where titulo = 'Las cifras no cuadran la noche antes de la reunión'
);
