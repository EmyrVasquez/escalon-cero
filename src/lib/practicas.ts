import { cache } from "react";
import { supabase } from "./supabase";
import type { Practica, PracticaResumen } from "./tipos";

const CAMPOS_RESUMEN =
  "id, titulo, carrera, rol, resumen, nivel, duracion, tipo_veracidad, validado_empresa, destacada, herramientas, ruta, etapa";

const CAMPOS_COMPLETOS = `${CAMPOS_RESUMEN}, sector, contexto, encargo, complicacion, pregunta, materiales, habilidades, entregables, criterios, requisitos, recursos, referencia, enlace_obligatorio, lo_que_hice, que_paso, aprendizaje, autor_alias`;

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export const obtenerPracticas = cache(async (): Promise<PracticaResumen[]> => {
  const { data, error } = await supabase
    .from("casos")
    .select(CAMPOS_RESUMEN)
    .eq("estado", "aprobado")
    .order("destacada", { ascending: false })
    .order("created_at", { ascending: true });

  if (error) throw new Error(`No se pudieron cargar las prácticas: ${error.message}`);
  return (data ?? []) as PracticaResumen[];
});

export const obtenerPractica = cache(async (id: string): Promise<Practica | null> => {
  if (!UUID.test(id)) return null;

  const { data, error } = await supabase
    .from("casos")
    .select(CAMPOS_COMPLETOS)
    .eq("id", id)
    .eq("estado", "aprobado")
    .maybeSingle();

  if (error) throw new Error(`No se pudo cargar la práctica: ${error.message}`);
  return (data as Practica | null) ?? null;
});
