import type { CategoriaDestacada } from '../../../types';

interface Props {
  categorias: CategoriaDestacada[];
  acento: string;
}

/**
 * Banners de colección: hasta 3 tarjetas grandes (imagen + overlay + CTA),
 * en fila. Reusa las mismas "categoriasDestacadas" que carga el dueño en el
 * panel, con un tratamiento visual más grande que `CategoriasDestacadas`
 * (pensado para 3 categorías destacadas, no 4+).
 */
export default function BannerColecciones({ categorias, acento }: Props) {
  const items = (categorias ?? []).filter((c) => c.activa && c.imagenUrl).slice(0, 3);
  if (items.length === 0) return null;

  return (
    <section className="py-8 px-6 md:px-16 lg:px-24" style={{ background: 'var(--s-bg)' }}>
      <div className="max-w-screen-xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-5">
        {items.map((c) => (
          <a
            key={c.id}
            href={c.linkUrl}
            className="group relative h-72 rounded overflow-hidden block"
          >
            <img
              src={c.imagenUrl}
              alt={c.titulo}
              loading="lazy"
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
            <div className="absolute bottom-6 left-6 text-white">
              <h3 className="text-2xl sm:text-3xl font-semibold">{c.titulo}</h3>
              <span
                className="inline-block mt-3 font-semibold px-5 py-2 rounded text-sm"
                style={{ background: acento, color: '#2b2926' }}
              >
                Ver más
              </span>
            </div>
          </a>
        ))}
      </div>
    </section>
  );
}
