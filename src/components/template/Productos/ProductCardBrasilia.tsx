import { Link, useParams } from 'react-router-dom';
import type { Producto } from '../../../types';
import { calcularPrecio, fmtPrecio } from '../../../utils/precio';
import { basePathTienda } from '../../../utils/dominio';

interface Props {
  producto: Producto;
  acento: string;
  onSelect: (p: Producto) => void;
  onAdd: (p: Producto) => void;
  destacado?: boolean;
  basePath?: string;
}

const DARK = '#2b2926';

/**
 * Card "Brasília": imagen cover, badge de descuento real (calcularPrecio),
 * botón "Comprar" siempre visible debajo del precio. Solo usa datos reales
 * del producto — sin badges de envío gratis ni tags de promo inventados.
 */
export default function ProductCardBrasilia({ producto, acento, destacado, basePath, onSelect }: Props) {
  const { slug } = useParams<{ slug: string }>();
  const bp = basePath ?? basePathTienda(slug ?? '');
  const imagen = producto.imagenPrincipalUrl || producto.imagenes?.[0]?.url;
  const precio = calcularPrecio(producto);

  const variantes = producto.variantes ?? [];
  const tieneVariantes = variantes.length > 0;
  const variantesConStock = variantes.filter((v) => (v.stock ?? 0) > 0 && v.disponible !== false);
  const sinStock = tieneVariantes ? variantesConStock.length === 0 : (producto.stock ?? 0) <= 0;

  return (
    <div className="group w-full relative">
      <Link to={`${bp}/producto/${producto.id}`} className="block cursor-pointer">
        <div className="relative overflow-hidden rounded">
          {precio.descuento && !sinStock && (
            <span
              className="absolute top-2 right-2 z-10 px-2 py-1 rounded text-white text-xs font-bold"
              style={{ background: acento, color: DARK }}
            >
              {precio.descuento}% OFF
            </span>
          )}
          {sinStock && (
            <span className="absolute top-2 right-2 z-10 px-2 py-1 rounded text-white text-xs font-semibold" style={{ background: '#6b7280' }}>
              Sin stock
            </span>
          )}
          {imagen ? (
            <img
              src={imagen}
              alt={producto.nombre}
              className="w-full h-72 object-cover transition-transform duration-500 group-hover:scale-105"
              style={sinStock ? { opacity: 0.55, filter: 'grayscale(0.4)' } : undefined}
            />
          ) : (
            <div className="w-full h-72 flex items-center justify-center bg-gray-100">
              <svg className="w-12 h-12 opacity-20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          )}
        </div>

        {destacado && (
          <div className="mt-2 inline-block text-white text-[10px] font-semibold px-2 py-1 rounded" style={{ background: '#2f7d6f' }}>
            DESTACADO
          </div>
        )}

        <p className="mt-1 text-sm" style={{ color: 'var(--s-txt)' }}>{producto.nombre}</p>

        <div className="flex items-baseline gap-2 mt-0.5">
          {precio.anterior && (
            <span className="line-through text-xs" style={{ color: 'var(--s-muted)' }}>{fmtPrecio(precio.anterior)}</span>
          )}
          <span className="font-semibold text-sm" style={{ color: 'var(--s-txt)' }}>{fmtPrecio(precio.actual)}</span>
        </div>
      </Link>

      <button
        onClick={() => onSelect(producto)}
        disabled={sinStock}
        className="mt-2 font-semibold px-4 py-1.5 rounded text-sm border-none cursor-pointer transition hover:brightness-95 disabled:opacity-50 disabled:cursor-not-allowed"
        style={{ background: acento, color: DARK }}
      >
        {sinStock ? 'Sin stock' : 'Comprar'}
      </button>
    </div>
  );
}
