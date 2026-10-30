# Escalón Cero

**Practica tu primer empleo antes de tenerlo.**

Casos reales del primer año de trabajo: el estudiante decide qué haría y luego descubre qué pasó de verdad.

🔗 **Demo:** [escalon-cero-seven.vercel.app](https://escalon-cero-seven.vercel.app)

Proyecto desarrollado en **DSC HACK 2026** (Developer Student Club PUCP) · Reto «Educación 2036» · Grieta 01: la escalera rota del primer empleo.

---

## El problema

La inteligencia artificial está absorbiendo las tareas con las que los juniors aprendían el oficio.

- En EE. UU., el empleo de trabajadores de 22 a 25 años en las ocupaciones más expuestas a la IA generativa tuvo una **caída relativa de 13%**, mientras que el de los trabajadores con más experiencia en esas mismas ocupaciones se mantuvo estable o creció ([Brynjolfsson, Chandar y Chen, Stanford, 2025](https://siepr.stanford.edu/publications/working-paper/canaries-coal-mine-six-facts-about-recent-employment-effects-artificial)).
- En el Perú, el **24,1% de la fuerza laboral** trabaja en ocupaciones con alta exposición a la IA generativa, sobre todo en puestos técnico-administrativos (INEI, 2025).

La IA domina el conocimiento que está escrito. Lo que no tiene es el **conocimiento tácito**: lo que se aprende haciendo el trabajo y casi nunca se documenta. Si hay menos puestos junior, cada año se transmite menos de ese conocimiento a la siguiente generación ([Ide, 2025](https://arxiv.org/abs/2507.16078)).

## Nuestra propuesta

Escalón Cero reúne casos reales y anonimizados de trabajos junior. Cada caso cuenta qué le pidieron a un junior, qué complicación apareció, qué decidió y **qué pasó de verdad**: el desenlace que ninguna IA puede inventar.

## Cómo funciona

1. **Lees el caso:** contexto, encargo y la complicación que no estaba en el enunciado.
2. **Decides:** escribes qué harías tú.
3. **Descubres:** recién entonces ves qué hizo el junior, qué pasó y lo que la universidad no le enseñó.
4. **Reaccionas:** marcas si te sirvió o si a ti te pasó algo parecido.

Predecir antes de ver el desenlace hace visible el razonamiento, el principio del *aprendizaje cognitivo* (Collins, Brown y Holum, 1991).

## Confianza en los casos

| Etiqueta | Significado |
| --- | --- |
| Caso real anonimizado | Ocurrió así; solo se cambiaron los nombres |
| Basado en hechos reales | Ocurrió, con detalles modificados por confidencialidad |
| Ejemplo ilustrativo | Creado con fines didácticos |
| Validado por la empresa | La empresa confirmó que la situación es real |

Cada autor se verifica de forma privada antes de publicar, y todo caso pasa por moderación.

## Carreras del primer lote

Ingeniería Informática y Software · Contabilidad y Administración · Marketing y Publicidad · Diseño Gráfico · Casos transversales para todas las carreras.

## Stack

| Capa | Tecnología |
| --- | --- |
| Frontend | [Next.js](https://nextjs.org) (App Router) · TypeScript · Tailwind CSS |
| Base de datos | [Supabase](https://supabase.com) (Postgres con Row Level Security) |
| Despliegue | [Vercel](https://vercel.com) |

## Estructura

```
src/
  app/            Rutas de la aplicación
  lib/
    supabase.ts   Cliente de Supabase
    carreras.ts   Carreras disponibles
    tipos.ts      Tipos de datos y etiquetas
supabase/
  schema.sql      Tablas, políticas de seguridad y función publicar_caso
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
El esquema de base de datos está en `supabase/schema.sql`.

## Equipo

- **Emyr Vasquez Riofrio**
- **Jhon Mejia Quispe**
- **Gustavo Marcelo Monge Tovar**

## Fuentes

- Brynjolfsson, E., Chandar, B. y Chen, R. (2025). *Canaries in the Coal Mine? Six Facts about the Recent Employment Effects of Artificial Intelligence*. Stanford Digital Economy Lab.
- INEI (2025). *Doble desafío tecnológico: análisis de la exposición a la automatización tradicional y a la inteligencia artificial generativa en el empleo peruano, 2024*.
- Ide, E. (2025). *Automation, AI, and the Intergenerational Transmission of Knowledge*. arXiv:2507.16078.
- Collins, A., Brown, J. S. y Holum, A. (1991). Cognitive Apprenticeship: Making Thinking Visible. *American Educator*, 15(3).
