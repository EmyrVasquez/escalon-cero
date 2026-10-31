-- Escalón Cero: datos iniciales
--
-- Los cinco proyectos (uno por ruta), las cinco oportunidades de ejemplo y
-- las respuestas correctas del proyecto de Power BI. Se corre después de
-- schema.sql. Usa los mismos id que producción, así los enlaces coinciden.
--
-- Las empresas de las oportunidades son ficticias (es_ejemplo = true) y la web
-- las marca como «Oportunidad de ejemplo».

-- ============================================================
-- Proyectos
-- ============================================================
-- Arma un dashboard de ventas en Power BI para gerencia, ruta desarrollador-erp-junior, etapa 1
insert into public.casos (id, titulo, ruta, etapa, carrera, rol, sector, resumen, nivel, duracion, herramientas, requisitos, contexto, encargo, complicacion, pregunta, materiales, habilidades, entregables, criterios, recursos, referencia, enlace_obligatorio, comprobacion, lo_que_hice, que_paso, aprendizaje, tipo_veracidad, validado_empresa, autor_alias, destacada, estado)
select
  '5ce9031f-688d-4566-bb71-c40d45dcb2d6'::uuid as id,
  'Arma un dashboard de ventas en Power BI para gerencia' as titulo,
  'desarrollador-erp-junior' as ruta,
  1 as etapa,
  'erp' as carrera,
  'Desarrollador ERP junior' as rol,
  'Consultoría de sistemas' as sector,
  'Gerencia quiere ver sus ventas en un tablero, pero los datos del ERP traen devoluciones mezcladas y clientes duplicados.' as resumen,
  'intermedio' as nivel,
  '60–90 min' as duracion,
  array[
    'Power BI Desktop',
    'Excel'
  ] as herramientas,
  array[
    'Saber cargar datos y crear visuales básicos en Power BI Desktop (o tablas dinámicas en Excel).',
    'Conocer la diferencia entre una tabla de hechos y una de dimensiones.'
  ] as requisitos,
  'Eres desarrollador ERP junior en una consultora que implementa sistemas de gestión. Uno de sus clientes, una distribuidora de productos de consumo, registra todas sus ventas en el ERP desde hace dos años.' as contexto,
  'El gerente comercial necesita un dashboard en Power BI con las ventas del último año: evolución por mes, ventas por vendedor y por zona, y los productos más vendidos. Lo presentará el lunes ante el directorio.' as encargo,
  'Al cargar los datos ves que las devoluciones aparecen como ventas con monto negativo y que varios clientes figuran con más de un código. Si sumas tal cual, las ventas por cliente no coinciden con las que reporta contabilidad.' as complicacion,
  '¿Qué harías tú?' as pregunta,
  null as materiales,
  array[
    'Limpiar datos de un ERP antes de visualizarlos',
    'Modelar ventas en Power BI con relaciones y medidas',
    'Diseñar un tablero que responda las preguntas de gerencia'
  ] as habilidades,
  array[
    'Tu dashboard: una captura, un PDF o el archivo .pbix (o el enlace si lo publicaste)',
    'Cinco cifras clave del año, que se comprueban al instante',
    'Qué le advertirías al gerente sobre la calidad de los datos'
  ] as entregables,
  array[
    'Las devoluciones y los clientes duplicados se tratan antes de calcular',
    'Cada visual responde una pregunta del encargo',
    'Las medidas de ventas netas y ticket promedio están bien definidas',
    'Los hallazgos se entienden sin abrir Power BI'
  ] as criterios,
  '[
    {
      "url": "/recursos/dashboard-ventas-power-bi/ventas_distribuidora.xlsx",
      "nombre": "ventas_distribuidora.xlsx",
      "descripcion": "Base de datos ficticia: Ventas, Clientes, Productos y Vendedores"
    },
    {
      "url": "/recursos/dashboard-ventas-power-bi/diccionario_de_datos.pdf",
      "nombre": "diccionario_de_datos.pdf",
      "descripcion": "Qué significa cada tabla y cada columna"
    },
    {
      "url": "/recursos/dashboard-ventas-power-bi/pedido_del_gerente.pdf",
      "nombre": "pedido_del_gerente.pdf",
      "descripcion": "El correo del gerente con lo que necesita ver"
    }
  ]'::jsonb as recursos,
  '{
    "url": "/recursos/dashboard-ventas-power-bi/dashboard_esperado.png",
    "nombre": "dashboard_esperado.png",
    "descripcion": "Así se ve un dashboard que responde todas las preguntas del gerente, con devoluciones restadas y clientes unificados por RUC."
  }'::jsonb as referencia,
  true as enlace_obligatorio,
  '[
    {
      "id": "ventas_netas",
      "tipo": "numero",
      "ayuda": "En soles, sin IGV, de noviembre 2025 a octubre 2026.",
      "unidad": "S/",
      "enunciado": "¿Cuánto vendió la distribuidora en el año, en ventas netas?"
    },
    {
      "id": "devoluciones",
      "tipo": "numero",
      "ayuda": "Escribe el monto en positivo.",
      "unidad": "S/",
      "enunciado": "¿Cuánto suman las devoluciones del año?"
    },
    {
      "id": "mes_mayor",
      "tipo": "opcion",
      "opciones": [
        {
          "valor": "2025-11",
          "etiqueta": "Noviembre 2025"
        },
        {
          "valor": "2025-12",
          "etiqueta": "Diciembre 2025"
        },
        {
          "valor": "2026-01",
          "etiqueta": "Enero 2026"
        },
        {
          "valor": "2026-02",
          "etiqueta": "Febrero 2026"
        },
        {
          "valor": "2026-03",
          "etiqueta": "Marzo 2026"
        },
        {
          "valor": "2026-04",
          "etiqueta": "Abril 2026"
        },
        {
          "valor": "2026-05",
          "etiqueta": "Mayo 2026"
        },
        {
          "valor": "2026-06",
          "etiqueta": "Junio 2026"
        },
        {
          "valor": "2026-07",
          "etiqueta": "Julio 2026"
        },
        {
          "valor": "2026-08",
          "etiqueta": "Agosto 2026"
        },
        {
          "valor": "2026-09",
          "etiqueta": "Septiembre 2026"
        },
        {
          "valor": "2026-10",
          "etiqueta": "Octubre 2026"
        }
      ],
      "enunciado": "¿En qué mes se vendió más?"
    },
    {
      "id": "cliente_top",
      "tipo": "opcion",
      "opciones": [
        {
          "valor": "bodega-san-martin",
          "etiqueta": "Bodega San Martín"
        },
        {
          "valor": "distribuidora-los-olivos",
          "etiqueta": "Distribuidora Los Olivos"
        },
        {
          "valor": "restaurante-dona-rosa",
          "etiqueta": "Restaurante Doña Rosa"
        },
        {
          "valor": "restaurante-el-sol",
          "etiqueta": "Restaurante El Sol"
        },
        {
          "valor": "restaurante-la-esperanza",
          "etiqueta": "Restaurante La Esperanza"
        }
      ],
      "enunciado": "¿Qué cliente compró más en el año?"
    },
    {
      "id": "clientes_reales",
      "tipo": "numero",
      "ayuda": "Un número entero.",
      "enunciado": "¿Cuántos clientes distintos tiene realmente la distribuidora?"
    }
  ]'::jsonb as comprobacion,
  'Armé el dashboard con los datos tal como venían del ERP para llegar a tiempo. Las devoluciones quedaron mezcladas con las ventas y cada código de cliente se mostró como un cliente distinto.' as lo_que_hice,
  'En el directorio, el gerente de finanzas notó que el ranking de clientes no coincidía con el de contabilidad: el cliente más grande aparecía partido en tres. La presentación se detuvo en esa diapositiva y hubo que rehacer el tablero el fin de semana.' as que_paso,
  'Antes de visualizar hay que revisar y conciliar los datos del ERP con quien los usa todos los días. Un tablero vistoso con datos sin limpiar quita más confianza que no tener tablero.' as aprendizaje,
  'ilustrativo' as tipo_veracidad,
  false as validado_empresa,
  'Equipo Escalón Cero' as autor_alias,
  true as destacada,
  'aprobado' as estado
on conflict (id) do nothing;

-- Las cifras no cuadran la noche antes de la reunión, ruta analista-junior-de-datos, etapa 1
insert into public.casos (id, titulo, ruta, etapa, carrera, rol, sector, resumen, nivel, duracion, herramientas, requisitos, contexto, encargo, complicacion, pregunta, materiales, habilidades, entregables, criterios, recursos, referencia, enlace_obligatorio, comprobacion, lo_que_hice, que_paso, aprendizaje, tipo_veracidad, validado_empresa, autor_alias, destacada, estado)
select
  '7011eae7-706e-4a69-abcc-12911a45e89b'::uuid as id,
  'Las cifras no cuadran la noche antes de la reunión' as titulo,
  'analista-junior-de-datos' as ruta,
  1 as etapa,
  'datos' as carrera,
  'Analista junior de datos' as rol,
  'Retail' as sector,
  'Las ventas del ERP y las del área comercial no coinciden, y el reporte se presenta mañana.' as resumen,
  'inicial' as nivel,
  '20–30 min' as duracion,
  array[
    'Excel'
  ] as herramientas,
  '{}' as requisitos,
  'Llevas tres meses en el área de datos de una empresa de retail. Tu jefa confía en ti para los reportes semanales.' as contexto,
  'Preparar el reporte de ventas del mes para la reunión de gerencia de mañana a las 9:00 a. m.' as encargo,
  'Al cruzar los datos del ERP con la hoja que lleva el área comercial, las ventas no coinciden: hay una diferencia de casi 8%. Son las 9:00 p. m. y tu jefa no responde.' as complicacion,
  '¿Qué harías tú?' as pregunta,
  'Exportación de ventas del ERP y la hoja de cálculo que lleva el área comercial.' as materiales,
  array[
    'Detectar y explicar diferencias entre fuentes de datos',
    'Decidir qué cifra reportar y con qué advertencias',
    'Comunicar un problema antes de que lo descubra otra persona'
  ] as habilidades,
  array[
    'Qué harías con la diferencia antes de entregar',
    'Qué cifra pondrías en el reporte y por qué',
    'El mensaje que enviarías esta noche y a quién'
  ] as entregables,
  array[
    'Propones una causa posible de la diferencia y cómo comprobarla',
    'La cifra elegida está justificada y la diferencia queda visible',
    'Alguien con poder de decisión se entera antes de la reunión'
  ] as criterios,
  '[]'::jsonb as recursos,
  null as referencia,
  false as enlace_obligatorio,
  null as comprobacion,
  'Entregué el reporte con la cifra del ERP, porque es el sistema oficial, sin mencionar la diferencia.' as lo_que_hice,
  'En la reunión, el gerente comercial objetó la cifra delante de todos. La diferencia venía de devoluciones que el ERP registraba con días de retraso. Mi jefa tuvo que explicar algo que no sabía.' as que_paso,
  'Avisar de una discrepancia antes de entregar, aunque retrase la entrega. Un reporte con una nota de «hay una diferencia y esta es su posible causa» vale más que un número limpio que alguien desmiente en público.' as aprendizaje,
  'ilustrativo' as tipo_veracidad,
  false as validado_empresa,
  'Equipo Escalón Cero' as autor_alias,
  false as destacada,
  'aprobado' as estado
on conflict (id) do nothing;

-- Prepara una campaña de Instagram para una panadería, ruta asistente-de-marketing-digital, etapa 1
insert into public.casos (id, titulo, ruta, etapa, carrera, rol, sector, resumen, nivel, duracion, herramientas, requisitos, contexto, encargo, complicacion, pregunta, materiales, habilidades, entregables, criterios, recursos, referencia, enlace_obligatorio, comprobacion, lo_que_hice, que_paso, aprendizaje, tipo_veracidad, validado_empresa, autor_alias, destacada, estado)
select
  '671db227-eb41-4935-be62-3eff0c36bab5'::uuid as id,
  'Prepara una campaña de Instagram para una panadería' as titulo,
  'asistente-de-marketing-digital' as ruta,
  1 as etapa,
  'marketing' as carrera,
  'Asistente de marketing digital' as rol,
  'Agencia de publicidad' as sector,
  'La clienta quiere «vender más», pero no sabe cuánto vende hoy ni quién le compra.' as resumen,
  'inicial' as nivel,
  '30–40 min' as duracion,
  array[
    'Instagram'
  ] as herramientas,
  '{}' as requisitos,
  'Trabajas en una agencia pequeña. Una panadería de barrio es tu primera cuenta a cargo.' as contexto,
  'Proponer dos semanas de publicaciones para lanzar su nueva línea de panes integrales, con un presupuesto de S/ 300 para anuncios.' as encargo,
  'En la reunión de arranque, la dueña dice que quiere «vender más», pero no sabe cuánto vende hoy ni quiénes son sus clientes.' as complicacion,
  '¿Qué harías tú?' as pregunta,
  'Fotografías de los productos, la cuenta de Instagram del negocio y el presupuesto aprobado.' as materiales,
  array[
    'Convertir un pedido vago en un objetivo medible',
    'Elegir un público y un mensaje coherentes',
    'Relacionar el contenido con un resultado del negocio'
  ] as habilidades,
  array[
    'Un objetivo medible para las dos semanas',
    'El público al que apuntarías y por qué',
    'Tres ideas de publicación con su texto',
    'Cómo sabrás si la campaña funcionó'
  ] as entregables,
  array[
    'El objetivo es un número del negocio, no solo de la cuenta',
    'Público y mensaje se corresponden entre sí',
    'Las publicaciones apuntan al objetivo, no solo a ganar seguidores',
    'La forma de medir el resultado se puede aplicar con lo que tiene la clienta'
  ] as criterios,
  '[]'::jsonb as recursos,
  null as referencia,
  false as enlace_obligatorio,
  null as comprobacion,
  'Armé un calendario muy completo de 14 publicaciones con reels y un sorteo, y fijé como meta llegar a mil seguidores nuevos.' as lo_que_hice,
  'Superamos la meta de seguidores, la mayoría gracias al sorteo, pero las ventas de pan integral no cambiaron. La dueña sintió que había pagado por algo que no le servía.' as que_paso,
  'Antes de crear contenido hay que traducir «vender más» en un número del negocio. Los seguidores son un medio, no el objetivo.' as aprendizaje,
  'ilustrativo' as tipo_veracidad,
  false as validado_empresa,
  'Equipo Escalón Cero' as autor_alias,
  false as destacada,
  'aprobado' as estado
on conflict (id) do nothing;

-- Revisa veinte banners generados con IA antes de entregarlos, ruta disenador-grafico-junior, etapa 1
insert into public.casos (id, titulo, ruta, etapa, carrera, rol, sector, resumen, nivel, duracion, herramientas, requisitos, contexto, encargo, complicacion, pregunta, materiales, habilidades, entregables, criterios, recursos, referencia, enlace_obligatorio, comprobacion, lo_que_hice, que_paso, aprendizaje, tipo_veracidad, validado_empresa, autor_alias, destacada, estado)
select
  '60a15f25-35a4-4385-890d-4a5030765bbe'::uuid as id,
  'Revisa veinte banners generados con IA antes de entregarlos' as titulo,
  'disenador-grafico-junior' as ruta,
  1 as etapa,
  'diseno' as carrera,
  'Diseñador gráfico junior' as rol,
  'Agencia de diseño' as sector,
  'La IA hizo las variantes en una hora, pero algunas deforman el logo y usan un color que no es de la marca.' as resumen,
  'inicial' as nivel,
  '20–30 min' as duracion,
  array[
    'IA generativa'
  ] as herramientas,
  '{}' as requisitos,
  'Trabajas en una agencia que atiende la cuenta de un banco. Tu jefa te pide apoyo con una campaña.' as contexto,
  'Entregar 20 variantes de un banner en distintos formatos para las 10:00 a. m. de mañana.' as encargo,
  'Generaste las variantes con IA en una hora, pero en varias el logo aparece levemente deformado y dos usan un azul que no es el de la marca.' as complicacion,
  '¿Qué harías tú?' as pregunta,
  'Manual de marca del cliente, las 20 variantes generadas y los formatos solicitados.' as materiales,
  array[
    'Verificar piezas generadas con IA contra un manual de marca',
    'Decidir qué entregar cuando no todo está bien',
    'Explicar una decisión al cliente con argumentos'
  ] as habilidades,
  array[
    'Qué revisarías en cada variante antes de entregar',
    'Cuántas entregarías y con qué criterio',
    'Qué le dirías al cliente sobre el uso de IA'
  ] as entregables,
  array[
    'La revisión incluye logo, color, tipografía y formato',
    'La decisión de cuántas entregar está justificada',
    'El mensaje al cliente es transparente y no promete lo que no se revisó'
  ] as criterios,
  '[]'::jsonb as recursos,
  null as referencia,
  false as enlace_obligatorio,
  null as comprobacion,
  'Revisé logo y color en todas las variantes contra el manual de marca, corregí ocho a mano y entregué 14 en lugar de 20, explicando por qué.' as lo_que_hice,
  'El cliente aprobó 12 sin cambios. Después supe que otra agencia había perdido esa cuenta por entregar piezas con el logo deformado.' as que_paso,
  'Con IA, producir variantes es fácil; el trabajo junior ahora es verificar que cada pieza respete la marca. Entregar menos, pero bien, es una decisión que se puede defender.' as aprendizaje,
  'ilustrativo' as tipo_veracidad,
  false as validado_empresa,
  'Equipo Escalón Cero' as autor_alias,
  false as destacada,
  'aprobado' as estado
on conflict (id) do nothing;

-- Prueba el proceso de compra de una tienda online, ruta qa-junior, etapa 1
insert into public.casos (id, titulo, ruta, etapa, carrera, rol, sector, resumen, nivel, duracion, herramientas, requisitos, contexto, encargo, complicacion, pregunta, materiales, habilidades, entregables, criterios, recursos, referencia, enlace_obligatorio, comprobacion, lo_que_hice, que_paso, aprendizaje, tipo_veracidad, validado_empresa, autor_alias, destacada, estado)
select
  'b27bbbe5-1d44-4027-bf07-16c3300cb44d'::uuid as id,
  'Prueba el proceso de compra de una tienda online' as titulo,
  'qa-junior' as ruta,
  1 as etapa,
  'software' as carrera,
  'QA junior' as rol,
  'Comercio electrónico' as sector,
  'Encuentras un error en el cupón de descuento dos horas antes de que la nueva versión salga a producción.' as resumen,
  'inicial' as nivel,
  '30–45 min' as duracion,
  array[
    'Ambiente de pruebas'
  ] as herramientas,
  '{}' as requisitos,
  'Entraste hace dos semanas al equipo de una tienda online de ropa. Hoy sale una nueva versión del carrito de compras.' as contexto,
  'Revisar el flujo de compra completo (agregar productos, aplicar un cupón y pagar) y reportar los errores antes del pase a producción de las 6:00 p. m.' as encargo,
  'A las 4:00 p. m. descubres que el cupón de 20% se aplica dos veces si el usuario vuelve al carrito antes de pagar. El líder técnico está en una reunión y el pase ya está agendado.' as complicacion,
  '¿Qué harías tú?' as pregunta,
  'Casos de prueba del sprint anterior, acceso al ambiente de pruebas y la plantilla de reporte de errores del equipo.' as materiales,
  array[
    'Probar un flujo de compra de punta a punta',
    'Documentar errores que otra persona pueda reproducir',
    'Comunicar un riesgo cuando queda poco tiempo'
  ] as habilidades,
  array[
    'Los pasos exactos para reproducir el error',
    'Qué tan grave es y por qué',
    'A quién avisarías, por qué medio y con qué mensaje',
    'Si recomiendas pasar o no a producción'
  ] as entregables,
  array[
    'Cualquier persona del equipo puede reproducir el error con tus pasos',
    'La gravedad está justificada con el impacto en el negocio',
    'Quien decide el pase se entera antes de las 6:00 p. m.',
    'Tu recomendación es clara: pasar, no pasar o pasar con condiciones'
  ] as criterios,
  '[]'::jsonb as recursos,
  null as referencia,
  false as enlace_obligatorio,
  null as comprobacion,
  'Documenté el error con capturas y lo dejé en el tablero como prioridad alta, pero no le escribí a nadie directamente porque no quería interrumpir la reunión.' as lo_que_hice,
  'La versión salió a producción. En dos horas, cientos de pedidos usaron el doble descuento y el equipo tuvo que revertir la versión en la noche. Al día siguiente, el líder dijo que habría preferido que lo sacaran de la reunión.' as que_paso,
  'Un error crítico no está reportado hasta que la persona que decide lo sabe. El tablero sirve para registrar; para frenar un pase, hay que hablar directamente con quien lo aprueba.' as aprendizaje,
  'ilustrativo' as tipo_veracidad,
  false as validado_empresa,
  'Equipo Escalón Cero' as autor_alias,
  false as destacada,
  'aprobado' as estado
on conflict (id) do nothing;

-- ============================================================
-- Oportunidades de ejemplo
-- ============================================================
-- Distribuidora Ruta Sur, experiencia_empresa
insert into public.oportunidades (id, titulo, empresa, sector, tipo, carrera, rol, ruta, etapa_requerida, resumen, descripcion, que_haras, requisitos, compensacion, modalidad, ubicacion, dedicacion, cupos, cierra, es_ejemplo, destacada, estado)
select
  '5445520e-1e7e-407f-8c8b-e4af554d98d7'::uuid as id,
  'Dashboard de ventas en Power BI para una distribuidora' as titulo,
  'Distribuidora Ruta Sur' as empresa,
  'Distribución de consumo masivo' as sector,
  'experiencia_empresa' as tipo,
  'erp' as carrera,
  'Desarrollador ERP junior' as rol,
  'desarrollador-erp-junior' as ruta,
  1 as etapa_requerida,
  'Una distribuidora sin área de sistemas necesita su primer tablero de ventas y no puede contratar a un analista.' as resumen,
  'La distribuidora exporta sus ventas del ERP a Excel cada mes y el gerente arma los números a mano. Busca a alguien que limpie la base, construya un dashboard en Power BI y le explique cómo actualizarlo. Es un encargo cerrado, sin pago, con una reunión de inicio y una de entrega; a cambio, la empresa firma una constancia del trabajo y una carta de recomendación.' as descripcion,
  array[
    'Limpiar la exportación del ERP: devoluciones, clientes duplicados y fechas',
    'Construir el modelo y las medidas de ventas netas en Power BI',
    'Entregar el tablero y una guía corta para actualizarlo cada mes'
  ] as que_haras,
  array[
    'Disponibilidad para dos reuniones virtuales',
    'Power BI Desktop instalado'
  ] as requisitos,
  'Constancia de la empresa, carta de recomendación y un caso real para tu portafolio' as compensacion,
  'remoto' as modalidad,
  'Lima' as ubicacion,
  '2 semanas, unas 15 horas en total' as dedicacion,
  1 as cupos,
  date '2026-11-20' as cierra,
  true as es_ejemplo,
  true as destacada,
  'abierta' as estado
on conflict (id) do nothing;

-- Panadería La Espiga, experiencia_empresa
insert into public.oportunidades (id, titulo, empresa, sector, tipo, carrera, rol, ruta, etapa_requerida, resumen, descripcion, que_haras, requisitos, compensacion, modalidad, ubicacion, dedicacion, cupos, cierra, es_ejemplo, destacada, estado)
select
  'e2904ed0-4f45-4820-99b0-0bef32163912'::uuid as id,
  'Campaña de Instagram para el lanzamiento de una panadería' as titulo,
  'Panadería La Espiga' as empresa,
  'Gastronomía' as sector,
  'experiencia_empresa' as tipo,
  'marketing' as carrera,
  'Asistente de marketing digital' as rol,
  'asistente-de-marketing-digital' as ruta,
  1 as etapa_requerida,
  'Una panadería de barrio abre su segundo local y necesita un plan de contenidos para el primer mes.' as resumen,
  'La dueña maneja sola las redes y quiere llegar al barrio del nuevo local. Busca a alguien que proponga un calendario de publicaciones, redacte los textos y mida qué funcionó al terminar el mes.' as descripcion,
  array[
    'Definir a quién le habla la campaña y con qué objetivo medible',
    'Preparar el calendario de un mes con textos y formatos',
    'Entregar un reporte corto de resultados al cierre'
  ] as que_haras,
  array[
    'Conocer Instagram y Meta Business Suite'
  ] as requisitos,
  'Constancia de la empresa, carta de recomendación y los resultados de la campaña para tu portafolio' as compensacion,
  'hibrido' as modalidad,
  'San Martín de Porres' as ubicacion,
  '1 mes, unas 6 horas por semana' as dedicacion,
  1 as cupos,
  date '2026-11-25' as cierra,
  true as es_ejemplo,
  false as destacada,
  'abierta' as estado
on conflict (id) do nothing;

-- Boticas Salud Norte, experiencia_empresa
insert into public.oportunidades (id, titulo, empresa, sector, tipo, carrera, rol, ruta, etapa_requerida, resumen, descripcion, que_haras, requisitos, compensacion, modalidad, ubicacion, dedicacion, cupos, cierra, es_ejemplo, destacada, estado)
select
  '5f01e08d-4844-47bc-82a2-746ad0a83c08'::uuid as id,
  'Encuentra por qué no cuadran las ventas y el inventario de una cadena de boticas' as titulo,
  'Boticas Salud Norte' as empresa,
  'Retail farmacéutico' as sector,
  'experiencia_empresa' as tipo,
  'datos' as carrera,
  'Analista junior de datos' as rol,
  'analista-junior-de-datos' as ruta,
  1 as etapa_requerida,
  'Una cadena de boticas necesita explicar las diferencias entre su sistema de ventas y su inventario antes del cierre de mes.' as resumen,
  'Cada mes, las ventas del sistema y el inventario de los almacenes no coinciden y nadie sabe por qué. La cadena no tiene analista: busca a alguien que revise tres meses de datos, encuentre las causas más probables y las presente al jefe comercial. Es un encargo sin pago; a cambio, la empresa firma una constancia y una carta de recomendación.' as descripcion,
  array[
    'Cruzar las ventas del sistema con los movimientos de inventario',
    'Clasificar las diferencias y proponer su causa más probable',
    'Presentar los hallazgos al jefe comercial en una reunión virtual'
  ] as que_haras,
  array[
    'Excel intermedio',
    'Disponibilidad para una reunión de presentación'
  ] as requisitos,
  'Constancia de la empresa, carta de recomendación y un caso real para tu portafolio' as compensacion,
  'remoto' as modalidad,
  null as ubicacion,
  '3 semanas, unas 8 horas por semana' as dedicacion,
  2 as cupos,
  date '2026-11-30' as cierra,
  true as es_ejemplo,
  false as destacada,
  'abierta' as estado
on conflict (id) do nothing;

-- Estudio Qori, reto_con_premio
insert into public.oportunidades (id, titulo, empresa, sector, tipo, carrera, rol, ruta, etapa_requerida, resumen, descripcion, que_haras, requisitos, compensacion, modalidad, ubicacion, dedicacion, cupos, cierra, es_ejemplo, destacada, estado)
select
  '0278faef-1820-414f-a0d9-dfff1dbb1a6c'::uuid as id,
  'Reto: corrige las piezas de una campaña hecha con IA' as titulo,
  'Estudio Qori' as empresa,
  'Agencia de publicidad' as sector,
  'reto_con_premio' as tipo,
  'diseno' as carrera,
  'Diseñador gráfico junior' as rol,
  'disenador-grafico-junior' as ruta,
  1 as etapa_requerida,
  'Una agencia generó cuarenta piezas con IA y premia al mejor set corregido según su manual de marca.' as resumen,
  'La agencia produce variantes con IA en minutos, pero muchas rompen el manual de marca de su cliente. Comparte el manual y las piezas; las tres mejores revisiones reciben un premio y la primera, un encargo pagado adicional.' as descripcion,
  array[
    'Revisar las piezas contra el manual de marca',
    'Corregir las que se pueden salvar y justificar las que descartas',
    'Entregar el set final con una nota de criterios'
  ] as que_haras,
  array[
    'Figma, Canva o Illustrator'
  ] as requisitos,
  'S/ 300 al primer lugar y S/ 100 al segundo y tercero' as compensacion,
  'remoto' as modalidad,
  null as ubicacion,
  'Una semana' as dedicacion,
  3 as cupos,
  date '2026-11-14' as cierra,
  true as es_ejemplo,
  false as destacada,
  'abierta' as estado
on conflict (id) do nothing;

-- Tienda Kusi, reto_con_premio
insert into public.oportunidades (id, titulo, empresa, sector, tipo, carrera, rol, ruta, etapa_requerida, resumen, descripcion, que_haras, requisitos, compensacion, modalidad, ubicacion, dedicacion, cupos, cierra, es_ejemplo, destacada, estado)
select
  '8dfed716-18fa-495c-a9e7-14688ed4aac0'::uuid as id,
  'Reto: encuentra fallas en el checkout antes del lanzamiento' as titulo,
  'Tienda Kusi' as empresa,
  'Comercio electrónico' as sector,
  'reto_con_premio' as tipo,
  'software' as carrera,
  'QA junior' as rol,
  'qa-junior' as ruta,
  1 as etapa_requerida,
  'Una tienda online lanza su nueva versión y premia cada falla crítica que encuentres en el ambiente de pruebas.' as resumen,
  'Antes de salir a producción, la tienda abre su ambiente de pruebas a estudiantes. Cada falla en el proceso de compra (carrito, cupones, pago de prueba o datos expuestos) que se reporte con pasos para reproducirla y se confirme recibe un premio. Solo se prueba en el ambiente indicado; nada fuera de él.' as descripcion,
  array[
    'Diseñar casos de prueba del proceso de compra',
    'Probar cupones, montos y validaciones del formulario de pago de prueba',
    'Reportar cada falla con pasos, resultado esperado y evidencia'
  ] as que_haras,
  array[
    'Probar solo en el ambiente de pruebas autorizado',
    'No usar datos reales de pago ni de clientes'
  ] as requisitos,
  'S/ 300 por cada falla crítica confirmada (hasta S/ 900)' as compensacion,
  'remoto' as modalidad,
  null as ubicacion,
  'Del 9 al 16 de noviembre' as dedicacion,
  3 as cupos,
  date '2026-11-16' as cierra,
  true as es_ejemplo,
  false as destacada,
  'abierta' as estado
on conflict (id) do nothing;

-- ============================================================
-- Respuestas correctas del proyecto de Power BI
-- Calculadas con public/recursos/dashboard-ventas-power-bi/ventas_distribuidora.xlsx
-- ============================================================
insert into public.claves_comprobacion (
  caso_id, pregunta_id, orden, esperado_numero, tolerancia, esperado_texto, esperado_mostrar, explicacion, pista, trampa_numero, trampa_texto, pista_trampa
)
select '5ce9031f-688d-4566-bb71-c40d45dcb2d6'::uuid, v.*
from (values
  (
    'ventas_netas',
    1,
    2329351.9,
    0.005,
    null,
    'S/ 2 329 351,90',
    'Es la suma de «importe» de todas las filas: facturas y boletas (S/ 2 408 533,79) menos las notas de crédito (S/ 79 181,89).',
    'Suma la columna «importe» de la hoja Ventas para todo el año. Revisa que no estés filtrando algún tipo de documento.',
    2408533.79,
    null,
    'Ese es el total sin restar las devoluciones. Las notas de crédito (importe negativo) también forman parte de las ventas netas.'
  ),
  (
    'devoluciones',
    2,
    79181.89,
    0.005,
    null,
    'S/ 79 181,89',
    'Son las 522 notas de crédito del año. En el ERP aparecen como ventas con importe negativo, por eso hay que separarlas.',
    'Filtra tipo_documento = «Nota de crédito» y suma su importe.',
    null,
    null,
    null
  ),
  (
    'mes_mayor',
    3,
    null,
    0,
    '2025-12',
    'Diciembre 2025 (S/ 352 904,65)',
    'Diciembre casi duplica a febrero, el mes más bajo (S/ 135 451,19): la campaña navideña explica el pico.',
    'Agrupa las ventas netas por mes de la columna «fecha» y compáralas.',
    null,
    null,
    null
  ),
  (
    'cliente_top',
    4,
    null,
    0,
    'restaurante-el-sol',
    'Restaurante El Sol (S/ 257 654,15)',
    'El Sol está registrado con tres códigos (C1006, C1007 y C1008) que comparten el mismo RUC. Unificado por RUC, supera a Doña Rosa (S/ 244 058,31).',
    'Relaciona Ventas con Clientes y agrupa por cliente. Revisa si un mismo cliente aparece con varios códigos.',
    null,
    'restaurante-dona-rosa',
    'Doña Rosa es el código que más compra, pero no el cliente. Hay clientes registrados con varios códigos: agrúpalos por RUC.'
  ),
  (
    'clientes_reales',
    5,
    55,
    0,
    null,
    '55 clientes',
    'La hoja Clientes tiene 63 códigos, pero solo 55 RUC distintos: 6 clientes están duplicados en el ERP.',
    'Cuenta los clientes distintos de la hoja Clientes. ¿Qué columna identifica de verdad a un cliente?',
    63,
    null,
    '63 son códigos de cliente, no clientes. Varios códigos comparten el mismo RUC: cuenta los RUC distintos.'
  )
) as v (pregunta_id, orden, esperado_numero, tolerancia, esperado_texto, esperado_mostrar, explicacion, pista, trampa_numero, trampa_texto, pista_trampa)
on conflict (caso_id, pregunta_id) do nothing;
