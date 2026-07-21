import type { Tienda } from '../../../types';

interface Props {
  tienda: Tienda;
  acento: string;
}

/**
 * Grilla de 3 beneficios (cuotas, envío gratis, WhatsApp), estilo "trust badges".
 * El link de WhatsApp usa el número real de la tienda; si no hay, se omite esa tarjeta.
 */
export default function Beneficios({ tienda, acento }: Props) {
  const items = [
    {
      icon: (
        <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.3}>
          <rect x="2.5" y="6" width="19" height="13" rx="2" />
          <path d="M2.5 10h19" />
        </svg>
      ),
      titulo: '3 cuotas sin interés',
      texto: 'Con todas las tarjetas de crédito',
    },
    {
      icon: (
        <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.3}>
          <path d="M3 16V7a1 1 0 011-1h9v10" />
          <path d="M13 10h4l4 4v2h-2" />
          <circle cx="7.5" cy="17.5" r="1.6" />
          <circle cx="17.5" cy="17.5" r="1.6" />
        </svg>
      ),
      titulo: 'Envío gratis',
      texto: 'En compras superiores a $50.000',
    },
    tienda.whatsapp && {
      icon: (
        <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.3}>
          <path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z" />
        </svg>
      ),
      titulo: 'Asesorate por WhatsApp',
      texto: '¡Comunicate con nosotros!',
      href: `https://wa.me/${tienda.whatsapp}`,
    },
  ].filter(Boolean) as { icon: React.ReactNode; titulo: string; texto: string; href?: string }[];

  return (
    <section className="py-10" style={{ background: `${acento}1f` }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 grid grid-cols-1 sm:grid-cols-3 gap-8 text-center">
        {items.map((it) => {
          const contenido = (
            <div className="flex flex-col items-center gap-2" style={{ color: 'var(--s-txt)' }}>
              <span style={{ color: acento }}>{it.icon}</span>
              <h3 className="font-semibold">{it.titulo}</h3>
              <p className="text-sm" style={{ color: 'var(--s-muted)' }}>{it.texto}</p>
            </div>
          );
          return it.href ? (
            <a key={it.titulo} href={it.href} target="_blank" rel="noopener noreferrer" className="no-underline">
              {contenido}
            </a>
          ) : (
            <div key={it.titulo}>{contenido}</div>
          );
        })}
      </div>
    </section>
  );
}
