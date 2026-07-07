import type { Tienda } from '../../../types';

interface Props {
  tienda: Tienda;
  acento: string;
}

export default function BannerPromo({ tienda, acento }: Props) {
  const tema = tienda.temaConfig ?? {};
  if (!tema.bannerPromoActivo) return null;

  const { bannerPromoTitulo, bannerPromoSubtitulo, bannerPromoImagenUrl, bannerPromoLinkUrl, bannerPromoCtaTexto } = tema;

  // Si no hay ni imagen ni texto, no mostramos nada
  if (!bannerPromoImagenUrl && !bannerPromoTitulo && !bannerPromoSubtitulo) return null;

  // ── Con imagen: mismo tratamiento que el carrusel (edge-to-edge, aspect por breakpoint,
  //    object-contain para mostrar la imagen completa sin recortar), pero como banner fijo. ──
  if (bannerPromoImagenUrl) {
    const img = (
      <img
        src={bannerPromoImagenUrl}
        alt={bannerPromoTitulo || 'Promoción'}
        className="w-full h-full object-contain object-center"
        loading="lazy"
      />
    );

    return (
      <section className="flex flex-col items-center mt-4 md:mt-6">
        <div className="relative w-full overflow-hidden aspect-[4/3] sm:aspect-[16/9] lg:aspect-[16/6] max-h-[85vh]">
          {bannerPromoLinkUrl ? (
            <a
              href={bannerPromoLinkUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full h-full block"
              aria-label={bannerPromoTitulo || 'Ver más'}
            >
              {img}
            </a>
          ) : (
            <div className="w-full h-full">{img}</div>
          )}
        </div>
      </section>
    );
  }

  // ── Sin imagen: banner de color con texto (fallback). ──
  const contenido = (
    <div
      className="relative overflow-hidden rounded-2xl flex items-center"
      style={{ minHeight: 'clamp(240px, 28vw, 320px)', background: acento }}
    >
      <div className="relative z-10 w-full px-6 md:px-12 py-8 max-w-2xl text-center md:text-left">
        {bannerPromoTitulo && (
          <h3 className="text-white font-semibold leading-tight" style={{ fontSize: 'clamp(1.5rem, 3vw, 2.25rem)', fontFamily: 'Poppins, sans-serif' }}>
            {bannerPromoTitulo}
          </h3>
        )}
        {bannerPromoSubtitulo && (
          <p className="text-white/85 mt-2 text-sm md:text-base">{bannerPromoSubtitulo}</p>
        )}
        {bannerPromoCtaTexto && (
          <span
            className="s-btn inline-flex items-center gap-2 mt-5 px-6 py-2.5 text-sm font-semibold"
            style={{ background: '#fff', color: acento }}
          >
            {bannerPromoCtaTexto}
            <svg width="16" height="16" viewBox="0 0 20 20" fill="none">
              <path d="M4.166 10h11.667m0 0L9.999 4.167M15.833 10l-5.834 5.834" stroke={acento} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
        )}
      </div>
    </div>
  );

  return (
    <section className="px-6 md:px-16 lg:px-24 py-6" style={{ background: 'var(--s-bg)' }}>
      <div className="max-w-screen-xl mx-auto">
        {bannerPromoLinkUrl ? (
          <a href={bannerPromoLinkUrl} target="_blank" rel="noopener noreferrer" className="block transition-transform hover:scale-[1.005]">
            {contenido}
          </a>
        ) : (
          contenido
        )}
      </div>
    </section>
  );
}
