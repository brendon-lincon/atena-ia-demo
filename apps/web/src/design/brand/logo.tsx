import type { SVGProps } from 'react';
import { createT } from '@/core/i18n/create-t';
import { messages } from '@/core/i18n/messages';
import { logo } from './logo.generated';

const t = createT(messages);

function box(b: readonly number[]): { x: number; y: number; w: number; h: number } {
  const [x0 = 0, y0 = 0, x1 = 0, y1 = 0] = b;
  return { x: x0, y: y0, w: x1 - x0, h: y1 - y0 };
}

type SvgProps = Omit<SVGProps<SVGSVGElement>, 'viewBox' | 'children'>;

/** Símbolo da Atena. A cor vem do texto (`currentColor`): navy no tema claro, branco no escuro. */
export function BrandSymbol({ micro = false, ...props }: SvgProps & { micro?: boolean }) {
  const source = micro ? logo.symbolMicro : logo.symbol;
  const b = box(source.box);
  return (
    <svg viewBox={`${b.x} ${b.y} ${b.w} ${b.h}`} role="img" aria-label={t('brand.name')} {...props}>
      <path fill="currentColor" fillRule="evenodd" d={source.d} />
    </svg>
  );
}

function WordmarkPaths() {
  const w = logo.wordmark;
  return (
    <>
      <path fill="currentColor" fillRule="evenodd" d={w.ink} />
      <path fill="currentColor" fillOpacity={logo.opacity.plate} fillRule="evenodd" d={w.plate} />
      <path fill="currentColor" fillOpacity={logo.opacity.slash} fillRule="evenodd" d={w.slash} />
      <path fill="currentColor" fillOpacity={logo.opacity.a} fillRule="evenodd" d={w.a} />
    </>
  );
}

export function BrandWordmark(props: SvgProps) {
  const b = box(logo.wordmark.box);
  return (
    <svg viewBox={`${b.x} ${b.y} ${b.w} ${b.h}`} role="img" aria-label={t('brand.name')} {...props}>
      <WordmarkPaths />
    </svg>
  );
}

/** Arranjo horizontal (símbolo + logotipo), com ou sem a assinatura. */
export function BrandLockup({
  withTagline = false,
  ...props
}: SvgProps & { withTagline?: boolean }) {
  const s = box(logo.symbol.box);
  const w = box(logo.wordmark.box);
  const g = box(logo.tagline.box);
  const wordX = s.x + s.w + 23;
  const wordY = s.y + (s.h - w.h) / 2 + 4;
  const tagY = wordY + w.h + 13;
  const height = withTagline ? Math.max(s.h, tagY + g.h - s.y) : s.h;
  return (
    <svg
      viewBox={`${s.x} ${s.y} ${wordX + w.w - s.x} ${height}`}
      role="img"
      aria-label={withTagline ? t('brand.nameWithTagline') : t('brand.name')}
      {...props}
    >
      <path fill="currentColor" fillRule="evenodd" d={logo.symbol.d} />
      <g transform={`translate(${wordX - w.x} ${wordY - w.y})`}>
        <WordmarkPaths />
      </g>
      {withTagline && (
        <path
          fill="currentColor"
          fillOpacity={logo.opacity.tag}
          fillRule="evenodd"
          d={logo.tagline.d}
          transform={`translate(${wordX - g.x} ${tagY - g.y})`}
        />
      )}
    </svg>
  );
}
