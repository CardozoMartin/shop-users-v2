import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import type { HeroSlide } from '../../../types';

interface Props {
  slides: HeroSlide[];
  intervalo?: number;
  acento: string;
  titulo?: string;
  subtitulo?: string;
  /** Prefijo de rutas de la tienda, para resolver links internos ("/categoria/5"). */
  basePath?: string;
}

/** ¿Es un link externo (http/https o protocolo)? Si no, se trata como ruta interna. */
function esLinkExterno(link: string): boolean {
  return /^(https?:)?\/\//i.test(link) || /^[a-z]+:/i.test(link);
}

export default function Carrusel({ slides, intervalo = 5000, basePath = '' }: Props) {
  const [current, setCurrent] = useState(0);
  const total = slides.length;
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const navigate = useNavigate();

  // Resuelve el click de un slide con link: externo → navegación normal; interno → router.
  const irAlLink = (link: string, e: React.MouseEvent) => {
    if (esLinkExterno(link)) return;
    e.preventDefault();
    const ruta = link.startsWith('/') ? link : `/${link}`;
    navigate(`${basePath}${ruta}`);
  };

  const hrefDe = (link: string) =>
    esLinkExterno(link) ? link : `${basePath}${link.startsWith('/') ? link : `/${link}`}`;

  const resetAuto = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (total > 1) {
      timerRef.current = setInterval(() => {
        setCurrent((c) => (c + 1) % total);
      }, Math.max(1500, intervalo));
    }
  };

  useEffect(() => {
    resetAuto();
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [total, intervalo]);

  const next = () => { setCurrent((c) => (c + 1) % total); resetAuto(); };
  const prev = () => { setCurrent((c) => (c - 1 + total) % total); resetAuto(); };

  if (total === 0) return null;

  return (
    <section id="inicio" className="flex flex-col items-center mt-4 md:mt-6">
      {/* Slider a TODO EL ANCHO (edge-to-edge) con proporción PANORÁMICA fija: entra completo
          en la primera carga (sin scrollear) y la imagen llena el contenedor de forma prolija.
          Más alto en mobile (aspect 4/3) y panorámico en desktop (16/6). Tope por viewport. */}
      <div className="relative w-full overflow-hidden aspect-[4/3] sm:aspect-[16/9] lg:aspect-[16/6] max-h-[85vh]">
        <div
          className="flex h-full transition-transform duration-500 ease-in-out"
          style={{ transform: `translateX(-${current * 100}%)` }}
        >
          {slides.map((slide, i) => {
            const img = (
              <img
                src={slide.url}
                alt={slide.titulo || `Slide ${i + 1}`}
                className="w-full h-full object-contain object-center"
                loading={i === 0 ? 'eager' : 'lazy'}
              />
            );
            const link = slide.linkUrl?.trim();
            // Con link → la imagen entera es clickeable (interno vía router / externo en pestaña nueva).
            if (link) {
              const externo = esLinkExterno(link);
              return (
                <a
                  key={slide.id ?? i}
                  href={hrefDe(link)}
                  target={externo ? '_blank' : undefined}
                  rel={externo ? 'noopener noreferrer' : undefined}
                  onClick={(e) => irAlLink(link, e)}
                  className="w-full h-full flex-shrink-0 block"
                  aria-label={slide.titulo || 'Ver más'}
                >
                  {img}
                </a>
              );
            }
            return (
              <div key={slide.id ?? i} className="w-full h-full flex-shrink-0">
                {img}
              </div>
            );
          })}
        </div>

        {/* Flecha anterior */}
        {total > 1 && (
          <button
            onClick={prev}
            aria-label="Anterior"
            className="absolute left-3 md:left-6 top-1/2 -translate-y-1/2 p-2 md:p-3 bg-black/30 rounded-full hover:bg-black/50 border-none cursor-pointer transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        )}

        {/* Flecha siguiente */}
        {total > 1 && (
          <button
            onClick={next}
            aria-label="Siguiente"
            className="absolute right-3 md:right-6 top-1/2 -translate-y-1/2 p-2 md:p-3 bg-black/30 rounded-full hover:bg-black/50 border-none cursor-pointer transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        )}
      </div>
    </section>
  );
}
