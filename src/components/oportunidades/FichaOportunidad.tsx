import Link from "next/link";
import { etiquetaArea } from "@/lib/areas";
import { obtenerOportunidades } from "@/lib/oportunidades";
import { obtenerProyectos } from "@/lib/proyectos";
import { enFrase, fechaLarga } from "@/lib/texto";
import { proyectosRequeridos } from "@/lib/requisitos";
import { obtenerRuta } from "@/lib/rutas";
import { ETIQUETAS_MODALIDAD, ETIQUETAS_RETRIBUCION } from "@/lib/tipos";
import { EtiquetaEjemplo, EtiquetaTipo } from "@/components/oportunidades/EtiquetaOportunidad";
import { FilaOportunidad } from "@/components/oportunidades/FilaOportunidad";
import { IconoCalendario, IconoCandado, IconoLugar } from "@/components/ui/Iconos";
import { ProgresoRequisitos } from "@/components/oportunidades/ProgresoRequisitos";

/** La oportunidad destacada de la portada, con la ruta y los proyectos que pide. */
export async function FichaOportunidadDestacada() {
  const [oportunidades, proyectos] = await Promise.all([obtenerOportunidades(), obtenerProyectos()]);
  const abiertas = oportunidades.filter((o) => o.estado === "abierta");
  const o = abiertas.find((x) => x.destacada) ?? abiertas[0];

  if (!o) {
    return (
      <div className="rounded-3xl border border-dashed border-linea bg-blanco p-8 text-pizarra">
        Estamos conversando con las primeras empresas. Mientras tanto, avanza tu ruta:
        será el requisito para postular.
      </div>
    );
  }

  const requeridas = proyectosRequeridos(o, proyectos);
  const ruta = obtenerRuta(o.ruta);
  const cierre = fechaLarga(o.cierra);

  return (
    <article className="rounded-3xl border border-linea bg-blanco p-6 sm:p-8">
      <div className="flex flex-wrap items-center gap-2">
        <span className="inline-flex rounded-full bg-lima px-3 py-1 text-xs font-bold text-tinta">
          Oportunidad destacada
        </span>
        <EtiquetaTipo tipo={o.tipo} />
      </div>
      <p className="mt-4 text-sm font-semibold text-pizarra">
        <span className="text-tinta">{o.empresa}</span> busca {enFrase(o.rol)} · {etiquetaArea(o.carrera)}
      </p>
      <h2 className="mt-2 text-[1.75rem] font-extrabold leading-[1.15] tracking-[-0.035em] sm:text-[2rem]">
        {o.titulo}
      </h2>

      <div className="mt-5 rounded-2xl bg-tinta px-5 py-4 text-blanco">
        <p className="text-xs font-semibold text-lima">
          {ETIQUETAS_RETRIBUCION[o.tipo]}
        </p>
        <p className="mt-0.5 text-lg font-extrabold leading-snug tracking-[-0.02em]">{o.compensacion}</p>
      </div>

      <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-sm text-pizarra">
        <span className="inline-flex items-center gap-1.5">
          <IconoLugar />
          {ETIQUETAS_MODALIDAD[o.modalidad]}
          {o.ubicacion ? ` · ${o.ubicacion}` : ""}
        </span>
        {cierre && (
          <span className="inline-flex items-center gap-1.5">
            <IconoCalendario />
            Cierra el {cierre}
          </span>
        )}
        {o.es_ejemplo && <EtiquetaEjemplo />}
      </div>

      {requeridas.length > 0 && (
        <div className="mt-6 border-t border-linea pt-5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-sm font-bold">
              Para postular: ruta {ruta?.puesto ?? o.rol} hasta la etapa {o.etapa_requerida}
            </p>
            <ProgresoRequisitos requeridas={requeridas.map((p) => p.id)} />
          </div>
          <ul className="mt-3 space-y-2.5">
            {requeridas.map((p) => (
              <li key={p.id} className="flex items-start gap-2.5 text-sm leading-relaxed">
                <IconoCandado className="mt-0.5 h-4 w-4 shrink-0 text-cobalto" />
                <Link href={`/proyectos/${p.id}`} className="font-semibold hover:text-cobalto hover:underline">
                  Etapa {p.etapa}: {p.titulo}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}

      <Link
        href={`/oportunidades/${o.id}`}
        className="mt-7 inline-flex w-full items-center justify-center rounded-xl border border-linea px-6 py-3.5 font-bold text-tinta transition-colors hover:border-tinta sm:w-auto"
      >
        Ver la oportunidad
      </Link>
    </article>
  );
}

/** Lista corta para la portada: todo menos la oportunidad destacada. */
export async function OportunidadesRecientes() {
  const [oportunidades, proyectos] = await Promise.all([obtenerOportunidades(), obtenerProyectos()]);
  const abiertas = oportunidades.filter((o) => o.estado === "abierta");
  const destacada = abiertas.find((o) => o.destacada) ?? abiertas[0];
  const resto = abiertas.filter((o) => o.id !== destacada?.id).slice(0, 4);

  return (
    <>
      <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2">
        <h2 id="titulo-oportunidades" className="text-2xl font-bold tracking-[-0.03em] sm:text-3xl">
          Oportunidades abiertas
        </h2>
        <Link href="/oportunidades" className="font-bold text-cobalto hover:underline">
          Ver las {abiertas.length} oportunidades
        </Link>
      </div>
      {resto.length === 0 ? (
        <p className="mt-6 rounded-2xl border border-dashed border-linea bg-blanco p-6 text-pizarra">
          Pronto publicaremos más oportunidades.
        </p>
      ) : (
        <ul className="mt-6 divide-y divide-linea overflow-hidden rounded-2xl border border-linea bg-blanco">
          {resto.map((o) => (
            <li key={o.id}>
              <FilaOportunidad oportunidad={o} requeridas={proyectosRequeridos(o, proyectos).map((p) => p.id)} />
            </li>
          ))}
        </ul>
      )}
    </>
  );
}

export function FichaOportunidadCargando() {
  return (
    <div
      aria-busy="true"
      aria-label="Cargando oportunidad destacada"
      className="h-[30rem] animate-pulse rounded-3xl border border-linea bg-blanco motion-reduce:animate-none"
    />
  );
}
