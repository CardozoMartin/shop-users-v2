// Decide cómo identificar la tienda según desde qué dominio se sirve el storefront.
//
// - En los dominios de la plataforma (localhost, *.netlify.app) la tienda se
//   identifica por el SLUG de la URL: apptiendizi.netlify.app/mi-tienda
// - En un dominio propio del comprador (ej: www.mitienda.com) la tienda se
//   identifica por el DOMINIO en sí, sin slug.

// Dominios "de plataforma": acá seguimos resolviendo por slug.
const DOMINIOS_PLATAFORMA = [
  'localhost',
  '127.0.0.1',
  'netlify.app', // cubre apptiendizi.netlify.app, deploy-previews, etc.
];

export function esDominioDePlataforma(host: string = window.location.hostname): boolean {
  return DOMINIOS_PLATAFORMA.some(
    (base) => host === base || host.endsWith(`.${base}`) || host.endsWith(base)
  );
}

// Devuelve el dominio propio actual, o null si estamos en un dominio de plataforma.
export function dominioPropioActual(): string | null {
  const host = window.location.hostname;
  return esDominioDePlataforma(host) ? null : host;
}

// Prefijo para construir los links internos del storefront.
// - En plataforma:  "/mi-tienda"  (la tienda vive bajo su slug)
// - En dominio propio: ""        (la tienda vive en la raíz)
// Centraliza la decisión: todos los links usan basePath en vez de hardcodear `/${slug}`.
export function basePathTienda(slug: string): string {
  return dominioPropioActual() ? '' : `/${slug}`;
}
