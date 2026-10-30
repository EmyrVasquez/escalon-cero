import type { Carrera } from "./carreras";

export type TipoVeracidad = "real_anonimizado" | "basado_en_hechos" | "ilustrativo";
export type EstadoCaso = "pendiente" | "aprobado" | "rechazado";
export type TipoReaccion =
  | "me_sirvio"
  | "no_me_sirvio"
  | "me_paso_algo_parecido"
  | "no_suele_pasar";

export interface Caso {
  id: string;
  created_at: string;
  titulo: string;
  carrera: Carrera;
  rol: string;
  sector: string | null;
  contexto: string;
  encargo: string;
  complicacion: string;
  pregunta: string;
  lo_que_hice: string;
  que_paso: string;
  aprendizaje: string;
  tipo_veracidad: TipoVeracidad;
  validado_empresa: boolean;
  autor_alias: string | null;
  estado: EstadoCaso;
}

export interface Respuesta {
  id: string;
  caso_id: string;
  respuesta: string;
  carrera_estudiante: string | null;
  created_at: string;
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
  p_carrera: Carrera;
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
  basado_en_hechos: "Basado en hechos reales (detalles modificados)",
  ilustrativo: "Ejemplo ilustrativo",
};

export const ETIQUETA_VALIDADO_EMPRESA = "Validado por la empresa";

export const ETIQUETAS_REACCION: Record<TipoReaccion, string> = {
  me_sirvio: "Me sirvió",
  no_me_sirvio: "No me sirvió",
  me_paso_algo_parecido: "Me pasó algo parecido",
  no_suele_pasar: "No suele pasar así",
};
