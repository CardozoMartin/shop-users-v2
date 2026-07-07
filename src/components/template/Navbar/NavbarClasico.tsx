import { useState, useEffect } from 'react';
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

// Paleta del diseño "denim/tejano" (fondo tinta, acento dorado "rivet").
const INK = '#000000';
const RIVET = '#C7912B';

// Navbar CLÁSICO (estilo denim/tejano): fondo tinta, links en mayúscula con hover
// dorado, divisor "costura" con remaches. El comportamiento (fija/transparente/
// flotante) lo controla navbarStyle.
export default function NavbarClasico({ tienda, cartCount, acento, onCartClick, onScrollTo }: Props) {
  // El acento dorado del diseño; si la tienda define uno propio, se respeta.
  const rivet = acento || RIVET;
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { cliente, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const bp = basePathTienda(tienda.slug);

  // Esquema de color del navbar (configurable desde el panel).
  // CLARO → fondo blanco + letras negras · OSCURO (default) → fondo tinta + letras blancas.
  const esClaro = tienda.temaConfig?.navbarColorTema === 'CLARO';
  const c = {
    bg: esClaro ? '#ffffff' : INK,
    txt: esClaro ? INK : '#ffffff',
    // Tono translúcido para bordes/placeholder/textos secundarios.
    soft: esClaro ? 'rgba(0,0,0,0.55)' : 'rgba(255,255,255,0.6)',
    border: esClaro ? 'rgba(0,0,0,0.15)' : 'rgba(255,255,255,0.25)',
    seam: esClaro ? 'rgba(0,0,0,0.18)' : 'rgba(255,255,255,0.22)',
  };

  const navStyle = tienda.temaConfig?.navbarStyle ?? 'STICKY';

  useEffect(() => {
    if (navStyle !== 'TRANSPARENT') return;
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [navStyle]);

  const navClase = (() => {
    const base = 'flex items-center justify-between py-4 z-50 transition-all';
    const padding = 'px-6 md:px-16 lg:px-24 xl:px-32';
    if (navStyle === 'FLOATING') {
      return `${base} px-6 md:px-10 sticky top-4 mx-3 md:mx-8 rounded-2xl backdrop-blur shadow-lg`;
    }
    if (navStyle === 'TRANSPARENT') {
      return `${base} ${padding} fixed top-0 left-0 right-0 ${
        scrolled ? 'backdrop-blur shadow-sm' : ''
      }`;
    }
    return `${base} ${padding} sticky top-0`;
  })();

  // Fondo según el tema (en TRANSPARENT sin scroll queda translúcido).
  const navBg =
    navStyle === 'TRANSPARENT' && !scrolled
      ? 'transparent'
      : navStyle === 'FLOATING'
        ? `${c.bg}e6`
        : c.bg;

  // Ofertas activas → aparecen como links en el navbar mientras la promo esté vigente.
  const { data: promos = [] } = usePromocionesNav(tienda.id);

  // "Productos" ahora es el mega-menú de categorías (CategoriasMenu), no un link plano.
  const links = [
    { label: 'Inicio', id: 'inicio', tipo: 'seccion' as const },
    ...promos.map((p) => ({ label: p.nombre, to: `${bp}/ofertas/${p.slug}`, tipo: 'ruta' as const })),
    { label: 'Nosotros', to: `${bp}/nosotros`, tipo: 'ruta' as const },
  ];

  const home = bp || '/';
  const enHome = location.pathname === home || location.pathname === `${bp}/`;

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
    <nav className={`relative ${navClase}`} style={{ background: navBg }}>
      {/* Divisor "costura": línea punteada con remaches dorados (la firma del diseño). */}
      <span
        aria-hidden
        className="pointer-events-none absolute bottom-0 left-0 right-0"
        style={{ borderBottom: `2px dashed ${c.seam}` }}
      >
        <span className="absolute -bottom-[3px] left-0 w-2 h-2 rounded-full" style={{ background: rivet }} />
        <span className="absolute -bottom-[3px] right-0 w-2 h-2 rounded-full" style={{ background: rivet }} />
      </span>

      {/* ── IZQUIERDA: (hamburguesa en mobile) + logo + links de navegación juntos ── */}
      <div className="flex items-center gap-3 sm:gap-8">
        {/* Hamburguesa mobile (a la izquierda del logo, estilo denim) */}
        <button
          onClick={() => setOpen(!open)}
          aria-label="Menu"
          className="sm:hidden cursor-pointer border-none bg-transparent p-1 flex-shrink-0"
          style={{ color: c.txt }}
        >
          <svg width="22" height="16" viewBox="0 0 21 15" fill="none">
            <rect width="21" height="1.5" rx=".75" fill="currentColor" />
            <rect x="4" y="6" width="17" height="1.5" rx=".75" fill="currentColor" />
            <rect x="8" y="13" width="13" height="1.5" rx=".75" fill="currentColor" />
          </svg>
        </button>

        {/* Logo / nombre */}
        <button
          onClick={() => handleLink(links[0])}
          className="cursor-pointer border-none bg-transparent p-0 flex-shrink-0"
        >
          {tienda.logoUrl ? (
            <img src={tienda.logoUrl} alt={tienda.nombre} className="h-9 w-auto object-contain" />
          ) : (
            <span className="s-display text-xl sm:text-2xl font-extrabold tracking-tight uppercase" style={{ color: c.txt }}>
              {tienda.nombre}
            </span>
          )}
        </button>

        {/* Links de navegación (pegados al logo) */}
        <div className="hidden sm:flex items-center gap-8">
          <button
            onClick={() => handleLink(links[0])}
            className="cursor-pointer border-none bg-transparent transition-colors text-sm font-semibold uppercase tracking-wide"
            style={{ color: c.txt }}
            onMouseEnter={(e) => (e.currentTarget.style.color = rivet)}
            onMouseLeave={(e) => (e.currentTarget.style.color = c.txt)}
          >
            {links[0].label}
          </button>

          {/* Mega-menú de categorías (reemplaza el viejo link "Productos") */}
          <CategoriasMenu tiendaId={tienda.id} tiendaSlug={tienda.slug} basePath={bp} acento={acento} label="Productos" colorTexto={c.txt} />

          {links.slice(1).map((l) => (
            <button
              key={l.label}
              onClick={() => handleLink(l)}
              className="cursor-pointer border-none bg-transparent transition-colors text-sm font-semibold uppercase tracking-wide"
              style={{ color: c.txt }}
              onMouseEnter={(e) => (e.currentTarget.style.color = rivet)}
              onMouseLeave={(e) => (e.currentTarget.style.color = c.txt)}
            >
              {l.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── DERECHA: buscador + carrito + login agrupados ── */}
      <div className="hidden sm:flex items-center gap-6">
        {/* Buscador */}
        <div className="hidden lg:flex items-center text-sm gap-2 border px-3 rounded-full" style={{ borderColor: c.border }}>
          <input
            className="py-1.5 w-full bg-transparent outline-none"
            style={{ color: c.txt }}
            type="text"
            placeholder="Buscar productos"
          />
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M10.836 10.615 15 14.695" stroke={c.soft} strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
            <path clipRule="evenodd" d="M9.141 11.738c2.729-1.136 4.001-4.224 2.841-6.898S7.67.921 4.942 2.057C2.211 3.193.94 6.281 2.1 8.955s4.312 3.92 7.041 2.783" stroke={c.soft} strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>

        {/* Carrito */}
        <button
          onClick={onCartClick}
          className="relative cursor-pointer border-none bg-transparent p-0 transition-colors"
          style={{ color: c.txt }}
          onMouseEnter={(e) => (e.currentTarget.style.color = rivet)}
          onMouseLeave={(e) => (e.currentTarget.style.color = c.txt)}
        >
          <svg width="18" height="18" viewBox="0 0 14 14" fill="none">
            <path d="M.583.583h2.333l1.564 7.81a1.17 1.17 0 0 0 1.166.94h5.67a1.17 1.17 0 0 0 1.167-.94l.933-4.893H3.5m2.333 8.75a.583.583 0 1 1-1.167 0 .583.583 0 0 1 1.167 0m6.417 0a.583.583 0 1 1-1.167 0 .583.583 0 0 1 1.167 0" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          {cartCount > 0 && (
            <span
              className="absolute -top-2 -right-3 text-xs text-white w-[18px] h-[18px] rounded-full flex items-center justify-center font-bold"
              style={{ background: rivet, fontSize: 10 }}
            >
              {cartCount > 9 ? '9+' : cartCount}
            </span>
          )}
        </button>

        {/* Login / cuenta */}
        {cliente ? (
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(`${bp}/mi-cuenta`)}
              className="flex items-center gap-2 text-sm border-none bg-transparent cursor-pointer transition-colors"
              style={{ color: c.txt }}
              onMouseEnter={(e) => (e.currentTarget.style.color = rivet)}
              onMouseLeave={(e) => (e.currentTarget.style.color = c.txt)}
            >
              <span className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-semibold" style={{ background: rivet }}>
                {cliente.nombre.charAt(0).toUpperCase()}
              </span>
              <span className="hidden lg:inline">Hola, {cliente.nombre}</span>
            </button>
            <button
              onClick={logout}
              className="text-xs border-none bg-transparent cursor-pointer transition-colors"
              style={{ color: c.soft }}
              onMouseEnter={(e) => (e.currentTarget.style.color = c.txt)}
              onMouseLeave={(e) => (e.currentTarget.style.color = c.soft)}
              title="Cerrar sesión"
            >
              Salir
            </button>
          </div>
        ) : (
          <button
            onClick={() => navigate(`${bp}/cuenta`)}
            className="s-btn cursor-pointer px-7 py-2 text-white transition hover:opacity-90 border-none text-sm font-bold uppercase tracking-wide"
            style={{ background: rivet }}
          >
            Login
          </button>
        )}
      </div>

      {/* ── DERECHA (mobile): buscar + carrito ── */}
      <div className="flex sm:hidden items-center gap-4">
        {/* Buscar (icono) */}
        <button
          aria-label="Buscar"
          className="cursor-pointer border-none bg-transparent p-0"
          style={{ color: c.txt }}
        >
          <svg width="20" height="20" viewBox="0 0 16 16" fill="none">
            <path d="M10.836 10.615 15 14.695" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
            <path clipRule="evenodd" d="M9.141 11.738c2.729-1.136 4.001-4.224 2.841-6.898S7.67.921 4.942 2.057C2.211 3.193.94 6.281 2.1 8.955s4.312 3.92 7.041 2.783" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>

        {/* Carrito */}
        <button
          onClick={onCartClick}
          className="relative cursor-pointer border-none bg-transparent p-0"
          style={{ color: c.txt }}
          aria-label="Carrito"
        >
          <svg width="20" height="20" viewBox="0 0 14 14" fill="none">
            <path d="M.583.583h2.333l1.564 7.81a1.17 1.17 0 0 0 1.166.94h5.67a1.17 1.17 0 0 0 1.167-.94l.933-4.893H3.5m2.333 8.75a.583.583 0 1 1-1.167 0 .583.583 0 0 1 1.167 0m6.417 0a.583.583 0 1 1-1.167 0 .583.583 0 0 1 1.167 0" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          {cartCount > 0 && (
            <span
              className="absolute -top-2 -right-2.5 text-xs text-white w-[18px] h-[18px] rounded-full flex items-center justify-center font-bold"
              style={{ background: rivet, fontSize: 10 }}
            >
              {cartCount > 9 ? '9+' : cartCount}
            </span>
          )}
        </button>
      </div>

      {/* Mobile Menu */}
      <div
        className={`${open ? 'flex' : 'hidden'} absolute top-[60px] left-0 w-full shadow-md py-4 flex-col items-start gap-2 px-5 text-sm uppercase font-semibold tracking-wide sm:hidden`}
        style={{ background: c.bg }}
      >
        <button
          onClick={() => handleLink(links[0])}
          className="block w-full text-left py-1.5 border-none bg-transparent cursor-pointer"
          style={{ color: c.txt }}
        >
          {links[0].label}
        </button>

        <CategoriasMobile tiendaId={tienda.id} basePath={bp} label="Productos" onNavigate={() => setOpen(false)} colorTexto={c.txt} colorSuave={c.soft} />

        {links.slice(1).map((l) => (
          <button
            key={l.label}
            onClick={() => handleLink(l)}
            className="block w-full text-left py-1.5 border-none bg-transparent cursor-pointer"
            style={{ color: c.txt }}
          >
            {l.label}
          </button>
        ))}
        {cliente ? (
          <>
            <button
              onClick={() => { navigate(`${bp}/mi-cuenta`); setOpen(false); }}
              className="block w-full text-left py-1.5 border-none bg-transparent cursor-pointer"
              style={{ color: c.txt }}
            >
              Mi cuenta
            </button>
            <button
              onClick={() => { logout(); setOpen(false); }}
              className="s-btn cursor-pointer px-6 py-2 mt-2 text-sm border bg-transparent"
              style={{ borderColor: acento, color: acento }}
            >
              Cerrar sesión ({cliente.nombre})
            </button>
          </>
        ) : (
          <button
            onClick={() => { navigate(`${bp}/cuenta`); setOpen(false); }}
            className="s-btn cursor-pointer px-6 py-2 mt-2 text-white text-sm border-none"
            style={{ background: acento }}
          >
            Login
          </button>
        )}
      </div>
    </nav>
  );
}
