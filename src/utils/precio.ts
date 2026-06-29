import type { Producto } from '../types';

export interface InfoPrecio {
  actual: number;        // precio que paga el cliente
  anterior: number | null; // precio viejo a tachar (null si no hay rebaja)
  descuento: number | null; // % de descuento redondeado (null si no hay)
}

/**
 * Calcula el precio a mostrar estilo Mercado Libre.
 * - Si hay precioOferta: actual = oferta, anterior = precio.
 * - Si no hay oferta pero sí precioAnterior (el precio bajó): actual = precio, anterior = precioAnterior.
 */
export function calcularPrecio(p: Pick<Producto, 'precio' | 'precioOferta' | 'precioAnterior'>): InfoPrecio {
  const precio = Number(p.precio ?? 0);
  const oferta = p.precioOferta != null && p.precioOferta !== '' ? Number(p.precioOferta) : null;
  const anteriorGuardado = p.precioAnterior != null && p.precioAnterior !== '' ? Number(p.precioAnterior) : null;

  let actual = precio;
  let anterior: number | null = null;

  if (oferta != null && oferta > 0 && oferta < precio) {
    actual = oferta;
    anterior = precio;
  } else if (anteriorGuardado != null && anteriorGuardado > precio) {
    actual = precio;
    anterior = anteriorGuardado;
  }

  const descuento = anterior && anterior > actual
    ? Math.round(((anterior - actual) / anterior) * 100)
    : null;

  return { actual, anterior, descuento };
}

export function fmtPrecio(v: number | string) {
  return `$ ${Number(v).toLocaleString('es-AR')}`;
}
