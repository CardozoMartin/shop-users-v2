import { useState, useEffect, useRef } from 'react';
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

// Navbar BOUTIQUE (estilo tienda de indumentaria "editorial", tipo MACOWENS):
// dos filas centradas sobre fondo blanco. Fila superior con links utilitarios a
// la izquierda, NOMBRE de la tienda en serif centrado, y buscador + cuenta +
// carrito a la derecha. Fila inferior con las categorías centradas.
export default function NavbarBoutique({ tienda, cartCount, acento, onCartClick, onScrollTo }: Props) {
  const [open, setOpen] = useState(false);
  const { cliente, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const bp = basePathTienda(tienda.slug);
  const home = bp || '/';
  const enHome = location.pathname === home || location.pathname === `${bp}/`;

  // Publica la altura real del nav (dos filas) para posicionar el mega-menú de categorías.
  const navRef = useRef<HTMLElement>(null);
  useEffect(() => {
    const el = navRef.current;
    if (!el) return;
    const actualizar = () => el.style.setProperty('--nav-bottom', `${el.offsetHeight}px`);
    actualizar();
    const ro = new ResizeObserver(actualizar);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const TXT = '#111111';
  const SOFT = 'rgba(0,0,0,0.55)';
  const BORDER = 'rgba(0,0,0,0.12)';

  // Ofertas activas → links extra en la fila de categorías.
  const { data: promos = [] } = usePromocionesNav(tienda.id);

  const irAInicio = () => {
    setOpen(false);
    if (enHome) onScrollTo('inicio');
    else navigate(home);
  };

  // Links de la fila inferior (además del mega-menú de categorías).
  const links = [
    ...promos.map((p) => ({ label: p.nombre, to: `${bp}/ofertas/${p.slug}` })),
    { label: 'Nosotros', to: `${bp}/nosotros` },
  ];

  return (
    <nav ref={navRef} className="sticky top-0 z-50 bg-white border-b" style={{ borderColor: BORDER }}>
      {/* ── FILA SUPERIOR ── */}
      <div className="relative flex items-center justify-between px-6 md:px-12 py-4">
        {/* Izquierda: links utilitarios (desktop) / hamburguesa (mobile) */}
        <div className="flex items-center gap-6">
          <button
            onClick={() => setOpen(!open)}
            aria-label="Menu"
            className="md:hidden cursor-pointer border-none bg-transparent p-1"
            style={{ color: TXT }}
          >
            <svg width="22" height="16" viewBox="0 0 21 15" fill="none">
              <rect width="21" height="1.5" rx=".75" fill="currentColor" />
              <rect x="4" y="6" width="17" height="1.5" rx=".75" fill="currentColor" />
              <rect x="8" y="13" width="13" height="1.5" rx=".75" fill="currentColor" />
            </svg>
          </button>

          <button
            onClick={() => navigate(`${bp}/nosotros`)}
            className="hidden md:flex items-center gap-1.5 cursor-pointer border-none bg-transparent text-xs font-medium uppercase tracking-wide transition-colors hover:opacity-60"
            style={{ color: TXT }}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
              <path d="M12 21s-7-5.686-7-11a7 7 0 1114 0c0 5.314-7 11-7 11z" stroke="currentColor" strokeWidth="1.6" />
              <circle cx="12" cy="10" r="2.4" stroke="currentColor" strokeWidth="1.6" />
            </svg>
            Locales
          </button>

          <button
            onClick={() => navigate(`${bp}/nosotros`)}
            className="hidden lg:flex items-center gap-1.5 cursor-pointer border-none bg-transparent text-xs font-medium uppercase tracking-wide transition-colors hover:opacity-60"
            style={{ color: TXT }}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
              <rect x="2.5" y="5.5" width="19" height="13" rx="2" stroke="currentColor" strokeWidth="1.6" />
              <path d="M2.5 9.5h19" stroke="currentColor" strokeWidth="1.6" />
            </svg>
            Promociones bancarias
          </button>
        </div>

        {/* Centro: NOMBRE de la tienda (serif) */}
        <button
          onClick={irAInicio}
          className="absolute left-1/2 -translate-x-1/2 cursor-pointer border-none bg-transparent p-0"
        >
          <span
            className="s-display text-2xl md:text-3xl font-semibold tracking-[0.15em] uppercase whitespace-nowrap"
            style={{ color: TXT, fontFamily: 'Georgia, "Times New Roman", serif' }}
          >
            {tienda.nombre}
          </span>
        </button>

        {/* Derecha: buscador + cuenta + carrito */}
        <div className="flex items-center gap-4 md:gap-5">
          <div
            className="hidden md:flex items-center gap-2 border rounded-full px-3 py-1.5"
            style={{ borderColor: BORDER }}
          >
            <input
              type="text"
              placeholder="¿Qué estás buscando?"
              className="w-40 lg:w-52 bg-transparent outline-none text-sm"
              style={{ color: TXT }}
            />
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M10.836 10.615 15 14.695" stroke={SOFT} strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
              <path clipRule="evenodd" d="M9.141 11.738c2.729-1.136 4.001-4.224 2.841-6.898S7.67.921 4.942 2.057C2.211 3.193.94 6.281 2.1 8.955s4.312 3.92 7.041 2.783" stroke={SOFT} strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>

          {/* Cuenta */}
          {cliente ? (
            <button
              onClick={() => navigate(`${bp}/mi-cuenta`)}
              aria-label="Mi cuenta"
              className="cursor-pointer border-none bg-transparent p-0"
              title={`Hola, ${cliente.nombre}`}
            >
              <span
                className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-semibold"
                style={{ background: acento }}
              >
                {cliente.nombre.charAt(0).toUpperCase()}
              </span>
            </button>
          ) : (
            <button
              onClick={() => navigate(`${bp}/cuenta`)}
              aria-label="Iniciar sesión"
              className="cursor-pointer border-none bg-transparent p-0 transition-colors hover:opacity-60"
              style={{ color: TXT }}
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="8" r="3.4" stroke="currentColor" strokeWidth="1.6" />
                <path d="M5 20c0-3.314 3.134-6 7-6s7 2.686 7 6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
              </svg>
            </button>
          )}

          {/* Carrito */}
          <button
            onClick={onCartClick}
            aria-label="Carrito"
            className="relative cursor-pointer border-none bg-transparent p-0 transition-colors hover:opacity-60"
            style={{ color: TXT }}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <path d="M6 8h12l-1 11a2 2 0 01-2 1.8H9a2 2 0 01-2-1.8L6 8z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
              <path d="M9 8V6.5a3 3 0 016 0V8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
            </svg>
            {cartCount > 0 && (
              <span
                className="absolute -top-1.5 -right-2 text-white rounded-full flex items-center justify-center font-bold"
                style={{ background: acento, fontSize: 10, width: 17, height: 17 }}
              >
                {cartCount > 9 ? '9+' : cartCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* ── FILA INFERIOR: categorías centradas (desktop) ── */}
      <div className="hidden md:flex items-center justify-center gap-8 pb-3 -mt-1">
        <CategoriasMenu
          tiendaId={tienda.id}
          tiendaSlug={tienda.slug}
          basePath={bp}
          acento={acento}
          label="Productos"
          colorTexto={TXT}
        />
        {links.map((l) => (
          <button
            key={l.label}
            onClick={() => navigate(l.to)}
            className="cursor-pointer border-none bg-transparent text-sm font-medium uppercase tracking-wide transition-colors hover:opacity-60"
            style={{ color: TXT }}
          >
            {l.label}
          </button>
        ))}
      </div>

      {/* ── Menú mobile ── */}
      <div
        className={`${open ? 'flex' : 'hidden'} md:hidden flex-col items-start gap-2 px-6 pb-4 border-t`}
        style={{ borderColor: BORDER }}
      >
        <div className="w-full pt-3">
          <CategoriasMobile
            tiendaId={tienda.id}
            basePath={bp}
            label="Productos"
            onNavigate={() => setOpen(false)}
            colorTexto={TXT}
            colorSuave={SOFT}
          />
        </div>
        {links.map((l) => (
          <button
            key={l.label}
            onClick={() => { navigate(l.to); setOpen(false); }}
            className="block w-full text-left py-1.5 border-none bg-transparent cursor-pointer text-sm uppercase font-medium tracking-wide"
            style={{ color: TXT }}
          >
            {l.label}
          </button>
        ))}
        {cliente ? (
          <button
            onClick={() => { logout(); setOpen(false); }}
            className="s-btn mt-2 px-6 py-2 text-sm border bg-transparent cursor-pointer"
            style={{ borderColor: acento, color: acento }}
          >
            Cerrar sesión ({cliente.nombre})
          </button>
        ) : (
          <button
            onClick={() => { navigate(`${bp}/cuenta`); setOpen(false); }}
            className="s-btn mt-2 px-6 py-2 text-sm text-white border-none cursor-pointer"
            style={{ background: acento }}
          >
            Ingresar
          </button>
        )}
      </div>
    </nav>
  );
}
