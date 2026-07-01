import { basePathTienda } from '../utils/dominio';
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import type { Tienda } from '../types';
import { registroCliente, loginCliente, olvidePasswordCliente } from '../api/auth';
import { useAuthStore } from '../store/auth';
import { useCarrito } from '../hooks/useTienda';
import { useCarritoStore } from '../store/carrito';
import Navbar from '../components/template/Navbar';
import Footer from '../components/template/Footer';
import CartDrawer from '../components/template/CartDrawer';

interface Props {
  tienda: Tienda;
}

type Modo = 'login' | 'registro' | 'recuperar';

function resolveColors(tienda: Tienda) {
  const acento = tienda.temaConfig?.colorAcento || '#6366f1';
  const isDark = tienda.temaConfig?.modoOscuro ?? false;
  return { acento, isDark, bg: isDark ? '#0f0f0f' : '#ffffff' };
}

export default function AuthPage({ tienda }: Props) {
  const navigate = useNavigate();
  const bp = basePathTienda(tienda.slug);
  const c = resolveColors(tienda);
  const { acento } = c;
  const { setAuth } = useAuthStore();
  const { carrito, actualizar, eliminar } = useCarrito(tienda.id);
  const { abrirCarrito } = useCarritoStore();
  const cartCount = carrito?.items.reduce((acc, i) => acc + i.cantidad, 0) ?? 0;

  const cssVars = {
    '--s-bg': c.bg, '--s-txt': c.isDark ? '#f1f5f9' : '#1d293d',
    '--s-muted': '#748298', '--s-border': c.isDark ? '#1e293b' : '#e5e7eb',
    '--s-surface': c.isDark ? '#1a1a2e' : '#f8f8f8', '--s-acento': c.acento,
  } as React.CSSProperties;

  const [modo, setModo] = useState<Modo>('login');
  const [form, setForm] = useState({ nombre: '', apellido: '', telefono: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [okMsg, setOkMsg] = useState('');

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const volver = () => navigate(`${bp || "/"}`);

  const loginMut = useMutation({
    mutationFn: () => loginCliente({ tiendaId: tienda.id, email: form.email, password: form.password }),
    onSuccess: (data) => { setAuth(data, data.token); volver(); },
    onError: (e: any) => setError(e?.response?.data?.message || 'Email o contraseña incorrectos.'),
  });

  const registroMut = useMutation({
    mutationFn: () => registroCliente({
      tiendaId: tienda.id, email: form.email, nombre: form.nombre,
      apellido: form.apellido, telefono: form.telefono, password: form.password,
    }),
    onSuccess: (data) => { setAuth(data, data.token); volver(); },
    onError: (e: any) => setError(e?.response?.data?.message || 'No pudimos crear la cuenta.'),
  });

  const recuperarMut = useMutation({
    mutationFn: () => olvidePasswordCliente({ tiendaId: tienda.id, email: form.email }),
    onSuccess: () => setOkMsg('Si el email existe, te enviamos instrucciones para restablecer tu contraseña.'),
    onError: (e: any) => setError(e?.response?.data?.message || 'No pudimos procesar la solicitud.'),
  });

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); setOkMsg('');
    if (modo === 'login') loginMut.mutate();
    else if (modo === 'registro') registroMut.mutate();
    else recuperarMut.mutate();
  };

  const cargando = loginMut.isPending || registroMut.isPending || recuperarMut.isPending;

  const cambiarModo = (m: Modo) => { setModo(m); setError(''); setOkMsg(''); };

  const titulo = modo === 'login' ? 'Iniciar sesión' : modo === 'registro' ? 'Crear cuenta' : 'Recuperar contraseña';
  const subtitulo = modo === 'login' ? '¡Bienvenido de nuevo! Ingresá para continuar'
    : modo === 'registro' ? `Creá tu cuenta en ${tienda.nombre}`
    : 'Ingresá tu email y te enviaremos instrucciones';

  const inputWrap = 'flex items-center w-full bg-transparent border border-gray-300/60 h-12 rounded-full overflow-hidden pl-6 gap-2';
  const inputCls = 'bg-transparent text-gray-600 placeholder-gray-500/80 outline-none text-sm w-full h-full';

  return (
    <div style={cssVars}>
      <Navbar tienda={tienda} cartCount={cartCount} acento={c.acento} onCartClick={abrirCarrito} onScrollTo={() => navigate(`${bp || "/"}`)} />

      <main className="flex flex-col items-center justify-center px-6 py-16 min-h-[70vh]" style={{ background: 'var(--s-bg)' }}>
        <form onSubmit={submit} className="w-full max-w-sm flex flex-col items-center">
          {/* Logo / nombre */}
          <Link to={`${bp || "/"}`} className="mb-6">
            {tienda.logoUrl
              ? <img src={tienda.logoUrl} alt={tienda.nombre} className="h-10 object-contain" />
              : <span className="text-xl font-semibold" style={{ color: 'var(--s-txt)' }}>{tienda.nombre}</span>}
          </Link>

          <h2 className="text-3xl text-gray-900 font-medium text-center">{titulo}</h2>
          <p className="text-sm text-gray-500/90 mt-2 text-center">{subtitulo}</p>

          {/* Campos de registro */}
          {modo === 'registro' && (
            <>
              <div className={`${inputWrap} mt-6`}>
                <input type="text" placeholder="Nombre" className={inputCls} value={form.nombre} onChange={set('nombre')} required />
              </div>
              <div className={`${inputWrap} mt-4`}>
                <input type="text" placeholder="Apellido" className={inputCls} value={form.apellido} onChange={set('apellido')} required />
              </div>
              <div className={`${inputWrap} mt-4`}>
                <input type="tel" placeholder="Teléfono" className={inputCls} value={form.telefono} onChange={set('telefono')} required />
              </div>
            </>
          )}

          {/* Email */}
          <div className={`${inputWrap} ${modo === 'registro' ? 'mt-4' : 'mt-6'}`}>
            <svg width="16" height="11" viewBox="0 0 16 11" fill="none">
              <path fillRule="evenodd" clipRule="evenodd" d="M0 .55.571 0H15.43l.57.55v9.9l-.571.55H.57L0 10.45zm1.143 1.138V9.9h13.714V1.69l-6.503 4.8h-.697zM13.749 1.1H2.25L8 5.356z" fill="#6B7280" />
            </svg>
            <input type="email" placeholder="Email" className={inputCls} value={form.email} onChange={set('email')} required />
          </div>

          {/* Password (no en recuperar) */}
          {modo !== 'recuperar' && (
            <div className={`${inputWrap} mt-4`}>
              <svg width="13" height="17" viewBox="0 0 13 17" fill="none">
                <path d="M13 8.5c0-.938-.729-1.7-1.625-1.7h-.812V4.25C10.563 1.907 8.74 0 6.5 0S2.438 1.907 2.438 4.25V6.8h-.813C.729 6.8 0 7.562 0 8.5v6.8c0 .938.729 1.7 1.625 1.7h9.75c.896 0 1.625-.762 1.625-1.7zM4.063 4.25c0-1.406 1.093-2.55 2.437-2.55s2.438 1.144 2.438 2.55V6.8H4.061z" fill="#6B7280" />
              </svg>
              <input type="password" placeholder="Contraseña" className={inputCls} value={form.password} onChange={set('password')} required />
            </div>
          )}

          {/* Olvidé contraseña (solo en login) */}
          {modo === 'login' && (
            <div className="w-full flex items-center justify-end mt-3">
              <button type="button" onClick={() => cambiarModo('recuperar')} className="text-sm underline border-none bg-transparent cursor-pointer" style={{ color: acento }}>
                ¿Olvidaste tu contraseña?
              </button>
            </div>
          )}

          {/* Mensajes */}
          {error && <p className="text-sm text-red-500 mt-4 text-center">{error}</p>}
          {okMsg && <p className="text-sm text-green-600 mt-4 text-center">{okMsg}</p>}

          {/* Botón principal */}
          <button
            type="submit"
            disabled={cargando}
            className="mt-6 w-full h-11 rounded-full text-white border-none cursor-pointer transition-opacity hover:opacity-90 disabled:opacity-50 text-sm font-medium"
            style={{ background: acento }}
          >
            {cargando ? 'Procesando...'
              : modo === 'login' ? 'Ingresar'
              : modo === 'registro' ? 'Crear cuenta'
              : 'Enviar instrucciones'}
          </button>

          {/* Enlaces de cambio de modo */}
          <p className="text-gray-500/90 text-sm mt-5 text-center">
            {modo === 'login' && (
              <>¿No tenés cuenta? <button type="button" onClick={() => cambiarModo('registro')} className="border-none bg-transparent cursor-pointer hover:underline font-medium" style={{ color: acento }}>Registrate</button></>
            )}
            {modo === 'registro' && (
              <>¿Ya tenés cuenta? <button type="button" onClick={() => cambiarModo('login')} className="border-none bg-transparent cursor-pointer hover:underline font-medium" style={{ color: acento }}>Iniciá sesión</button></>
            )}
            {modo === 'recuperar' && (
              <button type="button" onClick={() => cambiarModo('login')} className="border-none bg-transparent cursor-pointer hover:underline font-medium" style={{ color: acento }}>← Volver a iniciar sesión</button>
            )}
          </p>
        </form>
      </main>

      <Footer tienda={tienda} acento={c.acento} onScrollTo={() => navigate(`${bp || "/"}`)} />

      <CartDrawer
        acento={c.acento}
        isDark={c.isDark}
        onActualizar={(itemId, cant) => actualizar.mutate({ itemId, cantidad: cant })}
        onEliminar={(itemId) => eliminar.mutate(itemId)}
      />
    </div>
  );
}
