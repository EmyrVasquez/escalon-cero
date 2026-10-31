"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

/** Bloque para pedir que la persona ingrese antes de ver o guardar su progreso. */
export function AvisoSesion({ titulo, texto }: { titulo: string; texto: string }) {
  const ruta = usePathname();
  const volver = encodeURIComponent(ruta ?? "/");
  return (
    <div className="rounded-3xl border border-dashed border-linea bg-blanco p-6 sm:p-8">
      <h2 className="text-lg font-bold">{titulo}</h2>
      <p className="mt-2 max-w-[58ch] leading-relaxed text-pizarra">{texto}</p>
      <div className="mt-5 flex flex-col gap-3 sm:flex-row">
        <Link
          href={`/ingresar?volver=${volver}`}
          className="inline-flex items-center justify-center rounded-xl bg-cobalto px-6 py-3 font-bold text-blanco hover:bg-cobalto-hondo"
        >
          Ingresar
        </Link>
        <Link
          href={`/ingresar?modo=registro&volver=${volver}`}
          className="inline-flex items-center justify-center rounded-xl border border-linea px-6 py-3 font-bold hover:border-tinta"
        >
          Crear cuenta
        </Link>
      </div>
    </div>
  );
}
