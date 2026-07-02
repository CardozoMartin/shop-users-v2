import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import type { Tienda } from '../../../types';
import { useAuthStore } from '../../../store/auth';
import { basePathTienda } from '../../../utils/dominio';

interface Props {
  tienda: Tienda;
  cartCount: number;
  acento: string;
  onCartClick: () => void;
  onScrollTo: (id: string) => void;
}

// Navbar PILL: links agrupados en una "píldora" central con fondo, y a la
// derecha carrito + botón de acción con gradiente. Estética moderna.
// Respeta el mismo comportamiento (navbarStyle) que el clásico.
export default function NavbarPill({ tienda, cartCount, acento, onCartClick, onScrollTo }: Props) {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { cliente, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const bp = basePathTienda(tienda.slug);

  const navStyle = tienda.temaConfig?.navbarStyle ?? 'STICKY';

  useEffect(() => {
    if (navStyle !== 'TRANSPARENT') return;
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [navStyle]);

  const navClase = (() => {
    const base = 'flex items-center justify-between py-4 z-50 transition-all relative';
    const padding = 'px-6 md:px-12 lg:px-24 xl:px-40';
    if (navStyle === 'FLOATING') {
      return `${base} px-6 md:px-10 sticky top-4 mx-3 md:mx-8 rounded-2xl bg-white/90 backdrop-blur shadow-lg border border-gray-100`;
    }
    if (navStyle === 'TRANSPARENT') {
      return `${base} ${padding} fixed top-0 left-0 right-0 ${
        scrolled ? 'bg-white/95 backdrop-blur border-b border-zinc-200 shadow-sm' : 'bg-transparent'
      }`;
    }
    return `${base} ${padding} bg-white`;
  })();

  const links = [
    { label: 'Inicio', id: 'inicio', tipo: 'seccion' as const },
    { label: 'Productos', to: `${bp}/productos`, tipo: 'ruta' as const },
    { label: 'Nosotros', to: `${bp}/nosotros`, tipo: 'ruta' as const },
  ];

  const home = bp || '/';
  const enHome = location.pathname === home || location.pathname === `${bp}/`;
  // Marcamos como "activo" el link de la ruta actual (o Inicio si estamos en home).
  const esActivo = (l: (typeof links)[number]) =>
    l.tipo === 'seccion' ? enHome : location.pathname === l.to;

  const handleLink = (l: (typeof links)[number]) => {
    setOpen(false);
    if (l.tipo === 'ruta') {
      navigate(l.to);
    } else if (enHome) {
      onScrollTo(l.id);
    } else {
      navigate(home);
      setTimeout(() => onScrollTo(l.id), 100);
    }
  };

  return (
    <nav className={navClase}>
      {/* Logo / nombre */}
      <button
        onClick={() => handleLink(links[0])}
        className="cursor-pointer border-none bg-transparent p-0 flex-shrink-0"
      >
        {tienda.logoUrl ? (
          <img src={tienda.logoUrl} alt={tienda.nombre} className="h-9 w-auto object-contain" />
        ) : (
          <span className="s-display text-xl font-semibold tracking-tight text-zinc-900">{tienda.nombre}</span>
        )}
      </button>

      {/* Píldora central de links (desktop) */}
      <div className="hidden md:flex items-center bg-zinc-50 border border-zinc-200 rounded-full px-1 py-1 gap-2">
        {links.map((l) => (
          <button
            key={l.label}
            onClick={() => handleLink(l)}
            className={`px-4 py-1.5 rounded-full text-sm transition-colors border cursor-pointer ${
              esActivo(l)
                ? 'bg-white border-zinc-200 font-medium text-zinc-800 hover:text-zinc-600'
                : 'border-transparent text-zinc-500 hover:text-zinc-700'
            }`}
          >
            {l.label}
          </button>
        ))}
      </div>

      {/* Derecha: carrito + acción (desktop) */}
      <div className="hidden md:flex items-center gap-4">
        {/* Carrito */}
        <button onClick={onCartClick} className="relative cursor-pointer border-none bg-transparent p-0">
          <svg width="20" height="20" viewBox="0 0 14 14" fill="none">
            <path d="M.583.583h2.333l1.564 7.81a1.17 1.17 0 0 0 1.166.94h5.67a1.17 1.17 0 0 0 1.167-.94l.933-4.893H3.5m2.333 8.75a.583.583 0 1 1-1.167 0 .583.583 0 0 1 1.167 0m6.417 0a.583.583 0 1 1-1.167 0 .583.583 0 0 1 1.167 0" stroke={acento} strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          {cartCount > 0 && (
            <span
              className="absolute -top-2 -right-3 text-xs text-white w-[18px] h-[18px] rounded-full flex items-center justify-center"
              style={{ background: acento, fontSize: 10 }}
            >
              {cartCount > 9 ? '9+' : cartCount}
            </span>
          )}
        </button>

        {cliente ? (
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate(`${bp}/mi-cuenta`)}
              className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-semibold border-none cursor-pointer"
              style={{ background: acento }}
              title={`Hola, ${cliente.nombre}`}
            >
              {cliente.nombre.charAt(0).toUpperCase()}
            </button>
            <button
              onClick={logout}
              className="text-xs text-zinc-500 hover:text-zinc-800 border-none bg-transparent cursor-pointer"
            >
              Salir
            </button>
          </div>
        ) : (
          <button
            onClick={() => navigate(`${bp}/cuenta`)}
            className="flex items-center gap-2.5 text-zinc-50 hover:text-zinc-200 text-sm font-medium pl-5 pr-2 py-2 rounded-full cursor-pointer border-0"
            style={{ background: 'linear-gradient(to right, #09090b, #71717a)' }}
          >
            Ingresar
            <span className="w-7 h-7 rounded-full bg-white flex items-center justify-center">
              <svg width="12" height="10" viewBox="0 0 12 10" fill="none">
                <path d="M.6 4.602h10m-4-4 4 4-4 4" stroke="#3f3f47" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
          </button>
        )}
      </div>

      {/* Hamburguesa mobile */}
      <button
        onClick={() => setOpen(!open)}
        aria-label="Menu"
        className="md:hidden flex flex-col gap-1.5 cursor-pointer bg-transparent border-0 p-1"
      >
        <span className={`block w-6 h-0.5 bg-zinc-800 transition-transform ${open ? 'rotate-45 translate-y-2' : ''}`} />
        <span className={`block w-6 h-0.5 bg-zinc-800 transition-opacity ${open ? 'opacity-0' : ''}`} />
        <span className={`block w-6 h-0.5 bg-zinc-800 transition-transform ${open ? '-rotate-45 -translate-y-2' : ''}`} />
      </button>

      {/* Menú mobile */}
      {open && (
        <div className="absolute top-full left-0 w-full bg-white border-t border-zinc-200 flex flex-col p-5 gap-1 md:hidden z-50">
          {links.map((l) => (
            <button
              key={l.label}
              onClick={() => handleLink(l)}
              className={`px-4 py-2.5 rounded-lg text-sm text-left border-none bg-transparent cursor-pointer ${
                esActivo(l) ? 'bg-zinc-50 font-medium text-zinc-800' : 'text-zinc-500 hover:bg-zinc-50'
              }`}
            >
              {l.label}
            </button>
          ))}
          {cliente ? (
            <>
              <button
                onClick={() => { navigate(`${bp}/mi-cuenta`); setOpen(false); }}
                className="px-4 py-2.5 rounded-lg text-sm text-left text-zinc-600 border-none bg-transparent cursor-pointer"
              >
                Mi cuenta
              </button>
              <button
                onClick={() => { logout(); setOpen(false); }}
                className="px-4 py-2.5 rounded-lg text-sm text-left text-red-500 border-none bg-transparent cursor-pointer"
              >
                Cerrar sesión
              </button>
            </>
          ) : (
            <button
              onClick={() => { navigate(`${bp}/cuenta`); setOpen(false); }}
              className="flex items-center justify-center gap-2.5 text-zinc-50 text-sm font-medium px-5 py-2.5 rounded-full cursor-pointer border-0 mt-3 w-fit"
              style={{ background: 'linear-gradient(to right, #09090b, #71717a)' }}
            >
              Ingresar
              <span className="w-7 h-7 rounded-full bg-white flex items-center justify-center">
                <svg width="12" height="10" viewBox="0 0 12 10" fill="none">
                  <path d="M.6 4.602h10m-4-4 4 4-4 4" stroke="#3f3f47" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
            </button>
          )}
        </div>
      )}
    </nav>
  );
}
