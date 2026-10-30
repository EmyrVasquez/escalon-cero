export const FAMILIAS = [
  { valor: "tecnologia", etiqueta: "Tecnología" },
  { valor: "negocios", etiqueta: "Negocios" },
  { valor: "creatividad", etiqueta: "Diseño y comunicación" },
] as const;

export type Familia = (typeof FAMILIAS)[number]["valor"];

export const AREAS = [
  {
    valor: "software",
    etiqueta: "Ingeniería de software",
    familia: "tecnologia",
    descripcion: "Desarrollo, QA y soporte",
  },
  {
    valor: "datos",
    etiqueta: "Análisis de datos",
    familia: "tecnologia",
    descripcion: "Reportes, limpieza y hallazgos",
  },
  {
    valor: "erp",
    etiqueta: "Sistemas empresariales (ERP)",
    familia: "tecnologia",
    descripcion: "Implementación, reportes y procesos de negocio",
  },
  {
    valor: "marketing",
    etiqueta: "Marketing digital",
    familia: "negocios",
    descripcion: "Campañas, contenido y métricas",
  },
  {
    valor: "contabilidad",
    etiqueta: "Contabilidad y finanzas",
    familia: "negocios",
    descripcion: "Conciliaciones y cierres",
  },
  {
    valor: "diseno",
    etiqueta: "Diseño",
    familia: "creatividad",
    descripcion: "Piezas gráficas y producto",
  },
] as const satisfies readonly { valor: string; etiqueta: string; familia: Familia; descripcion: string }[];

/** Áreas anunciadas que todavía no tienen valor en la base de datos. */
export const AREAS_EN_CAMINO: readonly { etiqueta: string; familia: Familia }[] = [
  { etiqueta: "Administración", familia: "negocios" },
  { etiqueta: "Comunicación audiovisual", familia: "creatividad" },
];

export type Area = (typeof AREAS)[number]["valor"];

export function etiquetaArea(valor: string): string {
  return AREAS.find((a) => a.valor === valor)?.etiqueta ?? valor;
}

export function esArea(valor: string | undefined): valor is Area {
  return AREAS.some((a) => a.valor === valor);
}
