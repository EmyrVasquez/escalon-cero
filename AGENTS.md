<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## Escalón Cero: lo que hay que saber antes de tocar el código

Escalón Cero ayuda a estudiantes de últimos ciclos y recién egresados a ganar su primera experiencia. Las oportunidades las publica el equipo desde Supabase. La vista de empresa (`/empresa`) es de ejemplo: usa datos fijos de `src/lib/empresa-demo.ts` y no guarda nada. Lo hicimos para DSC HACK 2026 (reto «Educación 2036», grieta 01).

El README explica el producto, las carpetas y cómo correrlo. Aquí van las reglas que no se ven a simple vista.

### Vocabulario

Usamos siempre las mismas palabras, en la interfaz y en el código:

- **Ruta**: el mapa de un puesto junior en tres etapas. El contenido está en `src/lib/rutas.ts`.
- **Proyecto**: un encargo simulado que pertenece a una etapa de una ruta (`casos.ruta`, `casos.etapa`). En la base de datos la tabla se llama `casos` por historia; en todo lo demás es «proyecto».
- **Oportunidad**: un encargo de una empresa. Puede ser `experiencia_empresa` (sin pago: constancia, carta y caso para el portafolio) o `reto_con_premio`.
- **Requisito**: una oportunidad pide completar la ruta de su puesto hasta `etapa_requerida`. La regla está dos veces y tiene que coincidir: en `src/lib/requisitos.ts` (para mostrarla) y en la función `cumple_requisitos` de la base (para hacerla cumplir).

No uses «práctica» en la interfaz: la gente lo confunde con prácticas preprofesionales.

### Dónde va cada cosa

- Páginas en `src/app`, una carpeta por URL. Los componentes en `src/components/<sección>`: `layout`, `rutas`, `proyectos`, `oportunidades`, `cuenta`, `empresa` y `ui`.
- Lo que se lee en el servidor (proyectos, oportunidades) está en `src/lib/proyectos.ts` y `src/lib/oportunidades.ts`.
- Lo que es de cada persona (entregas, borradores, postulaciones) se carga en el navegador desde `src/lib/sesion.tsx`, con `useSesion()`. Ahí también están `comprobar()` y `postular()`, que suben archivos a Storage.
- Los tipos y los textos de las etiquetas están en `src/lib/tipos.ts`.
- La base de datos está entera en `supabase/schema.sql`, y los datos de la demo en `supabase/seed.sql`. Si cambias la estructura, actualiza `schema.sql` y escribe además el SQL del cambio para correrlo en producción. No dejes archivos de migración sueltos en el repositorio.

### Los dos tipos de proyecto

- **Con comprobación** (`casos.comprobacion` no es nulo): el estudiante sube su archivo y responde cifras. Se entrega con `comprobar()`, que llama a la función `comprobar_entrega` de la base. Esa función corrige, guarda y marca `entregas.aprobada`; nadie más puede escribir esa columna. Después de entregar se va a `/proyectos/[id]/resultado`, y las respuestas correctas se muestran en `/proyectos/[id]/solucion`, solo si aprobó. Las respuestas viven en `claves_comprobacion` y nunca deben aparecer en el código del frontend.
- **Libre** (el resto): el estudiante escribe su solución (`EntregaLibre`) y, al entregar, ve qué hizo el junior real.

En los dos casos, lo que pasó en el caso (`lo_que_hice`, `que_paso`, `aprendizaje`) no se muestra antes de entregar.

Una entrega cuenta como requisito si el proyecto es libre, o si es con comprobación y está aprobada. Eso es `EntradaPortafolio.valida` en el código y `cumple_requisitos` en la base.

### Postular

Hace falta sesión, cumplir el requisito y subir un CV en PDF. El CV va al bucket privado `entregas`, en la carpeta `<user_id>/cv/`. La política de inserción de `postulaciones` revisa todo de nuevo en la base.

### Vistas de la demo

`SelectorVista` (en el layout) cambia entre General, Estudiante y Empresa. «Estudiante» entra con `entrarComoDemo()` de `sesion.tsx`: un usuario anónimo de Supabase con `nombre = "Lucía Ramos"`; `esDemo` lo identifica. Si Supabase tiene apagado «Allow anonymous sign-ins», el botón muestra el error.

### Reglas de código

- Lo que dependa de la sesión y cambie un atributo (clase, `disabled`, `aria-pressed`) en un componente que se hidrata dentro de un `<Suspense>` debe esperar a `useMontado()`: React no corrige atributos distintos al hidratar.

- Next.js 16 con Cache Components: todo componente que lea Supabase, `params` o `searchParams` va dentro de `<Suspense>` con un fallback. `params` y `searchParams` son promesas (`const { id } = await params`).
- Las páginas que solo muestran datos son Server Components. Solo lo interactivo lleva `"use client"`.
- Nunca escribas claves en el código ni uses la service role key. Las variables son `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
- No agregues librerías sin hablarlo con el equipo.
- Toda la interfaz va en español, pensada primero para celular, con `<label>` en cada campo y estados de carga y error claros.
- En cada proyecto se muestra su veracidad (`EtiquetaVeracidad`), y en cada oportunidad de empresa ficticia, «Oportunidad de ejemplo» (`EtiquetaEjemplo`).

### Estilo visual

- Colores (en `src/app/globals.css`): cobalto `#2855F9` para acciones, tinta `#14213D` para texto, lima `#D8EF69` solo para logros (aprobar, postular) y niebla `#F6F8FC` de fondo.
- Tipografía Plus Jakarta Sans; títulos en peso 800 con tracking negativo.
- Un solo botón principal por pantalla. Los botones dicen lo que hacen («Postular ahora», «Corregir mis cifras») y no llevan flechas.
- Las listas largas de proyectos van como filas. En portada y rutas se usan tarjetas con ilustración (`public/ilustraciones/`) para que se entienda de un vistazo; el detalle va en las páginas de proyecto y de postulación.

### Áreas

`software`, `datos`, `erp`, `marketing`, `contabilidad` y `diseno`, definidas en `src/lib/areas.ts`. Solo las de `AREAS_ACTIVAS` (hoy tecnología: `software`, `datos`, `erp`) se listan; las demás salen como «Próximamente» según `SECCIONES`. Para abrir un área, agrégala a `AREAS_ACTIVAS` y marca su sección como `activa`.

### Despliegue

Cada push a `main` se publica en Vercel. Si un cambio necesita SQL nuevo, córrelo en Supabase antes del push: la web nueva con la base vieja se rompe.
