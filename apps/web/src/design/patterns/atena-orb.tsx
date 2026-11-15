import { motion, useReducedMotion } from 'motion/react';
import { createT } from '@/core/i18n/create-t';
import { messages } from '@/core/i18n/messages';
import { BrandSymbol } from '@/design/brand/logo';
import { cn } from '@/design/cn';

const t = createT(messages);

/**
 * Orbe da Atena: anel de luz azul-clara com brilho. Pulsa e gira ao "pensar".
 * A luz azul é exclusiva de elementos de IA (o âmbar fica reservado a alertas).
 */
export function AtenaOrb({
  size = 40,
  thinking = false,
  className,
}: {
  size?: number;
  thinking?: boolean;
  className?: string;
}) {
  const reduced = useReducedMotion();
  const animated = !reduced;
  return (
    <span
      className={cn('relative inline-flex shrink-0 items-center justify-center', className)}
      style={{ width: size, height: size }}
      role="img"
      aria-label={thinking ? t('atena.thinking') : t('atena.orb')}
    >
      <motion.span
        className="absolute -inset-[28%] rounded-full"
        style={{ background: 'radial-gradient(circle, var(--atena-glow), transparent 68%)' }}
        animate={
          animated
            ? {
                opacity: thinking ? [0.55, 1, 0.55] : [0.4, 0.62, 0.4],
                scale: thinking ? [0.92, 1.08, 0.92] : [0.96, 1.02, 0.96],
              }
            : undefined
        }
        transition={{ duration: thinking ? 1.4 : 3.6, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.span
        className="absolute inset-0 rounded-full"
        style={{
          background:
            'conic-gradient(from 0deg, var(--atena-from), var(--atena-to), var(--atena-from))',
          mask: `radial-gradient(farthest-side, transparent calc(100% - ${Math.max(size / 12, 2)}px), black calc(100% - ${Math.max(size / 12, 2)}px))`,
        }}
        animate={animated ? { rotate: 360 } : undefined}
        transition={{ duration: thinking ? 2.2 : 14, repeat: Infinity, ease: 'linear' }}
      />
      <span
        className="relative flex items-center justify-center rounded-full bg-primary-strong text-sidebar-foreground"
        style={{ width: size * 0.78, height: size * 0.78 }}
      >
        <BrandSymbol micro={size < 48} style={{ height: size * 0.46 }} className="w-auto" />
      </span>
    </span>
  );
}
