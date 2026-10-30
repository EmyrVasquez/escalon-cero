import Link from "next/link";
import { obtenerPracticas } from "@/lib/practicas";
import { FilaPractica } from "./FilaPractica";

/** Lista corta para la portada: todo menos la práctica destacada. */
export async function PracticasRecientes() {
  const practicas = await obtenerPracticas();
  const destacada = practicas.find((p) => p.destacada) ?? practicas[0];
  const resto = practicas.filter((p) => p.id !== destacada?.id).slice(0, 4);

  return (
    <>
      <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2">
        <h2 id="titulo-recientes" className="text-2xl font-bold tracking-[-0.03em] sm:text-3xl">
          Prácticas recientes
        </h2>
        <Link href="/explorar" className="font-bold text-cobalto hover:underline">
          Ver las {practicas.length} prácticas
        </Link>
      </div>
      {resto.length === 0 ? (
        <p className="mt-6 rounded-2xl border border-dashed border-linea bg-blanco p-6 text-pizarra">
          Pronto publicaremos más prácticas.
        </p>
      ) : (
        <ul className="mt-6 divide-y divide-linea overflow-hidden rounded-2xl border border-linea bg-blanco">
          {resto.map((p) => (
            <li key={p.id}>
              <FilaPractica practica={p} />
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
