import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Tienda } from '../types';
import { useListadoProductos, useCategorias, useCarrito } from '../hooks/useTienda';
import type { FiltrosProductos } from '../api/tienda';
import { useCarritoStore } from '../store/carrito';
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

const ORDENES: { value: NonNullable<FiltrosProductos['orden']>; dir: NonNullable<FiltrosProductos['direccion']>; label: string }[] = [
  { value: 'creadoEn', dir: 'desc', label: 'Más nuevos' },
  { value: 'precio', dir: 'asc', label: 'Precio: menor a mayor' },
  { value: 'precio', dir: 'desc', label: 'Precio: mayor a menor' },
  { value: 'nombre', dir: 'asc', label: 'Nombre A-Z' },
  { value: 'vistas', dir: 'desc', label: 'Más vistos' },
];

const LIMITE = 12;

export default function ProductosLista({ tienda }: Props) {
  const navigate = useNavigate();
  const c = resolveColors(tienda);

  // Estado de filtros
  const [busquedaInput, setBusquedaInput] = useState('');
  const [busqueda, setBusqueda] = useState('');
  const [categoriaId, setCategoriaId] = useState<number | undefined>();
  const [precioMin, setPrecioMin] = useState('');
  const [precioMax, setPrecioMax] = useState('');
  const [ordenIdx, setOrdenIdx] = useState(0);
  const [pagina, setPagina] = useState(1);
  const debounce = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (debounce.current) clearTimeout(debounce.current);
    debounce.current = setTimeout(() => { setBusqueda(busquedaInput.trim()); setPagina(1); }, 380);
    return () => { if (debounce.current) clearTimeout(debounce.current); };
  }, [busquedaInput]);

  const { data: catData } = useCategorias(tienda.id);
  const categorias = (catData ?? []).filter((cat) => !cat.padreId);

  const orden = ORDENES[ordenIdx];
  const { data, isLoading } = useListadoProductos(tienda.id, {
    busqueda: busqueda || undefined,
    categoriaId,
    precioMin: precioMin ? Number(precioMin) : undefined,
    precioMax: precioMax ? Number(precioMax) : undefined,
    orden: orden.value,
    direccion: orden.dir,
    pagina,
    limite: LIMITE,
  });

  const productos = data?.datos ?? [];
  const totalPaginas = data?.totalPaginas ?? 1;
  const total = data?.total ?? 0;

  const { carrito, actualizar, eliminar } = useCarrito(tienda.id);
  const { abrirCarrito } = useCarritoStore();
  const cartCount = carrito?.items.reduce((acc, i) => acc + i.cantidad, 0) ?? 0;

  const cssVars = {
    '--s-bg': c.bg, '--s-txt': c.isDark ? '#f1f5f9' : '#1d293d',
    '--s-muted': '#748298', '--s-border': c.isDark ? '#1e293b' : '#e5e7eb',
    '--s-surface': c.isDark ? '#1a1a2e' : '#f8f8f8', '--s-acento': c.acento,
  } as React.CSSProperties;

  const limpiarFiltros = () => {
    setBusquedaInput(''); setBusqueda(''); setCategoriaId(undefined);
    setPrecioMin(''); setPrecioMax(''); setOrdenIdx(0); setPagina(1);
  };

  const hayFiltros = busqueda || categoriaId || precioMin || precioMax || ordenIdx !== 0;

  return (
    <div style={cssVars}>
      <Navbar
        tienda={tienda}
        cartCount={cartCount}
        acento={c.acento}
        onCartClick={abrirCarrito}
        onScrollTo={(id) => navigate(`/${tienda.slug}#${id}`)}
      />

      <main className="max-w-screen-xl mx-auto px-6 md:px-12 py-10 min-h-[60vh]">
        <h1 className="text-3xl font-medium mb-1" style={{ color: 'var(--s-txt)' }}>Productos</h1>
        <p className="text-sm mb-8" style={{ color: 'var(--s-muted)' }}>
          {total} {total === 1 ? 'producto' : 'productos'}
        </p>

        <div className="flex flex-col lg:flex-row gap-10">
          {/* Sidebar de filtros */}
          <aside className="lg:w-64 flex-shrink-0">
            <div className="lg:sticky lg:top-24 space-y-8">
              {/* Buscar */}
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: 'var(--s-txt)' }}>Buscar</p>
                <div className="flex items-center gap-2 border border-gray-300 px-3 rounded-full">
                  <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
                    <path d="M10.836 10.615 15 14.695" stroke="#7A7B7D" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                    <path clipRule="evenodd" d="M9.141 11.738c2.729-1.136 4.001-4.224 2.841-6.898S7.67.921 4.942 2.057C2.211 3.193.94 6.281 2.1 8.955s4.312 3.92 7.041 2.783" stroke="#7A7B7D" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <input
                    type="text" placeholder="Buscar..." value={busquedaInput}
                    onChange={(e) => setBusquedaInput(e.target.value)}
                    className="py-2 w-full bg-transparent outline-none placeholder-gray-500 text-sm"
                    style={{ color: 'var(--s-txt)' }}
                  />
                </div>
              </div>

              {/* Categorías */}
              {categorias.length > 0 && (
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: 'var(--s-txt)' }}>Categorías</p>
                  <div className="flex flex-col gap-1">
                    <button
                      onClick={() => { setCategoriaId(undefined); setPagina(1); }}
                      className="text-left text-sm py-1 cursor-pointer border-none bg-transparent transition-colors"
                      style={{ color: !categoriaId ? c.acento : 'var(--s-muted)', fontWeight: !categoriaId ? 600 : 400 }}
                    >
                      Todas
                    </button>
                    {categorias.map((cat) => (
                      <button
                        key={cat.id}
                        onClick={() => { setCategoriaId(cat.id); setPagina(1); }}
                        className="text-left text-sm py-1 cursor-pointer border-none bg-transparent transition-colors"
                        style={{ color: categoriaId === cat.id ? c.acento : 'var(--s-muted)', fontWeight: categoriaId === cat.id ? 600 : 400 }}
                      >
                        {cat.nombre}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Precio */}
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: 'var(--s-txt)' }}>Precio</p>
                <div className="flex items-center gap-2">
                  <input
                    type="number" placeholder="Mín" value={precioMin}
                    onChange={(e) => { setPrecioMin(e.target.value); setPagina(1); }}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none bg-transparent"
                    style={{ color: 'var(--s-txt)' }}
                  />
                  <span style={{ color: 'var(--s-muted)' }}>–</span>
                  <input
                    type="number" placeholder="Máx" value={precioMax}
                    onChange={(e) => { setPrecioMax(e.target.value); setPagina(1); }}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none bg-transparent"
                    style={{ color: 'var(--s-txt)' }}
                  />
                </div>
              </div>

              {hayFiltros && (
                <button
                  onClick={limpiarFiltros}
                  className="text-sm underline cursor-pointer border-none bg-transparent"
                  style={{ color: c.acento }}
                >
                  Limpiar filtros
                </button>
              )}
            </div>
          </aside>

          {/* Resultados */}
          <div className="flex-1">
            {/* Orden */}
            <div className="flex items-center justify-end mb-6">
              <label className="text-sm mr-2" style={{ color: 'var(--s-muted)' }}>Ordenar por:</label>
              <select
                value={ordenIdx}
                onChange={(e) => { setOrdenIdx(Number(e.target.value)); setPagina(1); }}
                className="border border-gray-300 rounded-full px-4 py-2 text-sm outline-none cursor-pointer bg-transparent"
                style={{ color: 'var(--s-txt)' }}
              >
                {ORDENES.map((o, i) => <option key={i} value={i}>{o.label}</option>)}
              </select>
            </div>

            {isLoading ? (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
                {Array.from({ length: 9 }).map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="rounded-lg w-full h-48 sm:h-72" style={{ background: 'var(--s-surface)' }} />
                    <div className="h-3 rounded w-2/3 mt-2" style={{ background: 'var(--s-surface)' }} />
                    <div className="h-5 rounded w-1/3 mt-1" style={{ background: 'var(--s-surface)' }} />
                  </div>
                ))}
              </div>
            ) : productos.length === 0 ? (
              <div className="py-24 text-center">
                <p className="text-lg" style={{ color: 'var(--s-muted)' }}>No se encontraron productos</p>
                {hayFiltros && (
                  <button onClick={limpiarFiltros} className="mt-3 text-sm underline cursor-pointer border-none bg-transparent" style={{ color: c.acento }}>
                    Limpiar filtros
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
                {productos.map((p) => (
                  <ProductCard key={p.id} producto={p} acento={c.acento} onSelect={() => {}} onAdd={() => {}} />
                ))}
              </div>
            )}

            {/* Paginación */}
            {totalPaginas > 1 && (
              <div className="mt-12 flex items-center justify-center gap-3">
                <button
                  onClick={() => setPagina(p => Math.max(1, p - 1))}
                  disabled={pagina === 1}
                  className="px-5 py-2 rounded-full text-sm font-medium cursor-pointer border transition-all disabled:opacity-30"
                  style={{ borderColor: 'var(--s-border)', color: 'var(--s-txt)', background: 'transparent' }}
                >
                  ← Anterior
                </button>
                <span className="text-sm" style={{ color: 'var(--s-muted)' }}>{pagina} / {totalPaginas}</span>
                <button
                  onClick={() => setPagina(p => Math.min(totalPaginas, p + 1))}
                  disabled={pagina >= totalPaginas}
                  className="px-5 py-2 rounded-full text-sm font-medium cursor-pointer border transition-all disabled:opacity-30"
                  style={{ borderColor: 'var(--s-border)', color: 'var(--s-txt)', background: 'transparent' }}
                >
                  Siguiente →
                </button>
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer tienda={tienda} acento={c.acento} onScrollTo={(id) => navigate(`/${tienda.slug}#${id}`)} />

      <CartDrawer
        acento={c.acento}
        isDark={c.isDark}
        onActualizar={(itemId, cant) => actualizar.mutate({ itemId, cantidad: cant })}
        onEliminar={(itemId) => eliminar.mutate(itemId)}
      />
    </div>
  );
}
