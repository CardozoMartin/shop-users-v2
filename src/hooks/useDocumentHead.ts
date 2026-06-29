import { useEffect } from 'react';
import type { Tienda } from '../types';

/**
 * Setea dinámicamente el <title> y el <favicon> de la pestaña según la tienda.
 * - title: usa el nombre de la tienda
 * - favicon: usa el logo de la tienda si está cargado; si no, deja el por defecto
 */
export function useDocumentHead(tienda?: Tienda | null) {
  useEffect(() => {
    if (!tienda) return;

    // ── Título de la pestaña ──
    const titulo = tienda.nombre
      ? `${tienda.nombre}${tienda.descripcion ? ' · ' + tienda.descripcion : ''}`
      : document.title;
    document.title = titulo.slice(0, 70);

    // ── Meta description ──
    if (tienda.descripcion) {
      let meta = document.querySelector('meta[name="description"]');
      if (!meta) {
        meta = document.createElement('meta');
        meta.setAttribute('name', 'description');
        document.head.appendChild(meta);
      }
      meta.setAttribute('content', tienda.descripcion.slice(0, 160));
    }

    // ── Favicon ──
    if (tienda.logoUrl) {
      // Quitamos los favicons previos
      document.querySelectorAll("link[rel~='icon']").forEach((el) => el.remove());

      const link = document.createElement('link');
      link.rel = 'icon';
      link.href = tienda.logoUrl;
      document.head.appendChild(link);

      // apple-touch-icon para iOS
      let apple = document.querySelector("link[rel='apple-touch-icon']");
      if (!apple) {
        apple = document.createElement('link');
        apple.setAttribute('rel', 'apple-touch-icon');
        document.head.appendChild(apple);
      }
      apple.setAttribute('href', tienda.logoUrl);
    }
  }, [tienda?.nombre, tienda?.descripcion, tienda?.logoUrl]);
}
