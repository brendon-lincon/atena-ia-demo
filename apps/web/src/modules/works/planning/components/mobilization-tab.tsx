import { useDirectory } from '@/core/directory/use-directory';
import { formatMoney } from '@/core/format';
import { EmptyState } from '@/design/patterns/empty-state';
import { SkeletonRows } from '@/design/patterns/skeleton';
import { Badge } from '@/design/ui/misc';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableRow,
} from '@/design/ui/table';
import { useMobilizationData } from '@/modules/works/planning/api';
import { t } from '@/modules/works/planning/i18n';

/** Mobilização por obra: logística realizada e o previsto nas cotações. */
export function MobilizationTab() {
  const dir = useDirectory();
  const { logistics, requests, offers } = useMobilizationData();
  if (logistics.isLoading || requests.isLoading) return <SkeletonRows />;
  const rows = dir.obras.map((o) => {
    const realized = (logistics.data?.data ?? [])
      .filter((c) => c.obraId === o.id)
      .reduce((sum, c) => sum + c.amountCents, 0);
    const request = (requests.data?.data ?? []).find(
      (r) => r.obraId === o.id && /hospedagem/i.test(r.title),
    );
    const quote = (offers.data?.data ?? []).find((q) => q.requestId === request?.id);
    return { obra: o, realized, forecast: quote?.totalCents ?? 0 };
  });
  if (rows.length === 0) return <EmptyState title={t('mobilization.emptyTitle')} />;
  return (
    <div className="space-y-3">
      <p className="text-sm text-muted-foreground">
        {t('mobilization.title')}. {t('mobilization.note')}
      </p>
      <div className="surface-card overflow-hidden">
        <Table>
          <TableHead>
            <tr>
              <TableHeaderCell>{t('mobilization.work')}</TableHeaderCell>
              <TableHeaderCell className="text-right">{t('mobilization.people')}</TableHeaderCell>
              <TableHeaderCell className="text-right">{t('mobilization.lodging')}</TableHeaderCell>
              <TableHeaderCell className="text-right">{t('mobilization.forecast')}</TableHeaderCell>
            </tr>
          </TableHead>
          <TableBody>
            {rows.map(({ obra, realized, forecast }) => (
              <TableRow key={obra.id}>
                <TableCell className="font-medium">{obra.name}</TableCell>
                <TableCell className="text-right">{obra.headcount}</TableCell>
                <TableCell className="text-right">
                  {realized ? formatMoney(realized, { compact: true }) : t('common_none')}
                </TableCell>
                <TableCell className="text-right">
                  {forecast ? (
                    formatMoney(forecast, { compact: true })
                  ) : obra.status === 'mobilizing' ? (
                    <Badge tone="warning">{t('mobilization.notBudgeted')}</Badge>
                  ) : (
                    t('common_none')
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
