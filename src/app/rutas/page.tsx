import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { IconoChevron } from "@/components/ui/Iconos";
import { Ilustracion } from "@/components/ui/Ilustracion";
import { ProgresoRuta } from "@/components/rutas/ProgresoRuta";
import { SECCIONES } from "@/lib/areas";
import { obtenerProyectos } from "@/lib/proyectos";
import { RUTAS } from "@/lib/rutas";

export const metadata: Metadata = { title: "Rutas" };

export default function Rutas() {
  const [tecnologia, ...proximas] = SECCIONES;
  return (
    <div className="mx-auto w-full max-w-6xl px-4 pt-10 sm:px-6">
      <p className="text-sm font-bold text-cobalto">Rutas de preparación</p>
      <h1 className="mt-1 text-4xl font-extrabold tracking-[-0.045em] sm:text-5xl">Elige tu área</h1>
      <p className="mt-3 max-w-[56ch] leading-relaxed text-pizarra">
        Cada ruta es el camino a un puesto junior, en tres etapas. Piloto disponible: tecnología.
      </p>

      <section aria-labelledby="area-tecnologia" className="mt-10 grid overflow-hidden rounded-3xl border border-linea bg-blanco lg:grid-cols-[0.8fr_1.2fr]">
        <div className="flex flex-col justify-between gap-6 bg-cielo p-6 sm:p-8">
          <div>
            <h2 id="area-tecnologia" className="text-2xl font-extrabold tracking-[-0.03em]">
              {tecnologia.titulo}
            </h2>
            <p className="mt-1 text-pizarra">{tecnologia.descripcion}</p>
          </div>
          <Ilustracion nombre={tecnologia.ilustracion} className="mx-auto h-auto w-full max-w-sm" />
        </div>
        <Suspense fallback={<div className="h-80" aria-busy="true" />}>
          <RutasActivas areas={tecnologia.areas} />
        </Suspense>
      </section>

      <h2 className="mt-14 text-xl font-bold tracking-[-0.02em]">Próximamente</h2>
      <ul className="mt-4 grid gap-4 sm:grid-cols-3">
        {proximas.map((s) => (
          <li key={s.id} className="flex items-center gap-4 rounded-3xl border border-dashed border-linea bg-blanco p-4">
            <span className="w-28 shrink-0 rounded-2xl bg-niebla p-2">
              <Ilustracion nombre={s.ilustracion} className="h-auto w-full opacity-60 grayscale" />
            </span>
            <span>
              <span className="block font-extrabold">{s.titulo}</span>
              <span className="mt-0.5 block text-sm leading-snug text-pizarra">{s.descripcion}</span>
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

async function RutasActivas({ areas }: { areas: readonly string[] }) {
  const proyectos = await obtenerProyectos().catch(() => []);
  const rutas = RUTAS.filter((r) => areas.includes(r.area));
  return (
    <ul className="divide-y divide-linea">
      {rutas.map((r) => {
        const ids = proyectos.filter((p) => p.ruta === r.slug).map((p) => p.id);
        return (
          <li key={r.slug}>
            <Link
              href={`/rutas/${r.slug}`}
              className="group flex flex-wrap items-center gap-x-6 gap-y-3 px-6 py-6 transition-colors hover:bg-niebla sm:px-8"
            >
              <div className="min-w-0 flex-[1_1_18rem]">
                <p className="text-xl font-extrabold tracking-[-0.02em] group-hover:text-cobalto">{r.puesto}</p>
                <p className="mt-1 text-sm leading-relaxed text-pizarra">{r.resumen}</p>
                <ol aria-label="Etapas" className="mt-3 flex items-center gap-1.5">
                  {r.etapas.map((e) => (
                    <li key={e.numero} className="flex items-center gap-1.5">
                      <span className="flex h-6 w-6 items-center justify-center rounded-full border border-linea text-[0.7rem] font-bold text-pizarra">
                        {e.numero}
                      </span>
                      <span aria-hidden="true" className="h-px w-4 bg-linea" />
                    </li>
                  ))}
                  <li className="text-xs font-bold text-pizarra">Puesto</li>
                </ol>
              </div>
              <ProgresoRuta proyectos={ids} />
              <IconoChevron className="hidden h-5 w-5 shrink-0 text-pizarra group-hover:text-cobalto sm:block" />
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
