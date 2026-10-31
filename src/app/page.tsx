import Link from "next/link";
import { Suspense } from "react";
import { Escalera } from "@/components/inicio/Escalera";
import {
  FichaOportunidadCargando,
  FichaOportunidadDestacada,
  OportunidadesRecientes,
} from "@/components/oportunidades/FichaOportunidad";
import { ListaOportunidadesCargando } from "@/components/oportunidades/FilaOportunidad";
import { ListaProyectosCargando } from "@/components/proyectos/FilaProyecto";
import { ProyectosRecientes } from "@/components/proyectos/ProyectosRecientes";
import { etiquetaArea } from "@/lib/areas";
import { obtenerProyectos } from "@/lib/proyectos";
import { RUTAS, obtenerRuta } from "@/lib/rutas";

export default function Inicio() {
  return (
    <>
      <section className="mx-auto grid w-full max-w-6xl gap-10 px-4 pt-14 sm:px-6 lg:grid-cols-[1fr_1.05fr] lg:items-center lg:gap-14 lg:pt-20">
        <div>
          <h1 className="text-[2.6rem] font-extrabold leading-[1.02] tracking-[-0.05em] sm:text-6xl lg:text-[4.2rem]">
            Gana experiencia antes de tu primer empleo.
          </h1>
          <p className="mt-6 max-w-[40ch] text-lg leading-relaxed text-pizarra">
            Haz un proyecto real, demuestra lo que sabes y desbloquea encargos de empresas.
          </p>

          <div className="mt-8 flex flex-col items-start gap-4">
            <Suspense fallback={<BotonEmpezar href="/proyectos" />}>
              <EmpezarProyecto />
            </Suspense>
            <Link href="/rutas" className="font-semibold text-pizarra underline underline-offset-4 hover:text-tinta">
              O mira primero las rutas por puesto
            </Link>
          </div>
        </div>
        <Suspense fallback={<FichaOportunidadCargando />}>
          <FichaOportunidadDestacada />
        </Suspense>
      </section>

      <Suspense fallback={<div className="mx-auto mt-16 h-64 w-full max-w-6xl rounded-3xl bg-blanco" aria-hidden="true" />}>
        <FlujoGuiado />
      </Suspense>

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
        <Suspense fallback={<ListaProyectosCargando filas={4} />}>
          <ProyectosRecientes />
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

function BotonEmpezar({ href }: { href: string }) {
  return (
    <Link
      href={href}
      className="inline-flex items-center justify-center rounded-xl bg-cobalto px-8 py-4 text-lg font-bold text-blanco transition-colors hover:bg-cobalto-hondo"
    >
      Empezar ahora
    </Link>
  );
}

/** El botón principal lleva directo al proyecto con comprobación. */
async function EmpezarProyecto() {
  const proyectos = await obtenerProyectos().catch(() => []);
  const proyecto = proyectos.find((p) => p.comprobacion?.length);
  return <BotonEmpezar href={proyecto ? `/proyectos/${proyecto.id}` : "/proyectos"} />;
}

/**
 * El recorrido completo en un proyecto: el que tiene comprobación automática.
 * Es la puerta de entrada para quien prueba Escalón Cero por primera vez.
 */
async function FlujoGuiado() {
  const proyectos = await obtenerProyectos().catch(() => []);
  const proyecto = proyectos.find((p) => p.comprobacion?.length);
  if (!proyecto) return null;
  const ruta = obtenerRuta(proyecto.ruta);

  const pasos = [
    { titulo: "Lee el encargo", texto: "Un gerente necesita un dashboard de ventas para el directorio." },
    { titulo: "Descarga los datos", texto: "La exportación del ERP: 9 587 ventas, con errores reales." },
    { titulo: "Sube tu resultado", texto: "Tu dashboard y cinco cifras, que se comprueban al instante." },
    { titulo: "Desbloquea y postula", texto: "Si apruebas, ves el resultado esperado y postulas a la empresa." },
  ];

  return (
    <section aria-labelledby="titulo-guiado" className="mx-auto w-full max-w-6xl px-4 pt-16 sm:px-6">
      <div className="rounded-3xl border border-linea bg-blanco p-6 sm:p-10">
        <p className="text-sm font-bold text-cobalto">
          Cómo funciona{ruta ? ` · Ruta ${ruta.puesto}` : ""}
        </p>
        <h2 id="titulo-guiado" className="mt-2 max-w-3xl text-2xl font-bold tracking-[-0.03em] sm:text-3xl">
          {proyecto.titulo}
        </h2>
        <p className="mt-3 max-w-[62ch] leading-relaxed text-pizarra">
          Del encargo a la postulación en un solo proyecto. {proyecto.duracion ? `Te toma ${proyecto.duracion}` : ""}
          {proyecto.herramientas.length > 0 ? ` con ${proyecto.herramientas.join(" o ")}.` : "."}
        </p>
        <ol className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {pasos.map((paso, i) => (
            <li key={paso.titulo} className="rounded-2xl bg-niebla p-5">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-cobalto text-sm font-bold text-blanco">
                {i + 1}
              </span>
              <p className="mt-3 font-bold">{paso.titulo}</p>
              <p className="mt-1 text-sm leading-relaxed text-pizarra">{paso.texto}</p>
            </li>
          ))}
        </ol>
        <Link
          href={`/proyectos/${proyecto.id}`}
          className="mt-8 inline-flex items-center justify-center rounded-xl bg-cobalto px-6 py-3.5 font-bold text-blanco transition-colors hover:bg-cobalto-hondo"
        >
          Empezar el proyecto
        </Link>
      </div>
    </section>
  );
}
