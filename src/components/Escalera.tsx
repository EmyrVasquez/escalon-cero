const PASOS = [
  {
    titulo: "Elige tu ruta",
    texto: "El mapa del puesto que quieres: qué aprender en cada etapa y con qué proyecto demostrarlo.",
    alto: "sm:h-44",
    color: "bg-cielo text-tinta",
  },
  {
    titulo: "Haz los proyectos de tu ruta",
    texto: "Resuelves encargos simulados, comparas tu decisión con lo que pasó y los guardas en tu portafolio.",
    alto: "sm:h-60",
    color: "bg-cobalto text-blanco",
  },
  {
    titulo: "Postula y gana experiencia",
    texto: "Con tu ruta avanzada, postulas a experiencias con empresas reales y a retos con premio.",
    alto: "sm:h-76",
    color: "bg-lima text-tinta",
  },
];

export function Escalera() {
  return (
    <section aria-labelledby="como-funciona" className="mx-auto w-full max-w-6xl px-4 pt-20 sm:px-6">
      <h2 id="como-funciona" className="max-w-xl text-2xl font-bold tracking-[-0.03em] sm:text-3xl">
        Tres escalones hasta tu primera experiencia
      </h2>
      <p className="mt-3 max-w-xl leading-relaxed text-pizarra">
        Las empresas no piden años de experiencia: piden haber avanzado la ruta de su
        rol. Así cada postulación llega con pruebas de que puedes hacer el trabajo.
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
