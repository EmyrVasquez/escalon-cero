<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## Escalón Cero — contexto y reglas del proyecto

### Qué es
Plataforma web donde estudiantes y recién egresados practican tareas reales de puestos junior, entregan su solución,
descubren qué hizo el junior real y cómo terminó, y guardan su entrega en un portafolio.
Proyecto para DSC HACK 2026 (reto «Educación 2036», grieta 01: la escalera rota del primer empleo).

### Flujo del producto (no romperlo)
1. **Explora**: la práctica muestra contexto, encargo, complicación, materiales, requisitos, recursos para descargar, entregables y habilidades.
2. **Entrega**: el estudiante escribe su solución y un enlace (obligatorio si `enlace_obligatorio`). Se registra en `respuestas`.
3. **Descubre**: solo después de entregar se muestran `lo_que_hice`, `que_paso`, `aprendizaje` (sobre fondo lima) y la `referencia` descargable.
4. **Muestra**: la entrega se guarda en el portafolio del navegador, con la autoevaluación según `criterios`.

Nunca mostrar el desenlace antes de la entrega.

### Columnas de una práctica (tabla `casos`)
| Columna | Qué contiene |
| --- | --- |
| `titulo` | Título de la práctica, en imperativo («Prueba el proceso de compra…») |
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
| `destacada` | `true` la muestra como primera práctica en la portada |
| `estado` | `pendiente` · `aprobado` · `rechazado` |

### Etiquetas visibles (mostrar SIEMPRE en cada práctica)
Usar el componente `EtiquetaVeracidad`. Los textos están en `src/lib/tipos.ts`.

### Áreas (valores de `carrera`)
`software` · `datos` · `erp` · `marketing` · `diseno` · `contabilidad`, definidas en `src/lib/carreras.ts` (`AREAS`, agrupadas en `FAMILIAS`).
Un área sin prácticas aprobadas se muestra como «Próximamente»; `AREAS_EN_CAMINO` anuncia áreas que aún no tienen valor.
Para agregar un área: sumarla a `AREAS` con su `familia`. El menú Explorar y los filtros se arman solos con los datos.

### Stack (no agregar librerías sin preguntar al equipo)
- Next.js 16 (App Router, **Cache Components activado**) + TypeScript + Tailwind CSS 4
- Supabase con `@supabase/supabase-js`; el cliente está en `src/lib/supabase.ts`
- Lecturas del servidor en `src/lib/practicas.ts`; tipos y etiquetas en `src/lib/tipos.ts`
- Guardado local (borradores, portafolio, reacciones propias) en `src/lib/almacenamiento.ts` y `src/lib/useAlmacenamiento.ts`
- Esquema: `supabase/schema.sql`, luego `migracion-002-practicas.sql` y `migracion-003-recursos.sql`
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
- Listas de prácticas como filas, no como tarjetas idénticas.

### Rutas
- Encabezado — menú Explorar (por área, rol y herramienta), buscador (`/explorar?q=`), Mi práctica y Mi portafolio
- `/` — portada: buscador, práctica destacada, prácticas recientes y cómo funciona (escalera)
- `/explorar` — catálogo con filtros; acepta `?q=`, `?area=`, `?rol=` y `?herramienta=`
- `/practicas/[id]` — práctica: encargo → entrega → desenlace → autoevaluación y reacciones
- `/mi-practica` — borradores en curso (navegador)
- `/portafolio` — entregas guardadas, con opción de guardar como PDF
- `/publicar` — pendiente: formulario para que juniors aporten casos (usa `publicar_caso`)

### Moderación
Desde el panel de Supabase (Table Editor → `casos` → `estado` = `aprobado`). No construir panel de administración en el MVP.
