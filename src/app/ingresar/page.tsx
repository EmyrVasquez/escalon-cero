import type { Metadata } from "next";
import { Suspense } from "react";
import { FormularioIngreso } from "@/components/FormularioIngreso";

export const metadata: Metadata = { title: "Ingresar" };

export default function Ingresar() {
  return (
    <div className="mx-auto grid w-full max-w-5xl gap-10 px-4 pt-12 sm:px-6 lg:grid-cols-[1fr_1fr] lg:items-start lg:gap-16">
      <div className="lg:pt-6">
        <h1 className="text-4xl font-extrabold tracking-[-0.045em] sm:text-5xl">Tu progreso, guardado</h1>
        <p className="mt-4 max-w-[46ch] text-lg leading-relaxed text-pizarra">
          Con tu cuenta, los proyectos que entregas, tus borradores y tus postulaciones
          te esperan en cualquier dispositivo.
        </p>
        <ul className="mt-6 space-y-2 text-sm leading-relaxed text-pizarra">
          <li>Tus entregas forman tu portafolio y son el requisito para postular.</li>
          <li>Solo tú ves tu progreso. Las empresas ven tus entregas cuando postulas.</li>
        </ul>
      </div>
      <Suspense fallback={<div className="h-96 rounded-3xl border border-linea bg-blanco" aria-hidden="true" />}>
        <FormularioIngreso />
      </Suspense>
    </div>
  );
}
