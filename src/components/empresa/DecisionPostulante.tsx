"use client";

import { useState } from "react";
import { EstadoChip } from "@/components/empresa/EstadoChip";
import type { EstadoPostulante } from "@/lib/empresa-demo";

/** Seleccionar o descartar. En la demo solo cambia en pantalla. */
export function DecisionPostulante({ inicial, nombre }: { inicial: EstadoPostulante; nombre: string }) {
  const [estado, setEstado] = useState<EstadoPostulante | "descartada">(inicial);
  const primerNombre = nombre.split(" ")[0];
  return (
    <section className="rounded-3xl border border-linea bg-blanco p-6">
      <div className="flex items-center justify-between gap-3">
        <h2 className="font-extrabold">Tu decisión</h2>
        <EstadoChip estado={estado} />
      </div>
      <div className="mt-4 grid gap-2">
        <button
          type="button"
          onClick={() => setEstado("seleccionada")}
          disabled={estado === "seleccionada"}
          className="rounded-xl bg-cobalto px-5 py-3 font-bold text-blanco hover:bg-cobalto-hondo disabled:cursor-default disabled:opacity-60"
        >
          Seleccionar a {primerNombre}
        </button>
        <button
          type="button"
          onClick={() => setEstado("descartada")}
          disabled={estado === "descartada"}
          className="rounded-xl border border-linea px-5 py-3 font-bold text-tinta hover:border-tinta disabled:cursor-default disabled:opacity-60"
        >
          Descartar
        </button>
      </div>
      <p className="mt-3 text-xs leading-relaxed text-pizarra" aria-live="polite">
        {estado === "seleccionada"
          ? `Con cuentas reales, aquí le escribiríamos a ${primerNombre} para coordinar.`
          : estado === "descartada"
            ? `${primerNombre} recibiría un aviso amable con su resultado.`
            : "En la demo esta decisión no se guarda."}
      </p>
    </section>
  );
}
