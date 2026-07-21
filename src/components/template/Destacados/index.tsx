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
