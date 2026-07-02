// Kits tipográficos: parejas display + body pensadas para que combinen bien.
// El dueño elige UN kit; internamente se asigna la fuente display a
// navbar/títulos/nombre de producto y la body al resto del texto.

export type FuenteKitId = 'MODERNO' | 'EDITORIAL' | 'IMPACTO' | 'MINIMAL';

export interface FuenteKit {
  id: FuenteKitId;
  label: string;
  desc: string;
  display: string; // font-family para títulos/navbar/nombre de producto
  body: string;    // font-family para el resto del texto
  // URL de Google Fonts que carga las 1-2 familias del kit.
  googleHref: string;
}

export const FUENTE_KITS: Record<FuenteKitId, FuenteKit> = {
  MODERNO: {
    id: 'MODERNO',
    label: 'Moderno',
    desc: 'Limpio y versátil. Ideal para cualquier rubro.',
    display: "'Plus Jakarta Sans', system-ui, sans-serif",
    body: "'Plus Jakarta Sans', system-ui, sans-serif",
    googleHref: 'https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap',
  },
  EDITORIAL: {
    id: 'EDITORIAL',
    label: 'Editorial',
    desc: 'Títulos con serif elegante y texto cálido.',
    display: "'Playfair Display', Georgia, serif",
    body: "'Nunito', system-ui, sans-serif",
    googleHref: 'https://fonts.googleapis.com/css2?family=Playfair+Display:wght@500;600;700;800&family=Nunito:wght@400;500;600;700&display=swap',
  },
  IMPACTO: {
    id: 'IMPACTO',
    label: 'Impacto',
    desc: 'Titulares grandes y contundentes. Estilo urbano.',
    display: "'Bebas Neue', Impact, sans-serif",
    body: "'DM Sans', system-ui, sans-serif",
    googleHref: 'https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@400;500;600;700&display=swap',
  },
  MINIMAL: {
    id: 'MINIMAL',
    label: 'Minimal',
    desc: 'Serif de exhibición con texto neutro y sobrio.',
    display: "'DM Serif Display', Georgia, serif",
    body: "'Inter', system-ui, sans-serif",
    googleHref: 'https://fonts.googleapis.com/css2?family=DM+Serif+Display&family=Inter:wght@400;500;600;700&display=swap',
  },
};

export const FUENTE_KIT_DEFAULT: FuenteKitId = 'MODERNO';

export function getFuenteKit(id?: string | null): FuenteKit {
  return FUENTE_KITS[(id as FuenteKitId)] ?? FUENTE_KITS[FUENTE_KIT_DEFAULT];
}
