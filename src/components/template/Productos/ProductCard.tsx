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
}

export default function ProductCard({ producto, acento, destacado }: Props) {
  const { slug } = useParams<{ slug: string }>();
  const bp = basePathTienda(slug ?? '');
  const imagen = producto.imagenPrincipalUrl || producto.imagenes?.[0]?.url;
  const precio = calcularPrecio(producto);

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

        {/* Badge de descuento */}
        {precio.descuento && (
          <span
            className="absolute top-2 right-2 z-10 px-2 py-1 rounded-full text-white text-xs font-bold shadow-md"
            style={{ background: '#16a34a', fontSize: 11 }}
          >
            -{precio.descuento}%
          </span>
        )}

        {imagen ? (
          <img
            className="rounded-lg w-full group-hover:shadow-xl hover:-translate-y-0.5 duration-300 transition-all h-48 sm:h-72 object-contain bg-white p-2"
            src={imagen}
            alt={producto.nombre}
            style={destacado ? { boxShadow: `0 0 0 2px ${acento}` } : undefined}
          />
        ) : (
          <div
            className="rounded-lg w-full h-48 sm:h-72 flex items-center justify-center bg-gray-100 group-hover:shadow-xl hover:-translate-y-0.5 duration-300 transition-all"
            style={destacado ? { boxShadow: `0 0 0 2px ${acento}` } : undefined}
          >
            <svg className="w-12 h-12 opacity-20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        )}
      </div>

      <p className="text-sm mt-2" style={{ color: 'var(--s-txt)' }}>{producto.nombre}</p>

      {/* Precio viejo tachado */}
      {precio.anterior && (
        <p className="text-xs line-through mt-1" style={{ color: 'var(--s-muted)' }}>
          {fmtPrecio(precio.anterior)}
        </p>
      )}
      {/* Precio actual + % descuento */}
      <div className="flex items-center gap-2">
        <p className="text-xl" style={{ color: 'var(--s-txt)' }}>{fmtPrecio(precio.actual)}</p>
        {precio.descuento && (
          <span className="text-sm font-semibold" style={{ color: '#16a34a' }}>{precio.descuento}% OFF</span>
        )}
      </div>
    </Link>
  );
}
