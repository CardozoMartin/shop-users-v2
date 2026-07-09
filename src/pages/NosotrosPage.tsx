import { basePathTienda } from '../utils/dominio';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Tienda } from '../types';
import { useResenasTienda, useResenasEstadisticas, useCarrito, useCrearResenaTienda } from '../hooks/useTienda';
import { useCarritoStore } from '../store/carrito';
import { useAuthStore } from '../store/auth';
import Navbar from '../components/template/Navbar';
import Footer from '../components/template/Footer';
import CartDrawer from '../components/template/CartDrawer';
import AboutUs from '../components/template/AboutUs';
import Estrellas from '../components/template/Estrellas';
import FormResena from '../components/template/FormResena';

interface Props {
  tienda: Tienda;
}

function resolveColors(tienda: Tienda) {
  const acento = tienda.temaConfig?.colorAcento || '#6366f1';
  const isDark = tienda.temaConfig?.modoOscuro ?? false;
  return { acento, isDark, bg: isDark ? '#0f0f0f' : '#ffffff' };
}

function fechaCorta(iso: string) {
  try {
    return new Date(iso).toLocaleDateString('es-AR', { day: 'numeric', month: 'long', year: 'numeric' });
  } catch { return ''; }
}

export default function NosotrosPage({ tienda }: Props) {
  const navigate = useNavigate();
  const bp = basePathTienda(tienda.slug);
  const c = resolveColors(tienda);
  const [pagina, setPagina] = useState(1);

  const { data: resenasData, isLoading: cargandoResenas } = useResenasTienda(tienda.id, pagina, 8);
  const { data: stats } = useResenasEstadisticas(tienda.id);

  const { carrito, actualizar, eliminar } = useCarrito(tienda.id);
  const { abrirCarrito } = useCarritoStore();
  const cartCount = carrito?.items.reduce((acc, i) => acc + i.cantidad, 0) ?? 0;

  const resenas = resenasData?.datos ?? [];
  const totalPaginas = resenasData?.totalPaginas ?? 1;

  const cliente = useAuthStore((s) => s.cliente);
  const crearResena = useCrearResenaTienda(tienda.id);

  const cssVars = {
    '--s-bg': c.bg, '--s-txt': c.isDark ? '#f1f5f9' : '#1d293d',
    '--s-muted': '#748298', '--s-border': c.isDark ? '#1e293b' : '#e5e7eb',
    '--s-surface': c.isDark ? '#1a1a2e' : '#f8f8f8', '--s-acento': c.acento,
  } as React.CSSProperties;

  const maxDist = Math.max(1, ...(stats?.distribucion ?? []).map((d) => d.cantidad));

  return (
    <div style={cssVars}>
      <Navbar
        tienda={tienda}
        cartCount={cartCount}
        acento={c.acento}
        onCartClick={abrirCarrito}
        onScrollTo={(id) => navigate(`${bp || "/"}#${id}`)}
      />

      <main className="min-h-[60vh]">
        {/* Reutilizamos el bloque Sobre nosotros */}
        <AboutUs tienda={tienda} acento={c.acento} />

        {/* ── Reseñas ── */}
        <section className="py-16 px-6 md:px-16 lg:px-24" style={{ background: 'var(--s-surface)' }}>
          <div className="max-w-5xl mx-auto">
            <h2 className="text-3xl font-semibold text-center" style={{ color: 'var(--s-txt)' }}>
              Lo que dicen nuestros clientes
            </h2>
            <p className="text-sm text-center mt-2 mb-10" style={{ color: 'var(--s-muted)' }}>
              Opiniones reales sobre {tienda.nombre}.
            </p>

            {/* Resumen: promedio + distribución */}
            {stats && stats.total > 0 && (
              <div className="flex flex-col sm:flex-row items-center gap-10 mb-12 justify-center">
                <div className="text-center flex-shrink-0">
                  <p className="text-5xl font-semibold" style={{ color: 'var(--s-txt)' }}>
                    {stats.promedio.toFixed(1)}
                  </p>
                  <div className="flex justify-center mt-2">
                    <Estrellas valor={Math.round(stats.promedio)} acento={c.acento} size={18} />
                  </div>
                  <p className="text-xs mt-2" style={{ color: 'var(--s-muted)' }}>
                    {stats.total} {stats.total === 1 ? 'opinión' : 'opiniones'}
                  </p>
                </div>

                {/* Barras de distribución */}
                <div className="w-full max-w-xs space-y-1.5">
                  {[5, 4, 3, 2, 1].map((estrella) => {
                    const item = stats.distribucion.find((d) => d.calificacion === estrella);
                    const cant = item?.cantidad ?? 0;
                    return (
                      <div key={estrella} className="flex items-center gap-2 text-xs" style={{ color: 'var(--s-muted)' }}>
                        <span className="w-3 text-right">{estrella}</span>
                        <svg width="11" height="11" viewBox="0 0 18 17" fill="none">
                          <path d="M8.04894 0.927049C8.3483 0.00573802 9.6517 0.00574017 9.95106 0.927051L11.2451 4.90983C11.379 5.32185 11.763 5.60081 12.1962 5.60081H16.3839C17.3527 5.60081 17.7554 6.84043 16.9717 7.40983L13.5838 9.87132C13.2333 10.126 13.0866 10.5773 13.2205 10.9894L14.5146 14.9721C14.8139 15.8934 13.7595 16.6596 12.9757 16.0902L9.58778 13.6287C9.2373 13.374 8.7627 13.374 8.41221 13.6287L5.02426 16.0902C4.24054 16.6596 3.18607 15.8934 3.48542 14.9721L4.7795 10.9894C4.91338 10.5773 4.76672 10.126 4.41623 9.87132L1.02827 7.40983C0.244561 6.84043 0.647338 5.60081 1.61606 5.60081H5.8038C6.23703 5.60081 6.62099 5.32185 6.75486 4.90983L8.04894 0.927049Z" fill={c.acento} />
                        </svg>
                        <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background: 'var(--s-border)' }}>
                          <div className="h-full rounded-full transition-all" style={{ width: `${(cant / maxDist) * 100}%`, background: c.acento }} />
                        </div>
                        <span className="w-6 text-left">{cant}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Formulario para opinar sobre la tienda */}
            <div className="mb-8 max-w-xl">
              <FormResena
                acento={c.acento}
                logueado={!!cliente}
                loginHref={`${bp}/cuenta`}
                isSaving={crearResena.isPending}
                onSubmit={async (data) => {
                  await crearResena.mutateAsync({
                    calificacion: data.calificacion,
                    comentario: data.comentario,
                  });
                }}
              />
            </div>

            {/* Lista de reseñas */}
            {cargandoResenas ? (
              <div className="grid sm:grid-cols-2 gap-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="rounded-xl p-5 animate-pulse" style={{ background: 'var(--s-bg)' }}>
                    <div className="h-3 w-24 rounded mb-3" style={{ background: 'var(--s-surface)' }} />
                    <div className="h-3 w-full rounded mb-1.5" style={{ background: 'var(--s-surface)' }} />
                    <div className="h-3 w-2/3 rounded" style={{ background: 'var(--s-surface)' }} />
                  </div>
                ))}
              </div>
            ) : resenas.length === 0 ? (
              <div className="py-16 text-center">
                <p className="text-4xl mb-3">💬</p>
                <p style={{ color: 'var(--s-muted)' }}>Todavía no hay reseñas. ¡Sé el primero en opinar!</p>
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 gap-4">
                {resenas.map((r) => (
                  <div key={r.id} className="rounded-xl p-5" style={{ background: 'var(--s-bg)', border: '1px solid var(--s-border)' }}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold text-white flex-shrink-0"
                          style={{ background: c.acento }}
                        >
                          {(r.autorNombre || 'A').charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-sm font-medium" style={{ color: 'var(--s-txt)' }}>
                            {r.autorNombre || 'Cliente'}
                          </p>
                          <p className="text-xs" style={{ color: 'var(--s-muted)' }}>{fechaCorta(r.creadoEn)}</p>
                        </div>
                      </div>
                      <Estrellas valor={r.calificacion} acento={c.acento} size={14} />
                    </div>
                    {r.comentario && (
                      <p className="text-sm leading-relaxed mt-2" style={{ color: 'var(--s-muted)' }}>
                        {r.comentario}
                      </p>
                    )}
                    {/* Respuesta del dueño */}
                    {r.respuesta && (
                      <div className="mt-3 pl-3 ml-1" style={{ borderLeft: `2px solid ${c.acento}` }}>
                        <p className="text-xs font-semibold mb-0.5" style={{ color: c.acento }}>Respuesta de {tienda.nombre}</p>
                        <p className="text-sm" style={{ color: 'var(--s-muted)' }}>{r.respuesta}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Paginación reseñas */}
            {totalPaginas > 1 && (
              <div className="mt-10 flex items-center justify-center gap-3">
                <button
                  onClick={() => setPagina((p) => Math.max(1, p - 1))}
                  disabled={pagina === 1}
                  className="px-5 py-2 rounded-full text-sm font-medium cursor-pointer border transition-all disabled:opacity-30"
                  style={{ borderColor: 'var(--s-border)', color: 'var(--s-txt)', background: 'transparent' }}
                >
                  ← Anterior
                </button>
                <span className="text-sm" style={{ color: 'var(--s-muted)' }}>{pagina} / {totalPaginas}</span>
                <button
                  onClick={() => setPagina((p) => Math.min(totalPaginas, p + 1))}
                  disabled={pagina >= totalPaginas}
                  className="px-5 py-2 rounded-full text-sm font-medium cursor-pointer border transition-all disabled:opacity-30"
                  style={{ borderColor: 'var(--s-border)', color: 'var(--s-txt)', background: 'transparent' }}
                >
                  Siguiente →
                </button>
              </div>
            )}
          </div>
        </section>
      </main>

      <Footer tienda={tienda} acento={c.acento} onScrollTo={(id) => navigate(`${bp || "/"}#${id}`)} />

      <CartDrawer
        acento={c.acento}
        isDark={c.isDark}
        onActualizar={(itemId, cant) => actualizar.mutate({ itemId, cantidad: cant })}
        onEliminar={(itemId) => eliminar.mutate(itemId)}
      />
    </div>
  );
}
