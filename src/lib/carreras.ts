export const CARRERAS = [
  { valor: "informatica", etiqueta: "Ingeniería Informática y Software" },
  { valor: "contabilidad-administracion", etiqueta: "Contabilidad y Administración" },
  { valor: "marketing-publicidad", etiqueta: "Marketing y Publicidad" },
  { valor: "diseno-grafico", etiqueta: "Diseño Gráfico" },
  { valor: "transversal", etiqueta: "Para todas las carreras" },
] as const;

export type Carrera = (typeof CARRERAS)[number]["valor"];

export function etiquetaCarrera(valor: string): string {
  return CARRERAS.find((c) => c.valor === valor)?.etiqueta ?? valor;
}
