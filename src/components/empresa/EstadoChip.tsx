import { ETIQUETAS_ESTADO_POSTULANTE, type EstadoPostulante } from "@/lib/empresa-demo";

export function EstadoChip({ estado }: { estado: EstadoPostulante | "descartada" }) {
  const estilo =
    estado === "seleccionada"
      ? "bg-lima text-tinta"
      : estado === "en_revision"
        ? "bg-cielo text-cobalto"
        : estado === "descartada"
          ? "bg-niebla text-pizarra"
          : "bg-tinta text-blanco";
  const texto = estado === "descartada" ? "Descartada" : ETIQUETAS_ESTADO_POSTULANTE[estado];
  return <span className={`rounded-full px-3 py-1 text-xs font-bold ${estilo}`}>{texto}</span>;
}
