import { useState } from 'react';
import type { Tienda, Producto } from '../../types';
import { useCarrito } from '../../hooks/useTienda';
import { useCarritoStore } from '../../store/carrito';
import Navbar from './Navbar';
import Hero from './Hero';
import Destacados from './Destacados';
import BannerPromo from './BannerPromo';
import PopupModal from './PopupModal';
import Productos from './Productos';
import Footer from './Footer';
import CartDrawer from './CartDrawer';

interface Props {
  tienda: Tienda;
}

function resolveColors(tienda: Tienda) {
  const acento = tienda.temaConfig?.colorAcento || '#6366f1';
  const isDark = tienda.temaConfig?.modoOscuro ?? false;
  return {
    acento,
    isDark,
    bg: isDark ? '#0f0f0f' : '#ffffff',
    surface: isDark ? '#1a1a2e' : '#f8f8f8',
    txt: isDark ? '#f1f5f9' : '#1d293d',
    muted: isDark ? '#748298' : '#748298',
    border: isDark ? '#1e293b' : '#e5e7eb',
  };
}

function scrollToSection(id: string) {
  const el = document.getElementById(id);
  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

export default function Template({ tienda }: Props) {
  const c = resolveColors(tienda);
  const [productoSeleccionado, setProductoSeleccionado] = useState<Producto | null>(null);
  const { carrito, agregar, actualizar, eliminar } = useCarrito(tienda.id);
  const { abrirCarrito } = useCarritoStore();

  const cartCount = carrito?.items.reduce((acc, i) => acc + i.cantidad, 0) ?? 0;

  const cssVars = {
    '--s-bg': c.bg,
    '--s-surface': c.surface,
    '--s-txt': c.txt,
    '--s-muted': c.muted,
    '--s-border': c.border,
    '--s-acento': c.acento,
  } as React.CSSProperties;

  return (
    <div style={cssVars}>
      <Navbar
        tienda={tienda}
        cartCount={cartCount}
        acento={c.acento}
        onCartClick={abrirCarrito}
        onScrollTo={scrollToSection}
      />

      <main>
        <Hero
          tienda={tienda}
          acento={c.acento}
          onScrollTo={scrollToSection}
        />

        <Destacados tiendaId={tienda.id} acento={c.acento} />

        <BannerPromo tienda={tienda} acento={c.acento} />

        <Productos
          tiendaId={tienda.id}
          acento={c.acento}
          onSelect={setProductoSeleccionado}
          onAdd={(p) => agregar.mutate({ productoId: p.id, cantidad: 1 })}
        />

        <Footer tienda={tienda} acento={c.acento} onScrollTo={scrollToSection} />
      </main>

      <CartDrawer
        acento={c.acento}
        isDark={c.isDark}
        onActualizar={(itemId, cantidad) => actualizar.mutate({ itemId, cantidad })}
        onEliminar={(itemId) => eliminar.mutate(itemId)}
      />

      <PopupModal tiendaId={tienda.id} acento={c.acento} />

      {tienda.whatsapp && (
        <a
          href={`https://wa.me/${tienda.whatsapp}`}
          target="_blank"
          rel="noopener noreferrer"
          className="fixed bottom-6 right-6 z-40 flex items-center justify-center rounded-full shadow-lg transition-transform hover:scale-110"
          style={{ background: '#25d366', width: 52, height: 52 }}
        >
          <svg className="w-6 h-6" fill="white" viewBox="0 0 24 24">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
          </svg>
        </a>
      )}

      {productoSeleccionado && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-6"
          style={{ background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(6px)' }}
          onClick={() => setProductoSeleccionado(null)}
        >
          <div
            className="w-full sm:max-w-md rounded-t-3xl sm:rounded-2xl overflow-hidden"
            style={{ background: c.bg }}
            onClick={(e) => e.stopPropagation()}
          >
            {(productoSeleccionado.imagenPrincipalUrl || productoSeleccionado.imagenes?.[0]?.url) && (
              <img
                src={productoSeleccionado.imagenPrincipalUrl || productoSeleccionado.imagenes?.[0]?.url}
                alt={productoSeleccionado.nombre}
                className="w-full object-cover"
                style={{ aspectRatio: '16/9', maxHeight: 260 }}
              />
            )}
            <div className="p-6">
              {productoSeleccionado.categoria && (
                <p className="text-xs font-semibold uppercase tracking-widest mb-1" style={{ color: c.acento }}>
                  {productoSeleccionado.categoria.nombre}
                </p>
              )}
              <h3 className="text-xl font-semibold mb-2" style={{ color: c.txt }}>
                {productoSeleccionado.nombre}
              </h3>
              {productoSeleccionado.descripcion && (
                <p className="text-sm mb-4 leading-relaxed" style={{ color: c.muted }}>
                  {productoSeleccionado.descripcion}
                </p>
              )}
              <p className="text-2xl font-bold mb-6" style={{ color: c.txt }}>
                ${Number(productoSeleccionado.precioOferta || productoSeleccionado.precio || 0).toLocaleString('es-AR')}
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    agregar.mutate({ productoId: productoSeleccionado.id, cantidad: 1 });
                    setProductoSeleccionado(null);
                  }}
                  className="flex-1 py-3 rounded-full text-sm font-semibold text-white border-none cursor-pointer transition-opacity hover:opacity-90"
                  style={{ background: c.acento }}
                >
                  Agregar al carrito
                </button>
                <button
                  onClick={() => setProductoSeleccionado(null)}
                  className="px-5 py-3 rounded-full text-sm font-semibold border-none cursor-pointer"
                  style={{ background: c.surface, color: c.muted }}
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
