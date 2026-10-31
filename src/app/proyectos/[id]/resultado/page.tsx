import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { ResultadoProyecto } from "@/components/proyectos/ResultadoProyecto";
import { oportunidadesQuePiden } from "@/lib/oportunidades";
import { obtenerProyecto } from "@/lib/proyectos";

export const metadata: Metadata = { title: "Tu resultado" };

export default function PaginaResultado({ params }: { params: Promise<{ id: string }> }) {
  return (
    <div className="mx-auto w-full max-w-4xl px-4 pt-10 sm:px-6">
      <Suspense fallback={<div className="h-72 rounded-3xl border border-linea bg-blanco" aria-busy="true" />}>
        <Contenido params={params} />
      </Suspense>
    </div>
  );
}

async function Contenido({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const proyecto = await obtenerProyecto(id);
  if (!proyecto || !proyecto.comprobacion?.length) notFound();
  const habilita = await oportunidadesQuePiden(proyecto).catch(() => []);

  return (
    <>
      <nav aria-label="Ruta" className="mb-6 text-sm text-pizarra">
        <Link href={`/proyectos/${proyecto.id}`} className="hover:text-tinta">
          ← {proyecto.titulo}
        </Link>
      </nav>
      <ResultadoProyecto
        proyecto={{
          id: proyecto.id,
          titulo: proyecto.titulo,
          ruta: proyecto.ruta,
          referencia: proyecto.referencia,
          lo_que_hice: proyecto.lo_que_hice,
          que_paso: proyecto.que_paso,
          aprendizaje: proyecto.aprendizaje,
          preguntas: proyecto.comprobacion,
        }}
        oportunidades={habilita.map((o) => ({ id: o.id, titulo: o.titulo, empresa: o.empresa, compensacion: o.compensacion }))}
      />
    </>
  );
}
