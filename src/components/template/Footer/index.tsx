import type { Tienda } from '../../../types';
import FooterCentrado from './FooterCentrado';
import FooterColumnas from './FooterColumnas';

interface Props {
  tienda: Tienda;
  acento: string;
  onScrollTo: (id: string) => void;
}

// Dispatcher: elige el layout del footer según footerVariante del tema.
export default function Footer(props: Props) {
  const variante = props.tienda.temaConfig?.footerVariante ?? 'CENTRADO';

  if (variante === 'COLUMNAS') return <FooterColumnas {...props} />;
  return <FooterCentrado {...props} />;
}
