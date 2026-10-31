import type { Metadata } from "next";
import Link from "next/link";
import { AvisoDemoEmpresa } from "@/components/empresa/AvisoDemoEmpresa";
import { FormularioAviso } from "@/components/empresa/FormularioAviso";

export const metadata: Metadata = { title: "Publicar un aviso" };

export default function NuevoAviso() {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 pt-10 sm:px-6">
      <Link href="/empresa" className="text-sm font-semibold text-pizarra hover:text-tinta">
        ← Volver a tu espacio
      </Link>
      <p className="mt-6 text-sm font-bold text-cobalto">Publicar un aviso</p>
      <h1 className="mt-1 text-4xl font-extrabold tracking-[-0.045em] sm:text-5xl">¿Qué necesita tu equipo?</h1>
      <p className="mt-3 max-w-[56ch] leading-relaxed text-pizarra">
        Elige la ruta que pides. Solo te llegarán postulaciones de quienes ya aprobaron sus proyectos.
      </p>
      <div className="mt-6 max-w-3xl">
        <AvisoDemoEmpresa />
      </div>
      <FormularioAviso />
    </div>
  );
}
