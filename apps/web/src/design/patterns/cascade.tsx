import { motion, useReducedMotion, type HTMLMotionProps } from 'motion/react';
import { duration, easing, shift, stagger } from '@/design/motion.generated';

/** Entrada em cascata (40 ms entre itens) para listas e grades de cartões. */
export function Cascade({
  children,
  delay = 0,
  ...props
}: HTMLMotionProps<'div'> & { delay?: number }) {
  return (
    <motion.div
      initial="hidden"
      animate="show"
      variants={{
        hidden: {},
        show: { transition: { staggerChildren: stagger, delayChildren: delay } },
      }}
      {...props}
    >
      {children}
    </motion.div>
  );
}

export function CascadeItem({ children, ...props }: HTMLMotionProps<'div'>) {
  const reduced = useReducedMotion();
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: reduced ? 0 : shift },
        show: { opacity: 1, y: 0, transition: { duration: duration.base, ease: easing } },
      }}
      {...props}
    >
      {children}
    </motion.div>
  );
}
