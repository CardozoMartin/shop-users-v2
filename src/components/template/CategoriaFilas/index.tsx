import { useRef, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useProductos, useCategorias } from '../../../hooks/useTienda';
import { basePathTienda } from '../../../utils/dominio';
import type { Categoria } from '../../../types';
import ProductCard, { type CardVariante } from '../Productos/ProductCard';

interface Props {
  tiendaId: number;
  acento: string;
  cardVariante?: CardVariante;
  /** IDs de categoría a mostrar como filas, en orden. */
  filas?: number[];
}

// Cuántos productos trae cada fila (vistazo). El resto se ve con "Ver más".
const POR_FILA = 10;

/**
 * Filas por categoría en el home: por cada categoría configurada, un carrusel
 * horizontal de sus productos + un "Ver más" que lleva a la vista completa ya
 * filtrada por esa categoría. Ideal para catálogos grandes/estacionales.
 */
export default function CategoriaFilas({ tiendaId, acento, cardVariante, filas }: Props) {
  const { data: cats = [] } = useCategorias(tiendaId);

  // Resolvemos cada ID a su categoría, respetando el orden configurado y
  // descartando IDs que ya no existan.
  const catsPorId = useMemo(() => {
    const m = new Map<number, Categoria>();
    for (const c of cats) m.set(c.id, c);
    return m;
  }, [cats]);

  const seleccionadas = (filas ?? [])
    .map((id) => catsPorId.get(id))
    .filter((c): c is Categoria => !!c);

  if (seleccionadas.length === 0) return null;

  return (
    <>
      {seleccionadas.map((cat) => (
        <FilaCategoria
          key={cat.id}
          tiendaId={tiendaId}
          categoria={cat}
          acento={acento}
          cardVariante={cardVariante}
        />
      ))}
    </>
  );
}

// ─── Una fila = carrusel de productos de UNA categoría ───────────────────────
function FilaCategoria({
  tiendaId,
  categoria,
  acento,
  cardVariante,
}: {
  tiendaId: number;
  categoria: Categoria;
  acento: string;
  cardVariante?: CardVariante;
}) {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const bp = basePathTienda(slug ?? '');
  const scrollRef = useRef<HTMLDivElement>(null);

  const { data, isLoading } = useProductos(tiendaId, {
    categoriaId: categoria.id,
    pagina: 1,
    limite: POR_FILA,
  });

  const productos = data?.datos ?? [];
  const total = data?.total ?? productos.length;

  const scroll = (dir: 'left' | 'right') => {
    const el = scrollRef.current;
    if (!el) return;
    const cantidad = el.clientWidth * 0.8;
    el.scrollBy({ left: dir === 'left' ? -cantidad : cantidad, behavior: 'smooth' });
  };

  const verMas = () => navigate(`${bp}/productos?categoria=${categoria.id}`);

  // Si la categoría no tiene productos, no mostramos la fila.
  if (!isLoading && productos.length === 0) return null;

  return (
    <section className="py-10 px-6 md:px-16 lg:px-24" style={{ background: 'var(--s-bg)' }}>
      <div className="max-w-screen-xl mx-auto">
        {/* Encabezado de la fila */}
        <div className="flex items-end justify-between mb-6">
          <h2 className="text-2xl md:text-3xl font-medium" style={{ color: 'var(--s-txt)' }}>
            {categoria.nombre}
          </h2>

          <div className="flex items-center gap-2">
            {/* Ver más → vista completa filtrada por esta categoría */}
            <button
              onClick={verMas}
              className="text-sm font-semibold cursor-pointer border-none bg-transparent transition-opacity hover:opacity-70"
              style={{ color: acento }}
            >
              Ver más →
            </button>

            {/* Flechas (desktop) */}
            <div className="hidden md:flex gap-2 ml-2">
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
        </div>

        {/* Carrusel horizontal */}
        <div
          ref={scrollRef}
          className="flex gap-4 md:gap-6 overflow-x-auto pb-3 snap-x snap-mandatory scrollbar-hide"
          style={{ scrollbarWidth: 'none', paddingLeft: 4, paddingTop: 3 }}
        >
          {isLoading
            ? Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex-shrink-0 w-44 sm:w-56 snap-start animate-pulse">
                  <div className="rounded-lg w-full h-48 sm:h-72" style={{ background: 'var(--s-surface)' }} />
                  <div className="h-3 rounded w-2/3 mt-2" style={{ background: 'var(--s-surface)' }} />
                  <div className="h-5 rounded w-1/3 mt-1" style={{ background: 'var(--s-surface)' }} />
                </div>
              ))
            : productos.map((p) => (
                <div key={p.id} className="flex-shrink-0 w-44 sm:w-56 snap-start">
                  <ProductCard producto={p} acento={acento} variante={cardVariante} onSelect={() => {}} onAdd={() => {}} />
                </div>
              ))}

          {/* Tarjeta final "Ver más" si hay más productos que los mostrados */}
          {!isLoading && total > productos.length && (
            <button
              onClick={verMas}
              className="flex-shrink-0 w-44 sm:w-56 snap-start rounded-lg border-2 border-dashed flex flex-col items-center justify-center gap-2 cursor-pointer bg-transparent transition-colors hover:bg-black/5"
              style={{ borderColor: 'var(--s-border)', minHeight: 200 }}
            >
              <span className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: acento }}>
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path d="M4.166 10h11.667m0 0L9.999 4.167M15.833 10l-5.834 5.834" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
              <span className="text-sm font-semibold" style={{ color: 'var(--s-txt)' }}>
                Ver todo
              </span>
              <span className="text-xs" style={{ color: 'var(--s-muted)' }}>
                {total} productos
              </span>
            </button>
          )}
        </div>
      </div>
    </section>
  );
}
