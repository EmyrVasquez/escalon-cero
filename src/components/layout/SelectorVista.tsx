"use client";

import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { useMontado } from "@/lib/montado";
import { useSesion } from "@/lib/sesion";

type Vista = "general" | "estudiante" | "empresa";

const VISTAS: { vista: Vista; etiqueta: string; descripcion: string }[] = [
  { vista: "general", etiqueta: "General", descripcion: "Ver la página como cualquier visitante" },
  { vista: "estudiante", etiqueta: "Estudiante", descripcion: "Ver como una estudiante con sesión iniciada" },
  { vista: "empresa", etiqueta: "Empresa", descripcion: "Ver el panel de una empresa de ejemplo" },
];

/**
 * Selector de vista para la demo, como en el prototipo del equipo.
 * - General: la web pública. Si estaba la cuenta de ejemplo, cierra su sesión.
 * - Estudiante: abre una cuenta de ejemplo con sesión iniciada (o la cuenta propia, si ya ingresaste).
 * - Empresa: el panel de una empresa de ejemplo (datos fijos, sin cuenta).
 */
export function SelectorVista() {
  const ruta = usePathname() ?? "/";
  const router = useRouter();
  const sesion = useSesion();
  const montado = useMontado();
  const usuario = montado ? sesion.usuario : undefined;
  const esDemo = montado && sesion.esDemo;
  const { entrarComoDemo, cerrarSesion } = sesion;
  const [ocupado, setOcupado] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const actual: Vista = ruta.startsWith("/empresa")
    ? "empresa"
    : esDemo || ruta.startsWith("/mi-espacio")
      ? "estudiante"
      : "general";

  async function cambiar(vista: Vista) {
    if (ocupado) return;
    setError(null);
    if (vista === "empresa") return router.push("/empresa");
    if (vista === "general") {
      if (esDemo) {
        setOcupado(true);
        await cerrarSesion();
        setOcupado(false);
      }
      return router.push("/");
    }
    if (!usuario) {
      setOcupado(true);
      const fallo = await entrarComoDemo();
      setOcupado(false);
      if (fallo) return setError(fallo);
    }
    router.push("/mi-espacio");
  }

  return (
    <div className="no-imprimir mx-auto w-full max-w-6xl px-4 pt-3 sm:px-6">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
        <span className="text-xs font-bold uppercase tracking-[0.08em] text-pizarra">
          {esDemo ? "Demo" : "Vista"}
        </span>
        <div role="group" aria-label="Cambiar vista" className="inline-flex rounded-full border border-linea bg-blanco p-1">
          {VISTAS.map((v) => (
            <button
              key={v.vista}
              type="button"
              aria-pressed={actual === v.vista}
              title={v.descripcion}
              disabled={ocupado || usuario === undefined}
              onClick={() => void cambiar(v.vista)}
              className={`rounded-full px-4 py-1.5 text-sm font-bold transition-colors disabled:cursor-wait ${
                actual === v.vista ? "bg-tinta text-blanco" : "text-pizarra hover:text-tinta"
              }`}
            >
              {v.etiqueta}
            </button>
          ))}
        </div>
        {ocupado && <span className="text-sm text-pizarra" role="status">Preparando la vista…</span>}
        {error && (
          <span role="alert" className="text-sm font-semibold text-alerta">
            {error}
          </span>
        )}
      </div>
    </div>
  );
}
