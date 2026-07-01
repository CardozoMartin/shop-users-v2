import { basePathTienda } from '../utils/dominio';
import { useState, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import type { Tienda, ProductoVariante } from '../types';
import { useProducto, useCarrito, useResenasProducto, useProductosRelacionados } from '../hooks/useTienda';
import { useCarritoStore } from '../store/carrito';
import Navbar from '../components/template/Navbar';
import Footer from '../components/template/Footer';
import CartDrawer from '../components/template/CartDrawer';
import ProductCard from '../components/template/Productos/ProductCard';
import Estrellas from '../components/template/Estrellas';
import { calcularPrecio } from '../utils/precio';

interface Props {
  tienda: Tienda;
}

function resolveColors(tienda: Tienda) {
  const acento = tienda.temaConfig?.colorAcento || '#6366f1';
  const isDark = tienda.temaConfig?.modoOscuro ?? false;
  return { acento, isDark, bg: isDark ? '#0f0f0f' : '#ffffff' };
}

function fmt(v?: number | string) {
  if (v === undefined || v === null || v === '') return '';
  return `$ ${Number(v).toLocaleString('es-AR')}`;
}

function fechaCorta(iso: string) {
  try {
    return new Date(iso).toLocaleDateString('es-AR', { day: 'numeric', month: 'long', year: 'numeric' });
  } catch { return ''; }
}

export default function ProductoDetalle({ tienda }: Props) {
  const { productoId, slug } = useParams<{ productoId: string; slug: string }>();
  const navigate = useNavigate();
  const c = resolveColors(tienda);
  const bp = basePathTienda(slug ?? tienda.slug ?? '');

  const { data: producto, isLoading, isError } = useProducto(tienda.id, Number(productoId));
  const { carrito, agregar, actualizar, eliminar } = useCarrito(tienda.id);
  const { abrirCarrito } = useCarritoStore();

  const { data: relacionados } = useProductosRelacionados(tienda.id, Number(productoId), producto?.categoria?.id);
  const { data: resenasData } = useResenasProducto(tienda.id, Number(productoId));
  const resenas = resenasData?.datos ?? [];

  const cartCount = carrito?.items.reduce((acc, i) => acc + i.cantidad, 0) ?? 0;

  // Galería: imagen principal + imágenes adicionales
  const galeria = useMemo(() => {
    if (!producto) return [];
    const urls: string[] = [];
    if (producto.imagenPrincipalUrl) urls.push(producto.imagenPrincipalUrl);
    (producto.imagenes ?? []).forEach((img) => { if (img.url && !urls.includes(img.url)) urls.push(img.url); });
    return urls;
  }, [producto]);

  const [thumbnail, setThumbnail] = useState<string | null>(null);
  const [variante, setVariante] = useState<ProductoVariante | null>(null);
  const [cantidad, setCantidad] = useState(1);
  const [descExpandida, setDescExpandida] = useState(false);

  const cssVars = {
    '--s-bg': c.bg, '--s-txt': c.isDark ? '#f1f5f9' : '#1d293d',
    '--s-muted': '#748298', '--s-border': c.isDark ? '#1e293b' : '#e5e7eb',
    '--s-surface': c.isDark ? '#1a1a2e' : '#f8f8f8', '--s-acento': c.acento,
  } as React.CSSProperties;

  // Imagen mostrada: thumbnail elegido > imagen de variante > primera de galería
  const imagenActual = thumbnail || variante?.imagenUrl || galeria[0];

  const extra = Number(variante?.precioExtra ?? 0);
  const infoPrecio = producto ? calcularPrecio(producto) : { actual: 0, anterior: null, descuento: null };
  const precioFinal = infoPrecio.actual + extra;
  const precioAnteriorFinal = infoPrecio.anterior != null ? infoPrecio.anterior + extra : null;

  // Stock efectivo (de variante si hay, si no del producto)
  const stock = variante ? variante.stock ?? 0 : producto?.stock ?? 0;
  const sinStock = stock <= 0 && (producto?.variantes?.length ? !!variante : true);

  const tieneVariantes = !!producto?.variantes?.length;

  const agregarAlCarrito = () => {
    if (!producto) return;
    // Si el producto tiene variantes, exigimos que se elija una
    if (tieneVariantes && !variante) return;
    agregar.mutate({ productoId: producto.id, cantidad, varianteId: variante?.id ?? null });
  };

  return (
    <div style={cssVars}>
      <Navbar
        tienda={tienda}
        cartCount={cartCount}
        acento={c.acento}
        onCartClick={abrirCarrito}
        onScrollTo={(id) => navigate(`${bp || "/"}#${id}`)}
      />

      <main className="max-w-6xl w-full mx-auto px-6 py-10 min-h-[60vh]">
        {isLoading ? (
          <div className="flex flex-col md:flex-row gap-16 animate-pulse">
            <div className="flex gap-3">
              <div className="flex flex-col gap-3">
                {Array.from({ length: 3 }).map((_, i) => <div key={i} className="w-20 h-20 rounded" style={{ background: 'var(--s-surface)' }} />)}
              </div>
              <div className="w-80 h-96 rounded" style={{ background: 'var(--s-surface)' }} />
            </div>
            <div className="flex-1 space-y-4">
              <div className="h-8 rounded w-2/3" style={{ background: 'var(--s-surface)' }} />
              <div className="h-6 rounded w-1/3" style={{ background: 'var(--s-surface)' }} />
              <div className="h-24 rounded" style={{ background: 'var(--s-surface)' }} />
            </div>
          </div>
        ) : isError || !producto ? (
          <div className="py-28 text-center">
            <p className="text-5xl mb-4">📦</p>
            <h1 className="text-xl font-semibold mb-2" style={{ color: 'var(--s-txt)' }}>Producto no encontrado</h1>
            <Link to={`${bp || "/"}`} className="text-sm underline" style={{ color: c.acento }}>Volver a la tienda</Link>
          </div>
        ) : (
          <>
            {/* Breadcrumb */}
            <p className="text-sm mb-6" style={{ color: 'var(--s-muted)' }}>
              <Link to={`${bp || "/"}`} className="hover:underline">Inicio</Link>
              {' / '}
              <Link to={`${bp || "/"}#productos`} className="hover:underline">Productos</Link>
              {producto.categoria && <>{' / '}<span>{producto.categoria.nombre}</span></>}
              {' / '}
              <span style={{ color: c.acento }}>{producto.nombre}</span>
            </p>

            <div className="flex flex-col md:flex-row gap-10 lg:gap-16">
              {/* Galería */}
              <div className="flex gap-3 md:sticky md:top-6 md:self-start">
                {galeria.length > 1 && (
                  <div className="flex flex-col gap-3">
                    {galeria.map((img, i) => (
                      <button
                        key={i}
                        onClick={() => { setThumbnail(img); setVariante(null); }}
                        className="border rounded overflow-hidden cursor-pointer w-20 h-20 flex-shrink-0 bg-white"
                        style={{ borderColor: imagenActual === img ? c.acento : 'var(--s-border)' }}
                      >
                        <img src={img} alt={`Vista ${i + 1}`} className="w-full h-full object-contain p-1" />
                      </button>
                    ))}
                  </div>
                )}

                <div className="border rounded-lg overflow-hidden w-full max-w-md bg-white" style={{ borderColor: 'var(--s-border)', aspectRatio: '1/1' }}>
                  {imagenActual ? (
                    <img src={imagenActual} alt={producto.nombre} className="w-full h-full object-contain p-3" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center" style={{ background: 'var(--s-surface)' }}>
                      <svg className="w-16 h-16 opacity-20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                    </div>
                  )}
                </div>
              </div>

              {/* Info */}
              <div className="flex-1 w-full md:w-1/2">
                {producto.categoria && (
                  <p className="text-xs font-semibold uppercase tracking-widest mb-1" style={{ color: c.acento }}>
                    {producto.categoria.nombre}
                  </p>
                )}
                <h1 className="text-3xl font-medium" style={{ color: 'var(--s-txt)' }}>{producto.nombre}</h1>

                {/* Precio */}
                <div className="mt-5">
                  {precioAnteriorFinal && (
                    <p className="line-through text-sm" style={{ color: 'var(--s-muted)' }}>{fmt(precioAnteriorFinal)}</p>
                  )}
                  <div className="flex items-center gap-3">
                    <p className="text-3xl font-semibold" style={{ color: 'var(--s-txt)' }}>{fmt(precioFinal)}</p>
                    {infoPrecio.descuento && (
                      <span className="text-base font-bold px-2 py-0.5 rounded" style={{ color: '#fff', background: '#16a34a' }}>
                        {infoPrecio.descuento}% OFF
                      </span>
                    )}
                  </div>
                  {infoPrecio.descuento && (
                    <p className="text-xs mt-1" style={{ color: '#16a34a' }}>
                      ¡Bajó de precio! Ahorrás {fmt((precioAnteriorFinal ?? 0) - precioFinal)}
                    </p>
                  )}
                  {variante?.precioExtra ? (
                    <span className="text-xs" style={{ color: 'var(--s-muted)' }}>Incluye adicional de variante</span>
                  ) : null}
                </div>

                {/* Variantes */}
                {producto.variantes && producto.variantes.length > 0 && (
                  <div className="mt-6">
                    <p className="text-sm font-medium mb-2" style={{ color: 'var(--s-txt)' }}>Variantes</p>
                    <div className="flex flex-wrap gap-2">
                      {producto.variantes.map((v) => {
                        const activa = variante?.id === v.id;
                        const agotada = (v.stock ?? 0) <= 0 || v.disponible === false;
                        return (
                          <button
                            key={v.id}
                            disabled={agotada}
                            onClick={() => { setVariante(activa ? null : v); if (v.imagenUrl) setThumbnail(null); }}
                            className="px-4 py-2 rounded-full text-sm border transition-all disabled:opacity-40 disabled:line-through cursor-pointer"
                            style={{
                              borderColor: activa ? c.acento : 'var(--s-border)',
                              background: activa ? c.acento : 'transparent',
                              color: activa ? '#fff' : 'var(--s-txt)',
                            }}
                          >
                            {v.nombre}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Stock */}
                <p className="text-sm mt-4" style={{ color: sinStock ? '#dc2626' : '#16a34a' }}>
                  {sinStock ? 'Sin stock' : `${stock} disponibles`}
                </p>

                {/* Descripción */}
                {producto.descripcion && (
                  <div className="mt-6">
                    <p className="text-base font-medium mb-1" style={{ color: 'var(--s-txt)' }}>Descripción</p>
                    <p className="text-sm leading-relaxed whitespace-pre-line" style={{ color: 'var(--s-muted)' }}>
                      {producto.descripcion.length > 200 && !descExpandida
                        ? `${producto.descripcion.slice(0, 200).trimEnd()}…`
                        : producto.descripcion}
                    </p>
                    {producto.descripcion.length > 200 && (
                      <button
                        onClick={() => setDescExpandida((v) => !v)}
                        className="text-sm font-medium mt-1 border-none bg-transparent cursor-pointer p-0 hover:underline"
                        style={{ color: c.acento }}
                      >
                        {descExpandida ? 'Ver menos' : 'Ver descripción'}
                      </button>
                    )}
                  </div>
                )}

                {/* Tags */}
                {producto.tags && producto.tags.length > 0 && (
                  <div className="mt-5 flex flex-wrap gap-2">
                    {producto.tags.map((t) => (
                      <span key={t.id} className="text-xs px-3 py-1 rounded-full" style={{ background: 'var(--s-surface)', color: 'var(--s-muted)' }}>
                        #{t.nombre}
                      </span>
                    ))}
                  </div>
                )}

                {/* Cantidad + agregar */}
                <div className="flex items-center gap-4 mt-8">
                  <div className="flex items-center border rounded-full" style={{ borderColor: 'var(--s-border)' }}>
                    <button onClick={() => setCantidad((q) => Math.max(1, q - 1))} className="px-4 py-2 text-lg cursor-pointer border-none bg-transparent" style={{ color: 'var(--s-txt)' }}>−</button>
                    <span className="px-2 text-sm" style={{ color: 'var(--s-txt)' }}>{cantidad}</span>
                    <button onClick={() => setCantidad((q) => q + 1)} className="px-4 py-2 text-lg cursor-pointer border-none bg-transparent" style={{ color: 'var(--s-txt)' }}>+</button>
                  </div>
                  <button
                    onClick={agregarAlCarrito}
                    disabled={sinStock || agregar.isPending || (tieneVariantes && !variante)}
                    className="flex-1 py-3.5 rounded-full font-medium text-white cursor-pointer border-none transition-opacity hover:opacity-90 disabled:opacity-40"
                    style={{ background: c.acento }}
                  >
                    {sinStock
                      ? 'Sin stock'
                      : tieneVariantes && !variante
                        ? 'Elegí una variante'
                        : agregar.isPending
                          ? 'Agregando...'
                          : 'Agregar al carrito'}
                  </button>
                </div>

                {/* Variante requerida */}
                {producto.variantes && producto.variantes.length > 0 && !variante && (
                  <p className="text-xs mt-2" style={{ color: 'var(--s-muted)' }}>Tip: seleccioná una variante antes de agregar.</p>
                )}

                {/* Métodos de pago y envío */}
                {(tienda.metodosPago?.length || tienda.metodosEntrega?.length) ? (
                  <div className="mt-8 rounded-xl p-5 space-y-5" style={{ background: 'var(--s-surface)', border: '1px solid var(--s-border)' }}>
                    {/* Envíos */}
                    {tienda.metodosEntrega && tienda.metodosEntrega.length > 0 && (
                      <div>
                        <div className="flex items-center gap-2 mb-3">
                          <svg className="w-5 h-5" fill="none" stroke={c.acento} strokeWidth={1.6} viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" />
                          </svg>
                          <h4 className="text-sm font-semibold" style={{ color: 'var(--s-txt)' }}>Formas de envío</h4>
                        </div>
                        <ul className="space-y-2">
                          {tienda.metodosEntrega.map((me, i) => {
                            const gratis = me.costo === null || me.costo === undefined || Number(me.costo) === 0;
                            return (
                              <li key={i} className="flex items-start justify-between gap-3 text-sm">
                                <div>
                                  <span style={{ color: 'var(--s-txt)' }}>{me.metodoEntrega.nombre}</span>
                                  {me.tiempoEstimado && <span style={{ color: 'var(--s-muted)' }}> · {me.tiempoEstimado}</span>}
                                  {(me.zonaCobertura || me.detalle) && (
                                    <p className="text-xs mt-0.5" style={{ color: 'var(--s-muted)' }}>{me.zonaCobertura || me.detalle}</p>
                                  )}
                                </div>
                                <span className="font-medium whitespace-nowrap" style={{ color: gratis ? '#16a34a' : 'var(--s-txt)' }}>
                                  {gratis ? 'Gratis' : fmt(me.costo!)}
                                </span>
                              </li>
                            );
                          })}
                        </ul>
                      </div>
                    )}

                    {/* Separador */}
                    {tienda.metodosEntrega?.length && tienda.metodosPago?.length ? (
                      <div className="h-px" style={{ background: 'var(--s-border)' }} />
                    ) : null}

                    {/* Pagos */}
                    {tienda.metodosPago && tienda.metodosPago.length > 0 && (
                      <div>
                        <div className="flex items-center gap-2 mb-3">
                          <svg className="w-5 h-5" fill="none" stroke={c.acento} strokeWidth={1.6} viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z" />
                          </svg>
                          <h4 className="text-sm font-semibold" style={{ color: 'var(--s-txt)' }}>Medios de pago</h4>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {tienda.metodosPago.map((mp, i) => (
                            <span
                              key={i}
                              title={mp.detalle || undefined}
                              className="px-3 py-1.5 rounded-full text-xs"
                              style={{ background: 'var(--s-bg)', border: '1px solid var(--s-border)', color: 'var(--s-txt)' }}
                            >
                              {mp.metodoPago.nombre}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : null}
              </div>
            </div>

            {/* ── Reseñas del producto ── */}
            {resenas.length > 0 && (
              <div className="mt-16 pt-12 border-t" style={{ borderColor: 'var(--s-border)' }}>
                <h2 className="text-2xl font-medium mb-6" style={{ color: 'var(--s-txt)' }}>
                  Opiniones sobre este producto
                </h2>
                <div className="grid sm:grid-cols-2 gap-4">
                  {resenas.map((r) => (
                    <div key={r.id} className="rounded-xl p-5" style={{ background: 'var(--s-surface)', border: '1px solid var(--s-border)' }}>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold text-white flex-shrink-0" style={{ background: c.acento }}>
                            {(r.autorNombre || r.cliente?.nombre || 'A').charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="text-sm font-medium" style={{ color: 'var(--s-txt)' }}>
                              {r.autorNombre || r.cliente?.nombre || 'Cliente'}
                            </p>
                            <p className="text-xs" style={{ color: 'var(--s-muted)' }}>{fechaCorta(r.creadoEn)}</p>
                          </div>
                        </div>
                        <Estrellas valor={r.calificacion} acento={c.acento} size={14} />
                      </div>
                      {r.comentario && (
                        <p className="text-sm leading-relaxed mt-2" style={{ color: 'var(--s-muted)' }}>{r.comentario}</p>
                      )}
                      {r.imagenUrl && (
                        <img src={r.imagenUrl} alt="Foto de la reseña" className="mt-3 rounded-lg max-h-40 object-cover" />
                      )}
                      {r.respuesta && (
                        <div className="mt-3 pl-3 ml-1" style={{ borderLeft: `2px solid ${c.acento}` }}>
                          <p className="text-xs font-semibold mb-0.5" style={{ color: c.acento }}>Respuesta de {tienda.nombre}</p>
                          <p className="text-sm" style={{ color: 'var(--s-muted)' }}>{r.respuesta}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ── Productos relacionados ── */}
            {relacionados && relacionados.length > 0 && (
              <div className="mt-16 pt-12 border-t" style={{ borderColor: 'var(--s-border)' }}>
                <h2 className="text-2xl font-medium mb-6" style={{ color: 'var(--s-txt)' }}>
                  También te puede gustar
                </h2>
                <div className="flex gap-4 md:gap-6 overflow-x-auto pb-3 snap-x snap-mandatory scrollbar-hide" style={{ scrollbarWidth: 'none' }}>
                  {relacionados.map((p) => (
                    <div key={p.id} className="flex-shrink-0 w-40 sm:w-52 snap-start">
                      <ProductCard producto={p} acento={c.acento} onSelect={() => {}} onAdd={() => {}} />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
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
