import type { MarqueeItem } from '../../../types';

interface Props {
  items?: MarqueeItem[];
  acento: string;
}

const DEFAULTS = ['Envíos a todo el país', 'Pagá en cuotas', 'Atención personalizada', 'Calidad garantizada'];

export default function Marquee({ items, acento }: Props) {
  const textos = items && items.length > 0 ? items.map((i) => i.texto) : DEFAULTS;
  const duplicados = [...textos, ...textos, ...textos, ...textos];

  return (
    <div className="w-full overflow-hidden py-3 border-y" style={{ borderColor: 'var(--s-border)' }}>
      <div
        className="flex gap-12 whitespace-nowrap"
        style={{ animation: 'marquee 30s linear infinite' }}
      >
        {duplicados.map((t, i) => (
          <span key={i} className="text-[11px] font-semibold uppercase tracking-[0.2em] flex items-center gap-4" style={{ color: 'var(--s-muted)' }}>
            {t}
            <span style={{ color: acento, fontSize: 16 }}>·</span>
          </span>
        ))}
      </div>
      <style>{`@keyframes marquee { from { transform: translateX(0) } to { transform: translateX(-25%) } }`}</style>
    </div>
  );
}
