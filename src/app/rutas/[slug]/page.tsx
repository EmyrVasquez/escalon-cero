import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { CaminoRuta } from "@/components/rutas/CaminoRuta";
import { Ilustracion } from "@/components/ui/Ilustracion";
import { areaActiva, etiquetaArea, ilustracionDeArea } from "@/lib/areas";
import { obtenerOportunidades } from "@/lib/oportunidades";
import { obtenerProyectos } from "@/lib/proyectos";
import { proyectosPorEtapa } from "@/lib/requisitos";
import { obtenerRuta } from "@/lib/rutas";

export default function PaginaRuta({ params }: { params: Promise<{ slug: string }> }) {
  return (
    <Suspense fallback={<RutaCargando />}>
      <ContenidoRuta params={params} />
    </Suspense>
  );
}

async function ContenidoRuta({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const ruta = obtenerRuta(slug);
  if (!ruta) notFound();

  const encabezado = (
    <header className="mt-6 grid items-center gap-6 sm:grid-cols-[1fr_auto]">
      <div className="max-w-2xl">
        <p className="text-sm font-bold text-cobalto">{etiquetaArea(ruta.area)}</p>
        <h1 className="mt-1 text-[2.2rem] font-extrabold leading-[1.08] tracking-[-0.045em] sm:text-5xl">{ruta.puesto}</h1>
        <p className="mt-3 text-lg leading-relaxed text-pizarra">{ruta.resumen}</p>
      </div>
      <span className="hidden w-48 rounded-3xl bg-cielo p-3 sm:block">
        <Ilustracion nombre={ilustracionDeArea(ruta.area)} className="h-auto w-full" />
      </span>
    </header>
  );

  if (!areaActiva(ruta.area)) {
    return (
      <article className="mx-auto w-full max-w-5xl px-4 pt-10 sm:px-6">
        <Volver />
        {encabezado}
        <p className="mt-8 rounded-3xl border border-dashed border-linea bg-blanco p-6 text-pizarra">
          Esta ruta llega pronto. Por ahora el piloto está abierto para tecnología.
        </p>
      </article>
    );
  }

  const [proyectos, oportunidades] = await Promise.all([obtenerProyectos(), obtenerOportunidades().catch(() => [])]);
  const porEtapa = proyectosPorEtapa(ruta.slug, proyectos);

  return (
    <article className="mx-auto w-full max-w-6xl px-4 pt-10 sm:px-6">
      <Volver />
      {encabezado}
      <CaminoRuta
        puesto={ruta.puesto}
        etapas={ruta.etapas.map((e) => ({
          numero: e.numero,
          titulo: e.titulo,
          objetivo: e.objetivo,
          temas: e.temas,
          recursos: e.recursos,
          proyectos: porEtapa[e.numero].map((p) => ({ id: p.id, titulo: p.titulo, duracion: p.duracion })),
        }))}
        oportunidades={oportunidades
          .filter((o) => o.ruta === ruta.slug && o.estado === "abierta")
          .map((o) => ({ id: o.id, titulo: o.titulo, empresa: o.empresa, etapa_requerida: o.etapa_requerida }))}
      />
    </article>
  );
}

function Volver() {
  return (
    <Link href="/rutas" className="text-sm font-semibold text-pizarra hover:text-tinta">
      ← Todas las rutas
    </Link>
  );
}

function RutaCargando() {
  return (
    <div aria-busy="true" aria-label="Cargando ruta" className="mx-auto w-full max-w-6xl space-y-4 px-4 pt-10 sm:px-6">
      <div className="h-6 w-48 animate-pulse rounded bg-blanco motion-reduce:animate-none" />
      <div className="h-14 w-3/4 animate-pulse rounded-xl bg-blanco motion-reduce:animate-none" />
      <div className="h-96 animate-pulse rounded-3xl border border-linea bg-blanco motion-reduce:animate-none" />
    </div>
  );
}
