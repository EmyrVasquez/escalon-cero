"use client";

/**
 * Guardado local en el navegador. Sin cuentas: borradores y portafolio
 * viven en el dispositivo de la persona. Todo acceso tolera que el
 * almacenamiento no esté disponible (modo privado, bloqueo de cookies).
 */

export interface Borrador {
  practicaId: string;
  titulo: string;
  area: string;
  solucion: string;
  enlace: string;
  actualizado: string;
}

export interface EntradaPortafolio {
  practicaId: string;
  titulo: string;
  area: string;
  rol: string;
  /** Herramientas de la práctica; puede faltar en entregas antiguas. */
  herramientas?: string[];
  solucion: string;
  enlace: string;
  criterios: string[];
  criteriosCumplidos: string[];
  entregado: string;
}

export const EVENTO_CAMBIO = "escalon-cero:cambio";
export const CLAVE_BORRADORES = "escalon-cero:borradores";
export const CLAVE_PORTAFOLIO = "escalon-cero:portafolio";
const CLAVE_REACCIONES = "escalon-cero:reacciones";

function leer<T>(clave: string, porDefecto: T): T {
  try {
    const crudo = window.localStorage.getItem(clave);
    return crudo ? (JSON.parse(crudo) as T) : porDefecto;
  } catch {
    return porDefecto;
  }
}

function escribir(clave: string, valor: unknown): void {
  try {
    window.localStorage.setItem(clave, JSON.stringify(valor));
    window.dispatchEvent(new Event(EVENTO_CAMBIO));
  } catch {
    // Sin almacenamiento disponible: la sesión sigue funcionando sin guardar.
  }
}

export function leerBorradores(): Record<string, Borrador> {
  return leer<Record<string, Borrador>>(CLAVE_BORRADORES, {});
}

export function guardarBorrador(borrador: Borrador): void {
  const todos = leerBorradores();
  todos[borrador.practicaId] = borrador;
  escribir(CLAVE_BORRADORES, todos);
}

export function eliminarBorrador(practicaId: string): void {
  const todos = leerBorradores();
  delete todos[practicaId];
  escribir(CLAVE_BORRADORES, todos);
}

export function leerPortafolio(): EntradaPortafolio[] {
  return leer<EntradaPortafolio[]>(CLAVE_PORTAFOLIO, []);
}

export function guardarEnPortafolio(entrada: EntradaPortafolio): void {
  const resto = leerPortafolio().filter((e) => e.practicaId !== entrada.practicaId);
  escribir(CLAVE_PORTAFOLIO, [entrada, ...resto]);
}

export function actualizarCriterios(practicaId: string, cumplidos: string[]): void {
  const todas = leerPortafolio().map((e) =>
    e.practicaId === practicaId ? { ...e, criteriosCumplidos: cumplidos } : e,
  );
  escribir(CLAVE_PORTAFOLIO, todas);
}

export function quitarDelPortafolio(practicaId: string): void {
  escribir(
    CLAVE_PORTAFOLIO,
    leerPortafolio().filter((e) => e.practicaId !== practicaId),
  );
}

export function leerReaccionesPropias(): Record<string, string[]> {
  return leer<Record<string, string[]>>(CLAVE_REACCIONES, {});
}

export function registrarReaccionPropia(practicaId: string, tipo: string): void {
  const todas = leerReaccionesPropias();
  todas[practicaId] = Array.from(new Set([...(todas[practicaId] ?? []), tipo]));
  escribir(CLAVE_REACCIONES, todas);
}
