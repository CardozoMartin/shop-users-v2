import { basePathTienda } from '../utils/dominio';
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import type { Tienda, CrearPedidoDto } from '../types';
import { useCarrito, useCrearPedido } from '../hooks/useTienda';
import { crearPreferenciaMP, validarCupon } from '../api/tienda';
import { useAuthStore } from '../store/auth';
import Navbar from '../components/template/Navbar';
import Footer from '../components/template/Footer';

interface Props {
  tienda: Tienda;
}

function resolveColors(tienda: Tienda) {
  const acento = tienda.temaConfig?.colorAcento || '#6366f1';
  const isDark = tienda.temaConfig?.modoOscuro ?? false;
  return { acento, isDark, bg: isDark ? '#0f0f0f' : '#ffffff' };
}

function fmt(v?: number | string) {
  return `$ ${Number(v ?? 0).toLocaleString('es-AR')}`;
}

function DatoCopiable({ label, valor, acento }: { label: string; valor: string; acento: string }) {
  const [copiado, setCopiado] = useState(false);
  const copiar = () => {
    navigator.clipboard.writeText(valor);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 1500);
  };
  return (
    <div className="flex items-center justify-between gap-3">
      <div className="min-w-0">
        <p className="text-xs" style={{ color: 'var(--s-muted)' }}>{label}</p>
        <p className="text-sm font-medium truncate" style={{ color: 'var(--s-txt)' }}>{valor}</p>
      </div>
      <button
        type="button"
        onClick={copiar}
        className="flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-lg cursor-pointer border-none flex-shrink-0"
        style={{ background: copiado ? '#16a34a' : acento, color: '#fff' }}
      >
        {copiado ? '✓ Copiado' : 'Copiar'}
      </button>
    </div>
  );
}

const initialForm = {
  compradorNombre: '', compradorEmail: '', compradorTel: '',
  direccionCalle: '', direccionNumero: '', direccionPiso: '',
  direccionCiudad: '', direccionProv: '', direccionCP: '', direccionNotas: '',
  notasCliente: '',
};

export default function CheckoutPage({ tienda }: Props) {
  const navigate = useNavigate();
  const bp = basePathTienda(tienda.slug);
  const c = resolveColors(tienda);

  const { carrito } = useCarrito(tienda.id);
  const crearPedido = useCrearPedido(tienda.id);
  const { cliente } = useAuthStore();

  const [form, setForm] = useState(() => cliente
    ? {
        ...initialForm,
        compradorNombre: `${cliente.nombre} ${cliente.apellido}`.trim(),
        compradorEmail: cliente.email,
        compradorTel: cliente.telefono,
      }
    : initialForm);
  const [metodoEntregaId, setMetodoEntregaId] = useState<number | null>(null);
  const [metodoPagoId, setMetodoPagoId] = useState<number | null>(null);
  const [error, setError] = useState('');
  const [pedidoOk, setPedidoOk] = useState<number | null>(null);
  const [redirigiendo, setRedirigiendo] = useState(false);

  // Cupón
  const [cuponInput, setCuponInput] = useState('');
  const [cupon, setCupon] = useState<{ codigo: string; descuento: number } | null>(null);
  const [cuponError, setCuponError] = useState('');
  const [validandoCupon, setValidandoCupon] = useState(false);

  const items = carrito?.items ?? [];
  const subtotal = items.reduce((acc, i) => acc + Number(i.subtotal ?? Number(i.precioUnit) * i.cantidad), 0);

  const pagoSel = tienda.metodosPago?.find((m) => m.metodoPago.id === metodoPagoId);
  const datosTransferencia = pagoSel?.configExtra && (pagoSel.configExtra.cbu || pagoSel.configExtra.alias)
    ? pagoSel.configExtra
    : null;

  // ¿El método de pago elegido redirige a Mercado Pago?
  // Solo Mercado Pago tiene pasarela. Las "tarjetas" sueltas son pago manual
  // (a menos que la tienda las haya configurado vía MP, pero eso entra como "Mercado Pago").
  const nombrePago = (pagoSel?.metodoPago.nombre || '').toLowerCase();
  const esPagoOnline = nombrePago.includes('mercado');

  const entregaSel = tienda.metodosEntrega?.find((m) => m.metodoEntrega.id === metodoEntregaId);
  const costoEnvio = entregaSel
    ? (entregaSel.costo === null || entregaSel.costo === undefined ? 0 : Number(entregaSel.costo))
    : 0;
  const descuento = cupon?.descuento ?? 0;
  const total = Math.max(0, subtotal - descuento) + costoEnvio;

  const cssVars = {
    '--s-bg': c.bg, '--s-txt': c.isDark ? '#f1f5f9' : '#1d293d',
    '--s-muted': '#748298', '--s-border': c.isDark ? '#1e293b' : '#e5e7eb',
    '--s-surface': c.isDark ? '#1a1a2e' : '#f8f8f8', '--s-acento': c.acento,
  } as React.CSSProperties;

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const aplicarCupon = async () => {
    setCuponError('');
    const codigo = cuponInput.trim();
    if (!codigo) return;
    setValidandoCupon(true);
    try {
      const res = await validarCupon(tienda.id, codigo, subtotal);
      setCupon({ codigo: res.codigo, descuento: res.descuento });
    } catch (err: any) {
      setCupon(null);
      setCuponError(err?.response?.data?.message || 'No se pudo aplicar el cupón');
    } finally {
      setValidandoCupon(false);
    }
  };

  const quitarCupon = () => { setCupon(null); setCuponInput(''); setCuponError(''); };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!metodoEntregaId) return setError('Elegí una forma de envío.');
    if (!metodoPagoId) return setError('Elegí un método de pago.');
    if (!form.compradorNombre || !form.compradorEmail || !form.compradorTel) return setError('Completá tus datos de contacto.');
    if (!form.direccionCalle || !form.direccionCiudad || !form.direccionProv) return setError('Completá la dirección de envío.');

    const payload: CrearPedidoDto = {
      ...form,
      metodoEntregaId,
      metodoPagoId,
      costoEnvio,
      cuponCodigo: cupon?.codigo,
    };

    crearPedido.mutate(payload, {
      onSuccess: async (pedido) => {
        if (esPagoOnline) {
          // Pago online: creamos la preferencia de Mercado Pago y redirigimos
          setRedirigiendo(true);
          try {
            const pref = await crearPreferenciaMP(tienda.id, pedido.id);
            const url = pref.initPoint || pref.sandboxInitPoint;
            if (url) {
              window.location.href = url;
              return;
            }
            setError('No pudimos iniciar el pago. Te dejamos el pedido creado; contactá a la tienda.');
            setRedirigiendo(false);
            setPedidoOk(pedido.id);
          } catch (err: any) {
            setRedirigiendo(false);
            setError(err?.response?.data?.message || 'No pudimos iniciar el pago con Mercado Pago. El pedido quedó creado.');
            setPedidoOk(pedido.id);
          }
        } else {
          setPedidoOk(pedido.id);
        }
      },
      onError: (err: any) => setError(err?.response?.data?.message || 'No pudimos crear el pedido. Intentá de nuevo.'),
    });
  };

  const inputCls = 'w-full border rounded-lg px-3 py-2.5 text-sm outline-none bg-transparent';
  const inputStyle = { borderColor: 'var(--s-border)', color: 'var(--s-txt)' } as React.CSSProperties;

  // ── Redirigiendo a Mercado Pago (prioridad máxima) ──
  if (redirigiendo) {
    return (
      <div style={cssVars}>
        <Navbar tienda={tienda} cartCount={0} acento={c.acento} onCartClick={() => {}} onScrollTo={() => navigate(`${bp || "/"}`)} />
        <main className="max-w-lg mx-auto px-6 py-32 text-center min-h-[60vh] flex flex-col items-center justify-center">
          <div className="w-12 h-12 border-4 rounded-full animate-spin mb-6" style={{ borderColor: 'var(--s-border)', borderTopColor: c.acento }} />
          <h1 className="text-xl font-semibold mb-2" style={{ color: 'var(--s-txt)' }}>Te estamos redirigiendo a Mercado Pago…</h1>
          <p className="text-sm" style={{ color: 'var(--s-muted)' }}>No cierres esta ventana. En unos segundos vas a poder completar el pago.</p>
        </main>
      </div>
    );
  }

  // ── Pantalla de éxito ──
  if (pedidoOk) {
    return (
      <div style={cssVars}>
        <Navbar tienda={tienda} cartCount={0} acento={c.acento} onCartClick={() => {}} onScrollTo={() => navigate(`${bp || "/"}`)} />
        <main className="max-w-lg mx-auto px-6 py-24 text-center min-h-[60vh]">
          <div className="w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-6" style={{ background: `${c.acento}15` }}>
            <svg className="w-8 h-8" fill="none" stroke={c.acento} strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
            </svg>
          </div>
          <h1 className="text-2xl font-semibold mb-2" style={{ color: 'var(--s-txt)' }}>¡Pedido confirmado!</h1>
          <p className="text-sm mb-1" style={{ color: 'var(--s-muted)' }}>Tu pedido <strong style={{ color: c.acento }}>#{pedidoOk}</strong> fue recibido.</p>
          <p className="text-sm mb-6" style={{ color: 'var(--s-muted)' }}>Te enviamos un email con los detalles. {tienda.nombre} se va a contactar para coordinar el pago y la entrega.</p>

          {datosTransferencia && (
            <div className="text-left rounded-xl p-4 mb-8" style={{ background: `${c.acento}0d`, border: `1px solid ${c.acento}33` }}>
              <p className="text-sm font-semibold mb-2" style={{ color: 'var(--s-txt)' }}>Importante: pago por transferencia</p>
              <p className="text-xs mb-3" style={{ color: 'var(--s-muted)' }}>
                Transferí <strong style={{ color: c.acento }}>{fmt(total)}</strong> a:
              </p>
              <div className="space-y-2">
                {datosTransferencia.alias && <DatoCopiable label="Alias" valor={datosTransferencia.alias} acento={c.acento} />}
                {datosTransferencia.cbu && <DatoCopiable label="CBU/CVU" valor={datosTransferencia.cbu} acento={c.acento} />}
              </div>
              <p className="text-xs mt-3" style={{ color: 'var(--s-muted)' }}>
                Enviá el comprobante por WhatsApp{tienda.whatsapp ? <> al {tienda.whatsapp}</> : null} indicando el pedido <strong>#{pedidoOk}</strong> y tu nombre.
              </p>
            </div>
          )}
          <Link to={`${bp || "/"}`} className="s-btn inline-block px-8 py-3 text-sm font-semibold text-white" style={{ background: c.acento }}>
            Volver a la tienda
          </Link>
        </main>
        <Footer tienda={tienda} acento={c.acento} onScrollTo={() => navigate(`${bp || "/"}`)} />
      </div>
    );
  }

  // ── Carrito vacío (solo si no estamos procesando un pedido) ──
  if (items.length === 0 && !crearPedido.isPending) {
    return (
      <div style={cssVars}>
        <Navbar tienda={tienda} cartCount={0} acento={c.acento} onCartClick={() => {}} onScrollTo={() => navigate(`${bp || "/"}`)} />
        <main className="max-w-lg mx-auto px-6 py-24 text-center min-h-[60vh]">
          <p className="text-5xl mb-4">🛒</p>
          <h1 className="text-xl font-semibold mb-2" style={{ color: 'var(--s-txt)' }}>Tu carrito está vacío</h1>
          <Link to={`${bp}/productos`} className="s-btn inline-block mt-4 px-8 py-3 text-sm font-semibold text-white" style={{ background: c.acento }}>
            Ver productos
          </Link>
        </main>
        <Footer tienda={tienda} acento={c.acento} onScrollTo={() => navigate(`${bp || "/"}`)} />
      </div>
    );
  }

  return (
    <div style={cssVars}>
      <Navbar tienda={tienda} cartCount={items.length} acento={c.acento} onCartClick={() => {}} onScrollTo={() => navigate(`${bp || "/"}`)} />

      <main className="max-w-screen-lg mx-auto px-6 py-10 min-h-[60vh]">
        <h1 className="text-3xl font-medium mb-8" style={{ color: 'var(--s-txt)' }}>Finalizar compra</h1>

        <form onSubmit={submit} className="flex flex-col lg:flex-row gap-10">
          {/* Columna izquierda: formulario */}
          <div className="flex-1 space-y-8">
            {/* Contacto */}
            <section>
              <h2 className="text-sm font-semibold uppercase tracking-wider mb-4" style={{ color: 'var(--s-txt)' }}>Tus datos</h2>
              <div className="grid sm:grid-cols-2 gap-3">
                <input className={inputCls} style={inputStyle} placeholder="Nombre completo *" value={form.compradorNombre} onChange={set('compradorNombre')} />
                <input className={inputCls} style={inputStyle} placeholder="Teléfono *" value={form.compradorTel} onChange={set('compradorTel')} />
                <input className={`${inputCls} sm:col-span-2`} style={inputStyle} type="email" placeholder="Email *" value={form.compradorEmail} onChange={set('compradorEmail')} />
              </div>
            </section>

            {/* Dirección */}
            <section>
              <h2 className="text-sm font-semibold uppercase tracking-wider mb-4" style={{ color: 'var(--s-txt)' }}>Dirección de envío</h2>
              <div className="grid sm:grid-cols-6 gap-3">
                <input className={`${inputCls} sm:col-span-4`} style={inputStyle} placeholder="Calle *" value={form.direccionCalle} onChange={set('direccionCalle')} />
                <input className={`${inputCls} sm:col-span-1`} style={inputStyle} placeholder="Número" value={form.direccionNumero} onChange={set('direccionNumero')} />
                <input className={`${inputCls} sm:col-span-1`} style={inputStyle} placeholder="Piso" value={form.direccionPiso} onChange={set('direccionPiso')} />
                <input className={`${inputCls} sm:col-span-3`} style={inputStyle} placeholder="Ciudad *" value={form.direccionCiudad} onChange={set('direccionCiudad')} />
                <input className={`${inputCls} sm:col-span-2`} style={inputStyle} placeholder="Provincia *" value={form.direccionProv} onChange={set('direccionProv')} />
                <input className={`${inputCls} sm:col-span-1`} style={inputStyle} placeholder="CP" value={form.direccionCP} onChange={set('direccionCP')} />
                <input className={`${inputCls} sm:col-span-6`} style={inputStyle} placeholder="Notas (timbre, referencia...)" value={form.direccionNotas} onChange={set('direccionNotas')} />
              </div>
            </section>

            {/* Forma de envío */}
            {tienda.metodosEntrega && tienda.metodosEntrega.length > 0 && (
              <section>
                <h2 className="text-sm font-semibold uppercase tracking-wider mb-4" style={{ color: 'var(--s-txt)' }}>Forma de envío</h2>
                <div className="space-y-2">
                  {tienda.metodosEntrega.map((me) => {
                    const gratis = me.costo === null || me.costo === undefined || Number(me.costo) === 0;
                    const activo = metodoEntregaId === me.metodoEntrega.id;
                    return (
                      <button
                        type="button"
                        key={me.metodoEntrega.id}
                        onClick={() => setMetodoEntregaId(me.metodoEntrega.id)}
                        className="w-full flex items-center justify-between gap-3 p-4 rounded-xl border text-left cursor-pointer transition-all"
                        style={{ borderColor: activo ? c.acento : 'var(--s-border)', background: activo ? `${c.acento}0d` : 'transparent' }}
                      >
                        <div>
                          <p className="text-sm font-medium" style={{ color: 'var(--s-txt)' }}>{me.metodoEntrega.nombre}</p>
                          {(me.tiempoEstimado || me.zonaCobertura || me.detalle) && (
                            <p className="text-xs mt-0.5" style={{ color: 'var(--s-muted)' }}>{me.tiempoEstimado || me.zonaCobertura || me.detalle}</p>
                          )}
                        </div>
                        <span className="text-sm font-medium whitespace-nowrap" style={{ color: gratis ? '#16a34a' : 'var(--s-txt)' }}>
                          {gratis ? 'Gratis' : fmt(me.costo!)}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </section>
            )}

            {/* Método de pago */}
            {tienda.metodosPago && tienda.metodosPago.length > 0 && (
              <section>
                <h2 className="text-sm font-semibold uppercase tracking-wider mb-4" style={{ color: 'var(--s-txt)' }}>Método de pago</h2>
                <div className="space-y-2">
                  {tienda.metodosPago.map((mp) => {
                    const activo = metodoPagoId === mp.metodoPago.id;
                    return (
                      <button
                        type="button"
                        key={mp.metodoPago.id}
                        onClick={() => setMetodoPagoId(mp.metodoPago.id)}
                        className="w-full flex items-start gap-3 p-4 rounded-xl border text-left cursor-pointer transition-all"
                        style={{ borderColor: activo ? c.acento : 'var(--s-border)', background: activo ? `${c.acento}0d` : 'transparent' }}
                      >
                        <div className="w-4 h-4 rounded-full border-2 mt-0.5 flex-shrink-0 flex items-center justify-center" style={{ borderColor: activo ? c.acento : 'var(--s-border)' }}>
                          {activo && <div className="w-2 h-2 rounded-full" style={{ background: c.acento }} />}
                        </div>
                        <div>
                          <p className="text-sm font-medium" style={{ color: 'var(--s-txt)' }}>{mp.metodoPago.nombre}</p>
                          {mp.detalle && <p className="text-xs mt-0.5" style={{ color: 'var(--s-muted)' }}>{mp.detalle}</p>}
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Datos de transferencia */}
                {datosTransferencia && (
                  <div className="mt-4 rounded-xl p-4" style={{ background: `${c.acento}0d`, border: `1px solid ${c.acento}33` }}>
                    <p className="text-sm font-semibold mb-3" style={{ color: 'var(--s-txt)' }}>Datos para transferir</p>
                    <div className="space-y-2">
                      {datosTransferencia.titular && <DatoCopiable label="Titular" valor={datosTransferencia.titular} acento={c.acento} />}
                      {datosTransferencia.banco && <DatoCopiable label="Banco" valor={datosTransferencia.banco} acento={c.acento} />}
                      {datosTransferencia.alias && <DatoCopiable label="Alias" valor={datosTransferencia.alias} acento={c.acento} />}
                      {datosTransferencia.cbu && <DatoCopiable label="CBU/CVU" valor={datosTransferencia.cbu} acento={c.acento} />}
                    </div>
                    <div className="mt-3 pt-3 flex gap-2 items-start text-xs" style={{ borderTop: `1px solid ${c.acento}22`, color: 'var(--s-muted)' }}>
                      <svg className="w-4 h-4 flex-shrink-0 mt-px" fill="none" stroke={c.acento} strokeWidth={1.6} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
                      </svg>
                      <p>
                        Tras confirmar el pedido, realizá la transferencia y enviá el <strong>comprobante por WhatsApp</strong>
                        {tienda.whatsapp ? <> al {tienda.whatsapp}</> : null}, indicando tu nombre <strong>({form.compradorNombre || 'el del pedido'})</strong> y el número de pedido.
                      </p>
                    </div>
                  </div>
                )}
              </section>
            )}

            <textarea className={inputCls} style={{ ...inputStyle, minHeight: 80 }} placeholder="Notas para el vendedor (opcional)" value={form.notasCliente} onChange={set('notasCliente')} />
          </div>

          {/* Columna derecha: resumen */}
          <aside className="lg:w-80 flex-shrink-0">
            <div className="lg:sticky lg:top-24 rounded-xl p-5 border" style={{ background: 'var(--s-surface)', borderColor: 'var(--s-border)' }}>
              <h2 className="text-base font-semibold mb-4" style={{ color: 'var(--s-txt)' }}>Tu pedido</h2>

              <div className="space-y-3 mb-4 max-h-64 overflow-y-auto">
                {items.map((it) => {
                  const img = it.producto.imagenPrincipalUrl || it.producto.imagenes?.[0]?.url;
                  return (
                    <div key={it.id} className="flex gap-3 items-center">
                      <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 bg-white border" style={{ borderColor: 'var(--s-border)' }}>
                        {img && <img src={img} alt={it.producto.nombre} className="w-full h-full object-contain p-0.5" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium truncate" style={{ color: 'var(--s-txt)' }}>{it.producto.nombre}</p>
                        {it.variante && <p className="text-xs" style={{ color: 'var(--s-muted)' }}>{it.variante.nombre}</p>}
                        <p className="text-xs" style={{ color: 'var(--s-muted)' }}>x{it.cantidad}</p>
                      </div>
                      <span className="text-xs font-medium" style={{ color: 'var(--s-txt)' }}>{fmt(Number(it.subtotal ?? Number(it.precioUnit) * it.cantidad))}</span>
                    </div>
                  );
                })}
              </div>

              {/* Cupón de descuento */}
              <div className="border-t pt-3" style={{ borderColor: 'var(--s-border)' }}>
                {cupon ? (
                  <div className="flex items-center justify-between rounded-lg px-3 py-2" style={{ background: '#16a34a12', border: '1px solid #16a34a33' }}>
                    <div className="text-xs">
                      <span className="font-semibold" style={{ color: '#16a34a' }}>✓ {cupon.codigo}</span>
                      <span className="ml-1" style={{ color: 'var(--s-muted)' }}>aplicado</span>
                    </div>
                    <button type="button" onClick={quitarCupon} className="text-xs underline cursor-pointer border-none bg-transparent" style={{ color: 'var(--s-muted)' }}>
                      Quitar
                    </button>
                  </div>
                ) : (
                  <div>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Código de cupón"
                        value={cuponInput}
                        onChange={(e) => setCuponInput(e.target.value.toUpperCase())}
                        className="flex-1 border rounded-lg px-3 py-2 text-sm outline-none bg-transparent uppercase"
                        style={{ borderColor: 'var(--s-border)', color: 'var(--s-txt)' }}
                      />
                      <button
                        type="button"
                        onClick={aplicarCupon}
                        disabled={validandoCupon || !cuponInput.trim()}
                        className="px-4 py-2 rounded-lg text-sm font-semibold border cursor-pointer disabled:opacity-40"
                        style={{ borderColor: c.acento, color: c.acento, background: 'transparent' }}
                      >
                        {validandoCupon ? '...' : 'Aplicar'}
                      </button>
                    </div>
                    {cuponError && <p className="text-xs mt-1.5" style={{ color: '#dc2626' }}>{cuponError}</p>}
                  </div>
                )}
              </div>

              <div className="border-t pt-3 space-y-1.5 text-sm" style={{ borderColor: 'var(--s-border)' }}>
                <div className="flex justify-between" style={{ color: 'var(--s-muted)' }}>
                  <span>Subtotal</span><span>{fmt(subtotal)}</span>
                </div>
                {descuento > 0 && (
                  <div className="flex justify-between" style={{ color: '#16a34a' }}>
                    <span>Descuento ({cupon?.codigo})</span><span>-{fmt(descuento)}</span>
                  </div>
                )}
                <div className="flex justify-between" style={{ color: 'var(--s-muted)' }}>
                  <span>Envío</span>
                  <span style={{ color: costoEnvio === 0 && entregaSel ? '#16a34a' : undefined }}>
                    {!entregaSel ? '—' : costoEnvio === 0 ? 'Gratis' : fmt(costoEnvio)}
                  </span>
                </div>
                <div className="flex justify-between text-base font-semibold pt-1" style={{ color: 'var(--s-txt)' }}>
                  <span>Total</span><span>{fmt(total)}</span>
                </div>
              </div>

              {error && <p className="text-xs mt-4 text-center" style={{ color: '#dc2626' }}>{error}</p>}

              <button
                type="submit"
                disabled={crearPedido.isPending || redirigiendo}
                className="s-btn w-full mt-5 py-3.5 text-sm font-semibold text-white cursor-pointer border-none transition-opacity hover:opacity-90 disabled:opacity-50"
                style={{ background: c.acento }}
              >
                {redirigiendo ? 'Redirigiendo a Mercado Pago...'
                  : crearPedido.isPending ? 'Procesando...'
                  : esPagoOnline ? 'Pagar con Mercado Pago'
                  : 'Confirmar pedido'}
              </button>
              {esPagoOnline && (
                <p className="text-xs text-center mt-2" style={{ color: 'var(--s-muted)' }}>
                  Vas a ser redirigido a Mercado Pago para completar el pago de forma segura.
                </p>
              )}
            </div>
          </aside>
        </form>
      </main>

      <Footer tienda={tienda} acento={c.acento} onScrollTo={() => navigate(`${bp || "/"}`)} />
    </div>
  );
}
