<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## Escalón Cero — contexto y reglas del proyecto

### Qué es
Marketplace de primera experiencia para estudiantes de últimos ciclos y recién egresados (vista del estudiante).

### Vocabulario (usarlo igual en toda la interfaz)
- **Ruta**: el mapa de un rol junior (Desarrollador ERP junior, QA junior…), en 3 etapas. Cada etapa dice qué aprender
  (temas y recursos gratuitos) y con qué proyectos se demuestra. Contenido en `src/lib/rutas.ts`.
- **Proyecto**: encargo simulado de un puesto junior, con desenlace real (tabla `casos`). Pertenece a una etapa de una ruta
  (`casos.ruta`, `casos.etapa`). En el código se llama `Practica` por historia; en la interfaz siempre es «proyecto».
- **Oportunidad**: encargo de una empresa real. Tipos: `experiencia_empresa` (sin pago: constancia, recomendación y caso para
  el portafolio; es la mayoría) y `reto_con_premio` (pago por resultado, estilo bug bounty).
- **Requisito**: una oportunidad pide completar la ruta de su rol hasta una etapa (`oportunidades.ruta`, `etapa_requerida`):
  todos los proyectos de esa ruta desde la etapa 1 hasta esa. Así solo postula quien siguió la línea del rol.
  La regla vive en `src/lib/requisitos.ts` y en la base (`cumple_requisitos`); deben coincidir.
- No usar «práctica» en la interfaz: se confunde con prácticas preprofesionales.

Las oportunidades las consigue y publica el equipo de Escalón Cero; no hay vista de empresa en el MVP.
Proyecto para DSC HACK 2026 (reto «Educación 2036», grieta 01: la escalera rota del primer empleo).

### Cuentas
- Supabase Auth con correo y contraseña (`src/components/FormularioIngreso.tsx`, página `/ingresar`). En la demo, «Confirm email» está desactivado.
- `src/lib/sesion.tsx` (`ProveedorSesion`, `useSesion`) carga y guarda el progreso de la persona: `entregas` (portafolio), `borradores` y `postulaciones`, todas con RLS por `auth.uid()`.
- Sin sesión se puede navegar todo; para entregar un proyecto, ver el portafolio o postular se pide ingresar (`AvisoSesion`).
- El progreso que quedó en el navegador antes de las cuentas se importa a la cuenta al ingresar por primera vez.

### Flujo de un proyecto (no romperlo)
1. **Explora**: el proyecto muestra contexto, encargo, complicación, materiales, requisitos, recursos para descargar, entregables y habilidades.
2. **Entrega**: con sesión, el estudiante escribe su solución y un enlace (obligatorio si `enlace_obligatorio`). Se guarda en `entregas` (su cuenta) y, anónima, en `respuestas`.
3. **Descubre**: solo después de entregar se muestran `lo_que_hice`, `que_paso`, `aprendizaje` (sobre fondo lima) y la `referencia` descargable.
4. **Muestra**: la entrega queda en su portafolio, con la autoevaluación según `criterios`, y cuenta para su ruta.

Nunca mostrar el desenlace antes de la entrega.

### Flujo de una oportunidad
1. `/oportunidades/[id]` muestra el encargo, lo que se obtiene, y el requisito: la ruta hasta la etapa pedida, con cada proyecto marcado como entregado o pendiente.
2. Con sesión y todos los proyectos entregados se desbloquea la postulación.
3. Al postular se inserta en `postulaciones` (con `user_id`, entregas adjuntas en `jsonb` y consentimiento). La política de inserción vuelve a comprobar el requisito con `cumple_requisitos`.
4. Las postulaciones solo las lee su autor y el equipo desde el panel de Supabase, que las envía a la empresa.

### Columnas de una oportunidad (tabla `oportunidades`)
| Columna | Qué contiene |
| --- | --- |
| `titulo`, `empresa`, `sector` | El encargo y la empresa (en ejemplos, empresa ficticia) |
| `tipo` | `experiencia_empresa` (sin pago) · `reto_con_premio` |
| `carrera`, `rol` | Área (valores de `carrera`) y rol junior |
| `resumen`, `descripcion`, `que_haras`, `requisitos` | Texto y listas (`text[]`) |
| `ruta`, `etapa_requerida` | Ruta del rol (slug) y hasta qué etapa hay que completarla para postular |
| `compensacion` | Lo que se obtiene: «Constancia de la empresa, carta de recomendación…» o «S/ 300 por cada falla crítica…» |
| `modalidad`, `ubicacion`, `dedicacion`, `cupos`, `cierra` | Condiciones |
| `es_ejemplo` | `true` muestra la etiqueta «Oportunidad de ejemplo» (obligatoria si la empresa es ficticia) |
| `destacada` | `true` la muestra en la portada |
| `estado` | `borrador` · `abierta` · `cerrada` (la web lee `abierta` y `cerrada`) |

### Rutas (roadmap)
`src/lib/rutas.ts`: por ruta, `puesto`, `resumen`, 3 `etapas` (`titulo`, `objetivo`, `temas`, `recursos`) y `despues`.
`/rutas/[slug]` dibuja el mapa (etapas → meta), y por etapa: qué aprender, los proyectos que la demuestran y las oportunidades que se desbloquean.
Para sumar un proyecto a una ruta: `casos.ruta` = slug y `casos.etapa` = 1, 2 o 3.

### Columnas de un proyecto (tabla `casos`)
| Columna | Qué contiene |
| --- | --- |
| `titulo` | Título del proyecto, en imperativo («Prueba el proceso de compra…») |
| `ruta`, `etapa` | Ruta (slug de `src/lib/rutas.ts`) y etapa (1–3) a la que pertenece |
| `carrera` | Área: uno de los valores de `src/lib/carreras.ts` |
| `rol` | Puesto junior, p. ej. «QA junior» |
| `sector` | Tipo de empresa, sin nombre real (opcional) |
| `resumen` | Una frase para listas y la ficha destacada |
| `nivel` | `inicial` · `intermedio` |
| `duracion` | Texto libre, p. ej. «30–45 min» |
| `contexto`, `encargo`, `complicacion`, `materiales` | El encargo, visible desde el inicio |
| `habilidades`, `entregables`, `criterios` | Listas (`text[]`) |
| `herramientas`, `requisitos` | Listas (`text[]`): herramientas del puesto y lo que conviene saber antes |
| `recursos` | `jsonb`: `[{ nombre, descripcion, url }]`; los archivos van en `public/recursos/<practica>/` |
| `referencia` | `jsonb` o `null`: solución de referencia, visible solo después de entregar |
| `enlace_obligatorio` | `true` cuando la entrega principal es un archivo o enlace (dashboard, diseño, repositorio) |
| `lo_que_hice`, `que_paso`, `aprendizaje` | El desenlace real, OCULTO hasta entregar |
| `tipo_veracidad` | `real_anonimizado` · `basado_en_hechos` · `ilustrativo` |
| `validado_empresa` | `true` muestra el sello «Validado por la empresa» |
| `destacada` | Marca un proyecto destacado (la portada destaca oportunidades) |
| `estado` | `pendiente` · `aprobado` · `rechazado` |

### Etiquetas visibles (mostrar SIEMPRE)
En cada proyecto, su veracidad. En cada oportunidad con empresa ficticia, «Oportunidad de ejemplo» (`EtiquetaEjemplo`).
Usar el componente `EtiquetaVeracidad`. Los textos están en `src/lib/tipos.ts`.

### Áreas (valores de `carrera`)
`software` · `datos` · `erp` · `marketing` · `diseno` · `contabilidad`, definidas en `src/lib/carreras.ts` (`AREAS`, agrupadas en `FAMILIAS`).
Un área sin proyectos aprobados se muestra como «Próximamente»; `AREAS_EN_CAMINO` anuncia áreas que aún no tienen valor.
Para agregar un área: sumarla a `AREAS` con su `familia`. El menú Explorar y los filtros se arman solos con los datos.

### Stack (no agregar librerías sin preguntar al equipo)
- Next.js 16 (App Router, **Cache Components activado**) + TypeScript + Tailwind CSS 4
- Supabase con `@supabase/supabase-js`; el cliente está en `src/lib/supabase.ts`
- Lecturas del servidor en `src/lib/practicas.ts` y `src/lib/oportunidades.ts`; tipos y etiquetas en `src/lib/tipos.ts`
- Progreso del estudiante en su cuenta: `src/lib/sesion.tsx`. En el navegador solo quedan las reacciones propias (`src/lib/almacenamiento.ts`)
- Esquema: `supabase/schema.sql`, luego `migracion-002-practicas.sql`, `migracion-003-recursos.sql`, `migracion-004-oportunidades.sql`, `migracion-005-cuentas-y-rutas.sql` y `migracion-006-flujo-comprobado.sql`
- Proyectos con comprobación (`casos.comprobacion`): la entrega se hace con la función `comprobar_entrega` y solo cuenta como requisito si queda aprobada (`entregas.aprobada`). Las respuestas correctas van en `claves_comprobacion`, nunca en el código del frontend
- Deploy en Vercel: cada push a `main` se publica solo

### Reglas de código
- Con Cache Components, todo componente que lea Supabase, `params` o `searchParams` va dentro de `<Suspense>` con un fallback.
- `params` y `searchParams` son Promises: `const { id } = await params;`
- Páginas que solo muestran datos = Server Components. Solo lo interactivo lleva `"use client"`.
- Los hooks empiezan con `use` (regla de React). Leer `localStorage` con `useSyncExternalStore`, como en `useAlmacenamiento.ts`.
- Variables: `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_ANON_KEY`. Nunca escribir claves en el código ni usar la *service role key*.
- Publicar un caso SIEMPRE con `supabase.rpc('publicar_caso', { ... })`. No insertar directo en `casos`.
- Toda la interfaz en español, mobile-first, con `<label>` en cada campo y estados de carga y error claros.

### Identidad visual
- Colores (tokens en `src/app/globals.css`): cobalto `#2855F9` para acciones, tinta `#14213D` para texto,
  lima `#D8EF69` reservado para el momento del desenlace y los logros, niebla `#F6F8FC` de fondo.
- Tipografía: Plus Jakarta Sans. Títulos en peso 800 con tracking negativo.
- Botones con verbos concretos y sin flechas en el texto. Etiquetas en minúsculas normales, nunca en mayúsculas sostenidas.
- Listas de proyectos y oportunidades como filas, no como tarjetas idénticas.

### Rutas de la web
- Encabezado — Rutas, Proyectos (menú por área, rol y herramienta), Oportunidades, buscador (`/proyectos?q=`) e Ingresar o menú de cuenta
- `/` — portada: oportunidad destacada, oportunidades abiertas, cómo funciona, rutas, proyectos para empezar y llamado a empresas
- `/rutas` y `/rutas/[slug]` — roadmap del rol por etapas, con avance de la persona
- `/proyectos` — catálogo con filtros; acepta `?q=`, `?area=`, `?rol=` y `?herramienta=`
- `/proyectos/[id]` — proyecto: encargo → entrega → desenlace → autoevaluación; indica su ruta y etapa y para qué oportunidades cuenta
- `/oportunidades` (acepta `?tipo=` y `?area=`) y `/oportunidades/[id]` — requisito por ruta y postulación
- `/ingresar` — ingreso y registro (`?volver=` y `?modo=registro`)
- `/portafolio`, `/en-curso`, `/postulaciones` — progreso de la cuenta
- Redirecciones (next.config.ts): `/explorar` → `/proyectos`, `/practicas/:id` → `/proyectos/:id`, `/mi-practica` → `/en-curso`
- `/publicar` — pendiente: formulario para que juniors aporten casos (usa `publicar_caso`)

### Moderación
Desde el panel de Supabase: `casos` → `estado` = `aprobado`; `oportunidades` → `estado` = `abierta`; las postulaciones se leen en `postulaciones`.
No construir panel de administración ni vista de empresa en el MVP.
