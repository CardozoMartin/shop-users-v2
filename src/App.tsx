import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import StorePage from './pages/StorePage';
import DirectorioPage from './pages/DirectorioPage';
import ScrollToTop from './components/ScrollToTop';
import { dominioPropioActual } from './utils/dominio';

const qc = new QueryClient({
  defaultOptions: { queries: { retry: 1, staleTime: 1000 * 60 * 5 } },
});

export default function App() {
  // Cuando el storefront se sirve desde un dominio propio (www.mitienda.com),
  // la raíz "/" es directamente la tienda, no el directorio de tiendas.
  const enDominioPropio = dominioPropioActual() !== null;

  return (
    <QueryClientProvider client={qc}>
      <BrowserRouter>
        <ScrollToTop />
        <Routes>
          {enDominioPropio ? (
            // En dominio propio no hay slug: toda la navegación cuelga de "/".
            <Route path="/*" element={<StorePage />} />
          ) : (
            <>
              <Route path="/" element={<DirectorioPage />} />
              <Route path="/:slug/*" element={<StorePage />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </>
          )}
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
