import { useNavigate, useParams, Link } from 'react-router-dom';
import type { Tienda } from '../types';
import { basePathTienda } from '../utils/dominio';
import { usePaginaLegal, useCarrito } from '../hooks/useTienda';
import { useCarritoStore } from '../store/carrito';
import Navbar from '../components/template/Navbar';
import Footer from '../components/template/Footer';
import CartDrawer from '../components/template/CartDrawer';
import type { TipoLegal } from '../api/tienda';

interface Props {
  tienda: Tienda;
  tipo: TipoLegal;
}

function resolveColors(tienda: Tienda) {
  const acento = tienda.temaConfig?.colorAcento || '#6366f1';
  const isDark = tienda.temaConfig?.modoOscuro ?? false;
  return { acento, isDark, bg: isDark ? '#0f0f0f' : '#ffffff' };
}

export default function PaginaLegalView({ tienda, tipo }: Props) {
  const navigate = useNavigate();
  const bp = basePathTienda(tienda.slug);
  const c = resolveColors(tienda);

  const { data: pagina, isLoading, isError } = usePaginaLegal(tienda.id, tipo);
  const { carrito, actualizar, eliminar } = useCarrito(tienda.id);
  const { abrirCarrito } = useCarritoStore();
  const cartCount = carrito?.items.reduce((acc, i) => acc + i.cantidad, 0) ?? 0;

  const cssVars = {
    '--s-bg': c.bg, '--s-txt': c.isDark ? '#f1f5f9' : '#1d293d',
    '--s-muted': '#748298', '--s-border': c.isDark ? '#1e293b' : '#e5e7eb',
    '--s-surface': c.isDark ? '#1a1a2e' : '#f8f8f8', '--s-acento': c.acento,
  } as React.CSSProperties;

  return (
    <div style={cssVars}>
      <Navbar
        tienda={tienda}
        cartCount={cartCount}
        acento={c.acento}
        onCartClick={abrirCarrito}
        onScrollTo={(id) => navigate(`${bp || '/'}#${id}`)}
      />

      <main className="max-w-3xl w-full mx-auto px-6 py-12 min-h-[60vh]">
        {isLoading ? (
          <div className="animate-pulse space-y-3">
            <div className="h-8 w-1/2 rounded" style={{ background: 'var(--s-surface)' }} />
            <div className="h-4 rounded" style={{ background: 'var(--s-surface)' }} />
            <div className="h-4 w-5/6 rounded" style={{ background: 'var(--s-surface)' }} />
            <div className="h-4 w-4/6 rounded" style={{ background: 'var(--s-surface)' }} />
          </div>
        ) : isError || !pagina ? (
          <div className="py-24 text-center">
            <p className="text-4xl mb-3">📄</p>
            <h1 className="text-xl font-semibold mb-2" style={{ color: 'var(--s-txt)' }}>
              Página no disponible
            </h1>
            <p className="text-sm mb-4" style={{ color: 'var(--s-muted)' }}>
              Esta tienda todavía no publicó esta información.
            </p>
            <Link to={`${bp || '/'}`} className="text-sm underline" style={{ color: c.acento }}>
              Volver a la tienda
            </Link>
          </div>
        ) : (
          <article>
            <h1 className="text-3xl font-semibold mb-2" style={{ color: 'var(--s-txt)' }}>
              {pagina.titulo}
            </h1>
            <p className="text-xs mb-8" style={{ color: 'var(--s-muted)' }}>
              Última actualización:{' '}
              {new Date(pagina.actualizadoEn).toLocaleDateString('es-AR', {
                day: 'numeric', month: 'long', year: 'numeric',
              })}
            </p>
            <div
              className="text-sm leading-relaxed whitespace-pre-line"
              style={{ color: 'var(--s-txt)' }}
            >
              {pagina.contenido}
            </div>
          </article>
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
