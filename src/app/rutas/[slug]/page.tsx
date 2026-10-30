import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { FilaOportunidad } from "@/components/FilaOportunidad";
import { FilaPractica } from "@/components/FilaPractica";
import { MapaRuta } from "@/components/MapaRuta";
import { ProgresoRuta } from "@/components/ProgresoRuta";
import { etiquetaArea } from "@/lib/carreras";
import { obtenerOportunidades } from "@/lib/oportunidades";
import { obtenerPracticas } from "@/lib/practicas";
import { proyectosPorEtapa, proyectosRequeridos } from "@/lib/requisitos";
import { obtenerRuta } from "@/lib/rutas";

export default function PaginaRuta({ params }: { params: Promise<{ slug: string }> }) {
  return (
    <Suspense fallback={<RutaCargando />}>
      <ContenidoRuta params={params} />
    </Suspense>
  );
}

async function ContenidoRuta({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const ruta = obtenerRuta(slug);
  if (!ruta) notFound();

  const [proyectos, oportunidades] = await Promise.all([
    obtenerPracticas(),
    obtenerOportunidades().catch(() => []),
  ]);
  const porEtapa = proyectosPorEtapa(ruta.slug, proyectos);
  const abiertas = oportunidades.filter((o) => o.ruta === ruta.slug && o.estado === "abierta");
  const todos = [...porEtapa[1], ...porEtapa[2], ...porEtapa[3]].map((p) => p.id);

  return (
    <article className="mx-auto w-full max-w-5xl px-4 pt-10 sm:px-6">
      <nav aria-label="Ruta de navegación" className="text-sm text-pizarra">
        <Link href="/rutas" className="hover:text-tinta">
          Rutas
        </Link>
        <span aria-hidden="true" className="mx-2">
          /
        </span>
        {etiquetaArea(ruta.area)}
      </nav>

      <header className="mt-6 flex flex-wrap items-end justify-between gap-x-10 gap-y-6">
        <div className="max-w-2xl">
          <p className="text-sm font-semibold text-cobalto">Ruta hacia</p>
          <h1 className="mt-1 text-[2.2rem] font-extrabold leading-[1.08] tracking-[-0.045em] sm:text-5xl">
            {ruta.puesto}
          </h1>
          <p className="mt-4 text-lg leading-relaxed text-pizarra">{ruta.resumen}</p>
        </div>
        <ProgresoRuta proyectos={todos} />
      </header>

      <MapaRuta
        puesto={ruta.puesto}
        etapas={ruta.etapas.map((e) => ({
          numero: e.numero,
          titulo: e.titulo,
          proyectos: porEtapa[e.numero].map((p) => p.id),
          oportunidades: abiertas.filter((o) => o.etapa_requerida === e.numero).length,
        }))}
      />

      <p className="mt-6 max-w-[70ch] text-sm leading-relaxed text-pizarra">
        Cada etapa te dice qué aprender y con qué proyecto demostrarlo. Las empresas piden
        la ruta hasta cierta etapa: al completarla, se desbloquean sus oportunidades.
      </p>

      <ol className="relative mt-12 space-y-12 before:absolute before:top-2 before:bottom-2 before:left-5 before:w-0.5 before:bg-linea sm:before:left-6">
        {ruta.etapas.map((etapa) => {
          const lista = porEtapa[etapa.numero];
          const desbloquea = abiertas.filter((o) => o.etapa_requerida === etapa.numero);
          return (
            <li
              key={etapa.numero}
              id={`etapa-${etapa.numero}`}
              className="relative grid scroll-mt-6 grid-cols-[2.5rem_1fr] gap-x-4 sm:grid-cols-[3rem_1fr] sm:gap-x-6"
            >
              <span
                aria-hidden="true"
                className="relative z-10 flex h-10 w-10 items-center justify-center rounded-full bg-cobalto text-lg font-extrabold text-blanco ring-4 ring-niebla sm:h-12 sm:w-12"
              >
                {etapa.numero}
              </span>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-cobalto">Etapa {etapa.numero}</p>
                <h2 className="text-2xl font-bold tracking-[-0.03em]">{etapa.titulo}</h2>
                <p className="mt-1 max-w-[62ch] leading-relaxed text-pizarra">{etapa.objetivo}</p>

                <div className="mt-5 grid gap-4 lg:grid-cols-[1fr_1.4fr]">
                  <section className="rounded-2xl border border-linea bg-blanco p-5">
                    <h3 className="font-bold">Qué aprender</h3>
                    <ul className="mt-3 flex flex-wrap gap-2 text-[0.82rem] font-semibold">
                      {etapa.temas.map((t) => (
                        <li key={t} className="rounded-full bg-niebla px-2.5 py-1">
                          {t}
                        </li>
                      ))}
                    </ul>
                    {etapa.recursos.length > 0 && (
                      <>
                        <p className="mt-4 text-sm font-semibold text-pizarra">Recursos gratuitos</p>
                        <ul className="mt-1.5 space-y-1 text-sm">
                          {etapa.recursos.map((r) => (
                            <li key={r.url}>
                              <a
                                href={r.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="font-bold text-cobalto underline-offset-4 hover:underline"
                              >
                                {r.nombre}
                                <span className="sr-only"> (se abre en otra pestaña)</span>
                              </a>
                            </li>
                          ))}
                        </ul>
                      </>
                    )}
                  </section>

                  <section>
                    <h3 className="font-bold">Demuéstralo con</h3>
                    {lista.length === 0 ? (
                      <p className="mt-3 rounded-2xl border border-dashed border-linea bg-blanco p-5 text-sm leading-relaxed text-pizarra">
                        Estamos preparando el proyecto de esta etapa con juniors que ya trabajan en el área.
                      </p>
                    ) : (
                      <ul className="mt-3 divide-y divide-linea overflow-hidden rounded-2xl border border-linea bg-blanco">
                        {lista.map((p) => (
                          <li key={p.id}>
                            <FilaPractica practica={p} />
                          </li>
                        ))}
                      </ul>
                    )}
                  </section>
                </div>

                {desbloquea.length > 0 && (
                  <section className="mt-4 rounded-2xl bg-tinta p-5 text-blanco">
                    <h3 className="font-bold text-lima">Al completar esta etapa puedes postular a</h3>
                    <ul className="mt-3 overflow-hidden rounded-xl bg-blanco text-tinta">
                      {desbloquea.map((o) => (
                        <li key={o.id} className="border-b border-linea last:border-b-0">
                          <FilaOportunidad
                            oportunidad={o}
                            requeridas={proyectosRequeridos(o, proyectos).map((p) => p.id)}
                            conResumen={false}
                          />
                        </li>
                      ))}
                    </ul>
                  </section>
                )}
              </div>
            </li>
          );
        })}

        <li id="meta" className="relative grid scroll-mt-6 grid-cols-[2.5rem_1fr] gap-x-4 sm:grid-cols-[3rem_1fr] sm:gap-x-6">
          <span
            aria-hidden="true"
            className="relative z-10 flex h-10 w-10 items-center justify-center rounded-full bg-lima text-lg font-extrabold text-tinta ring-4 ring-niebla sm:h-12 sm:w-12"
          >
            ★
          </span>
          <div className="rounded-2xl bg-lima p-6 sm:p-7">
            <h2 className="text-2xl font-bold tracking-[-0.03em]">Postula como {ruta.puesto}</h2>
            <p className="mt-1 max-w-[60ch] leading-relaxed">
              Con tu portafolio de proyectos y las experiencias con empresas de esta ruta,
              llegas a tu primer puesto con pruebas de lo que sabes hacer.
            </p>
            <p className="mt-5 font-bold">Y después, puedes crecer hacia</p>
            <ul className="mt-3 flex flex-wrap gap-2">
              {ruta.despues.map((d) => (
                <li key={d} className="rounded-full bg-blanco/70 px-3 py-1.5 text-sm font-semibold">
                  {d}
                </li>
              ))}
            </ul>
          </div>
        </li>
      </ol>
    </article>
  );
}

function RutaCargando() {
  return (
    <div aria-busy="true" aria-label="Cargando ruta" className="mx-auto w-full max-w-5xl space-y-4 px-4 pt-10 sm:px-6">
      <div className="h-6 w-48 animate-pulse rounded bg-blanco motion-reduce:animate-none" />
      <div className="h-14 w-3/4 animate-pulse rounded-xl bg-blanco motion-reduce:animate-none" />
      <div className="h-96 animate-pulse rounded-2xl border border-linea bg-blanco motion-reduce:animate-none" />
    </div>
  );
}
