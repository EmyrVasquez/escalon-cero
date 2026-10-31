"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";
import { useSesion } from "@/lib/sesion";
import { IconoChevronAbajo } from "@/components/ui/Iconos";

const ENLACES = [
  { href: "/mi-espacio", etiqueta: "Mi espacio" },
  { href: "/portafolio", etiqueta: "Mi portafolio" },
  { href: "/en-curso", etiqueta: "Proyectos en curso" },
  { href: "/postulaciones", etiqueta: "Mis postulaciones" },
];

/** «Ingresar» sin sesión; con sesión, el menú con el progreso de la persona. */
export function MenuCuenta() {
  const { usuario, nombre, cerrarSesion, esDemo } = useSesion();
  const ruta = usePathname();
  const [abiertoEn, setAbiertoEn] = useState<string | null>(null);
  const abierto = abiertoEn !== null && abiertoEn === ruta;
  const contenedor = useRef<HTMLDivElement>(null);
  const idMenu = useId();

  useEffect(() => {
    if (!abierto) return;
    function alPulsarFuera(e: PointerEvent) {
      if (!contenedor.current?.contains(e.target as Node)) setAbiertoEn(null);
    }
    function alTeclear(e: KeyboardEvent) {
      if (e.key === "Escape") setAbiertoEn(null);
    }
    document.addEventListener("pointerdown", alPulsarFuera);
    document.addEventListener("keydown", alTeclear);
    return () => {
      document.removeEventListener("pointerdown", alPulsarFuera);
      document.removeEventListener("keydown", alTeclear);
    };
  }, [abierto]);

  if (usuario === undefined) return <MenuCuentaCargando />;

  if (!usuario) {
    const volver = ruta && ruta !== "/ingresar" ? `?volver=${encodeURIComponent(ruta)}` : "";
    return (
      <Link
        href={`/ingresar${volver}`}
        className="inline-flex items-center rounded-full bg-cobalto px-4 py-2 text-[0.92rem] font-bold whitespace-nowrap text-blanco hover:bg-cobalto-hondo"
      >
        Ingresar
      </Link>
    );
  }

  const inicial = (nombre ?? "?").trim().charAt(0).toUpperCase();

  return (
    <div ref={contenedor} className="relative">
      <button
        type="button"
        aria-expanded={abierto}
        aria-controls={idMenu}
        onClick={() => setAbiertoEn(abierto ? null : ruta)}
        className="inline-flex items-center gap-2 rounded-full py-1 pr-2 pl-1 text-[0.92rem] font-semibold hover:bg-niebla"
      >
        <span aria-hidden="true" className="flex h-8 w-8 items-center justify-center rounded-full bg-cielo font-bold text-cobalto">
          {inicial}
        </span>
        <span className="max-w-[9rem] truncate">{nombre}</span>
        <IconoChevronAbajo className={`h-4 w-4 transition-transform ${abierto ? "rotate-180" : ""}`} />
      </button>
      {abierto && (
        <div
          id={idMenu}
          className="absolute right-0 top-full z-40 mt-2 w-60 rounded-2xl border border-linea bg-blanco p-2 shadow-[0_24px_48px_-20px_rgba(20,33,61,0.35)]"
        >
          <p className="truncate px-3 pt-2 pb-1 text-xs text-pizarra">{esDemo ? "Cuenta de ejemplo" : usuario.email}</p>
          <ul>
            {ENLACES.map((e) => (
              <li key={e.href}>
                <Link
                  href={e.href}
                  onClick={() => setAbiertoEn(null)}
                  aria-current={ruta?.startsWith(e.href) ? "page" : undefined}
                  className="block rounded-lg px-3 py-2 text-sm font-semibold hover:bg-niebla hover:text-cobalto"
                >
                  {e.etiqueta}
                </Link>
              </li>
            ))}
          </ul>
          <div className="mt-1 border-t border-linea pt-1">
            <button
              type="button"
              onClick={() => {
                setAbiertoEn(null);
                void cerrarSesion();
              }}
              className="block w-full rounded-lg px-3 py-2 text-left text-sm font-semibold text-pizarra hover:bg-niebla hover:text-tinta"
            >
              Cerrar sesión
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export function MenuCuentaCargando() {
  return <span aria-hidden="true" className="inline-block h-9 w-24 rounded-full bg-niebla" />;
}
