"use client";

import { useMemo, useSyncExternalStore } from "react";
import {
  CLAVE_BORRADORES,
  CLAVE_PORTAFOLIO,
  EVENTO_CAMBIO,
  type Borrador,
  type EntradaPortafolio,
} from "./almacenamiento";

function suscribir(aviso: () => void) {
  window.addEventListener("storage", aviso);
  window.addEventListener(EVENTO_CAMBIO, aviso);
  return () => {
    window.removeEventListener("storage", aviso);
    window.removeEventListener(EVENTO_CAMBIO, aviso);
  };
}

function useClave(clave: string): string | null | undefined {
  return useSyncExternalStore(
    suscribir,
    () => {
      try {
        return window.localStorage.getItem(clave);
      } catch {
        return null;
      }
    },
    // En el servidor todavía no se sabe qué hay guardado.
    () => undefined,
  );
}

function interpretar<T>(crudo: string | null, porDefecto: T): T {
  if (!crudo) return porDefecto;
  try {
    return JSON.parse(crudo) as T;
  } catch {
    return porDefecto;
  }
}

/** `undefined` mientras se hidrata; luego los borradores guardados. */
export function useBorradores(): Record<string, Borrador> | undefined {
  const crudo = useClave(CLAVE_BORRADORES);
  return useMemo(
    () => (crudo === undefined ? undefined : interpretar(crudo, {})),
    [crudo],
  );
}

/** `undefined` mientras se hidrata; luego las entradas del portafolio. */
export function usePortafolio(): EntradaPortafolio[] | undefined {
  const crudo = useClave(CLAVE_PORTAFOLIO);
  return useMemo(
    () => (crudo === undefined ? undefined : interpretar(crudo, [])),
    [crudo],
  );
}
