# Escalón Cero

Gana experiencia antes de tu primer empleo.

Demo: [escalon-cero-seven.vercel.app](https://escalon-cero-seven.vercel.app)

Lo hicimos para DSC HACK 2026 (Developer Student Club PUCP), en el reto «Educación 2036», grieta 01: la escalera rota del primer empleo.

## Por qué existe

Para tu primera práctica te piden experiencia, y para tener experiencia necesitas tu primera práctica. Ese círculo siempre existió, pero ahora la IA está haciendo justo las tareas con las que un junior aprendía el oficio, y esos puestos son los primeros en desaparecer.

Algunos datos que nos movieron:

- En EE. UU., el empleo de personas de 22 a 25 años en las ocupaciones más expuestas a la IA generativa cayó 13 % en términos relativos, mientras que el de los trabajadores con más experiencia se mantuvo ([Brynjolfsson, Chandar y Chen, 2025](https://siepr.stanford.edu/publications/working-paper/canaries-coal-mine-six-facts-about-recent-employment-effects-artificial)).
- En el Perú, el 24,1 % de la fuerza laboral está en ocupaciones con alta exposición a la IA generativa (INEI, 2025).

Del otro lado hay muchas pymes que necesitan ayuda pero no pueden pagar un sueldo junior, y que tampoco se arriesgan a contratar a alguien sin pruebas de lo que sabe hacer.

## Cómo funciona

Todo gira alrededor de tres piezas:

- **Ruta**: el mapa de un puesto junior (Desarrollador ERP, QA, analista de datos…) en tres etapas. Cada etapa dice qué aprender y con qué proyecto demostrarlo.
- **Proyecto**: un encargo de trabajo como los del primer mes en ese puesto, con datos y una complicación real. Lo resuelves, lo entregas y recién ahí ves qué hizo el junior del caso y cómo le fue.
- **Oportunidad**: un encargo de una empresa. Para postular tienes que haber completado la ruta de ese puesto hasta la etapa que pide la empresa. Así quien busca un QA solo recibe a gente que hizo los proyectos de QA.

La mayoría de oportunidades son experiencia con empresa: un encargo sin pago a cambio de constancia, carta de recomendación y un caso real para el portafolio. Algunas son retos con premio, al estilo de un bug bounty: se paga por cada falla confirmada.

Las oportunidades las conseguimos nosotros hablando con las empresas, y las de la demo son de empresas ficticias (la web las marca como «Oportunidad de ejemplo»). El piloto cubre tecnología (ERP, datos y QA); diseño, comunicación y negocios aparecen como «Próximamente».

### Tres vistas para la demo

Arriba de cada página hay un selector **General / Estudiante / Empresa**:

- **General**: la web tal cual. Puedes crear tu cuenta y hacer el proyecto de verdad.
- **Estudiante**: entra al instante como Lucía Ramos, una cuenta de ejemplo con sesión iniciada, y abre «Mi espacio» (`/mi-espacio`): siguiente paso, avance en la ruta y postulaciones. Usa el inicio de sesión anónimo de Supabase. Volver a «General» cierra esa sesión.
- **Empresa**: el panel de una empresa ficticia (`/empresa`) con sus avisos, tres postulaciones para revisar en detalle y el formulario para publicar un aviso. Todo es de ejemplo y no se guarda: todavía no hay cuentas de empresa.

### El flujo que se puede probar de punta a punta

El proyecto «Arma un dashboard de ventas en Power BI para gerencia» está completo:

1. Descargas la exportación de ventas de un ERP: 9 587 filas, con devoluciones mezcladas y clientes duplicados.
2. Armas el dashboard en Power BI o Excel.
3. Subes tu archivo (captura, PDF o .pbix) y respondes cinco cifras del año.
4. La base de datos las corrige al instante. Si fallas, te da una pista; si aciertas cuatro de cinco, apruebas.
5. Al aprobar ves las respuestas correctas y se desbloquea una oportunidad. Postulas con tu CV y tu proyecto adjunto.

Las respuestas correctas nunca llegan al navegador: están en una tabla que la web no puede leer, y solo una función de la base de datos puede marcar una entrega como aprobada. La base también vuelve a revisar el requisito cuando alguien postula, así que no se puede saltar desde la página.

## Cómo está hecho

- **Web**: Next.js 16 (App Router), React 19, TypeScript y Tailwind CSS 4, desplegada en Vercel. Cada push a `main` se publica solo.
- **Backend**: Supabase. Usamos Postgres con Row Level Security para los datos, Auth para las cuentas con correo y contraseña (y una sesión anónima para la vista «Estudiante»), y Storage para los archivos que suben los estudiantes.

No tenemos un servidor propio. La lógica que no puede depender del navegador (corregir las cifras, validar requisitos, quién ve qué) vive en la base de datos; el resto está en la web.

### Carpetas

```
src/
  app/                  Una carpeta por página (las URL de la web)
  components/
    layout/             Encabezado, menú, selector de vista, pie de página
    rutas/              Camino de la ruta y avance
    proyectos/          Catálogo, entrega, resultado y solución
    oportunidades/      Fichas, requisito y postulación
    cuenta/             Ingreso, mi espacio, portafolio, en curso, postulaciones
    empresa/            Vista de empresa de ejemplo
    ui/                 Íconos e ilustraciones
  lib/
    supabase.ts         Cliente de Supabase
    proyectos.ts        Lectura de proyectos (servidor)
    oportunidades.ts    Lectura de oportunidades (servidor)
    rutas.ts            Contenido de las rutas: etapas, temas y recursos
    requisitos.ts       Qué proyectos pide cada oportunidad
    sesion.tsx          Cuenta del estudiante y su progreso (navegador)
    areas.ts            Áreas, las activas del piloto y las secciones «Próximamente»
    empresa-demo.ts     Empresa y postulantes ficticios de la vista de empresa
    montado.ts          Evita choques entre el HTML del servidor y la sesión
    tipos.ts            Tipos y textos de etiquetas
    menu.ts, texto.ts   Menú de proyectos y utilidades de texto
    reacciones.ts       Reacciones ya marcadas (lo único en localStorage)
supabase/
  schema.sql            Toda la estructura: tablas, reglas de acceso, funciones y bucket
  seed.sql              Los proyectos, oportunidades y respuestas de la demo
public/recursos/        Archivos que se descargan desde los proyectos (datos ficticios)
```

### Nombres

En la base de datos la tabla de proyectos se llama `casos`: así empezó el proyecto, cuando eran solo casos para leer. En el código y en la interfaz siempre decimos «proyecto». También evitamos la palabra «práctica» en la web, porque se confunde con las prácticas preprofesionales.

## Correrlo en tu computadora

Necesitas Node.js 20 o superior y un proyecto en Supabase.

```bash
git clone https://github.com/EmyrVasquez/escalon-cero.git
cd escalon-cero
npm install
cp .env.example .env.local   # y completa las dos variables
npm run dev
```

Las variables son `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_ANON_KEY`, y las encuentras en Supabase, en Project Settings → API.

Para preparar la base de datos:

1. En el SQL Editor de Supabase, corre `supabase/schema.sql` y luego `supabase/seed.sql`. Los dos se pueden volver a correr sin problema.
2. En Authentication → Sign In / Providers → Email, deja activado el proveedor Email y desactiva «Confirm email». Así las cuentas funcionan al instante y no dependes del límite de correos del plan gratuito. En la misma sección activa «Allow anonymous sign-ins» para que funcione la vista «Estudiante».

La base de producción ya tiene todo esto; estos pasos son para una base nueva.

## Agregar contenido

Todavía no hay panel de administración, así que se hace desde Supabase:

- **Un proyecto**: una fila en `casos` con `estado = 'aprobado'`, la `ruta` (un slug de `src/lib/rutas.ts`) y la `etapa` (1, 2 o 3). Si tiene archivos para descargar, van en `public/recursos/<nombre-del-proyecto>/`.
- **Un proyecto que se corrige solo**: además, las preguntas en `casos.comprobacion` y las respuestas en `claves_comprobacion`. El de Power BI en `seed.sql` sirve de modelo.
- **Una oportunidad**: una fila en `oportunidades` con `estado = 'abierta'`, la `ruta` y la `etapa_requerida`. Si la empresa es ficticia, `es_ejemplo = true`.

Las postulaciones se revisan en la tabla `postulaciones`, y los CV y dashboards en Storage, en el bucket `entregas`.

## Equipo

- Emyr Vasquez Riofrio
- Jhon Mejia Quispe
- Gustavo Marcelo Monge Tovar

## Fuentes

- Brynjolfsson, E., Chandar, B. y Chen, R. (2025). *Canaries in the Coal Mine? Six Facts about the Recent Employment Effects of Artificial Intelligence*. Stanford Digital Economy Lab.
- INEI (2025). *Doble desafío tecnológico: análisis de la exposición a la automatización tradicional y a la inteligencia artificial generativa en el empleo peruano, 2024*.
- Ide, E. (2025). *Automation, AI, and the Intergenerational Transmission of Knowledge*. arXiv:2507.16078.
- Collins, A., Brown, J. S. y Holum, A. (1991). Cognitive Apprenticeship: Making Thinking Visible. *American Educator*, 15(3).
