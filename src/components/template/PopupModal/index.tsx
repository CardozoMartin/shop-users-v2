import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getPopupActivo } from '../../../api/tienda';

interface Props {
  tiendaId: number;
  acento: string;
}

// Decide si el popup debe mostrarse según su frecuencia (usando storage)
function debeMostrar(popupId: number, frecuencia: string): boolean {
  const key = `popup_visto_${popupId}`;
  if (frecuencia === 'UNA_VEZ_SESION') {
    return sessionStorage.getItem(key) !== '1';
  }
  if (frecuencia === 'UNA_VEZ_DIA') {
    const hoy = new Date().toISOString().slice(0, 10);
    return localStorage.getItem(key) !== hoy;
  }
  return true; // SIEMPRE
}

function marcarVisto(popupId: number, frecuencia: string) {
  const key = `popup_visto_${popupId}`;
  if (frecuencia === 'UNA_VEZ_SESION') sessionStorage.setItem(key, '1');
  else if (frecuencia === 'UNA_VEZ_DIA') localStorage.setItem(key, new Date().toISOString().slice(0, 10));
}

export default function PopupModal({ tiendaId, acento }: Props) {
  const { data: popup } = useQuery({
    queryKey: ['popup', tiendaId],
    queryFn: () => getPopupActivo(tiendaId),
    enabled: !!tiendaId,
    staleTime: 1000 * 60 * 10,
  });

  const [abierto, setAbierto] = useState(false);
  const [copiado, setCopiado] = useState(false);

  useEffect(() => {
    if (!popup || !popup.activo) return;
    if (!debeMostrar(popup.id, popup.frecuencia)) return;

    const t = setTimeout(() => {
      setAbierto(true);
      marcarVisto(popup.id, popup.frecuencia);
    }, (popup.delay ?? 2) * 1000);

    return () => clearTimeout(t);
  }, [popup]);

  if (!popup || !abierto) return null;

  const bg = popup.colorFondo || '#ffffff';
  const esImagen = popup.tipo === 'IMAGEN_CTA' && popup.imagenUrl;

  const cerrar = () => setAbierto(false);

  const copiarCodigo = () => {
    if (!popup.codigoDesc) return;
    navigator.clipboard.writeText(popup.codigoDesc);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 1800);
  };

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(4px)' }}
      onClick={cerrar}
    >
      <div
        className="relative w-full max-w-xl rounded-2xl overflow-hidden shadow-2xl max-h-[90vh] overflow-y-auto"
        style={{ background: bg, animation: 'popupIn 300ms ease-out' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Botón cerrar */}
        <button
          onClick={cerrar}
          className="absolute top-3 right-3 z-10 w-8 h-8 rounded-full flex items-center justify-center cursor-pointer border-none"
          style={{ background: esImagen ? 'rgba(0,0,0,0.4)' : 'rgba(0,0,0,0.06)', color: esImagen ? '#fff' : '#555' }}
          aria-label="Cerrar"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Imagen (arriba o como fondo según tipo) */}
        {popup.imagenUrl && (
          <img
            src={popup.imagenUrl}
            alt={popup.titulo}
            className="w-full object-cover"
            style={{ maxHeight: esImagen ? 680 : 420 }}
          />
        )}

        {/* Contenido */}
        <div className="p-6 text-center">
          <h3 className="text-xl font-bold mb-2" style={{ color: '#1d293d', fontFamily: 'Poppins, sans-serif' }}>
            {popup.titulo}
          </h3>
          {popup.mensaje && (
            <p className="text-sm leading-relaxed mb-4" style={{ color: '#64748b' }}>{popup.mensaje}</p>
          )}

          {/* Código de descuento */}
          {popup.codigoDesc && (
            <div className="my-4">
              <button
                onClick={copiarCodigo}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 border-dashed cursor-pointer transition-all"
                style={{ borderColor: acento, background: `${acento}10` }}
              >
                <span className="font-mono font-bold text-base" style={{ color: acento }}>
                  {popup.codigoDesc}
                </span>
                <span className="text-xs font-semibold" style={{ color: copiado ? '#16a34a' : acento }}>
                  {copiado ? '✓ Copiado' : 'Copiar'}
                </span>
              </button>
              {popup.porcentajeDesc ? (
                <p className="text-xs mt-2" style={{ color: '#64748b' }}>{popup.porcentajeDesc}% de descuento</p>
              ) : null}
            </div>
          )}

          {/* CTA */}
          {popup.ctaTexto && (
            popup.ctaUrl ? (
              <a
                href={popup.ctaUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block w-full py-3 rounded-full text-sm font-semibold text-white"
                style={{ background: acento }}
              >
                {popup.ctaTexto}
              </a>
            ) : (
              <button
                onClick={cerrar}
                className="w-full py-3 rounded-full text-sm font-semibold text-white border-none cursor-pointer"
                style={{ background: acento }}
              >
                {popup.ctaTexto}
              </button>
            )
          )}
        </div>
      </div>

      <style>{`@keyframes popupIn { from { opacity: 0; transform: scale(0.94) translateY(10px); } to { opacity: 1; transform: scale(1) translateY(0); } }`}</style>
    </div>
  );
}
