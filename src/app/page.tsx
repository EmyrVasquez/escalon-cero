import Form from "next/form";
import Link from "next/link";
import { Suspense } from "react";
import { Escalera } from "@/components/Escalera";
import { FichaDestacada, FichaDestacadaCargando } from "@/components/FichaDestacada";
import { ListaPracticasCargando } from "@/components/FilaPractica";
import { PracticasRecientes } from "@/components/PracticasRecientes";

const FRECUENTES = [
  { etiqueta: "Power BI", href: "/explorar?herramienta=Power%20BI%20Desktop" },
  { etiqueta: "QA junior", href: "/explorar?rol=QA%20junior" },
  { etiqueta: "Excel", href: "/explorar?herramienta=Excel" },
  { etiqueta: "Marketing digital", href: "/explorar?area=marketing" },
];

export default function Inicio() {
  return (
    <>
      <section className="mx-auto grid w-full max-w-6xl gap-10 px-4 pt-14 sm:px-6 lg:grid-cols-[1fr_1.05fr] lg:items-center lg:gap-14 lg:pt-20">
        <div>
          <h1 className="text-[2.6rem] font-extrabold leading-[1.02] tracking-[-0.05em] sm:text-6xl lg:text-[4.2rem]">
            Tu experiencia empieza haciendo.
          </h1>
          <p className="mt-6 max-w-[46ch] text-lg leading-relaxed text-pizarra">
            Resuelve tareas reales de puestos junior, compara tu decisión con lo que
            pasó de verdad y muestra lo que sabes hacer.
          </p>

          <Form action="/explorar" role="search" className="mt-8 max-w-[34rem]">
            <label htmlFor="buscar-portada" className="block font-bold">
              ¿Qué quieres practicar?
            </label>
            <div className="mt-3 flex flex-wrap gap-2">
              <input
                id="buscar-portada"
                name="q"
                type="search"
                placeholder="Por ejemplo: Power BI, pruebas de software o Instagram"
                className="min-w-0 flex-[1_1_16rem] rounded-xl border border-linea bg-blanco px-4 py-3.5 outline-none transition-colors placeholder:text-pizarra focus:border-cobalto"
              />
              <button
                type="submit"
                className="rounded-xl bg-cobalto px-6 py-3.5 font-bold text-blanco transition-colors hover:bg-cobalto-hondo"
              >
                Buscar
              </button>
            </div>
          </Form>

          <div className="mt-4 flex flex-wrap items-center gap-2 text-sm">
            <span className="text-pizarra">Búsquedas frecuentes:</span>
            {FRECUENTES.map((f) => (
              <Link
                key={f.href}
                href={f.href}
                className="rounded-full border border-linea bg-blanco px-3 py-1.5 font-semibold transition-colors hover:border-cobalto hover:text-cobalto"
              >
                {f.etiqueta}
              </Link>
            ))}
          </div>

          <p className="mt-8 max-w-[46ch] border-l-[3px] border-lima pl-4 text-sm leading-relaxed text-pizarra">
            La IA aprendió todo lo que está escrito. Aquí practicas lo que nunca se
            escribió: cómo se resuelve el trabajo en una empresa real.
          </p>
        </div>
        <Suspense fallback={<FichaDestacadaCargando />}>
          <FichaDestacada />
        </Suspense>
      </section>

      <section
        aria-labelledby="titulo-recientes"
        className="mx-auto w-full max-w-6xl px-4 pt-20 sm:px-6"
      >
        <Suspense fallback={<ListaPracticasCargando filas={4} />}>
          <PracticasRecientes />
        </Suspense>
      </section>

      <Escalera />
    </>
  );
}
