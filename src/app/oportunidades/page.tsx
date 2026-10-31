import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { FilaOportunidad, ListaOportunidadesCargando } from "@/components/oportunidades/FilaOportunidad";
import { AREAS, esArea } from "@/lib/areas";
import { obtenerOportunidades } from "@/lib/oportunidades";
import { obtenerProyectos } from "@/lib/proyectos";
import { proyectosRequeridos } from "@/lib/requisitos";
import { plural } from "@/lib/texto";
import {
  DESCRIPCION_TIPO_OPORTUNIDAD,
  ETIQUETAS_TIPO_OPORTUNIDAD,
  type TipoOportunidad,
} from "@/lib/tipos";

export const metadata: Metadata = { title: "Oportunidades" };

type Parametros = Promise<{ [clave: string]: string | string[] | undefined }>;

const TIPOS = Object.keys(ETIQUETAS_TIPO_OPORTUNIDAD) as TipoOportunidad[];

function esTipo(valor: string | undefined): valor is TipoOportunidad {
  return TIPOS.includes(valor as TipoOportunidad);
}

function primero(valor: string | string[] | undefined): string | undefined {
  return Array.isArray(valor) ? valor[0] : valor;
}

export default function Oportunidades({ searchParams }: { searchParams: Parametros }) {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 pt-12 sm:px-6">
      <h1 className="text-4xl font-extrabold tracking-[-0.045em] sm:text-5xl">Oportunidades</h1>
      <p className="mt-3 max-w-[66ch] leading-relaxed text-pizarra">
        Encargos reales de empresas que todavía no pueden contratar a un junior. La
        mayoría son experiencias sin pago que suman a tu CV y portafolio; los retos
        tienen premio en efectivo. Cada oportunidad pide avanzar la ruta de su rol, así
        la empresa sabe que puedes hacer el trabajo antes de dártelo.
      </p>

      <dl className="mt-8 grid gap-3 sm:grid-cols-2">
        {TIPOS.map((t) => (
          <div key={t} className="rounded-2xl border border-linea bg-blanco p-5">
            <dt className="font-bold">{ETIQUETAS_TIPO_OPORTUNIDAD[t]}</dt>
            <dd className="mt-1 text-sm leading-relaxed text-pizarra">{DESCRIPCION_TIPO_OPORTUNIDAD[t]}</dd>
          </div>
        ))}
      </dl>

      <Suspense fallback={<div className="mt-8"><ListaOportunidadesCargando filas={4} /></div>}>
        <Listado searchParams={searchParams} />
      </Suspense>

      <p className="mt-8 max-w-[70ch] border-l-[3px] border-lima pl-4 text-sm leading-relaxed text-pizarra">
        En esta versión, el equipo de Escalón Cero consigue cada oportunidad: buscamos
        empresas que necesitan ayuda pero no tienen presupuesto para un sueldo junior,
        acordamos el encargo y lo que recibe la persona, y elegimos la etapa de la ruta
        que sirve de requisito.
      </p>
    </div>
  );
}

async function Listado({ searchParams }: { searchParams: Parametros }) {
  const parametros = await searchParams;
  const tipo = primero(parametros.tipo);
  const area = primero(parametros.area);
  const [todas, proyectos] = await Promise.all([obtenerOportunidades(), obtenerProyectos()]);

  const filtradas = todas.filter(
    (o) => (!esTipo(tipo) || o.tipo === tipo) && (!esArea(area) || o.carrera === area),
  );
  const areasConOportunidades = AREAS.filter((a) => todas.some((o) => o.carrera === a.valor));

  function enlace(cambios: { tipo?: string | null; area?: string | null }) {
    const p = new URLSearchParams();
    const t = cambios.tipo === undefined ? tipo : cambios.tipo;
    const a = cambios.area === undefined ? area : cambios.area;
    if (t && esTipo(t)) p.set("tipo", t);
    if (a && esArea(a)) p.set("area", a);
    const q = p.toString();
    return q ? `/oportunidades?${q}` : "/oportunidades";
  }

  const chip = (activo: boolean) =>
    `inline-block rounded-full border px-3 py-1.5 text-sm font-semibold transition-colors ${
      activo ? "border-cobalto bg-cielo text-cobalto" : "border-linea bg-blanco hover:border-cobalto hover:text-cobalto"
    }`;

  return (
    <>
      <nav aria-label="Filtrar oportunidades" className="mt-10 space-y-3">
        <ul className="flex flex-wrap items-center gap-2">
          <li className="mr-1 text-sm font-bold">Tipo</li>
          <li>
            <Link href={enlace({ tipo: null })} className={chip(!esTipo(tipo))} aria-current={!esTipo(tipo) ? "true" : undefined}>
              Todos
            </Link>
          </li>
          {TIPOS.map((t) => (
            <li key={t}>
              <Link href={enlace({ tipo: t })} className={chip(tipo === t)} aria-current={tipo === t ? "true" : undefined}>
                {ETIQUETAS_TIPO_OPORTUNIDAD[t]}
              </Link>
            </li>
          ))}
        </ul>
        {areasConOportunidades.length > 1 && (
          <ul className="flex flex-wrap items-center gap-2">
            <li className="mr-1 text-sm font-bold">Área</li>
            <li>
              <Link href={enlace({ area: null })} className={chip(!esArea(area))} aria-current={!esArea(area) ? "true" : undefined}>
                Todas
              </Link>
            </li>
            {areasConOportunidades.map((a) => (
              <li key={a.valor}>
                <Link href={enlace({ area: a.valor })} className={chip(area === a.valor)} aria-current={area === a.valor ? "true" : undefined}>
                  {a.etiqueta}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </nav>

      <p className="mt-6 text-sm font-semibold text-pizarra" aria-live="polite">
        {plural(filtradas.length, "oportunidad", "oportunidades")}
      </p>

      {filtradas.length === 0 ? (
        <div className="mt-3 rounded-2xl border border-dashed border-linea bg-blanco p-6 text-pizarra">
          No hay oportunidades con estos filtros todavía.{" "}
          <Link href="/oportunidades" className="font-bold text-cobalto hover:underline">
            Ver todas
          </Link>
        </div>
      ) : (
        <ul className="mt-3 divide-y divide-linea overflow-hidden rounded-2xl border border-linea bg-blanco">
          {filtradas.map((o) => (
            <li key={o.id}>
              <FilaOportunidad oportunidad={o} requeridas={proyectosRequeridos(o, proyectos).map((p) => p.id)} />
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
