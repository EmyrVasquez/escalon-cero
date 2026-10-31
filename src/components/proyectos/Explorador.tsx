"use client";

import { useId, useMemo, useState } from "react";
import { AREAS, AREAS_EN_CAMINO, etiquetaArea } from "@/lib/areas";
import {
  ETIQUETAS_DURACION,
  grupoDuracion,
  minutosMaximos,
  normalizar,
  plural,
  type GrupoDuracion,
} from "@/lib/texto";
import { ETIQUETAS_NIVEL, type Nivel, type ProyectoResumen } from "@/lib/tipos";
import { FilaProyecto } from "@/components/proyectos/FilaProyecto";
import { IconoBuscar } from "@/components/ui/Iconos";

export interface FiltrosIniciales {
  q: string;
  area: string[];
  rol: string[];
  herramienta: string[];
}

type Clave = "area" | "rol" | "nivel" | "duracion" | "herramienta";
type Seleccion = Record<Clave, string[]>;
type Orden = "relevancia" | "duracion" | "nivel";

interface Opcion {
  valor: string;
  etiqueta: string;
  conteo: number;
}

function valoresDe(p: ProyectoResumen, clave: Clave): string[] {
  switch (clave) {
    case "area":
      return [p.carrera];
    case "rol":
      return [p.rol];
    case "nivel":
      return [p.nivel];
    case "duracion": {
      const g = grupoDuracion(p.duracion);
      return g ? [g] : [];
    }
    case "herramienta":
      return p.herramientas ?? [];
  }
}

function coincide(p: ProyectoResumen, sel: Seleccion): boolean {
  return (Object.keys(sel) as Clave[]).every((clave) => {
    const elegidos = sel[clave];
    return elegidos.length === 0 || valoresDe(p, clave).some((v) => elegidos.includes(v));
  });
}

function contiene(p: ProyectoResumen, consulta: string): boolean {
  if (!consulta) return true;
  const texto = normalizar(
    [p.titulo, p.resumen ?? "", p.rol, etiquetaArea(p.carrera), ...(p.herramientas ?? [])].join(" "),
  );
  return normalizar(consulta)
    .split(/\s+/)
    .every((palabra) => texto.includes(palabra));
}

function contar(proyectos: ProyectoResumen[], clave: Clave): Map<string, number> {
  const conteo = new Map<string, number>();
  for (const p of proyectos)
    for (const v of valoresDe(p, clave)) conteo.set(v, (conteo.get(v) ?? 0) + 1);
  return conteo;
}

export function Explorador({
  proyectos,
  inicial,
}: {
  proyectos: ProyectoResumen[];
  inicial: FiltrosIniciales;
}) {
  const [consulta, setConsulta] = useState(inicial.q);
  const [seleccion, setSeleccion] = useState<Seleccion>({
    area: inicial.area,
    rol: inicial.rol,
    nivel: [],
    duracion: [],
    herramienta: inicial.herramienta,
  });
  const [orden, setOrden] = useState<Orden>("relevancia");
  const [filtrosVisibles, setFiltrosVisibles] = useState(false);
  const idBuscar = useId();
  const idOrden = useId();
  const idFiltros = useId();

  const grupos = useMemo(() => {
    const porArea = contar(proyectos, "area");
    const porRol = contar(proyectos, "rol");
    const porNivel = contar(proyectos, "nivel");
    const porDuracion = contar(proyectos, "duracion");
    const porHerramienta = contar(proyectos, "herramienta");
    const ordenar = (m: Map<string, number>): Opcion[] =>
      [...m.entries()]
        .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], "es"))
        .map(([valor, conteo]) => ({ valor, etiqueta: valor, conteo }));

    return [
      {
        clave: "area" as const,
        titulo: "Área",
        opciones: AREAS.filter((a) => porArea.get(a.valor)).map((a) => ({
          valor: a.valor,
          etiqueta: a.etiqueta,
          conteo: porArea.get(a.valor) ?? 0,
        })),
        enCamino: [
          ...AREAS.filter((a) => !porArea.get(a.valor)).map((a) => a.etiqueta),
          ...AREAS_EN_CAMINO.map((a) => a.etiqueta),
        ],
      },
      { clave: "rol" as const, titulo: "Rol", opciones: ordenar(porRol), enCamino: [] },
      {
        clave: "nivel" as const,
        titulo: "Nivel",
        opciones: (["inicial", "intermedio"] as Nivel[])
          .filter((n) => porNivel.get(n))
          .map((n) => ({ valor: n, etiqueta: ETIQUETAS_NIVEL[n], conteo: porNivel.get(n) ?? 0 })),
        enCamino: [],
      },
      {
        clave: "duracion" as const,
        titulo: "Duración",
        opciones: (["corta", "media", "larga"] as GrupoDuracion[])
          .filter((g) => porDuracion.get(g))
          .map((g) => ({ valor: g, etiqueta: ETIQUETAS_DURACION[g], conteo: porDuracion.get(g) ?? 0 })),
        enCamino: [],
      },
      { clave: "herramienta" as const, titulo: "Herramienta", opciones: ordenar(porHerramienta), enCamino: [] },
    ];
  }, [proyectos]);

  const visibles = useMemo(() => {
    const filtradas = proyectos.filter((p) => coincide(p, seleccion) && contiene(p, consulta));
    if (orden === "duracion")
      return [...filtradas].sort((a, b) => minutosMaximos(a.duracion) - minutosMaximos(b.duracion));
    if (orden === "nivel")
      return [...filtradas].sort((a, b) => Number(a.nivel === "intermedio") - Number(b.nivel === "intermedio"));
    return filtradas;
  }, [proyectos, seleccion, consulta, orden]);

  const activos = Object.values(seleccion).reduce((n, l) => n + l.length, 0);

  function alternar(clave: Clave, valor: string) {
    setSeleccion((s) => ({
      ...s,
      [clave]: s[clave].includes(valor) ? s[clave].filter((v) => v !== valor) : [...s[clave], valor],
    }));
  }

  function limpiar() {
    setSeleccion({ area: [], rol: [], nivel: [], duracion: [], herramienta: [] });
    setConsulta("");
  }

  return (
    <>
      <div role="search" className="mt-6 max-w-2xl">
        <label htmlFor={idBuscar} className="sr-only">
          Buscar en el catálogo
        </label>
        <div className="flex items-center gap-2.5 rounded-xl border border-linea bg-blanco px-4 transition-colors focus-within:border-cobalto">
          <IconoBuscar className="h-[18px] w-[18px] shrink-0 text-pizarra" />
          <input
            id={idBuscar}
            type="search"
            value={consulta}
            onChange={(e) => setConsulta(e.target.value)}
            placeholder="Busca por tema, rol o herramienta"
            className="min-w-0 flex-1 bg-transparent py-3.5 outline-none placeholder:text-pizarra"
          />
        </div>
      </div>

      <div className="mt-10 grid gap-8 lg:grid-cols-[15.5rem_1fr] lg:gap-10">
        <div>
          <button
            type="button"
            aria-expanded={filtrosVisibles}
            aria-controls={idFiltros}
            onClick={() => setFiltrosVisibles((v) => !v)}
            className="inline-flex items-center gap-2 rounded-xl border border-linea bg-blanco px-4 py-2.5 font-bold lg:hidden"
          >
            Filtros{activos > 0 && <span className="rounded-md bg-cielo px-1.5 text-sm text-cobalto">{activos}</span>}
          </button>
          <aside
            id={idFiltros}
            aria-label="Filtros"
            className={`${filtrosVisibles ? "mt-5 block" : "hidden"} space-y-7 lg:mt-0 lg:block`}
          >
            {grupos.map((g) => (
              <fieldset key={g.clave}>
                <legend className="text-[0.95rem] font-bold">{g.titulo}</legend>
                <div className="mt-2.5 space-y-1">
                  {g.opciones.map((o) => (
                    <label
                      key={o.valor}
                      className="flex min-h-8 cursor-pointer items-center gap-2.5 text-sm"
                    >
                      <input
                        type="checkbox"
                        checked={seleccion[g.clave].includes(o.valor)}
                        onChange={() => alternar(g.clave, o.valor)}
                        className="h-[18px] w-[18px] shrink-0 accent-cobalto"
                      />
                      <span className="flex-1">{o.etiqueta}</span>
                      <span className="text-xs text-pizarra">{o.conteo}</span>
                    </label>
                  ))}
                  {g.enCamino.map((e) => (
                    <p key={e} className="flex min-h-8 items-center gap-2.5 text-sm text-pizarra">
                      <span
                        aria-hidden="true"
                        className="h-[18px] w-[18px] shrink-0 rounded border border-dashed border-[#b9c2d3]"
                      />
                      <span className="flex-1">{e}</span>
                      <span className="text-xs">Próximamente</span>
                    </p>
                  ))}
                </div>
              </fieldset>
            ))}
          </aside>
        </div>

        <section aria-labelledby="titulo-resultados" className="min-w-0">
          <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3">
            <div className="flex flex-wrap items-center gap-3">
              <h2 id="titulo-resultados" aria-live="polite" className="text-lg font-bold">
                {plural(visibles.length, "proyecto", "proyectos")}
              </h2>
              {(activos > 0 || consulta) && (
                <button
                  type="button"
                  onClick={limpiar}
                  className="py-1.5 text-sm font-bold text-cobalto hover:underline"
                >
                  Limpiar filtros
                </button>
              )}
            </div>
            <div className="flex items-center gap-2 text-sm">
              <label htmlFor={idOrden} className="text-pizarra">
                Ordenar por
              </label>
              <select
                id={idOrden}
                value={orden}
                onChange={(e) => setOrden(e.target.value as Orden)}
                className="rounded-lg border border-linea bg-blanco px-3 py-2"
              >
                <option value="relevancia">Destacadas primero</option>
                <option value="duracion">Menor duración</option>
                <option value="nivel">Nivel inicial primero</option>
              </select>
            </div>
          </div>

          {visibles.length === 0 ? (
            <div className="mt-5 rounded-2xl border border-dashed border-linea bg-blanco p-7">
              <p className="font-bold">Ningún proyecto coincide con tu búsqueda</p>
              <p className="mt-1.5 text-sm text-pizarra">
                Prueba con otras palabras o quita alguno de los filtros.
              </p>
            </div>
          ) : (
            <ul className="mt-5 divide-y divide-linea overflow-hidden rounded-2xl border border-linea bg-blanco">
              {visibles.map((p) => (
                <li key={p.id}>
                  <FilaProyecto proyecto={p} conResumen />
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </>
  );
}
