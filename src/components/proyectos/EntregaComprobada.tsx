"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useId, useState } from "react";
import { useSesion } from "@/lib/sesion";
import type { Proyecto, PreguntaComprobacion, ResultadoComprobacion } from "@/lib/tipos";
import { FormularioIngreso } from "@/components/cuenta/FormularioIngreso";
import type { PuertaAbierta } from "@/components/proyectos/EntregaLibre";

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
  proyecto,
  preguntas,
  oportunidades,
}: {
  proyecto: Proyecto;
  preguntas: PreguntaComprobacion[];
  oportunidades: PuertaAbierta[];
}) {
  const { usuario, portafolio, borradores, comprobar, guardarBorrador } = useSesion();
  const entrada = portafolio?.find((e) => e.proyectoId === proyecto.id);
  const borrador = borradores?.[proyecto.id];

  const [respuestasEditadas, setRespuestas] = useState<Record<string, string> | null>(null);
  const [solucionEditada, setSolucion] = useState<string | null>(null);
  const [enlaceEditado, setEnlace] = useState<string | null>(null);
  const [archivo, setArchivo] = useState<File | null>(null);
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pideCuenta, setPideCuenta] = useState(false);
  const [resultadoReciente, setResultadoReciente] = useState<ResultadoComprobacion | null>(null);
  const router = useRouter();
  const id = useId();

  const respuestas = respuestasEditadas ?? borrador?.respuestas ?? entrada?.respuestas ?? {};
  const solucion = solucionEditada ?? borrador?.solucion ?? entrada?.solucion ?? "";
  const enlace = enlaceEditado ?? borrador?.enlace ?? entrada?.enlace ?? "";
  const resultado = resultadoReciente ?? entrada?.resultado ?? null;
  const aprobada = resultado?.aprobada === true;
  const archivoPrevio = entrada?.archivo ?? null;

  function guardar(cambios: { respuestas?: Record<string, string>; solucion?: string; enlace?: string }) {
    if (!usuario) return;
    guardarBorrador({
      proyectoId: proyecto.id,
      titulo: proyecto.titulo,
      area: proyecto.carrera,
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
      proyectoId: proyecto.id,
      titulo: proyecto.titulo,
      area: proyecto.carrera,
      rol: proyecto.rol,
      herramientas: proyecto.herramientas,
      criterios: proyecto.criterios,
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
    router.push(`/proyectos/${proyecto.id}/resultado`);
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
      <section id="entrega" className="mt-14 scroll-mt-6">
        <div className="flex flex-wrap items-center gap-x-8 gap-y-5 rounded-3xl bg-lima p-6 sm:p-8">
          <div className="min-w-0 flex-[1_1_22rem]">
            <p className="text-sm font-bold uppercase tracking-[0.08em] text-lima-hondo">Proyecto aprobado</p>
            <h2 className="mt-1 text-2xl font-extrabold tracking-[-0.03em]">
              Acertaste {resultado.aciertos} de {resultado.total} cifras
            </h2>
            {oportunidades.length > 0 && (
              <p className="mt-1 leading-relaxed">Ya puedes postular a {oportunidades[0].empresa}.</p>
            )}
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Link
              href={`/proyectos/${proyecto.id}/resultado`}
              className="inline-flex items-center justify-center rounded-xl bg-tinta px-6 py-3.5 font-bold text-blanco hover:bg-black"
            >
              Ver mi resultado
            </Link>
          </div>
        </div>
      </section>
    );
  }

  const campo =
    "mt-2 w-full rounded-xl border border-linea bg-niebla px-4 py-3 outline-none transition-colors focus:border-cobalto focus:bg-blanco";

  return (
    <section id="entrega" aria-labelledby={`${id}-titulo`} className="mt-14 scroll-mt-6 space-y-6">
      {resultado && !resultado.aprobada && (
        <p className="rounded-2xl border border-alerta/40 bg-blanco px-5 py-4 text-sm leading-relaxed sm:px-6">
          <span className="font-bold">Tu último intento: {resultado.aciertos} de {resultado.total} cifras.</span>{" "}
          Necesitas {resultado.minimo} para aprobar.{" "}
          <Link href={`/proyectos/${proyecto.id}/resultado`} className="font-bold text-cobalto underline underline-offset-4">
            Ver las pistas
          </Link>
        </p>
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
            {enviando ? "Comprobando tus cifras…" : "Entregar y comprobar"}
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

function Numero({ n }: { n: number }) {
  return (
    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-cielo text-sm font-bold text-cobalto">
      {n}
    </span>
  );
}


/** Estado de la entrega para el resumen de arriba del proyecto. */
export function EstadoEntrega({ proyectoId }: { proyectoId: string }) {
  const { portafolio } = useSesion();
  const resultado = portafolio?.find((e) => e.proyectoId === proyectoId)?.resultado;
  if (!resultado) return null;
  return resultado.aprobada ? (
    <p className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2 rounded-2xl bg-lima px-5 py-4 font-semibold">
      Ya aprobaste este proyecto ({resultado.aciertos} de {resultado.total}).
      <Link href={`/proyectos/${proyectoId}/resultado`} className="font-bold underline underline-offset-4">
        Ver mi resultado
      </Link>
    </p>
  ) : (
    <p className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2 rounded-2xl bg-blanco px-5 py-4 font-semibold">
      Tu último intento: {resultado.aciertos} de {resultado.total} cifras.
      <Link href={`/proyectos/${proyectoId}/resultado`} className="font-bold text-cobalto underline underline-offset-4">
        Ver las pistas
      </Link>
    </p>
  );
}
