import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { listarTiendas } from '../api/tienda';
import logoTiendizi from '../assets/tiendizi-logo.svg';

const ACENTO = '#6366f1';

export default function DirectorioPage() {
  const [input, setInput] = useState('');
  const [busqueda, setBusqueda] = useState('');
  const [pagina, setPagina] = useState(1);
  const debounce = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (debounce.current) clearTimeout(debounce.current);
    debounce.current = setTimeout(() => { setBusqueda(input.trim()); setPagina(1); }, 400);
    return () => { if (debounce.current) clearTimeout(debounce.current); };
  }, [input]);

  const { data, isLoading } = useQuery({
    queryKey: ['directorio', busqueda, pagina],
    queryFn: () => listarTiendas(busqueda, pagina),
  });

  const tiendas = data?.datos ?? [];
  const totalPaginas = data?.totalPaginas ?? 1;

  return (
    <div className="min-h-screen bg-white" style={{ fontFamily: 'Poppins, system-ui, sans-serif', color: '#1d293d' }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap');`}</style>

      {/* Header */}
      <header className="border-b border-gray-100 sticky top-0 bg-white/95 backdrop-blur z-30">
        <div className="max-w-screen-xl mx-auto px-6 py-4 flex items-center justify-center">
          <img src={logoTiendizi} alt="Tiendizi" className="h-9 w-auto" />
        </div>
      </header>

      {/* Hero + buscador */}
      <section className="px-6 pt-14 pb-10 text-center">
        <h1 className="text-3xl md:text-4xl font-semibold mb-3">Descubrí tiendas en Tiendizi</h1>
        <p className="text-sm md:text-base text-gray-500 max-w-lg mx-auto mb-8">
          Explorá todos los emprendimientos y encontrá lo que buscás.
        </p>

        <div className="max-w-xl mx-auto">
          <div className="flex items-center gap-2 border border-gray-300 rounded-full px-5 py-1 shadow-sm focus-within:border-gray-400 transition-colors">
            <svg width="18" height="18" viewBox="0 0 16 16" fill="none">
              <path d="M10.836 10.615 15 14.695" stroke="#7A7B7D" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
              <path clipRule="evenodd" d="M9.141 11.738c2.729-1.136 4.001-4.224 2.841-6.898S7.67.921 4.942 2.057C2.211 3.193.94 6.281 2.1 8.955s4.312 3.92 7.041 2.783" stroke="#7A7B7D" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <input
              type="text"
              placeholder="Buscar tienda por nombre, ciudad..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="flex-1 py-2.5 bg-transparent outline-none text-sm placeholder-gray-400"
            />
          </div>
        </div>
      </section>

      {/* Grid de tiendas */}
      <section className="max-w-screen-xl mx-auto px-6 pb-20">
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="rounded-2xl border border-gray-100 p-6 animate-pulse">
                <div className="w-14 h-14 rounded-xl bg-gray-100 mb-4" />
                <div className="h-4 bg-gray-100 rounded w-1/2 mb-2" />
                <div className="h-3 bg-gray-100 rounded w-full mb-1" />
                <div className="h-3 bg-gray-100 rounded w-2/3" />
              </div>
            ))}
          </div>
        ) : tiendas.length === 0 ? (
          <div className="py-24 text-center">
            <p className="text-5xl mb-4">🔍</p>
            <p className="text-gray-500">
              {busqueda ? `No encontramos tiendas para "${busqueda}"` : 'Todavía no hay tiendas disponibles.'}
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {tiendas.map((t) => (
                <div
                  key={t.id}
                  className="group rounded-2xl border border-gray-100 p-6 flex flex-col transition-all hover:shadow-lg hover:-translate-y-0.5 hover:border-gray-200"
                >
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-14 h-14 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center overflow-hidden flex-shrink-0">
                      {t.logoUrl
                        ? <img src={t.logoUrl} alt={t.nombre} className="w-full h-full object-contain p-1.5" />
                        : <span className="text-xl font-bold" style={{ color: ACENTO }}>{t.nombre.charAt(0).toUpperCase()}</span>}
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-semibold text-base truncate">{t.nombre}</h3>
                      {(t.ciudad || t.provincia) && (
                        <p className="text-xs text-gray-400 truncate">
                          {[t.ciudad, t.provincia].filter(Boolean).join(', ')}
                        </p>
                      )}
                    </div>
                  </div>

                  <p className="text-sm text-gray-500 leading-relaxed line-clamp-2 flex-1 mb-4">
                    {t.descripcion || 'Sin descripción.'}
                  </p>

                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-400">
                      {t._count?.productos ?? 0} {(t._count?.productos ?? 0) === 1 ? 'producto' : 'productos'}
                    </span>
                    <Link
                      to={`/${t.slug}`}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold text-white transition-opacity hover:opacity-90"
                      style={{ background: ACENTO }}
                    >
                      Ver tienda
                      <svg width="14" height="14" viewBox="0 0 20 20" fill="none">
                        <path d="M4.166 10h11.667m0 0L9.999 4.167M15.833 10l-5.834 5.834" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </Link>
                  </div>
                </div>
              ))}
            </div>

            {/* Paginación */}
            {totalPaginas > 1 && (
              <div className="mt-12 flex items-center justify-center gap-3">
                <button
                  onClick={() => setPagina(p => Math.max(1, p - 1))}
                  disabled={pagina === 1}
                  className="px-5 py-2 rounded-full text-sm font-medium border border-gray-200 cursor-pointer transition-all disabled:opacity-30 hover:bg-gray-50"
                >
                  ← Anterior
                </button>
                <span className="text-sm text-gray-500">{pagina} / {totalPaginas}</span>
                <button
                  onClick={() => setPagina(p => Math.min(totalPaginas, p + 1))}
                  disabled={pagina >= totalPaginas}
                  className="px-5 py-2 rounded-full text-sm font-medium border border-gray-200 cursor-pointer transition-all disabled:opacity-30 hover:bg-gray-50"
                >
                  Siguiente →
                </button>
              </div>
            )}
          </>
        )}
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 py-6">
        <p className="text-center text-xs text-gray-400">
          Hecho con Tiendizi · {new Date().getFullYear()}
        </p>
      </footer>
    </div>
  );
}
