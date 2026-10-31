"use client";

import Link from "next/link";
import { useEffect, useId, useRef, useState } from "react";
import { useSesion } from "@/lib/sesion";
import type { EntregaAdjunta, OportunidadResumen } from "@/lib/tipos";
import { AvisoSesion } from "@/components/cuenta/AvisoSesion";
import { IconoCandado, IconoCheck } from "@/components/ui/Iconos";

export interface ProyectoRequerido {
  id: string;
  titulo: string;
  rol: string;
  duracion: string | null;
  etapa: number;
}

interface RutaRequerida {
  slug: string;
  puesto: string;
  etapas: { numero: number; titulo: string }[];
}

const CORREO = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
const PESO_CV = 5 * 1024 * 1024;

export function Postulacion({
  oportunidad,
  proyectos,
  ruta,
  etapaRequerida,
}: {
  oportunidad: Pick<OportunidadResumen, "id" | "titulo" | "empresa" | "tipo" | "compensacion" | "estado">;
  proyectos: ProyectoRequerido[];
  ruta: RutaRequerida | null;
  etapaRequerida: number;
}) {
  const { usuario, portafolio, postulaciones, postular } = useSesion();
  const [nombreEditado, setNombre] = useState<string | null>(null);
  const [correoEditado, setCorreo] = useState<string | null>(null);
  const [mensaje, setMensaje] = useState("");
  const [acepta, setAcepta] = useState(false);
  const [cv, setCv] = useState<File | null>(null);
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const acabaDeEnviar = useRef(false);
  const tituloEnviada = useRef<HTMLHeadingElement>(null);
  const id = useId();

  const nombreRegistrado = usuario?.user_metadata?.nombre;
  const nombre = nombreEditado ?? (typeof nombreRegistrado === "string" ? nombreRegistrado : "");
  const correo = correoEditado ?? usuario?.email ?? "";
  const enviada = postulaciones?.find((p) => p.oportunidadId === oportunidad.id);

  useEffect(() => {
    if (enviada && acabaDeEnviar.current) {
      acabaDeEnviar.current = false;
      tituloEnviada.current?.focus();
    }
  }, [enviada]);

  // Solo cuentan las entregas válidas: en proyectos con comprobación, las aprobadas.
  const entregas = proyectos.map((p) => {
    const encontrada = portafolio?.find((e) => e.proyectoId === p.id);
    return { proyecto: p, entrada: encontrada?.valida ? encontrada : undefined, pendiente: !!encontrada && !encontrada.valida };
  });
  const hechas = entregas.filter((e) => e.entrada).length;
  const completo = hechas === proyectos.length;
  const cerrada = oportunidad.estado === "cerrada";

  async function enviar(evento: React.FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    if (nombre.trim().length < 2) return setError("Escribe tu nombre completo.");
    if (!CORREO.test(correo.trim())) return setError("Escribe un correo válido, por ejemplo nombre@correo.com.");
    if (!cv) return setError("Adjunta tu CV en PDF.");
    if (!cv.name.toLowerCase().endsWith(".pdf")) return setError("Tu CV debe ser un archivo PDF.");
    if (cv.size > PESO_CV) return setError("Tu CV pesa más de 5 MB. Expórtalo de nuevo como PDF más liviano.");
    if (!acepta) return setError("Para postular, acepta que compartamos tu postulación con la empresa.");

    const adjuntas: EntregaAdjunta[] = entregas.flatMap(({ proyecto, entrada }) =>
      entrada
        ? [{ proyecto_id: proyecto.id, titulo: proyecto.titulo, enlace: entrada.enlace || null, solucion: entrada.solucion }]
        : [],
    );

    setError(null);
    setEnviando(true);
    acabaDeEnviar.current = true;
    const fallo = await postular({
      oportunidadId: oportunidad.id,
      titulo: oportunidad.titulo,
      empresa: oportunidad.empresa,
      tipo: oportunidad.tipo,
      compensacion: oportunidad.compensacion,
      nombre: nombre.trim(),
      correo: correo.trim(),
      mensaje: mensaje.trim(),
      entregas: adjuntas,
      cv,
    });
    setEnviando(false);
    if (fallo) {
      acabaDeEnviar.current = false;
      setError(fallo);
    }
  }

  return (
    <section id="postular" aria-labelledby={`${id}-requisitos`} className="mt-12 scroll-mt-6 space-y-6">
      <div className="rounded-3xl border border-linea bg-blanco p-6 sm:p-8">
        <h2 id={`${id}-requisitos`} className="text-2xl font-bold tracking-[-0.03em]">
          Requisito: avanzar la ruta del rol
        </h2>
        <p className="mt-2 max-w-[70ch] leading-relaxed text-pizarra">
          La empresa no pide experiencia previa: pide que hayas seguido la ruta
          {ruta ? <> <span className="font-semibold text-tinta">{ruta.puesto}</span></> : null} hasta la etapa{" "}
          {etapaRequerida}. Tus proyectos entregados se adjuntan a la postulación como prueba.
        </p>

        {ruta && (
          <ol className="mt-5 flex flex-wrap items-center gap-2 text-sm" aria-label="Etapas de la ruta">
            {ruta.etapas.map((e, i) => {
              const pedida = e.numero <= etapaRequerida;
              return (
                <li key={e.numero} className="flex items-center gap-2">
                  <span
                    className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 font-semibold ${
                      pedida ? "bg-cobalto text-blanco" : "border border-linea text-pizarra"
                    }`}
                  >
                    {e.numero}. {e.titulo}
                    <span className="sr-only">{pedida ? " (requerida)" : " (no requerida)"}</span>
                  </span>
                  {i < ruta.etapas.length - 1 && <span aria-hidden="true" className="h-px w-4 bg-linea" />}
                </li>
              );
            })}
          </ol>
        )}

        {proyectos.length === 0 ? (
          <p className="mt-5 text-pizarra">Esta etapa todavía no tiene proyectos publicados.</p>
        ) : (
          <ul className="mt-5 divide-y divide-linea rounded-2xl border border-linea">
            {entregas.map(({ proyecto, entrada, pendiente }) => (
              <li key={proyecto.id} className="flex flex-wrap items-center gap-x-4 gap-y-3 p-4 sm:px-5">
                {entrada ? (
                  <IconoCheck className="h-6 w-6 shrink-0" />
                ) : (
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-niebla text-pizarra">
                    <IconoCandado />
                  </span>
                )}
                <div className="min-w-0 flex-[1_1_16rem]">
                  <p className="text-xs font-semibold text-cobalto">Etapa {proyecto.etapa}</p>
                  <p className="font-bold leading-snug">{proyecto.titulo}</p>
                  <p className="mt-0.5 text-sm text-pizarra">
                    {proyecto.duracion ?? proyecto.rol}
                    {entrada ? " · Aprobado" : pendiente ? " · Entregado, falta aprobar" : ""}
                  </p>
                </div>
                <Link
                  href={`/proyectos/${proyecto.id}`}
                  className={
                    entrada
                      ? "text-sm font-bold text-cobalto hover:underline"
                      : "inline-flex rounded-xl bg-cobalto px-4 py-2.5 text-sm font-bold text-blanco hover:bg-cobalto-hondo"
                  }
                >
                  {entrada ? "Ver mi entrega" : pendiente ? "Corregir mi entrega" : "Hacer el proyecto"}
                </Link>
              </li>
            ))}
          </ul>
        )}
        {ruta && (
          <Link href={`/rutas/${ruta.slug}`} className="mt-4 inline-block text-sm font-bold text-cobalto hover:underline">
            Ver la ruta completa
          </Link>
        )}
      </div>

      {cerrada ? (
        <p className="rounded-3xl border border-dashed border-linea bg-blanco p-6 text-pizarra">
          Esta oportunidad ya cerró. La ruta sigue disponible para prepararte para la próxima.
        </p>
      ) : usuario === null ? (
        <AvisoSesion
          titulo="Ingresa para postular"
          texto="Tu progreso en la ruta se guarda en tu cuenta. Cuando completes los proyectos que pide la empresa, podrás postular desde aquí."
        />
      ) : portafolio === undefined || postulaciones === undefined ? (
        <div className="h-40 rounded-3xl border border-linea bg-blanco" aria-hidden="true" />
      ) : enviada ? (
        <div className="revelado rounded-3xl bg-lima p-6 sm:p-9">
          <h2 ref={tituloEnviada} tabIndex={-1} className="text-3xl font-extrabold tracking-[-0.04em] outline-none sm:text-4xl">
            Postulación enviada
          </h2>
          <p className="mt-3 max-w-[62ch] leading-relaxed">
            Enviamos tu postulación a {oportunidad.empresa} con tus proyectos. El equipo de
            Escalón Cero te escribirá a tu correo con la respuesta.
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/postulaciones"
              className="inline-flex items-center justify-center rounded-xl bg-tinta px-6 py-3.5 font-bold text-blanco hover:bg-black"
            >
              Ver mis postulaciones
            </Link>
            <Link
              href="/oportunidades"
              className="inline-flex items-center justify-center rounded-xl border border-tinta/30 px-6 py-3.5 font-bold text-tinta hover:border-tinta"
            >
              Ver más oportunidades
            </Link>
          </div>
        </div>
      ) : !completo ? (
        <div className="flex flex-wrap items-center gap-x-6 gap-y-3 rounded-3xl border border-dashed border-linea bg-blanco p-6 sm:px-8">
          <IconoCandado className="h-5 w-5 text-pizarra" />
          <p className="min-w-0 flex-[1_1_20rem] leading-relaxed text-pizarra" aria-live="polite">
            Llevas {hechas} de {proyectos.length}. La postulación se desbloquea cuando entregues
            los proyectos de la ruta que pide la empresa.
          </p>
        </div>
      ) : (
        <form onSubmit={enviar} noValidate className="rounded-3xl border border-linea bg-blanco p-6 sm:p-8">
          <h2 className="text-2xl font-bold tracking-[-0.03em]">Postula a esta oportunidad</h2>
          <p className="mt-2 max-w-[70ch] leading-relaxed text-pizarra">
            Cumples el requisito. Enviaremos a la empresa tu CV, tus datos de contacto y
            tus proyectos aprobados.
          </p>
          <div className="mt-6 grid gap-5 sm:grid-cols-2">
            <div>
              <label htmlFor={`${id}-nombre`} className="block font-semibold">
                Nombre completo
              </label>
              <input
                id={`${id}-nombre`}
                autoComplete="name"
                value={nombre}
                maxLength={120}
                onChange={(e) => {
                  setNombre(e.target.value);
                  setError(null);
                }}
                className="mt-2 w-full rounded-xl border border-linea bg-niebla px-4 py-3 outline-none transition-colors focus:border-cobalto focus:bg-blanco"
              />
            </div>
            <div>
              <label htmlFor={`${id}-correo`} className="block font-semibold">
                Correo de contacto
              </label>
              <input
                id={`${id}-correo`}
                type="email"
                autoComplete="email"
                inputMode="email"
                value={correo}
                maxLength={200}
                onChange={(e) => {
                  setCorreo(e.target.value);
                  setError(null);
                }}
                className="mt-2 w-full rounded-xl border border-linea bg-niebla px-4 py-3 outline-none transition-colors focus:border-cobalto focus:bg-blanco"
              />
            </div>
          </div>
          <div className="mt-5">
            <label htmlFor={`${id}-cv`} className="block font-semibold">
              Tu CV
            </label>
            <p className="mt-1 text-sm text-pizarra">En PDF, hasta 5 MB. Tus proyectos aprobados se adjuntan solos.</p>
            <input
              id={`${id}-cv`}
              type="file"
              accept=".pdf,application/pdf"
              onChange={(e) => {
                setCv(e.target.files?.[0] ?? null);
                setError(null);
              }}
              className="mt-2 block w-full rounded-xl border border-dashed border-linea bg-niebla p-3 text-sm file:mr-3 file:rounded-lg file:border-0 file:bg-cobalto file:px-4 file:py-2 file:font-bold file:text-blanco hover:file:bg-cobalto-hondo"
            />
          </div>
          <div className="mt-5">
            <label htmlFor={`${id}-mensaje`} className="block font-semibold">
              ¿Por qué quieres este encargo? <span className="font-normal text-pizarra">(opcional)</span>
            </label>
            <textarea
              id={`${id}-mensaje`}
              rows={4}
              maxLength={1500}
              value={mensaje}
              onChange={(e) => setMensaje(e.target.value)}
              placeholder="Cuéntale a la empresa qué te interesa y cuánto tiempo puedes dedicarle."
              className="mt-2 w-full resize-y rounded-xl border border-linea bg-niebla p-4 leading-relaxed outline-none transition-colors focus:border-cobalto focus:bg-blanco"
            />
          </div>
          <label className="mt-5 flex cursor-pointer items-start gap-3 text-sm leading-relaxed">
            <input
              type="checkbox"
              checked={acepta}
              onChange={(e) => {
                setAcepta(e.target.checked);
                setError(null);
              }}
              className="mt-0.5 h-5 w-5 shrink-0 accent-cobalto"
            />
            Acepto que Escalón Cero comparta mi nombre, mi correo, mi CV y mis entregas con{" "}
            {oportunidad.empresa} solo para evaluar esta postulación.
          </label>

          {error && (
            <p role="alert" className="mt-4 text-sm font-semibold text-alerta">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={enviando}
            className="mt-6 inline-flex w-full items-center justify-center rounded-xl bg-cobalto px-6 py-3.5 font-bold text-blanco transition-colors hover:bg-cobalto-hondo disabled:cursor-wait disabled:opacity-80 sm:w-auto"
          >
            {enviando ? "Enviando…" : "Enviar postulación"}
          </button>
        </form>
      )}
    </section>
  );
}
