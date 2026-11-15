import { motion, useReducedMotion } from 'motion/react';
import { useId, type ReactNode } from 'react';
import { cn } from '@/design/cn';
import { duration, easing } from '@/design/motion.generated';

/** Anel de avanço com preenchimento animado e marca opcional do previsto. */
export function ProgressRing({
  value,
  planned,
  size = 88,
  stroke = 8,
  children,
  className,
}: {
  value: number;
  planned?: number;
  size?: number;
  stroke?: number;
  children?: ReactNode;
  className?: string;
}) {
  const id = useId();
  const reduced = useReducedMotion();
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const clamp = (n: number) => Math.min(Math.max(n, 0), 100);
  const angle = planned === undefined ? 0 : (clamp(planned) / 100) * 2 * Math.PI - Math.PI / 2;
  return (
    <div
      className={cn('relative inline-flex items-center justify-center', className)}
      style={{ width: size, height: size }}
      role="img"
      aria-label={`${Math.round(value)}%`}
    >
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
        <defs>
          <linearGradient id={id} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="var(--primary)" />
            <stop offset="1" stopColor="var(--atena-to)" />
          </linearGradient>
        </defs>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="var(--muted)"
          strokeWidth={stroke}
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={`url(#${id})`}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{
            strokeDashoffset: reduced ? circumference * (1 - clamp(value) / 100) : circumference,
          }}
          animate={{ strokeDashoffset: circumference * (1 - clamp(value) / 100) }}
          transition={{ duration: duration.data, ease: easing }}
        />
      </svg>
      {planned !== undefined && (
        <span
          className="absolute size-2 rounded-full border-2 border-surface bg-foreground"
          style={{
            left: size / 2 + radius * Math.cos(angle) - 4,
            top: size / 2 + radius * Math.sin(angle) - 4,
          }}
          aria-hidden
        />
      )}
      <div className="absolute inset-0 flex items-center justify-center text-center">
        {children}
      </div>
    </div>
  );
}
