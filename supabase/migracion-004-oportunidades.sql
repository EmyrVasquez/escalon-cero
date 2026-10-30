-- =============================================================
-- Escalón Cero — migración 004: oportunidades y postulaciones
-- Correr DESPUÉS de schema.sql, migracion-002 y migracion-003.
-- Supabase → SQL Editor → New query → pegar todo → Run
--
-- Oportunidades: proyectos pagados, retos con premio y prácticas
-- preprofesionales para personas sin experiencia. En el MVP las
-- publica el equipo de Escalón Cero después de acordarlas con la
-- empresa; no hay vista de empresa.
-- =============================================================

-- -------------------------------------------------------------
-- 1. Oportunidades (oferta)
-- -------------------------------------------------------------
create table if not exists public.oportunidades (
  id                    uuid primary key default gen_random_uuid(),
  created_at            timestamptz not null default now(),
  titulo                text not null check (char_length(titulo) between 5 and 140),
  empresa               text not null check (char_length(empresa) <= 120),
  sector                text check (char_length(sector) <= 120),
  tipo                  text not null
                        check (tipo in ('proyecto_pagado', 'reto_con_premio', 'practica_preprofesional')),
  carrera               text not null,
  rol                   text not null check (char_length(rol) <= 120),
  resumen               text check (char_length(resumen) <= 240),
  descripcion           text not null check (char_length(descripcion) <= 3000),
  que_haras             text[] not null default '{}',
  requisitos            text[] not null default '{}',
  -- Prácticas de Escalón Cero que hay que entregar para postular (ids de casos)
  practicas_requeridas  uuid[] not null default '{}',
  compensacion          text not null check (char_length(compensacion) <= 160),
  modalidad             text not null default 'remoto' check (modalidad in ('remoto', 'presencial', 'hibrido')),
  ubicacion             text check (char_length(ubicacion) <= 120),
  dedicacion            text check (char_length(dedicacion) <= 120),
  cupos                 integer not null default 1 check (cupos > 0),
  cierra                date,
  -- true: oportunidad de ejemplo para la demo (empresa ficticia)
  es_ejemplo            boolean not null default true,
  destacada             boolean not null default false,
  estado                text not null default 'borrador' check (estado in ('borrador', 'abierta', 'cerrada'))
);

create index if not exists oportunidades_estado_carrera_idx on public.oportunidades (estado, carrera);

-- -------------------------------------------------------------
-- 2. Postulaciones (demanda): privadas, solo visibles desde el panel
-- -------------------------------------------------------------
create table if not exists public.postulaciones (
  id              uuid primary key default gen_random_uuid(),
  created_at      timestamptz not null default now(),
  oportunidad_id  uuid not null references public.oportunidades (id) on delete cascade,
  nombre          text not null check (char_length(nombre) between 2 and 120),
  correo          text not null check (char_length(correo) <= 200 and correo ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  mensaje         text check (char_length(mensaje) <= 1500),
  -- Entregas de las prácticas requeridas: [{ practica_id, titulo, enlace, solucion }]
  entregas        jsonb not null default '[]'::jsonb,
  consentimiento  boolean not null check (consentimiento)
);

create index if not exists postulaciones_oportunidad_idx on public.postulaciones (oportunidad_id);

alter table public.oportunidades enable row level security;
alter table public.postulaciones enable row level security;

drop policy if exists "leer oportunidades publicadas" on public.oportunidades;
create policy "leer oportunidades publicadas"
  on public.oportunidades for select
  to anon, authenticated
  using (estado in ('abierta', 'cerrada'));

drop policy if exists "postular a oportunidad abierta" on public.postulaciones;
create policy "postular a oportunidad abierta"
  on public.postulaciones for insert
  to anon, authenticated
  with check (
    consentimiento
    and exists (select 1 from public.oportunidades o where o.id = oportunidad_id and o.estado = 'abierta')
  );

-- -------------------------------------------------------------
-- 3. Oportunidades de ejemplo (empresas ficticias)
-- -------------------------------------------------------------
insert into public.oportunidades (
  titulo, empresa, sector, tipo, carrera, rol, resumen, descripcion, que_haras, requisitos,
  practicas_requeridas, compensacion, modalidad, ubicacion, dedicacion, cupos, cierra,
  es_ejemplo, destacada, estado
)
select * from (values
  (
    'Dashboard de ventas en Power BI para una distribuidora',
    'Distribuidora Ruta Sur',
    'Distribución de consumo masivo',
    'proyecto_pagado',
    'erp',
    'Desarrollador ERP junior',
    'Una distribuidora sin área de sistemas necesita su primer tablero de ventas y no puede contratar a un analista.',
    'La distribuidora exporta sus ventas del ERP a Excel cada mes y el gerente arma los números a mano. Busca a alguien que limpie la base, construya un dashboard en Power BI y le explique cómo actualizarlo. Es un encargo cerrado, con una reunión de inicio y una de entrega.',
    array[
      'Limpiar la exportación del ERP: devoluciones, clientes duplicados y fechas',
      'Construir el modelo y las medidas de ventas netas en Power BI',
      'Entregar el tablero y una guía corta para actualizarlo cada mes'
    ],
    array['Disponibilidad para dos reuniones virtuales', 'Power BI Desktop instalado'],
    array(select id from public.casos where titulo in (
      'Arma un dashboard de ventas en Power BI para gerencia',
      'Las cifras no cuadran la noche antes de la reunión'
    ) and estado = 'aprobado'),
    'S/ 600 por el proyecto',
    'remoto', 'Lima', '2 semanas · unas 15 horas en total', 1, date '2026-11-20',
    true, true, 'abierta'
  ),
  (
    'Reto: encuentra fallas en el checkout antes del lanzamiento',
    'Tienda Kusi',
    'Comercio electrónico',
    'reto_con_premio',
    'software',
    'QA junior',
    'Una tienda online lanza su nueva versión y premia cada falla crítica que encuentres en el ambiente de pruebas.',
    'Antes de salir a producción, la tienda abre su ambiente de pruebas a estudiantes. Cada falla en el proceso de compra (carrito, cupones, pago de prueba o datos expuestos) que se reporte con pasos para reproducirla y se confirme recibe un premio. Solo se prueba en el ambiente indicado; nada fuera de él.',
    array[
      'Diseñar casos de prueba del proceso de compra',
      'Probar cupones, montos y validaciones del formulario de pago de prueba',
      'Reportar cada falla con pasos, resultado esperado y evidencia'
    ],
    array['Probar solo en el ambiente de pruebas autorizado', 'No usar datos reales de pago ni de clientes'],
    array(select id from public.casos where titulo = 'Prueba el proceso de compra de una tienda online' and estado = 'aprobado'),
    'S/ 300 por cada falla crítica confirmada (hasta S/ 900)',
    'remoto', null, 'Del 9 al 16 de noviembre', 3, date '2026-11-16',
    true, false, 'abierta'
  ),
  (
    'Practicante de análisis de datos en una cadena de boticas',
    'Boticas Salud Norte',
    'Retail farmacéutico',
    'practica_preprofesional',
    'datos',
    'Analista junior de datos',
    'Prácticas preprofesionales de seis meses para apoyar los reportes semanales de ventas e inventario.',
    'La cadena no tiene presupuesto para un analista junior, pero sí para un practicante que apoye al jefe comercial. Vas a preparar reportes semanales, revisar diferencias entre el sistema de ventas y el inventario, y presentar hallazgos al equipo.',
    array[
      'Preparar el reporte semanal de ventas e inventario',
      'Detectar y explicar diferencias entre fuentes de datos',
      'Presentar hallazgos al jefe comercial cada viernes'
    ],
    array['Estudiante de los últimos ciclos o egresado hace menos de un año', 'Excel intermedio'],
    array(select id from public.casos where titulo = 'Las cifras no cuadran la noche antes de la reunión' and estado = 'aprobado'),
    'Subvención mensual de ley · 6 meses',
    'hibrido', 'Lima Norte', '4 horas al día, de lunes a viernes', 1, date '2026-11-30',
    true, false, 'abierta'
  ),
  (
    'Campaña de Instagram para el lanzamiento de una panadería',
    'Panadería La Espiga',
    'Gastronomía',
    'proyecto_pagado',
    'marketing',
    'Asistente de marketing digital',
    'Una panadería de barrio abre su segundo local y necesita un plan de contenidos para el primer mes.',
    'La dueña maneja sola las redes y quiere llegar al barrio del nuevo local. Busca a alguien que proponga un calendario de publicaciones, redacte los textos y mida qué funcionó al terminar el mes.',
    array[
      'Definir a quién le habla la campaña y con qué objetivo medible',
      'Preparar el calendario de un mes con textos y formatos',
      'Entregar un reporte corto de resultados al cierre'
    ],
    array['Conocer Instagram y Meta Business Suite'],
    array(select id from public.casos where titulo = 'Prepara una campaña de Instagram para una panadería' and estado = 'aprobado'),
    'S/ 350 por el proyecto',
    'hibrido', 'San Martín de Porres', '1 mes · unas 6 horas por semana', 1, date '2026-11-25',
    true, false, 'abierta'
  ),
  (
    'Reto: corrige las piezas de una campaña hecha con IA',
    'Estudio Qori',
    'Agencia de publicidad',
    'reto_con_premio',
    'diseno',
    'Diseñador gráfico junior',
    'Una agencia generó cuarenta piezas con IA y premia al mejor set corregido según su manual de marca.',
    'La agencia produce variantes con IA en minutos, pero muchas rompen el manual de marca de su cliente. Comparte el manual y las piezas; las tres mejores revisiones reciben un premio y la primera, un encargo pagado adicional.',
    array[
      'Revisar las piezas contra el manual de marca',
      'Corregir las que se pueden salvar y justificar las que descartas',
      'Entregar el set final con una nota de criterios'
    ],
    array['Figma, Canva o Illustrator'],
    array(select id from public.casos where titulo = 'Revisa veinte banners generados con IA antes de entregarlos' and estado = 'aprobado'),
    'S/ 300 al primer lugar y S/ 100 al segundo y tercero',
    'remoto', null, 'Una semana', 3, date '2026-11-14',
    true, false, 'abierta'
  )
) as nueva (
  titulo, empresa, sector, tipo, carrera, rol, resumen, descripcion, que_haras, requisitos,
  practicas_requeridas, compensacion, modalidad, ubicacion, dedicacion, cupos, cierra,
  es_ejemplo, destacada, estado
)
where not exists (select 1 from public.oportunidades o where o.titulo = nueva.titulo);
