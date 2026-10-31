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

/**
 * Áreas abiertas en el piloto: solo tecnología. Las demás se ven como
 * «Próximamente» y sus proyectos y oportunidades no se listan, aunque sigan
 * en la base de datos. Para abrir un área, agrégala aquí.
 */
export const AREAS_ACTIVAS: readonly Area[] = ["software", "datos", "erp"];

export function areaActiva(valor: string | null | undefined): boolean {
  return AREAS_ACTIVAS.includes(valor as Area);
}

/** Ilustración de cada tipo de trabajo, en `public/ilustraciones/`. */
export type Ilustracion = "trabajo-web" | "trabajo-analisis" | "trabajo-diseno" | "trabajo-comunicacion";

/** Grandes grupos que se muestran en la portada y en /rutas. */
export const SECCIONES: readonly {
  id: string;
  titulo: string;
  descripcion: string;
  ilustracion: Ilustracion;
  areas: readonly Area[];
  activa: boolean;
}[] = [
  {
    id: "tecnologia",
    titulo: "Tecnología",
    descripcion: "Sistemas ERP, análisis de datos y pruebas de software.",
    ilustracion: "trabajo-analisis",
    areas: ["erp", "datos", "software"],
    activa: true,
  },
  {
    id: "diseno",
    titulo: "Diseño",
    descripcion: "Identidad visual y piezas gráficas.",
    ilustracion: "trabajo-diseno",
    areas: ["diseno"],
    activa: false,
  },
  {
    id: "comunicacion",
    titulo: "Comunicación y marketing",
    descripcion: "Campañas y contenidos para organizaciones.",
    ilustracion: "trabajo-comunicacion",
    areas: ["marketing"],
    activa: false,
  },
  {
    id: "negocios",
    titulo: "Negocios y finanzas",
    descripcion: "Contabilidad, finanzas y administración.",
    ilustracion: "trabajo-web",
    areas: ["contabilidad"],
    activa: false,
  },
];

export function ilustracionDeArea(valor: string | null | undefined): Ilustracion {
  if (valor === "software") return "trabajo-web";
  return SECCIONES.find((s) => s.areas.includes(valor as Area))?.ilustracion ?? "trabajo-web";
}
