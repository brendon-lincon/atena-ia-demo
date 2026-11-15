import { Camera, NotebookPen } from 'lucide-react';
import { formatMoney, formatNumber } from '@/core/format';
import { EmptyState } from '@/design/patterns/empty-state';
import { SkeletonRows } from '@/design/patterns/skeleton';
import { Progress } from '@/design/ui/misc';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableRow,
} from '@/design/ui/table';
import type { MeasurementItem } from '@/modules/works/measurements/api';
import { t } from '@/modules/works/measurements/i18n';

/** Levantamento por item de EAP: contratado, acumulado, período e saldo, com as evidências ligadas. */
export function SurveyTab({ items, loading }: { items: MeasurementItem[]; loading: boolean }) {
  if (loading) return <SkeletonRows />;
  if (items.length === 0)
    return <EmptyState title={t('emptyTitle')} description={t('emptyDescription')} />;
  return (
    <div className="surface-card overflow-hidden">
      <Table>
        <TableHead>
          <tr>
            <TableHeaderCell>{t('columns.item')}</TableHeaderCell>
            <TableHeaderCell className="hidden md:table-cell">{t('columns.unit')}</TableHeaderCell>
            <TableHeaderCell className="text-right">{t('columns.contracted')}</TableHeaderCell>
            <TableHeaderCell className="hidden text-right lg:table-cell">
              {t('columns.previous')}
            </TableHeaderCell>
            <TableHeaderCell className="text-right">{t('columns.period')}</TableHeaderCell>
            <TableHeaderCell className="hidden text-right lg:table-cell">
              {t('columns.accumulated')}
            </TableHeaderCell>
            <TableHeaderCell className="hidden w-40 xl:table-cell">
              {t('columns.balance')}
            </TableHeaderCell>
            <TableHeaderCell className="text-right">{t('columns.amount')}</TableHeaderCell>
            <TableHeaderCell className="hidden xl:table-cell">
              {t('columns.evidence')}
            </TableHeaderCell>
          </tr>
        </TableHead>
        <TableBody>
          {items.map((i) => (
            <TableRow key={i.id}>
              <TableCell className="max-w-64 font-medium">{i.description}</TableCell>
              <TableCell className="hidden md:table-cell">{i.unit}</TableCell>
              <TableCell className="text-right">{formatNumber(i.contractedQty, 1)}</TableCell>
              <TableCell className="hidden text-right lg:table-cell">
                {formatNumber(i.previousQty, 1)}
              </TableCell>
              <TableCell className="text-right font-semibold">
                {formatNumber(i.periodQty, 1)}
              </TableCell>
              <TableCell className="hidden text-right lg:table-cell">
                {formatNumber(i.accumulatedQty, 1)}
              </TableCell>
              <TableCell className="hidden xl:table-cell">
                <Progress
                  value={(i.accumulatedQty / i.contractedQty) * 100}
                  className="h-1.5"
                  aria-label={i.description}
                />
                <span className="text-xs text-muted-foreground tnum">
                  {formatNumber(i.balanceQty, 1)}
                </span>
              </TableCell>
              <TableCell className="text-right">{formatMoney(i.periodCents)}</TableCell>
              <TableCell className="hidden xl:table-cell">
                <span className="flex gap-3 text-xs text-muted-foreground">
                  {i.photoIds.length > 0 && (
                    <span className="inline-flex items-center gap-1">
                      <Camera className="size-3.5" />
                      {i.photoIds.length}
                    </span>
                  )}
                  {i.diaryEntryIds.length > 0 && (
                    <span className="inline-flex items-center gap-1">
                      <NotebookPen className="size-3.5" />
                      {i.diaryEntryIds.length}
                    </span>
                  )}
                </span>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
