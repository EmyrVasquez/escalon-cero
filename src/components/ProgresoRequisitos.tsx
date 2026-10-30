"use client";

import { useSesion } from "@/lib/sesion";
import { plural } from "@/lib/texto";
import { IconoCandado, IconoHecho } from "./Iconos";

/** Cuántos de los proyectos que pide una oportunidad ya entregó la persona. */
export function ProgresoRequisitos({ requeridas }: { requeridas: string[] }) {
  const { usuario, portafolio } = useSesion();

  if (requeridas.length === 0) return null;
  // Sin sesión (o mientras carga) solo se informa cuántos pide.
  if (!usuario || portafolio === undefined) {
    return (
      <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-pizarra">
        <IconoCandado />
        Pide {plural(requeridas.length, "proyecto", "proyectos")}
      </span>
    );
  }

  const hechas = requeridas.filter((id) => portafolio.some((e) => e.practicaId === id)).length;
  if (hechas === requeridas.length) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-lima px-2.5 py-0.5 text-sm font-bold text-tinta">
        <IconoHecho />
        Ya puedes postular
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-pizarra">
      <IconoCandado />
      {hechas} de {plural(requeridas.length, "proyecto hecho", "proyectos hechos")}
    </span>
  );
}
