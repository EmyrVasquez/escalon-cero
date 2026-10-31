import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { AvisoDemoEmpresa } from "@/components/empresa/AvisoDemoEmpresa";
import { EstadoChip } from "@/components/empresa/EstadoChip";
import { EtiquetaTipo } from "@/components/oportunidades/EtiquetaOportunidad";
import { IconoCalendario, IconoChevron } from "@/components/ui/Iconos";
import { Ilustracion } from "@/components/ui/Ilustracion";
import { EMPRESA_DEMO, POSTULANTES_DEMO } from "@/lib/empresa-demo";
import { obtenerOportunidades } from "@/lib/oportunidades";
import { obtenerRuta } from "@/lib/rutas";
import { fechaLarga } from "@/lib/texto";

export const metadata: Metadata = { title: "Espacio de empresa" };

export default function Empresa() {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 pt-10 sm:px-6">
      <div className="flex flex-wrap items-end justify-between gap-6">
        <div>
          <p className="text-sm font-bold text-cobalto">Tu espacio de empresa · {EMPRESA_DEMO.nombre}</p>
          <h1 className="mt-1 text-4xl font-extrabold tracking-[-0.045em] sm:text-5xl">Avisos y postulaciones</h1>
        </div>
        <Link
          href="/empresa/nuevo"
          className="inline-flex items-center justify-center rounded-xl bg-cobalto px-6 py-3.5 font-bold text-blanco hover:bg-cobalto-hondo"
        >
          Publicar un aviso
        </Link>
      </div>
      <div className="mt-6">
        <AvisoDemoEmpresa />
      </div>

      <section aria-labelledby="titulo-avisos" className="mt-10">
        <h2 id="titulo-avisos" className="text-2xl font-bold tracking-[-0.03em]">
          Mis avisos
        </h2>
        <Suspense fallback={<div className="mt-4 h-40 rounded-3xl border border-linea bg-blanco" aria-busy="true" />}>
          <MisAvisos />
        </Suspense>
      </section>

      <section aria-labelledby="titulo-postulaciones" className="mt-12">
        <div className="flex flex-wrap items-baseline justify-between gap-3">
          <h2 id="titulo-postulaciones" className="text-2xl font-bold tracking-[-0.03em]">
            Postulaciones para revisar
          </h2>
          <span className="text-sm text-pizarra">{POSTULANTES_DEMO.length} recibidas</span>
        </div>
        <ul className="mt-4 divide-y divide-linea overflow-hidden rounded-3xl border border-linea bg-blanco">
          {POSTULANTES_DEMO.map((p) => (
            <li key={p.id}>
              <Link
                href={`/empresa/postulaciones/${p.id}`}
                className="group flex flex-wrap items-center gap-x-6 gap-y-3 px-5 py-5 hover:bg-niebla sm:px-6"
              >
                <span aria-hidden="true" className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-cielo font-extrabold text-cobalto">
                  {p.nombre.charAt(0)}
                </span>
                <span className="min-w-0 flex-[1_1_14rem]">
                  <span className="block font-extrabold group-hover:text-cobalto">{p.nombre}</span>
                  <span className="block text-sm text-pizarra">{p.perfil}</span>
                </span>
                <span className="flex flex-[1_1_16rem] flex-wrap items-center gap-2 text-sm">
                  <span className="rounded-full bg-lima-suave px-3 py-1 font-bold text-lima-hondo">
                    Proyecto aprobado · {p.aciertos} de {p.total}
                  </span>
                  <span className="text-pizarra">{fechaLarga(p.enviada)}</span>
                </span>
                <EstadoChip estado={p.estado} />
                <IconoChevron className="hidden h-5 w-5 text-pizarra group-hover:text-cobalto sm:block" />
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

async function MisAvisos() {
  const avisos = (await obtenerOportunidades().catch(() => [])).filter((o) => o.empresa === EMPRESA_DEMO.nombre);
  if (avisos.length === 0) {
    return (
      <p className="mt-4 rounded-3xl border border-dashed border-linea bg-blanco p-6 text-pizarra">Todavía no tienes avisos publicados.</p>
    );
  }
  return (
    <ul className="mt-4 grid gap-4">
      {avisos.map((o) => {
        const ruta = obtenerRuta(o.ruta);
        return (
          <li key={o.id} className="flex flex-wrap items-center gap-6 rounded-3xl border border-linea bg-blanco p-6">
            <Ilustracion nombre={o.tipo === "reto_con_premio" ? "ficha-reto" : "ficha-encargo"} className="h-16 w-auto" />
            <div className="min-w-0 flex-[1_1_20rem]">
              <div className="flex flex-wrap items-center gap-2">
                <EtiquetaTipo tipo={o.tipo} />
                <span className="rounded-full bg-cielo px-2.5 py-0.5 text-xs font-bold text-cobalto">
                  {o.estado === "abierta" ? "Abierto" : "Cerrado"}
                </span>
              </div>
              <h3 className="mt-2 text-xl font-extrabold tracking-[-0.02em]">{o.titulo}</h3>
              <p className="mt-1 text-sm text-pizarra">
                {ruta ? `Pide: ruta ${ruta.puesto} hasta la etapa ${o.etapa_requerida}` : "Sin ruta requerida"} ·{" "}
                {POSTULANTES_DEMO.length} postulaciones
              </p>
            </div>
            <div className="flex flex-col items-start gap-2 text-sm">
              {o.cierra && (
                <span className="inline-flex items-center gap-1.5 text-pizarra">
                  <IconoCalendario />
                  Cierra el {fechaLarga(o.cierra)}
                </span>
              )}
              <Link href={`/oportunidades/${o.id}`} className="font-bold text-cobalto hover:underline">
                Ver el aviso publicado
              </Link>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
