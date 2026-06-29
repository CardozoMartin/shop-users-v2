import { useState, useEffect, useRef } from 'react';
import { useProductos } from '../../../hooks/useTienda';
import type { Producto } from '../../../types';
import ProductCard from './ProductCard';

interface Props {
  tiendaId: number;
  acento: string;
  onSelect: (p: Producto) => void;
  onAdd: (p: Producto) => void;
}

const LIMITE = 12;

export default function Productos({ tiendaId, acento, onSelect, onAdd }: Props) {
  const [busquedaInput, setBusquedaInput] = useState('');
  const [busqueda, setBusqueda] = useState('');
  const [pagina, setPagina] = useState(1);
  const debounce = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (debounce.current) clearTimeout(debounce.current);
    debounce.current = setTimeout(() => { setBusqueda(busquedaInput.trim()); setPagina(1); }, 380);
    return () => { if (debounce.current) clearTimeout(debounce.current); };
  }, [busquedaInput]);

  const { data, isLoading } = useProductos(tiendaId, {
    busqueda: busqueda || undefined,
    pagina,
    limite: LIMITE,
  });

  const productos = data?.datos ?? [];
  const totalPaginas = data?.totalPaginas ?? 1;

  return (
    <section id="productos" className="py-16 px-6 md:px-16 lg:px-24" style={{ background: 'var(--s-bg)' }}>
      {/* Encabezado estilo cards-products1 */}
      <h1 className="text-3xl font-medium text-center mb-2" style={{ color: 'var(--s-txt)' }}>
        Nuevos Productos
      </h1>
      <p className="mb-8 text-center" style={{ color: 'var(--s-muted)' }}>
        Explorá las últimas adiciones a nuestra colección.
      </p>

      {/* Solo buscador, centrado */}
      <div className="flex justify-center mb-10">
        <div className="flex items-center gap-2 border border-gray-300 px-4 rounded-full w-full max-w-sm">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M10.836 10.615 15 14.695" stroke="#7A7B7D" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
            <path clipRule="evenodd" d="M9.141 11.738c2.729-1.136 4.001-4.224 2.841-6.898S7.67.921 4.942 2.057C2.211 3.193.94 6.281 2.1 8.955s4.312 3.92 7.041 2.783" stroke="#7A7B7D" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <input
            type="text"
            placeholder="Buscar productos"
            value={busquedaInput}
            onChange={(e) => setBusquedaInput(e.target.value)}
            className="py-2.5 w-full bg-transparent outline-none placeholder-gray-500 text-sm"
            style={{ color: 'var(--s-txt)' }}
          />
        </div>
      </div>

      {/* Grid de cards */}
      {isLoading ? (
        <div className="grid grid-cols-2 sm:flex sm:flex-wrap sm:justify-center gap-4 sm:gap-6 max-w-5xl mx-auto">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="w-full sm:w-56 animate-pulse">
              <div className="rounded-lg w-full h-48 sm:h-72" style={{ background: 'var(--s-surface)' }} />
              <div className="h-3 rounded w-2/3 mt-2" style={{ background: 'var(--s-surface)' }} />
              <div className="h-5 rounded w-1/3 mt-1" style={{ background: 'var(--s-surface)' }} />
            </div>
          ))}
        </div>
      ) : productos.length === 0 ? (
        <div className="py-20 text-center">
          <p className="text-lg" style={{ color: 'var(--s-muted)' }}>
            No se encontraron productos
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:flex sm:flex-wrap sm:justify-center gap-4 sm:gap-6 max-w-5xl mx-auto">
          {productos.map((p) => (
            <div key={p.id} className="w-full sm:w-56">
              <ProductCard producto={p} acento={acento} onSelect={onSelect} onAdd={onAdd} />
            </div>
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
          <span className="text-sm" style={{ color: 'var(--s-muted)' }}>
            {pagina} / {totalPaginas}
          </span>
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
    </section>
  );
}
