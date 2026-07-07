import type { Tienda } from '../../../types';
import NavbarClasico from './NavbarClasico';
import NavbarPill from './NavbarPill';
import NavbarBoutique from './NavbarBoutique';

interface Props {
  tienda: Tienda;
  cartCount: number;
  acento: string;
  onCartClick: () => void;
  onScrollTo: (id: string) => void;
}

// Dispatcher del navbar: elige el DISEÑO según navbarVariante (config-driven).
// El COMPORTAMIENTO (fija/transparente/flotante = navbarStyle) lo maneja cada
// variante internamente.
export default function Navbar(props: Props) {
  const variante = props.tienda.temaConfig?.navbarVariante ?? 'CLASICO';
  if (variante === 'PILL') return <NavbarPill {...props} />;
  if (variante === 'BOUTIQUE') return <NavbarBoutique {...props} />;
  return <NavbarClasico {...props} />;
}
