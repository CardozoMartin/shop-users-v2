import type { HeroSlide } from '../../../types';

interface Props {
  slides: HeroSlide[];
  acento: string;
  titulo?: string;
  subtitulo?: string;
}

// Header tipo "galería expandible": una fila de imágenes donde cada una crece
// al pasar el mouse. Reusa las imágenes del carrusel (tienda.carrusel).
// En mobile no hay hover, así que se muestran apiladas en grilla.
export default function GaleriaExpandible({ slides, acento, titulo, subtitulo }: Props) {
  const imgs = slides.filter((s) => s.url).slice(0, 6);
  if (imgs.length === 0) return null;

  return (
    <section id="inicio" className="px-4 md:px-6 pt-10 pb-8">
      {(titulo || subtitulo) && (
        <div className="text-center max-w-2xl mx-auto mb-8">
          {titulo && (
            <h1 className="text-2xl md:text-4xl font-semibold" style={{ color: 'var(--s-txt)' }}>
              {titulo}
            </h1>
          )}
          {subtitulo && (
            <p className="text-sm md:text-base mt-2" style={{ color: 'var(--s-muted)' }}>
              {subtitulo}
            </p>
          )}
        </div>
      )}

      {/* Desktop: fila expandible al hover */}
      <div className="hidden md:flex items-center gap-2 h-[400px] w-full max-w-5xl mx-auto">
        {imgs.map((slide, i) => (
          <div
            key={slide.id ?? i}
            className="relative group grow transition-all w-56 rounded-xl overflow-hidden h-[400px] duration-500 hover:w-full"
          >
            <img
              src={slide.url}
              alt={slide.titulo || `Imagen ${i + 1}`}
              className="h-full w-full object-cover object-center"
            />
            {slide.titulo && (
              <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                <p className="text-white font-semibold text-lg" style={{ textShadow: '0 1px 4px rgba(0,0,0,0.5)' }}>
                  {slide.titulo}
                </p>
                <span className="block h-0.5 w-10 rounded mt-1" style={{ background: acento }} />
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Mobile: grilla simple (no hay hover) */}
      <div className="grid grid-cols-2 gap-2 md:hidden max-w-lg mx-auto">
        {imgs.map((slide, i) => (
          <div key={slide.id ?? i} className="relative rounded-xl overflow-hidden aspect-[3/4]">
            <img
              src={slide.url}
              alt={slide.titulo || `Imagen ${i + 1}`}
              className="h-full w-full object-cover object-center"
            />
          </div>
        ))}
      </div>
    </section>
  );
}
