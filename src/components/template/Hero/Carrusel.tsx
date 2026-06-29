import { useState, useEffect, useRef } from 'react';
import type { HeroSlide } from '../../../types';

interface Props {
  slides: HeroSlide[];
  intervalo?: number;
  acento: string;
  titulo?: string;
  subtitulo?: string;
}

export default function Carrusel({ slides, intervalo = 5000, acento, titulo, subtitulo }: Props) {
  const [current, setCurrent] = useState(0);
  const total = slides.length;
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

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

  const goTo = (i: number) => { setCurrent(i); resetAuto(); };
  const next = () => { setCurrent((c) => (c + 1) % total); resetAuto(); };
  const prev = () => { setCurrent((c) => (c - 1 + total) % total); resetAuto(); };

  if (total === 0) return null;

  return (
    <section id="inicio" className="flex flex-col items-center px-2 md:px-6 pt-8 pb-6">
      {/* Título y subtítulo fijos de la sección, arriba del carrusel */}
      {(titulo || subtitulo) && (
        <div className="text-center max-w-2xl mb-6 px-4">
          {titulo && (
            <h1 className="text-2xl md:text-4xl font-semibold text-slate-800">{titulo}</h1>
          )}
          {subtitulo && (
            <p className="text-slate-500 md:text-base mt-2">{subtitulo}</p>
          )}
        </div>
      )}

      <div className="flex items-center justify-center w-full">
        {/* Flecha anterior */}
        {total > 1 && (
          <button
            onClick={prev}
            className="md:p-2 p-1 bg-black/30 md:mr-6 mr-2 rounded-full hover:bg-black/50 border-none cursor-pointer transition-colors flex-shrink-0"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        )}

        {/* Slider con fade — imágenes apiladas */}
        <div
          className="w-full max-w-5xl overflow-hidden relative rounded-xl shadow-sm"
          style={{ aspectRatio: '21/9' }}
        >
          {slides.map((slide, i) => (
            <img
              key={slide.id ?? i}
              src={slide.url}
              alt={slide.titulo || `Slide ${i + 1}`}
              className="absolute inset-0 w-full h-full object-cover"
              style={{
                opacity: i === current ? 1 : 0,
                transition: 'opacity 900ms ease-in-out',
              }}
            />
          ))}
        </div>

        {/* Flecha siguiente */}
        {total > 1 && (
          <button
            onClick={next}
            className="p-1 md:p-2 bg-black/30 md:ml-6 ml-2 rounded-full hover:bg-black/50 border-none cursor-pointer transition-colors flex-shrink-0"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        )}
      </div>

      {/* Dots */}
      {total > 1 && (
        <div className="flex gap-2 mt-6">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              className="border-none cursor-pointer rounded-full transition-all duration-300"
              style={{
                width: i === current ? 24 : 8,
                height: 8,
                background: i === current ? acento : '#cbd5e1',
                padding: 0,
              }}
            />
          ))}
        </div>
      )}
    </section>
  );
}
