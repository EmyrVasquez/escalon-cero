"use client";

import { useEffect, useState } from "react";
import { leerReaccionesPropias, registrarReaccionPropia } from "@/lib/almacenamiento";
import { supabase } from "@/lib/supabase";
import { ETIQUETAS_REACCION, type TipoReaccion } from "@/lib/tipos";

const TIPOS = Object.keys(ETIQUETAS_REACCION) as TipoReaccion[];

export function Reacciones({ practicaId }: { practicaId: string }) {
  const [conteo, setConteo] = useState<Record<string, number>>({});
  const [propias, setPropias] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let vigente = true;
    supabase
      .from("reacciones")
      .select("tipo")
      .eq("caso_id", practicaId)
      .then(({ data }) => {
        if (!vigente || !data) return;
        const nuevo: Record<string, number> = {};
        for (const fila of data) nuevo[fila.tipo] = (nuevo[fila.tipo] ?? 0) + 1;
        setConteo(nuevo);
        setPropias(leerReaccionesPropias()[practicaId] ?? []);
      });
    return () => {
      vigente = false;
    };
  }, [practicaId]);

  async function reaccionar(tipo: TipoReaccion) {
    if (propias.includes(tipo)) return;
    setError(null);
    setPropias((p) => [...p, tipo]);
    setConteo((c) => ({ ...c, [tipo]: (c[tipo] ?? 0) + 1 }));
    const { error: errorSupabase } = await supabase
      .from("reacciones")
      .insert({ caso_id: practicaId, tipo });
    if (errorSupabase) {
      setPropias((p) => p.filter((t) => t !== tipo));
      setConteo((c) => ({ ...c, [tipo]: Math.max(0, (c[tipo] ?? 1) - 1) }));
      setError("No pudimos guardar tu reacción. Vuelve a intentarlo.");
      return;
    }
    registrarReaccionPropia(practicaId, tipo);
  }

  return (
    <section aria-labelledby="titulo-reacciones" className="rounded-3xl border border-linea bg-blanco p-6 sm:p-8">
      <h3 id="titulo-reacciones" className="text-lg font-bold">
        ¿Qué te pareció este caso?
      </h3>
      <div className="mt-4 flex flex-wrap gap-2">
        {TIPOS.map((tipo) => {
          const elegida = propias.includes(tipo);
          return (
            <button
              key={tipo}
              type="button"
              aria-pressed={elegida}
              onClick={() => reaccionar(tipo)}
              className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition-colors ${
                elegida
                  ? "border-tinta bg-tinta text-blanco"
                  : "border-linea bg-blanco text-tinta hover:border-tinta"
              }`}
            >
              {ETIQUETAS_REACCION[tipo]}
              <span className={elegida ? "text-lima" : "text-pizarra"}>{conteo[tipo] ?? 0}</span>
            </button>
          );
        })}
      </div>
      {error && (
        <p role="alert" className="mt-3 text-sm font-semibold text-alerta">
          {error}
        </p>
      )}
    </section>
  );
}
