import type { CategoriaDestacada } from '../../../types';

interface Props {
  categorias: CategoriaDestacada[];
  acento?: string;
}

// Sección de categorías destacadas: grilla de tarjetas imagen + título centrado
// que llevan al link configurado por el dueño (interno o externo).
export default function CategoriasDestacadas({ categorias }: Props) {
  const items = (categorias ?? []).filter((c) => c.activa && c.imagenUrl).slice(0, 4);
  if (items.length === 0) return null;

  // Columnas según cantidad real de ítems, para que nunca queden angostos o
  // descentrados (1 → 1 col, 2 → 2 cols, 3 → 3 cols, 4+ → 4 cols en desktop).
  const cols = items.length >= 4 ? 'lg:grid-cols-4' : items.length === 3 ? 'lg:grid-cols-3' : 'lg:grid-cols-2';

  return (
    <section className="py-14 px-6 md:px-16 lg:px-24" style={{ background: 'var(--s-bg)' }}>
      <div className="max-w-screen-xl mx-auto">
        <div className={`grid grid-cols-1 sm:grid-cols-2 ${cols} gap-4`}>
          {items.map((c) => (
            <a
              key={c.id}
              href={c.linkUrl}
              className="group relative block overflow-hidden rounded-2xl aspect-[4/3]"
            >
              <img
                src={c.imagenUrl}
                alt={c.titulo}
                loading="lazy"
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
              <div className="absolute inset-0 flex items-end p-6">
                <span className="text-white text-3xl md:text-4xl font-black tracking-wide drop-shadow-lg uppercase">
                  {c.titulo}
                </span>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
