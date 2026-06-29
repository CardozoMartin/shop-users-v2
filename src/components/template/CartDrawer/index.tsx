import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useCarritoStore } from '../../../store/carrito';
import type { CarritoItem } from '../../../types';

interface Props {
  acento: string;
  isDark: boolean;
  onActualizar: (itemId: number, cantidad: number) => void;
  onEliminar: (itemId: number) => void;
}

function formatPrecio(v: number | string) {
  return `$${Number(v).toLocaleString('es-AR')}`;
}

export default function CartDrawer({ acento, isDark, onActualizar, onEliminar }: Props) {
  const { carrito, isOpen, cerrarCarrito } = useCarritoStore();
  const navigate = useNavigate();
  const { slug } = useParams<{ slug: string }>();

  const irACheckout = () => {
    cerrarCarrito();
    navigate(`/${slug}/checkout`);
  };
  const bg = isDark ? '#1a1a1a' : '#ffffff';
  const txt = isDark ? '#f3f4f6' : '#111827';
  const muted = isDark ? '#9ca3af' : '#6b7280';
  const surface = isDark ? '#252525' : '#f9fafb';
  const border = isDark ? '#2d2d2d' : '#f3f4f6';

  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  // Usamos el total del backend si vino; si no, lo calculamos localmente
  const total = carrito.total !== undefined
    ? Number(carrito.total)
    : carrito.items.reduce((acc: number, item: CarritoItem) => acc + Number(item.precioUnit) * item.cantidad, 0);

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 transition-opacity duration-300"
          style={{ background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(2px)' }}
          onClick={cerrarCarrito}
        />
      )}

      {/* Drawer */}
      <div
        className="fixed top-0 right-0 h-full z-50 flex flex-col transition-transform duration-300 w-full max-w-sm"
        style={{
          background: bg,
          transform: isOpen ? 'translateX(0)' : 'translateX(100%)',
          boxShadow: '-4px 0 32px rgba(0,0,0,0.12)',
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b" style={{ borderColor: border }}>
          <div>
            <h3 className="text-base font-semibold" style={{ color: txt }}>Tu carrito</h3>
            <p className="text-xs" style={{ color: muted }}>
              {carrito.items.length} {carrito.items.length === 1 ? 'producto' : 'productos'}
            </p>
          </div>
          <button
            onClick={cerrarCarrito}
            className="w-8 h-8 rounded-full flex items-center justify-center cursor-pointer border-none transition-colors"
            style={{ background: surface, color: muted }}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
          {carrito.items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-4 py-16">
              <svg className="w-16 h-16" fill="none" stroke={border} strokeWidth={1} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
              </svg>
              <p className="text-sm" style={{ color: muted }}>Tu carrito está vacío</p>
            </div>
          ) : (
            carrito.items.map((item: CarritoItem) => {
              const imagen = item.producto.imagenPrincipalUrl || item.producto.imagenes?.[0]?.url;
              return (
                <div
                  key={item.id}
                  className="flex gap-3 p-3 rounded-xl"
                  style={{ background: surface }}
                >
                  <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100">
                    {imagen && <img src={imagen} alt={item.producto.nombre} className="w-full h-full object-cover" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate" style={{ color: txt }}>
                      {item.producto.nombre}
                    </p>
                    {item.variante && (
                      <p className="text-xs truncate mb-1" style={{ color: muted }}>
                        {item.variante.nombre}
                      </p>
                    )}
                    <p className="text-sm font-bold mb-2 mt-1" style={{ color: acento }}>
                      {formatPrecio(item.subtotal !== undefined ? Number(item.subtotal) : Number(item.precioUnit) * item.cantidad)}
                    </p>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => item.cantidad > 1 ? onActualizar(item.id, item.cantidad - 1) : onEliminar(item.id)}
                        className="w-6 h-6 rounded-full flex items-center justify-center cursor-pointer border-none text-sm font-bold"
                        style={{ background: border, color: txt }}
                      >
                        {item.cantidad === 1 ? '×' : '−'}
                      </button>
                      <span className="text-sm font-semibold w-6 text-center" style={{ color: txt }}>
                        {item.cantidad}
                      </span>
                      <button
                        onClick={() => onActualizar(item.id, item.cantidad + 1)}
                        className="w-6 h-6 rounded-full flex items-center justify-center cursor-pointer border-none text-sm font-bold"
                        style={{ background: acento, color: '#fff' }}
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        {carrito.items.length > 0 && (
          <div className="px-6 py-5 border-t" style={{ borderColor: border }}>
            <div className="flex justify-between mb-4">
              <span className="text-sm font-medium" style={{ color: muted }}>Total</span>
              <span className="text-xl font-bold" style={{ color: txt }}>{formatPrecio(total)}</span>
            </div>
            <button
              onClick={irACheckout}
              className="w-full py-3.5 rounded-2xl text-sm font-semibold text-white cursor-pointer border-none transition-all hover:brightness-110 hover:scale-[1.01]"
              style={{ background: acento }}
            >
              Finalizar compra
            </button>
          </div>
        )}
      </div>
    </>
  );
}
