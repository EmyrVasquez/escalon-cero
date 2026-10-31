/**
 * Datos fijos de la vista «Empresa». Todavía no hay cuentas de empresa: esta
 * vista muestra cómo una empresa revisaría postulaciones. Las personas son
 * ficticias y la interfaz lo indica siempre.
 */

export const EMPRESA_DEMO = {
  nombre: "Distribuidora Ruta Sur",
  sector: "Distribución de consumo masivo",
  contacto: "Equipo comercial",
} as const;

export type EstadoPostulante = "nueva" | "en_revision" | "seleccionada";

export const ETIQUETAS_ESTADO_POSTULANTE: Record<EstadoPostulante, string> = {
  nueva: "Nueva",
  en_revision: "En revisión",
  seleccionada: "Seleccionada",
};

export interface PostulanteDemo {
  id: string;
  nombre: string;
  perfil: string;
  correo: string;
  enviada: string;
  estado: EstadoPostulante;
  aciertos: number;
  total: number;
  intentos: number;
  /** Respuesta a cada pregunta del proyecto, por id de pregunta. */
  respuestas: Record<string, { valor: string; correcta: boolean }>;
  /** Lo que le escribió al gerente al entregar el proyecto. */
  explicacion: string;
  /** Mensaje de la postulación. */
  mensaje: string;
  archivo: string;
}

const CORRECTAS = {
  ventas_netas: { valor: "S/ 2 329 351,90", correcta: true },
  devoluciones: { valor: "S/ 79 181,89", correcta: true },
  mes_mayor: { valor: "Diciembre 2025", correcta: true },
  cliente_top: { valor: "Restaurante El Sol", correcta: true },
  clientes_reales: { valor: "55", correcta: true },
};

export const POSTULANTES_DEMO: readonly PostulanteDemo[] = [
  {
    id: "andrea-torres",
    nombre: "Andrea Torres",
    perfil: "Ingeniería Informática · 8.º ciclo",
    correo: "andrea.torres@ejemplo.pe",
    enviada: "2026-10-30",
    estado: "nueva",
    aciertos: 5,
    total: 5,
    intentos: 2,
    respuestas: CORRECTAS,
    explicacion:
      "Separé las notas de crédito para calcular ventas netas y unifiqué a los clientes por RUC: El Sol tenía tres códigos. Antes del directorio revisaría con contabilidad los 6 clientes duplicados para corregirlos en el ERP.",
    mensaje:
      "Me interesa el encargo porque quiero trabajar en sistemas ERP. Puedo dedicarle unas 8 horas por semana durante las dos semanas.",
    archivo: "dashboard_ventas_andrea.pdf",
  },
  {
    id: "diego-paredes",
    nombre: "Diego Paredes",
    perfil: "Ingeniería Industrial · egresado 2026",
    correo: "diego.paredes@ejemplo.pe",
    enviada: "2026-10-29",
    estado: "en_revision",
    aciertos: 4,
    total: 5,
    intentos: 1,
    respuestas: { ...CORRECTAS, cliente_top: { valor: "Restaurante Doña Rosa", correcta: false } },
    explicacion:
      "Resté las devoluciones y armé las vistas por mes, zona y vendedor. Le advertiría al gerente que diciembre explica casi el 15 % del año por la campaña navideña.",
    mensaje: "Trabajo con Excel y Power BI en mis cursos; este sería mi primer encargo para una empresa.",
    archivo: "tablero_ventas_diego.pbix",
  },
  {
    id: "valeria-chavez",
    nombre: "Valeria Chávez",
    perfil: "Ingeniería de Sistemas · 9.º ciclo",
    correo: "valeria.chavez@ejemplo.pe",
    enviada: "2026-10-28",
    estado: "seleccionada",
    aciertos: 5,
    total: 5,
    intentos: 1,
    respuestas: CORRECTAS,
    explicacion:
      "Limpié la base antes de modelar: notas de crédito aparte y clientes por RUC. Dejé una medida de ventas netas y otra de ticket promedio, y una nota con los códigos duplicados para el equipo de sistemas.",
    mensaje: "Me gustaría sumar este caso a mi portafolio y aprender cómo usan el ERP en una distribuidora.",
    archivo: "dashboard_ventas_valeria.png",
  },
];

export function obtenerPostulanteDemo(id: string): PostulanteDemo | undefined {
  return POSTULANTES_DEMO.find((p) => p.id === id);
}
