import Form from "next/form";
import Link from "next/link";
import { Suspense } from "react";
import { armarMenu } from "@/lib/menu";
import { obtenerPracticas } from "@/lib/practicas";
import { IconoBuscar } from "./Iconos";
import { Logo } from "./Logo";
import { EnlaceExplorar, EnlacesEspacio, ListaEspacio, MenuExplorar } from "./Navegacion";

export function Encabezado() {
  return (
    <header className="no-imprimir relative z-30 mx-auto w-full max-w-6xl px-4 pt-4 sm:px-6">
      <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-linea bg-blanco px-4 py-3 sm:gap-4 sm:px-5">
        <Link href="/" aria-label="Escalón Cero, ir al inicio" className="rounded-lg">
          <Logo />
        </Link>

        <Suspense fallback={<EnlaceExplorar />}>
          <MenuConDatos />
        </Suspense>

        <Form
          action="/explorar"
          role="search"
          className="order-last w-full sm:order-none sm:w-auto sm:min-w-0 sm:flex-1"
        >
          <label htmlFor="buscar-cabecera" className="sr-only">
            Buscar prácticas
          </label>
          <div className="flex items-center gap-2 rounded-full border border-linea bg-niebla px-4 transition-colors focus-within:border-cobalto focus-within:bg-blanco">
            <IconoBuscar className="h-[18px] w-[18px] shrink-0 text-pizarra" />
            <input
              id="buscar-cabecera"
              name="q"
              type="search"
              placeholder="Busca prácticas, roles o herramientas"
              className="min-w-0 flex-1 bg-transparent py-2.5 text-sm outline-none placeholder:text-pizarra"
            />
          </div>
        </Form>

        <nav aria-label="Tu espacio" className="ml-auto sm:ml-0">
          <Suspense fallback={<ListaEspacio />}>
            <EnlacesEspacio />
          </Suspense>
        </nav>
      </div>
    </header>
  );
}

async function MenuConDatos() {
  // Si la base no responde, el encabezado sigue funcionando sin el menú.
  const practicas = await obtenerPracticas().catch(() => null);
  if (!practicas) return <EnlaceExplorar />;
  return <MenuExplorar menu={armarMenu(practicas)} />;
}
