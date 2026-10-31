"use client";

import type { ResultadoComprobacion } from "./tipos";

/**
 * Tipos del progreso del estudiante y lo poco que queda en el navegador.
 * El progreso (entregas, borradores y postulaciones) vive en la cuenta: ver
 * `src/lib/sesion.tsx`. Aquí solo quedan las reacciones propias y la lectura
 * del progreso que se guardó en el navegador antes de existir las cuentas,
 * para importarlo la primera vez que la persona inicia sesión.
 */

export interface Borrador {
  practicaId: string;
  titulo: string;
  area: string;
  solucion: string;
  enlace: string;
  /** Respuestas a la comprobación automática, si el proyecto la tiene. */
  respuestas?: Record<string, string>;
  actualizado: string;
}

export interface EntradaPortafolio {
  practicaId: string;
  titulo: string;
  area: string;
  rol: string;
  herramientas?: string[];
  solucion: string;
  enlace: string;
  criterios: string[];
  criteriosCumplidos: string[];
  entregado: string;
  /** Ruta del archivo subido en el bucket «entregas», si lo hay. */
  archivo?: string | null;
  /** Respuestas a la comprobación automática, por id de pregunta. */
  respuestas?: Record<string, string>;
  /** Resultado de la comprobación automática, si el proyecto la tiene. */
  resultado?: ResultadoComprobacion | null;
  /**
   * Si la entrega cuenta como requisito para postular: siempre en proyectos
   * sin comprobación; en los demás, solo si quedó aprobada.
   */
  valida: boolean;
}

export interface PostulacionLocal {
  oportunidadId: string;
  titulo: string;
  empresa: string;
  tipo: string;
  compensacion: string;
  practicas: string[];
  enviada: string;
}

const CLAVE_BORRADORES = "escalon-cero:borradores";
const CLAVE_PORTAFOLIO = "escalon-cero:portafolio";
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
  } catch {
    // Sin almacenamiento disponible: la sesión sigue funcionando sin guardar.
  }
}

/** Progreso guardado en el navegador antes de las cuentas, para importarlo. */
export function leerProgresoLocal(): { portafolio: EntradaPortafolio[]; borradores: Borrador[] } {
  return {
    portafolio: leer<EntradaPortafolio[]>(CLAVE_PORTAFOLIO, []),
    borradores: Object.values(leer<Record<string, Borrador>>(CLAVE_BORRADORES, {})),
  };
}

export function olvidarProgresoLocal(): void {
  try {
    window.localStorage.removeItem(CLAVE_PORTAFOLIO);
    window.localStorage.removeItem(CLAVE_BORRADORES);
  } catch {
    // Nada que limpiar.
  }
}

export function leerReaccionesPropias(): Record<string, string[]> {
  return leer<Record<string, string[]>>(CLAVE_REACCIONES, {});
}

export function registrarReaccionPropia(practicaId: string, tipo: string): void {
  const todas = leerReaccionesPropias();
  todas[practicaId] = Array.from(new Set([...(todas[practicaId] ?? []), tipo]));
  escribir(CLAVE_REACCIONES, todas);
}
