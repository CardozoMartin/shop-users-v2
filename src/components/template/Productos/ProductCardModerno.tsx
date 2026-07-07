import { Link, useParams } from 'react-router-dom';
import type { Producto } from '../../../types';
import { calcularPrecio, fmtPrecio } from '../../../utils/precio';
import { basePathTienda } from '../../../utils/dominio';
import { colorAHex } from '../../../utils/colores';

interface Props {
  producto: Producto;
  acento: string;
  onSelect: (p: Producto) => void;
  onAdd: (p: Producto) => void;
  destacado?: boolean;
  basePath?: string;
}

// Diseño MODERNO (nuevo): por ahora es una copia idéntica del clásico; se irá
// modificando paso a paso para diferenciarlo.
export default function ProductCardModerno({ producto, acento, destacado, basePath }: Props) {
  const { slug } = useParams<{ slug: string }>();
  // Si nos pasan el basePath explícito (p. ej. desde /ofertas/:slug donde el
  // :slug NO es la tienda), lo usamos; si no, lo derivamos del slug de la URL.
  const bp = basePath ?? basePathTienda(slug ?? '');
  const imagen = producto.imagenPrincipalUrl || producto.imagenes?.[0]?.url;
  const precio = calcularPrecio(producto);

  const variantes = producto.variantes ?? [];
  const tieneVariantes = variantes.length > 0;

  // Variantes con stock real
  const variantesConStock = variantes.filter(
    (v) => (v.stock ?? 0) > 0 && v.disponible !== false
  );

  // Colores y talles disponibles (para chips en la tarjeta)
  const colores = [...new Set(variantesConStock.map((v) => v.color).filter(Boolean))] as string[];
  const talles = [...new Set(variantesConStock.map((v) => v.talle).filter(Boolean))] as string[];

  // Sin stock: con variantes → ninguna disponible; sin variantes → stock del producto
  const sinStock = tieneVariantes
    ? variantesConStock.length === 0
    : (producto.stock ?? 0) <= 0;

  return (
    <Link
      to={`${bp}/producto/${producto.id}`}
      className="group w-full cursor-pointer block"
    >
      <div className="relative">
        {/* Badge destacado */}
        {destacado && (
          <span
            className="absolute top-2 left-2 z-10 flex items-center gap-1 px-2.5 py-1 rounded-full text-white text-xs font-semibold shadow-md"
            style={{ background: acento, fontSize: 11 }}
          >
            <svg width="11" height="11" viewBox="0 0 18 17" fill="none">
              <path d="M8.04894 0.927049C8.3483 0.00573802 9.6517 0.00574017 9.95106 0.927051L11.2451 4.90983C11.379 5.32185 11.763 5.60081 12.1962 5.60081H16.3839C17.3527 5.60081 17.7554 6.84043 16.9717 7.40983L13.5838 9.87132C13.2333 10.126 13.0866 10.5773 13.2205 10.9894L14.5146 14.9721C14.8139 15.8934 13.7595 16.6596 12.9757 16.0902L9.58778 13.6287C9.2373 13.374 8.7627 13.374 8.41221 13.6287L5.02426 16.0902C4.24054 16.6596 3.18607 15.8934 3.48542 14.9721L4.7795 10.9894C4.91338 10.5773 4.76672 10.126 4.41623 9.87132L1.02827 7.40983C0.244561 6.84043 0.647338 5.60081 1.61606 5.60081H5.8038C6.23703 5.60081 6.62099 5.32185 6.75486 4.90983L8.04894 0.927049Z" fill="#fff" />
            </svg>
            Destacado
          </span>
        )}

        {/* Badge de descuento (oculto si no hay stock, para no competir con el badge de agotado) */}
        {precio.descuento && !sinStock && (
          <span
            className="absolute top-2 right-2 z-10 px-2 py-1 rounded-full text-white text-xs font-bold shadow-md"
            style={{ background: '#16a34a', fontSize: 11 }}
          >
            -{precio.descuento}%
          </span>
        )}

        {/* Badge sin stock */}
        {sinStock && (
          <span
            className="absolute top-2 right-2 z-10 px-2.5 py-1 rounded-full text-white text-xs font-semibold shadow-md"
            style={{ background: '#6b7280', fontSize: 11 }}
          >
            Sin stock
          </span>
        )}

        {imagen ? (
          <img
            className="rounded-lg w-full h-64 sm:h-96 object-cover"
            src={imagen}
            alt={producto.nombre}
            style={{
              ...(destacado ? { boxShadow: `0 0 0 2px ${acento}` } : {}),
              ...(sinStock ? { opacity: 0.55, filter: 'grayscale(0.4)' } : {}),
            }}
          />
        ) : (
          <div
            className="rounded-lg w-full h-64 sm:h-96 flex items-center justify-center bg-gray-100"
            style={destacado ? { boxShadow: `0 0 0 2px ${acento}` } : undefined}
          >
            <svg className="w-12 h-12 opacity-20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        )}

        {/* Talles disponibles: franja inferior translúcida que aparece al hover */}
        {talles.length > 0 && (
          <div className="absolute bottom-0 left-0 right-0 rounded-b-lg bg-white/80 backdrop-blur-sm px-2 py-2 flex flex-wrap items-center justify-center gap-1 opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
            {talles.slice(0, 6).map((t) => (
              <span
                key={t}
                className="text-[10px] leading-none px-1.5 py-1 rounded border border-black/15 text-gray-800"
              >
                {t}
              </span>
            ))}
            {talles.length > 6 && (
              <span className="text-[10px] text-gray-600">+{talles.length - 6}</span>
            )}
          </div>
        )}
      </div>

      {/* 1. Colores (centrados) */}
      {colores.length > 0 && (
        <div className="flex items-center justify-center gap-1 mt-3">
          {colores.slice(0, 5).map((col) => {
            const hex = colorAHex(col);
            return hex ? (
              <span
                key={col}
                title={col}
                className="w-3.5 h-3.5 rounded-full"
                style={{ background: hex, border: '1px solid rgba(0,0,0,0.15)' }}
              />
            ) : (
              <span key={col} className="text-[10px] px-1.5 py-0.5 rounded-full" style={{ background: 'var(--s-surface)', color: 'var(--s-muted)' }}>
                {col}
              </span>
            );
          })}
          {colores.length > 5 && (
            <span className="text-[10px]" style={{ color: 'var(--s-muted)' }}>+{colores.length - 5}</span>
          )}
        </div>
      )}

      {/* 2. Nombre (centrado) */}
      <p className="s-display text-base font-semibold mt-1.5 leading-snug text-center" style={{ color: 'var(--s-txt)' }}>
        {producto.nombre}
      </p>

      {/* 3. Precio (centrado) */}
      {precio.anterior && (
        <p className="text-xs line-through mt-1 text-center" style={{ color: 'var(--s-muted)' }}>
          {fmtPrecio(precio.anterior)}
        </p>
      )}
      <div className="flex items-center justify-center gap-2">
        <p className="text-xl" style={{ color: 'var(--s-txt)' }}>{fmtPrecio(precio.actual)}</p>
        {precio.descuento && (
          <span className="text-sm font-semibold" style={{ color: '#16a34a' }}>{precio.descuento}% OFF</span>
        )}
      </div>
    </Link>
  );
}
