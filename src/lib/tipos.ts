import type { Area } from "./areas";

export type TipoVeracidad = "real_anonimizado" | "basado_en_hechos" | "ilustrativo";
export type EstadoCaso = "pendiente" | "aprobado" | "rechazado";
export type Nivel = "inicial" | "intermedio";
export type TipoReaccion =
  | "me_sirvio"
  | "no_me_sirvio"
  | "me_paso_algo_parecido"
  | "no_suele_pasar";

/** Archivo que acompaña un proyecto (recurso o solución de referencia). */
export interface Recurso {
  nombre: string;
  descripcion?: string | null;
  url: string;
}

/** Datos de un proyecto que se muestran en listas. */
export interface ProyectoResumen {
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
  /** Ruta a la que pertenece el proyecto (slug de `src/lib/rutas.ts`). */
  ruta: string | null;
  /** Etapa de la ruta, de 1 a 3. */
  etapa: number | null;
  /**
   * Preguntas con cifras que se comprueban al entregar. Si existe, el proyecto
   * solo cuenta como requisito cuando la entrega queda aprobada.
   */
  comprobacion: PreguntaComprobacion[] | null;
}

/** Pregunta pública de la comprobación; la respuesta correcta vive en la base de datos. */
export interface PreguntaComprobacion {
  id: string;
  enunciado: string;
  tipo: "numero" | "opcion";
  unidad?: string;
  ayuda?: string;
  opciones?: { valor: string; etiqueta: string }[];
}

/** Resultado de una pregunta tras comprobar la entrega. */
export interface ResultadoPregunta {
  id: string;
  respuesta: string;
  correcta: boolean;
  /** Qué revisar, solo si la respuesta no es correcta. */
  pista: string | null;
  /** Respuesta correcta y su explicación: solo llegan cuando la entrega se aprueba. */
  esperado?: string;
  explicacion?: string;
}

/** Lo que devuelve la función `comprobar_entrega` de Supabase. */
export interface ResultadoComprobacion {
  aprobada: boolean;
  aciertos: number;
  total: number;
  minimo: number;
  intentos: number;
  detalle: ResultadoPregunta[];
}

/** Proyecto completo, incluido el desenlace real. */
export interface Proyecto extends ProyectoResumen {
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

// -------------------------------------------------------------
// Oportunidades (oferta) y postulaciones (demanda)
// -------------------------------------------------------------

export type TipoOportunidad = "experiencia_empresa" | "reto_con_premio";
export type Modalidad = "remoto" | "presencial" | "hibrido";
export type EstadoOportunidad = "borrador" | "abierta" | "cerrada";

/** Datos de una oportunidad que se muestran en listas. */
export interface OportunidadResumen {
  id: string;
  titulo: string;
  empresa: string;
  sector: string | null;
  tipo: TipoOportunidad;
  carrera: Area;
  rol: string;
  resumen: string | null;
  compensacion: string;
  modalidad: Modalidad;
  ubicacion: string | null;
  dedicacion: string | null;
  cierra: string | null;
  /** Ruta que hay que seguir para postular (slug de `src/lib/rutas.ts`). */
  ruta: string | null;
  /** Se piden los proyectos de la ruta desde la etapa 1 hasta esta. */
  etapa_requerida: number;
  es_ejemplo: boolean;
  destacada: boolean;
  estado: EstadoOportunidad;
}

export interface Oportunidad extends OportunidadResumen {
  descripcion: string;
  que_haras: string[];
  requisitos: string[];
  cupos: number;
}

/** Entrega de un proyecto que se adjunta a una postulación. */
export interface EntregaAdjunta {
  proyecto_id: string;
  titulo: string;
  enlace: string | null;
  solucion: string;
}

export const ETIQUETAS_TIPO_OPORTUNIDAD: Record<TipoOportunidad, string> = {
  experiencia_empresa: "Experiencia con empresa",
  reto_con_premio: "Reto con premio",
};

export const DESCRIPCION_TIPO_OPORTUNIDAD: Record<TipoOportunidad, string> = {
  experiencia_empresa:
    "Un encargo real, sin pago: a cambio recibes una constancia, una carta de recomendación y un caso para tu portafolio.",
  reto_con_premio: "Varias personas lo intentan y la empresa paga a quienes logran el resultado.",
};

/** Cómo se llama lo que se obtiene, según el tipo. */
export const ETIQUETAS_RETRIBUCION: Record<TipoOportunidad, string> = {
  experiencia_empresa: "Lo que obtienes",
  reto_con_premio: "Premio",
};

export const ETIQUETAS_MODALIDAD: Record<Modalidad, string> = {
  remoto: "Remoto",
  presencial: "Presencial",
  hibrido: "Híbrido",
};

export const ETIQUETA_OPORTUNIDAD_EJEMPLO = "Oportunidad de ejemplo";
export const DESCRIPCION_OPORTUNIDAD_EJEMPLO =
  "Empresa ficticia, creada para mostrar cómo funcionará la plataforma.";

// ---------------------------------------------------------------
// Progreso del estudiante (lo que se carga de su cuenta en sesion.tsx)
// ---------------------------------------------------------------

export interface Borrador {
  proyectoId: string;
  titulo: string;
  area: string;
  solucion: string;
  enlace: string;
  /** Respuestas a la comprobación automática, si el proyecto la tiene. */
  respuestas?: Record<string, string>;
  actualizado: string;
}

export interface EntradaPortafolio {
  proyectoId: string;
  titulo: string;
  area: string;
  rol: string;
  herramientas?: string[];
  solucion: string;
  enlace: string;
  criterios: string[];
  criteriosCumplidos: string[];
  entregado: string;
  /** Ruta del archivo subido en el bucket «entregas», si lo hay. */
  archivo?: string | null;
  /** Respuestas a la comprobación automática, por id de pregunta. */
  respuestas?: Record<string, string>;
  /** Resultado de la comprobación automática, si el proyecto la tiene. */
  resultado?: ResultadoComprobacion | null;
  /**
   * Si la entrega cuenta como requisito para postular: siempre en proyectos
   * sin comprobación; en los demás, solo si quedó aprobada.
   */
  valida: boolean;
}

export interface PostulacionEnviada {
  oportunidadId: string;
  titulo: string;
  empresa: string;
  tipo: string;
  compensacion: string;
  proyectos: string[];
  enviada: string;
}
