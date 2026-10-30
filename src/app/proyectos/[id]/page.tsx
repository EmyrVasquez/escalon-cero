import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { EtiquetaVeracidad } from "@/components/EtiquetaVeracidad";
import { IconoArchivo, IconoCheck, IconoMoneda, IconoNivel, IconoReloj } from "@/components/Iconos";
import { PasosPractica } from "@/components/PasosPractica";
import { PracticaInteractiva } from "@/components/PracticaInteractiva";
import { Recursos } from "@/components/Recursos";
import { etiquetaArea } from "@/lib/carreras";
import { oportunidadesQuePiden } from "@/lib/oportunidades";
import { obtenerRuta } from "@/lib/rutas";
import { obtenerPractica } from "@/lib/practicas";
import { enFrase, plural } from "@/lib/texto";
import { ETIQUETAS_NIVEL, ETIQUETAS_TIPO_OPORTUNIDAD } from "@/lib/tipos";

export default function PaginaPractica({ params }: { params: Promise<{ id: string }> }) {
  return (
    <Suspense fallback={<PracticaCargando />}>
      <ContenidoPractica params={params} />
    </Suspense>
  );
}

async function ContenidoPractica({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const practica = await obtenerPractica(id);
  if (!practica) notFound();
  // Si las oportunidades no cargan, el proyecto se muestra igual.
  const habilita = await oportunidadesQuePiden(practica).catch(() => []);
  const ruta = obtenerRuta(practica.ruta);
  const etapa = ruta && practica.etapa ? ruta.etapas[practica.etapa - 1] : undefined;
  const puertas = habilita.map((o) => ({
    id: o.id,
    titulo: o.titulo,
    empresa: o.empresa,
    compensacion: o.compensacion,
  }));

  const area = etiquetaArea(practica.carrera);
  const recursos = practica.recursos ?? [];
  const requisitos = practica.requisitos ?? [];

  return (
    <article className="mx-auto w-full max-w-6xl px-4 pt-10 sm:px-6">
      <nav aria-label="Ruta" className="text-sm text-pizarra">
        <Link href="/proyectos" className="hover:text-tinta">
          Proyectos
        </Link>
        <span aria-hidden="true" className="mx-2">
          /
        </span>
        <Link href={`/proyectos?area=${practica.carrera}`} className="hover:text-tinta">
          {area}
        </Link>
      </nav>

      <header className="mt-6 max-w-3xl">
        {ruta && etapa && (
          <Link
            href={`/rutas/${ruta.slug}#etapa-${etapa.numero}`}
            className="mb-4 inline-flex flex-wrap items-center gap-x-2 rounded-full border border-linea bg-blanco px-3 py-1.5 text-sm hover:border-cobalto"
          >
            <span className="font-semibold text-pizarra">Ruta {ruta.puesto}</span>
            <span aria-hidden="true" className="text-pizarra">·</span>
            <span className="font-bold text-cobalto">
              Etapa {etapa.numero}: {etapa.titulo}
            </span>
          </Link>
        )}
        <p className="text-sm font-semibold text-cobalto">
          {practica.rol}
          {practica.sector ? ` en ${enFrase(practica.sector)}` : ""}
        </p>
        <h1 className="mt-2 text-[2.2rem] font-extrabold leading-[1.08] tracking-[-0.045em] sm:text-5xl">
          {practica.titulo}
        </h1>
        <dl className="mt-5 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
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
          {recursos.length > 0 && (
            <div className="flex items-center gap-1.5">
              <dt className="sr-only">Recursos</dt>
              <IconoArchivo className="h-4 w-4 text-cobalto" />
              <dd className="font-semibold">
                {plural(recursos.length, "recurso", "recursos")} para descargar
              </dd>
            </div>
          )}
          <div>
            <dt className="sr-only">Origen del caso</dt>
            <dd>
              <EtiquetaVeracidad
                tipo={practica.tipo_veracidad}
                validado={practica.validado_empresa}
                conDescripcion
              />
            </dd>
          </div>
        </dl>
        {practica.herramientas.length > 0 && (
          <div className="mt-3.5 flex flex-wrap items-center gap-2 text-[0.82rem]">
            <span className="font-semibold text-pizarra">Herramientas:</span>
            {practica.herramientas.map((h) => (
              <span key={h} className="rounded-full border border-linea bg-blanco px-2.5 py-0.5 font-semibold">
                {h}
              </span>
            ))}
          </div>
        )}
      </header>

      <div className="mt-10 grid gap-8 lg:grid-cols-[1.6fr_1fr] lg:gap-12">
        <div className="space-y-8">
          <Bloque id="encargo" titulo="El contexto">
            {practica.contexto}
          </Bloque>
          <Bloque titulo="Lo que te pidieron">{practica.encargo}</Bloque>
          <section
            aria-labelledby="complicacion"
            className="rounded-2xl bg-tinta p-6 text-blanco sm:p-7"
          >
            <h2 id="complicacion" className="text-lg font-bold text-lima">
              La complicación
            </h2>
            <p className="mt-2 leading-relaxed">{practica.complicacion}</p>
          </section>
          {practica.materiales && <Bloque titulo="Con qué cuentas">{practica.materiales}</Bloque>}
          {requisitos.length > 0 && (
            <section>
              <h2 className="text-lg font-bold">Antes de empezar</h2>
              <ul className="mt-2 max-w-[68ch] list-disc space-y-1.5 pl-5 leading-relaxed text-pizarra marker:text-cobalto">
                {requisitos.map((r) => (
                  <li key={r}>{r}</li>
                ))}
              </ul>
            </section>
          )}
          {recursos.length > 0 && <Recursos recursos={recursos} />}
        </div>

        <aside className="space-y-6 lg:sticky lg:top-6 lg:self-start">
          {habilita.length > 0 && (
            <section className="rounded-2xl bg-tinta p-6 text-blanco">
              <h2 className="font-bold text-lima">Cuenta como requisito para</h2>
              <ul className="mt-3 space-y-3">
                {habilita.map((o) => (
                  <li key={o.id}>
                    <Link href={`/oportunidades/${o.id}`} className="group block">
                      <span className="text-xs font-semibold opacity-75">
                        {ETIQUETAS_TIPO_OPORTUNIDAD[o.tipo]} · {o.empresa}
                      </span>
                      <span className="mt-0.5 block font-bold leading-snug group-hover:underline">{o.titulo}</span>
                      <span className="mt-1 inline-flex items-center gap-1.5 text-sm">
                        <IconoMoneda className="h-4 w-4 text-lima" />
                        {o.compensacion}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          )}
          <PasosPractica practicaId={practica.id} conRecursos={recursos.length > 0} />
          {practica.entregables.length > 0 && (
            <section className="rounded-2xl border border-linea bg-blanco p-6">
              <h2 className="font-bold">Tu entrega debe incluir</h2>
              <ol className="mt-3 space-y-2.5 text-sm leading-relaxed">
                {practica.entregables.map((e, i) => (
                  <li key={e} className="flex gap-3">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-cielo text-xs font-bold text-cobalto">
                      {i + 1}
                    </span>
                    <span>{e}</span>
                  </li>
                ))}
              </ol>
            </section>
          )}
          {practica.habilidades.length > 0 && (
            <section className="px-1">
              <h2 className="font-bold">Lo que vas a practicar</h2>
              <ul className="mt-3 space-y-2.5 text-sm leading-relaxed">
                {practica.habilidades.map((h) => (
                  <li key={h} className="flex items-start gap-2.5">
                    <IconoCheck className="mt-0.5 h-5 w-5 shrink-0" />
                    {h}
                  </li>
                ))}
              </ul>
            </section>
          )}
        </aside>
      </div>

      <PracticaInteractiva practica={practica} oportunidades={puertas} />
    </article>
  );
}

function Bloque({
  id,
  titulo,
  children,
}: {
  id?: string;
  titulo: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-6">
      <h2 className="text-lg font-bold">{titulo}</h2>
      <p className="mt-2 max-w-[68ch] leading-relaxed text-pizarra">{children}</p>
    </section>
  );
}

function PracticaCargando() {
  return (
    <div aria-busy="true" aria-label="Cargando proyecto" className="mx-auto w-full max-w-6xl space-y-4 px-4 pt-10 sm:px-6">
      <div className="h-6 w-48 animate-pulse rounded bg-blanco motion-reduce:animate-none" />
      <div className="h-14 w-3/4 animate-pulse rounded-xl bg-blanco motion-reduce:animate-none" />
      <div className="h-80 animate-pulse rounded-2xl border border-linea bg-blanco motion-reduce:animate-none" />
    </div>
  );
}
