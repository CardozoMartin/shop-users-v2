import type { CategoriaDestacada } from '../../../types';

interface Props {
  categorias: CategoriaDestacada[];
  acento: string;
}

// Sección de categorías destacadas: grilla de tarjetas imagen + título centrado
// que llevan al link configurado por el dueño (interno o externo).
export default function CategoriasDestacadas({ categorias, acento }: Props) {
  const items = (categorias ?? []).filter((c) => c.activa && c.imagenUrl);
  if (items.length === 0) return null;

  return (
    <section className="py-14 px-6 md:px-16 lg:px-24" style={{ background: 'var(--s-bg)' }}>
      <div className="max-w-screen-xl mx-auto">
        <div className="flex flex-wrap justify-center gap-4">
          {items.slice(0, 4).map((c) => (
            <a
              key={c.id}
              href={c.linkUrl}
              className="group relative block overflow-hidden rounded-2xl aspect-[4/3] w-full sm:w-[calc(50%-0.5rem)] lg:w-[calc(25%-0.75rem)]"
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
