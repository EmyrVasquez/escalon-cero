"use client";

import Link from "next/link";
import { useEffect, useId, useRef, useState } from "react";
import {
  actualizarCriterios,
  eliminarBorrador,
  guardarBorrador,
  guardarEnPortafolio,
} from "@/lib/almacenamiento";
import { supabase } from "@/lib/supabase";
import type { Practica } from "@/lib/tipos";
import { IconoDescarga } from "./Iconos";
import { useBorradores, usePortafolio } from "@/lib/useAlmacenamiento";
import { Reacciones } from "./Reacciones";

const MINIMO = 10;
const MAXIMO = 2000;

export function PracticaInteractiva({ practica }: { practica: Practica }) {
  const borradores = useBorradores();
  const portafolio = usePortafolio();
  const entrada = portafolio?.find((e) => e.practicaId === practica.id);
  const borrador = borradores?.[practica.id];

  const [solucionEditada, setSolucionEditada] = useState<string | null>(null);
  const [enlaceEditado, setEnlaceEditado] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const acabaDeEntregar = useRef(false);
  const tituloRevelado = useRef<HTMLHeadingElement>(null);
  const idSolucion = useId();
  const idEnlace = useId();
  const idAyuda = useId();
  const idError = useId();
  const idAyudaEnlace = useId();
  const conArchivo = practica.enlace_obligatorio;

  const solucion = solucionEditada ?? borrador?.solucion ?? "";
  const enlace = enlaceEditado ?? borrador?.enlace ?? "";

  useEffect(() => {
    if (entrada && acabaDeEntregar.current) {
      acabaDeEntregar.current = false;
      tituloRevelado.current?.focus();
    }
  }, [entrada]);

  function guardar(nuevaSolucion: string, nuevoEnlace: string) {
    guardarBorrador({
      practicaId: practica.id,
      titulo: practica.titulo,
      area: practica.carrera,
      solucion: nuevaSolucion,
      enlace: nuevoEnlace,
      actualizado: new Date().toISOString(),
    });
  }

  async function entregar(evento: React.FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    const texto = solucion.trim();
    const url = enlace.trim();

    if (texto.length < MINIMO) {
      setError(
        practica.enlace_obligatorio
          ? `Explica tus decisiones con al menos ${MINIMO} caracteres antes de entregar.`
          : `Escribe tu solución con al menos ${MINIMO} caracteres antes de entregar.`,
      );
      return;
    }
    if (practica.enlace_obligatorio && !url) {
      setError("Pega el enlace a tu trabajo antes de entregar.");
      return;
    }
    if (url && !/^https?:\/\/\S+$/i.test(url)) {
      setError("El enlace debe empezar con http:// o https://. También puedes dejarlo vacío.");
      return;
    }

    setError(null);
    setEnviando(true);
    const { error: errorSupabase } = await supabase.from("respuestas").insert({
      caso_id: practica.id,
      respuesta: texto,
      enlace: url || null,
    });
    setEnviando(false);

    if (errorSupabase) {
      setError(
        "No pudimos registrar tu entrega. Revisa tu conexión a internet y vuelve a intentarlo.",
      );
      return;
    }

    acabaDeEntregar.current = true;
    guardarEnPortafolio({
      practicaId: practica.id,
      titulo: practica.titulo,
      area: practica.carrera,
      rol: practica.rol,
      herramientas: practica.herramientas,
      solucion: texto,
      enlace: url,
      criterios: practica.criterios,
      criteriosCumplidos: [],
      entregado: new Date().toISOString(),
    });
    eliminarBorrador(practica.id);
  }

  // Mientras se lee lo guardado en el navegador, se reserva el espacio.
  if (portafolio === undefined) {
    return <div className="mt-14 h-72 rounded-3xl border border-linea bg-blanco" aria-hidden="true" />;
  }

  if (!entrada) {
    const restantes = MAXIMO - solucion.length;
    const describe = `${idAyuda}${error ? ` ${idError}` : ""}`;

    const campoSolucion = (
      <div className={conArchivo ? "mt-5" : "mt-6"}>
        <label htmlFor={idSolucion} className="block font-semibold">
          {conArchivo ? "Tus decisiones y hallazgos" : "Tu solución"}
        </label>
        <textarea
          id={idSolucion}
          value={solucion}
          maxLength={MAXIMO}
          rows={9}
          aria-describedby={describe}
          aria-invalid={error ? true : undefined}
          onChange={(e) => {
            setSolucionEditada(e.target.value);
            setError(null);
            guardar(e.target.value, enlace);
          }}
          placeholder={
            conArchivo
              ? "Qué transformaciones hiciste y por qué… Tus hallazgos principales… Qué le advertirías a tu jefe…"
              : "Primero revisaría… Luego le escribiría a… porque…"
          }
          className="mt-2 w-full resize-y rounded-xl border border-linea bg-niebla p-4 leading-relaxed outline-none transition-colors focus:border-cobalto focus:bg-blanco"
        />
        <p className="mt-1 text-right text-xs text-pizarra" aria-live="polite">
          {restantes < 200 ? `Te quedan ${restantes} caracteres` : "\u00a0"}
        </p>
      </div>
    );

    const campoEnlace = (
      <div className={conArchivo ? "mt-6" : "mt-3"}>
        <label htmlFor={idEnlace} className="block font-semibold">
          {conArchivo ? (
            "Enlace a tu trabajo"
          ) : (
            <>
              Enlace a tu trabajo <span className="font-normal text-pizarra">(opcional)</span>
            </>
          )}
        </label>
        {conArchivo && (
          <p id={idAyudaEnlace} className="mt-1 text-sm text-pizarra">
            Publícalo o súbelo a Drive con acceso para cualquiera con el enlace, y pégalo aquí.
          </p>
        )}
        <input
          id={idEnlace}
          type="url"
          inputMode="url"
          required={conArchivo}
          aria-describedby={conArchivo ? `${idAyudaEnlace} ${describe}` : describe}
          value={enlace}
          onChange={(e) => {
            setEnlaceEditado(e.target.value);
            setError(null);
            guardar(solucion, e.target.value);
          }}
          placeholder="https://drive.google.com/…"
          className="mt-2 w-full rounded-xl border border-linea bg-niebla px-4 py-3 outline-none transition-colors focus:border-cobalto focus:bg-blanco"
        />
      </div>
    );

    return (
      <section id="entrega" aria-labelledby="titulo-entrega" className="mt-14 scroll-mt-6">
        <form
          onSubmit={entregar}
          noValidate
          className="rounded-3xl border border-linea bg-blanco p-6 sm:p-8"
        >
          <h2 id="titulo-entrega" className="text-2xl font-bold tracking-[-0.03em]">
            {conArchivo ? "Entrega tu solución" : practica.pregunta || "¿Qué harías tú?"}
          </h2>
          <p id={idAyuda} className="mt-2 max-w-[70ch] leading-relaxed text-pizarra">
            {conArchivo
              ? "Haz el trabajo con los recursos y explica tus decisiones como si se lo enviaras a tu jefe. "
              : "Responde como si fuera tu primer mes en este puesto. "}
            Al entregar verás lo que hizo el junior real y cómo terminó. Tu borrador se
            guarda en este navegador mientras escribes.
          </p>

          {conArchivo ? (
            <>
              {campoEnlace}
              {campoSolucion}
            </>
          ) : (
            <>
              {campoSolucion}
              {campoEnlace}
            </>
          )}

          {error && (
            <p id={idError} role="alert" className="mt-4 text-sm font-semibold text-alerta">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={enviando}
            className="mt-6 inline-flex w-full items-center justify-center rounded-xl bg-cobalto px-6 py-3.5 font-bold text-blanco transition-colors hover:bg-cobalto-hondo disabled:cursor-wait disabled:opacity-80 sm:w-auto"
          >
            {enviando ? "Entregando…" : "Entregar y ver qué pasó"}
          </button>
        </form>
      </section>
    );
  }

  const esIlustrativo = practica.tipo_veracidad === "ilustrativo";
  const cumplidos = entrada.criteriosCumplidos;

  return (
    <section
      id="desenlace"
      aria-labelledby="titulo-revelado"
      className="revelado mt-14 scroll-mt-6 space-y-6"
    >
      <div className="rounded-3xl bg-lima p-6 sm:p-9">
        <h2
          id="titulo-revelado"
          ref={tituloRevelado}
          tabIndex={-1}
          className="text-3xl font-extrabold tracking-[-0.04em] outline-none sm:text-4xl"
        >
          {esIlustrativo ? "Qué pasó en este caso" : "Qué pasó de verdad"}
        </h2>
        <div className="mt-6 grid gap-6 md:grid-cols-3">
          <Desenlace titulo="Lo que hizo el junior">{practica.lo_que_hice}</Desenlace>
          <Desenlace titulo="Qué pasó después">{practica.que_paso}</Desenlace>
          <Desenlace titulo="Lo que no te enseña la universidad">{practica.aprendizaje}</Desenlace>
        </div>
        {esIlustrativo && (
          <p className="mt-6 text-sm text-lima-hondo">
            Este es un ejemplo ilustrativo, creado con fines didácticos a partir de
            situaciones frecuentes.
          </p>
        )}
      </div>

      {practica.referencia && (
        <section className="flex flex-wrap items-center gap-x-6 gap-y-4 rounded-3xl border border-linea bg-blanco p-6 sm:px-8">
          <div className="min-w-0 flex-[1_1_20rem]">
            <h3 className="text-lg font-bold">Compara con la solución del junior</h3>
            <p className="mt-1 text-sm leading-relaxed text-pizarra">
              {practica.referencia.descripcion ??
                "Descarga lo que se entregó en este caso y compáralo con tu trabajo."}
            </p>
          </div>
          <a
            href={practica.referencia.url}
            download
            className="inline-flex items-center gap-2 rounded-xl border border-linea px-5 py-3 font-bold transition-colors hover:border-tinta"
          >
            <IconoDescarga />
            {practica.referencia.nombre}
          </a>
        </section>
      )}

      <div className="grid gap-6 lg:grid-cols-[1.3fr_1fr]">
        <section className="rounded-3xl border border-linea bg-blanco p-6 sm:p-8">
          <h3 className="text-lg font-bold">Revisa tu entrega</h3>
          <p className="mt-1 text-sm text-pizarra">
            Marca los criterios que cumple tu solución. Se guardan en tu portafolio.
          </p>
          <fieldset className="mt-4 space-y-3">
            <legend className="sr-only">Criterios de revisión</legend>
            {entrada.criterios.map((c) => {
              const marcado = cumplidos.includes(c);
              return (
                <label key={c} className="flex cursor-pointer items-start gap-3 text-sm leading-relaxed">
                  <input
                    type="checkbox"
                    checked={marcado}
                    onChange={() =>
                      actualizarCriterios(
                        practica.id,
                        marcado ? cumplidos.filter((x) => x !== c) : [...cumplidos, c],
                      )
                    }
                    className="mt-0.5 h-5 w-5 shrink-0 accent-cobalto"
                  />
                  {c}
                </label>
              );
            })}
          </fieldset>
          <p className="mt-4 text-sm font-semibold" aria-live="polite">
            Cumples {cumplidos.length} de {entrada.criterios.length} criterios
          </p>
        </section>

        <section className="rounded-3xl border border-linea bg-blanco p-6 sm:p-8">
          <h3 className="text-lg font-bold">Tu solución</h3>
          <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-pizarra">
            {entrada.solucion}
          </p>
          {entrada.enlace && (
            <a
              href={entrada.enlace}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 inline-block break-all text-sm font-semibold text-cobalto underline underline-offset-4"
            >
              {entrada.enlace}
            </a>
          )}
        </section>
      </div>

      <Reacciones practicaId={practica.id} />

      <div className="flex flex-col gap-3 sm:flex-row">
        <Link
          href="/portafolio"
          className="inline-flex items-center justify-center rounded-xl bg-cobalto px-6 py-3.5 font-bold text-blanco transition-colors hover:bg-cobalto-hondo"
        >
          Ver mi portafolio
        </Link>
        <Link
          href="/explorar"
          className="inline-flex items-center justify-center rounded-xl border border-linea bg-blanco px-6 py-3.5 font-bold text-tinta transition-colors hover:border-tinta"
        >
          Elegir otra práctica
        </Link>
      </div>
    </section>
  );
}

function Desenlace({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="font-bold">{titulo}</h3>
      <p className="mt-2 leading-relaxed">{children}</p>
    </div>
  );
}
