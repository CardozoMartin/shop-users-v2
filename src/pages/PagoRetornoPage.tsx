import { useParams, useNavigate, Link } from 'react-router-dom';
import type { Tienda } from '../types';
import { useCarrito } from '../hooks/useTienda';
import { useCarritoStore } from '../store/carrito';
import Navbar from '../components/template/Navbar';
import Footer from '../components/template/Footer';

interface Props {
  tienda: Tienda;
}

function resolveColors(tienda: Tienda) {
  const acento = tienda.temaConfig?.colorAcento || '#6366f1';
  const isDark = tienda.temaConfig?.modoOscuro ?? false;
  return { acento, isDark, bg: isDark ? '#0f0f0f' : '#ffffff' };
}

const RESULTADOS: Record<string, { emoji: string; titulo: string; texto: (n: string) => string; color: string }> = {
  gracias: {
    emoji: '✅',
    titulo: '¡Gracias por tu compra!',
    texto: (n) => `Tu pedido #${n} fue recibido y el pago se está procesando. Te enviamos un email con los detalles.`,
    color: '#16a34a',
  },
  pendiente: {
    emoji: '⏳',
    titulo: 'Pago pendiente',
    texto: (n) => `Tu pedido #${n} quedó registrado. El pago está pendiente de acreditación; te avisaremos por email cuando se confirme.`,
    color: '#d97706',
  },
  error: {
    emoji: '❌',
    titulo: 'No se pudo completar el pago',
    texto: (n) => `Hubo un problema con el pago del pedido #${n}. Podés intentar de nuevo o elegir otro método de pago.`,
    color: '#dc2626',
  },
};

export default function PagoRetornoPage({ tienda }: Props) {
  const { pedidoId, resultado } = useParams<{ pedidoId: string; resultado: string }>();
  const navigate = useNavigate();
  const c = resolveColors(tienda);

  const { carrito } = useCarrito(tienda.id);
  const { abrirCarrito } = useCarritoStore();
  const cartCount = carrito?.items.reduce((acc, i) => acc + i.cantidad, 0) ?? 0;

  const info = RESULTADOS[resultado ?? 'gracias'] ?? RESULTADOS.gracias;
  const esError = resultado === 'error';

  const cssVars = {
    '--s-bg': c.bg, '--s-txt': c.isDark ? '#f1f5f9' : '#1d293d',
    '--s-muted': '#748298', '--s-border': c.isDark ? '#1e293b' : '#e5e7eb',
    '--s-surface': c.isDark ? '#1a1a2e' : '#f8f8f8', '--s-acento': c.acento,
  } as React.CSSProperties;

  return (
    <div style={cssVars}>
      <Navbar tienda={tienda} cartCount={cartCount} acento={c.acento} onCartClick={abrirCarrito} onScrollTo={() => navigate(`/${tienda.slug}`)} />

      <main className="max-w-md mx-auto px-6 py-24 text-center min-h-[60vh]">
        <div className="w-20 h-20 mx-auto rounded-full flex items-center justify-center mb-6 text-4xl" style={{ background: `${info.color}15` }}>
          {info.emoji}
        </div>
        <h1 className="text-2xl font-semibold mb-3" style={{ color: 'var(--s-txt)' }}>{info.titulo}</h1>
        <p className="text-sm mb-8 leading-relaxed" style={{ color: 'var(--s-muted)' }}>
          {info.texto(pedidoId ?? '')}
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          {esError && (
            <button
              onClick={() => navigate(`/${tienda.slug}/checkout`)}
              className="px-8 py-3 rounded-full text-sm font-semibold text-white border-none cursor-pointer"
              style={{ background: c.acento }}
            >
              Intentar de nuevo
            </button>
          )}
          <Link
            to={`/${tienda.slug}`}
            className="px-8 py-3 rounded-full text-sm font-semibold border transition-colors"
            style={{ borderColor: 'var(--s-border)', color: 'var(--s-txt)' }}
          >
            Volver a la tienda
          </Link>
        </div>
      </main>

      <Footer tienda={tienda} acento={c.acento} onScrollTo={() => navigate(`/${tienda.slug}`)} />
    </div>
  );
}
