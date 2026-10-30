import Link from "next/link";

export default function NoEncontrado() {
  return (
    <div className="mx-auto max-w-xl px-4 py-24 text-center sm:px-6">
      <h1 className="text-2xl font-bold tracking-[-0.03em]">Esta página no existe</h1>
      <p className="mt-3 leading-relaxed text-pizarra">
        Puede que el enlace esté incompleto o que el proyecto ya no esté publicado.
      </p>
      <Link
        href="/proyectos"
        className="mt-6 inline-flex rounded-xl bg-cobalto px-6 py-3 font-bold text-blanco hover:bg-cobalto-hondo"
      >
        Ver proyectos
      </Link>
    </div>
  );
}
