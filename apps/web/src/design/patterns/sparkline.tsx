import { motion, useReducedMotion } from 'motion/react';
import { useId } from 'react';
import { duration, easing } from '@/design/motion.generated';

/** Minigráfico de tendência; o traço se desenha ao entrar. */
export function Sparkline({
  data,
  width = 96,
  height = 32,
  className,
}: {
  data: number[];
  width?: number;
  height?: number;
  className?: string;
}) {
  const id = useId();
  const reduced = useReducedMotion();
  if (data.length < 2) return null;
  const min = Math.min(...data);
  const span = Math.max(...data) - min || 1;
  const points = data.map(
    (v, i) =>
      [(i / (data.length - 1)) * width, height - 3 - ((v - min) / span) * (height - 6)] as const,
  );
  const line = points
    .map(([x, y], i) => `${i ? 'L' : 'M'}${x.toFixed(1)} ${y.toFixed(1)}`)
    .join('');
  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      width={width}
      height={height}
      className={className}
      aria-hidden
    >
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="var(--primary)" stopOpacity="0.28" />
          <stop offset="1" stopColor="var(--primary)" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={`${line}L${width} ${height}L0 ${height}Z`} fill={`url(#${id})`} />
      <motion.path
        d={line}
        fill="none"
        stroke="var(--primary)"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={{ pathLength: reduced ? 1 : 0 }}
        whileInView={{ pathLength: 1 }}
        viewport={{ once: true }}
        transition={{ duration: duration.data, ease: easing }}
      />
    </svg>
  );
}
