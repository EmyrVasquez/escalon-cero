"use client";

import Link from "next/link";
import { useSesion } from "@/lib/sesion";
import { AvisoSesion } from "./AvisoSesion";
import { ETIQUETAS_TIPO_OPORTUNIDAD, type TipoOportunidad } from "@/lib/tipos";

const FECHA = new Intl.DateTimeFormat("es-PE", { day: "numeric", month: "long" });

export function PostulacionesVista() {
  const { usuario, postulaciones } = useSesion();

  if (usuario === null) {
    return (
      <div className="mt-8">
        <AvisoSesion
          titulo="Ingresa para ver tus postulaciones"
          texto="Tus postulaciones quedan en tu cuenta, junto con los proyectos que adjuntaste."
        />
      </div>
    );
  }

  if (postulaciones === undefined) {
    return <div className="mt-8 h-48 rounded-2xl border border-linea bg-blanco" aria-hidden="true" />;
  }

  if (postulaciones.length === 0) {
    return (
      <div className="mt-8 rounded-3xl border border-dashed border-linea bg-blanco p-8">
        <h2 className="text-lg font-bold">Todavía no postulas a ninguna oportunidad</h2>
        <p className="mt-2 max-w-[55ch] leading-relaxed text-pizarra">
          Elige una oportunidad, avanza la ruta que pide y postula con tus proyectos
          como prueba de lo que sabes hacer.
        </p>
        <Link
          href="/oportunidades"
          className="mt-5 inline-flex rounded-xl bg-cobalto px-6 py-3 font-bold text-blanco hover:bg-cobalto-hondo"
        >
          Ver oportunidades
        </Link>
      </div>
    );
  }

  return (
    <ul className="mt-8 divide-y divide-linea overflow-hidden rounded-2xl border border-linea bg-blanco">
      {postulaciones.map((p) => (
        <li key={p.oportunidadId}>
          <Link
            href={`/oportunidades/${p.oportunidadId}`}
            className="flex flex-wrap items-start justify-between gap-x-6 gap-y-3 px-5 py-5 transition-colors hover:bg-niebla sm:px-6"
          >
            <div className="min-w-0 flex-[1_1_20rem]">
              <p className="text-sm font-semibold text-cobalto">
                {ETIQUETAS_TIPO_OPORTUNIDAD[p.tipo as TipoOportunidad] ?? "Oportunidad"} · {p.empresa}
              </p>
              <p className="mt-1 text-lg font-bold leading-snug tracking-[-0.02em]">{p.titulo}</p>
              <p className="mt-1.5 text-sm text-pizarra">
                {p.compensacion}
                {p.practicas.length > 0 && ` · Adjuntaste: ${p.practicas.join(", ")}`}
              </p>
            </div>
            <div className="text-sm">
              <span className="inline-flex rounded-full bg-cielo px-3 py-1 font-bold text-cobalto-hondo">
                En revisión
              </span>
              <p className="mt-1.5 text-pizarra">Enviada el {FECHA.format(new Date(p.enviada))}</p>
            </div>
          </Link>
        </li>
      ))}
    </ul>
  );
}
