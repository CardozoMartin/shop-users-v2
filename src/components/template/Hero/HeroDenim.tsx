import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import type { HeroSlide } from '../../../types';

interface Props {
  slides: HeroSlide[];
  intervalo?: number;
  /** Color de acento ("rivet" dorado del diseño denim). */
  acento?: string;
  /** Prefijo de rutas de la tienda, para resolver links internos ("/categoria/5"). */
  basePath?: string;
  onScrollTo?: (id: string) => void;
}

/** ¿Es un link externo (http/https o protocolo)? Si no, se trata como ruta interna. */
function esLinkExterno(link: string): boolean {
  return /^(https?:)?\/\//i.test(link) || /^[a-z]+:/i.test(link);
}

// Paleta del diseño de referencia (DENIM CO.). El acento por defecto es el
// dorado "rivet"; se puede pisar con la prop `acento` de la tienda.
const INK = '#1B1F2E';
const DENIM_DEEP = '#1E3251';
const RIVET = '#C7912B';

/**
 * Hero-slider con estética "denim": imagen full-bleed en modo cover, gradiente
 * lateral oscuro y contenido superpuesto (copete + título grande + CTA), más
 * flechas, dots, autoplay y swipe. Réplica 1:1 del HTML de referencia adaptada
 * a React y a la data real de `tienda.carrusel`.
 */
export default function HeroDenim({ slides, intervalo = 5000, acento = RIVET, basePath = '', onScrollTo }: Props) {
  const [current, setCurrent] = useState(0);
  const total = slides.length;
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const touchStartX = useRef(0);
  const navigate = useNavigate();

  // Resuelve el click de un slide/botón según sea link externo o ruta interna.
  const irAlLink = (link: string, e: React.MouseEvent) => {
    if (esLinkExterno(link)) return; // dejamos que el <a href> haga la navegación normal
    e.preventDefault();
    // Ruta interna: la prefijamos con el basePath de la tienda (evitando doble "/").
    const ruta = link.startsWith('/') ? link : `/${link}`;
    navigate(`${basePath}${ruta}`);
  };

  const resetAuto = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (total > 1) {
      timerRef.current = setInterval(() => setCurrent((c) => (c + 1) % total), Math.max(1500, intervalo));
    }
  };

  useEffect(() => {
    resetAuto();
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [total, intervalo]);

  const goTo = (i: number) => { setCurrent((i + total) % total); resetAuto(); };
  const next = () => goTo(current + 1);
  const prev = () => goTo(current - 1);

  const onTouchStart = (e: React.TouchEvent) => { touchStartX.current = e.touches[0].clientX; };
  const onTouchEnd = (e: React.TouchEvent) => {
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(dx) > 40) (dx > 0 ? prev : next)();
  };

  if (total === 0) return null;

  return (
    <section
      id="inicio"
      className="relative w-full overflow-hidden mt-6 sm:mt-8"
      style={{ background: DENIM_DEEP, aspectRatio: '16 / 9', maxHeight: 640 }}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      {slides.map((slide, i) => {
        const link = slide.linkUrl?.trim();
        // Hay texto para mostrar sobre la imagen? (copete/título/descripción)
        const tieneTexto = !!(slide.etiqueta || slide.titulo || slide.subtitulo);
        // Si el slide tiene link pero NO tiene texto, toda la imagen redirige.
        const imagenEsLink = !!link && !tieneTexto;

        const contenido = (
          <>
            {/* Gradiente lateral oscuro para legibilidad del texto. */}
            {tieneTexto && (
              <div
                className="absolute inset-0"
                style={{ background: `linear-gradient(to right, ${DENIM_DEEP}d9, ${DENIM_DEEP}40 45%, transparent)` }}
              />
            )}

            {/* Contenido superpuesto */}
            {tieneTexto && (
              <div className="relative z-10 h-full flex items-center max-w-7xl mx-auto px-5 sm:px-8 w-full">
                <div>
                  {slide.etiqueta && (
                    <p
                      className="uppercase text-xs sm:text-sm font-semibold"
                      style={{ color: acento, letterSpacing: '0.3em' }}
                    >
                      {slide.etiqueta}
                    </p>
                  )}
                  {slide.titulo && (
                    <p
                      className="text-2xl sm:text-4xl font-extrabold mt-2 text-white"
                      style={{ letterSpacing: '-0.01em' }}
                    >
                      {slide.titulo}
                    </p>
                  )}
                  {slide.subtitulo && (
                    <p className="text-sm sm:text-base text-white/80 mt-2 max-w-md">
                      {slide.subtitulo}
                    </p>
                  )}
                  {/* Botón: si hay link explícito redirige; si no, hace scroll a productos. */}
                  {link ? (
                    <a
                      href={esLinkExterno(link) ? link : `${basePath}${link.startsWith('/') ? link : `/${link}`}`}
                      target={esLinkExterno(link) ? '_blank' : undefined}
                      rel={esLinkExterno(link) ? 'noopener noreferrer' : undefined}
                      onClick={(e) => irAlLink(link, e)}
                      className="inline-block mt-5 bg-white font-bold uppercase text-sm px-6 py-3 no-underline transition-colors"
                      style={{ color: INK }}
                      onMouseEnter={(e) => { e.currentTarget.style.background = acento; e.currentTarget.style.color = '#fff'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = '#fff'; e.currentTarget.style.color = INK; }}
                    >
                      Ver más
                    </a>
                  ) : (
                    <button
                      onClick={() => onScrollTo?.('productos')}
                      className="inline-block mt-5 bg-white font-bold uppercase text-sm px-6 py-3 border-none cursor-pointer transition-colors"
                      style={{ color: INK }}
                      onMouseEnter={(e) => { e.currentTarget.style.background = acento; e.currentTarget.style.color = '#fff'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = '#fff'; e.currentTarget.style.color = INK; }}
                    >
                      Ver colección
                    </button>
                  )}
                </div>
              </div>
            )}
          </>
        );

        const bgStyle = {
          opacity: i === current ? 1 : 0,
          pointerEvents: (i === current ? 'auto' : 'none') as 'auto' | 'none',
          backgroundImage: `url('${slide.url}')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center 20%',
        };

        // Sin texto + con link → la imagen entera es el enlace.
        if (imagenEsLink) {
          const externo = esLinkExterno(link!);
          return (
            <a
              key={slide.id ?? i}
              href={externo ? link : `${basePath}${link!.startsWith('/') ? link : `/${link}`}`}
              target={externo ? '_blank' : undefined}
              rel={externo ? 'noopener noreferrer' : undefined}
              onClick={(e) => irAlLink(link!, e)}
              className="absolute inset-0 block transition-opacity duration-500 ease-in-out"
              style={bgStyle}
              aria-label={slide.titulo || 'Ver más'}
            />
          );
        }

        return (
          <div
            key={slide.id ?? i}
            className="absolute inset-0 transition-opacity duration-500 ease-in-out"
            style={bgStyle}
          >
            {contenido}
          </div>
        );
      })}

      {/* Flechas */}
      {total > 1 && (
        <>
          <button
            onClick={prev}
            aria-label="Anterior"
            className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 z-20 bg-white/10 hover:bg-white/25 backdrop-blur text-white rounded-full w-9 h-9 sm:w-11 sm:h-11 flex items-center justify-center transition-colors border-none cursor-pointer"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><polyline points="15 18 9 12 15 6" /></svg>
          </button>
          <button
            onClick={next}
            aria-label="Siguiente"
            className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 z-20 bg-white/10 hover:bg-white/25 backdrop-blur text-white rounded-full w-9 h-9 sm:w-11 sm:h-11 flex items-center justify-center transition-colors border-none cursor-pointer"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><polyline points="9 18 15 12 9 6" /></svg>
          </button>
        </>
      )}

      {/* Dots */}
      {total > 1 && (
        <div className="absolute bottom-4 sm:bottom-6 left-1/2 -translate-x-1/2 z-20 flex gap-2">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              aria-label={`Ir al slide ${i + 1}`}
              className="rounded-full transition-all duration-200 border-none cursor-pointer"
              style={{
                height: 8,
                width: i === current ? 22 : 8,
                background: i === current ? '#fff' : 'rgba(255,255,255,0.45)',
              }}
            />
          ))}
        </div>
      )}
    </section>
  );
}
