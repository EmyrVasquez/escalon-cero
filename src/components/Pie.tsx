import { SimboloEscalon } from "./Logo";

export function Pie() {
  return (
    <footer className="no-imprimir mx-auto w-full max-w-6xl px-4 pb-10 pt-16 sm:px-6">
      <div className="flex flex-col gap-4 border-t border-linea pt-6 text-sm text-pizarra sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-3">
          <SimboloEscalon className="mt-0.5 h-6 w-auto shrink-0 text-cobalto" />
          <p className="max-w-md leading-relaxed">
            Creado en DSC HACK 2026 por Emyr Vasquez Riofrio, Jhon Mejia Quispe y
            Gustavo Marcelo Monge Tovar.
          </p>
        </div>
        <p className="max-w-sm leading-relaxed">
          Cada práctica indica si es un caso real anonimizado, basado en hechos
          reales o un ejemplo ilustrativo.
        </p>
      </div>
    </footer>
  );
}
