import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { AvisoDemoEmpresa } from "@/components/empresa/AvisoDemoEmpresa";
import { DecisionPostulante } from "@/components/empresa/DecisionPostulante";
import { IconoArchivo, IconoCheck } from "@/components/ui/Iconos";
import { EMPRESA_DEMO, obtenerPostulanteDemo } from "@/lib/empresa-demo";
import { obtenerOportunidades } from "@/lib/oportunidades";
import { obtenerProyectos } from "@/lib/proyectos";
import { proyectosRequeridos } from "@/lib/requisitos";
import { obtenerRuta } from "@/lib/rutas";
import { fechaLarga } from "@/lib/texto";

export default function PaginaPostulante({ params }: { params: Promise<{ id: string }> }) {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 pt-10 sm:px-6">
      <Link href="/empresa" className="text-sm font-semibold text-pizarra hover:text-tinta">
        ← Volver a postulaciones
      </Link>
      <Suspense fallback={<div className="mt-6 h-96 rounded-3xl border border-linea bg-blanco" aria-busy="true" />}>
        <Contenido params={params} />
      </Suspense>
    </div>
  );
}

async function Contenido({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const p = obtenerPostulanteDemo(id);
  if (!p) notFound();

  const [oportunidades, proyectos] = await Promise.all([
    obtenerOportunidades().catch(() => []),
    obtenerProyectos().catch(() => []),
  ]);
  const aviso = oportunidades.find((o) => o.empresa === EMPRESA_DEMO.nombre);
  const ruta = obtenerRuta(aviso?.ruta);
  const requeridos = aviso ? proyectosRequeridos(aviso, proyectos) : [];
  const proyecto = requeridos.find((x) => x.comprobacion?.length) ?? requeridos[0];
  const preguntas = proyecto?.comprobacion ?? [];

  return (
    <>
      <header className="mt-6 flex flex-wrap items-center gap-5">
        <span aria-hidden="true" className="flex h-16 w-16 items-center justify-center rounded-2xl bg-cielo text-2xl font-extrabold text-cobalto">
          {p.nombre.charAt(0)}
        </span>
        <div className="min-w-0">
          <p className="text-sm font-bold text-cobalto">Postulación{aviso ? ` a «${aviso.titulo}»` : ""}</p>
          <h1 className="text-4xl font-extrabold tracking-[-0.045em]">{p.nombre}</h1>
          <p className="mt-1 text-pizarra">
            {p.perfil} · enviada el {fechaLarga(p.enviada)}
          </p>
        </div>
      </header>
      <div className="mt-6">
        <AvisoDemoEmpresa />
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1.5fr_1fr] lg:items-start">
        <div className="space-y-6">
          <section className="rounded-3xl bg-tinta p-6 text-blanco sm:p-8">
            <p className="text-sm font-bold text-lima">Requisito cumplido</p>
            <p className="mt-2 text-2xl font-extrabold leading-snug tracking-[-0.03em]">
              {ruta ? `Ruta ${ruta.puesto}, etapa ${aviso?.etapa_requerida}` : "Proyecto de la ruta aprobado"}
            </p>
            <dl className="mt-5 grid grid-cols-3 gap-3 text-center">
              <Dato valor={`${p.aciertos}/${p.total}`} etiqueta="cifras correctas" />
              <Dato valor={String(p.intentos)} etiqueta={p.intentos === 1 ? "intento" : "intentos"} />
              <Dato valor="80 %" etiqueta="mínimo para aprobar" />
            </dl>
          </section>

          <section className="rounded-3xl border border-linea bg-blanco p-6 sm:p-8">
            <h2 className="text-xl font-extrabold tracking-[-0.02em]">Las cifras de su entrega</h2>
            {proyecto && <p className="mt-1 text-sm text-pizarra">Proyecto: {proyecto.titulo}</p>}
            <table className="mt-4 w-full text-left text-sm">
              <thead>
                <tr className="border-b border-linea text-xs uppercase tracking-[0.06em] text-pizarra">
                  <th scope="col" className="py-2 pr-3 font-bold">Pregunta</th>
                  <th scope="col" className="py-2 pr-3 font-bold">Su respuesta</th>
                  <th scope="col" className="py-2 font-bold">
                    <span className="sr-only">Resultado</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-linea">
                {(preguntas.length > 0 ? preguntas.map((q) => ({ id: q.id, enunciado: q.enunciado })) : Object.keys(p.respuestas).map((k) => ({ id: k, enunciado: k }))).map((q) => {
                  const r = p.respuestas[q.id];
                  return (
                    <tr key={q.id}>
                      <td className="py-3 pr-3 leading-snug">{q.enunciado}</td>
                      <td className="py-3 pr-3 font-bold">{r?.valor ?? "—"}</td>
                      <td className="py-3 text-right">
                        {r?.correcta ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-lima-suave px-2.5 py-1 text-xs font-bold text-lima-hondo">
                            <IconoCheck className="h-3.5 w-3.5" />
                            Correcta
                          </span>
                        ) : (
                          <span className="rounded-full bg-niebla px-2.5 py-1 text-xs font-bold text-alerta">No coincide</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </section>

          <section className="rounded-3xl border border-linea bg-blanco p-6 sm:p-8">
            <h2 className="text-xl font-extrabold tracking-[-0.02em]">Lo que le explicó al gerente</h2>
            <p className="mt-3 leading-relaxed">{p.explicacion}</p>
            <div className="mt-6 overflow-hidden rounded-2xl border border-linea">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/recursos/dashboard-ventas-power-bi/dashboard_esperado.png"
                alt="Vista previa de ejemplo de un tablero de ventas"
                className="h-auto w-full"
              />
              <p className="flex items-center gap-2 border-t border-linea bg-niebla px-4 py-3 text-sm">
                <IconoArchivo />
                <span className="font-bold">{p.archivo}</span>
                <span className="text-pizarra">· vista previa de ejemplo</span>
              </p>
            </div>
          </section>
        </div>

        <aside className="space-y-4 lg:sticky lg:top-6">
          <DecisionPostulante inicial={p.estado} nombre={p.nombre} />
          <section className="rounded-3xl border border-linea bg-blanco p-6">
            <h2 className="font-extrabold">Su mensaje</h2>
            <p className="mt-2 text-sm leading-relaxed">{p.mensaje}</p>
            <h2 className="mt-5 font-extrabold">Contacto</h2>
            <p className="mt-1 text-sm text-pizarra">{p.correo}</p>
            <button
              type="button"
              disabled
              className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-linea px-5 py-3 text-sm font-bold text-pizarra"
            >
              <IconoArchivo />
              CV de ejemplo (no disponible)
            </button>
          </section>
        </aside>
      </div>
    </>
  );
}

function Dato({ valor, etiqueta }: { valor: string; etiqueta: string }) {
  return (
    <div className="rounded-2xl bg-blanco/10 px-2 py-3">
      <dt className="sr-only">{etiqueta}</dt>
      <dd className="text-2xl font-extrabold">{valor}</dd>
      <dd className="text-xs opacity-80">{etiqueta}</dd>
    </div>
  );
}
