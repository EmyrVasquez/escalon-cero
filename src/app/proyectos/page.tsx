import type { Metadata } from "next";
import { Suspense } from "react";
import { Explorador, type FiltrosIniciales } from "@/components/proyectos/Explorador";
import { ListaProyectosCargando } from "@/components/proyectos/FilaProyecto";
import { obtenerProyectos } from "@/lib/proyectos";

export const metadata: Metadata = { title: "Proyectos" };

type Parametros = Promise<{ [clave: string]: string | string[] | undefined }>;

export default function Explorar({ searchParams }: { searchParams: Parametros }) {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 pt-12 sm:px-6">
      <h1 className="text-4xl font-extrabold tracking-[-0.045em] sm:text-5xl">Proyectos</h1>
      <p className="mt-3 max-w-[62ch] leading-relaxed text-pizarra">
        Encargos simulados de puestos junior, con los recursos que usarías en el trabajo.
        Cada proyecto pertenece a una etapa de una ruta, y las empresas los piden como
        requisito para postular. Filtra por área, rol, nivel o herramienta.
      </p>
      <Suspense fallback={<div className="mt-8"><ListaProyectosCargando filas={5} /></div>}>
        <Catalogo searchParams={searchParams} />
      </Suspense>
    </div>
  );
}

function lista(valor: string | string[] | undefined): string[] {
  if (!valor) return [];
  return (Array.isArray(valor) ? valor : [valor]).filter(Boolean);
}

async function Catalogo({ searchParams }: { searchParams: Parametros }) {
  const parametros = await searchParams;
  const proyectos = await obtenerProyectos();
  const inicial: FiltrosIniciales = {
    q: lista(parametros.q)[0] ?? "",
    area: lista(parametros.area),
    rol: lista(parametros.rol),
    herramienta: lista(parametros.herramienta),
  };
  // La clave reinicia los filtros cuando se llega desde el menú o el buscador.
  return <Explorador key={JSON.stringify(inicial)} proyectos={proyectos} inicial={inicial} />;
}
