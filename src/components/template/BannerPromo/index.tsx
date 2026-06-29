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

  const contenido = (
    <div
      className="relative overflow-hidden rounded-2xl flex items-center"
      style={{
        minHeight: bannerPromoImagenUrl ? 'clamp(320px, 38vw, 460px)' : 'clamp(240px, 28vw, 320px)',
        background: bannerPromoImagenUrl ? '#111' : acento,
      }}
    >
      {/* Imagen de fondo */}
      {bannerPromoImagenUrl && (
        <>
          <img src={bannerPromoImagenUrl} alt={bannerPromoTitulo || 'Promoción'} className="absolute inset-0 w-full h-full object-cover" />
          <div className="absolute inset-0" style={{ background: 'linear-gradient(90deg, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0.25) 60%, rgba(0,0,0,0.05) 100%)' }} />
        </>
      )}

      {/* Texto */}
      {(bannerPromoTitulo || bannerPromoSubtitulo || bannerPromoCtaTexto) && (
        <div className="relative z-10 px-8 md:px-12 py-8 max-w-2xl">
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
              className="inline-flex items-center gap-2 mt-5 px-6 py-2.5 rounded-full text-sm font-semibold"
              style={{ background: '#fff', color: acento }}
            >
              {bannerPromoCtaTexto}
              <svg width="16" height="16" viewBox="0 0 20 20" fill="none">
                <path d="M4.166 10h11.667m0 0L9.999 4.167M15.833 10l-5.834 5.834" stroke={acento} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
          )}
        </div>
      )}
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
