import type { Area } from "./carreras";

export type TipoVeracidad = "real_anonimizado" | "basado_en_hechos" | "ilustrativo";
export type EstadoCaso = "pendiente" | "aprobado" | "rechazado";
export type Nivel = "inicial" | "intermedio";
export type TipoReaccion =
  | "me_sirvio"
  | "no_me_sirvio"
  | "me_paso_algo_parecido"
  | "no_suele_pasar";

/** Archivo que acompaña una práctica (recurso o solución de referencia). */
export interface Recurso {
  nombre: string;
  descripcion?: string | null;
  url: string;
}

/** Datos de una práctica que se muestran en listas. */
export interface PracticaResumen {
  id: string;
  titulo: string;
  carrera: Area;
  rol: string;
  resumen: string | null;
  nivel: Nivel;
  duracion: string | null;
  tipo_veracidad: TipoVeracidad;
  validado_empresa: boolean;
  destacada: boolean;
  herramientas: string[];
}

/** Práctica completa, incluido el desenlace real. */
export interface Practica extends PracticaResumen {
  sector: string | null;
  contexto: string;
  encargo: string;
  complicacion: string;
  pregunta: string;
  materiales: string | null;
  habilidades: string[];
  entregables: string[];
  criterios: string[];
  requisitos: string[];
  recursos: Recurso[];
  /** Solución de referencia: se muestra solo después de entregar. */
  referencia: Recurso | null;
  /** La entrega principal es un enlace (dashboard, diseño, repositorio). */
  enlace_obligatorio: boolean;
  lo_que_hice: string;
  que_paso: string;
  aprendizaje: string;
  autor_alias: string | null;
}

export interface Reaccion {
  id: string;
  caso_id: string;
  tipo: TipoReaccion;
  created_at: string;
}

/** Parámetros de la función publicar_caso en Supabase. */
export interface NuevoCaso {
  p_titulo: string;
  p_carrera: Area;
  p_rol: string;
  p_sector: string;
  p_contexto: string;
  p_encargo: string;
  p_complicacion: string;
  p_lo_que_hice: string;
  p_que_paso: string;
  p_aprendizaje: string;
  p_tipo_veracidad: TipoVeracidad;
  p_autor_alias: string;
  p_autor_nombre: string;
  p_autor_contacto: string;
  p_consentimiento: boolean;
  p_confirma_sin_confidencial: boolean;
}

export const ETIQUETAS_VERACIDAD: Record<TipoVeracidad, string> = {
  real_anonimizado: "Caso real anonimizado",
  basado_en_hechos: "Basado en hechos reales",
  ilustrativo: "Ejemplo ilustrativo",
};

export const DESCRIPCION_VERACIDAD: Record<TipoVeracidad, string> = {
  real_anonimizado: "Ocurrió así; solo se cambiaron los nombres.",
  basado_en_hechos: "Ocurrió, con detalles modificados por confidencialidad.",
  ilustrativo: "Creado con fines didácticos a partir de situaciones frecuentes.",
};

export const ETIQUETA_VALIDADO_EMPRESA = "Validado por la empresa";

export const ETIQUETAS_NIVEL: Record<Nivel, string> = {
  inicial: "Nivel inicial",
  intermedio: "Nivel intermedio",
};

export const ETIQUETAS_REACCION: Record<TipoReaccion, string> = {
  me_sirvio: "Me sirvió",
  no_me_sirvio: "No me sirvió",
  me_paso_algo_parecido: "Me pasó algo parecido",
  no_suele_pasar: "No suele pasar así",
};
