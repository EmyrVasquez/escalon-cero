import Link from "next/link";
import { obtenerRuta } from "@/lib/rutas";
import { fechaLarga } from "@/lib/texto";
import { ETIQUETAS_MODALIDAD, type OportunidadResumen } from "@/lib/tipos";
import { EtiquetaEjemplo, EtiquetaTipo } from "@/components/oportunidades/EtiquetaOportunidad";
import { IconoCalendario, IconoChevron, IconoLugar, IconoMoneda } from "@/components/ui/Iconos";
import { ProgresoRequisitos } from "@/components/oportunidades/ProgresoRequisitos";

/** Una oportunidad dentro de una lista (portada, oportunidades y rutas). */
export function FilaOportunidad({
  oportunidad: o,
  requeridas,
  conResumen = true,
}: {
  oportunidad: OportunidadResumen;
  /** Ids de los proyectos que pide (ver `proyectosRequeridos`). */
  requeridas: string[];
  conResumen?: boolean;
}) {
  const cierre = fechaLarga(o.cierra);
  const cerrada = o.estado === "cerrada";
  const ruta = obtenerRuta(o.ruta);

  return (
    <Link
      href={`/oportunidades/${o.id}`}
      className={`group flex items-start gap-4 px-5 py-5 transition-colors hover:bg-niebla sm:px-6 ${cerrada ? "opacity-70" : ""}`}
    >
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-sm">
          <EtiquetaTipo tipo={o.tipo} />
          <span className="font-semibold">{o.empresa}</span>
          <span className="text-pizarra">{o.rol}</span>
        </div>
        <p className="mt-2 text-lg font-bold leading-snug tracking-[-0.02em]">{o.titulo}</p>
        {conResumen && o.resumen && (
          <p className="mt-1.5 max-w-[72ch] text-sm leading-relaxed text-pizarra">{o.resumen}</p>
        )}
        <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm">
          <span className="inline-flex items-start gap-1.5 font-bold text-tinta">
            <IconoMoneda className="mt-0.5 h-4 w-4 shrink-0 text-cobalto" />
            {o.compensacion}
          </span>
          <span className="inline-flex items-center gap-1.5 text-pizarra">
            <IconoLugar className="h-4 w-4" />
            {ETIQUETAS_MODALIDAD[o.modalidad]}
            {o.ubicacion ? ` · ${o.ubicacion}` : ""}
          </span>
          {cerrada ? (
            <span className="font-semibold text-pizarra">Cerrada</span>
          ) : (
            cierre && (
              <span className="inline-flex items-center gap-1.5 text-pizarra">
                <IconoCalendario className="h-4 w-4" />
                Cierra el {cierre}
              </span>
            )
          )}
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
          {ruta && (
            <span className="text-pizarra">
              Requisito: ruta <span className="font-semibold text-tinta">{ruta.puesto}</span> hasta la etapa{" "}
              {o.etapa_requerida}
            </span>
          )}
          {!cerrada && <ProgresoRequisitos requeridas={requeridas} />}
          {o.es_ejemplo && <EtiquetaEjemplo />}
        </div>
      </div>
      <IconoChevron className="mt-1 h-5 w-5 shrink-0 text-pizarra transition-transform group-hover:translate-x-0.5 group-hover:text-cobalto motion-reduce:transition-none" />
    </Link>
  );
}

export function ListaOportunidadesCargando({ filas = 3 }: { filas?: number }) {
  return (
    <div
      aria-busy="true"
      aria-label="Cargando oportunidades"
      className="animate-pulse rounded-2xl border border-linea bg-blanco motion-reduce:animate-none"
      style={{ height: `${filas * 10}rem` }}
    />
  );
}
