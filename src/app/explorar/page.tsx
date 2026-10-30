import type { Metadata } from "next";
import { Suspense } from "react";
import { Explorador, type FiltrosIniciales } from "@/components/Explorador";
import { ListaPracticasCargando } from "@/components/FilaPractica";
import { obtenerPracticas } from "@/lib/practicas";

export const metadata: Metadata = { title: "Explorar prácticas" };

type Parametros = Promise<{ [clave: string]: string | string[] | undefined }>;

export default function Explorar({ searchParams }: { searchParams: Parametros }) {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 pt-12 sm:px-6">
      <h1 className="text-4xl font-extrabold tracking-[-0.045em] sm:text-5xl">Explorar prácticas</h1>
      <p className="mt-3 max-w-[62ch] leading-relaxed text-pizarra">
        Encargos de puestos junior, con los recursos que usarías en el trabajo. Filtra
        por área, rol, nivel o herramienta.
      </p>
      <Suspense fallback={<div className="mt-8"><ListaPracticasCargando filas={5} /></div>}>
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
  const practicas = await obtenerPracticas();
  const inicial: FiltrosIniciales = {
    q: lista(parametros.q)[0] ?? "",
    area: lista(parametros.area),
    rol: lista(parametros.rol),
    herramienta: lista(parametros.herramienta),
  };
  // La clave reinicia los filtros cuando se llega desde el menú o el buscador.
  return <Explorador key={JSON.stringify(inicial)} practicas={practicas} inicial={inicial} />;
}
