import type { Metadata } from "next";
import { Suspense } from "react";
import { EspacioEstudiante } from "@/components/cuenta/EspacioEstudiante";
import { obtenerOportunidades } from "@/lib/oportunidades";
import { obtenerProyectos } from "@/lib/proyectos";
import { proyectosRequeridos } from "@/lib/requisitos";
import { RUTAS } from "@/lib/rutas";
import { areaActiva } from "@/lib/areas";

export const metadata: Metadata = { title: "Mi espacio" };

export default function MiEspacio() {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 pt-10 sm:px-6">
      <Suspense fallback={<div className="h-96 rounded-3xl border border-linea bg-blanco" aria-busy="true" />}>
        <Contenido />
      </Suspense>
    </div>
  );
}

async function Contenido() {
  const [proyectos, oportunidades] = await Promise.all([obtenerProyectos(), obtenerOportunidades().catch(() => [])]);
  const rutas = RUTAS.filter((r) => areaActiva(r.area)).map((r) => ({
    slug: r.slug,
    puesto: r.puesto,
    etapas: r.etapas.map((e) => ({
      numero: e.numero,
      titulo: e.titulo,
      proyectos: proyectos
        .filter((p) => p.ruta === r.slug && p.etapa === e.numero)
        .map((p) => ({ id: p.id, titulo: p.titulo, comprobado: !!p.comprobacion?.length })),
    })),
  }));
  return (
    <EspacioEstudiante
      rutas={rutas}
      oportunidades={oportunidades
        .filter((o) => o.estado === "abierta")
        .map((o) => ({
          id: o.id,
          titulo: o.titulo,
          empresa: o.empresa,
          ruta: o.ruta,
          requeridos: proyectosRequeridos(o, proyectos).map((p) => p.id),
        }))}
    />
  );
}
