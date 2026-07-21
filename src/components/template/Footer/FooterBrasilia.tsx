import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import type { Tienda } from '../../../types';
import { basePathTienda } from '../../../utils/dominio';
import BotonArrepentimiento from '../BotonArrepentimiento';
import DatosLegales from '../DatosLegales';
import { usePaginasLegalesActivas } from '../../../hooks/useTienda';

const RUTA_LEGAL: Record<string, string> = {
  TERMINOS: 'terminos',
  CAMBIOS: 'cambios',
  PRIVACIDAD: 'privacidad',
};

const DARK = '#2b2926';

interface Props {
  tienda: Tienda;
  acento: string;
  onScrollTo: (id: string) => void;
}

// Footer "Brasília": fondo tinta oscuro, 4 columnas (marca+redes, tienda, legal,
// newsletter), estilo Tiendanube.
export default function FooterBrasilia({ tienda, acento, onScrollTo }: Props) {
  const navigate = useNavigate();
  const location = useLocation();
  const bp = basePathTienda(tienda.slug);
  const home = bp || '/';
  const enHome = location.pathname === home || location.pathname === `${bp}/`;
  const [email, setEmail] = useState('');
  const [enviado, setEnviado] = useState(false);

  const { data: paginasLegales = [] } = usePaginasLegalesActivas(tienda.id);

  const irAInicio = () => {
    if (enHome) onScrollTo('inicio');
    else navigate(home);
  };

  const linksTienda = [
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

  const handleNewsletter = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setEnviado(true);
    setEmail('');
  };

  return (
    <footer id="contacto" className="mt-10" style={{ background: DARK, color: '#d4d0cb' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 grid grid-cols-1 sm:grid-cols-4 gap-10">
        {/* Marca */}
        <div>
          <button onClick={irAInicio} className="border-none bg-transparent cursor-pointer p-0 mb-4 block">
            {tienda.logoUrl ? (
              <img src={tienda.logoUrl} alt={tienda.nombre} className="h-9 w-auto object-contain" />
            ) : (
              <span className="s-display text-2xl text-white tracking-[0.1em]">{tienda.nombre}</span>
            )}
          </button>
          {tienda.descripcion && (
            <p className="text-sm leading-relaxed mb-4">{tienda.descripcion}</p>
          )}
          {redes.length > 0 && (
            <div className="flex gap-3">
              {redes.map((r, i) => (
                <a
                  key={i}
                  href={r.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={r.label}
                  title={r.label}
                  className="flex items-center justify-center w-8 h-8 rounded-full transition-transform hover:scale-110"
                  style={{ background: r.color }}
                >
                  <svg className="w-4 h-4" fill="none" stroke="#fff" strokeWidth={1.8} viewBox="0 0 24 24">
                    {r.icon}
                  </svg>
                </a>
              ))}
            </div>
          )}
        </div>

        {/* Tienda */}
        <div>
          <h4 className="text-white font-semibold mb-4">Tienda</h4>
          <ul className="space-y-2 text-sm list-none p-0 m-0">
            {linksTienda.map((l) => (
              <li key={l.label}>
                <button
                  onClick={l.onClick}
                  className="hover:text-white transition-colors border-none bg-transparent cursor-pointer p-0 text-left"
                >
                  {l.label}
                </button>
              </li>
            ))}
          </ul>
        </div>

        {/* Legal */}
        <div>
          <h4 className="text-white font-semibold mb-4">Información</h4>
          <ul className="space-y-2 text-sm list-none p-0 m-0">
            {paginasLegales.map((p) => (
              <li key={p.tipo}>
                <button
                  onClick={() => navigate(`${bp}/${RUTA_LEGAL[p.tipo] ?? ''}`)}
                  className="hover:text-white transition-colors border-none bg-transparent cursor-pointer p-0 text-left"
                >
                  {p.titulo}
                </button>
              </li>
            ))}
            <li><BotonArrepentimiento tiendaId={tienda.id} acento={acento} /></li>
          </ul>
        </div>

        {/* Newsletter */}
        <div>
          <h4 className="text-white font-semibold mb-2">Newsletter</h4>
          <p className="text-sm mb-3">¡Sé parte de nuestra comunidad y recibí las mejores ofertas!</p>
          {enviado ? (
            <p className="text-sm" style={{ color: acento }}>¡Gracias por suscribirte!</p>
          ) : (
            <form onSubmit={handleNewsletter} className="flex max-w-xs">
              <input
                required
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email"
                className="flex-1 min-w-0 px-3 py-2 text-sm rounded-l focus:outline-none"
                style={{ color: DARK }}
              />
              <button
                type="submit"
                className="font-semibold px-4 rounded-r text-sm border-none cursor-pointer"
                style={{ background: acento, color: DARK }}
              >
                Enviar
              </button>
            </form>
          )}
        </div>
      </div>

      {/* Datos legales del vendedor */}
      <div className="border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <DatosLegales tienda={tienda} />
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-5 flex flex-col sm:flex-row justify-between gap-2 text-xs text-white/50">
          <span>{tienda.nombre} © {new Date().getFullYear()}. Todos los derechos reservados.</span>
          <span style={{ color: acento }}>Hecho con amor ✦</span>
        </div>
      </div>
    </footer>
  );
}
