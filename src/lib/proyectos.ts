import { cache } from "react";
import { supabase } from "./supabase";
import type { Proyecto, ProyectoResumen } from "./tipos";

const CAMPOS_RESUMEN =
  "id, titulo, carrera, rol, resumen, nivel, duracion, tipo_veracidad, validado_empresa, destacada, herramientas, ruta, etapa, comprobacion";

const CAMPOS_COMPLETOS = `${CAMPOS_RESUMEN}, sector, contexto, encargo, complicacion, pregunta, materiales, habilidades, entregables, criterios, requisitos, recursos, referencia, enlace_obligatorio, lo_que_hice, que_paso, aprendizaje, autor_alias`;

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export const obtenerProyectos = cache(async (): Promise<ProyectoResumen[]> => {
  const { data, error } = await supabase
    .from("casos")
    .select(CAMPOS_RESUMEN)
    .eq("estado", "aprobado")
    .order("destacada", { ascending: false })
    .order("created_at", { ascending: true });

  if (error) throw new Error(`No se pudieron cargar los proyectos: ${error.message}`);
  return (data ?? []) as ProyectoResumen[];
});

export const obtenerProyecto = cache(async (id: string): Promise<Proyecto | null> => {
  if (!UUID.test(id)) return null;

  const { data, error } = await supabase
    .from("casos")
    .select(CAMPOS_COMPLETOS)
    .eq("id", id)
    .eq("estado", "aprobado")
    .maybeSingle();

  if (error) throw new Error(`No se pudo cargar el proyecto: ${error.message}`);
  return (data as Proyecto | null) ?? null;
});
