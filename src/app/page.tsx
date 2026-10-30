import Link from "next/link";
import { Suspense } from "react";
import { Escalera } from "@/components/Escalera";
import {
  FichaOportunidadCargando,
  FichaOportunidadDestacada,
  OportunidadesRecientes,
} from "@/components/FichaOportunidad";
import { ListaOportunidadesCargando } from "@/components/FilaOportunidad";
import { ListaPracticasCargando } from "@/components/FilaPractica";
import { PracticasRecientes } from "@/components/PracticasRecientes";
import { etiquetaArea } from "@/lib/carreras";
import { RUTAS } from "@/lib/rutas";

export default function Inicio() {
  return (
    <>
      <section className="mx-auto grid w-full max-w-6xl gap-10 px-4 pt-14 sm:px-6 lg:grid-cols-[1fr_1.05fr] lg:items-center lg:gap-14 lg:pt-20">
        <div>
          <h1 className="text-[2.6rem] font-extrabold leading-[1.02] tracking-[-0.05em] sm:text-6xl lg:text-[4.2rem]">
            Gana experiencia antes de tu primer empleo.
          </h1>
          <p className="mt-6 max-w-[48ch] text-lg leading-relaxed text-pizarra">
            Empresas reales que todavía no pueden contratar a un junior te dan encargos que
            suman a tu CV, y algunas premian retos en efectivo. Sigue la ruta de tu rol,
            haz sus proyectos y postula con pruebas de lo que sabes hacer.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/oportunidades"
              className="inline-flex items-center justify-center rounded-xl bg-cobalto px-6 py-3.5 font-bold text-blanco transition-colors hover:bg-cobalto-hondo"
            >
              Ver oportunidades
            </Link>
            <Link
              href="/rutas"
              className="inline-flex items-center justify-center rounded-xl border border-linea bg-blanco px-6 py-3.5 font-bold text-tinta transition-colors hover:border-tinta"
            >
              Elegir mi ruta
            </Link>
          </div>

          <p className="mt-8 max-w-[48ch] border-l-[3px] border-lima pl-4 text-sm leading-relaxed text-pizarra">
            El 24,1 % de la fuerza laboral peruana trabaja en ocupaciones muy expuestas a
            la IA generativa, y los puestos junior son los primeros en desaparecer. Aquí
            la experiencia no espera a que alguien te contrate.
            <span className="mt-1 block text-xs">Fuente: INEI, vía Infobae (26/09/2026).</span>
          </p>
        </div>
        <Suspense fallback={<FichaOportunidadCargando />}>
          <FichaOportunidadDestacada />
        </Suspense>
      </section>

      <section aria-labelledby="titulo-oportunidades" className="mx-auto w-full max-w-6xl px-4 pt-20 sm:px-6">
        <Suspense fallback={<ListaOportunidadesCargando filas={3} />}>
          <OportunidadesRecientes />
        </Suspense>
      </section>

      <Escalera />

      <section aria-labelledby="titulo-rutas" className="mx-auto w-full max-w-6xl px-4 pt-20 sm:px-6">
        <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2">
          <h2 id="titulo-rutas" className="text-2xl font-bold tracking-[-0.03em] sm:text-3xl">
            ¿A qué puesto quieres llegar?
          </h2>
          <Link href="/rutas" className="font-bold text-cobalto hover:underline">
            Ver todas las rutas
          </Link>
        </div>
        <p className="mt-3 max-w-xl leading-relaxed text-pizarra">
          Cada ruta es el mapa de un rol: qué aprender en cada etapa, con qué proyecto
          demostrarlo y qué oportunidades se desbloquean al avanzar.
        </p>
        <ul className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {RUTAS.map((r) => (
            <li key={r.slug}>
              <Link
                href={`/rutas/${r.slug}`}
                className="flex h-full flex-col rounded-2xl border border-linea bg-blanco p-5 transition-colors hover:border-cobalto"
              >
                <span className="text-sm font-semibold text-cobalto">{etiquetaArea(r.area)}</span>
                <span className="mt-1 text-lg font-bold tracking-[-0.02em]">{r.puesto}</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="titulo-recientes" className="mx-auto w-full max-w-6xl px-4 pt-20 sm:px-6">
        <Suspense fallback={<ListaPracticasCargando filas={4} />}>
          <PracticasRecientes />
        </Suspense>
      </section>

      <section aria-labelledby="titulo-empresas" className="mx-auto w-full max-w-6xl px-4 pt-20 sm:px-6">
        <div className="rounded-3xl bg-tinta p-6 text-blanco sm:p-10">
          <h2 id="titulo-empresas" className="max-w-2xl text-2xl font-bold tracking-[-0.03em] sm:text-3xl">
            ¿Tu empresa necesita ayuda, pero no puede pagar un sueldo junior todavía?
          </h2>
          <p className="mt-3 max-w-[62ch] leading-relaxed opacity-85">
            Ofrece un encargo real a cambio de constancia y recomendación, o publica un
            reto con premio. Nosotros elegimos la etapa de la ruta que sirve de filtro y
            te enviamos solo a quienes ya demostraron que pueden hacer el trabajo. En esta
            versión, el equipo de Escalón Cero publica cada oportunidad junto con la empresa.
          </p>
        </div>
      </section>
    </>
  );
}
