import { AREAS, AREAS_EN_CAMINO, FAMILIAS } from "./carreras";
import type { PracticaResumen } from "./tipos";

export interface EnlaceMenu {
  etiqueta: string;
  href: string;
  conteo: number;
}

export interface DatosMenu {
  familias: { etiqueta: string; areas: EnlaceMenu[]; enCamino: string[] }[];
  roles: EnlaceMenu[];
  herramientas: EnlaceMenu[];
  total: number;
  areasConPracticas: number;
  areasEnCamino: number;
}

function contar(valores: string[]): Map<string, number> {
  const conteo = new Map<string, number>();
  for (const v of valores) conteo.set(v, (conteo.get(v) ?? 0) + 1);
  return conteo;
}

function ordenarPorConteo(conteo: Map<string, number>, parametro: string): EnlaceMenu[] {
  return [...conteo.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], "es"))
    .map(([etiqueta, n]) => ({
      etiqueta,
      conteo: n,
      href: `/proyectos?${parametro}=${encodeURIComponent(etiqueta)}`,
    }));
}

/** Arma el menú Explorar del encabezado a partir de los proyectos publicados. */
export function armarMenu(practicas: PracticaResumen[]): DatosMenu {
  const porArea = contar(practicas.map((p) => p.carrera));

  const familias = FAMILIAS.map((f) => {
    const areas = AREAS.filter((a) => a.familia === f.valor);
    return {
      etiqueta: f.etiqueta,
      areas: areas
        .filter((a) => (porArea.get(a.valor) ?? 0) > 0)
        .map((a) => ({
          etiqueta: a.etiqueta,
          conteo: porArea.get(a.valor) ?? 0,
          href: `/proyectos?area=${a.valor}`,
        })),
      enCamino: [
        ...areas.filter((a) => !porArea.get(a.valor)).map((a) => a.etiqueta),
        ...AREAS_EN_CAMINO.filter((a) => a.familia === f.valor).map((a) => a.etiqueta),
      ],
    };
  });

  const areasConPracticas = familias.reduce((n, f) => n + f.areas.length, 0);

  return {
    familias,
    roles: ordenarPorConteo(contar(practicas.map((p) => p.rol)), "rol"),
    herramientas: ordenarPorConteo(contar(practicas.flatMap((p) => p.herramientas ?? [])), "herramienta"),
    total: practicas.length,
    areasConPracticas,
    areasEnCamino: familias.reduce((n, f) => n + f.enCamino.length, 0),
  };
}
