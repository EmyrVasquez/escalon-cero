import {
  DESCRIPCION_OPORTUNIDAD_EJEMPLO,
  DESCRIPCION_TIPO_OPORTUNIDAD,
  ETIQUETA_OPORTUNIDAD_EJEMPLO,
  ETIQUETAS_TIPO_OPORTUNIDAD,
  type TipoOportunidad,
} from "@/lib/tipos";

const ESTILOS: Record<TipoOportunidad, string> = {
  experiencia_empresa: "bg-cobalto text-blanco",
  reto_con_premio: "bg-tinta text-lima",
};

/** Tipo de oportunidad: experiencia con empresa o reto con premio. */
export function EtiquetaTipo({ tipo }: { tipo: TipoOportunidad }) {
  return (
    <span
      title={DESCRIPCION_TIPO_OPORTUNIDAD[tipo]}
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold ${ESTILOS[tipo]}`}
    >
      {ETIQUETAS_TIPO_OPORTUNIDAD[tipo]}
    </span>
  );
}

/** Aviso obligatorio en las oportunidades con empresa ficticia. */
export function EtiquetaEjemplo({ conDescripcion = false }: { conDescripcion?: boolean }) {
  return (
    <span className="inline-flex flex-wrap items-center gap-2">
      <span
        title={DESCRIPCION_OPORTUNIDAD_EJEMPLO}
        className="inline-flex items-center rounded-md border border-linea bg-blanco px-2 py-0.5 text-xs font-semibold text-pizarra"
      >
        {ETIQUETA_OPORTUNIDAD_EJEMPLO}
      </span>
      {conDescripcion && <span className="text-xs text-pizarra">{DESCRIPCION_OPORTUNIDAD_EJEMPLO}</span>}
    </span>
  );
}
