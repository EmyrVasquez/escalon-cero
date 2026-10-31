"use client";

import Link from "next/link";
import { etiquetaArea } from "@/lib/areas";
import { enFrase } from "@/lib/texto";
import { useSesion } from "@/lib/sesion";
import { AvisoSesion } from "@/components/cuenta/AvisoSesion";
import { SimboloEscalon } from "@/components/layout/Logo";

export function PortafolioVista() {
  const { usuario, nombre, portafolio, quitarEntrega } = useSesion();

  return (
    <>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="hidden items-center gap-2 print:flex">
            <SimboloEscalon className="h-6 w-auto text-cobalto" />
            <span className="font-bold">Escalón Cero</span>
          </div>
          <h1 className="text-4xl font-extrabold tracking-[-0.045em] sm:text-5xl">Mi portafolio</h1>
          <p className="no-imprimir mt-3 max-w-[60ch] leading-relaxed text-pizarra">
            Tus entregas, con el encargo y los criterios que revisaste. Se guardan en tu
            cuenta y se adjuntan a tus postulaciones; para compartirlas, guárdalas como PDF.
          </p>
          <p className="no-imprimir mt-3 flex flex-wrap gap-x-5 gap-y-1 text-sm font-bold">
            <Link href="/en-curso" className="text-cobalto hover:underline">
              Proyectos en curso
            </Link>
            <Link href="/oportunidades" className="text-cobalto hover:underline">
              Oportunidades para postular
            </Link>
          </p>
        </div>
        {portafolio && portafolio.length > 0 && (
          <button
            type="button"
            onClick={() => window.print()}
            className="no-imprimir shrink-0 rounded-xl border border-linea bg-blanco px-5 py-3 font-bold hover:border-tinta"
          >
            Guardar como PDF
          </button>
        )}
      </div>

      {usuario && nombre && (
        <p className="mt-2 hidden font-semibold print:block">{nombre}</p>
      )}

      {usuario === null ? (
        <div className="mt-8">
          <AvisoSesion
            titulo="Ingresa para ver tu portafolio"
            texto="Tu portafolio reúne los proyectos que entregaste. Se guarda en tu cuenta para que no se pierda al cerrar el navegador."
          />
        </div>
      ) : portafolio === undefined ? (
        <div className="mt-8 h-56 rounded-2xl border border-linea bg-blanco" aria-hidden="true" />
      ) : portafolio.length === 0 ? (
        <div className="mt-8 rounded-3xl border border-dashed border-linea bg-blanco p-8">
          <h2 className="text-lg font-bold">Tu portafolio está vacío</h2>
          <p className="mt-2 max-w-[55ch] leading-relaxed text-pizarra">
            Cada proyecto que entregues aparecerá aquí, listo para mostrar cómo
            resuelves el trabajo.
          </p>
          <Link
            href="/rutas"
            className="mt-5 inline-flex rounded-xl bg-cobalto px-6 py-3 font-bold text-blanco hover:bg-cobalto-hondo"
          >
            Elegir mi ruta
          </Link>
        </div>
      ) : (
        <ol className="mt-10 space-y-6">
          {portafolio.map((e) => (
            <li key={e.proyectoId} className="entrada-portafolio">
              <article className="rounded-3xl border border-linea bg-blanco p-6 sm:p-8">
                <p className="text-sm font-semibold text-cobalto">
                  {etiquetaArea(e.area)}
                </p>
                <h2 className="mt-1 text-2xl font-bold tracking-[-0.03em]">{e.titulo}</h2>
                <p className="mt-1 text-sm text-pizarra">
                  Como {enFrase(e.rol)}. Entregado el{" "}
                  {new Date(e.entregado).toLocaleDateString("es-PE", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                  .
                </p>
                {e.herramientas && e.herramientas.length > 0 && (
                  <ul className="mt-3 flex flex-wrap gap-2 text-[0.82rem] font-semibold" aria-label="Herramientas">
                    {e.herramientas.map((h) => (
                      <li key={h} className="rounded-full border border-linea bg-niebla px-2.5 py-0.5">
                        {h}
                      </li>
                    ))}
                  </ul>
                )}

                <h3 className="mt-6 font-bold">Mi solución</h3>
                <p className="mt-2 whitespace-pre-wrap leading-relaxed text-pizarra">{e.solucion}</p>
                {e.enlace && (
                  <a
                    href={e.enlace}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-2 inline-block break-all text-sm font-semibold text-cobalto underline underline-offset-4"
                  >
                    {e.enlace}
                  </a>
                )}

                {e.criterios.length > 0 && (
                  <>
                    <h3 className="mt-6 font-bold">
                      Criterios cumplidos: {e.criteriosCumplidos.length} de {e.criterios.length}
                    </h3>
                    <ul className="mt-3 space-y-2 text-sm leading-relaxed">
                      {e.criterios.map((c) => {
                        const cumplido = e.criteriosCumplidos.includes(c);
                        return (
                          <li key={c} className="flex items-start gap-2.5">
                            <span
                              aria-hidden="true"
                              className={`mt-1 h-3 w-3 shrink-0 rounded-full ${
                                cumplido ? "bg-cobalto" : "border border-pizarra"
                              }`}
                            />
                            <span className={cumplido ? "" : "text-pizarra"}>
                              <span className="sr-only">{cumplido ? "Cumplido: " : "Pendiente: "}</span>
                              {c}
                            </span>
                          </li>
                        );
                      })}
                    </ul>
                  </>
                )}

                <div className="no-imprimir mt-6 flex flex-wrap gap-4 border-t border-linea pt-5 text-sm font-bold">
                  <Link href={`/proyectos/${e.proyectoId}`} className="text-cobalto hover:underline">
                    Ver el proyecto
                  </Link>
                  <button
                    type="button"
                    onClick={() => {
                      if (window.confirm("¿Quitar esta entrega de tu portafolio? No se puede deshacer.")) {
                        void quitarEntrega(e.proyectoId);
                      }
                    }}
                    className="text-pizarra hover:text-alerta"
                  >
                    Quitar del portafolio
                  </button>
                </div>
              </article>
            </li>
          ))}
        </ol>
      )}
    </>
  );
}
