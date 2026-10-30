import Link from "next/link";
import { etiquetaArea } from "@/lib/carreras";
import { obtenerPracticas, obtenerPractica } from "@/lib/practicas";
import { ETIQUETAS_NIVEL } from "@/lib/tipos";
import { EtiquetaVeracidad } from "./EtiquetaVeracidad";
import { IconoCheck, IconoNivel, IconoReloj } from "./Iconos";

export async function FichaDestacada() {
  const practicas = await obtenerPracticas();
  const elegida = practicas.find((p) => p.destacada) ?? practicas[0];
  const practica = elegida ? await obtenerPractica(elegida.id) : null;

  if (!practica) {
    return (
      <div className="rounded-3xl border border-dashed border-linea bg-blanco p-8 text-pizarra">
        Pronto publicaremos el primer proyecto. Mientras tanto, cuéntanos qué
        tarea de tu primer trabajo te habría gustado practicar.
      </div>
    );
  }

  return (
    <article className="relative rounded-3xl border border-linea bg-blanco p-6 sm:p-8">
      <span className="inline-flex rounded-full bg-lima px-3 py-1 text-xs font-bold text-tinta">
        Proyecto destacado
      </span>
      <p className="mt-4 text-sm font-semibold text-pizarra">
        {practica.rol} <span aria-hidden="true">en</span>{" "}
        <span className="text-tinta">{etiquetaArea(practica.carrera)}</span>
      </p>
      <h2 className="mt-2 text-[1.75rem] font-extrabold leading-[1.15] tracking-[-0.035em] sm:text-[2rem]">
        {practica.titulo}
      </h2>
      {practica.resumen && (
        <p className="mt-3 max-w-[60ch] leading-relaxed text-pizarra">{practica.resumen}</p>
      )}

      <dl className="mt-5 flex flex-wrap gap-x-6 gap-y-2 text-sm">
        <div className="flex items-center gap-1.5">
          <dt className="sr-only">Nivel</dt>
          <IconoNivel nivel={practica.nivel} className="h-4 w-4 text-cobalto" />
          <dd className="font-semibold">{ETIQUETAS_NIVEL[practica.nivel]}</dd>
        </div>
        {practica.duracion && (
          <div className="flex items-center gap-1.5">
            <dt className="sr-only">Duración</dt>
            <IconoReloj className="h-4 w-4 text-cobalto" />
            <dd className="font-semibold">{practica.duracion}</dd>
          </div>
        )}
        <div>
          <dt className="sr-only">Origen del caso</dt>
          <dd>
            <EtiquetaVeracidad tipo={practica.tipo_veracidad} validado={practica.validado_empresa} />
          </dd>
        </div>
      </dl>

      {practica.herramientas.length > 0 && (
        <div className="mt-3.5 flex flex-wrap items-center gap-2 text-[0.82rem]">
          <span className="font-semibold text-pizarra">Herramientas:</span>
          {practica.herramientas.map((h) => (
            <span key={h} className="rounded-full border border-linea bg-niebla px-2.5 py-0.5 font-semibold">
              {h}
            </span>
          ))}
        </div>
      )}

      {practica.habilidades.length > 0 && (
        <div className="mt-6 border-t border-linea pt-5">
          <p className="text-sm font-bold">En este proyecto vas a:</p>
          <ul className="mt-3 space-y-2.5">
            {practica.habilidades.map((h) => (
              <li key={h} className="flex items-start gap-2.5 text-sm leading-relaxed">
                <IconoCheck className="mt-0.5 h-5 w-5 shrink-0" />
                {h}
              </li>
            ))}
          </ul>
        </div>
      )}

      <Link
        href={`/proyectos/${practica.id}`}
        className="mt-7 inline-flex w-full items-center justify-center rounded-xl bg-cobalto px-6 py-3.5 font-bold text-blanco transition-colors hover:bg-cobalto-hondo sm:w-auto"
      >
        Empezar proyecto
      </Link>
    </article>
  );
}

export function FichaDestacadaCargando() {
  return (
    <div
      aria-busy="true"
      aria-label="Cargando proyecto destacado"
      className="h-[26rem] animate-pulse rounded-3xl border border-linea bg-blanco motion-reduce:animate-none"
    />
  );
}
