import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { EtiquetaEjemplo, EtiquetaTipo } from "@/components/oportunidades/EtiquetaOportunidad";
import { IconoCalendario, IconoCheck, IconoHecho, IconoLugar, IconoMaletin } from "@/components/ui/Iconos";
import { Postulacion, type ProyectoRequerido } from "@/components/oportunidades/Postulacion";
import { etiquetaArea } from "@/lib/areas";
import { obtenerOportunidad } from "@/lib/oportunidades";
import { obtenerProyectos } from "@/lib/proyectos";
import { proyectosRequeridos } from "@/lib/requisitos";
import { obtenerRuta } from "@/lib/rutas";
import { enFrase, fechaLarga, plural } from "@/lib/texto";
import { DESCRIPCION_TIPO_OPORTUNIDAD, ETIQUETAS_MODALIDAD, ETIQUETAS_RETRIBUCION } from "@/lib/tipos";

export default function PaginaOportunidad({ params }: { params: Promise<{ id: string }> }) {
  return (
    <Suspense fallback={<OportunidadCargando />}>
      <ContenidoOportunidad params={params} />
    </Suspense>
  );
}

async function ContenidoOportunidad({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [oportunidad, proyectos] = await Promise.all([obtenerOportunidad(id), obtenerProyectos()]);
  if (!oportunidad) notFound();

  // Los proyectos de su ruta, desde la etapa 1 hasta la que pide la empresa.
  const requeridas: ProyectoRequerido[] = proyectosRequeridos(oportunidad, proyectos).map((p) => ({
    id: p.id,
    titulo: p.titulo,
    rol: p.rol,
    duracion: p.duracion,
    etapa: p.etapa ?? 1,
  }));
  const ruta = obtenerRuta(oportunidad.ruta);
  const cierre = fechaLarga(oportunidad.cierra);
  const area = etiquetaArea(oportunidad.carrera);

  return (
    <article className="mx-auto w-full max-w-6xl px-4 pt-10 sm:px-6">
      <nav aria-label="Ruta" className="text-sm text-pizarra">
        <Link href="/oportunidades" className="hover:text-tinta">
          Oportunidades
        </Link>
        <span aria-hidden="true" className="mx-2">
          /
        </span>
        <Link href={`/oportunidades?area=${oportunidad.carrera}`} className="hover:text-tinta">
          {area}
        </Link>
      </nav>

      <header className="mt-6 max-w-3xl">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-sm">
          <EtiquetaTipo tipo={oportunidad.tipo} />
          <span className="font-semibold">
            {oportunidad.empresa}
            {oportunidad.sector ? <span className="font-normal text-pizarra"> · {oportunidad.sector}</span> : null}
          </span>
        </div>
        <h1 className="mt-3 text-[2.2rem] font-extrabold leading-[1.08] tracking-[-0.045em] sm:text-5xl">
          {oportunidad.titulo}
        </h1>
        {oportunidad.resumen && (
          <p className="mt-4 max-w-[62ch] text-lg leading-relaxed text-pizarra">{oportunidad.resumen}</p>
        )}
        {oportunidad.es_ejemplo && (
          <div className="mt-4">
            <EtiquetaEjemplo conDescripcion />
          </div>
        )}
      </header>

      <div className="mt-10 grid gap-8 lg:grid-cols-[1.6fr_1fr] lg:gap-12">
        <div className="space-y-8">
          <section>
            <h2 className="text-lg font-bold">El encargo</h2>
            <p className="mt-2 max-w-[68ch] leading-relaxed text-pizarra">{oportunidad.descripcion}</p>
          </section>
          {oportunidad.que_haras.length > 0 && (
            <section>
              <h2 className="text-lg font-bold">Qué harás</h2>
              <ul className="mt-3 space-y-2.5 leading-relaxed">
                {oportunidad.que_haras.map((q) => (
                  <li key={q} className="flex items-start gap-2.5">
                    <IconoCheck className="mt-0.5 h-5 w-5 shrink-0" />
                    {q}
                  </li>
                ))}
              </ul>
            </section>
          )}
          {oportunidad.requisitos.length > 0 && (
            <section>
              <h2 className="text-lg font-bold">También necesitas</h2>
              <ul className="mt-2 max-w-[68ch] list-disc space-y-1.5 pl-5 leading-relaxed text-pizarra marker:text-cobalto">
                {oportunidad.requisitos.map((r) => (
                  <li key={r}>{r}</li>
                ))}
              </ul>
            </section>
          )}
        </div>

        <aside className="space-y-4 lg:sticky lg:top-6 lg:self-start">
          <section className="rounded-2xl bg-tinta p-6 text-blanco">
            <h2 className="text-sm font-semibold text-lima">
              {ETIQUETAS_RETRIBUCION[oportunidad.tipo]}
            </h2>
            <p className="mt-1 text-xl font-extrabold leading-snug tracking-[-0.03em]">{oportunidad.compensacion}</p>
            <p className="mt-2 text-sm leading-relaxed opacity-80">{DESCRIPCION_TIPO_OPORTUNIDAD[oportunidad.tipo]}</p>
          </section>
          <dl className="space-y-3 rounded-2xl border border-linea bg-blanco p-6 text-sm">
            <Dato icono={<IconoMaletin className="h-4 w-4" />} titulo="Rol">
              {oportunidad.rol} en {enFrase(area)}
            </Dato>
            <Dato icono={<IconoLugar />} titulo="Modalidad">
              {ETIQUETAS_MODALIDAD[oportunidad.modalidad]}
              {oportunidad.ubicacion ? ` · ${oportunidad.ubicacion}` : ""}
            </Dato>
            {oportunidad.dedicacion && (
              <Dato icono={<IconoCalendario />} titulo="Dedicación">
                {oportunidad.dedicacion}
              </Dato>
            )}
            <Dato icono={<IconoHecho className="h-4 w-4" />} titulo="Cupos">
              {plural(oportunidad.cupos, "persona", "personas")}
            </Dato>
            <Dato icono={<IconoCalendario />} titulo="Cierre">
              {oportunidad.estado === "cerrada" ? "Cerrada" : cierre ? `Hasta el ${cierre}` : "Sin fecha de cierre"}
            </Dato>
          </dl>
          <a
            href="#postular"
            className="inline-flex w-full items-center justify-center rounded-xl bg-cobalto px-6 py-3.5 font-bold text-blanco transition-colors hover:bg-cobalto-hondo"
          >
            Ver requisitos y postular
          </a>
        </aside>
      </div>

      <Postulacion
        oportunidad={{
          id: oportunidad.id,
          titulo: oportunidad.titulo,
          empresa: oportunidad.empresa,
          tipo: oportunidad.tipo,
          compensacion: oportunidad.compensacion,
          estado: oportunidad.estado,
        }}
        proyectos={requeridas}
        ruta={
          ruta
            ? {
                slug: ruta.slug,
                puesto: ruta.puesto,
                etapas: ruta.etapas.map((e) => ({ numero: e.numero, titulo: e.titulo })),
              }
            : null
        }
        etapaRequerida={oportunidad.etapa_requerida}
      />
    </article>
  );
}

function Dato({ icono, titulo, children }: { icono: React.ReactNode; titulo: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-2.5">
      <span className="mt-0.5 text-cobalto">{icono}</span>
      <div>
        <dt className="text-pizarra">{titulo}</dt>
        <dd className="font-semibold">{children}</dd>
      </div>
    </div>
  );
}

function OportunidadCargando() {
  return (
    <div aria-busy="true" aria-label="Cargando oportunidad" className="mx-auto w-full max-w-6xl space-y-4 px-4 pt-10 sm:px-6">
      <div className="h-6 w-48 animate-pulse rounded bg-blanco motion-reduce:animate-none" />
      <div className="h-14 w-3/4 animate-pulse rounded-xl bg-blanco motion-reduce:animate-none" />
      <div className="h-80 animate-pulse rounded-2xl border border-linea bg-blanco motion-reduce:animate-none" />
    </div>
  );
}
