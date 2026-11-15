import { animate, useInView, useReducedMotion } from 'motion/react';
import { useEffect, useRef } from 'react';
import { duration, easing } from '@/design/motion.generated';

/** Número que conta até o valor final (respeita movimento reduzido). */
export function AnimatedNumber({
  value,
  format,
  className,
}: {
  value: number;
  format: (n: number) => string;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const visible = useInView(ref, { once: true });
  const reduced = useReducedMotion();
  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    if (reduced || !visible) {
      node.textContent = format(value);
      return;
    }
    const controls = animate(0, value, {
      duration: duration.data,
      ease: easing,
      onUpdate: (n) => (node.textContent = format(n)),
    });
    return () => controls.stop();
  }, [value, visible, reduced, format]);
  return (
    <span ref={ref} className={className}>
      {format(value)}
    </span>
  );
}
