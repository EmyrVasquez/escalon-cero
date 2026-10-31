import type { Metadata } from "next";
import { PostulacionesVista } from "@/components/cuenta/PostulacionesVista";

export const metadata: Metadata = { title: "Mis postulaciones" };

export default function Postulaciones() {
  return (
    <div className="mx-auto w-full max-w-4xl px-4 pt-12 sm:px-6">
      <h1 className="text-4xl font-extrabold tracking-[-0.045em] sm:text-5xl">Mis postulaciones</h1>
      <p className="mt-3 max-w-[60ch] leading-relaxed text-pizarra">
        Las oportunidades a las que postulaste. Te escribiremos al correo que dejaste
        con la respuesta de cada empresa.
      </p>
      <PostulacionesVista />
    </div>
  );
}
