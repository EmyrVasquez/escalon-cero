"use client";

import Link from "next/link";
import { etiquetaArea } from "@/lib/carreras";
import { useBorradores } from "@/lib/useAlmacenamiento";
import { IconoChevron } from "./Iconos";

export function MiPracticaVista() {
  const borradores = useBorradores();

  if (borradores === undefined) {
    return <div className="mt-8 h-40 rounded-2xl border border-linea bg-blanco" aria-hidden="true" />;
  }

  const lista = Object.values(borradores)
    .filter((b) => b.solucion.trim() || b.enlace.trim())
    .sort((a, b) => b.actualizado.localeCompare(a.actualizado));

  if (lista.length === 0) {
    return (
      <div className="mt-8 rounded-3xl border border-dashed border-linea bg-blanco p-8">
        <h2 className="text-lg font-bold">Todavía no empiezas ninguna práctica</h2>
        <p className="mt-2 max-w-[55ch] leading-relaxed text-pizarra">
          Elige un encargo, empieza a escribir tu solución y vuelve aquí cuando
          quieras continuarla.
        </p>
        <Link
          href="/explorar"
          className="mt-5 inline-flex rounded-xl bg-cobalto px-6 py-3 font-bold text-blanco hover:bg-cobalto-hondo"
        >
          Explorar prácticas
        </Link>
      </div>
    );
  }

  return (
    <ul className="mt-8 divide-y divide-linea overflow-hidden rounded-2xl border border-linea bg-blanco">
      {lista.map((b) => (
        <li key={b.practicaId}>
          <Link
            href={`/practicas/${b.practicaId}`}
            className="group flex flex-wrap items-center gap-x-6 gap-y-4 px-5 py-5 hover:bg-niebla sm:flex-nowrap sm:px-6"
          >
            <div className="min-w-0 flex-[1_1_20rem]">
              <p className="text-sm font-semibold text-cobalto">{etiquetaArea(b.area)}</p>
              <p className="mt-1 text-lg font-bold tracking-[-0.02em]">{b.titulo}</p>
              <p className="mt-1 line-clamp-2 text-sm text-pizarra">
                {b.solucion.trim() || "Solo agregaste un enlace."}
              </p>
            </div>
            <div className="w-full sm:w-56 sm:shrink-0">
              <div className="flex justify-between gap-2 text-[0.82rem] text-pizarra">
                <span>Paso 3 de 4: tu entrega</span>
                <span>50%</span>
              </div>
              <div aria-hidden="true" className="mt-2 h-1.5 overflow-hidden rounded-full bg-cielo">
                <div className="h-full w-1/2 rounded-full bg-cobalto" />
              </div>
              <p className="mt-2 text-xs text-pizarra">
                Editado el{" "}
                {new Date(b.actualizado).toLocaleDateString("es-PE", {
                  day: "numeric",
                  month: "long",
                })}
              </p>
            </div>
            <span className="inline-flex items-center gap-1 text-sm font-bold text-cobalto">
              Continuar
              <IconoChevron className="h-5 w-5 shrink-0" />
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
