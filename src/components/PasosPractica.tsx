"use client";

import { useBorradores, usePortafolio } from "@/lib/useAlmacenamiento";
import { IconoCandado, IconoHecho } from "./Iconos";

type Estado = "hecho" | "actual" | "pendiente" | "bloqueado";

/**
 * Avance dentro de un proyecto, como las unidades de un módulo.
 * Se calcula con el progreso de la cuenta: borrador y portafolio.
 */
export function PasosPractica({
  practicaId,
  conRecursos,
}: {
  practicaId: string;
  conRecursos: boolean;
}) {
  const borradores = useBorradores();
  const portafolio = usePortafolio();
  const entregado = !!portafolio?.some((e) => e.practicaId === practicaId);
  const borrador = borradores?.[practicaId];
  const escribiendo = !!(borrador?.solucion.trim() || borrador?.enlace.trim());

  const actual = entregado ? 5 : escribiendo ? 3 : 2;
  const hechos = Math.min(actual - 1, 4);

  const pasos: { titulo: string; href?: string; estado: Estado; detalle: string }[] = [
    { titulo: "Lee el encargo", href: "#encargo", estado: "hecho", detalle: "Completado" },
    {
      titulo: conRecursos ? "Descarga los recursos" : "Revisa con qué cuentas",
      href: conRecursos ? "#recursos" : "#encargo",
      estado: actual > 2 ? "hecho" : "actual",
      detalle: actual > 2 ? "Completado" : "Estás aquí",
    },
    {
      titulo: "Entrega tu solución",
      href: "#entrega",
      estado: actual > 3 ? "hecho" : actual === 3 ? "actual" : "pendiente",
      detalle: actual > 3 ? "Completado" : actual === 3 ? "Borrador guardado" : "Pendiente",
    },
    entregado
      ? { titulo: "Descubre qué pasó", href: "#desenlace", estado: "hecho", detalle: "Desbloqueado" }
      : { titulo: "Descubre qué pasó", estado: "bloqueado", detalle: "Se desbloquea al entregar" },
  ];

  return (
    <section aria-labelledby="titulo-pasos" className="rounded-2xl border border-linea bg-blanco p-6">
      <div className="flex items-baseline justify-between gap-3">
        <h2 id="titulo-pasos" className="font-bold">
          Pasos del proyecto
        </h2>
        <span className="text-sm text-pizarra">
          {hechos} de 4 completados
        </span>
      </div>
      <div aria-hidden="true" className="mt-3 h-1.5 overflow-hidden rounded-full bg-cielo">
        <div
          className="h-full rounded-full bg-cobalto transition-[width] duration-500 motion-reduce:transition-none"
          style={{ width: `${hechos * 25}%` }}
        />
      </div>
      <ol className="mt-4 space-y-1">
        {pasos.map((paso, i) => {
          const contenido = (
            <>
              <Marca estado={paso.estado} numero={i + 1} />
              <span>
                <span className={`block text-sm ${paso.estado === "actual" ? "font-bold" : "font-semibold"}`}>
                  {paso.titulo}
                </span>
                <span className={`block text-xs ${paso.estado === "actual" ? "text-cobalto-hondo" : "text-pizarra"}`}>
                  {paso.detalle}
                </span>
              </span>
            </>
          );
          const clase = `-mx-2.5 flex items-start gap-3 rounded-xl px-2.5 py-2 ${
            paso.estado === "actual" ? "bg-cielo" : ""
          }`;
          return (
            <li key={paso.titulo}>
              {paso.href ? (
                <a
                  href={paso.href}
                  aria-current={paso.estado === "actual" ? "step" : undefined}
                  className={`${clase} hover:bg-niebla`}
                >
                  {contenido}
                </a>
              ) : (
                <div className={`${clase} text-pizarra`}>{contenido}</div>
              )}
            </li>
          );
        })}
      </ol>
    </section>
  );
}

function Marca({ estado, numero }: { estado: Estado; numero: number }) {
  const base = "flex h-[26px] w-[26px] shrink-0 items-center justify-center rounded-full text-xs font-bold";
  if (estado === "hecho")
    return (
      <span aria-hidden="true" className={`${base} bg-cobalto text-blanco`}>
        <IconoHecho />
      </span>
    );
  if (estado === "bloqueado")
    return (
      <span aria-hidden="true" className={`${base} bg-niebla text-pizarra`}>
        <IconoCandado />
      </span>
    );
  return (
    <span
      aria-hidden="true"
      className={`${base} ${
        estado === "actual" ? "border-2 border-cobalto bg-blanco text-cobalto" : "border border-linea text-pizarra"
      }`}
    >
      {numero}
    </span>
  );
}
