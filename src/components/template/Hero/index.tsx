import type { Tienda } from '../../../types';
import { basePathTienda } from '../../../utils/dominio';
import GaleriaExpandible from './GaleriaExpandible';
import HeroDenim from './HeroDenim';

interface Props {
  tienda: Tienda;
  acento: string;
  onScrollTo: (id: string) => void;
}

export default function Hero({ tienda, acento, onScrollTo }: Props) {
  const tema = tienda.temaConfig ?? {};
  // Tipos disponibles: CARRUSEL (default, diseño denim) y GALERIA. Cualquier valor
  // viejo cae a CARRUSEL.
  const tipo = tema.tipoSeccionHero === 'GALERIA' ? 'GALERIA' : 'CARRUSEL';
  const slides = (tienda.carrusel ?? []).filter((s) => s.activa !== false && s.url);

  // Modo galería expandible (reusa las imágenes del carrusel).
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

  // Modo carrusel (default) cuando hay imágenes. Usa el diseño denim (imagen cover,
  // gradiente lateral, overlay con copete/título/CTA, flechas, dots y links por slide).
  if (tipo === 'CARRUSEL' && slides.length > 0) {
    return (
      <HeroDenim
        slides={slides}
        intervalo={tema.intervaloCarrusel ?? 5000}
        acento={acento}
        basePath={basePathTienda(tienda.slug ?? '')}
        onScrollTo={onScrollTo}
      />
    );
  }

  // Fallback: todavía no hay imágenes cargadas. Mostramos un encabezado mínimo
  // (título + subtítulo + CTA) para que la sección no quede vacía.
  const titulo = tema.heroTitulo || tienda.nombre || '';
  const subtitulo = tema.heroSubtitulo || tienda.descripcion || '';
  const ctaTexto = tema.heroCtaTexto || 'Ver productos';

  return (
    <section id="inicio" className="flex flex-col items-center text-center px-6 pt-24 pb-16">
      {titulo && (
        <h1 className="text-3xl md:text-5xl font-semibold max-w-3xl" style={{ color: 'var(--s-txt)' }}>
          {titulo}
        </h1>
      )}
      {subtitulo && (
        <p className="md:text-base max-w-xl mt-3" style={{ color: 'var(--s-muted)' }}>
          {subtitulo}
        </p>
      )}
      <button
        onClick={() => onScrollTo('productos')}
        className="s-btn flex items-center gap-2 text-white px-8 py-3 mt-8 transition hover:opacity-90 border-none cursor-pointer"
        style={{ background: acento }}
      >
        <span>{ctaTexto}</span>
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          <path d="M4.166 10h11.667m0 0L9.999 4.167M15.833 10l-5.834 5.834" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
    </section>
  );
}
