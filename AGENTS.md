<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## Escalón Cero — contexto y reglas del proyecto

### Qué es
Plataforma web donde estudiantes de últimos ciclos resuelven casos reales de trabajos junior **antes** de ver qué pasó de verdad.
Proyecto para DSC HACK 2026 (reto «Educación 2036», grieta 01: la escalera rota del primer empleo).

### Regla central del producto (no romperla)
En la página de un caso, el estudiante ve **Contexto, Encargo y Complicación**, escribe su respuesta a «¿Qué harías tú?» y
**solo después de enviarla** se muestran **Lo que hice, Qué pasó y Lo que no me enseñaron**. Nunca mostrar el desenlace antes.

### Plantilla de un caso (columnas de la tabla `casos`)
| Columna | Qué contiene |
| --- | --- |
| `titulo` | Título corto del caso |
| `carrera` | Una de las carreras de la lista de abajo |
| `rol` | Puesto junior, p. ej. «Analista junior de datos» |
| `sector` | Tipo de empresa o sector, sin nombre de la empresa (opcional) |
| `contexto` | Situación inicial |
| `encargo` | Qué le pidieron y con qué plazo |
| `complicacion` | Lo que no estaba en el enunciado |
| `pregunta` | Por defecto «¿Qué harías tú?» |
| `lo_que_hice` | Decisión que tomó el junior (OCULTO hasta responder) |
| `que_paso` | Desenlace real (OCULTO hasta responder) |
| `aprendizaje` | «Lo que la universidad no me enseñó» (OCULTO hasta responder) |
| `tipo_veracidad` | `real_anonimizado` · `basado_en_hechos` · `ilustrativo` |
| `validado_empresa` | `true` muestra el sello «Validado por la empresa» |
| `autor_alias` | Nombre público opcional del autor |
| `estado` | `pendiente` · `aprobado` · `rechazado` |

### Etiquetas visibles (mostrar SIEMPRE en cada caso)
- `real_anonimizado` → «Caso real anonimizado»
- `basado_en_hechos` → «Basado en hechos reales (detalles modificados)»
- `ilustrativo` → «Ejemplo ilustrativo»
- `validado_empresa = true` → sello «Validado por la empresa»

### Carreras del primer lote (valores de `carrera`)
`informatica` · `contabilidad-administracion` · `marketing-publicidad` · `diseno-grafico` · `transversal`
Definidas en `src/lib/carreras.ts` (`CARRERAS`, `etiquetaCarrera`). `transversal` = sirve a cualquier carrera.

### Stack (no agregar librerías sin preguntar al equipo)
- Next.js 16 (App Router) + TypeScript + Tailwind CSS
- Supabase con `@supabase/supabase-js`; el cliente está en `src/lib/supabase.ts`
- Tipos de datos y etiquetas visibles en `src/lib/tipos.ts`; esquema de base de datos en `supabase/schema.sql`
- Deploy en Vercel: cada push a `main` se publica solo

### Reglas de código
- Páginas que solo muestran datos = Server Components. Solo formularios y botones interactivos llevan `"use client"`.
- En Next.js 15+ `params` y `searchParams` son Promises: `const { id } = await params;`
- Variables de entorno: `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_ANON_KEY`. Nunca escribir claves en el código.
  Nunca usar la *service role key* en este proyecto.
- Publicar un caso SIEMPRE con `supabase.rpc('publicar_caso', { ... })`. No insertar directo en `casos`: las políticas lo bloquean.
- Leer casos: solo los aprobados. Las políticas ya filtran, pero igual agregar `.eq('estado', 'aprobado')` a la consulta.
- Guardar la respuesta del estudiante en `respuestas` ANTES de revelar el desenlace.
- Reacciones en `reacciones`, con `tipo`: `me_sirvio` · `no_me_sirvio` · `me_paso_algo_parecido` · `no_suele_pasar`.
  Para mostrar conteos, traer las reacciones del caso y contarlas en el componente.
- Toda la interfaz en español. Diseño mobile-first. Formularios con `<label>` en cada campo.
- Cada consulta maneja estado de carga y de error con un mensaje claro para el usuario.

### Rutas
- `/` — portada: propuesta de valor y 3 casos destacados
- `/casos` — lista de casos aprobados, filtrable por carrera
- `/casos/[id]` — el caso con la mecánica predecir → revelar, más las reacciones
- `/publicar` — formulario con la plantilla, casilla de consentimiento y casilla «confirmo que no incluye información confidencial»
- `/metodo` — cómo funciona y fuentes (opcional, si hay tiempo)

### Moderación
Se hace desde el panel de Supabase (Table Editor → `casos` → cambiar `estado` a `aprobado`). No construir panel de administración en el MVP.
