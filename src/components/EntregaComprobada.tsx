"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useId, useRef, useState } from "react";
import { useSesion } from "@/lib/sesion";
import type { Practica, PreguntaComprobacion, ResultadoComprobacion } from "@/lib/tipos";
import { FormularioIngreso } from "./FormularioIngreso";
import { IconoDescarga } from "./Iconos";
import type { PuertaAbierta } from "./PracticaInteractiva";
import { Reacciones } from "./Reacciones";

const MINIMO = 10;
const MAXIMO = 2000;
const PESO_MAXIMO = 20 * 1024 * 1024;
const EXTENSIONES = [".png", ".jpg", ".jpeg", ".webp", ".pdf", ".pbix", ".xlsx"];

/**
 * Entrega de un proyecto con comprobación automática: sube el trabajo,
 * responde cifras que se corrigen en la base de datos y, si aprueba, ve el
 * resultado esperado y desbloquea las oportunidades que piden el proyecto.
 */
export function EntregaComprobada({
  practica,
  preguntas,
  oportunidades,
}: {
  practica: Practica;
  preguntas: PreguntaComprobacion[];
  oportunidades: PuertaAbierta[];
}) {
  const { usuario, portafolio, borradores, comprobar, guardarBorrador } = useSesion();
  const entrada = portafolio?.find((e) => e.practicaId === practica.id);
  const borrador = borradores?.[practica.id];

  const [respuestasEditadas, setRespuestas] = useState<Record<string, string> | null>(null);
  const [solucionEditada, setSolucion] = useState<string | null>(null);
  const [enlaceEditado, setEnlace] = useState<string | null>(null);
  const [archivo, setArchivo] = useState<File | null>(null);
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pideCuenta, setPideCuenta] = useState(false);
  const [resultadoReciente, setResultadoReciente] = useState<ResultadoComprobacion | null>(null);
  const tituloResultado = useRef<HTMLHeadingElement>(null);
  const id = useId();

  const respuestas = respuestasEditadas ?? borrador?.respuestas ?? entrada?.respuestas ?? {};
  const solucion = solucionEditada ?? borrador?.solucion ?? entrada?.solucion ?? "";
  const enlace = enlaceEditado ?? borrador?.enlace ?? entrada?.enlace ?? "";
  const resultado = resultadoReciente ?? entrada?.resultado ?? null;
  const aprobada = resultado?.aprobada === true;
  const archivoPrevio = entrada?.archivo ?? null;

  useEffect(() => {
    if (resultadoReciente) tituloResultado.current?.focus();
  }, [resultadoReciente]);

  function guardar(cambios: { respuestas?: Record<string, string>; solucion?: string; enlace?: string }) {
    if (!usuario) return;
    guardarBorrador({
      practicaId: practica.id,
      titulo: practica.titulo,
      area: practica.carrera,
      solucion: cambios.solucion ?? solucion,
      enlace: cambios.enlace ?? enlace,
      respuestas: cambios.respuestas ?? respuestas,
    });
  }

  function validar(): string | null {
    if (!archivo && !enlace.trim() && !archivoPrevio)
      return "Sube tu dashboard (captura, PDF o .pbix) o pega el enlace donde lo publicaste.";
    if (archivo) {
      const nombre = archivo.name.toLowerCase();
      if (!EXTENSIONES.some((x) => nombre.endsWith(x)))
        return "Sube una imagen (PNG o JPG), un PDF, un .pbix o un .xlsx.";
      if (archivo.size > PESO_MAXIMO) return "Tu archivo pesa más de 20 MB. Sube una captura o un PDF.";
    }
    const url = enlace.trim();
    if (url && !/^https?:\/\/\S+$/i.test(url)) return "El enlace debe empezar con http:// o https://.";
    const faltan = preguntas.filter((p) => !(respuestas[p.id] ?? "").trim());
    if (faltan.length > 0)
      return faltan.length === 1
        ? "Te falta responder una cifra."
        : `Te faltan responder ${faltan.length} cifras.`;
    const malas = preguntas.filter((p) => p.tipo === "numero" && !/\d/.test(respuestas[p.id] ?? ""));
    if (malas.length > 0) return "Escribe las cifras solo con números, por ejemplo 125430.50.";
    if (solucion.trim().length < MINIMO)
      return `Escribe lo que le advertirías al gerente, con al menos ${MINIMO} caracteres.`;
    return null;
  }

  async function enviar() {
    setError(null);
    setEnviando(true);
    const { resultado: nuevo, error: fallo } = await comprobar({
      practicaId: practica.id,
      titulo: practica.titulo,
      area: practica.carrera,
      rol: practica.rol,
      herramientas: practica.herramientas,
      criterios: practica.criterios,
      solucion: solucion.trim(),
      enlace: enlace.trim(),
      respuestas: Object.fromEntries(preguntas.map((p) => [p.id, (respuestas[p.id] ?? "").trim()])),
      archivo,
    });
    setEnviando(false);
    if (fallo || !nuevo) {
      setError(fallo ?? "No pudimos comprobar tu entrega.");
      return;
    }
    setPideCuenta(false);
    setArchivo(null);
    setResultadoReciente(nuevo);
  }

  function alEnviar(evento: React.FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    const problema = validar();
    if (problema) {
      setError(problema);
      return;
    }
    if (!usuario) {
      setError(null);
      setPideCuenta(true);
      return;
    }
    void enviar();
  }

  // Mientras se averigua si hay sesión, se reserva el espacio.
  if (usuario === undefined) {
    return <div className="mt-14 h-72 rounded-3xl border border-linea bg-blanco" aria-hidden="true" />;
  }

  if (aprobada && resultado) {
    return (
      <Aprobada
        practica={practica}
        preguntas={preguntas}
        resultado={resultado}
        oportunidades={oportunidades}
        solucion={entrada?.solucion ?? solucion}
        enlace={entrada?.enlace ?? enlace}
        archivo={entrada?.archivo ?? null}
        tituloRef={tituloResultado}
      />
    );
  }

  const campo =
    "mt-2 w-full rounded-xl border border-linea bg-niebla px-4 py-3 outline-none transition-colors focus:border-cobalto focus:bg-blanco";

  return (
    <section id="entrega" aria-labelledby={`${id}-titulo`} className="mt-14 scroll-mt-6 space-y-6">
      {resultado && !resultado.aprobada && (
        <div className="revelado rounded-3xl border-2 border-alerta/40 bg-blanco p-6 sm:p-8">
          <h2
            ref={tituloResultado}
            tabIndex={-1}
            className="text-2xl font-extrabold tracking-[-0.03em] outline-none"
          >
            Todavía no: acertaste {resultado.aciertos} de {resultado.total} cifras
          </h2>
          <p className="mt-2 max-w-[66ch] leading-relaxed text-pizarra">
            Necesitas al menos {resultado.minimo} para aprobar. Revisa las pistas, corrige tus
            cifras abajo y vuelve a enviar. No hay límite de intentos.
          </p>
          <ul className="mt-5 divide-y divide-linea rounded-2xl border border-linea">
            {preguntas.map((p) => {
              const r = resultado.detalle.find((d) => d.id === p.id);
              return (
                <li key={p.id} className="flex gap-3 p-4 sm:px-5">
                  <Marca correcta={!!r?.correcta} />
                  <div className="min-w-0">
                    <p className="font-semibold leading-snug">{p.enunciado}</p>
                    <p className="mt-0.5 text-sm text-pizarra">
                      Tu respuesta: {mostrarRespuesta(p, r?.respuesta ?? "")}
                    </p>
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
      )}

      <form onSubmit={alEnviar} noValidate className="rounded-3xl border border-linea bg-blanco p-6 sm:p-8">
        <h2 id={`${id}-titulo`} className="text-2xl font-bold tracking-[-0.03em]">
          {resultado ? "Corrige y vuelve a enviar" : "Entrega tu dashboard"}
        </h2>
        <p className="mt-2 max-w-[70ch] leading-relaxed text-pizarra">
          Sube tu trabajo y responde cinco cifras del año. Las comprobamos al instante con los
          datos del proyecto: si aciertas al menos 4, verás el resultado esperado y se
          desbloquea la oportunidad de la empresa.
        </p>

        <fieldset className="mt-7">
          <legend className="flex items-center gap-3 text-lg font-bold">
            <Numero n={1} /> Tu dashboard
          </legend>
          <div className="mt-4 grid gap-5 md:grid-cols-2">
            <div>
              <label htmlFor={`${id}-archivo`} className="block font-semibold">
                Sube un archivo
              </label>
              <p className="mt-1 text-sm text-pizarra">Captura, PDF o .pbix, hasta 20 MB.</p>
              <input
                id={`${id}-archivo`}
                type="file"
                accept={EXTENSIONES.join(",")}
                onChange={(e) => {
                  setArchivo(e.target.files?.[0] ?? null);
                  setError(null);
                }}
                className="mt-2 block w-full rounded-xl border border-dashed border-linea bg-niebla p-3 text-sm file:mr-3 file:rounded-lg file:border-0 file:bg-cobalto file:px-4 file:py-2 file:font-bold file:text-blanco hover:file:bg-cobalto-hondo"
              />
              {archivoPrevio && !archivo && (
                <p className="mt-2 text-sm font-semibold text-cobalto">
                  Ya subiste un archivo. Si no eliges otro, se usa ese.
                </p>
              )}
            </div>
            <div>
              <label htmlFor={`${id}-enlace`} className="block font-semibold">
                O pega un enlace <span className="font-normal text-pizarra">(opcional)</span>
              </label>
              <p className="mt-1 text-sm text-pizarra">Power BI publicado, Drive u OneDrive.</p>
              <input
                id={`${id}-enlace`}
                type="url"
                inputMode="url"
                value={enlace}
                placeholder="https://app.powerbi.com/…"
                onChange={(e) => {
                  setEnlace(e.target.value);
                  setError(null);
                  guardar({ enlace: e.target.value });
                }}
                className={campo}
              />
            </div>
          </div>
        </fieldset>

        <fieldset className="mt-9">
          <legend className="flex items-center gap-3 text-lg font-bold">
            <Numero n={2} /> Las cifras de tu dashboard
          </legend>
          <p className="mt-2 max-w-[66ch] text-sm leading-relaxed text-pizarra">
            Puedes calcularlas en Power BI o en Excel. Ojo con la complicación del encargo: los
            datos del ERP no vienen limpios.
          </p>
          <div className="mt-4 grid gap-5 md:grid-cols-2">
            {preguntas.map((p, i) => (
              <div key={p.id}>
                <label htmlFor={`${id}-${p.id}`} className="block font-semibold leading-snug">
                  {i + 1}. {p.enunciado}
                </label>
                {p.ayuda && <p className="mt-1 text-sm text-pizarra">{p.ayuda}</p>}
                {p.tipo === "opcion" ? (
                  <select
                    id={`${id}-${p.id}`}
                    value={respuestas[p.id] ?? ""}
                    onChange={(e) => {
                      const nuevas = { ...respuestas, [p.id]: e.target.value };
                      setRespuestas(nuevas);
                      setError(null);
                      guardar({ respuestas: nuevas });
                    }}
                    className={campo}
                  >
                    <option value="">Elige una opción</option>
                    {p.opciones?.map((o) => (
                      <option key={o.valor} value={o.valor}>
                        {o.etiqueta}
                      </option>
                    ))}
                  </select>
                ) : (
                  <div className="relative">
                    {p.unidad && (
                      <span className="pointer-events-none absolute left-4 top-1/2 mt-1 -translate-y-1/2 font-semibold text-pizarra">
                        {p.unidad}
                      </span>
                    )}
                    <input
                      id={`${id}-${p.id}`}
                      type="text"
                      inputMode="decimal"
                      autoComplete="off"
                      value={respuestas[p.id] ?? ""}
                      placeholder="0"
                      onChange={(e) => {
                        const nuevas = { ...respuestas, [p.id]: e.target.value };
                        setRespuestas(nuevas);
                        setError(null);
                        guardar({ respuestas: nuevas });
                      }}
                      className={`${campo} tabular-nums ${p.unidad ? "pl-12" : ""}`}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        </fieldset>

        <fieldset className="mt-9">
          <legend className="flex items-center gap-3 text-lg font-bold">
            <Numero n={3} /> Tu mensaje al gerente
          </legend>
          <label htmlFor={`${id}-solucion`} className="mt-2 block max-w-[66ch] text-sm leading-relaxed text-pizarra">
            Qué limpiaste en los datos y qué le advertirías antes del directorio.
          </label>
          <textarea
            id={`${id}-solucion`}
            rows={6}
            maxLength={MAXIMO}
            value={solucion}
            onChange={(e) => {
              setSolucion(e.target.value);
              setError(null);
              guardar({ solucion: e.target.value });
            }}
            placeholder="Ricardo: antes de armar el tablero separé las devoluciones y unifiqué…"
            className={`${campo} resize-y p-4 leading-relaxed`}
          />
        </fieldset>

        {error && (
          <p role="alert" className="mt-5 text-sm font-semibold text-alerta">
            {error}
          </p>
        )}

        {!pideCuenta && (
          <button
            type="submit"
            disabled={enviando}
            className="mt-7 inline-flex w-full items-center justify-center rounded-xl bg-cobalto px-6 py-3.5 font-bold text-blanco transition-colors hover:bg-cobalto-hondo disabled:cursor-wait disabled:opacity-80 sm:w-auto"
          >
            {enviando ? "Comprobando tu entrega…" : "Entregar y comprobar"}
          </button>
        )}
        {usuario && (
          <p className="mt-3 text-xs text-pizarra">Tu avance se guarda en tu cuenta mientras escribes.</p>
        )}
      </form>

      {pideCuenta && !usuario && (
        <div className="revelado">
          <FormularioIngreso
            enLinea
            titulo="Crea tu cuenta para guardar tu entrega"
            texto="Así tu resultado queda en tu portafolio y puedes postular a la empresa. Lo que ya escribiste no se pierde."
            alIngresar={() => void enviar()}
          />
          {enviando && (
            <p role="status" className="mt-3 text-sm font-semibold text-cobalto">
              Comprobando tu entrega…
            </p>
          )}
        </div>
      )}
    </section>
  );
}

function Aprobada({
  practica,
  preguntas,
  resultado,
  oportunidades,
  solucion,
  enlace,
  archivo,
  tituloRef,
}: {
  practica: Practica;
  preguntas: PreguntaComprobacion[];
  resultado: ResultadoComprobacion;
  oportunidades: PuertaAbierta[];
  solucion: string;
  enlace: string;
  archivo: string | null;
  tituloRef: React.RefObject<HTMLHeadingElement | null>;
}) {
  const { urlArchivo } = useSesion();
  const [abriendo, setAbriendo] = useState(false);
  const imagen = practica.referencia && /\.(png|jpe?g|webp)$/i.test(practica.referencia.url) ? practica.referencia : null;

  async function abrirArchivo() {
    if (!archivo) return;
    setAbriendo(true);
    const url = await urlArchivo(archivo);
    setAbriendo(false);
    if (url) window.open(url, "_blank", "noopener,noreferrer");
  }

  return (
    <section id="desenlace" aria-labelledby="titulo-aprobada" className="revelado mt-14 scroll-mt-6 space-y-6">
      <div className="rounded-3xl bg-lima p-6 sm:p-9">
        <p className="text-sm font-bold uppercase tracking-[0.08em] text-lima-hondo">Proyecto aprobado</p>
        <h2
          id="titulo-aprobada"
          ref={tituloRef}
          tabIndex={-1}
          className="mt-2 text-3xl font-extrabold tracking-[-0.04em] outline-none sm:text-4xl"
        >
          Acertaste {resultado.aciertos} de {resultado.total} cifras
        </h2>
        <p className="mt-3 max-w-[62ch] leading-relaxed">
          Tu entrega quedó en tu portafolio y ya cuenta como requisito de la ruta
          {oportunidades.length > 0 ? ". Desbloqueaste una oportunidad real:" : "."}
        </p>
      </div>

      {oportunidades.length > 0 && (
        <section aria-labelledby="titulo-desbloqueo" className="rounded-3xl bg-tinta p-6 text-blanco sm:p-8">
          <h3 id="titulo-desbloqueo" className="text-xl font-bold tracking-[-0.02em] text-lima">
            Desbloqueaste {oportunidades.length === 1 ? "esta oportunidad" : "estas oportunidades"}
          </h3>
          <ul className="mt-5 space-y-3">
            {oportunidades.map((o) => (
              <li
                key={o.id}
                className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3 rounded-2xl bg-blanco/10 p-4 sm:px-5"
              >
                <div className="min-w-0 flex-[1_1_18rem]">
                  <p className="text-xs font-semibold opacity-75">{o.empresa}</p>
                  <p className="mt-0.5 font-bold leading-snug">{o.titulo}</p>
                  <p className="mt-1 text-sm">{o.compensacion}</p>
                </div>
                <Link
                  href={`/oportunidades/${o.id}#postular`}
                  className="inline-flex items-center justify-center rounded-xl bg-lima px-6 py-3 font-bold text-tinta transition-colors hover:bg-blanco"
                >
                  Postular ahora
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section aria-labelledby="titulo-esperado" className="rounded-3xl border border-linea bg-blanco p-6 sm:p-8">
        <h3 id="titulo-esperado" className="text-xl font-bold tracking-[-0.02em]">
          Resultado esperado
        </h3>
        <p className="mt-1 text-sm text-pizarra">Compara tus cifras con las correctas y por qué lo son.</p>
        <div className="mt-5 overflow-x-auto">
          <table className="w-full min-w-[36rem] text-left text-sm">
            <thead>
              <tr className="border-b border-linea text-pizarra">
                <th scope="col" className="py-2 pr-4 font-semibold">Pregunta</th>
                <th scope="col" className="py-2 pr-4 font-semibold">Tu respuesta</th>
                <th scope="col" className="py-2 font-semibold">Respuesta esperada</th>
              </tr>
            </thead>
            <tbody>
              {preguntas.map((p) => {
                const r = resultado.detalle.find((d) => d.id === p.id);
                return (
                  <tr key={p.id} className="border-b border-linea align-top last:border-0">
                    <th scope="row" className="py-3 pr-4 font-semibold leading-snug">
                      {p.enunciado}
                    </th>
                    <td className="py-3 pr-4">
                      <span className="flex items-start gap-2">
                        <Marca correcta={!!r?.correcta} />
                        <span className="tabular-nums">{mostrarRespuesta(p, r?.respuesta ?? "")}</span>
                      </span>
                    </td>
                    <td className="py-3">
                      <p className="font-bold tabular-nums">{r?.esperado}</p>
                      {r?.explicacion && <p className="mt-1 leading-relaxed text-pizarra">{r.explicacion}</p>}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {imagen && (
          <figure className="mt-7">
            <Image
              src={imagen.url}
              alt="Dashboard de referencia: ventas netas por mes, por zona, por categoría, por vendedor y los diez clientes principales unificados por RUC."
              width={1760}
              height={1100}
              className="h-auto w-full rounded-2xl border border-linea"
            />
            <figcaption className="mt-3 flex flex-wrap items-center justify-between gap-3 text-sm text-pizarra">
              <span className="max-w-[60ch]">{imagen.descripcion}</span>
              <a
                href={imagen.url}
                download
                className="inline-flex items-center gap-2 rounded-xl border border-linea px-4 py-2.5 font-bold text-tinta hover:border-tinta"
              >
                <IconoDescarga />
                Descargar
              </a>
            </figcaption>
          </figure>
        )}
      </section>

      <div className="grid gap-6 lg:grid-cols-[1.3fr_1fr]">
        <section className="rounded-3xl border border-linea bg-blanco p-6 sm:p-8">
          <h3 className="text-lg font-bold">Qué pasó en este caso</h3>
          <dl className="mt-4 space-y-4 text-sm leading-relaxed">
            <div>
              <dt className="font-bold">Lo que hizo el junior</dt>
              <dd className="mt-1 text-pizarra">{practica.lo_que_hice}</dd>
            </div>
            <div>
              <dt className="font-bold">Qué pasó después</dt>
              <dd className="mt-1 text-pizarra">{practica.que_paso}</dd>
            </div>
            <div>
              <dt className="font-bold">Lo que no te enseña la universidad</dt>
              <dd className="mt-1 text-pizarra">{practica.aprendizaje}</dd>
            </div>
          </dl>
        </section>
        <section className="rounded-3xl border border-linea bg-blanco p-6 sm:p-8">
          <h3 className="text-lg font-bold">Tu entrega</h3>
          <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-pizarra">{solucion}</p>
          <div className="mt-4 flex flex-col items-start gap-2 text-sm font-semibold">
            {archivo && (
              <button type="button" onClick={() => void abrirArchivo()} className="text-cobalto underline underline-offset-4">
                {abriendo ? "Abriendo…" : "Ver el archivo que subiste"}
              </button>
            )}
            {enlace && (
              <a
                href={enlace}
                target="_blank"
                rel="noopener noreferrer"
                className="break-all text-cobalto underline underline-offset-4"
              >
                {enlace}
              </a>
            )}
          </div>
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
          href="/rutas/desarrollador-erp-junior"
          className="inline-flex items-center justify-center rounded-xl border border-linea bg-blanco px-6 py-3.5 font-bold text-tinta transition-colors hover:border-tinta"
        >
          Ver mi avance en la ruta
        </Link>
      </div>
    </section>
  );
}

function mostrarRespuesta(p: PreguntaComprobacion, valor: string): string {
  if (!valor) return "sin responder";
  if (p.tipo === "opcion") return p.opciones?.find((o) => o.valor === valor)?.etiqueta ?? valor;
  if (!p.unidad) return valor;
  // Si la persona ya escribió la unidad («S/ 2 329 351»), no se repite.
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

function Numero({ n }: { n: number }) {
  return (
    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-cielo text-sm font-bold text-cobalto">
      {n}
    </span>
  );
}

