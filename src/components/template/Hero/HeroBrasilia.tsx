import type { HeroSlide } from '../../../types';

interface Props {
  slides: HeroSlide[];
  acento?: string;
  onScrollTo?: (id: string) => void;
}

const LIME = '#c3d92e';

/**
 * Hero "Brasília": dos imágenes lado a lado (grid 1/2 en desktop) con overlay
 * centrado (título + subtítulo + CTA). Usa el primer y segundo slide del
 * carrusel de la tienda; si solo hay uno, se repite para llenar el grid.
 */
export default function HeroBrasilia({ slides, acento = LIME, onScrollTo }: Props) {
  if (slides.length === 0) return null;
  const izq = slides[0];
  const der = slides[1] ?? slides[0];

  const titulo = izq.titulo || 'SALE 50% OFF';
  const subtitulo = izq.subtitulo || 'Hasta agotar stock disponible';

  return (
    <section
      id="inicio"
      className="relative grid grid-cols-1 sm:grid-cols-2 h-[420px] sm:h-[560px] overflow-hidden"
    >
      <img src={izq.url} alt={izq.titulo || 'Colección'} className="w-full h-full object-cover" />
      <img src={der.url} alt={der.titulo || 'Colección'} className="w-full h-full object-cover hidden sm:block" />
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center text-white px-4">
        <h1 className="s-display text-4xl sm:text-6xl font-semibold drop-shadow-md">{titulo}</h1>
        <p className="mt-3 text-sm sm:text-base drop-shadow">{subtitulo}</p>
        <button
          onClick={() => onScrollTo?.('productos')}
          className="mt-6 font-semibold px-8 py-3 rounded transition hover:brightness-95 border-none cursor-pointer"
          style={{ background: acento, color: '#2b2926' }}
        >
          Ver productos
        </button>
      </div>
    </section>
  );
}
