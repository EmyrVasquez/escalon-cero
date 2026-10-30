import { cache } from "react";
import { supabase } from "./supabase";
import type { Oportunidad, OportunidadResumen } from "./tipos";

const CAMPOS_RESUMEN =
  "id, titulo, empresa, sector, tipo, carrera, rol, resumen, compensacion, modalidad, ubicacion, dedicacion, cierra, ruta, etapa_requerida, es_ejemplo, destacada, estado";

const CAMPOS_COMPLETOS = `${CAMPOS_RESUMEN}, descripcion, que_haras, requisitos, cupos`;

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** Oportunidades publicadas: primero las abiertas y destacadas, luego por fecha de cierre. */
export const obtenerOportunidades = cache(async (): Promise<OportunidadResumen[]> => {
  const { data, error } = await supabase
    .from("oportunidades")
    .select(CAMPOS_RESUMEN)
    .in("estado", ["abierta", "cerrada"])
    .order("estado", { ascending: true })
    .order("destacada", { ascending: false })
    .order("cierra", { ascending: true, nullsFirst: false });

  if (error) throw new Error(`No se pudieron cargar las oportunidades: ${error.message}`);
  return (data ?? []) as OportunidadResumen[];
});

export const obtenerOportunidad = cache(async (id: string): Promise<Oportunidad | null> => {
  if (!UUID.test(id)) return null;

  const { data, error } = await supabase
    .from("oportunidades")
    .select(CAMPOS_COMPLETOS)
    .eq("id", id)
    .in("estado", ["abierta", "cerrada"])
    .maybeSingle();

  if (error) throw new Error(`No se pudo cargar la oportunidad: ${error.message}`);
  return (data as Oportunidad | null) ?? null;
});

/** Oportunidades abiertas para las que cuenta un proyecto de cierta ruta y etapa. */
export async function oportunidadesQuePiden(proyecto: {
  ruta: string | null;
  etapa: number | null;
}): Promise<OportunidadResumen[]> {
  if (!proyecto.ruta || proyecto.etapa == null) return [];
  const todas = await obtenerOportunidades();
  return todas.filter(
    (o) => o.estado === "abierta" && o.ruta === proyecto.ruta && proyecto.etapa! <= o.etapa_requerida,
  );
}
