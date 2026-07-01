import { useParams, Routes, Route } from 'react-router-dom';
import { useTiendaActual } from '../hooks/useTienda';
import { dominioPropioActual } from '../utils/dominio';
import { useDocumentHead } from '../hooks/useDocumentHead';
import Template from '../components/template';
import ProductoDetalle from './ProductoDetalle';
import ProductosLista from './ProductosLista';
import NosotrosPage from './NosotrosPage';
import CheckoutPage from './CheckoutPage';
import AuthPage from './AuthPage';
import MiCuentaPage from './MiCuentaPage';
import PagoRetornoPage from './PagoRetornoPage';

function Skeleton() {
  return (
    <div className="min-h-screen animate-pulse">
      <div className="w-full h-16 bg-gray-100" />
      <div className="w-full bg-gray-200" style={{ height: '55vw', maxHeight: 680 }} />
      <div className="max-w-6xl mx-auto px-5 py-20 grid gap-5" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))' }}>
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="rounded-2xl overflow-hidden bg-gray-100">
            <div className="aspect-square bg-gray-200" />
            <div className="p-4 space-y-2">
              <div className="h-3 rounded bg-gray-200 w-2/3" />
              <div className="h-4 rounded bg-gray-200" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 p-6 text-center">
      <p className="text-6xl">🏪</p>
      <h1 className="text-2xl font-bold text-gray-800">Tienda no encontrada</h1>
      <p className="text-gray-500">La tienda que buscás no existe o no está disponible.</p>
    </div>
  );
}

export default function StorePage() {
  const { slug } = useParams<{ slug: string }>();
  // Si entramos por un dominio propio (www.mitienda.com) resolvemos por dominio;
  // si no, por el slug de la URL como siempre.
  const dominioPropio = dominioPropioActual();
  const { data: tienda, isLoading, isError } = useTiendaActual(slug ?? '', dominioPropio);

  // Title y favicon dinámicos según la tienda
  useDocumentHead(tienda);

  if (isLoading) return <Skeleton />;
  if (isError || !tienda) return <NotFound />;
  if (tienda.activa === false) return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-3 p-6 text-center">
      <p className="text-5xl">🔒</p>
      <h1 className="text-xl font-bold text-gray-800">Tienda en preparación</h1>
      <p className="text-gray-500">Esta tienda estará disponible pronto.</p>
    </div>
  );

  return (
    <Routes>
      <Route index element={<Template tienda={tienda} />} />
      <Route path="productos" element={<ProductosLista tienda={tienda} />} />
      <Route path="nosotros" element={<NosotrosPage tienda={tienda} />} />
      <Route path="checkout" element={<CheckoutPage tienda={tienda} />} />
      <Route path="cuenta" element={<AuthPage tienda={tienda} />} />
      <Route path="mi-cuenta" element={<MiCuentaPage tienda={tienda} />} />
      <Route path="pedido/:pedidoId/:resultado" element={<PagoRetornoPage tienda={tienda} />} />
      <Route path="producto/:productoId" element={<ProductoDetalle tienda={tienda} />} />
      <Route path="*" element={<Template tienda={tienda} />} />
    </Routes>
  );
}
