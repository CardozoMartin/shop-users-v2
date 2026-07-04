import { useState } from 'react';
import { crearRevocacion, type RevocacionConstancia } from '../../api/tienda';

interface Props {
  tiendaId: number;
  acento: string;
}

/**
 * Botón de arrepentimiento obligatorio (Res. 424/2020, art. 34 Ley 24.240).
 * Accesible sin registro. Al enviar, entrega una constancia inmediata.
 */
export default function BotonArrepentimiento({ tiendaId, acento }: Props) {
  const [abierto, setAbierto] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [constancia, setConstancia] = useState<RevocacionConstancia | null>(null);

  const [form, setForm] = useState({
    nombre: '',
    email: '',
    telefono: '',
    nroPedidoTexto: '',
    motivo: '',
  });

  const cerrar = () => {
    setAbierto(false);
    // Reset diferido para no ver el form vacío durante la animación de cierre
    setTimeout(() => {
      setConstancia(null);
      setError(null);
      setForm({ nombre: '', email: '', telefono: '', nroPedidoTexto: '', motivo: '' });
    }, 200);
  };

  const enviar = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!form.nombre.trim() || !form.email.trim()) {
      setError('Completá tu nombre y email.');
      return;
    }
    setEnviando(true);
    try {
      const res = await crearRevocacion(tiendaId, {
        nombre: form.nombre.trim(),
        email: form.email.trim(),
        telefono: form.telefono.trim() || undefined,
        nroPedidoTexto: form.nroPedidoTexto.trim() || undefined,
        motivo: form.motivo.trim() || undefined,
      });
      setConstancia(res);
    } catch (err: any) {
      setError(
        err?.response?.data?.errores?.join(' · ') ??
          err?.response?.data?.mensaje ??
          'No se pudo registrar la solicitud. Intentá de nuevo.'
      );
    } finally {
      setEnviando(false);
    }
  };

  const inputCls =
    'w-full px-3 py-2 text-sm rounded-lg border outline-none transition-all';
  const inputStyle: React.CSSProperties = {
    background: 'var(--s-bg)',
    borderColor: 'var(--s-border)',
    color: 'var(--s-txt)',
  };

  return (
    <>
      <button
        onClick={() => setAbierto(true)}
        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border cursor-pointer transition-all hover:opacity-80"
        style={{ borderColor: 'var(--s-border)', color: 'var(--s-txt)', background: 'transparent' }}
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.7} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 15L3 9m0 0l6-6M3 9h12a6 6 0 010 12h-3" />
        </svg>
        Botón de arrepentimiento
      </button>

      {abierto && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.55)' }}
          onClick={cerrar}
        >
          <div
            className="w-full max-w-md rounded-2xl overflow-hidden max-h-[90vh] flex flex-col"
            style={{ background: 'var(--s-bg)', border: '1px solid var(--s-border)' }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-start justify-between px-5 py-4 border-b" style={{ borderColor: 'var(--s-border)' }}>
              <div>
                <h3 className="text-base font-semibold" style={{ color: 'var(--s-txt)' }}>
                  Botón de arrepentimiento
                </h3>
                <p className="text-xs mt-0.5" style={{ color: 'var(--s-muted)' }}>
                  Res. 424/2020 · Art. 34 Ley 24.240
                </p>
              </div>
              <button
                onClick={cerrar}
                className="p-1 cursor-pointer border-none bg-transparent"
                style={{ color: 'var(--s-muted)' }}
                aria-label="Cerrar"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-5 overflow-auto">
              {constancia ? (
                /* ── Constancia ── */
                <div className="text-center py-2">
                  <div
                    className="w-14 h-14 rounded-full mx-auto flex items-center justify-center mb-3"
                    style={{ background: '#16a34a' }}
                  >
                    <svg className="w-7 h-7" fill="none" stroke="#fff" strokeWidth={2.5} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                    </svg>
                  </div>
                  <h4 className="text-base font-semibold" style={{ color: 'var(--s-txt)' }}>
                    Solicitud registrada
                  </h4>
                  <p className="text-sm mt-1" style={{ color: 'var(--s-muted)' }}>
                    Guardá este código como constancia de tu solicitud:
                  </p>
                  <div
                    className="my-4 py-3 px-4 rounded-xl font-mono text-lg font-bold tracking-wider"
                    style={{ background: 'var(--s-surface)', color: acento, border: '1px dashed var(--s-border)' }}
                  >
                    {constancia.codigo}
                  </div>
                  <p className="text-xs" style={{ color: 'var(--s-muted)' }}>
                    Registrada el{' '}
                    {new Date(constancia.creadoEn).toLocaleDateString('es-AR', {
                      day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit',
                    })}
                    . La tienda se comunicará con vos a <strong>{constancia.email}</strong>.
                  </p>
                  <button
                    onClick={cerrar}
                    className="mt-5 w-full py-2.5 rounded-lg text-white text-sm font-semibold cursor-pointer border-none"
                    style={{ background: acento }}
                  >
                    Listo
                  </button>
                </div>
              ) : (
                /* ── Formulario ── */
                <form onSubmit={enviar} className="space-y-3">
                  <p className="text-xs leading-relaxed" style={{ color: 'var(--s-muted)' }}>
                    Podés arrepentirte de tu compra dentro de los <strong>10 días corridos</strong> de
                    recibido el producto o de contratado el servicio, sin costo ni justificación.
                    Completá tus datos y la tienda gestionará la devolución.
                  </p>

                  <div>
                    <label className="block text-xs font-medium mb-1" style={{ color: 'var(--s-txt)' }}>
                      Nombre y apellido *
                    </label>
                    <input
                      type="text"
                      value={form.nombre}
                      onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                      className={inputCls}
                      style={inputStyle}
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium mb-1" style={{ color: 'var(--s-txt)' }}>
                      Email *
                    </label>
                    <input
                      type="email"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      className={inputCls}
                      style={inputStyle}
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium mb-1" style={{ color: 'var(--s-txt)' }}>
                        Teléfono
                      </label>
                      <input
                        type="tel"
                        value={form.telefono}
                        onChange={(e) => setForm({ ...form, telefono: e.target.value })}
                        className={inputCls}
                        style={inputStyle}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium mb-1" style={{ color: 'var(--s-txt)' }}>
                        N° de pedido
                      </label>
                      <input
                        type="text"
                        value={form.nroPedidoTexto}
                        onChange={(e) => setForm({ ...form, nroPedidoTexto: e.target.value })}
                        placeholder="Si lo recordás"
                        className={inputCls}
                        style={inputStyle}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium mb-1" style={{ color: 'var(--s-txt)' }}>
                      Motivo (opcional)
                    </label>
                    <textarea
                      value={form.motivo}
                      onChange={(e) => setForm({ ...form, motivo: e.target.value })}
                      rows={3}
                      className={inputCls}
                      style={inputStyle}
                    />
                  </div>

                  {error && (
                    <p className="text-xs" style={{ color: '#dc2626' }}>
                      {error}
                    </p>
                  )}

                  <button
                    type="submit"
                    disabled={enviando}
                    className="w-full py-2.5 rounded-lg text-white text-sm font-semibold cursor-pointer border-none disabled:opacity-60"
                    style={{ background: acento }}
                  >
                    {enviando ? 'Enviando…' : 'Enviar solicitud'}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
