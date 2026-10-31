-- =============================================================
-- Escalón Cero — migración 006: flujo comprobado de punta a punta
-- Ejecutar en Supabase → SQL Editor DESPUÉS de las migraciones 004 y 005.
--
-- Qué cambia:
-- 1. Un proyecto puede tener «comprobación»: preguntas con cifras que se
--    calculan con los datos del proyecto. Las preguntas son públicas
--    (casos.comprobacion); las respuestas correctas viven en una tabla que
--    nadie puede leer desde la web (claves_comprobacion).
-- 2. La entrega de esos proyectos pasa por la función comprobar_entrega:
--    corrige en la base de datos, guarda el resultado y marca la entrega como
--    aprobada si acierta al menos el 80 %. Solo la función puede aprobar.
-- 3. Una oportunidad solo acepta la postulación si los proyectos con
--    comprobación de su ruta están aprobados (cumple_requisitos).
-- 4. Bucket privado «entregas» para subir el dashboard (captura, PDF o .pbix).
-- 5. Se configura el proyecto «Arma un dashboard de ventas en Power BI para
--    gerencia» con sus cinco preguntas.
--
-- Además, en Authentication → Sign In / Providers → Email:
--   · «Enable Email provider» ACTIVADO (hoy está apagado y por eso falla el registro).
--   · «Confirm email» DESACTIVADO, para que la cuenta funcione al instante.
-- =============================================================

-- -------------------------------------------------------------
-- 1. Preguntas públicas y respuestas privadas
-- -------------------------------------------------------------
alter table public.casos add column if not exists comprobacion jsonb;

create table if not exists public.claves_comprobacion (
  caso_id          uuid    not null references public.casos (id) on delete cascade,
  pregunta_id      text    not null,
  orden            smallint not null default 1,
  esperado_numero  numeric,
  tolerancia       numeric not null default 0,   -- relativa: 0.005 = 0,5 %
  esperado_texto   text,
  esperado_mostrar text    not null,             -- cómo se muestra la respuesta correcta
  explicacion      text    not null,             -- por qué es esa la respuesta
  pista            text    not null,             -- qué revisar si falla
  trampa_numero    numeric,                      -- error típico y su pista específica
  trampa_texto     text,
  pista_trampa     text,
  primary key (caso_id, pregunta_id),
  check (esperado_numero is not null or esperado_texto is not null)
);

-- RLS sin políticas: nadie la lee ni la escribe desde la web.
alter table public.claves_comprobacion enable row level security;
revoke all on public.claves_comprobacion from anon, authenticated;

-- -------------------------------------------------------------
-- 2. Entregas con resultado
-- -------------------------------------------------------------
alter table public.entregas add column if not exists respuestas jsonb;
alter table public.entregas add column if not exists resultado  jsonb;
alter table public.entregas add column if not exists aprobada   boolean;
alter table public.entregas add column if not exists archivo    text check (char_length(archivo) <= 300);
alter table public.entregas add column if not exists intentos   integer not null default 0;

alter table public.borradores add column if not exists respuestas jsonb not null default '{}'::jsonb;

-- Desde la web solo se pueden escribir estas columnas: «aprobada»,
-- «resultado» e «intentos» los escribe únicamente comprobar_entrega.
revoke insert, update on public.entregas from anon, authenticated;
grant insert (caso_id, solucion, enlace, archivo, criterios_cumplidos, entregado)
  on public.entregas to authenticated;
grant update (caso_id, solucion, enlace, archivo, criterios_cumplidos, entregado)
  on public.entregas to authenticated;

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

-- Corrige la entrega, la guarda y devuelve el resultado.
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
      -- Las respuestas correctas se agregan abajo, solo si aprueba.
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

-- -------------------------------------------------------------
-- 3. Requisito: los proyectos con comprobación deben estar aprobados
-- -------------------------------------------------------------
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

-- -------------------------------------------------------------
-- 4. Archivos de las entregas (privados: cada persona ve los suyos)
-- -------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit)
values ('entregas', 'entregas', false, 20971520)
on conflict (id) do update set public = false, file_size_limit = excluded.file_size_limit;

drop policy if exists "subir archivos de entrega propios" on storage.objects;
create policy "subir archivos de entrega propios"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'entregas' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists "leer archivos de entrega propios" on storage.objects;
create policy "leer archivos de entrega propios"
  on storage.objects for select
  to authenticated
  using (bucket_id = 'entregas' and (storage.foldername(name))[1] = auth.uid()::text);

-- -------------------------------------------------------------
-- 5. El proyecto del flujo completo: dashboard de ventas en Power BI
-- -------------------------------------------------------------
update public.casos
set
  duracion = '60–90 min',
  herramientas = array['Power BI Desktop', 'Excel'],
  requisitos = array[
    'Saber cargar datos y crear visuales básicos en Power BI Desktop (o tablas dinámicas en Excel).',
    'Conocer la diferencia entre una tabla de hechos y una de dimensiones.'
  ],
  entregables = array[
    'Tu dashboard: una captura, un PDF o el archivo .pbix (o el enlace si lo publicaste)',
    'Cinco cifras clave del año, que se comprueban al instante',
    'Qué le advertirías al gerente sobre la calidad de los datos'
  ],
  referencia = jsonb_build_object(
    'nombre', 'dashboard_esperado.png',
    'url', '/recursos/dashboard-ventas-power-bi/dashboard_esperado.png',
    'descripcion', 'Así se ve un dashboard que responde todas las preguntas del gerente, con devoluciones restadas y clientes unificados por RUC.'
  ),
  comprobacion = jsonb_build_array(
    jsonb_build_object(
      'id', 'ventas_netas', 'tipo', 'numero', 'unidad', 'S/',
      'enunciado', '¿Cuánto vendió la distribuidora en el año, en ventas netas?',
      'ayuda', 'En soles, sin IGV, de noviembre 2025 a octubre 2026.'
    ),
    jsonb_build_object(
      'id', 'devoluciones', 'tipo', 'numero', 'unidad', 'S/',
      'enunciado', '¿Cuánto suman las devoluciones del año?',
      'ayuda', 'Escribe el monto en positivo.'
    ),
    jsonb_build_object(
      'id', 'mes_mayor', 'tipo', 'opcion',
      'enunciado', '¿En qué mes se vendió más?',
      'opciones', (
        select jsonb_agg(jsonb_build_object('valor', to_char(m, 'YYYY-MM'), 'etiqueta', etiqueta) order by m)
        from (values
          ('2025-11-01'::date, 'Noviembre 2025'), ('2025-12-01', 'Diciembre 2025'),
          ('2026-01-01', 'Enero 2026'), ('2026-02-01', 'Febrero 2026'), ('2026-03-01', 'Marzo 2026'),
          ('2026-04-01', 'Abril 2026'), ('2026-05-01', 'Mayo 2026'), ('2026-06-01', 'Junio 2026'),
          ('2026-07-01', 'Julio 2026'), ('2026-08-01', 'Agosto 2026'), ('2026-09-01', 'Septiembre 2026'),
          ('2026-10-01', 'Octubre 2026')
        ) as meses (m, etiqueta)
      )
    ),
    jsonb_build_object(
      'id', 'cliente_top', 'tipo', 'opcion',
      'enunciado', '¿Qué cliente compró más en el año?',
      'opciones', jsonb_build_array(
        jsonb_build_object('valor', 'bodega-san-martin', 'etiqueta', 'Bodega San Martín'),
        jsonb_build_object('valor', 'distribuidora-los-olivos', 'etiqueta', 'Distribuidora Los Olivos'),
        jsonb_build_object('valor', 'restaurante-dona-rosa', 'etiqueta', 'Restaurante Doña Rosa'),
        jsonb_build_object('valor', 'restaurante-el-sol', 'etiqueta', 'Restaurante El Sol'),
        jsonb_build_object('valor', 'restaurante-la-esperanza', 'etiqueta', 'Restaurante La Esperanza')
      )
    ),
    jsonb_build_object(
      'id', 'clientes_reales', 'tipo', 'numero',
      'enunciado', '¿Cuántos clientes distintos tiene realmente la distribuidora?',
      'ayuda', 'Un número entero.'
    )
  )
where titulo = 'Arma un dashboard de ventas en Power BI para gerencia';

-- Respuestas calculadas con ventas_distribuidora.xlsx (9 587 filas).
insert into public.claves_comprobacion
  (caso_id, pregunta_id, orden, esperado_numero, tolerancia, esperado_texto, esperado_mostrar, explicacion, pista, trampa_numero, trampa_texto, pista_trampa)
select c.id, v.pregunta_id, v.orden, v.esperado_numero, v.tolerancia, v.esperado_texto, v.esperado_mostrar, v.explicacion, v.pista, v.trampa_numero, v.trampa_texto, v.pista_trampa
from public.casos c
cross join (values
  ('ventas_netas', 1, 2329351.90::numeric, 0.005::numeric, null::text,
   'S/ 2 329 351,90',
   'Es la suma de «importe» de todas las filas: facturas y boletas (S/ 2 408 533,79) menos las notas de crédito (S/ 79 181,89).',
   'Suma la columna «importe» de la hoja Ventas para todo el año. Revisa que no estés filtrando algún tipo de documento.',
   2408533.79::numeric, null::text,
   'Ese es el total sin restar las devoluciones. Las notas de crédito (importe negativo) también forman parte de las ventas netas.'),
  ('devoluciones', 2, 79181.89, 0.005, null,
   'S/ 79 181,89',
   'Son las 522 notas de crédito del año. En el ERP aparecen como ventas con importe negativo, por eso hay que separarlas.',
   'Filtra tipo_documento = «Nota de crédito» y suma su importe.',
   null, null, null),
  ('mes_mayor', 3, null, 0, '2025-12',
   'Diciembre 2025 (S/ 352 904,65)',
   'Diciembre casi duplica a febrero, el mes más bajo (S/ 135 451,19): la campaña navideña explica el pico.',
   'Agrupa las ventas netas por mes de la columna «fecha» y compáralas.',
   null, null, null),
  ('cliente_top', 4, null, 0, 'restaurante-el-sol',
   'Restaurante El Sol (S/ 257 654,15)',
   'El Sol está registrado con tres códigos (C1006, C1007 y C1008) que comparten el mismo RUC. Unificado por RUC, supera a Doña Rosa (S/ 244 058,31).',
   'Relaciona Ventas con Clientes y agrupa por cliente. Revisa si un mismo cliente aparece con varios códigos.',
   null, 'restaurante-dona-rosa',
   'Doña Rosa es el código que más compra, pero no el cliente. Hay clientes registrados con varios códigos: agrúpalos por RUC.'),
  ('clientes_reales', 5, 55, 0, null,
   '55 clientes',
   'La hoja Clientes tiene 63 códigos, pero solo 55 RUC distintos: 6 clientes están duplicados en el ERP.',
   'Cuenta los clientes distintos de la hoja Clientes. ¿Qué columna identifica de verdad a un cliente?',
   63, null,
   '63 son códigos de cliente, no clientes. Varios códigos comparten el mismo RUC: cuenta los RUC distintos.')
) as v (pregunta_id, orden, esperado_numero, tolerancia, esperado_texto, esperado_mostrar, explicacion, pista, trampa_numero, trampa_texto, pista_trampa)
where c.titulo = 'Arma un dashboard de ventas en Power BI para gerencia'
on conflict (caso_id, pregunta_id) do update set
  orden = excluded.orden,
  esperado_numero = excluded.esperado_numero,
  tolerancia = excluded.tolerancia,
  esperado_texto = excluded.esperado_texto,
  esperado_mostrar = excluded.esperado_mostrar,
  explicacion = excluded.explicacion,
  pista = excluded.pista,
  trampa_numero = excluded.trampa_numero,
  trampa_texto = excluded.trampa_texto,
  pista_trampa = excluded.pista_trampa;
