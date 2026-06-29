import { useNavigate, Navigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import type { Tienda, EstadoPedido } from '../types';
import { getMisPedidos } from '../api/auth';
import { useAuthStore } from '../store/auth';
import { useCarrito } from '../hooks/useTienda';
import { useCarritoStore } from '../store/carrito';
import Navbar from '../components/template/Navbar';
import Footer from '../components/template/Footer';
import CartDrawer from '../components/template/CartDrawer';

interface Props {
  tienda: Tienda;
}

function resolveColors(tienda: Tienda) {
  const acento = tienda.temaConfig?.colorAcento || '#6366f1';
  const isDark = tienda.temaConfig?.modoOscuro ?? false;
  return { acento, isDark, bg: isDark ? '#0f0f0f' : '#ffffff' };
}

function fmt(v?: number | string) {
  return `$ ${Number(v ?? 0).toLocaleString('es-AR')}`;
}

function fecha(iso: string) {
  try { return new Date(iso).toLocaleDateString('es-AR', { day: 'numeric', month: 'long', year: 'numeric' }); }
  catch { return ''; }
}

const ESTADO_INFO: Record<EstadoPedido, { label: string; color: string; bg: string }> = {
  PENDIENTE: { label: 'Pendiente', color: '#b45309', bg: '#fef3c7' },
  CONFIRMADO: { label: 'Confirmado', color: '#1d4ed8', bg: '#dbeafe' },
  EN_CAMINO: { label: 'En camino', color: '#7c3aed', bg: '#ede9fe' },
  ENTREGADO: { label: 'Entregado', color: '#15803d', bg: '#dcfce7' },
  CANCELADO: { label: 'Cancelado', color: '#b91c1c', bg: '#fee2e2' },
};

export default function MiCuentaPage({ tienda }: Props) {
  const navigate = useNavigate();
  const c = resolveColors(tienda);
  const { cliente, logout } = useAuthStore();

  const { carrito, actualizar, eliminar } = useCarrito(tienda.id);
  const { abrirCarrito } = useCarritoStore();
  const cartCount = carrito?.items.reduce((acc, i) => acc + i.cantidad, 0) ?? 0;

  const { data: pedidos, isLoading } = useQuery({
    queryKey: ['mis-pedidos', cliente?.id],
    queryFn: getMisPedidos,
    enabled: !!cliente,
  });

  // Si no hay sesión, redirigimos al login
  if (!cliente) return <Navigate to={`/${tienda.slug}/cuenta`} replace />;

  const cssVars = {
    '--s-bg': c.bg, '--s-txt': c.isDark ? '#f1f5f9' : '#1d293d',
    '--s-muted': '#748298', '--s-border': c.isDark ? '#1e293b' : '#e5e7eb',
    '--s-surface': c.isDark ? '#1a1a2e' : '#f8f8f8', '--s-acento': c.acento,
  } as React.CSSProperties;

  return (
    <div style={cssVars}>
      <Navbar tienda={tienda} cartCount={cartCount} acento={c.acento} onCartClick={abrirCarrito} onScrollTo={() => navigate(`/${tienda.slug}`)} />

      <main className="max-w-screen-lg mx-auto px-6 py-10 min-h-[60vh]">
        {/* Encabezado de cuenta */}
        <div className="flex items-center justify-between flex-wrap gap-4 mb-8">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full flex items-center justify-center text-white text-xl font-semibold" style={{ background: c.acento }}>
              {cliente.nombre.charAt(0).toUpperCase()}
            </div>
            <div>
              <h1 className="text-2xl font-medium" style={{ color: 'var(--s-txt)' }}>Hola, {cliente.nombre}</h1>
              <p className="text-sm" style={{ color: 'var(--s-muted)' }}>{cliente.email}</p>
            </div>
          </div>
          <button
            onClick={() => { logout(); navigate(`/${tienda.slug}`); }}
            className="text-sm px-5 py-2 rounded-full border cursor-pointer bg-transparent transition-colors hover:bg-black/5"
            style={{ borderColor: 'var(--s-border)', color: 'var(--s-txt)' }}
          >
            Cerrar sesión
          </button>
        </div>

        <h2 className="text-lg font-semibold mb-4" style={{ color: 'var(--s-txt)' }}>Mis pedidos</h2>

        {isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 2 }).map((_, i) => (
              <div key={i} className="rounded-xl p-5 animate-pulse" style={{ background: 'var(--s-surface)' }}>
                <div className="h-4 w-32 rounded mb-3" style={{ background: 'var(--s-border)' }} />
                <div className="h-16 rounded" style={{ background: 'var(--s-border)' }} />
              </div>
            ))}
          </div>
        ) : !pedidos || pedidos.length === 0 ? (
          <div className="py-20 text-center rounded-xl" style={{ background: 'var(--s-surface)' }}>
            <p className="text-4xl mb-3">🧾</p>
            <p style={{ color: 'var(--s-muted)' }}>Todavía no tenés pedidos.</p>
            <button onClick={() => navigate(`/${tienda.slug}/productos`)} className="mt-4 px-6 py-2.5 rounded-full text-sm font-semibold text-white border-none cursor-pointer" style={{ background: c.acento }}>
              Ver productos
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {pedidos.map((p) => {
              const est = ESTADO_INFO[p.estado] ?? ESTADO_INFO.PENDIENTE;
              const esInvitado = !p.clienteId;
              return (
                <div key={p.id} className="rounded-xl overflow-hidden" style={{ background: 'var(--s-bg)', border: '1px solid var(--s-border)' }}>
                  {/* Header del pedido */}
                  <div className="flex items-center justify-between flex-wrap gap-2 px-5 py-3" style={{ background: 'var(--s-surface)' }}>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-semibold" style={{ color: 'var(--s-txt)' }}>Pedido #{p.id}</span>
                      <span className="text-xs" style={{ color: 'var(--s-muted)' }}>{fecha(p.creadoEn)}</span>
                      {esInvitado && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full" style={{ background: 'var(--s-border)', color: 'var(--s-muted)' }} title="Compra realizada antes de tener cuenta, vinculada por email">
                          como invitado
                        </span>
                      )}
                    </div>
                    <span className="text-xs font-semibold px-3 py-1 rounded-full" style={{ background: est.bg, color: est.color }}>
                      {est.label}
                    </span>
                  </div>

                  {/* Items */}
                  <div className="px-5 py-4 space-y-3">
                    {(p.items ?? []).map((it) => (
                      <div key={it.id} className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 bg-white border" style={{ borderColor: 'var(--s-border)' }}>
                          {it.imagenUrl && <img src={it.imagenUrl} alt={it.nombreProd} className="w-full h-full object-contain p-0.5" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate" style={{ color: 'var(--s-txt)' }}>{it.nombreProd}</p>
                          {it.nombreVar && <p className="text-xs" style={{ color: 'var(--s-muted)' }}>{it.nombreVar}</p>}
                          <p className="text-xs" style={{ color: 'var(--s-muted)' }}>x{it.cantidad}</p>
                        </div>
                        <span className="text-sm" style={{ color: 'var(--s-txt)' }}>{fmt(it.subtotal)}</span>
                      </div>
                    ))}
                  </div>

                  {/* Footer del pedido */}
                  <div className="px-5 py-3 flex items-center justify-between flex-wrap gap-2" style={{ borderTop: '1px solid var(--s-border)' }}>
                    <div className="text-xs" style={{ color: 'var(--s-muted)' }}>
                      {p.metodoEntrega?.nombre && <span>{p.metodoEntrega.nombre}</span>}
                      {p.metodoPago?.nombre && <span> · {p.metodoPago.nombre}</span>}
                      {p.nroSeguimiento && (
                        <span> · Seguimiento: {p.urlSeguimiento
                          ? <a href={p.urlSeguimiento} target="_blank" rel="noopener noreferrer" className="underline" style={{ color: c.acento }}>{p.nroSeguimiento}</a>
                          : p.nroSeguimiento}</span>
                      )}
                    </div>
                    <span className="text-sm font-semibold" style={{ color: 'var(--s-txt)' }}>Total: {fmt(p.total)}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      <Footer tienda={tienda} acento={c.acento} onScrollTo={() => navigate(`/${tienda.slug}`)} />
      <CartDrawer acento={c.acento} isDark={c.isDark} onActualizar={(id, cant) => actualizar.mutate({ itemId: id, cantidad: cant })} onEliminar={(id) => eliminar.mutate(id)} />
    </div>
  );
}
