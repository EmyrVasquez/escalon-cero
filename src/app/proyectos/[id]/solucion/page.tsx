import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { SolucionProyecto } from "@/components/proyectos/ResultadoProyecto";
import { obtenerProyecto } from "@/lib/proyectos";

export const metadata: Metadata = { title: "Respuestas correctas" };

export default function PaginaSolucion({ params }: { params: Promise<{ id: string }> }) {
  return (
    <div className="mx-auto w-full max-w-5xl px-4 pt-10 sm:px-6">
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

  return (
    <>
      <nav aria-label="Ruta" className="text-sm text-pizarra">
        <Link href={`/proyectos/${proyecto.id}`} className="hover:text-tinta">
          ← {proyecto.titulo}
        </Link>
      </nav>
      <h1 className="mb-8 mt-4 text-3xl font-extrabold tracking-[-0.04em] sm:text-4xl">Respuestas correctas</h1>
      <SolucionProyecto
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
      />
    </>
  );
}
