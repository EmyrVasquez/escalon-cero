import Form from "next/form";
import Link from "next/link";
import { Suspense } from "react";
import { armarMenu } from "@/lib/menu";
import { obtenerPracticas } from "@/lib/practicas";
import { IconoBuscar } from "./Iconos";
import { Logo } from "./Logo";
import { MenuCuenta, MenuCuentaCargando } from "./MenuCuenta";
import { EnlaceExplorar, EnlacePrincipal, EnlacePrincipalFijo, MenuExplorar } from "./Navegacion";

export function Encabezado() {
  return (
    <header className="no-imprimir relative z-30 mx-auto w-full max-w-6xl px-4 pt-4 sm:px-6">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2 rounded-2xl border border-linea bg-blanco px-4 py-3 sm:px-5 lg:gap-x-4">
        <Link href="/" aria-label="Escalón Cero, ir al inicio" className="order-1 rounded-lg">
          <Logo />
        </Link>

        {/* Rutas → Proyectos → Oportunidades: el mismo orden en que avanza el estudiante. */}
        <nav aria-label="Principal" className="order-3 w-full lg:order-2 lg:w-auto">
          <ul className="-mx-1 flex items-center gap-1">
            <li>
              <Suspense fallback={<EnlacePrincipalFijo href="/rutas" etiqueta="Rutas" />}>
                <EnlacePrincipal href="/rutas" etiqueta="Rutas" />
              </Suspense>
            </li>
            <li>
              <Suspense fallback={<EnlaceExplorar />}>
                <MenuConDatos />
              </Suspense>
            </li>
            <li>
              <Suspense fallback={<EnlacePrincipalFijo href="/oportunidades" etiqueta="Oportunidades" />}>
                <EnlacePrincipal href="/oportunidades" etiqueta="Oportunidades" />
              </Suspense>
            </li>
          </ul>
        </nav>

        <Form action="/proyectos" role="search" className="order-4 w-full lg:order-3 lg:w-auto lg:min-w-0 lg:flex-1">
          <label htmlFor="buscar-cabecera" className="sr-only">
            Buscar proyectos
          </label>
          <div className="flex items-center gap-2 rounded-full border border-linea bg-niebla px-4 transition-colors focus-within:border-cobalto focus-within:bg-blanco">
            <IconoBuscar className="h-[18px] w-[18px] shrink-0 text-pizarra" />
            <input
              id="buscar-cabecera"
              name="q"
              type="search"
              placeholder="Busca proyectos, roles o herramientas"
              className="min-w-0 flex-1 bg-transparent py-2.5 text-sm outline-none placeholder:text-pizarra"
            />
          </div>
        </Form>

        <div className="order-2 ml-auto lg:order-4 lg:ml-0">
          <Suspense fallback={<MenuCuentaCargando />}>
            <MenuCuenta />
          </Suspense>
        </div>
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
