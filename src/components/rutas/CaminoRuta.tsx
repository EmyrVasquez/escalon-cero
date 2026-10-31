"use client";

import Link from "next/link";
import { useMontado } from "@/lib/montado";
import { useSesion } from "@/lib/sesion";
import { IconoCandado, IconoChevron, IconoHecho } from "@/components/ui/Iconos";

export interface EtapaCamino {
  numero: number;
  titulo: string;
  objetivo: string;
  temas: string[];
  recursos: { nombre: string; url: string }[];
  proyectos: { id: string; titulo: string; duracion: string | null }[];
}

export interface OportunidadCamino {
  id: string;
  titulo: string;
  empresa: string;
  etapa_requerida: number;
}

type Estado = "hecha" | "actual" | "pendiente" | "preparacion";

/**
 * La ruta como un camino: un nodo por etapa y la meta al final. El detalle
 * (temas y recursos) se abre solo si la persona lo pide.
 */
export function CaminoRuta({
  puesto,
  etapas,
  oportunidades,
}: {
  puesto: string;
  etapas: EtapaCamino[];
  oportunidades: OportunidadCamino[];
}) {
  const sesion = useSesion();
  const portafolio = useMontado() ? sesion.portafolio : undefined;
  const hecha = (e: EtapaCamino) =>
    e.proyectos.length > 0 && e.proyectos.every((p) => portafolio?.some((x) => x.proyectoId === p.id && x.valida));

  const base: Estado[] = etapas.map((e) => (e.proyectos.length === 0 ? "preparacion" : hecha(e) ? "hecha" : "pendiente"));
  const primeraPendiente = base.indexOf("pendiente");
  const estados: Estado[] = base.map((s, i) => (i === primeraPendiente ? "actual" : s));
  const completas = estados.filter((s) => s === "hecha").length;
  const conProyectos = etapas.filter((e) => e.proyectos.length > 0).length;
  const actual = etapas[estados.indexOf("actual")];
  const desbloqueadas = oportunidades.filter((o) =>
    etapas.filter((e) => e.numero <= o.etapa_requerida).every((e, i) => estados[i] === "hecha" || e.proyectos.length === 0),
  );

  return (
    <div className="mt-8 grid gap-6 lg:grid-cols-[1.5fr_1fr] lg:items-start">
      <section aria-labelledby="titulo-etapas" className="rounded-3xl border border-linea bg-blanco p-6 sm:p-8">
        <div className="flex items-end justify-between gap-4">
          <h2 id="titulo-etapas" className="text-xl font-extrabold tracking-[-0.02em]">
            Etapas
          </h2>
          <p className="text-right">
            <span className="text-2xl font-extrabold">
              {completas} / {conProyectos || etapas.length}
            </span>
            <span className="block text-xs text-pizarra">etapas completas</span>
          </p>
        </div>
        <div
          role="progressbar"
          aria-label="Etapas completas"
          aria-valuemin={0}
          aria-valuemax={conProyectos || etapas.length}
          aria-valuenow={completas}
          className="mt-3 h-2 overflow-hidden rounded-full bg-cielo"
        >
          <div className="h-full rounded-full bg-cobalto" style={{ width: `${(completas / (conProyectos || etapas.length)) * 100}%` }} />
        </div>

        <ol className="relative mt-6 space-y-3 before:absolute before:top-6 before:bottom-6 before:left-[1.45rem] before:w-0.5 before:bg-linea">
          {etapas.map((e, i) => {
            const estado = estados[i];
            const proyecto = e.proyectos[0];
            return (
              <li key={e.numero} id={`etapa-${e.numero}`} className="relative scroll-mt-6">
                <div
                  className={`flex items-start gap-4 rounded-2xl p-3 ${estado === "actual" ? "bg-cielo" : ""} ${
                    estado === "preparacion" ? "opacity-70" : ""
                  }`}
                >
                  <Nodo estado={estado} numero={e.numero} />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold uppercase tracking-[0.06em] text-pizarra">
                      Etapa {e.numero}
                      {estado === "hecha" ? " · completa" : estado === "actual" ? " · estás aquí" : ""}
                    </p>
                    <p className="mt-0.5 text-lg font-extrabold leading-snug tracking-[-0.02em]">{e.titulo}</p>
                    {proyecto ? (
                      <Link
                        href={`/proyectos/${proyecto.id}`}
                        className="mt-1 inline-flex items-center gap-1 text-sm font-bold text-cobalto hover:underline"
                      >
                        Proyecto: {proyecto.titulo}
                        <IconoChevron className="h-4 w-4" />
                      </Link>
                    ) : (
                      <p className="mt-1 text-sm text-pizarra">Proyecto en preparación</p>
                    )}
                    <details className="group mt-2">
                      <summary className="cursor-pointer list-none text-sm font-semibold text-pizarra hover:text-tinta">
                        <span className="group-open:hidden">Qué aprender</span>
                        <span className="hidden group-open:inline">Ocultar</span>
                      </summary>
                      <p className="mt-2 text-sm leading-relaxed text-pizarra">{e.objetivo}</p>
                      <ul className="mt-2 flex flex-wrap gap-1.5 text-xs font-semibold">
                        {e.temas.map((t) => (
                          <li key={t} className="rounded-full bg-niebla px-2.5 py-1">
                            {t}
                          </li>
                        ))}
                      </ul>
                      {e.recursos.length > 0 && (
                        <ul className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm">
                          {e.recursos.map((r) => (
                            <li key={r.url}>
                              <a href={r.url} target="_blank" rel="noopener noreferrer" className="font-bold text-cobalto hover:underline">
                                {r.nombre}
                                <span className="sr-only"> (se abre en otra pestaña)</span>
                              </a>
                            </li>
                          ))}
                        </ul>
                      )}
                    </details>
                  </div>
                </div>
              </li>
            );
          })}
          <li className="relative">
            <div className="flex items-center gap-4 rounded-2xl p-3">
              <span aria-hidden="true" className="relative z-10 flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-lima text-xl">
                ★
              </span>
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.06em] text-pizarra">Meta</p>
                <p className="text-lg font-extrabold tracking-[-0.02em]">{puesto}</p>
              </div>
            </div>
          </li>
        </ol>
      </section>

      <aside className="space-y-4 lg:sticky lg:top-6">
        <section className="rounded-3xl bg-tinta p-6 text-blanco">
          <p className="text-sm font-bold text-lima">Tu siguiente paso</p>
          {actual?.proyectos[0] ? (
            <>
              <p className="mt-2 text-xl font-extrabold leading-snug">{actual.proyectos[0].titulo}</p>
              <p className="mt-1 text-sm opacity-80">
                Etapa {actual.numero}
                {actual.proyectos[0].duracion ? ` · ${actual.proyectos[0].duracion}` : ""}
              </p>
              <Link
                href={`/proyectos/${actual.proyectos[0].id}`}
                className="mt-5 inline-flex items-center justify-center rounded-xl bg-lima px-6 py-3 font-bold text-tinta hover:bg-blanco"
              >
                Hacer el proyecto
              </Link>
            </>
          ) : (
            <>
              <p className="mt-2 text-xl font-extrabold leading-snug">
                {completas > 0 ? "Completaste las etapas disponibles." : "Pronto habrá proyectos en esta ruta."}
              </p>
              <Link
                href="/oportunidades"
                className="mt-5 inline-flex items-center justify-center rounded-xl bg-lima px-6 py-3 font-bold text-tinta hover:bg-blanco"
              >
                Ver oportunidades
              </Link>
            </>
          )}
        </section>

        {oportunidades.length > 0 && (
          <section className="rounded-3xl border border-linea bg-blanco p-6">
            <h2 className="font-extrabold">Se desbloquea al avanzar</h2>
            <ul className="mt-3 space-y-3">
              {oportunidades.map((o) => {
                const abierta = desbloqueadas.includes(o);
                return (
                  <li key={o.id}>
                    <Link href={`/oportunidades/${o.id}`} className="group flex items-start gap-3">
                      <span
                        aria-hidden="true"
                        className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${
                          abierta ? "bg-lima text-tinta" : "bg-niebla text-pizarra"
                        }`}
                      >
                        {abierta ? <IconoHecho /> : <IconoCandado />}
                      </span>
                      <span className="min-w-0">
                        <span className="block text-xs font-semibold text-pizarra">
                          {o.empresa} · pide la etapa {o.etapa_requerida}
                          {abierta ? " · ya puedes postular" : ""}
                        </span>
                        <span className="block font-bold leading-snug group-hover:text-cobalto">{o.titulo}</span>
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </section>
        )}
      </aside>
    </div>
  );
}

function Nodo({ estado, numero }: { estado: Estado; numero: number }) {
  const base = "relative z-10 flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-sm font-extrabold";
  if (estado === "hecha")
    return (
      <span className={`${base} bg-cobalto text-blanco`}>
        <IconoHecho className="h-5 w-5" />
        <span className="sr-only">Completa</span>
      </span>
    );
  if (estado === "actual") return <span className={`${base} bg-blanco text-cobalto ring-2 ring-cobalto`}>0{numero}</span>;
  if (estado === "preparacion")
    return (
      <span className={`${base} border-2 border-dashed border-linea bg-blanco text-pizarra`}>
        <IconoCandado />
        <span className="sr-only">En preparación</span>
      </span>
    );
  return <span className={`${base} border-2 border-linea bg-blanco text-pizarra`}>0{numero}</span>;
}
