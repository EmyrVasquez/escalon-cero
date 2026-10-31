"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useSesion } from "@/lib/sesion";
import type { Proyecto, PreguntaComprobacion } from "@/lib/tipos";
import { AvisoSesion } from "@/components/cuenta/AvisoSesion";
import { IconoDescarga } from "@/components/ui/Iconos";
import type { PuertaAbierta } from "@/components/proyectos/EntregaLibre";

type DatosProyecto = Pick<
  Proyecto,
  "id" | "titulo" | "ruta" | "referencia" | "lo_que_hice" | "que_paso" | "aprendizaje"
> & { preguntas: PreguntaComprobacion[] };

/** Lo que pasa mientras se lee la sesión, sin sesión o sin entrega. */
function useEntrada(proyectoId: string) {
  const { usuario, portafolio } = useSesion();
  const entrada = portafolio?.find((e) => e.proyectoId === proyectoId);
  const cargando = usuario === undefined || (usuario !== null && portafolio === undefined);
  return { usuario, entrada, cargando };
}

function Esqueleto() {
  return <div className="h-72 rounded-3xl border border-linea bg-blanco" aria-busy="true" aria-label="Cargando" />;
}

function SinEntrega({ proyecto }: { proyecto: DatosProyecto }) {
  return (
    <div className="rounded-3xl border border-dashed border-linea bg-blanco p-6 sm:p-8">
      <h2 className="text-xl font-bold">Todavía no entregas este proyecto</h2>
      <p className="mt-2 text-pizarra">Cuando lo entregues, aquí verás tu resultado.</p>
      <Link
        href={`/proyectos/${proyecto.id}#entrega`}
        className="mt-5 inline-flex items-center justify-center rounded-xl bg-cobalto px-6 py-3.5 font-bold text-blanco hover:bg-cobalto-hondo"
      >
        Ir al proyecto
      </Link>
    </div>
  );
}

/**
 * Pantalla de resultado de una entrega comprobada: si aprobó, la oportunidad
 * desbloqueada; si no, las pistas para corregir. Las respuestas correctas
 * van aparte, en la pantalla de solución.
 */
export function ResultadoProyecto({
  proyecto,
  oportunidades,
}: {
  proyecto: DatosProyecto;
  oportunidades: PuertaAbierta[];
}) {
  const { usuario, entrada, cargando } = useEntrada(proyecto.id);
  const titulo = useRef<HTMLHeadingElement>(null);
  const resultado = entrada?.resultado ?? null;

  useEffect(() => {
    if (resultado) titulo.current?.focus();
  }, [resultado]);

  if (cargando) return <Esqueleto />;
  if (usuario === null)
    return <AvisoSesion titulo="Ingresa para ver tu resultado" texto="Tu resultado se guarda en tu cuenta." />;
  if (!entrada || !resultado) return <SinEntrega proyecto={proyecto} />;

  if (!resultado.aprobada) {
    return (
      <div className="space-y-6">
        <div className="revelado rounded-3xl border-2 border-alerta/40 bg-blanco p-6 sm:p-9">
          <p className="text-sm font-bold uppercase tracking-[0.08em] text-alerta">Todavía no</p>
          <h1
            ref={titulo}
            tabIndex={-1}
            className="mt-2 text-3xl font-extrabold tracking-[-0.04em] outline-none sm:text-4xl"
          >
            Acertaste {resultado.aciertos} de {resultado.total} cifras
          </h1>
          <p className="mt-3 max-w-[60ch] leading-relaxed text-pizarra">
            Necesitas {resultado.minimo} para aprobar. Revisa las pistas y vuelve a intentarlo: no hay límite de intentos.
          </p>
          <Link
            href={`/proyectos/${proyecto.id}#entrega`}
            className="mt-5 inline-flex items-center justify-center rounded-xl bg-cobalto px-6 py-3.5 font-bold text-blanco hover:bg-cobalto-hondo"
          >
            Corregir mis cifras
          </Link>
          <ul className="mt-6 divide-y divide-linea rounded-2xl border border-linea">
            {proyecto.preguntas.map((p) => {
              const r = resultado.detalle.find((d) => d.id === p.id);
              return (
                <li key={p.id} className="flex gap-3 p-4 sm:px-5">
                  <Marca correcta={!!r?.correcta} />
                  <div className="min-w-0">
                    <p className="font-semibold leading-snug">{p.enunciado}</p>
                    {r && !r.correcta && r.pista && (
                      <p className="mt-2 rounded-xl bg-niebla p-3 text-sm leading-relaxed">
                        <span className="font-bold">Pista: </span>
                        {r.pista}
                      </p>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="revelado rounded-3xl bg-lima p-6 sm:p-10">
        <p className="text-sm font-bold uppercase tracking-[0.08em] text-lima-hondo">Proyecto aprobado</p>
        <h1
          ref={titulo}
          tabIndex={-1}
          className="mt-2 text-4xl font-extrabold tracking-[-0.04em] outline-none sm:text-5xl"
        >
          Acertaste {resultado.aciertos} de {resultado.total} cifras
        </h1>
        <p className="mt-3 max-w-[56ch] text-lg leading-relaxed">
          Tu entrega ya está en tu portafolio y cuenta como experiencia para la ruta.
        </p>
      </div>

      {oportunidades.map((o) => (
        <section
          key={o.id}
          aria-label="Oportunidad desbloqueada"
          className="flex flex-wrap items-center justify-between gap-x-8 gap-y-5 rounded-3xl bg-tinta p-6 text-blanco sm:p-8"
        >
          <div className="min-w-0 flex-[1_1_20rem]">
            <p className="text-sm font-bold text-lima">Desbloqueaste una oportunidad</p>
            <p className="mt-2 text-xs font-semibold opacity-75">{o.empresa}</p>
            <p className="mt-0.5 text-xl font-bold leading-snug">{o.titulo}</p>
          </div>
          <Link
            href={`/oportunidades/${o.id}#postular`}
            className="inline-flex items-center justify-center rounded-xl bg-lima px-7 py-3.5 font-bold text-tinta transition-colors hover:bg-blanco"
          >
            Postular ahora
          </Link>
        </section>
      ))}

      <Link
        href={`/proyectos/${proyecto.id}/solucion`}
        className="inline-flex items-center justify-center rounded-xl border border-linea bg-blanco px-6 py-3.5 font-bold text-tinta hover:border-tinta"
      >
        Ver las respuestas correctas
      </Link>
    </div>
  );
}

/** Respuestas correctas, dashboard de referencia y qué pasó en el caso. Solo tras aprobar. */
export function SolucionProyecto({ proyecto }: { proyecto: DatosProyecto }) {
  const { usuario, entrada, cargando } = useEntrada(proyecto.id);
  const { urlArchivo } = useSesion();
  const [abriendo, setAbriendo] = useState(false);
  const resultado = entrada?.resultado ?? null;
  const imagen =
    proyecto.referencia && /\.(png|jpe?g|webp)$/i.test(proyecto.referencia.url) ? proyecto.referencia : null;

  if (cargando) return <Esqueleto />;
  if (usuario === null)
    return <AvisoSesion titulo="Ingresa para ver la solución" texto="La solución se muestra cuando apruebas el proyecto." />;
  if (!entrada || !resultado) return <SinEntrega proyecto={proyecto} />;
  if (!resultado.aprobada) {
    return (
      <div className="rounded-3xl border border-dashed border-linea bg-blanco p-6 sm:p-8">
        <h2 className="text-xl font-bold">La solución se muestra cuando apruebas</h2>
        <p className="mt-2 text-pizarra">
          Llevas {resultado.aciertos} de {resultado.total}. Revisa las pistas y vuelve a intentarlo.
        </p>
        <Link
          href={`/proyectos/${proyecto.id}/resultado`}
          className="mt-5 inline-flex items-center justify-center rounded-xl bg-cobalto px-6 py-3.5 font-bold text-blanco hover:bg-cobalto-hondo"
        >
          Ver las pistas
        </Link>
      </div>
    );
  }

  async function abrirArchivo() {
    if (!entrada?.archivo) return;
    setAbriendo(true);
    const url = await urlArchivo(entrada.archivo);
    setAbriendo(false);
    if (url) window.open(url, "_blank", "noopener,noreferrer");
  }

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-linea bg-blanco p-6 sm:p-8">
        <h2 className="text-xl font-bold tracking-[-0.02em]">Tus cifras y las correctas</h2>
        <ul className="mt-5 divide-y divide-linea">
          {proyecto.preguntas.map((p) => {
            const r = resultado.detalle.find((d) => d.id === p.id);
            return (
              <li key={p.id} className="grid gap-x-6 gap-y-1 py-4 sm:grid-cols-[1fr_1.3fr]">
                <div className="flex items-start gap-3">
                  <Marca correcta={!!r?.correcta} />
                  <div>
                    <p className="font-semibold leading-snug">{p.enunciado}</p>
                    <p className="mt-0.5 text-sm text-pizarra">Tu respuesta: {mostrarRespuesta(p, r?.respuesta ?? "")}</p>
                  </div>
                </div>
                <div className="pl-9 sm:pl-0">
                  <p className="font-bold tabular-nums">{r?.esperado}</p>
                  {r?.explicacion && <p className="mt-1 text-sm leading-relaxed text-pizarra">{r.explicacion}</p>}
                </div>
              </li>
            );
          })}
        </ul>
      </section>

      {imagen && (
        <section className="rounded-3xl border border-linea bg-blanco p-6 sm:p-8">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-xl font-bold tracking-[-0.02em]">Dashboard de referencia</h2>
            <a
              href={imagen.url}
              download
              className="inline-flex items-center gap-2 rounded-xl border border-linea px-4 py-2.5 text-sm font-bold hover:border-tinta"
            >
              <IconoDescarga />
              Descargar
            </a>
          </div>
          <Image
            src={imagen.url}
            alt="Dashboard de referencia: ventas netas por mes, por zona, por categoría, por vendedor y los diez clientes principales unificados por RUC."
            width={1760}
            height={1100}
            className="mt-5 h-auto w-full rounded-2xl border border-linea"
          />
        </section>
      )}

      <section className="rounded-3xl border border-linea bg-blanco p-6 sm:p-8">
        <h2 className="text-xl font-bold tracking-[-0.02em]">Qué pasó en este caso</h2>
        <dl className="mt-4 grid gap-6 text-sm leading-relaxed md:grid-cols-3">
          <div>
            <dt className="font-bold">Lo que hizo el junior</dt>
            <dd className="mt-1 text-pizarra">{proyecto.lo_que_hice}</dd>
          </div>
          <div>
            <dt className="font-bold">Qué pasó después</dt>
            <dd className="mt-1 text-pizarra">{proyecto.que_paso}</dd>
          </div>
          <div>
            <dt className="font-bold">La lección</dt>
            <dd className="mt-1 text-pizarra">{proyecto.aprendizaje}</dd>
          </div>
        </dl>
        {entrada.archivo && (
          <button
            type="button"
            onClick={() => void abrirArchivo()}
            className="mt-6 text-sm font-bold text-cobalto underline underline-offset-4"
          >
            {abriendo ? "Abriendo…" : "Ver el archivo que subiste"}
          </button>
        )}
      </section>

      <Link
        href={`/proyectos/${proyecto.id}/resultado`}
        className="inline-flex items-center justify-center rounded-xl border border-linea bg-blanco px-6 py-3.5 font-bold text-tinta hover:border-tinta"
      >
        Volver a mi resultado
      </Link>
    </div>
  );
}

function mostrarRespuesta(p: PreguntaComprobacion, valor: string): string {
  if (!valor) return "sin responder";
  if (p.tipo === "opcion") return p.opciones?.find((o) => o.valor === valor)?.etiqueta ?? valor;
  if (!p.unidad) return valor;
  const sinUnidad = valor.replace(new RegExp(`^\\s*${p.unidad.replace(/[.*+?^${}()|[\]\\/]/g, "\\$&")}\\s*`, "i"), "");
  return `${p.unidad} ${sinUnidad}`;
}

function Marca({ correcta }: { correcta: boolean }) {
  return correcta ? (
    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-lima font-bold text-tinta">
      ✓<span className="sr-only">Correcta</span>
    </span>
  ) : (
    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-alerta/15 font-bold text-alerta">
      ✕<span className="sr-only">Incorrecta</span>
    </span>
  );
}
