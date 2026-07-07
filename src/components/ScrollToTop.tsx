import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

// Al cambiar de ruta (pathname), sube el scroll al tope de la página.
// Ignora cambios de solo query-string (?categoria=…) para no interrumpir
// el scroll cuando el usuario filtra dentro de la misma página.
export default function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  }, [pathname]);

  return null;
}
