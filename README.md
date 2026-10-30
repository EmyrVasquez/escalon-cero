# Escalón Cero

**Gana experiencia antes de tu primer empleo.**

Un marketplace de primera experiencia: empresas reales que todavía no pueden contratar a un junior ofrecen encargos que suman al CV (y algunos retos con premio en efectivo). Para postular, el estudiante sigue la ruta de su rol y entrega sus proyectos como prueba de lo que sabe hacer.

🔗 **Demo:** [escalon-cero-seven.vercel.app](https://escalon-cero-seven.vercel.app)

Proyecto desarrollado en **DSC HACK 2026** (Developer Student Club PUCP) · Reto «Educación 2036» · Grieta 01: la escalera rota del primer empleo.

---

## El problema

La inteligencia artificial está absorbiendo las tareas con las que los juniors aprendían el oficio.

- En EE. UU., el empleo de trabajadores de 22 a 25 años en las ocupaciones más expuestas a la IA generativa tuvo una **caída relativa de 13%**, mientras que el de los trabajadores con más experiencia en esas mismas ocupaciones se mantuvo estable o creció ([Brynjolfsson, Chandar y Chen, Stanford, 2025](https://siepr.stanford.edu/publications/working-paper/canaries-coal-mine-six-facts-about-recent-employment-effects-artificial)).
- En el Perú, el **24,1% de la fuerza laboral** trabaja en ocupaciones con alta exposición a la IA generativa, sobre todo en puestos técnico-administrativos (INEI, 2025).

La IA domina el conocimiento que está escrito. Lo que no tiene es el **conocimiento tácito**: lo que se aprende haciendo el trabajo y casi nunca se documenta. Si hay menos puestos junior, cada año se transmite menos de ese conocimiento a la siguiente generación ([Ide, 2025](https://arxiv.org/abs/2507.16078)).

## Nuestra propuesta

Si la IA absorbe los puestos junior, la experiencia tiene que poder ganarse de otra forma. Escalón Cero conecta dos lados:

- **Oferta:** empresas pequeñas o en crecimiento que necesitan ayuda pero no tienen presupuesto para un sueldo junior. La mayoría ofrece **experiencias con empresa**: encargos reales sin pago, a cambio de constancia, carta de recomendación y un caso real para el portafolio. Algunas publican **retos con premio** (como un *bug bounty*: se paga por cada falla confirmada). En el MVP, el equipo de Escalón Cero consigue cada oportunidad junto con la empresa.
- **Demanda:** estudiantes de últimos ciclos y recién egresados sin experiencia que pueda mostrarse.
- **El filtro:** cada oportunidad pide haber avanzado la **ruta** de su rol hasta cierta etapa. Así una empresa que busca un QA solo recibe postulaciones de quienes hicieron los proyectos de QA.

## Cómo funciona

- **Ruta** — el mapa de un rol en 3 etapas. Cada etapa dice qué aprender (con recursos gratuitos) y con qué proyecto demostrarlo.
- **Proyecto** — un encargo simulado de esa etapa: contexto, encargo, complicación y recursos. Entregas tu solución y recién entonces ves qué hizo el junior real y cómo terminó. La entrega queda en tu portafolio.
- **Oportunidad** — al completar la etapa que pide la empresa, se desbloquea la postulación y tus proyectos se adjuntan como prueba.

Tu progreso se guarda en tu cuenta (Supabase Auth), y la base de datos vuelve a verificar el requisito al postular.

Decidir antes de ver el desenlace hace visible el razonamiento, el principio del *aprendizaje cognitivo* (Collins, Brown y Holum, 1991).

## Confianza en los casos

| Etiqueta | Significado |
| --- | --- |
| Caso real anonimizado | Ocurrió así; solo se cambiaron los nombres |
| Basado en hechos reales | Ocurrió, con detalles modificados por confidencialidad |
| Ejemplo ilustrativo | Creado con fines didácticos |
| Validado por la empresa | La empresa confirmó que la situación es real |

Cada autor se verifica de forma privada antes de publicar, y todo caso pasa por moderación.

## Áreas del primer lote

Ingeniería de software, análisis de datos, sistemas empresariales (ERP), marketing digital y diseño, con contabilidad y finanzas, administración y comunicación audiovisual como siguientes áreas.

El catálogo se explora como en una plataforma de cursos: desde el menú **Explorar** por área, rol o herramienta, y en `/explorar` con filtros por área, rol, nivel, duración y herramienta.

## Stack

| Capa | Tecnología |
| --- | --- |
| Frontend | [Next.js](https://nextjs.org) (App Router) · TypeScript · Tailwind CSS |
| Base de datos | [Supabase](https://supabase.com) (Postgres con Row Level Security) |
| Despliegue | [Vercel](https://vercel.com) |

## Estructura

```
src/
  app/                      Portada, rutas, proyectos, oportunidades, ingreso, portafolio y postulaciones
  components/               Componentes de interfaz
  lib/
    supabase.ts             Cliente de Supabase
    practicas.ts            Lecturas de proyectos en el servidor
    oportunidades.ts        Lecturas de oportunidades en el servidor
    rutas.ts                Rutas por rol: etapas, temas y recursos
    requisitos.ts           Qué proyectos pide cada oportunidad
    sesion.tsx              Cuenta del estudiante y su progreso
    carreras.ts             Áreas y familias de áreas
    menu.ts                 Datos del menú Explorar
    texto.ts                Búsqueda sin tildes, duraciones y plurales
    tipos.ts                Tipos de datos y etiquetas
    almacenamiento.ts       Tipos del progreso y reacciones en el navegador
supabase/
  schema.sql                Tablas, políticas de seguridad y función publicar_caso
  migracion-002-practicas.sql  Campos de práctica y prácticas de ejemplo
  migracion-003-recursos.sql   Herramientas, requisitos, recursos y la práctica de Power BI
  migracion-004-oportunidades.sql  Oportunidades, postulaciones y oportunidades de ejemplo
  migracion-005-cuentas-y-rutas.sql  Rutas y etapas, requisitos por rol, entregas y borradores por usuario
public/recursos/            Archivos ficticios que se descargan desde los proyectos
```

## Desarrollo local

```bash
git clone https://github.com/EmyrVasquez/escalon-cero.git
cd escalon-cero
npm install
cp .env.example .env.local
npm run dev
```

Variables de entorno requeridas: `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
La base de datos se crea ejecutando, en orden, `supabase/schema.sql`, `supabase/migracion-002-practicas.sql`, `supabase/migracion-003-recursos.sql`, `supabase/migracion-004-oportunidades.sql` y `supabase/migracion-005-cuentas-y-rutas.sql`. En Authentication → Sign In / Providers → Email, desactiva «Confirm email» para que el registro sea inmediato.

## Equipo

- **Emyr Vasquez Riofrio**
- **Jhon Mejia Quispe**
- **Gustavo Marcelo Monge Tovar**

## Fuentes

- Brynjolfsson, E., Chandar, B. y Chen, R. (2025). *Canaries in the Coal Mine? Six Facts about the Recent Employment Effects of Artificial Intelligence*. Stanford Digital Economy Lab.
- INEI (2025). *Doble desafío tecnológico: análisis de la exposición a la automatización tradicional y a la inteligencia artificial generativa en el empleo peruano, 2024*.
- Ide, E. (2025). *Automation, AI, and the Intergenerational Transmission of Knowledge*. arXiv:2507.16078.
- Collins, A., Brown, J. S. y Holum, A. (1991). Cognitive Apprenticeship: Making Thinking Visible. *American Educator*, 15(3).
