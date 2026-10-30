import type { Recurso } from "@/lib/tipos";
import { IconoDescarga } from "./Iconos";

function extension(nombre: string): string {
  const partes = nombre.split(".");
  return partes.length > 1 ? partes.at(-1)!.toUpperCase().slice(0, 4) : "ARCH";
}

/** Archivos para descargar de una práctica. */
export function Recursos({ recursos }: { recursos: Recurso[] }) {
  return (
    <section
      id="recursos"
      aria-labelledby="titulo-recursos"
      className="scroll-mt-6 rounded-2xl border border-linea bg-blanco p-6"
    >
      <h2 id="titulo-recursos" className="text-lg font-bold">
        Recursos para descargar
      </h2>
      <p className="mt-1 text-sm text-pizarra">
        Los datos son ficticios: puedes usarlos y mostrarlos en tu portafolio.
      </p>
      <ul className="mt-3 divide-y divide-linea">
        {recursos.map((r) => (
          <li key={r.url} className="flex flex-wrap items-center gap-x-4 gap-y-3 py-3.5 last:pb-0">
            <span
              aria-hidden="true"
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[10px] bg-cielo text-[0.68rem] font-extrabold text-cobalto-hondo"
            >
              {extension(r.nombre)}
            </span>
            <div className="min-w-0 flex-[1_1_14rem]">
              <p className="break-all font-bold">{r.nombre}</p>
              {r.descripcion && <p className="mt-0.5 text-sm text-pizarra">{r.descripcion}</p>}
            </div>
            <a
              href={r.url}
              download
              aria-label={`Descargar ${r.nombre}`}
              className="inline-flex items-center gap-1.5 rounded-[10px] border border-linea px-3.5 py-2.5 text-sm font-bold transition-colors hover:border-tinta"
            >
              <IconoDescarga />
              Descargar
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}
