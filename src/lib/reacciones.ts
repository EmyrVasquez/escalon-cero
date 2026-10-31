"use client";

/**
 * Reacciones que ya marcó esta persona, guardadas en su navegador para no
 * mostrarle dos veces el mismo botón. Es lo único que vive en localStorage:
 * el resto del progreso está en su cuenta (ver sesion.tsx).
 */

const CLAVE = "escalon-cero:reacciones";

export function leerReaccionesPropias(): Record<string, string[]> {
  try {
    const crudo = window.localStorage.getItem(CLAVE);
    return crudo ? (JSON.parse(crudo) as Record<string, string[]>) : {};
  } catch {
    return {};
  }
}

export function registrarReaccionPropia(proyectoId: string, tipo: string): void {
  const todas = leerReaccionesPropias();
  todas[proyectoId] = Array.from(new Set([...(todas[proyectoId] ?? []), tipo]));
  try {
    window.localStorage.setItem(CLAVE, JSON.stringify(todas));
  } catch {
    // Sin almacenamiento disponible: la reacción ya se registró en la base.
  }
}
