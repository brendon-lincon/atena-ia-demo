import { AnimatePresence, motion } from 'motion/react';
import { CheckCircle2, X } from 'lucide-react';
import { create } from 'zustand';
import { createT } from '@/core/i18n/create-t';
import { messages } from '@/core/i18n/messages';
import { duration, easing } from '@/design/motion.generated';

const t = createT(messages);
interface Toast {
  id: number;
  text: string;
}
interface ToastState {
  items: Toast[];
  push: (text: string) => void;
  remove: (id: number) => void;
}
let sequence = 0;
const TOAST_LIFETIME_MS = 4200;

export const useToasts = create<ToastState>((set) => ({
  items: [],
  push: (text) => {
    const id = ++sequence;
    set((state) => ({ items: [...state.items, { id, text }] }));
    window.setTimeout(
      () => set((state) => ({ items: state.items.filter((item) => item.id !== id) })),
      TOAST_LIFETIME_MS,
    );
  },
  remove: (id) => set((state) => ({ items: state.items.filter((item) => item.id !== id) })),
}));

export function Toaster() {
  const { items, remove } = useToasts();
  return (
    <div
      className="pointer-events-none fixed right-4 bottom-24 z-[60] md:bottom-4 flex w-80 max-w-[calc(100vw-2rem)] flex-col gap-2"
      role="status"
      aria-live="polite"
    >
      <AnimatePresence>
        {items.map((item) => (
          <motion.div
            key={item.id}
            layout
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, x: 24 }}
            transition={{ duration: duration.base, ease: easing }}
            className="pointer-events-auto flex items-start gap-3 rounded-md border border-border bg-elevated p-3.5 shadow-lg"
          >
            <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-success" />
            <p className="flex-1 text-base">{item.text}</p>
            <button
              type="button"
              onClick={() => remove(item.id)}
              aria-label={t('toast.dismiss')}
              className="text-muted-foreground hover:text-foreground"
            >
              <X className="size-4" />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
