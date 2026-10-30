import {
  DESCRIPCION_VERACIDAD,
  ETIQUETA_VALIDADO_EMPRESA,
  ETIQUETAS_VERACIDAD,
  type TipoVeracidad,
} from "@/lib/tipos";

const ESTILOS: Record<TipoVeracidad, string> = {
  real_anonimizado: "border-cobalto/30 bg-cielo text-cobalto-hondo",
  basado_en_hechos: "border-cobalto/30 bg-cielo text-cobalto-hondo",
  ilustrativo: "border-linea bg-blanco text-pizarra",
};

export function EtiquetaVeracidad({
  tipo,
  validado = false,
  conDescripcion = false,
}: {
  tipo: TipoVeracidad;
  validado?: boolean;
  conDescripcion?: boolean;
}) {
  return (
    <span className="inline-flex flex-wrap items-center gap-2">
      <span
        title={DESCRIPCION_VERACIDAD[tipo]}
        className={`inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-semibold ${ESTILOS[tipo]}`}
      >
        {ETIQUETAS_VERACIDAD[tipo]}
      </span>
      {validado && (
        <span className="inline-flex items-center gap-1 rounded-md bg-lima px-2 py-0.5 text-xs font-semibold text-tinta">
          <svg viewBox="0 0 16 16" className="h-3.5 w-3.5" aria-hidden="true">
            <path
              d="M3.5 8.5l3 3 6-7"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          {ETIQUETA_VALIDADO_EMPRESA}
        </span>
      )}
      {conDescripcion && (
        <span className="text-xs text-pizarra">{DESCRIPCION_VERACIDAD[tipo]}</span>
      )}
    </span>
  );
}
