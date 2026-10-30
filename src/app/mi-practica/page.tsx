import type { Metadata } from "next";
import { MiPracticaVista } from "@/components/MiPracticaVista";

export const metadata: Metadata = { title: "Mi práctica" };

export default function MiPractica() {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 pt-12 sm:px-6">
      <h1 className="text-4xl font-extrabold tracking-[-0.045em] sm:text-5xl">Mi práctica</h1>
      <p className="mt-3 max-w-[60ch] leading-relaxed text-pizarra">
        Las prácticas que empezaste y todavía no entregas. Se guardan en este
        navegador.
      </p>
      <MiPracticaVista />
    </div>
  );
}
