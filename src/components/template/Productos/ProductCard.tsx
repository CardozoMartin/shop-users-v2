import type { Producto } from '../../../types';
import ProductCardClasico from './ProductCardClasico';
import ProductCardModerno from './ProductCardModerno';
import ProductCardBrasilia from './ProductCardBrasilia';

export type CardVariante = 'CLASICO' | 'MODERNO' | 'BRASILIA';

interface Props {
  producto: Producto;
  acento: string;
  onSelect: (p: Producto) => void;
  onAdd: (p: Producto) => void;
  destacado?: boolean;
  /** Diseño de la tarjeta (config-driven). Default: CLASICO. */
  variante?: CardVariante;
  /** Prefijo de rutas de la tienda. Pásalo cuando el :slug de la URL NO sea el de
   *  la tienda (p. ej. en /ofertas/:slug). Si se omite, se deriva del slug de la URL. */
  basePath?: string;
}

// Dispatcher de la tarjeta de producto: elige el DISEÑO según `variante`.
// Todos los consumidores siguen importando este ProductCard; el diseño concreto
// vive en ProductCardClasico / ProductCardModerno.
export default function ProductCard({ variante = 'CLASICO', ...props }: Props) {
  if (variante === 'MODERNO') return <ProductCardModerno {...props} />;
  if (variante === 'BRASILIA') return <ProductCardBrasilia {...props} />;
  return <ProductCardClasico {...props} />;
}
