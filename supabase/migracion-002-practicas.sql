-- =============================================================
-- Escalón Cero — migración 002: prácticas con entrega y portafolio
-- Se ejecuta después de supabase/schema.sql
-- =============================================================

-- Campos de práctica en casos
alter table public.casos add column if not exists resumen      text check (char_length(resumen) <= 240);
alter table public.casos add column if not exists nivel        text not null default 'inicial'
  check (nivel in ('inicial', 'intermedio'));
alter table public.casos add column if not exists duracion     text check (char_length(duracion) <= 40);
alter table public.casos add column if not exists materiales   text check (char_length(materiales) <= 2000);
alter table public.casos add column if not exists habilidades  text[] not null default '{}';
alter table public.casos add column if not exists entregables  text[] not null default '{}';
alter table public.casos add column if not exists criterios    text[] not null default '{}';
alter table public.casos add column if not exists destacada    boolean not null default false;

-- Enlace opcional en la entrega del estudiante
alter table public.respuestas add column if not exists enlace text check (char_length(enlace) <= 500);

-- -------------------------------------------------------------
-- Práctica: análisis de datos (actualiza el caso de ejemplo existente)
-- -------------------------------------------------------------
update public.casos set
  carrera     = 'datos',
  resumen     = 'Las ventas del ERP y las del área comercial no coinciden, y el reporte se presenta mañana.',
  nivel       = 'inicial',
  duracion    = '20–30 min',
  materiales  = 'Exportación de ventas del ERP y la hoja de cálculo que lleva el área comercial.',
  habilidades = array[
    'Detectar y explicar diferencias entre fuentes de datos',
    'Decidir qué cifra reportar y con qué advertencias',
    'Comunicar un problema antes de que lo descubra otra persona'
  ],
  entregables = array[
    'Qué harías con la diferencia antes de entregar',
    'Qué cifra pondrías en el reporte y por qué',
    'El mensaje que enviarías esta noche y a quién'
  ],
  criterios   = array[
    'Propones una causa posible de la diferencia y cómo comprobarla',
    'La cifra elegida está justificada y la diferencia queda visible',
    'Alguien con poder de decisión se entera antes de la reunión'
  ]
where titulo = 'Las cifras no cuadran la noche antes de la reunión';

-- -------------------------------------------------------------
-- Práctica: QA en ingeniería de software (destacada)
-- -------------------------------------------------------------
insert into public.casos (
  titulo, carrera, rol, sector, resumen, nivel, duracion, contexto, encargo, complicacion, materiales,
  habilidades, entregables, criterios, lo_que_hice, que_paso, aprendizaje,
  tipo_veracidad, autor_alias, estado, destacada
)
select
  'Prueba el proceso de compra de una tienda online',
  'software',
  'QA junior',
  'Comercio electrónico',
  'Encuentras un error en el cupón de descuento dos horas antes de que la nueva versión salga a producción.',
  'inicial',
  '30–45 min',
  'Entraste hace dos semanas al equipo de una tienda online de ropa. Hoy sale una nueva versión del carrito de compras.',
  'Revisar el flujo de compra completo (agregar productos, aplicar un cupón y pagar) y reportar los errores antes del pase a producción de las 6:00 p. m.',
  'A las 4:00 p. m. descubres que el cupón de 20% se aplica dos veces si el usuario vuelve al carrito antes de pagar. El líder técnico está en una reunión y el pase ya está agendado.',
  'Casos de prueba del sprint anterior, acceso al ambiente de pruebas y la plantilla de reporte de errores del equipo.',
  array[
    'Probar un flujo de compra de punta a punta',
    'Documentar errores que otra persona pueda reproducir',
    'Comunicar un riesgo cuando queda poco tiempo'
  ],
  array[
    'Los pasos exactos para reproducir el error',
    'Qué tan grave es y por qué',
    'A quién avisarías, por qué medio y con qué mensaje',
    'Si recomiendas pasar o no a producción'
  ],
  array[
    'Cualquier persona del equipo puede reproducir el error con tus pasos',
    'La gravedad está justificada con el impacto en el negocio',
    'Quien decide el pase se entera antes de las 6:00 p. m.',
    'Tu recomendación es clara: pasar, no pasar o pasar con condiciones'
  ],
  'Documenté el error con capturas y lo dejé en el tablero como prioridad alta, pero no le escribí a nadie directamente porque no quería interrumpir la reunión.',
  'La versión salió a producción. En dos horas, cientos de pedidos usaron el doble descuento y el equipo tuvo que revertir la versión en la noche. Al día siguiente, el líder dijo que habría preferido que lo sacaran de la reunión.',
  'Un error crítico no está reportado hasta que la persona que decide lo sabe. El tablero sirve para registrar; para frenar un pase, hay que hablar directamente con quien lo aprueba.',
  'ilustrativo',
  'Equipo Escalón Cero',
  'aprobado',
  true
where not exists (select 1 from public.casos where titulo = 'Prueba el proceso de compra de una tienda online');

-- -------------------------------------------------------------
-- Práctica: marketing digital
-- -------------------------------------------------------------
insert into public.casos (
  titulo, carrera, rol, sector, resumen, nivel, duracion, contexto, encargo, complicacion, materiales,
  habilidades, entregables, criterios, lo_que_hice, que_paso, aprendizaje,
  tipo_veracidad, autor_alias, estado
)
select
  'Prepara una campaña de Instagram para una panadería',
  'marketing',
  'Asistente de marketing digital',
  'Agencia de publicidad',
  'La clienta quiere «vender más», pero no sabe cuánto vende hoy ni quién le compra.',
  'inicial',
  '30–40 min',
  'Trabajas en una agencia pequeña. Una panadería de barrio es tu primera cuenta a cargo.',
  'Proponer dos semanas de publicaciones para lanzar su nueva línea de panes integrales, con un presupuesto de S/ 300 para anuncios.',
  'En la reunión de arranque, la dueña dice que quiere «vender más», pero no sabe cuánto vende hoy ni quiénes son sus clientes.',
  'Fotografías de los productos, la cuenta de Instagram del negocio y el presupuesto aprobado.',
  array[
    'Convertir un pedido vago en un objetivo medible',
    'Elegir un público y un mensaje coherentes',
    'Relacionar el contenido con un resultado del negocio'
  ],
  array[
    'Un objetivo medible para las dos semanas',
    'El público al que apuntarías y por qué',
    'Tres ideas de publicación con su texto',
    'Cómo sabrás si la campaña funcionó'
  ],
  array[
    'El objetivo es un número del negocio, no solo de la cuenta',
    'Público y mensaje se corresponden entre sí',
    'Las publicaciones apuntan al objetivo, no solo a ganar seguidores',
    'La forma de medir el resultado se puede aplicar con lo que tiene la clienta'
  ],
  'Armé un calendario muy completo de 14 publicaciones con reels y un sorteo, y fijé como meta llegar a mil seguidores nuevos.',
  'Superamos la meta de seguidores, la mayoría gracias al sorteo, pero las ventas de pan integral no cambiaron. La dueña sintió que había pagado por algo que no le servía.',
  'Antes de crear contenido hay que traducir «vender más» en un número del negocio. Los seguidores son un medio, no el objetivo.',
  'ilustrativo',
  'Equipo Escalón Cero',
  'aprobado'
where not exists (select 1 from public.casos where titulo = 'Prepara una campaña de Instagram para una panadería');

-- -------------------------------------------------------------
-- Práctica: diseño
-- -------------------------------------------------------------
insert into public.casos (
  titulo, carrera, rol, sector, resumen, nivel, duracion, contexto, encargo, complicacion, materiales,
  habilidades, entregables, criterios, lo_que_hice, que_paso, aprendizaje,
  tipo_veracidad, autor_alias, estado
)
select
  'Revisa veinte banners generados con IA antes de entregarlos',
  'diseno',
  'Diseñador gráfico junior',
  'Agencia de diseño',
  'La IA hizo las variantes en una hora, pero algunas deforman el logo y usan un color que no es de la marca.',
  'inicial',
  '20–30 min',
  'Trabajas en una agencia que atiende la cuenta de un banco. Tu jefa te pide apoyo con una campaña.',
  'Entregar 20 variantes de un banner en distintos formatos para las 10:00 a. m. de mañana.',
  'Generaste las variantes con IA en una hora, pero en varias el logo aparece levemente deformado y dos usan un azul que no es el de la marca.',
  'Manual de marca del cliente, las 20 variantes generadas y los formatos solicitados.',
  array[
    'Verificar piezas generadas con IA contra un manual de marca',
    'Decidir qué entregar cuando no todo está bien',
    'Explicar una decisión al cliente con argumentos'
  ],
  array[
    'Qué revisarías en cada variante antes de entregar',
    'Cuántas entregarías y con qué criterio',
    'Qué le dirías al cliente sobre el uso de IA'
  ],
  array[
    'La revisión incluye logo, color, tipografía y formato',
    'La decisión de cuántas entregar está justificada',
    'El mensaje al cliente es transparente y no promete lo que no se revisó'
  ],
  'Revisé logo y color en todas las variantes contra el manual de marca, corregí ocho a mano y entregué 14 en lugar de 20, explicando por qué.',
  'El cliente aprobó 12 sin cambios. Después supe que otra agencia había perdido esa cuenta por entregar piezas con el logo deformado.',
  'Con IA, producir variantes es fácil; el trabajo junior ahora es verificar que cada pieza respete la marca. Entregar menos, pero bien, es una decisión que se puede defender.',
  'ilustrativo',
  'Equipo Escalón Cero',
  'aprobado'
where not exists (select 1 from public.casos where titulo = 'Revisa veinte banners generados con IA antes de entregarlos');
