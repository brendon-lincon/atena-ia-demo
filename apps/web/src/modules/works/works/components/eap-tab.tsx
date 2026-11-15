import { motion } from 'motion/react';
import { ChevronRight } from 'lucide-react';
import { useState } from 'react';
import { useDirectory } from '@/core/directory/use-directory';
import type { Obra } from '@/core/entities';
import { formatMoney, formatNumber, formatPercent } from '@/core/format';
import { cn } from '@/design/cn';
import { duration, easing } from '@/design/motion.generated';
import { EmptyState } from '@/design/patterns/empty-state';
import { SkeletonRows } from '@/design/patterns/skeleton';
import { Progress } from '@/design/ui/misc';
import { useWorkData } from '@/modules/works/works/api';
import { eapTree } from '@/modules/works/works/lib/eap-tree';
import { t } from '@/modules/works/works/i18n';

/** Árvore da EAP: frentes e itens, com avanço, peso e valor contratado. */
export function EapTab({ obra }: { obra: Obra }) {
  const { eap } = useWorkData(obra);
  const dir = useDirectory();
  const [open, setOpen] = useState<Set<string>>(new Set());
  if (eap.isLoading) return <SkeletonRows />;
  const tree = eapTree(eap.data?.data ?? []);
  if (tree.length === 0) return <EmptyState title={t('eap.emptyTitle')} />;
  const toggle = (id: string) =>
    setOpen((current) => {
      const next = new Set(current);
      if (!next.delete(id)) next.add(id);
      return next;
    });
  return (
    <div className="surface-card divide-y divide-border overflow-hidden">
      {tree.map(({ item, children }) => {
        const expanded = open.has(item.id);
        return (
          <div key={item.id}>
            <button
              type="button"
              aria-expanded={expanded}
              aria-label={expanded ? t('eap.collapse') : t('eap.expand')}
              onClick={() => toggle(item.id)}
              className="flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-muted/60"
            >
              <ChevronRight
                className={cn(
                  'size-4 shrink-0 text-muted-foreground transition-transform duration-[var(--duration-base)]',
                  expanded && 'rotate-90',
                )}
              />
              <span className="min-w-0 flex-1">
                <span className="block truncate text-base font-medium">
                  {item.code}. {item.name}
                </span>
                {item.contractorId && (
                  <span className="text-sm text-muted-foreground">
                    {t('eap.third')}: {dir.name(item.contractorId)}
                  </span>
                )}
              </span>
              <span className="hidden w-40 sm:block">
                <Progress value={item.progressPct} aria-label={item.name} />
              </span>
              <span className="tnum w-14 text-right text-base font-semibold">
                {formatPercent(item.progressPct, 0)}
              </span>
              <span className="tnum hidden w-28 text-right text-sm text-muted-foreground md:block">
                {formatMoney(item.contractedCents, { compact: true })}
              </span>
            </button>
            {expanded && (
              <motion.ul
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                transition={{ duration: duration.base, ease: easing }}
                className="overflow-hidden bg-muted/40"
              >
                {children.map((leaf) => (
                  <li
                    key={leaf.id}
                    className="flex items-center gap-3 border-t border-border/70 py-2.5 pr-4 pl-12 text-base"
                  >
                    <span className="min-w-0 flex-1 truncate">
                      {leaf.code} {leaf.name}
                    </span>
                    {leaf.quantity != null && (
                      <span className="tnum hidden text-sm text-muted-foreground lg:block">
                        {formatNumber(leaf.quantity)} {leaf.unit}
                      </span>
                    )}
                    <span className="hidden w-28 sm:block">
                      <Progress value={leaf.progressPct} aria-label={leaf.name} className="h-1.5" />
                    </span>
                    <span className="tnum w-12 text-right">
                      {formatPercent(leaf.progressPct, 0)}
                    </span>
                  </li>
                ))}
              </motion.ul>
            )}
          </div>
        );
      })}
    </div>
  );
}
