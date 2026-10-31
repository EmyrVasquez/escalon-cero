"use client";

import Link from "next/link";
import { useSesion } from "@/lib/sesion";
import { AvisoSesion } from "@/components/cuenta/AvisoSesion";
import { IconoCandado, IconoHecho } from "@/components/ui/Iconos";
import { Ilustracion } from "@/components/ui/Ilustracion";
import { fechaLarga } from "@/lib/texto";

interface RutaEspacio {
  slug: string;
  puesto: string;
  etapas: { numero: number; titulo: string; proyectos: { id: string; titulo: string; comprobado: boolean }[] }[];
}

interface OportunidadEspacio {
  id: string;
  titulo: string;
  empresa: string;
  ruta: string | null;
  requeridos: string[];
}

interface Paso {
  eyebrow: string;
  titulo: string;
  texto: string;
  href: string;
  boton: string;
}

/** «Mi espacio»: el siguiente paso, la ruta en curso, el portafolio y las postulaciones. */
export function EspacioEstudiante({ rutas, oportunidades }: { rutas: RutaEspacio[]; oportunidades: OportunidadEspacio[] }) {
  const { usuario, nombre, portafolio, postulaciones, borradores, esDemo } = useSesion();

  if (usuario === undefined || (usuario && (portafolio === undefined || postulaciones === undefined))) {
    return <div className="h-96 rounded-3xl border border-linea bg-blanco" aria-busy="true" aria-label="Cargando tu espacio" />;
  }
  if (!usuario) {
    return (
      <AvisoSesion
        titulo="Ingresa para ver tu espacio"
        texto="Aquí ves tu siguiente paso, tu avance en la ruta y tus postulaciones. También puedes probarlo con la vista «Estudiante» de arriba."
      />
    );
  }

  const valida = (id: string) => !!portafolio?.some((e) => e.proyectoId === id && e.valida);
  const enviada = (id: string) => !!postulaciones?.some((p) => p.oportunidadId === id);
  const desbloqueadas = oportunidades.filter((o) => o.requeridos.length > 0 && o.requeridos.every(valida));
  const porPostular = desbloqueadas.filter((o) => !enviada(o.id));
  const intentoFallido = portafolio?.find((e) => e.resultado && !e.resultado.aprobada);

  // La ruta en curso: donde más avanzó; si aún no empieza, la que tiene el proyecto que se corrige solo.
  const avance = (r: RutaEspacio) => r.etapas.flatMap((e) => e.proyectos).filter((p) => valida(p.id)).length;
  const ordenadas = [...rutas].sort((a, b) => avance(b) - avance(a));
  const ruta: RutaEspacio | undefined =
    ordenadas[0] && avance(ordenadas[0]) > 0
      ? ordenadas[0]
      : (rutas.find((r) => r.etapas.some((e) => e.proyectos.some((p) => p.comprobado))) ?? rutas[0]);
  const avanzo = ruta ? avance(ruta) > 0 : false;
  const siguienteProyecto = ruta?.etapas.flatMap((e) => e.proyectos).find((p) => !valida(p.id));

  let paso: Paso;
  if (porPostular[0]) {
    paso = {
      eyebrow: "Desbloqueaste una oportunidad",
      titulo: `Ya puedes postular a ${porPostular[0].empresa}.`,
      texto: porPostular[0].titulo,
      href: `/oportunidades/${porPostular[0].id}#postular`,
      boton: "Postular ahora",
    };
  } else if (intentoFallido) {
    paso = {
      eyebrow: "Tu siguiente paso",
      titulo: "Corrige tus cifras y vuelve a enviar.",
      texto: `${intentoFallido.titulo}: llevas ${intentoFallido.resultado!.aciertos} de ${intentoFallido.resultado!.total}.`,
      href: `/proyectos/${intentoFallido.proyectoId}/resultado`,
      boton: "Ver las pistas",
    };
  } else if (ruta && siguienteProyecto) {
    paso = {
      eyebrow: "Tu siguiente paso",
      titulo: avanzo ? "Continúa tu ruta." : `Empieza tu ruta de ${ruta.puesto}.`,
      texto: siguienteProyecto.titulo,
      href: `/proyectos/${siguienteProyecto.id}`,
      boton: avanzo ? "Continuar" : "Empezar el proyecto",
    };
  } else {
    paso = {
      eyebrow: "Todo al día",
      titulo: desbloqueadas.length > 0 ? "Tus postulaciones están enviadas." : "Explora más oportunidades.",
      texto: "Te escribiremos al correo que dejaste con la respuesta de cada empresa.",
      href: desbloqueadas.length > 0 ? "/postulaciones" : "/oportunidades",
      boton: desbloqueadas.length > 0 ? "Ver mis postulaciones" : "Ver oportunidades",
    };
  }

  const primerNombre = (nombre ?? "").split(" ")[0] || "de nuevo";
  const aprobados = portafolio?.filter((e) => e.valida).length ?? 0;
  const enCurso = Object.keys(borradores ?? {}).length;

  return (
    <>
      <p className="text-sm font-bold text-cobalto">{esDemo ? "Tu espacio · cuenta de ejemplo" : "Tu espacio"}</p>
      <h1 className="mt-1 text-4xl font-extrabold tracking-[-0.045em] sm:text-5xl">Hola, {primerNombre}.</h1>

      <div className="mt-8 grid gap-4 lg:grid-cols-[1.4fr_1fr]">
        <section className="flex flex-col justify-between gap-6 rounded-3xl bg-tinta p-6 text-blanco sm:flex-row sm:items-center sm:p-8">
          <div className="min-w-0">
            <p className="text-sm font-bold text-lima">{paso.eyebrow}</p>
            <h2 className="mt-2 text-2xl font-extrabold leading-snug tracking-[-0.03em] sm:text-3xl">{paso.titulo}</h2>
            <p className="mt-2 opacity-80">{paso.texto}</p>
            <Link
              href={paso.href}
              className="mt-6 inline-flex items-center justify-center rounded-xl bg-lima px-6 py-3.5 font-bold text-tinta hover:bg-blanco"
            >
              {paso.boton}
            </Link>
          </div>
          <span className="hidden w-40 shrink-0 rounded-2xl bg-blanco p-2 sm:block">
            <Ilustracion nombre="trabajo-analisis" className="h-auto w-full" />
          </span>
        </section>

        {ruta && (
          <section className="rounded-3xl border border-linea bg-blanco p-6">
            <div className="flex items-baseline justify-between gap-3">
              <h2 className="font-extrabold">Tu ruta</h2>
              <Link href={`/rutas/${ruta.slug}`} className="text-sm font-bold text-cobalto hover:underline">
                Ver la ruta
              </Link>
            </div>
            <p className="mt-1 text-sm text-pizarra">{ruta.puesto}</p>
            <ol className="mt-4 space-y-2">
              {ruta.etapas.map((e) => {
                const hecha = e.proyectos.length > 0 && e.proyectos.every((p) => valida(p.id));
                return (
                  <li key={e.numero} className="flex items-center gap-3">
                    <span
                      aria-hidden="true"
                      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-xs font-extrabold ${
                        hecha
                          ? "bg-cobalto text-blanco"
                          : e.proyectos.length === 0
                            ? "border border-dashed border-linea text-pizarra"
                            : "border-2 border-linea text-pizarra"
                      }`}
                    >
                      {hecha ? <IconoHecho /> : e.proyectos.length === 0 ? <IconoCandado /> : `0${e.numero}`}
                    </span>
                    <span className="min-w-0 text-sm">
                      <span className="font-bold">{e.titulo}</span>
                      <span className="block text-xs text-pizarra">
                        {hecha ? "Completa" : e.proyectos.length === 0 ? "En preparación" : "Pendiente"}
                      </span>
                    </span>
                  </li>
                );
              })}
            </ol>
          </section>
        )}
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-3">
        <Resumen numero={aprobados} etiqueta={aprobados === 1 ? "proyecto aprobado" : "proyectos aprobados"} href="/portafolio" enlace="Mi portafolio" />
        <Resumen numero={enCurso} etiqueta={enCurso === 1 ? "proyecto en curso" : "proyectos en curso"} href="/en-curso" enlace="Ver en curso" />
        <Resumen numero={postulaciones?.length ?? 0} etiqueta={postulaciones?.length === 1 ? "postulación enviada" : "postulaciones enviadas"} href="/postulaciones" enlace="Mis postulaciones" />
      </div>

      <section aria-labelledby="titulo-mis-postulaciones" className="mt-10">
        <h2 id="titulo-mis-postulaciones" className="text-2xl font-bold tracking-[-0.03em]">
          Mis postulaciones
        </h2>
        {postulaciones && postulaciones.length > 0 ? (
          <ul className="mt-4 divide-y divide-linea overflow-hidden rounded-3xl border border-linea bg-blanco">
            {postulaciones.map((p) => (
              <li key={p.oportunidadId}>
                <Link href={`/oportunidades/${p.oportunidadId}`} className="flex flex-wrap items-center justify-between gap-x-6 gap-y-2 px-6 py-5 hover:bg-niebla">
                  <span className="min-w-0">
                    <span className="block text-xs font-semibold text-pizarra">{p.empresa}</span>
                    <span className="block font-bold leading-snug">{p.titulo}</span>
                  </span>
                  <span className="flex items-center gap-3 text-sm">
                    <span className="text-pizarra">{fechaLarga(p.enviada)}</span>
                    <span className="rounded-full bg-cielo px-3 py-1 font-bold text-cobalto">Enviada</span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-4 rounded-3xl border border-dashed border-linea bg-blanco p-6 text-pizarra">
            Aquí aparecerán tus postulaciones. Aprueba el proyecto de tu ruta para desbloquear la primera.
          </p>
        )}
      </section>
    </>
  );
}

function Resumen({ numero, etiqueta, href, enlace }: { numero: number; etiqueta: string; href: string; enlace: string }) {
  return (
    <Link href={href} className="group rounded-3xl border border-linea bg-blanco p-5 hover:border-cobalto">
      <p className="text-3xl font-extrabold">{numero}</p>
      <p className="text-sm text-pizarra">{etiqueta}</p>
      <p className="mt-2 text-sm font-bold text-cobalto group-hover:underline">{enlace}</p>
    </Link>
  );
}
