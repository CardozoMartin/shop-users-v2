import { useRef } from 'react';
import { useDestacados } from '../../../hooks/useTienda';
import ProductCard, { type CardVariante } from '../Productos/ProductCard';

interface Props {
  tiendaId: number;
  acento: string;
  cardVariante?: CardVariante;
}

export default function Destacados({ tiendaId, acento, cardVariante }: Props) {
  const { data: productos, isLoading } = useDestacados(tiendaId);
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (dir: 'left' | 'right') => {
    const el = scrollRef.current;
    if (!el) return;
    const cantidad = el.clientWidth * 0.8;
    el.scrollBy({ left: dir === 'left' ? -cantidad : cantidad, behavior: 'smooth' });
  };

  // Si no hay destacados, no mostramos la sección
  if (!isLoading && (!productos || productos.length === 0)) return null;

  return (
    <section className="py-14 px-6 md:px-16 lg:px-24" style={{ background: 'var(--s-surface)' }}>
      <div className="max-w-screen-xl mx-auto">
        {/* Encabezado */}
        <div className="flex items-end justify-between mb-6">
          <div>
            <span
              className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-white text-xs font-semibold mb-2"
              style={{ background: acento, fontSize: 11 }}
            >
              <svg width="11" height="11" viewBox="0 0 18 17" fill="none">
                <path d="M8.04894 0.927049C8.3483 0.00573802 9.6517 0.00574017 9.95106 0.927051L11.2451 4.90983C11.379 5.32185 11.763 5.60081 12.1962 5.60081H16.3839C17.3527 5.60081 17.7554 6.84043 16.9717 7.40983L13.5838 9.87132C13.2333 10.126 13.0866 10.5773 13.2205 10.9894L14.5146 14.9721C14.8139 15.8934 13.7595 16.6596 12.9757 16.0902L9.58778 13.6287C9.2373 13.374 8.7627 13.374 8.41221 13.6287L5.02426 16.0902C4.24054 16.6596 3.18607 15.8934 3.48542 14.9721L4.7795 10.9894C4.91338 10.5773 4.76672 10.126 4.41623 9.87132L1.02827 7.40983C0.244561 6.84043 0.647338 5.60081 1.61606 5.60081H5.8038C6.23703 5.60081 6.62099 5.32185 6.75486 4.90983L8.04894 0.927049Z" fill="#fff" />
              </svg>
              Lo más pro
            </span>
            <h2 className="text-2xl md:text-3xl font-medium" style={{ color: 'var(--s-txt)' }}>
              Productos destacados
            </h2>
          </div>

          {/* Flechas (desktop) */}
          <div className="hidden md:flex gap-2">
            <button
              onClick={() => scroll('left')}
              className="w-10 h-10 rounded-full flex items-center justify-center border cursor-pointer transition-colors hover:bg-black/5"
              style={{ borderColor: 'var(--s-border)' }}
              aria-label="Anterior"
            >
              <svg className="w-5 h-5" fill="none" stroke="var(--s-txt)" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              onClick={() => scroll('right')}
              className="w-10 h-10 rounded-full flex items-center justify-center border cursor-pointer transition-colors hover:bg-black/5"
              style={{ borderColor: 'var(--s-border)' }}
              aria-label="Siguiente"
            >
              <svg className="w-5 h-5" fill="none" stroke="var(--s-txt)" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>

        {/* Slider */}
        <div
          ref={scrollRef}
          className="flex gap-4 md:gap-6 overflow-x-auto pb-3 snap-x snap-mandatory scrollbar-hide"
          style={{ scrollbarWidth: 'none', paddingLeft: 4, paddingTop: 3 }}
        >
          {isLoading
            ? Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex-shrink-0 w-44 sm:w-56 snap-start animate-pulse">
                  <div className="rounded-lg w-full h-48 sm:h-72" style={{ background: 'var(--s-bg)' }} />
                  <div className="h-3 rounded w-2/3 mt-2" style={{ background: 'var(--s-bg)' }} />
                  <div className="h-5 rounded w-1/3 mt-1" style={{ background: 'var(--s-bg)' }} />
                </div>
              ))
            : (productos ?? []).map((p) => (
                <div key={p.id} className="flex-shrink-0 w-44 sm:w-56 snap-start">
                  <ProductCard producto={p} acento={acento} variante={cardVariante} destacado onSelect={() => {}} onAdd={() => {}} />
                </div>
              ))}
        </div>
      </div>
    </section>
  );
}
