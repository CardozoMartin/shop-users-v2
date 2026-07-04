import type { Tienda } from '../../types';

interface Props {
  tienda: Tienda;
  className?: string;
}

/**
 * Bloque de identificación del vendedor (datos legales) para el footer.
 * No renderiza nada si la tienda no cargó ningún dato.
 */
export default function DatosLegales({ tienda, className = '' }: Props) {
  const partes: string[] = [];
  if (tienda.razonSocial) partes.push(tienda.razonSocial);
  if (tienda.cuit) partes.push(`CUIT ${tienda.cuit}`);
  if (tienda.domicilioLegal) partes.push(tienda.domicilioLegal);

  if (partes.length === 0) return null;

  return (
    <p className={`text-[11px] leading-relaxed ${className}`} style={{ color: 'var(--s-muted)' }}>
      {partes.join(' · ')}
    </p>
  );
}
