"use client";

import { useSesion } from "@/lib/sesion";
import { IconoCandado, IconoHecho, IconoMaletin } from "@/components/ui/Iconos";

export interface NodoEtapa {
  numero: number;
  titulo: string;
  proyectos: string[];
  oportunidades: number;
}

type Estado = "completa" | "en-curso" | "pendiente" | "sin-proyectos";

/**
 * Vista general de la ruta: las tres etapas y la meta, unidas como un camino.
 * Cada nodo lleva a su etapa en la página y muestra el avance de la persona.
 */
export function MapaRuta({ etapas, puesto }: { etapas: NodoEtapa[]; puesto: string }) {
  const { portafolio } = useSesion();

  function estado(e: NodoEtapa): Estado {
    if (e.proyectos.length === 0) return "sin-proyectos";
    const hechos = e.proyectos.filter((id) => portafolio?.some((x) => x.proyectoId === id && x.valida)).length;
    if (hechos === e.proyectos.length) return "completa";
    return hechos > 0 ? "en-curso" : "pendiente";
  }

  const ESTILO: Record<Estado, string> = {
    completa: "border-cobalto bg-cobalto text-blanco",
    "en-curso": "border-cobalto bg-cielo text-tinta",
    pendiente: "border-linea bg-blanco text-tinta",
    "sin-proyectos": "border-dashed border-linea bg-niebla text-pizarra",
  };
  const DETALLE: Record<Estado, string> = {
    completa: "Completada",
    "en-curso": "En curso",
    pendiente: "Por empezar",
    "sin-proyectos": "Proyectos en preparación",
  };

  return (
    <nav aria-label="Mapa de la ruta" className="mt-10">
      <ol className="relative grid gap-3 md:grid-cols-4 md:gap-0">
        {etapas.map((e) => {
          const est = estado(e);
          return (
            <li key={e.numero} className="relative md:pr-6">
              {/* Conector hacia el siguiente nodo */}
              <span
                aria-hidden="true"
                className="absolute top-full left-7 h-3 w-0.5 bg-linea md:top-7 md:left-auto md:right-0 md:h-0.5 md:w-6"
              />
              <a
                href={`#etapa-${e.numero}`}
                className={`flex h-full flex-col rounded-2xl border-2 p-4 transition-shadow hover:shadow-[0_12px_24px_-16px_rgba(20,33,61,0.5)] ${ESTILO[est]}`}
              >
                <span className="flex items-center gap-2 text-xs font-bold opacity-85">
                  {est === "completa" ? <IconoHecho /> : est === "sin-proyectos" ? <IconoCandado /> : null}
                  Etapa {e.numero} · {DETALLE[est]}
                </span>
                <span className="mt-1.5 font-bold leading-snug">{e.titulo}</span>
                <span className="mt-auto pt-3 text-xs opacity-85">
                  {e.proyectos.length === 1 ? "1 proyecto" : `${e.proyectos.length} proyectos`}
                  {e.oportunidades > 0 &&
                    ` · desbloquea ${e.oportunidades === 1 ? "1 oportunidad" : `${e.oportunidades} oportunidades`}`}
                </span>
              </a>
            </li>
          );
        })}
        <li>
          <a
            href="#meta"
            className="flex h-full flex-col rounded-2xl border-2 border-lima bg-lima p-4 text-tinta"
          >
            <span className="flex items-center gap-2 text-xs font-bold">
              <IconoMaletin className="h-4 w-4" />
              Meta
            </span>
            <span className="mt-1.5 font-bold leading-snug">{puesto}</span>
            <span className="mt-auto pt-3 text-xs">Con experiencia que puedes mostrar</span>
          </a>
        </li>
      </ol>
    </nav>
  );
}
