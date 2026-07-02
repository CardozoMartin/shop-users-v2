import { useEffect } from 'react';
import { getFuenteKit } from '../config/fuenteKits';

const LINK_ID = 'shop-fuente-kit';

// Dado el kit tipográfico elegido por la tienda:
//  1) carga dinámicamente el <link> de Google Fonts de ese kit (solo esas familias)
//  2) setea --s-font-display / --s-font-body en :root, para que apliquen en toda la app.
export function useFuenteKit(fuenteKit?: string | null) {
  useEffect(() => {
    const kit = getFuenteKit(fuenteKit);

    // 1) <link> de la fuente (reutiliza el mismo elemento, solo cambia el href)
    let link = document.getElementById(LINK_ID) as HTMLLinkElement | null;
    if (!link) {
      link = document.createElement('link');
      link.id = LINK_ID;
      link.rel = 'stylesheet';
      document.head.appendChild(link);
    }
    if (link.href !== kit.googleHref) {
      link.href = kit.googleHref;
    }

    // 2) CSS vars globales
    const root = document.documentElement;
    root.style.setProperty('--s-font-display', kit.display);
    root.style.setProperty('--s-font-body', kit.body);
  }, [fuenteKit]);
}
