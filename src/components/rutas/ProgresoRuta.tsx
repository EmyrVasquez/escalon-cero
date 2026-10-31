"use client";

import { useSesion } from "@/lib/sesion";

/** Barra de avance: proyectos de la ruta ya entregados por la persona. */
export function ProgresoRuta({ proyectos }: { proyectos: string[] }) {
  const { usuario, portafolio } = useSesion();
  if (proyectos.length === 0) return null;

  const hechos = portafolio ? proyectos.filter((id) => portafolio.some((e) => e.proyectoId === id && e.valida)).length : 0;
  const porcentaje = Math.round((hechos / proyectos.length) * 100);

  return (
    <div className="w-full max-w-xs">
      <div className="flex justify-between gap-3 text-sm">
        <span className="font-semibold">Tu avance</span>
        <span className="text-pizarra" aria-live="polite">
          {usuario === null
            ? "Ingresa para guardarlo"
            : portafolio === undefined
              ? " "
              : `${hechos} de ${proyectos.length} proyectos`}
        </span>
      </div>
      <div
        role="progressbar"
        aria-label="Proyectos entregados de esta ruta"
        aria-valuemin={0}
        aria-valuemax={proyectos.length}
        aria-valuenow={hechos}
        className="mt-2 h-2.5 overflow-hidden rounded-full bg-cielo"
      >
        <div className="h-full rounded-full bg-cobalto transition-[width]" style={{ width: `${porcentaje}%` }} />
      </div>
    </div>
  );
}
