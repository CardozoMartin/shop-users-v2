import { useNavigate, useLocation } from 'react-router-dom';
import type { Tienda } from '../../../types';
import { basePathTienda } from '../../../utils/dominio';

interface Props {
  tienda: Tienda;
  acento: string;
  onScrollTo: (id: string) => void;
}

export default function FooterColumnas({ tienda, acento, onScrollTo }: Props) {
  const navigate = useNavigate();
  const location = useLocation();
  const bp = basePathTienda(tienda.slug);
  const home = bp || '/';
  const enHome = location.pathname === home || location.pathname === `${bp}/`;

  const irAInicio = () => {
    if (enHome) onScrollTo('inicio');
    else navigate(home);
  };

  const links = [
    { label: 'Inicio', onClick: irAInicio },
    { label: 'Productos', onClick: () => navigate(`${bp}/productos`) },
    { label: 'Nosotros', onClick: () => navigate(`${bp}/nosotros`) },
  ];

  const igUser = tienda.instagram ? tienda.instagram.replace(/^@/, '') : '';
  const fbUser = tienda.facebook ? tienda.facebook.replace(/^@/, '') : '';

  const redes = [
    tienda.whatsapp && {
      label: 'WhatsApp', href: `https://wa.me/${tienda.whatsapp}`, color: '#25d366',
      icon: <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51l-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" fill="#fff" stroke="none" />,
    },
    igUser && {
      label: 'Instagram', href: `https://instagram.com/${igUser}`, color: '#e1306c',
      icon: <><rect x="2" y="2" width="20" height="20" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.5" cy="6.5" r="1" fill="#fff" stroke="none" /></>,
    },
    fbUser && {
      label: 'Facebook', href: fbUser.startsWith('http') ? fbUser : `https://facebook.com/${fbUser}`, color: '#1877f2',
      icon: <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.879v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" fill="#fff" stroke="none" />,
    },
  ].filter(Boolean) as { label: string; href: string; color: string; icon: React.ReactNode }[];

  return (
    <footer id="contacto" style={{ background: 'linear-gradient(to bottom, #f1eaff, #ffffff)' }}>
      <div className="max-w-7xl mx-auto px-6 py-16 grid grid-cols-1 sm:grid-cols-3 gap-10">
        {/* Columna marca */}
        <div className="flex flex-col items-start gap-4">
          <button onClick={irAInicio} className="border-none bg-transparent cursor-pointer p-0">
            {tienda.logoUrl ? (
              <img src={tienda.logoUrl} alt={tienda.nombre} className="h-11 w-auto object-contain" />
            ) : (
              <span className="text-2xl font-semibold" style={{ color: 'var(--s-txt)' }}>{tienda.nombre}</span>
            )}
          </button>
          {tienda.descripcion && (
            <p className="text-sm leading-relaxed max-w-xs" style={{ color: 'var(--s-muted)' }}>
              {tienda.descripcion}
            </p>
          )}
        </div>

        {/* Columna navegación */}
        <div className="flex flex-col gap-3">
          <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--s-txt)' }}>
            Navegación
          </p>
          {links.map((l) => (
            <button
              key={l.label}
              onClick={l.onClick}
              className="text-sm text-left cursor-pointer border-none bg-transparent transition-colors hover:opacity-60 w-fit"
              style={{ color: 'var(--s-muted)' }}
            >
              {l.label}
            </button>
          ))}
        </div>

        {/* Columna redes */}
        {redes.length > 0 && (
          <div className="flex flex-col gap-3">
            <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--s-txt)' }}>
              Seguinos
            </p>
            <div className="flex items-center gap-3">
              {redes.map((r, i) => (
                <a
                  key={i}
                  href={r.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={r.label}
                  title={r.label}
                  className="flex items-center justify-center w-9 h-9 rounded-full transition-transform hover:scale-110"
                  style={{ background: r.color }}
                >
                  <svg className="w-[18px] h-[18px]" fill="none" stroke="#fff" strokeWidth={1.8} viewBox="0 0 24 24">
                    {r.icon}
                  </svg>
                </a>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Copyright */}
      <div className="border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs" style={{ color: 'var(--s-muted)' }}>
          <span>{tienda.nombre} © {new Date().getFullYear()}. Todos los derechos reservados.</span>
          <span style={{ color: acento }}>Hecho con amor ✦</span>
        </div>
      </div>
    </footer>
  );
}
