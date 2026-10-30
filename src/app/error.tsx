"use client";

export default function ErrorGeneral({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="mx-auto max-w-xl px-4 py-24 text-center sm:px-6">
      <h1 className="text-2xl font-bold tracking-[-0.03em]">No pudimos cargar esta página</h1>
      <p className="mt-3 leading-relaxed text-pizarra">
        Revisa tu conexión a internet y vuelve a intentarlo. Si el problema sigue, la
        base de datos puede no estar disponible en este momento.
      </p>
      <button
        type="button"
        onClick={reset}
        className="mt-6 rounded-xl bg-cobalto px-6 py-3 font-bold text-blanco hover:bg-cobalto-hondo"
      >
        Intentar de nuevo
      </button>
    </div>
  );
}
