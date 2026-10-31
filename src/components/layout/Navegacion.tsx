"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";
import type { DatosMenu } from "@/lib/menu";
import { plural } from "@/lib/texto";
import { IconoChevronAbajo } from "@/components/ui/Iconos";

const CLASE_BOTON =
  "inline-flex items-center gap-1.5 rounded-full px-3.5 py-2 text-[0.92rem] font-semibold transition-colors";
const ACTIVO = "bg-cielo text-cobalto";
const INACTIVO = "text-pizarra hover:text-tinta";

export function estaEnExplorar(ruta: string | null) {
  return !!ruta && ruta.startsWith("/proyectos");
}

/** Enlace del menú principal, resaltado cuando se está en su sección. */
export function EnlacePrincipal({ href, etiqueta }: { href: string; etiqueta: string }) {
  const ruta = usePathname();
  return <EnlacePrincipalFijo href={href} etiqueta={etiqueta} activo={!!ruta?.startsWith(href)} />;
}

export function EnlacePrincipalFijo({ href, etiqueta, activo = false }: { href: string; etiqueta: string; activo?: boolean }) {
  return (
    <Link
      href={href}
      aria-current={activo ? "page" : undefined}
      className={`${CLASE_BOTON} whitespace-nowrap ${activo ? ACTIVO : INACTIVO}`}
    >
      {etiqueta}
    </Link>
  );
}

/** Botón «Proyectos» con el menú por área, rol y herramienta. */
export function MenuExplorar({ menu }: { menu: DatosMenu }) {
  const ruta = usePathname();
  // El menú se recuerda abierto solo en la ruta donde se abrió: al navegar se cierra.
  const [abiertoEn, setAbiertoEn] = useState<string | null>(null);
  const abierto = abiertoEn !== null && abiertoEn === ruta;
  const contenedor = useRef<HTMLDivElement>(null);
  const boton = useRef<HTMLButtonElement>(null);
  const idPanel = useId();

  useEffect(() => {
    if (!abierto) return;
    function alPulsarFuera(evento: PointerEvent) {
      if (!contenedor.current?.contains(evento.target as Node)) setAbiertoEn(null);
    }
    function alTeclear(evento: KeyboardEvent) {
      if (evento.key === "Escape") {
        setAbiertoEn(null);
        boton.current?.focus();
      }
    }
    document.addEventListener("pointerdown", alPulsarFuera);
    document.addEventListener("keydown", alTeclear);
    return () => {
      document.removeEventListener("pointerdown", alPulsarFuera);
      document.removeEventListener("keydown", alTeclear);
    };
  }, [abierto]);

  const cerrar = () => setAbiertoEn(null);

  return (
    <div ref={contenedor}>
      <button
        ref={boton}
        type="button"
        aria-expanded={abierto}
        aria-controls={idPanel}
        onClick={() => setAbiertoEn(abierto ? null : ruta)}
        className={`${CLASE_BOTON} whitespace-nowrap ${abierto || estaEnExplorar(ruta) ? ACTIVO : INACTIVO}`}
      >
        Proyectos
        <IconoChevronAbajo
          className={`h-4 w-4 transition-transform motion-reduce:transition-none ${abierto ? "rotate-180" : ""}`}
        />
      </button>

      {abierto && <PanelExplorar id={idPanel} menu={menu} alElegir={cerrar} />}
    </div>
  );
}

function PanelExplorar({
  id,
  menu,
  alElegir,
}: {
  id: string;
  menu: DatosMenu;
  alElegir: () => void;
}) {
  return (
    <div
      id={id}
      className="absolute inset-x-4 top-full z-40 mt-2 max-h-[calc(100dvh-7rem)] overflow-y-auto rounded-2xl border border-linea bg-blanco shadow-[0_24px_48px_-20px_rgba(20,33,61,0.35)] sm:inset-x-6"
    >
      <div className="grid gap-8 p-5 sm:p-6 lg:grid-cols-[2.2fr_1fr_1fr] lg:gap-10">
        <section aria-labelledby={`${id}-areas`}>
          <h2 id={`${id}-areas`} className="text-sm font-bold">
            Por área
          </h2>
          <div className="mt-3 grid gap-x-8 gap-y-5 sm:grid-cols-3">
            {menu.familias.map((f) => (
              <div key={f.etiqueta}>
                <h3 className="text-xs font-semibold text-pizarra">{f.etiqueta}</h3>
                <ul className="mt-2 space-y-0.5 text-sm">
                  {f.areas.map((a) => (
                    <li key={a.href}>
                      <Link
                        href={a.href}
                        onClick={alElegir}
                        className="-mx-2 flex justify-between gap-3 rounded-lg px-2 py-1.5 font-semibold hover:bg-niebla hover:text-cobalto"
                      >
                        {a.etiqueta}
                        <span className="font-normal text-pizarra">{a.conteo}</span>
                      </Link>
                    </li>
                  ))}
                  {f.enCamino.map((e) => (
                    <li key={e} className="flex justify-between gap-3 py-1.5 text-pizarra">
                      {e}
                      <span className="text-xs">Próximamente</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        <section aria-labelledby={`${id}-roles`}>
          <h2 id={`${id}-roles`} className="text-sm font-bold">
            Por rol
          </h2>
          <ul className="mt-3 space-y-0.5 text-sm">
            {menu.roles.map((r) => (
              <li key={r.href}>
                <Link
                  href={r.href}
                  onClick={alElegir}
                  className="-mx-2 block rounded-lg px-2 py-1.5 hover:bg-niebla hover:text-cobalto"
                >
                  {r.etiqueta}
                </Link>
              </li>
            ))}
          </ul>
        </section>

        <section aria-labelledby={`${id}-herramientas`}>
          <h2 id={`${id}-herramientas`} className="text-sm font-bold">
            Por herramienta
          </h2>
          <ul className="mt-3 flex flex-wrap gap-2 text-[0.82rem] font-semibold">
            {menu.herramientas.map((h) => (
              <li key={h.href}>
                <Link
                  href={h.href}
                  onClick={alElegir}
                  className="inline-block rounded-full border border-linea bg-niebla px-3 py-1.5 hover:border-cobalto hover:text-cobalto"
                >
                  {h.etiqueta}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-2 rounded-b-2xl border-t border-linea bg-niebla px-5 py-3.5 text-sm sm:px-6">
        <span className="text-pizarra">
          {plural(menu.total, "proyecto", "proyectos")} en{" "}
          {plural(menu.areasConProyectos, "área", "áreas")}
          {menu.areasEnCamino > 0 && `, y ${plural(menu.areasEnCamino, "área más", "áreas más")} en camino`}
        </span>
        <Link href="/proyectos" onClick={alElegir} className="font-bold text-cobalto hover:underline">
          Ver todos los proyectos
        </Link>
      </div>
    </div>
  );
}

/** Mientras cargan los datos del menú, «Proyectos» lleva directo al catálogo. */
export function EnlaceExplorar() {
  return (
    <Link href="/proyectos" className={`${CLASE_BOTON} whitespace-nowrap ${INACTIVO}`}>
      Proyectos
    </Link>
  );
}
