import { useSyncExternalStore } from "react";

const nada = () => () => {};

/**
 * `false` en el servidor y durante la hidratación; `true` después.
 * Sirve para que lo que depende de la sesión no choque con el HTML del servidor:
 * React no corrige atributos (clases, `disabled`) que difieren al hidratar.
 */
export function useMontado(): boolean {
  return useSyncExternalStore(
    nada,
    () => true,
    () => false,
  );
}
