import Link from "next/link";
import { EtiquetaEjemplo, EtiquetaTipo } from "@/components/oportunidades/EtiquetaOportunidad";
import { IconoCalendario } from "@/components/ui/Iconos";
import { Ilustracion } from "@/components/ui/Ilustracion";
import { obtenerRuta } from "@/lib/rutas";
import { fechaLarga } from "@/lib/texto";
import { ETIQUETAS_RETRIBUCION, type OportunidadResumen } from "@/lib/tipos";

/** Tarjeta visual de una oportunidad, para la portada. Las listas largas usan FilaOportunidad. */
export function TarjetaOportunidad({ oportunidad: o }: { oportunidad: OportunidadResumen }) {
  const ruta = obtenerRuta(o.ruta);
  const cierre = fechaLarga(o.cierra);
  return (
    <Link
      href={`/oportunidades/${o.id}`}
      className="group flex h-full flex-col rounded-3xl border border-linea bg-blanco p-6 transition-colors hover:border-cobalto"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-pizarra">
            <span className="text-tinta">{o.empresa}</span>
          </p>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <EtiquetaTipo tipo={o.tipo} />
            {o.es_ejemplo && <EtiquetaEjemplo />}
          </div>
        </div>
        <Ilustracion
          nombre={o.tipo === "reto_con_premio" ? "ficha-reto" : "ficha-encargo"}
          className="h-14 w-auto shrink-0"
        />
      </div>
      <h3 className="mt-4 text-xl font-extrabold leading-snug tracking-[-0.03em] group-hover:text-cobalto">{o.titulo}</h3>
      {o.resumen && <p className="mt-2 text-sm leading-relaxed text-pizarra">{o.resumen}</p>}
      {ruta && (
        <p className="mt-4 inline-flex w-fit rounded-full bg-cielo px-3 py-1 text-xs font-bold text-cobalto">
          Pide: ruta {ruta.puesto}, etapa {o.etapa_requerida}
        </p>
      )}
      <div aria-hidden="true" className="min-h-5 flex-1" />
      <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-3 border-t border-linea pt-4">
        <div className="min-w-0 flex-[1_1_14rem]">
          <p className="text-xs font-semibold text-pizarra">{ETIQUETAS_RETRIBUCION[o.tipo]}</p>
          <p className="mt-0.5 font-bold leading-snug">{o.compensacion}</p>
        </div>
        {cierre && (
          <p className="inline-flex items-center gap-1.5 text-sm text-pizarra">
            <IconoCalendario />
            Cierra el {cierre}
          </p>
        )}
      </div>
    </Link>
  );
}
