// Mapeo de nombres de color comunes (en español) a su valor hex, para mostrar swatches.
// La clave se normaliza a minúsculas y sin acentos.
const MAPA: Record<string, string> = {
  negro: '#111111',
  blanco: '#ffffff',
  gris: '#9ca3af',
  grisoscuro: '#4b5563',
  azul: '#2563eb',
  azulmarino: '#1e3a8a',
  celeste: '#38bdf8',
  rojo: '#dc2626',
  bordo: '#7f1d1d',
  verde: '#16a34a',
  verdeagua: '#2dd4bf',
  amarillo: '#eab308',
  naranja: '#ea580c',
  rosa: '#ec4899',
  fucsia: '#d946ef',
  violeta: '#7c3aed',
  lila: '#c4b5fd',
  beige: '#e7dcc7',
  crema: '#f5f0e1',
  marron: '#78350f',
  camel: '#c19a6b',
  dorado: '#d4af37',
  plateado: '#c0c0c0',
};

const normalizar = (s: string) =>
  s
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '') // quita acentos
    .replace(/\s+/g, '');

/**
 * Devuelve el hex de un nombre de color conocido, o null si no lo reconoce.
 * Reconoce también combinaciones simples tomando la primera palabra (ej: "Azul Francia").
 */
export function colorAHex(nombre?: string | null): string | null {
  if (!nombre) return null;
  const key = normalizar(nombre);
  if (MAPA[key]) return MAPA[key];
  // Probar primera palabra (ej: "azul francia" → "azul")
  const primera = normalizar(nombre.split(/[\s/-]/)[0] ?? '');
  return MAPA[primera] ?? null;
}
