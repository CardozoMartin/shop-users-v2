import { useMemo, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCategorias } from '../../../hooks/useTienda';
import type { Categoria } from '../../../types';

interface Props {
  tiendaId: number;
  tiendaSlug: string;
  basePath: string;
  acento: string;
  label?: string;
  /** Color del texto del trigger (según tema del navbar). Default blanco. */
  colorTexto?: string;
}

// Nodo del árbol con hijos recursivos (N niveles).
interface Nodo extends Categoria {
  hijos: Nodo[];
}

// Arma el árbol recursivo (N niveles) a partir de la lista plana (cada Categoria trae padreId).
function construirArbol(cats: Categoria[]): Nodo[] {
  const byId = new Map<number, Nodo>();
  for (const c of cats) byId.set(c.id, { ...c, hijos: [] });
  const raices: Nodo[] = [];
  for (const n of byId.values()) {
    if (n.padreId != null && byId.has(n.padreId)) {
      byId.get(n.padreId)!.hijos.push(n);
    } else {
      raices.push(n);
    }
  }
  return raices;
}

// Devuelve el nivel superior a mostrar en el menú. Si hay una única raíz (ej. "Indumentaria")
// y esa raíz tiene hijos, saltamos la raíz y usamos sus hijos (los géneros) como nivel superior.
// Así el menú arranca en Mujer/Hombre/… en vez de "Indumentaria".
function nivelSuperior(arbol: Nodo[]): Nodo[] {
  if (arbol.length === 1 && arbol[0].hijos.length > 0) return arbol[0].hijos;
  return arbol;
}

// ─── Mobile: acordeón de N niveles dentro del menú hamburguesa ───
export function CategoriasMobile({ tiendaId, basePath, label = 'Productos', onNavigate, colorTexto = '#fff', colorSuave = 'rgba(255,255,255,0.65)' }: {
  tiendaId: number;
  basePath: string;
  label?: string;
  onNavigate?: () => void;
  colorTexto?: string;
  colorSuave?: string;
}) {
  const navigate = useNavigate();
  const [expandido, setExpandido] = useState(false);
  const { data: cats = [] } = useCategorias(tiendaId);
  const arbol = useMemo(() => nivelSuperior(construirArbol(cats)), [cats]);

  const irA = (categoriaId?: number) => {
    onNavigate?.();
    const qs = categoriaId != null ? `?categoria=${categoriaId}` : '';
    navigate(`${basePath}/productos${qs}`);
  };

  if (arbol.length === 0) {
    return (
      <button onClick={() => irA(undefined)} className="block w-full text-left py-1.5 border-none bg-transparent cursor-pointer" style={{ color: colorTexto }}>
        {label}
      </button>
    );
  }

  return (
    <div className="w-full">
      <button
        onClick={() => setExpandido((v) => !v)}
        className="flex items-center justify-between w-full text-left py-1.5 border-none bg-transparent cursor-pointer"
        style={{ color: colorTexto }}
      >
        {label}
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className={`transition-transform ${expandido ? 'rotate-180' : ''}`}>
          <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      {expandido && (
        <div className="pl-3 border-l ml-1 mt-1 space-y-1 pb-2" style={{ borderColor: colorSuave }}>
          {arbol.map((nivel1) => (
            <NodoMobile key={nivel1.id} nodo={nivel1} nivel={0} irA={irA} colorTexto={colorTexto} colorSuave={colorSuave} />
          ))}
        </div>
      )}
    </div>
  );
}

// Recursivo: cada nodo con hijos es un acordeón; las hojas son links directos.
function NodoMobile({ nodo, nivel, irA, colorTexto, colorSuave }: { nodo: Nodo; nivel: number; irA: (id?: number) => void; colorTexto: string; colorSuave: string }) {
  const [abierto, setAbierto] = useState(false);
  const tieneHijos = nodo.hijos.length > 0;

  if (!tieneHijos) {
    return (
      <button
        onClick={() => irA(nodo.id)}
        className="block text-left w-full py-1 text-sm border-none bg-transparent cursor-pointer"
        style={{ paddingLeft: nivel * 12, color: colorSuave }}
      >
        {nodo.nombre}
      </button>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between" style={{ paddingLeft: nivel * 12 }}>
        <button
          onClick={() => irA(nodo.id)}
          className={`block text-left py-1 text-sm border-none bg-transparent cursor-pointer ${nivel === 0 ? 'font-semibold' : ''}`}
          style={{ color: nivel === 0 ? colorTexto : colorSuave }}
        >
          {nodo.nombre}
        </button>
        <button onClick={() => setAbierto((v) => !v)} className="p-1 border-none bg-transparent cursor-pointer" style={{ color: colorTexto }}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" className={`transition-transform ${abierto ? 'rotate-180' : ''}`}>
            <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>
      {abierto && (
        <div className="space-y-0.5">
          {nodo.hijos.map((h) => (
            <NodoMobile key={h.id} nodo={h} nivel={nivel + 1} irA={irA} colorTexto={colorTexto} colorSuave={colorSuave} />
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Desktop: mega-menú con TABS del nivel superior (géneros) + columnas de categorías ───
export default function CategoriasMenu({ tiendaId, basePath, label = 'Productos', acento, colorTexto = '#fff' }: Props) {
  const navigate = useNavigate();
  const rivet = acento || '#C7912B';
  const [open, setOpen] = useState(false);
  const [tabActiva, setTabActiva] = useState(0);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { data: cats = [] } = useCategorias(tiendaId);
  const nivel1 = useMemo(() => nivelSuperior(construirArbol(cats)), [cats]);

  if (nivel1.length === 0) return null;

  const irA = (categoriaId?: number) => {
    setOpen(false);
    const qs = categoriaId != null ? `?categoria=${categoriaId}` : '';
    navigate(`${basePath}/productos${qs}`);
  };

  const abrir = () => { if (closeTimer.current) clearTimeout(closeTimer.current); setOpen(true); };
  const cerrarConDelay = () => { closeTimer.current = setTimeout(() => setOpen(false), 150); };

  const activo = nivel1[Math.min(tabActiva, nivel1.length - 1)];
  // Categorías del nivel superior activo (nivel 2); cada una con sus tipos (nivel 3).
  const columnas = activo?.hijos ?? [];

  return (
    <div className="relative" onMouseEnter={abrir} onMouseLeave={cerrarConDelay}>
      <button
        onClick={() => (open ? irA(undefined) : setOpen(true))}
        className="flex items-center gap-1 cursor-pointer border-none bg-transparent transition-colors text-sm font-semibold uppercase tracking-wide"
        style={{ color: open ? rivet : colorTexto }}
        onMouseEnter={(e) => (e.currentTarget.style.color = rivet)}
        onMouseLeave={(e) => (e.currentTarget.style.color = open ? rivet : colorTexto)}
        aria-expanded={open}
      >
        {label}
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" className={`transition-transform ${open ? 'rotate-180' : ''}`}>
          <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {open && (
        <div
          className="fixed left-0 right-0 bg-white shadow-xl border-t border-gray-100 z-50"
          style={{ top: 'var(--nav-bottom, 64px)' }}
          onMouseEnter={abrir}
          onMouseLeave={cerrarConDelay}
        >
          <div className="max-w-screen-xl mx-auto px-6 md:px-12 py-6">
            {/* Tabs del nivel superior (géneros / rubros de primer nivel) */}
            <div className="flex items-center gap-1 border-b border-gray-100 mb-6 overflow-x-auto">
              {nivel1.map((n, i) => (
                <button
                  key={n.id}
                  onMouseEnter={() => setTabActiva(i)}
                  onClick={() => irA(n.id)}
                  className="relative px-4 py-2 text-sm font-medium whitespace-nowrap cursor-pointer border-none bg-transparent transition-colors"
                  style={{ color: i === tabActiva ? '#111' : '#6b7280' }}
                >
                  {n.nombre}
                  {i === tabActiva && (
                    <span className="absolute left-3 right-3 -bottom-px h-0.5 bg-gray-900 rounded-full" />
                  )}
                </button>
              ))}
            </div>

            {/* Columnas: cada categoría (nivel 2) del género activo, con sus tipos (nivel 3) */}
            {columnas.length === 0 ? (
              <button
                onClick={() => irA(activo?.id)}
                className="text-sm text-gray-500 hover:text-gray-900 cursor-pointer border-none bg-transparent"
              >
                Ver todo {activo?.nombre}
              </button>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-x-8 gap-y-6">
                {columnas.map((cat) => (
                  <div key={cat.id} className="min-w-0">
                    <button
                      onClick={() => irA(cat.id)}
                      className="block text-left text-sm font-semibold text-gray-900 mb-2 cursor-pointer border-none bg-transparent hover:opacity-70 transition-opacity"
                    >
                      {cat.nombre}
                    </button>
                    <ul className="space-y-1.5">
                      {cat.hijos.map((tipo) => (
                        <li key={tipo.id}>
                          <button
                            onClick={() => irA(tipo.id)}
                            className="text-left text-sm text-gray-500 cursor-pointer border-none bg-transparent transition-colors hover:text-gray-900"
                          >
                            {tipo.nombre}
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
