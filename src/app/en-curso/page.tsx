import type { Metadata } from "next";
import { EnCursoVista } from "@/components/cuenta/EnCursoVista";

export const metadata: Metadata = { title: "Proyectos en curso" };

export default function EnCurso() {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 pt-12 sm:px-6">
      <h1 className="text-4xl font-extrabold tracking-[-0.045em] sm:text-5xl">Proyectos en curso</h1>
      <p className="mt-3 max-w-[60ch] leading-relaxed text-pizarra">
        Los proyectos que empezaste y todavía no entregas. Tus borradores se guardan en
        tu cuenta.
      </p>
      <EnCursoVista />
    </div>
  );
}
