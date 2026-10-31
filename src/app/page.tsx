import Link from "next/link";
import { Suspense } from "react";
import { TarjetaOportunidad } from "@/components/oportunidades/TarjetaOportunidad";
import { IconoCheck, IconoMaletin } from "@/components/ui/Iconos";
import { Ilustracion } from "@/components/ui/Ilustracion";
import { SECCIONES, type Ilustracion as NombreIlustracion } from "@/lib/areas";
import { obtenerOportunidades } from "@/lib/oportunidades";
import { obtenerProyectos } from "@/lib/proyectos";
import { RUTAS } from "@/lib/rutas";

export default function Inicio() {
  return (
    <>
      <section className="mx-auto grid w-full max-w-6xl gap-10 px-4 pt-12 sm:px-6 lg:grid-cols-[1fr_1.05fr] lg:items-center lg:gap-14 lg:pt-16">
        <div>
          <h1 className="text-[2.6rem] font-extrabold leading-[1.02] tracking-[-0.05em] sm:text-6xl lg:text-[4.2rem]">
            Gana experiencia antes de tu{" "}
            <span className="relative whitespace-nowrap">
              primer empleo.
              <span aria-hidden="true" className="absolute right-0 -bottom-1 left-0 h-2.5 rounded-full bg-lima" />
            </span>
          </h1>
          <p className="mt-7 max-w-[40ch] text-lg leading-relaxed text-pizarra">
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
          <p className="mt-6 text-sm text-pizarra">Gratis para estudiantes. Piloto: tecnología. Más áreas próximamente.</p>
        </div>
        <TableroTrabajos />
      </section>

      <section aria-label="Cómo funciona" className="mx-auto w-full max-w-6xl px-4 pt-12 sm:px-6">
        <ol className="grid gap-3 rounded-3xl bg-cielo p-4 sm:grid-cols-3 sm:p-5">
          {[
            { titulo: "Aprende la ruta", texto: "Qué saber para el puesto que quieres", icono: <IconoRuta /> },
            { titulo: "Resuelve un proyecto", texto: "Con datos reales; se corrige al instante", icono: <IconoCheck className="h-6 w-6" /> },
            { titulo: "Postula a una empresa", texto: "Con tu proyecto aprobado como prueba", icono: <IconoMaletin className="h-6 w-6" /> },
          ].map((paso, i) => (
            <li key={paso.titulo} className="flex items-center gap-4 rounded-2xl bg-blanco p-4">
              <span
                aria-hidden="true"
                className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${
                  i === 2 ? "bg-tinta text-lima" : "bg-cielo text-cobalto"
                }`}
              >
                {paso.icono}
              </span>
              <span>
                <span className="block font-extrabold">
                  {i + 1}. {paso.titulo}
                </span>
                <span className="block text-sm text-pizarra">{paso.texto}</span>
              </span>
            </li>
          ))}
        </ol>
      </section>

      <section aria-labelledby="titulo-areas" className="mx-auto w-full max-w-6xl px-4 pt-20 sm:px-6">
        <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2">
          <h2 id="titulo-areas" className="text-2xl font-bold tracking-[-0.03em] sm:text-3xl">
            Rutas por área
          </h2>
          <Link href="/rutas" className="font-bold text-cobalto hover:underline">
            Ver todas las rutas
          </Link>
        </div>
        <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {SECCIONES.map((s) => {
            const rutas = RUTAS.filter((r) => s.areas.includes(r.area));
            return (
              <li key={s.id} className="flex flex-col overflow-hidden rounded-3xl border border-linea bg-blanco">
                <div className={`px-6 pt-6 ${s.activa ? "bg-cielo" : "hidden bg-niebla sm:block"}`}>
                  <Ilustracion nombre={s.ilustracion} className={`h-auto w-full ${s.activa ? "" : "opacity-60 grayscale"}`} />
                </div>
                <div className="flex flex-1 flex-col p-5">
                  <h3 className="text-lg font-extrabold tracking-[-0.02em]">{s.titulo}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-pizarra">{s.descripcion}</p>
                  {s.activa ? (
                    <ul className="mt-3 space-y-1.5 text-sm font-bold">
                      {rutas.map((r) => (
                        <li key={r.slug}>
                          <Link href={`/rutas/${r.slug}`} className="text-cobalto underline-offset-4 hover:underline">
                            {r.puesto}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="mt-3 w-fit rounded-full bg-niebla px-3 py-1 text-xs font-bold text-pizarra">Próximamente</p>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      </section>

      <section aria-labelledby="titulo-oportunidades" className="mx-auto w-full max-w-6xl px-4 pt-20 sm:px-6">
        <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2">
          <h2 id="titulo-oportunidades" className="text-2xl font-bold tracking-[-0.03em] sm:text-3xl">
            Encargos y retos de empresas
          </h2>
          <Link href="/oportunidades" className="font-bold text-cobalto hover:underline">
            Ver todas las oportunidades
          </Link>
        </div>
        <Suspense fallback={<div className="mt-6 h-72 rounded-3xl border border-linea bg-blanco" aria-hidden="true" />}>
          <OportunidadesAbiertas />
        </Suspense>
      </section>

      <section aria-labelledby="titulo-empresas" className="mx-auto w-full max-w-6xl px-4 pt-20 sm:px-6">
        <div className="grid items-center gap-8 rounded-3xl bg-tinta p-6 text-blanco sm:p-10 lg:grid-cols-[1.1fr_1fr]">
          <div>
            <p className="text-sm font-bold text-lima">Para empresas</p>
            <h2 id="titulo-empresas" className="mt-2 max-w-xl text-2xl font-bold tracking-[-0.03em] sm:text-3xl">
              Conoce talento viendo cómo resuelve un encargo
            </h2>
            <p className="mt-3 max-w-[52ch] leading-relaxed opacity-85">
              Publica un encargo o un reto, elige qué etapa de la ruta pides y recibe solo a quienes ya
              demostraron que pueden hacer el trabajo.
            </p>
            <Link
              href="/empresa"
              className="mt-6 inline-flex items-center justify-center rounded-xl bg-lima px-6 py-3.5 font-bold text-tinta transition-colors hover:bg-blanco"
            >
              Ver la vista de empresa
            </Link>
          </div>
          <div className="rounded-2xl bg-blanco p-5 text-tinta">
            <p className="text-xs font-bold text-pizarra">Ejemplo de postulación recibida</p>
            <p className="mt-2 font-extrabold">Andrea Torres</p>
            <p className="text-sm text-pizarra">Ingeniería Informática, 8.º ciclo</p>
            <div className="mt-3 flex items-center gap-3 rounded-xl bg-lima-suave p-3">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-lima font-bold">✓</span>
              <p className="text-sm leading-snug">
                <span className="font-bold">Proyecto aprobado: 5 de 5 cifras.</span> Dashboard de ventas en Power BI.
              </p>
            </div>
            <p className="mt-3 text-sm text-pizarra">CV en PDF y entrega adjuntos.</p>
          </div>
        </div>
      </section>
    </>
  );
}

const TABLERO: { nombre: NombreIlustracion; alt: string }[] = [
  { nombre: "trabajo-analisis", alt: "Informe con gráficos y una tabla de datos." },
  { nombre: "trabajo-web", alt: "Prototipo de una web en escritorio y celular." },
  { nombre: "trabajo-diseno", alt: "Cartel de una identidad visual." },
  { nombre: "trabajo-comunicacion", alt: "Campaña adaptada a formatos de contenido." },
];

function TableroTrabajos() {
  return (
    <div role="group" aria-label="Ejemplos de trabajos por área" className="grid grid-cols-2 gap-3 rounded-[2rem] bg-cielo p-4 sm:gap-4 sm:p-6">
      {TABLERO.map((t, i) => (
        <figure key={t.nombre} className={`overflow-hidden rounded-2xl bg-blanco p-2 ${i % 2 ? "rotate-1" : "-rotate-1"}`}>
          <Ilustracion nombre={t.nombre} alt={t.alt} prioridad className="h-auto w-full" />
        </figure>
      ))}
    </div>
  );
}

function IconoRuta() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6" aria-hidden="true">
      <circle cx="6" cy="19" r="2" />
      <circle cx="18" cy="5" r="2" />
      <path d="M8 19h7.5a3.5 3.5 0 0 0 0-7h-7a3.5 3.5 0 0 1 0-7H16" />
    </svg>
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

async function OportunidadesAbiertas() {
  const abiertas = (await obtenerOportunidades().catch(() => [])).filter((o) => o.estado === "abierta").slice(0, 4);
  if (abiertas.length === 0) {
    return (
      <p className="mt-6 rounded-3xl border border-dashed border-linea bg-blanco p-6 text-pizarra">
        Estamos conversando con las primeras empresas.
      </p>
    );
  }
  return (
    <ul className="mt-6 grid gap-4 md:grid-cols-2">
      {abiertas.map((o) => (
        <li key={o.id}>
          <TarjetaOportunidad oportunidad={o} />
        </li>
      ))}
    </ul>
  );
}
