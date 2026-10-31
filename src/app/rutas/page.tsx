import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { IconoChevron } from "@/components/ui/Iconos";
import { ProgresoRuta } from "@/components/rutas/ProgresoRuta";
import { etiquetaArea } from "@/lib/areas";
import { obtenerOportunidades } from "@/lib/oportunidades";
import { obtenerProyectos } from "@/lib/proyectos";
import { RUTAS } from "@/lib/rutas";
import { plural } from "@/lib/texto";

export const metadata: Metadata = { title: "Rutas" };

export default function Rutas() {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 pt-12 sm:px-6">
      <h1 className="text-4xl font-extrabold tracking-[-0.045em] sm:text-5xl">Rutas</h1>
      <p className="mt-3 max-w-[64ch] leading-relaxed text-pizarra">
        El mapa de cada puesto junior en tres etapas. En cada una sabes qué aprender,
        con qué proyecto demostrarlo y qué oportunidades con empresas se desbloquean.
      </p>
      <Suspense
        fallback={
          <div aria-busy="true" aria-label="Cargando rutas" className="mt-10 h-96 animate-pulse rounded-2xl border border-linea bg-blanco motion-reduce:animate-none" />
        }
      >
        <ListaRutas />
      </Suspense>
    </div>
  );
}

async function ListaRutas() {
  const [proyectos, oportunidades] = await Promise.all([
    obtenerProyectos(),
    obtenerOportunidades().catch(() => []),
  ]);

  return (
    <ul className="mt-10 divide-y divide-linea overflow-hidden rounded-2xl border border-linea bg-blanco">
      {RUTAS.map((r) => {
        const ids = proyectos.filter((p) => p.ruta === r.slug).map((p) => p.id);
        const abiertas = oportunidades.filter((o) => o.ruta === r.slug && o.estado === "abierta").length;
        return (
          <li key={r.slug}>
            <Link
              href={`/rutas/${r.slug}`}
              className="group flex flex-wrap items-center gap-x-8 gap-y-4 px-5 py-6 transition-colors hover:bg-niebla sm:px-6"
            >
              <div className="min-w-0 flex-[1_1_22rem]">
                <p className="text-sm font-semibold text-cobalto">{etiquetaArea(r.area)}</p>
                <p className="mt-1 text-xl font-bold tracking-[-0.02em]">{r.puesto}</p>
                <p className="mt-1.5 max-w-[64ch] text-sm leading-relaxed text-pizarra">{r.resumen}</p>
                <ol className="mt-3 flex flex-wrap items-center gap-1.5 text-xs font-semibold" aria-label="Etapas">
                  {r.etapas.map((e) => (
                    <li key={e.numero} className="rounded-full bg-niebla px-2.5 py-1">
                      {e.numero}. {e.titulo}
                    </li>
                  ))}
                </ol>
                <p className="mt-2.5 text-sm font-semibold">
                  {ids.length === 0 ? (
                    <span className="text-pizarra">Proyectos próximamente</span>
                  ) : (
                    <>
                      {plural(ids.length, "proyecto", "proyectos")}
                      <span className="text-pizarra"> · </span>
                      {plural(abiertas, "oportunidad abierta", "oportunidades abiertas")}
                    </>
                  )}
                </p>
              </div>
              <ProgresoRuta proyectos={ids} />
              <IconoChevron className="hidden h-5 w-5 shrink-0 text-pizarra transition-transform group-hover:translate-x-0.5 group-hover:text-cobalto motion-reduce:transition-none sm:block" />
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
