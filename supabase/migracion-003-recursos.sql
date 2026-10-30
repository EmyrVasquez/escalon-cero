-- =============================================================
-- Escalón Cero — migración 003: herramientas, recursos y entregas con archivo
-- Correr DESPUÉS de schema.sql y migracion-002-practicas.sql.
-- Supabase → SQL Editor → New query → pegar todo → Run
-- =============================================================

-- 1. Nuevas columnas de una práctica
alter table public.casos add column if not exists herramientas       text[]  not null default '{}';
alter table public.casos add column if not exists requisitos         text[]  not null default '{}';
-- Archivos para descargar: [{"nombre": "...", "descripcion": "...", "url": "/recursos/..."}]
alter table public.casos add column if not exists recursos           jsonb   not null default '[]'::jsonb;
-- Solución de referencia que se desbloquea junto con el desenlace: {"nombre": "...", "url": "..."} o null
alter table public.casos add column if not exists referencia         jsonb;
-- true cuando la entrega principal es un archivo o un enlace (dashboard, diseño, repositorio)
alter table public.casos add column if not exists enlace_obligatorio boolean not null default false;

-- 2. Herramientas de las prácticas que ya existen
update public.casos set herramientas = array['Ambiente de pruebas']
  where titulo = 'Prueba el proceso de compra de una tienda online';
update public.casos set herramientas = array['Excel']
  where titulo = 'Las cifras no cuadran la noche antes de la reunión';
update public.casos set herramientas = array['Instagram']
  where titulo = 'Prepara una campaña de Instagram para una panadería';
update public.casos set herramientas = array['IA generativa']
  where titulo = 'Revisa veinte banners generados con IA antes de entregarlos';

-- 3. Práctica nueva: dashboard de ventas en Power BI (área erp)
--    Los archivos viven en public/recursos/dashboard-ventas-power-bi/ y son ficticios.
insert into public.casos (
  titulo, carrera, rol, sector, resumen, nivel, duracion, contexto, encargo, complicacion, materiales,
  habilidades, entregables, criterios, herramientas, requisitos, recursos, enlace_obligatorio,
  lo_que_hice, que_paso, aprendizaje, tipo_veracidad, autor_alias, estado, destacada
)
select
  'Arma un dashboard de ventas en Power BI para gerencia',
  'erp',
  'Desarrollador ERP junior',
  'Consultoría de sistemas',
  'Gerencia quiere ver sus ventas en un tablero, pero los datos del ERP traen devoluciones mezcladas y clientes duplicados.',
  'intermedio',
  '60–90 min',
  'Eres desarrollador ERP junior en una consultora que implementa sistemas de gestión. Uno de sus clientes, una distribuidora de productos de consumo, registra todas sus ventas en el ERP desde hace dos años.',
  'El gerente comercial necesita un dashboard en Power BI con las ventas del último año: evolución por mes, ventas por vendedor y por zona, y los productos más vendidos. Lo presentará el lunes ante el directorio.',
  'Al cargar los datos ves que las devoluciones aparecen como ventas con monto negativo y que varios clientes figuran con más de un código. Si sumas tal cual, las ventas por cliente no coinciden con las que reporta contabilidad.',
  null,
  array[
    'Limpiar datos de un ERP antes de visualizarlos',
    'Modelar ventas en Power BI con relaciones y medidas',
    'Diseñar un tablero que responda las preguntas de gerencia'
  ],
  array[
    'El enlace a tu dashboard publicado o a tu archivo .pbix',
    'Qué transformaciones hiciste a los datos y por qué',
    'Tres hallazgos que le contarías al gerente',
    'Qué le advertirías sobre la calidad de los datos'
  ],
  array[
    'Las devoluciones y los clientes duplicados se tratan antes de calcular',
    'Cada visual responde una pregunta del encargo',
    'Las medidas de ventas netas y ticket promedio están bien definidas',
    'Los hallazgos se entienden sin abrir Power BI'
  ],
  array['Power BI Desktop', 'Excel'],
  array[
    'Saber cargar datos y crear visuales básicos en Power BI Desktop.',
    'Conocer la diferencia entre una tabla de hechos y una de dimensiones.'
  ],
  '[
    {"nombre": "ventas_distribuidora.xlsx", "descripcion": "Base de datos ficticia: Ventas, Clientes, Productos y Vendedores", "url": "/recursos/dashboard-ventas-power-bi/ventas_distribuidora.xlsx"},
    {"nombre": "diccionario_de_datos.pdf", "descripcion": "Qué significa cada tabla y cada columna", "url": "/recursos/dashboard-ventas-power-bi/diccionario_de_datos.pdf"},
    {"nombre": "pedido_del_gerente.pdf", "descripcion": "El correo del gerente con lo que necesita ver", "url": "/recursos/dashboard-ventas-power-bi/pedido_del_gerente.pdf"}
  ]'::jsonb,
  true,
  'Armé el dashboard con los datos tal como venían del ERP para llegar a tiempo. Las devoluciones quedaron mezcladas con las ventas y cada código de cliente se mostró como un cliente distinto.',
  'En el directorio, el gerente de finanzas notó que el ranking de clientes no coincidía con el de contabilidad: el cliente más grande aparecía partido en tres. La presentación se detuvo en esa diapositiva y hubo que rehacer el tablero el fin de semana.',
  'Antes de visualizar hay que revisar y conciliar los datos del ERP con quien los usa todos los días. Un tablero vistoso con datos sin limpiar quita más confianza que no tener tablero.',
  'ilustrativo',
  'Equipo Escalón Cero',
  'aprobado',
  true
where not exists (select 1 from public.casos where titulo = 'Arma un dashboard de ventas en Power BI para gerencia');

-- 4. La práctica destacada de la portada pasa a ser la de Power BI
update public.casos
  set destacada = (titulo = 'Arma un dashboard de ventas en Power BI para gerencia')
  where id is not null;
