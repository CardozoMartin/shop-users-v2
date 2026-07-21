import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import type { Tienda } from '../../../types';
import { useAuthStore } from '../../../store/auth';
import { basePathTienda } from '../../../utils/dominio';
import { usePromocionesNav } from '../../../hooks/useTienda';
import CategoriasMenu, { CategoriasMobile } from './CategoriasMenu';

interface Props {
  tienda: Tienda;
  cartCount: number;
  acento: string;
  onCartClick: () => void;
  onScrollTo: (id: string) => void;
}

// Paleta del diseño "Brasília" (inspirado en Tiendanube): barra superior tinta,
// franja de acento lima, header blanco con logo serif y buscador inline.
const DARK = '#2b2926';

// Navbar BRASÍLIA: dos utility bars arriba (cupón + envío gratis), header blanco
// con logo serif + buscador + cuenta/carrito, y nav inferior con categorías.
export default function NavbarBrasilia({ tienda, cartCount, acento, onCartClick, onScrollTo }: Props) {
  const [open, setOpen] = useState(false);
  const { cliente } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const bp = basePathTienda(tienda.slug);
  const home = bp || '/';
  const enHome = location.pathname === home || location.pathname === `${bp}/`;

  const { data: promos = [] } = usePromocionesNav(tienda.id);

  const links = [
    { label: 'Inicio', id: 'inicio', tipo: 'seccion' as const },
    ...promos.map((p) => ({ label: p.nombre, to: `${bp}/ofertas/${p.slug}`, tipo: 'ruta' as const })),
    { label: 'Nosotros', to: `${bp}/nosotros`, tipo: 'ruta' as const },
  ];

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
    <div>
      {/* Utility bars */}
      <div className="text-white text-[11px] sm:text-xs text-center py-2 px-4 tracking-wide" style={{ background: DARK }}>
        {tienda.temaConfig?.heroSubtitulo || 'Envíos a todo el país'}
      </div>
      <div className="text-[11px] sm:text-xs text-right py-2 px-4 font-medium" style={{ background: acento, color: DARK }}>
        {tienda.temaConfig?.heroCtaTexto || 'Comprá ahora'}
      </div>

      <header className="border-b border-gray-200 bg-white sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center gap-4 sm:gap-8">
          {/* Hamburguesa mobile */}
          <button
            onClick={() => setOpen(!open)}
            aria-label="Menu"
            className="sm:hidden cursor-pointer border-none bg-transparent p-1 flex-shrink-0"
            style={{ color: DARK }}
          >
            <svg width="22" height="16" viewBox="0 0 21 15" fill="none">
              <rect width="21" height="1.5" rx=".75" fill="currentColor" />
              <rect x="4" y="6" width="17" height="1.5" rx=".75" fill="currentColor" />
              <rect x="8" y="13" width="13" height="1.5" rx=".75" fill="currentColor" />
            </svg>
          </button>

          {/* Logo */}
          <button
            onClick={() => handleLink(links[0])}
            className="shrink-0 select-none cursor-pointer border-none bg-transparent p-0"
          >
            {tienda.logoUrl ? (
              <img src={tienda.logoUrl} alt={tienda.nombre} className="h-9 w-auto object-contain" />
            ) : (
              <span className="s-display text-2xl sm:text-3xl font-medium tracking-[0.12em]" style={{ color: DARK }}>
                {tienda.nombre}
              </span>
            )}
          </button>

          {/* Buscador */}
          <div className="hidden sm:flex flex-1 max-w-xl">
            <div className="flex w-full">
              <input
                type="text"
                placeholder="¿Qué estás buscando?"
                className="w-full border border-gray-300 rounded-l-md px-4 py-2.5 text-sm focus:outline-none"
                style={{ color: DARK }}
              />
              <button
                aria-label="Buscar"
                className="bg-gray-100 border border-l-0 border-gray-300 rounded-r-md px-4 hover:bg-gray-200 transition cursor-pointer"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="text-gray-600">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 104.5 4.5a7.5 7.5 0 0012.15 12.15z" />
                </svg>
              </button>
            </div>
          </div>

          {/* Cuenta + carrito */}
          <div className="flex items-center gap-4 sm:gap-6 ml-auto text-sm">
            {cliente ? (
              <button
                onClick={() => navigate(`${bp}/mi-cuenta`)}
                className="flex items-center gap-2 hover:opacity-70 transition cursor-pointer border-none bg-transparent p-0"
                style={{ color: DARK }}
              >
                <span className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-semibold" style={{ background: acento, color: DARK }}>
                  {cliente.nombre.charAt(0).toUpperCase()}
                </span>
                <span className="hidden sm:block leading-tight text-left">
                  <span className="block text-gray-500 text-xs">Hola,</span>
                  <span className="block font-semibold">{cliente.nombre}</span>
                </span>
              </button>
            ) : (
              <button
                onClick={() => navigate(`${bp}/cuenta`)}
                className="flex items-center gap-2 hover:opacity-70 transition cursor-pointer border-none bg-transparent p-0"
                style={{ color: DARK }}
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                </svg>
                <span className="hidden sm:block leading-tight text-left">
                  <span className="block text-gray-500 text-xs">Entrá /</span>
                  <span className="block font-semibold">Registrate</span>
                </span>
              </button>
            )}

            <button
              onClick={onCartClick}
              className="relative flex items-center gap-2 hover:opacity-70 transition cursor-pointer border-none bg-transparent p-0"
              style={{ color: DARK }}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m-2.25 0h12l1 11.25H4.5L5.5 10.5z" />
              </svg>
              {cartCount > 0 && (
                <span
                  className="absolute -top-2 -right-2 text-xs text-white w-[18px] h-[18px] rounded-full flex items-center justify-center font-bold"
                  style={{ background: acento, color: DARK, fontSize: 10 }}
                >
                  {cartCount > 9 ? '9+' : cartCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Mobile search */}
        <div className="sm:hidden px-4 pb-3">
          <div className="flex">
            <input
              type="text"
              placeholder="¿Qué estás buscando?"
              className="w-full border border-gray-300 rounded-l-md px-4 py-2.5 text-sm focus:outline-none"
            />
            <button className="bg-gray-100 border border-l-0 border-gray-300 rounded-r-md px-4 cursor-pointer" aria-label="Buscar">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="text-gray-600">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 104.5 4.5a7.5 7.5 0 0012.15 12.15z" />
              </svg>
            </button>
          </div>
        </div>

        {/* Nav inferior */}
        <nav className="border-t border-gray-100 hidden sm:block">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center gap-6 sm:gap-8 py-3 text-[13px] sm:text-sm overflow-x-auto">
            <CategoriasMenu tiendaId={tienda.id} tiendaSlug={tienda.slug} basePath={bp} acento={acento} label="CATEGORÍAS" colorTexto={DARK} />
            {links.map((l) => (
              <button
                key={l.label}
                onClick={() => handleLink(l)}
                className="whitespace-nowrap hover:opacity-60 transition cursor-pointer border-none bg-transparent p-0 font-medium"
                style={{ color: DARK }}
              >
                {l.label.toUpperCase()}
              </button>
            ))}
          </div>
        </nav>
      </header>

      {/* Mobile menu */}
      <div
        className={`${open ? 'flex' : 'hidden'} sm:hidden flex-col items-start gap-1 px-5 py-4 text-sm font-medium bg-white border-b border-gray-100`}
      >
        <CategoriasMobile tiendaId={tienda.id} basePath={bp} label="Categorías" onNavigate={() => setOpen(false)} colorTexto={DARK} colorSuave="rgba(0,0,0,0.5)" />
        {links.map((l) => (
          <button
            key={l.label}
            onClick={() => handleLink(l)}
            className="block w-full text-left py-1.5 border-none bg-transparent cursor-pointer"
            style={{ color: DARK }}
          >
            {l.label}
          </button>
        ))}
      </div>
    </div>
  );
}
