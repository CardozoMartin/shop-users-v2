import type { Tienda } from '../../../types';
import Carrusel from './Carrusel';
import GaleriaExpandible from './GaleriaExpandible';

interface Props {
  tienda: Tienda;
  acento: string;
  onScrollTo: (id: string) => void;
}

const FRASES_FALLBACK = [
  'Envío gratis a todo el país',
  'Pagá en cuotas sin interés',
  'Cambios y devoluciones fáciles',
  'Atención por WhatsApp',
];

export default function Hero({ tienda, acento, onScrollTo }: Props) {
  const tema = tienda.temaConfig ?? {};
  const tipo = tema.tipoSeccionHero ?? 'HERO_FIJO';
  const slides = (tienda.carrusel ?? []).filter((s) => s.activa !== false && s.url);

  // Modo carrusel: el dueño eligió CARRUSEL y subió imágenes
  if (tipo === 'CARRUSEL' && slides.length > 0) {
    return (
      <Carrusel
        slides={slides}
        intervalo={tema.intervaloCarrusel ?? 5000}
        acento={acento}
        titulo={tema.heroTitulo}
        subtitulo={tema.heroSubtitulo}
      />
    );
  }

  // Modo galería expandible: reusa las imágenes del carrusel.
  if (tipo === 'GALERIA' && slides.length > 0) {
    return (
      <GaleriaExpandible
        slides={slides}
        acento={acento}
        titulo={tema.heroTitulo}
        subtitulo={tema.heroSubtitulo}
      />
    );
  }

  const titulo = tema.heroTitulo || tienda.nombre || 'Build. Launch. Scale. Without the complexity.';
  const subtitulo = tema.heroSubtitulo || tienda.descripcion ||
    'A high-performance, serverless Postgres database that helps you ship fast and scale without limits.';
  const ctaTexto = tema.heroCtaTexto || 'get started for free';

  const frases = (tienda.marqueeItems && tienda.marqueeItems.length > 0)
    ? [...tienda.marqueeItems].sort((a, b) => a.orden - b.orden).map((m) => m.texto)
    : FRASES_FALLBACK;

  return (
    <section
      id="inicio"
      className="flex flex-col items-center bg-cover text-gray-800 pb-16 text-sm"
      style={{ backgroundImage: "url('https://raw.githubusercontent.com/prebuiltui/prebuiltui/main/assets/hero/gradientBg.svg')" }}
    >
      {/* Título con degradado */}
      <h1 className="text-4xl md:text-6xl text-center font-medium max-w-3xl mt-32 bg-gradient-to-r from-black to-[#748298] text-transparent bg-clip-text">
        {titulo}
      </h1>
      <p className="text-slate-600 md:text-base max-md:px-2 text-center max-w-xl mt-3">
        {subtitulo}
      </p>

      {/* CTA pill */}
      <button
        onClick={() => onScrollTo('productos')}
        className="flex items-center gap-2 text-white px-8 py-3 mt-8 rounded-full transition hover:opacity-90 border-none cursor-pointer"
        style={{ background: acento }}
      >
        <span>{ctaTexto}</span>
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          <path d="M4.166 10h11.667m0 0L9.999 4.167M15.833 10l-5.834 5.834" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {/* Marquee de frases */}
      <div className="overflow-hidden w-full relative max-w-5xl mx-auto select-none mt-16">
        <div className="absolute left-0 top-0 h-full w-20 z-10 pointer-events-none bg-gradient-to-r from-[#f5f7ff] to-transparent" />
        <div className="marquee-inner flex will-change-transform min-w-[200%]">
          <div className="flex py-4 items-center">
            {[...frases, ...frases].map((frase, i) => (
              <span key={i} className="flex items-center whitespace-nowrap">
                <span className="text-slate-600 text-base font-medium">{frase}</span>
                <span className="mx-10 text-lg" style={{ color: acento }}>✦</span>
              </span>
            ))}
          </div>
        </div>
        <div className="absolute right-0 top-0 h-full w-20 md:w-40 z-10 pointer-events-none bg-gradient-to-l from-[#efe9f4] to-transparent" />
      </div>
    </section>
  );
}
