import { useState } from 'react';

interface Props {
  acento: string;
  /** Muestra el campo de imagen (solo reseñas de producto). */
  permiteImagen?: boolean;
  /** true si hay un cliente logueado. Si es false, se invita a iniciar sesión. */
  logueado: boolean;
  /** Ruta a la que enviar al usuario para iniciar sesión. */
  loginHref: string;
  isSaving: boolean;
  onSubmit: (data: { calificacion: number; comentario?: string; imagen?: File | null }) => Promise<void> | void;
}

/**
 * Formulario para que un cliente deje una reseña (de tienda o de producto).
 * - Selector de estrellas interactivo (1 a 5, requerido).
 * - Comentario opcional.
 * - Imagen opcional (solo si permiteImagen).
 * Requiere estar logueado; si no, muestra una invitación a iniciar sesión.
 */
export default function FormResena({
  acento,
  permiteImagen = false,
  logueado,
  loginHref,
  isSaving,
  onSubmit,
}: Props) {
  const [calificacion, setCalificacion] = useState(0);
  const [hover, setHover] = useState(0);
  const [comentario, setComentario] = useState('');
  const [imagen, setImagen] = useState<File | null>(null);
  const [error, setError] = useState('');
  const [enviada, setEnviada] = useState(false);

  if (!logueado) {
    return (
      <div
        className="rounded-xl p-6 text-center"
        style={{ background: 'var(--s-surface)', border: '1px solid var(--s-border)' }}
      >
        <p className="text-sm mb-3" style={{ color: 'var(--s-muted)' }}>
          Iniciá sesión para dejar tu opinión.
        </p>
        <a
          href={loginHref}
          className="inline-block px-5 py-2.5 rounded-full text-sm font-medium text-white no-underline"
          style={{ background: acento }}
        >
          Iniciar sesión
        </a>
      </div>
    );
  }

  if (enviada) {
    return (
      <div
        className="rounded-xl p-6 text-center"
        style={{ background: 'var(--s-surface)', border: '1px solid var(--s-border)' }}
      >
        <p className="text-3xl mb-2">✅</p>
        <p className="text-sm font-medium" style={{ color: 'var(--s-txt)' }}>
          ¡Gracias por tu opinión!
        </p>
        <p className="text-xs mt-1" style={{ color: 'var(--s-muted)' }}>
          Tu reseña será publicada una vez que la tienda la apruebe.
        </p>
      </div>
    );
  }

  const handleSubmit = async () => {
    setError('');
    if (calificacion < 1) {
      setError('Elegí una calificación de 1 a 5 estrellas.');
      return;
    }
    try {
      await onSubmit({
        calificacion,
        comentario: comentario.trim() || undefined,
        imagen: permiteImagen ? imagen : null,
      });
      setEnviada(true);
    } catch (e: any) {
      setError(e?.response?.data?.mensaje || 'No se pudo enviar la reseña. Intentá de nuevo.');
    }
  };

  return (
    <div
      className="rounded-xl p-5 sm:p-6"
      style={{ background: 'var(--s-surface)', border: '1px solid var(--s-border)' }}
    >
      <p className="text-sm font-medium mb-3" style={{ color: 'var(--s-txt)' }}>
        Dejá tu opinión
      </p>

      {/* Selector de estrellas */}
      <div className="flex items-center gap-1 mb-4">
        {Array.from({ length: 5 }).map((_, i) => {
          const idx = i + 1;
          const activo = (hover || calificacion) >= idx;
          return (
            <button
              key={i}
              type="button"
              onClick={() => setCalificacion(idx)}
              onMouseEnter={() => setHover(idx)}
              onMouseLeave={() => setHover(0)}
              className="p-0.5 bg-transparent border-none cursor-pointer"
              aria-label={`${idx} estrella${idx > 1 ? 's' : ''}`}
            >
              <svg width={26} height={26} viewBox="0 0 18 17" fill="none">
                <path
                  d="M8.04894 0.927049C8.3483 0.00573802 9.6517 0.00574017 9.95106 0.927051L11.2451 4.90983C11.379 5.32185 11.763 5.60081 12.1962 5.60081H16.3839C17.3527 5.60081 17.7554 6.84043 16.9717 7.40983L13.5838 9.87132C13.2333 10.126 13.0866 10.5773 13.2205 10.9894L14.5146 14.9721C14.8139 15.8934 13.7595 16.6596 12.9757 16.0902L9.58778 13.6287C9.2373 13.374 8.7627 13.374 8.41221 13.6287L5.02426 16.0902C4.24054 16.6596 3.18607 15.8934 3.48542 14.9721L4.7795 10.9894C4.91338 10.5773 4.76672 10.126 4.41623 9.87132L1.02827 7.40983C0.244561 6.84043 0.647338 5.60081 1.61606 5.60081H5.8038C6.23703 5.60081 6.62099 5.32185 6.75486 4.90983L8.04894 0.927049Z"
                  fill={acento}
                  fillOpacity={activo ? 1 : 0.25}
                />
              </svg>
            </button>
          );
        })}
      </div>

      {/* Comentario */}
      <textarea
        value={comentario}
        onChange={(e) => setComentario(e.target.value)}
        placeholder="Contanos tu experiencia (opcional)"
        rows={3}
        maxLength={2000}
        className="w-full rounded-lg px-3 py-2.5 text-sm outline-none resize-none"
        style={{ background: 'var(--s-bg)', border: '1px solid var(--s-border)', color: 'var(--s-txt)' }}
      />

      {/* Imagen (solo producto) */}
      {permiteImagen && (
        <div className="mt-3">
          <label
            className="inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm cursor-pointer"
            style={{ border: '1px solid var(--s-border)', color: 'var(--s-muted)' }}
          >
            📷 {imagen ? imagen.name : 'Agregar foto (opcional)'}
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => setImagen(e.target.files?.[0] ?? null)}
            />
          </label>
        </div>
      )}

      {error && <p className="text-sm mt-3" style={{ color: '#ef4444' }}>{error}</p>}

      <button
        type="button"
        onClick={handleSubmit}
        disabled={isSaving}
        className="mt-4 px-6 py-2.5 rounded-full text-sm font-medium text-white cursor-pointer border-none disabled:opacity-50"
        style={{ background: acento }}
      >
        {isSaving ? 'Enviando…' : 'Enviar reseña'}
      </button>
    </div>
  );
}
