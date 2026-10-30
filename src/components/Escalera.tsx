const PASOS = [
  {
    titulo: "Explora el encargo",
    texto: "Lees el contexto, descargas los recursos y descubres la complicación que nadie anticipó.",
    alto: "sm:h-44",
    color: "bg-cielo text-tinta",
  },
  {
    titulo: "Entrega tu solución",
    texto: "Haces el trabajo con las herramientas del puesto y explicas tus decisiones.",
    alto: "sm:h-60",
    color: "bg-cobalto text-blanco",
  },
  {
    titulo: "Descubre qué pasó",
    texto: "Ves lo que hizo el junior real, cómo terminó, y guardas tu entrega en tu portafolio.",
    alto: "sm:h-76",
    color: "bg-lima text-tinta",
  },
];

export function Escalera() {
  return (
    <section aria-labelledby="como-funciona" className="mx-auto w-full max-w-6xl px-4 pt-20 sm:px-6">
      <h2 id="como-funciona" className="max-w-xl text-2xl font-bold tracking-[-0.03em] sm:text-3xl">
        Cada práctica es un escalón hacia tu primer empleo
      </h2>
      <p className="mt-3 max-w-xl leading-relaxed text-pizarra">
        No se trata de acertar. Se trata de pensar como en el trabajo y comparar tu
        decisión con lo que ocurrió de verdad.
      </p>
      <ol className="mt-10 grid grid-cols-1 gap-3 sm:grid-cols-3 sm:items-end sm:gap-0">
        {PASOS.map((paso, i) => (
          <li
            key={paso.titulo}
            className={`escalon flex flex-col justify-end rounded-2xl p-6 sm:rounded-none sm:first:rounded-l-2xl sm:last:rounded-r-2xl sm:last:rounded-tl-2xl sm:[&:nth-child(2)]:rounded-tl-2xl ${paso.alto} ${paso.color}`}
          >
            <span className="text-sm font-semibold opacity-80">Paso {i + 1}</span>
            <span className="mt-1 text-xl font-bold tracking-[-0.02em]">{paso.titulo}</span>
            <span className="mt-2 max-w-[30ch] text-sm leading-relaxed opacity-90">
              {paso.texto}
            </span>
          </li>
        ))}
      </ol>
    </section>
  );
}
