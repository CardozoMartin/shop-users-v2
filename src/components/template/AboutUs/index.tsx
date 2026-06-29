import type { Tienda } from '../../../types';

interface Props {
  tienda: Tienda;
  acento: string;
}

export default function AboutUs({ tienda, acento }: Props) {
  const about = tienda.aboutUs;

  const titulo = about?.titulo || 'Sobre nosotros';
  const descripcion = about?.descripcion || tienda.descripcion;
  const imagen = about?.imagenUrl || tienda.logoUrl;
  const direccion = about?.direccion;

  const igUser = tienda.instagram ? tienda.instagram.replace(/^@/, '') : '';
  const fbUser = tienda.facebook ? tienda.facebook.replace(/^@/, '') : '';

  const redes = [
    tienda.whatsapp && {
      label: 'WhatsApp',
      href: `https://wa.me/${tienda.whatsapp}`,
      icon: (
        <svg className="w-5 h-5" fill="#fff" viewBox="0 0 24 24">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51l-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
        </svg>
      ),
      color: '#25d366',
    },
    igUser && {
      label: 'Instagram',
      href: `https://instagram.com/${igUser}`,
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="#fff" strokeWidth={1.8} viewBox="0 0 24 24">
          <rect x="2" y="2" width="20" height="20" rx="5" />
          <circle cx="12" cy="12" r="4" />
          <circle cx="17.5" cy="6.5" r="1" fill="#fff" stroke="none" />
        </svg>
      ),
      color: '#e1306c',
    },
    fbUser && {
      label: 'Facebook',
      href: fbUser.startsWith('http') ? fbUser : `https://facebook.com/${fbUser}`,
      icon: (
        <svg className="w-5 h-5" fill="#fff" viewBox="0 0 24 24">
          <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.879v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" />
        </svg>
      ),
      color: '#1877f2',
    },
  ].filter(Boolean) as { label: string; href: string; icon: React.ReactNode; color: string }[];

  if (!descripcion && !imagen && redes.length === 0 && !direccion) return null;

  const mapaSrc = direccion
    ? `https://www.google.com/maps?q=${encodeURIComponent(direccion)}&output=embed`
    : null;

  return (
    <section id="nosotros" className="py-20 px-6 md:px-16 lg:px-24" style={{ background: 'var(--s-bg)' }}>
      <h2 className="text-3xl font-semibold text-center mx-auto" style={{ color: 'var(--s-txt)' }}>
        {titulo}
      </h2>
      <p className="text-sm text-center mt-2 max-w-md mx-auto" style={{ color: 'var(--s-muted)' }}>
        Conocé más sobre {tienda.nombre} y lo que nos hace especiales.
      </p>

      <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-start justify-center gap-8 md:gap-12 py-10">
        {/* Columna izquierda: imagen + redes + dirección */}
        <div className="w-full md:max-w-sm flex flex-col gap-5">
          {imagen && (
            <img className="w-full rounded-xl h-auto object-cover" src={imagen} alt={tienda.nombre} />
          )}

          {/* Redes sociales */}
          {redes.length > 0 && (
            <div className="flex items-center gap-3">
              {redes.map((r, i) => (
                <a
                  key={i}
                  href={r.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={r.label}
                  title={r.label}
                  className="flex items-center justify-center w-10 h-10 rounded-full transition-transform hover:scale-110"
                  style={{ background: r.color }}
                >
                  {r.icon}
                </a>
              ))}
            </div>
          )}

          {/* Dirección */}
          {direccion && (
            <div className="flex items-start gap-3">
              <div className="flex items-center justify-center w-9 h-9 p-2 rounded flex-shrink-0" style={{ background: `${acento}12`, border: `1px solid ${acento}33` }}>
                <svg className="w-5 h-5" fill="none" stroke={acento} strokeWidth={1.6} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                </svg>
              </div>
              <div>
                <h4 className="text-base font-medium" style={{ color: 'var(--s-txt)' }}>Dónde estamos</h4>
                <p className="text-sm" style={{ color: 'var(--s-muted)' }}>{direccion}</p>
              </div>
            </div>
          )}
        </div>

        {/* Columna derecha: texto + mapa */}
        <div className="flex-1 w-full">
          {about?.titulo && (
            <h3 className="text-2xl md:text-3xl font-semibold" style={{ color: 'var(--s-txt)' }}>
              {about.titulo}
            </h3>
          )}
          {descripcion && (
            <p className="text-sm mt-2 leading-relaxed whitespace-pre-line" style={{ color: 'var(--s-muted)' }}>
              {descripcion}
            </p>
          )}

          {/* Mapa con la dirección */}
          {mapaSrc && (
            <div className="mt-6 rounded-xl overflow-hidden border" style={{ borderColor: 'var(--s-border)' }}>
              <iframe
                title="Ubicación de la tienda"
                src={mapaSrc}
                width="100%"
                height="240"
                style={{ border: 0, display: 'block' }}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(direccion!)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="block text-center text-sm py-2.5 transition-opacity hover:opacity-80"
                style={{ color: '#fff', background: acento }}
              >
                Ver en Google Maps →
              </a>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
