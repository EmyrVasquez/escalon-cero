import Link from "next/link";
import { obtenerProyectos } from "@/lib/proyectos";
import { FilaProyecto } from "@/components/proyectos/FilaProyecto";

/** Lista corta para la portada: los proyectos de la primera etapa de cada ruta. */
export async function ProyectosRecientes() {
  const proyectos = await obtenerProyectos();
  const paraEmpezar = proyectos.filter((p) => p.etapa === 1).slice(0, 5);

  return (
    <>
      <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2">
        <h2 id="titulo-recientes" className="text-2xl font-bold tracking-[-0.03em] sm:text-3xl">
          Proyectos para empezar
        </h2>
        <Link href="/proyectos" className="font-bold text-cobalto hover:underline">
          Ver los {proyectos.length} proyectos
        </Link>
      </div>
      <p className="mt-3 max-w-xl leading-relaxed text-pizarra">
        Son la primera etapa de cada ruta: con uno de ellos ya puedes postular a las
        oportunidades de su rol.
      </p>
      {paraEmpezar.length === 0 ? (
        <p className="mt-6 rounded-2xl border border-dashed border-linea bg-blanco p-6 text-pizarra">
          Pronto publicaremos más proyectos.
        </p>
      ) : (
        <ul className="mt-6 divide-y divide-linea overflow-hidden rounded-2xl border border-linea bg-blanco">
          {paraEmpezar.map((p) => (
            <li key={p.id}>
              <FilaProyecto proyecto={p} />
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
