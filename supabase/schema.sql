-- Escalón Cero: estructura de la base de datos (Supabase / Postgres)
--
-- Este archivo crea todo desde cero: tablas, reglas de acceso (RLS),
-- funciones y el bucket de archivos. Los datos de ejemplo están en seed.sql.
--
-- Para una base nueva: SQL Editor → pegar este archivo → Run; luego seed.sql.
-- Se puede volver a correr sin romper nada.
--
-- Nombres: la tabla de proyectos se llama «casos» porque así nació el
-- proyecto. En la interfaz y en el código siempre se habla de «proyectos».

create extension if not exists pgcrypto;


-- ============================================================
-- Proyectos (tabla casos)
-- ============================================================

create table if not exists public.casos (
  id                 uuid primary key default gen_random_uuid(),
  created_at         timestamptz not null default now(),

  -- El encargo
  titulo             text not null check (char_length(titulo) between 5 and 120),
  carrera            text not null,                                   -- área: software, datos, erp…
  rol                text not null check (char_length(rol) <= 120),
  sector             text check (char_length(sector) <= 120),
  resumen            text check (char_length(resumen) <= 240),
  contexto           text not null check (char_length(contexto) <= 3000),
  encargo            text not null check (char_length(encargo) <= 3000),
  complicacion       text not null check (char_length(complicacion) <= 3000),
  pregunta           text not null default '¿Qué harías tú?',
  materiales         text check (char_length(materiales) <= 2000),
  nivel              text not null default 'inicial' check (nivel in ('inicial', 'intermedio')),
  duracion           text check (char_length(duracion) <= 40),
  habilidades        text[] not null default '{}',
  entregables        text[] not null default '{}',
  criterios          text[] not null default '{}',
  herramientas       text[] not null default '{}',
  requisitos         text[] not null default '{}',
  recursos           jsonb not null default '[]'::jsonb,              -- [{ nombre, descripcion, url }]
  referencia         jsonb,                                           -- solución de referencia, se ve al aprobar
  enlace_obligatorio boolean not null default false,

  -- Lugar en la ruta del rol
  ruta               text,                                            -- slug de src/lib/rutas.ts
  etapa              smallint check (etapa between 1 and 3),

  -- Preguntas que se corrigen solas (las respuestas están en claves_comprobacion)
  comprobacion       jsonb,

  -- Lo que pasó de verdad: solo se muestra después de entregar
  lo_que_hice        text not null check (char_length(lo_que_hice) <= 3000),
  que_paso           text not null check (char_length(que_paso) <= 3000),
  aprendizaje        text not null check (char_length(aprendizaje) <= 3000),

  -- Origen y publicación
  tipo_veracidad     text not null default 'real_anonimizado'
                     check (tipo_veracidad in ('real_anonimizado', 'basado_en_hechos', 'ilustrativo')),
  validado_empresa   boolean not null default false,
  autor_alias        text check (char_length(autor_alias) <= 80),
  destacada          boolean not null default false,
  estado             text not null default 'pendiente' check (estado in ('pendiente', 'aprobado', 'rechazado'))
);

create index if not exists casos_estado_carrera_idx on public.casos (estado, carrera);

-- Datos de quien aporta un caso. Nunca se leen desde la web.
create table if not exists public.casos_autores (
  caso_id                    uuid primary key references public.casos (id) on delete cascade,
  nombre                     text not null,
  contacto                   text not null,
  consentimiento             boolean not null,
  confirma_sin_confidencial  boolean not null,
  created_at                 timestamptz not null default now()
);

-- Respuestas anónimas a los proyectos, para que el equipo vea qué escriben.
create table if not exists public.respuestas (
  id                  uuid primary key default gen_random_uuid(),
  caso_id             uuid not null references public.casos (id) on delete cascade,
  respuesta           text not null check (char_length(respuesta) between 10 and 2000),
  enlace              text check (char_length(enlace) <= 500),
  carrera_estudiante  text,
  created_at          timestamptz not null default now()
);

create index if not exists respuestas_caso_idx on public.respuestas (caso_id);

create table if not exists public.reacciones (
  id          uuid primary key default gen_random_uuid(),
  caso_id     uuid not null references public.casos (id) on delete cascade,
  tipo        text not null check (tipo in ('me_sirvio', 'no_me_sirvio', 'me_paso_algo_parecido', 'no_suele_pasar')),
  created_at  timestamptz not null default now()
);

create index if not exists reacciones_caso_idx on public.reacciones (caso_id);

-- Respuestas correctas de los proyectos con comprobación. Sin políticas:
-- nadie las lee desde la web, solo la función comprobar_entrega.
create table if not exists public.claves_comprobacion (
  caso_id          uuid not null references public.casos (id) on delete cascade,
  pregunta_id      text not null,
  orden            smallint not null default 1,
  esperado_numero  numeric,
  tolerancia       numeric not null default 0,      -- relativa: 0.005 = 0,5 %
  esperado_texto   text,
  esperado_mostrar text not null,                   -- cómo se muestra la respuesta correcta
  explicacion      text not null,
  pista            text not null,                   -- qué revisar si se equivoca
  trampa_numero    numeric,                         -- error típico, con su propia pista
  trampa_texto     text,
  pista_trampa     text,
  primary key (caso_id, pregunta_id),
  check (esperado_numero is not null or esperado_texto is not null)
);


-- ============================================================
-- Oportunidades y postulaciones
-- ============================================================

create table if not exists public.oportunidades (
  id               uuid primary key default gen_random_uuid(),
  created_at       timestamptz not null default now(),
  titulo           text not null check (char_length(titulo) between 5 and 140),
  empresa          text not null check (char_length(empresa) <= 120),
  sector           text check (char_length(sector) <= 120),
  tipo             text not null,
  carrera          text not null,
  rol              text not null check (char_length(rol) <= 120),
  resumen          text check (char_length(resumen) <= 240),
  descripcion      text not null check (char_length(descripcion) <= 3000),
  que_haras        text[] not null default '{}',
  requisitos       text[] not null default '{}',
  compensacion     text not null check (char_length(compensacion) <= 160),
  modalidad        text not null default 'remoto' check (modalidad in ('remoto', 'presencial', 'hibrido')),
  ubicacion        text check (char_length(ubicacion) <= 120),
  dedicacion       text check (char_length(dedicacion) <= 120),
  cupos            integer not null default 1 check (cupos > 0),
  cierra           date,
  es_ejemplo       boolean not null default true,   -- empresa ficticia: se marca en la web
  destacada        boolean not null default false,
  estado           text not null default 'borrador' check (estado in ('borrador', 'abierta', 'cerrada')),

  -- Requisito: completar la ruta del rol hasta esta etapa
  ruta             text,
  etapa_requerida  smallint not null default 1 check (etapa_requerida between 1 and 3),

  constraint oportunidades_tipo_check check (tipo in ('experiencia_empresa', 'reto_con_premio'))
);

create index if not exists oportunidades_estado_carrera_idx on public.oportunidades (estado, carrera);

create table if not exists public.postulaciones (
  id              uuid primary key default gen_random_uuid(),
  created_at      timestamptz not null default now(),
  oportunidad_id  uuid not null references public.oportunidades (id) on delete cascade,
  nombre          text not null check (char_length(nombre) between 2 and 120),
  correo          text not null check (char_length(correo) <= 200 and correo ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  mensaje         text check (char_length(mensaje) <= 1500),
  entregas        jsonb not null default '[]'::jsonb,   -- proyectos adjuntos
  consentimiento  boolean not null check (consentimiento),
  user_id         uuid default auth.uid() references auth.users (id) on delete cascade,
  cv              text check (char_length(cv) <= 300)   -- ruta del PDF en el bucket «entregas»
);

create index if not exists postulaciones_oportunidad_idx on public.postulaciones (oportunidad_id);
create unique index if not exists postulaciones_usuario_oportunidad_idx on public.postulaciones (user_id, oportunidad_id);


-- ============================================================
-- Progreso del estudiante (cada quien ve solo lo suyo)
-- ============================================================

create table if not exists public.entregas (
  id                   uuid primary key default gen_random_uuid(),
  user_id              uuid not null default auth.uid() references auth.users (id) on delete cascade,
  caso_id              uuid not null references public.casos (id) on delete cascade,
  solucion             text not null check (char_length(solucion) between 10 and 2000),
  enlace               text check (char_length(enlace) <= 500),
  criterios_cumplidos  text[] not null default '{}',
  entregado            timestamptz not null default now(),
  respuestas           jsonb,                     -- cifras que respondió
  resultado            jsonb,                     -- lo que devolvió comprobar_entrega
  aprobada             boolean,                   -- solo la escribe comprobar_entrega
  archivo              text check (char_length(archivo) <= 300),
  intentos             integer not null default 0,
  unique (user_id, caso_id)
);

create table if not exists public.borradores (
  user_id     uuid not null default auth.uid() references auth.users (id) on delete cascade,
  caso_id     uuid not null references public.casos (id) on delete cascade,
  solucion    text not null default '' check (char_length(solucion) <= 2000),
  enlace      text not null default '' check (char_length(enlace) <= 500),
  actualizado timestamptz not null default now(),
  respuestas  jsonb not null default '{}'::jsonb,
  primary key (user_id, caso_id)
);


-- ============================================================
-- Funciones
-- ============================================================

-- Propone un caso nuevo (queda pendiente) junto con los datos de su autor.
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

-- ¿Quien llama ya completó la ruta que pide la oportunidad? Cuentan los
-- proyectos de la ruta hasta la etapa requerida; los que tienen comprobación,
-- solo si están aprobados.
create or replace function public.cumple_requisitos(p_oportunidad uuid)
returns boolean
language sql
stable
set search_path = public
as $$
  select not exists (
    select 1
    from public.oportunidades o
    join public.casos c
      on c.ruta = o.ruta and c.etapa <= o.etapa_requerida and c.estado = 'aprobado'
    where o.id = p_oportunidad
      and not exists (
        select 1 from public.entregas e
        where e.caso_id = c.id
          and e.user_id = auth.uid()
          and (c.comprobacion is null or e.aprobada is true)
      )
  );
$$;

grant execute on function public.cumple_requisitos(uuid) to authenticated;

-- Convierte lo que escribe una persona en un número:
-- «S/ 2,329,351.90», «2 329 351,90», «2329351.9», «-79 181,89».
create or replace function public.a_numero(p_texto text)
returns numeric
language plpgsql
immutable
set search_path = public
as $$
declare
  t text := regexp_replace(coalesce(p_texto, ''), '[^0-9,.\-]', '', 'g');
  ultimo_punto int;
  ultima_coma int;
begin
  if t !~ '[0-9]' then
    return null;
  end if;
  ultimo_punto := length(t) - strpos(reverse(t), '.') + 1;
  ultima_coma  := length(t) - strpos(reverse(t), ',') + 1;
  if strpos(t, '.') > 0 and strpos(t, ',') > 0 then
    -- El último separador es el decimal.
    if ultimo_punto > ultima_coma then
      t := replace(t, ',', '');
    else
      t := replace(replace(t, '.', ''), ',', '.');
    end if;
  elsif strpos(t, ',') > 0 then
    -- Una sola coma con 1 o 2 decimales: «79181,89». Si no, separa miles.
    if t ~ '^-?[0-9]+,[0-9]{1,2}$' then
      t := replace(t, ',', '.');
    else
      t := replace(t, ',', '');
    end if;
  elsif t ~ '\..*\.' then
    -- Varios puntos: separan miles, «2.329.351».
    t := replace(t, '.', '');
  end if;
  return t::numeric;
exception when others then
  return null;
end;
$$;

-- Corrige la entrega de un proyecto con comprobación, la guarda y devuelve el
-- resultado. Aprueba con el 80 % de aciertos. Sin aprobar, devuelve pistas
-- pero no las respuestas correctas.
create or replace function public.comprobar_entrega(
  p_caso       uuid,
  p_respuestas jsonb,
  p_solucion   text,
  p_enlace     text default null,
  p_archivo    text default null
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid       uuid := auth.uid();
  v_caso      public.casos%rowtype;
  k           record;
  v_resp      text;
  v_num       numeric;
  v_ok        boolean;
  v_trampa    boolean;
  v_detalle   jsonb := '[]'::jsonb;
  v_aciertos  int := 0;
  v_total     int := 0;
  v_minimo    int;
  v_aprobada  boolean;
  v_previa    boolean;
  v_intentos  int;
  v_resultado jsonb;
begin
  if v_uid is null then
    raise exception 'Necesitas iniciar sesión para entregar.' using errcode = '42501';
  end if;

  select * into v_caso from public.casos where id = p_caso and estado = 'aprobado';
  if not found or v_caso.comprobacion is null then
    raise exception 'Este proyecto no tiene comprobación automática.' using errcode = 'P0002';
  end if;

  p_solucion := trim(coalesce(p_solucion, ''));
  p_enlace   := nullif(trim(coalesce(p_enlace, '')), '');
  p_archivo  := nullif(trim(coalesce(p_archivo, '')), '');

  -- Una entrega aprobada ya no se corrige de nuevo: se devuelve tal cual.
  select resultado into v_resultado
    from public.entregas where user_id = v_uid and caso_id = p_caso and aprobada;
  if v_resultado is not null then
    return v_resultado;
  end if;

  -- Al reintentar, el archivo que ya subió sigue valiendo.
  if p_archivo is null then
    select archivo into p_archivo from public.entregas where user_id = v_uid and caso_id = p_caso;
  end if;

  if char_length(p_solucion) < 10 or char_length(p_solucion) > 2000 then
    raise exception 'La explicación debe tener entre 10 y 2000 caracteres.' using errcode = '22023';
  end if;
  if v_caso.enlace_obligatorio and p_enlace is null and p_archivo is null then
    raise exception 'Sube tu archivo o pega el enlace a tu trabajo.' using errcode = '22023';
  end if;
  if p_enlace is not null and (p_enlace !~* '^https?://\S+$' or char_length(p_enlace) > 500) then
    raise exception 'El enlace no es válido.' using errcode = '22023';
  end if;
  if p_archivo is not null and p_archivo not like v_uid::text || '/%' then
    raise exception 'El archivo no es tuyo.' using errcode = '42501';
  end if;

  for k in
    select * from public.claves_comprobacion where caso_id = p_caso order by orden, pregunta_id
  loop
    v_total  := v_total + 1;
    v_resp   := left(trim(coalesce(p_respuestas ->> k.pregunta_id, '')), 120);
    v_trampa := false;

    if k.esperado_numero is not null then
      v_num := public.a_numero(v_resp);
      v_ok := v_num is not null
        and abs(abs(v_num) - k.esperado_numero) <= greatest(k.tolerancia * k.esperado_numero, 0.01);
      v_trampa := not v_ok and v_num is not null and k.trampa_numero is not null
        and abs(abs(v_num) - k.trampa_numero) <= greatest(k.tolerancia * k.trampa_numero, 0.01);
    else
      v_ok := lower(v_resp) = lower(k.esperado_texto);
      v_trampa := not v_ok and k.trampa_texto is not null and lower(v_resp) = lower(k.trampa_texto);
    end if;

    if v_ok then
      v_aciertos := v_aciertos + 1;
    end if;

    v_detalle := v_detalle || jsonb_build_object(
      'id', k.pregunta_id,
      'respuesta', v_resp,
      'correcta', v_ok,
      'pista', case when v_ok then null when v_trampa then coalesce(k.pista_trampa, k.pista) else k.pista end,
      'esperado', k.esperado_mostrar,
      'explicacion', k.explicacion
    );
  end loop;

  if v_total = 0 then
    raise exception 'Este proyecto no tiene preguntas configuradas.' using errcode = 'P0002';
  end if;

  v_minimo := ceil(v_total * 0.8);
  select aprobada, intentos into v_previa, v_intentos
    from public.entregas where user_id = v_uid and caso_id = p_caso;
  v_aprobada := v_aciertos >= v_minimo or coalesce(v_previa, false);
  v_intentos := coalesce(v_intentos, 0) + 1;

  -- Sin aprobar, no se revela la respuesta correcta: solo la pista.
  if not v_aprobada then
    select coalesce(jsonb_agg(d - 'esperado' - 'explicacion'), '[]'::jsonb)
      into v_detalle
      from jsonb_array_elements(v_detalle) d;
  end if;

  v_resultado := jsonb_build_object(
    'aprobada', v_aprobada,
    'aciertos', v_aciertos,
    'total', v_total,
    'minimo', v_minimo,
    'intentos', v_intentos,
    'detalle', v_detalle
  );

  insert into public.entregas as e
    (user_id, caso_id, solucion, enlace, archivo, respuestas, resultado, aprobada, intentos, criterios_cumplidos, entregado)
  values
    (v_uid, p_caso, p_solucion, p_enlace, p_archivo, coalesce(p_respuestas, '{}'::jsonb), v_resultado, v_aprobada, v_intentos, '{}', now())
  on conflict (user_id, caso_id) do update set
    solucion   = excluded.solucion,
    enlace     = excluded.enlace,
    archivo    = coalesce(excluded.archivo, e.archivo),
    respuestas = excluded.respuestas,
    resultado  = excluded.resultado,
    aprobada   = excluded.aprobada,
    intentos   = excluded.intentos,
    entregado  = now();

  delete from public.borradores where user_id = v_uid and caso_id = p_caso;

  return v_resultado;
end;
$$;

revoke all on function public.comprobar_entrega(uuid, jsonb, text, text, text) from public, anon;
grant execute on function public.comprobar_entrega(uuid, jsonb, text, text, text) to authenticated;


-- ============================================================
-- Reglas de acceso (RLS)
-- ============================================================

alter table public.casos               enable row level security;
alter table public.casos_autores       enable row level security;
alter table public.respuestas          enable row level security;
alter table public.reacciones          enable row level security;
alter table public.claves_comprobacion enable row level security;
alter table public.oportunidades       enable row level security;
alter table public.postulaciones       enable row level security;
alter table public.entregas            enable row level security;
alter table public.borradores          enable row level security;

-- Proyectos: todos ven los aprobados. Para proponer uno se usa publicar_caso.
drop policy if exists "leer casos aprobados" on public.casos;
create policy "leer casos aprobados" on public.casos
  for select to anon, authenticated
  using (estado = 'aprobado');

drop policy if exists "enviar respuesta a caso aprobado" on public.respuestas;
create policy "enviar respuesta a caso aprobado" on public.respuestas
  for insert to anon, authenticated
  with check (exists (select 1 from public.casos c where c.id = caso_id and c.estado = 'aprobado'));

drop policy if exists "leer reacciones de casos aprobados" on public.reacciones;
create policy "leer reacciones de casos aprobados" on public.reacciones
  for select to anon, authenticated
  using (exists (select 1 from public.casos c where c.id = caso_id and c.estado = 'aprobado'));

drop policy if exists "enviar reaccion a caso aprobado" on public.reacciones;
create policy "enviar reaccion a caso aprobado" on public.reacciones
  for insert to anon, authenticated
  with check (exists (select 1 from public.casos c where c.id = caso_id and c.estado = 'aprobado'));

-- Oportunidades: se ven las abiertas y las cerradas.
drop policy if exists "leer oportunidades publicadas" on public.oportunidades;
create policy "leer oportunidades publicadas" on public.oportunidades
  for select to anon, authenticated
  using (estado in ('abierta', 'cerrada'));

-- Postular: con sesión, con el CV en tu carpeta y cumpliendo el requisito.
drop policy if exists "postular a oportunidad abierta" on public.postulaciones;
create policy "postular a oportunidad abierta" on public.postulaciones
  for insert to authenticated
  with check (
    user_id = auth.uid()
    and consentimiento
    and (cv is null or cv like auth.uid()::text || '/cv/%')
    and exists (select 1 from public.oportunidades o where o.id = oportunidad_id and o.estado = 'abierta')
    and public.cumple_requisitos(oportunidad_id)
  );

drop policy if exists "leer postulaciones propias" on public.postulaciones;
create policy "leer postulaciones propias" on public.postulaciones
  for select to authenticated
  using (user_id = auth.uid());

drop policy if exists "entregas propias" on public.entregas;
create policy "entregas propias" on public.entregas
  for all to authenticated
  using (user_id = auth.uid())
  with check (
    user_id = auth.uid()
    and exists (select 1 from public.casos c where c.id = caso_id and c.estado = 'aprobado')
  );

drop policy if exists "borradores propios" on public.borradores;
create policy "borradores propios" on public.borradores
  for all to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- Desde la web no se puede escribir «aprobada», «resultado» ni «intentos»:
-- eso lo hace solo comprobar_entrega.
revoke insert, update on public.entregas from anon, authenticated;
grant insert (caso_id, solucion, enlace, archivo, criterios_cumplidos, entregado) on public.entregas to authenticated;
grant update (caso_id, solucion, enlace, archivo, criterios_cumplidos, entregado) on public.entregas to authenticated;

revoke all on public.claves_comprobacion from anon, authenticated;


-- ============================================================
-- Archivos: dashboards y CV (bucket privado, una carpeta por persona)
-- ============================================================

insert into storage.buckets (id, name, public, file_size_limit)
values ('entregas', 'entregas', false, 20971520)
on conflict (id) do update set public = false, file_size_limit = excluded.file_size_limit;

drop policy if exists "subir archivos de entrega propios" on storage.objects;
create policy "subir archivos de entrega propios" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'entregas' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists "leer archivos de entrega propios" on storage.objects;
create policy "leer archivos de entrega propios" on storage.objects
  for select to authenticated
  using (bucket_id = 'entregas' and (storage.foldername(name))[1] = auth.uid()::text);
