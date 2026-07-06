import { useNavigate, useParams } from 'react-router-dom';
import { useProductos } from '../../../hooks/useTienda';
import { basePathTienda } from '../../../utils/dominio';
import type { Producto } from '../../../types';
import ProductCard, { type CardVariante } from './ProductCard';

interface Props {
  tiendaId: number;
  acento: string;
  cardVariante?: CardVariante;
  onSelect: (p: Producto) => void;
  onAdd: (p: Producto) => void;
}

// Cantidad de productos que se muestran en el home como "vistazo". El resto se ve
// en la vista completa (/productos) con filtros y paginado.
const VISTA_PREVIA = 8;

export default function Productos({ tiendaId, acento, cardVariante, onSelect, onAdd }: Props) {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const bp = basePathTienda(slug ?? '');

  const { data, isLoading } = useProductos(tiendaId, { pagina: 1, limite: VISTA_PREVIA });

  const productos = data?.datos ?? [];
  const total = data?.total ?? productos.length;

  return (
    <section id="productos" className="py-16 px-6 md:px-16 lg:px-24" style={{ background: 'var(--s-bg)' }}>
      {/* Encabezado */}
      <h1 className="text-3xl font-medium text-center mb-2" style={{ color: 'var(--s-txt)' }}>
        Nuevos Productos
      </h1>
      <p className="mb-10 text-center" style={{ color: 'var(--s-muted)' }}>
        Explorá las últimas adiciones a nuestra colección.
      </p>

      {/* Grid de cards */}
      {isLoading ? (
        <div className="grid grid-cols-2 sm:flex sm:flex-wrap sm:justify-center gap-4 sm:gap-6 max-w-5xl mx-auto">
          {Array.from({ length: VISTA_PREVIA }).map((_, i) => (
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
        <>
          <div className="grid grid-cols-2 sm:flex sm:flex-wrap sm:justify-center gap-4 sm:gap-6 max-w-5xl mx-auto">
            {productos.map((p) => (
              <div key={p.id} className="w-full sm:w-56">
                <ProductCard producto={p} acento={acento} variante={cardVariante} onSelect={onSelect} onAdd={onAdd} />
              </div>
            ))}
          </div>

          {/* Botón "Ver más" → vista completa con filtros y paginado.
              Solo aparece si hay más productos de los que se muestran acá. */}
          {total > productos.length && (
            <div className="mt-12 flex justify-center">
              <button
                onClick={() => navigate(`${bp}/productos`)}
                className="flex items-center gap-2 px-8 py-3 rounded-full text-sm font-semibold text-white border-none cursor-pointer transition hover:opacity-90"
                style={{ background: acento }}
              >
                Ver todos los productos
                <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
                  <path d="M4.166 10h11.667m0 0L9.999 4.167M15.833 10l-5.834 5.834" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </div>
          )}
        </>
      )}
    </section>
  );
}
