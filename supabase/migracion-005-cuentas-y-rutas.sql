-- =============================================================
-- Escalón Cero — migración 005: cuentas, rutas y requisitos por rol
-- Correr DESPUÉS de migracion-004-oportunidades.sql.
-- Supabase → SQL Editor → New query → pegar todo → Run
--
-- 1. Cada proyecto (tabla casos) pertenece a una etapa de una ruta.
-- 2. Cada oportunidad pide completar una ruta hasta una etapa: así solo
--    postula quien siguió la línea del rol.
-- 3. Oportunidades: experiencia con empresa (sin pago) o reto con premio.
-- 4. El progreso vive en la cuenta: entregas y borradores por usuario.
-- 5. Las postulaciones exigen sesión y se validan en la base de datos.
--
-- Además, en Authentication → Sign In / Providers → Email, desactivar
-- «Confirm email» para que el registro funcione al instante en la demo.
-- =============================================================

-- -------------------------------------------------------------
-- 1. Proyectos dentro de las rutas
-- -------------------------------------------------------------
alter table public.casos add column if not exists ruta  text;
alter table public.casos add column if not exists etapa smallint check (etapa between 1 and 3);

update public.casos set ruta = 'desarrollador-erp-junior', etapa = 1
  where titulo = 'Arma un dashboard de ventas en Power BI para gerencia';
update public.casos set ruta = 'analista-junior-de-datos', etapa = 1
  where titulo = 'Las cifras no cuadran la noche antes de la reunión';
update public.casos set ruta = 'qa-junior', etapa = 1
  where titulo = 'Prueba el proceso de compra de una tienda online';
update public.casos set ruta = 'asistente-de-marketing-digital', etapa = 1
  where titulo = 'Prepara una campaña de Instagram para una panadería';
update public.casos set ruta = 'disenador-grafico-junior', etapa = 1
  where titulo = 'Revisa veinte banners generados con IA antes de entregarlos';

-- -------------------------------------------------------------
-- 2 y 3. Oportunidades: ruta requerida y nuevos tipos
-- -------------------------------------------------------------
alter table public.oportunidades add column if not exists ruta            text;
alter table public.oportunidades add column if not exists etapa_requerida smallint not null default 1
  check (etapa_requerida between 1 and 3);

alter table public.oportunidades drop constraint if exists oportunidades_tipo_check;
update public.oportunidades set tipo = 'experiencia_empresa' where tipo <> 'reto_con_premio';
alter table public.oportunidades add constraint oportunidades_tipo_check
  check (tipo in ('experiencia_empresa', 'reto_con_premio'));

alter table public.oportunidades drop column if exists practicas_requeridas;

update public.oportunidades set
  ruta = 'desarrollador-erp-junior',
  compensacion = 'Constancia de la empresa, carta de recomendación y un caso real para tu portafolio',
  descripcion = 'La distribuidora exporta sus ventas del ERP a Excel cada mes y el gerente arma los números a mano. Busca a alguien que limpie la base, construya un dashboard en Power BI y le explique cómo actualizarlo. Es un encargo cerrado, sin pago, con una reunión de inicio y una de entrega; a cambio, la empresa firma una constancia del trabajo y una carta de recomendación.'
where titulo = 'Dashboard de ventas en Power BI para una distribuidora';

update public.oportunidades set ruta = 'qa-junior'
where titulo = 'Reto: encuentra fallas en el checkout antes del lanzamiento';

update public.oportunidades set
  ruta = 'analista-junior-de-datos',
  titulo = 'Encuentra por qué no cuadran las ventas y el inventario de una cadena de boticas',
  resumen = 'Una cadena de boticas necesita explicar las diferencias entre su sistema de ventas y su inventario antes del cierre de mes.',
  descripcion = 'Cada mes, las ventas del sistema y el inventario de los almacenes no coinciden y nadie sabe por qué. La cadena no tiene analista: busca a alguien que revise tres meses de datos, encuentre las causas más probables y las presente al jefe comercial. Es un encargo sin pago; a cambio, la empresa firma una constancia y una carta de recomendación.',
  que_haras = array[
    'Cruzar las ventas del sistema con los movimientos de inventario',
    'Clasificar las diferencias y proponer su causa más probable',
    'Presentar los hallazgos al jefe comercial en una reunión virtual'
  ],
  requisitos = array['Excel intermedio', 'Disponibilidad para una reunión de presentación'],
  compensacion = 'Constancia de la empresa, carta de recomendación y un caso real para tu portafolio',
  modalidad = 'remoto',
  ubicacion = null,
  dedicacion = '3 semanas · unas 8 horas por semana',
  cupos = 2
where titulo = 'Practicante de análisis de datos en una cadena de boticas';

update public.oportunidades set
  ruta = 'asistente-de-marketing-digital',
  compensacion = 'Constancia de la empresa, carta de recomendación y los resultados de la campaña para tu portafolio'
where titulo = 'Campaña de Instagram para el lanzamiento de una panadería';

update public.oportunidades set ruta = 'disenador-grafico-junior'
where titulo = 'Reto: corrige las piezas de una campaña hecha con IA';

-- -------------------------------------------------------------
-- 4. Progreso en la cuenta del estudiante
-- -------------------------------------------------------------
create table if not exists public.entregas (
  id                   uuid primary key default gen_random_uuid(),
  user_id              uuid not null default auth.uid() references auth.users (id) on delete cascade,
  caso_id              uuid not null references public.casos (id) on delete cascade,
  solucion             text not null check (char_length(solucion) between 10 and 2000),
  enlace               text check (char_length(enlace) <= 500),
  criterios_cumplidos  text[] not null default '{}',
  entregado            timestamptz not null default now(),
  unique (user_id, caso_id)
);

create table if not exists public.borradores (
  user_id     uuid not null default auth.uid() references auth.users (id) on delete cascade,
  caso_id     uuid not null references public.casos (id) on delete cascade,
  solucion    text not null default '' check (char_length(solucion) <= 2000),
  enlace      text not null default '' check (char_length(enlace) <= 500),
  actualizado timestamptz not null default now(),
  primary key (user_id, caso_id)
);

alter table public.entregas   enable row level security;
alter table public.borradores enable row level security;

drop policy if exists "entregas propias" on public.entregas;
create policy "entregas propias"
  on public.entregas for all
  to authenticated
  using (user_id = auth.uid())
  with check (
    user_id = auth.uid()
    and exists (select 1 from public.casos c where c.id = caso_id and c.estado = 'aprobado')
  );

drop policy if exists "borradores propios" on public.borradores;
create policy "borradores propios"
  on public.borradores for all
  to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- -------------------------------------------------------------
-- 5. Postulaciones con cuenta y requisito validado
-- -------------------------------------------------------------
alter table public.postulaciones
  add column if not exists user_id uuid default auth.uid() references auth.users (id) on delete cascade;

create unique index if not exists postulaciones_usuario_oportunidad_idx
  on public.postulaciones (user_id, oportunidad_id);

-- true si quien llama ya entregó todos los proyectos que pide la oportunidad:
-- los de su ruta, desde la etapa 1 hasta la etapa requerida.
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
        select 1 from public.entregas e where e.caso_id = c.id and e.user_id = auth.uid()
      )
  );
$$;

grant execute on function public.cumple_requisitos(uuid) to authenticated;

drop policy if exists "postular a oportunidad abierta" on public.postulaciones;
create policy "postular a oportunidad abierta"
  on public.postulaciones for insert
  to authenticated
  with check (
    user_id = auth.uid()
    and consentimiento
    and exists (select 1 from public.oportunidades o where o.id = oportunidad_id and o.estado = 'abierta')
    and public.cumple_requisitos(oportunidad_id)
  );

drop policy if exists "leer postulaciones propias" on public.postulaciones;
create policy "leer postulaciones propias"
  on public.postulaciones for select
  to authenticated
  using (user_id = auth.uid());
