import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import type { Tienda } from '../../../types';
import { useAuthStore } from '../../../store/auth';

interface Props {
  tienda: Tienda;
  cartCount: number;
  acento: string;
  onCartClick: () => void;
  onScrollTo: (id: string) => void;
}

export default function Navbar({ tienda, cartCount, acento, onCartClick, onScrollTo }: Props) {
  const [open, setOpen] = useState(false);
  const { cliente, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  // links de sección hacen scroll en la home; "ruta" navega a una vista propia
  const links = [
    { label: 'Inicio', id: 'inicio', tipo: 'seccion' as const },
    { label: 'Productos', to: `/${tienda.slug}/productos`, tipo: 'ruta' as const },
    { label: 'Nosotros', to: `/${tienda.slug}/nosotros`, tipo: 'ruta' as const },
  ];

  const enHome = location.pathname === `/${tienda.slug}` || location.pathname === `/${tienda.slug}/`;

  const handleLink = (l: (typeof links)[number]) => {
    setOpen(false);
    if (l.tipo === 'ruta') {
      navigate(l.to);
    } else if (enHome) {
      onScrollTo(l.id);
    } else {
      // estamos en otra vista: volvemos a la home y dejamos que el scroll lo maneje onScrollTo
      navigate(`/${tienda.slug}`);
      setTimeout(() => onScrollTo(l.id), 100);
    }
  };

  return (
    <nav className="flex items-center justify-between px-6 md:px-16 lg:px-24 xl:px-32 py-4 border-b border-gray-300 bg-white relative sticky top-0 z-50 transition-all">
      {/* Logo / nombre */}
      <button
        onClick={() => handleLink(links[0])}
        className="cursor-pointer border-none bg-transparent p-0 flex-shrink-0"
      >
        {tienda.logoUrl ? (
          <img src={tienda.logoUrl} alt={tienda.nombre} className="h-9 w-auto object-contain" />
        ) : (
          <span className="text-xl font-semibold tracking-tight text-black">
            {tienda.nombre}
          </span>
        )}
      </button>

      {/* Desktop Menu */}
      <div className="hidden sm:flex items-center gap-8">
        {links.map((l) => (
          <button
            key={l.label}
            onClick={() => handleLink(l)}
            className="text-black cursor-pointer border-none bg-transparent transition-colors hover:text-gray-500"
          >
            {l.label}
          </button>
        ))}

        {/* Buscador */}
        <div className="hidden lg:flex items-center text-sm gap-2 border border-gray-300 px-3 rounded-full">
          <input
            className="py-1.5 w-full bg-transparent outline-none placeholder-gray-500 text-black"
            type="text"
            placeholder="Buscar productos"
          />
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M10.836 10.615 15 14.695" stroke="#7A7B7D" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
            <path clipRule="evenodd" d="M9.141 11.738c2.729-1.136 4.001-4.224 2.841-6.898S7.67.921 4.942 2.057C2.211 3.193.94 6.281 2.1 8.955s4.312 3.92 7.041 2.783" stroke="#7A7B7D" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>

        {/* Carrito */}
        <button onClick={onCartClick} className="relative cursor-pointer border-none bg-transparent p-0">
          <svg width="18" height="18" viewBox="0 0 14 14" fill="none">
            <path d="M.583.583h2.333l1.564 7.81a1.17 1.17 0 0 0 1.166.94h5.67a1.17 1.17 0 0 0 1.167-.94l.933-4.893H3.5m2.333 8.75a.583.583 0 1 1-1.167 0 .583.583 0 0 1 1.167 0m6.417 0a.583.583 0 1 1-1.167 0 .583.583 0 0 1 1.167 0" stroke="#615fff" strokeLinecap="round" strokeLinejoin="round" />
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

        {/* Login / cuenta */}
        {cliente ? (
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(`/${tienda.slug}/mi-cuenta`)}
              className="flex items-center gap-2 text-black text-sm border-none bg-transparent cursor-pointer hover:text-gray-500 transition-colors"
            >
              <span className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-semibold" style={{ background: acento }}>
                {cliente.nombre.charAt(0).toUpperCase()}
              </span>
              <span className="hidden lg:inline">Hola, {cliente.nombre}</span>
            </button>
            <button
              onClick={logout}
              className="text-xs text-gray-500 hover:text-gray-800 border-none bg-transparent cursor-pointer"
              title="Cerrar sesión"
            >
              Salir
            </button>
          </div>
        ) : (
          <button
            onClick={() => navigate(`/${tienda.slug}/cuenta`)}
            className="cursor-pointer px-8 py-2 text-white rounded-full transition hover:opacity-90 border-none"
            style={{ background: acento }}
          >
            Login
          </button>
        )}
      </div>

      {/* Hamburguesa mobile */}
      <button
        onClick={() => setOpen(!open)}
        aria-label="Menu"
        className="sm:hidden cursor-pointer border-none bg-transparent p-1"
      >
        <svg width="21" height="15" viewBox="0 0 21 15" fill="none">
          <rect width="21" height="1.5" rx=".75" fill="#426287" />
          <rect x="8" y="6" width="13" height="1.5" rx=".75" fill="#426287" />
          <rect x="6" y="13" width="15" height="1.5" rx=".75" fill="#426287" />
        </svg>
      </button>

      {/* Mobile Menu */}
      <div
        className={`${open ? 'flex' : 'hidden'} absolute top-[60px] left-0 w-full bg-white shadow-md py-4 flex-col items-start gap-2 px-5 text-sm sm:hidden`}
      >
        {links.map((l) => (
          <button
            key={l.label}
            onClick={() => handleLink(l)}
            className="block text-black w-full text-left py-1.5 border-none bg-transparent cursor-pointer"
          >
            {l.label}
          </button>
        ))}
        {cliente ? (
          <>
            <button
              onClick={() => { navigate(`/${tienda.slug}/mi-cuenta`); setOpen(false); }}
              className="block text-black w-full text-left py-1.5 border-none bg-transparent cursor-pointer"
            >
              Mi cuenta
            </button>
            <button
              onClick={() => { logout(); setOpen(false); }}
              className="cursor-pointer px-6 py-2 mt-2 rounded-full text-sm border bg-transparent"
              style={{ borderColor: acento, color: acento }}
            >
              Cerrar sesión ({cliente.nombre})
            </button>
          </>
        ) : (
          <button
            onClick={() => { navigate(`/${tienda.slug}/cuenta`); setOpen(false); }}
            className="cursor-pointer px-6 py-2 mt-2 text-white rounded-full text-sm border-none"
            style={{ background: acento }}
          >
            Login
          </button>
        )}
      </div>
    </nav>
  );
}
