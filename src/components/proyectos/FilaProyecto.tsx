import Link from "next/link";
import { etiquetaArea } from "@/lib/areas";
import { ETIQUETAS_NIVEL, type ProyectoResumen } from "@/lib/tipos";
import { EtiquetaVeracidad } from "@/components/proyectos/EtiquetaVeracidad";
import { IconoChevron } from "@/components/ui/Iconos";

/** Un proyecto dentro de una lista (portada, catálogo y rutas). */
export function FilaProyecto({
  proyecto: p,
  conResumen = false,
}: {
  proyecto: ProyectoResumen;
  conResumen?: boolean;
}) {
  return (
    <Link
      href={`/proyectos/${p.id}`}
      className="group flex items-start gap-4 px-5 py-5 transition-colors hover:bg-niebla sm:px-6"
    >
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-cobalto">{etiquetaArea(p.carrera)}</p>
        <p className="mt-1 text-lg font-bold leading-snug tracking-[-0.02em]">{p.titulo}</p>
        {conResumen && p.resumen && (
          <p className="mt-1.5 max-w-[72ch] text-sm leading-relaxed text-pizarra">{p.resumen}</p>
        )}
        <div className="mt-2.5 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-pizarra">
          <span className="font-semibold text-tinta">{p.rol}</span>
          <span>{ETIQUETAS_NIVEL[p.nivel]}</span>
          {p.duracion && <span>{p.duracion}</span>}
          {p.herramientas.length > 0 && <span>{p.herramientas.join(" · ")}</span>}
          <EtiquetaVeracidad tipo={p.tipo_veracidad} validado={p.validado_empresa} />
        </div>
      </div>
      <IconoChevron className="mt-1 h-5 w-5 shrink-0 text-pizarra transition-transform group-hover:translate-x-0.5 group-hover:text-cobalto motion-reduce:transition-none" />
    </Link>
  );
}

export function ListaProyectosCargando({ filas = 3 }: { filas?: number }) {
  return (
    <div
      aria-busy="true"
      aria-label="Cargando proyectos"
      className="animate-pulse rounded-2xl border border-linea bg-blanco motion-reduce:animate-none"
      style={{ height: `${filas * 7.5}rem` }}
    />
  );
}
