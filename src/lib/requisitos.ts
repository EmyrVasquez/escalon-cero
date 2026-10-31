import type { OportunidadResumen, ProyectoResumen } from "./tipos";

/**
 * Proyectos que pide una oportunidad: los de su ruta, desde la etapa 1 hasta
 * la etapa requerida, en orden de etapa. La base de datos aplica la misma
 * regla al postular (función `cumple_requisitos`).
 */
export function proyectosRequeridos<T extends Pick<ProyectoResumen, "id" | "ruta" | "etapa" | "nivel">>(
  oportunidad: Pick<OportunidadResumen, "ruta" | "etapa_requerida">,
  proyectos: T[],
): T[] {
  if (!oportunidad.ruta) return [];
  return proyectos
    .filter((p) => p.ruta === oportunidad.ruta && p.etapa != null && p.etapa <= oportunidad.etapa_requerida)
    .sort((a, b) => (a.etapa ?? 0) - (b.etapa ?? 0) || (a.nivel === b.nivel ? 0 : a.nivel === "inicial" ? -1 : 1));
}

/** Proyectos de una ruta agrupados por etapa (1, 2 y 3). */
export function proyectosPorEtapa<T extends Pick<ProyectoResumen, "ruta" | "etapa" | "nivel">>(
  ruta: string,
  proyectos: T[],
): Record<1 | 2 | 3, T[]> {
  const grupos: Record<1 | 2 | 3, T[]> = { 1: [], 2: [], 3: [] };
  for (const p of proyectos) {
    if (p.ruta === ruta && (p.etapa === 1 || p.etapa === 2 || p.etapa === 3)) grupos[p.etapa].push(p);
  }
  for (const e of [1, 2, 3] as const) {
    grupos[e].sort((a, b) => (a.nivel === b.nivel ? 0 : a.nivel === "inicial" ? -1 : 1));
  }
  return grupos;
}
