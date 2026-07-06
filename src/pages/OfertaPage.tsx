import { useParams, useNavigate } from 'react-router-dom';
import type { Tienda } from '../types';
import { usePromocionPorSlug, useCarrito } from '../hooks/useTienda';
import { useCarritoStore } from '../store/carrito';
import { basePathTienda } from '../utils/dominio';
import Navbar from '../components/template/Navbar';
import Footer from '../components/template/Footer';
import CartDrawer from '../components/template/CartDrawer';
import ProductCard from '../components/template/Productos/ProductCard';

interface Props {
  tienda: Tienda;
}

function resolveColors(tienda: Tienda) {
  const acento = tienda.temaConfig?.colorAcento || '#6366f1';
  const isDark = tienda.temaConfig?.modoOscuro ?? false;
  return { acento, isDark, bg: isDark ? '#0f0f0f' : '#ffffff' };
}

export default function OfertaPage({ tienda }: Props) {
  const { slug: promoSlug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const bp = basePathTienda(tienda.slug);
  const c = resolveColors(tienda);

  const { data: promo, isLoading, isError } = usePromocionPorSlug(tienda.id, promoSlug ?? '');

  const { carrito, actualizar, eliminar } = useCarrito(tienda.id);
  const { abrirCarrito } = useCarritoStore();
  const cartCount = carrito?.items.reduce((acc, i) => acc + i.cantidad, 0) ?? 0;

  const cssVars = {
    '--s-bg': c.bg, '--s-txt': c.isDark ? '#f1f5f9' : '#1d293d',
    '--s-muted': '#748298', '--s-border': c.isDark ? '#1e293b' : '#e5e7eb',
    '--s-surface': c.isDark ? '#1a1a2e' : '#f8f8f8', '--s-acento': c.acento,
  } as React.CSSProperties;

  // Mapeamos el precioEfectivo de la promo al precioOferta que ProductCard ya sabe
  // mostrar (tachado + badge de %). Así reusamos el diseño sin tocar la card.
  const productos = (promo?.productos ?? []).map((p) => ({
    ...p,
    precioOferta: p.enOferta ? p.precioEfectivo : p.precioOferta,
  }));

  return (
    <div style={cssVars}>
      <Navbar
        tienda={tienda}
        cartCount={cartCount}
        acento={c.acento}
        onCartClick={abrirCarrito}
        onScrollTo={(id) => navigate(`${bp || '/'}#${id}`)}
      />

      <main className="max-w-screen-xl mx-auto px-6 md:px-12 py-10 min-h-[60vh]">
        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="rounded-lg w-full h-48 sm:h-72" style={{ background: 'var(--s-surface)' }} />
                <div className="h-3 rounded w-2/3 mt-2" style={{ background: 'var(--s-surface)' }} />
                <div className="h-5 rounded w-1/3 mt-1" style={{ background: 'var(--s-surface)' }} />
              </div>
            ))}
          </div>
        ) : isError || !promo ? (
          <div className="py-24 text-center">
            <p className="text-5xl mb-3">🏷️</p>
            <p className="text-lg" style={{ color: 'var(--s-muted)' }}>Esta oferta no está disponible.</p>
            <button onClick={() => navigate(bp || '/')} className="mt-4 text-sm underline cursor-pointer border-none bg-transparent" style={{ color: c.acento }}>
              Volver a la tienda
            </button>
          </div>
        ) : (
          <>
            {/* Encabezado de la oferta */}
            {promo.bannerImagenUrl && (
              <img src={promo.bannerImagenUrl} alt={promo.nombre} className="w-full rounded-2xl object-cover mb-6 max-h-64" />
            )}
            <h1 className="text-3xl font-medium mb-1" style={{ color: 'var(--s-txt)' }}>
              {promo.bannerTitulo || promo.nombre}
            </h1>
            <p className="text-sm mb-8" style={{ color: 'var(--s-muted)' }}>
              {productos.length} {productos.length === 1 ? 'producto en oferta' : 'productos en oferta'}
            </p>

            {productos.length === 0 ? (
              <div className="py-24 text-center">
                <p className="text-lg" style={{ color: 'var(--s-muted)' }}>Todavía no hay productos en esta oferta.</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
                {productos.map((p) => (
                  <ProductCard key={p.id} producto={p as any} acento={c.acento} variante={tienda.temaConfig?.cardVariante} basePath={bp} onSelect={() => {}} onAdd={() => {}} />
                ))}
              </div>
            )}
          </>
        )}
      </main>

      <Footer tienda={tienda} acento={c.acento} onScrollTo={(id) => navigate(`${bp || '/'}#${id}`)} />

      <CartDrawer
        acento={c.acento}
        isDark={c.isDark}
        onActualizar={(itemId, cant) => actualizar.mutate({ itemId, cantidad: cant })}
        onEliminar={(itemId) => eliminar.mutate(itemId)}
      />
    </div>
  );
}
