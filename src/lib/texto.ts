/** Quita tildes y pasa a minúsculas, para buscar sin importar cómo se escribió. */
export function normalizar(texto: string): string {
  return texto
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .trim();
}

/**
 * Pone en minúscula la primera letra para usar el texto dentro de una frase,
 * salvo que la primera palabra sea una sigla («QA junior», «ERP»).
 */
export function enFrase(texto: string): string {
  const primera = texto.split(/\s+/)[0] ?? "";
  if (primera.length > 1 && primera === primera.toUpperCase()) return texto;
  return texto.charAt(0).toLowerCase() + texto.slice(1);
}

export type GrupoDuracion = "corta" | "media" | "larga";

export const ETIQUETAS_DURACION: Record<GrupoDuracion, string> = {
  corta: "Hasta 30 min",
  media: "30 a 60 min",
  larga: "Más de 60 min",
};

/** Ubica una duración como «20–30 min» o «60–90 min» según su valor máximo. */
export function grupoDuracion(duracion: string | null): GrupoDuracion | null {
  const numeros = duracion?.match(/\d+/g)?.map(Number);
  if (!numeros?.length) return null;
  const maximo = Math.max(...numeros);
  if (maximo <= 30) return "corta";
  if (maximo <= 60) return "media";
  return "larga";
}

/** Minutos máximos de una duración, para ordenar. */
export function minutosMaximos(duracion: string | null): number {
  const numeros = duracion?.match(/\d+/g)?.map(Number);
  return numeros?.length ? Math.max(...numeros) : Number.POSITIVE_INFINITY;
}

/** «1 práctica», «3 prácticas». */
export function plural(n: number, singular: string, varias: string): string {
  return `${n} ${n === 1 ? singular : varias}`;
}
