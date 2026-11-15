import { useMemo, useState } from 'react';
import { useDirectory } from '@/core/directory/use-directory';
import { daysFromToday, formatDate } from '@/core/format';
import { EmptyState } from '@/design/patterns/empty-state';
import { FlowSteps, type FlowStep } from '@/design/patterns/flow-steps';
import { PageHeader } from '@/design/patterns/page-header';
import { SkeletonCard } from '@/design/patterns/skeleton';
import { StatusBadge } from '@/design/patterns/status-badge';
import { Select } from '@/design/ui/form';
import { Card, CardContent, CardHeader, CardTitle } from '@/design/ui/misc';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableRow,
} from '@/design/ui/table';
import { useCompliance, type ComplianceItem } from '@/modules/works/compliance/api';
import { t } from '@/modules/works/compliance/i18n';

const TONE = {
  issued: 'success',
  in_progress: 'info',
  submitted: 'info',
  not_started: 'neutral',
  expired: 'danger',
} as const;
const SOON_DAYS = 45;

function flowOf(items: ComplianceItem[]): FlowStep[] {
  return items.map((i) => {
    const due = i.dueDate ?? undefined;
    const overdue = due && i.status !== 'issued' && daysFromToday(due) < 0;
    const status =
      overdue || i.status === 'expired'
        ? 'blocked'
        : i.status === 'issued'
          ? 'done'
          : i.status === 'not_started'
            ? 'pending'
            : 'current';
    return {
      id: i.id,
      label: t(`steps.${i.step as 'cno'}`),
      status,
      dueDate: i.status === 'issued' ? undefined : due,
      detail:
        i.status === 'issued' && i.validUntil
          ? t('validUntil', { date: formatDate(i.validUntil) })
          : undefined,
    };
  });
}

/** Regularização: fluxo visual por obra (CNO → ART → alvará → licenças → bombeiros → demais), checklist e vencimentos. */
export default function CompliancePage({ obraId }: { obraId?: string }) {
  const dir = useDirectory();
  const [picked, setWork] = useState<string>();
  const work =
    picked ?? dir.obras.find((o) => o.code === 'OB-2026-019')?.id ?? dir.obras[0]?.id ?? '';
  const list = useCompliance(obraId ?? (work || undefined));
  const items = useMemo(
    () => [...(list.data?.data ?? [])].sort((a, b) => a.stepOrder - b.stepOrder),
    [list.data],
  );
  const upcoming = items
    .filter(
      (i) =>
        (i.dueDate && i.status !== 'issued') ||
        (i.validUntil && daysFromToday(i.validUntil) <= SOON_DAYS) ||
        (i.status === 'issued' && i.dueDate),
    )
    .sort((a, b) =>
      (a.dueDate ?? a.validUntil ?? '').localeCompare(b.dueDate ?? b.validUntil ?? ''),
    );
  const body = list.isLoading ? (
    <SkeletonCard />
  ) : items.length === 0 ? (
    <EmptyState title={t('emptyTitle')} description={t('emptyDescription')} />
  ) : (
    <div className="space-y-5">
      <div className="surface-card p-6">
        <FlowSteps steps={flowOf(items)} />
      </div>
      <div className="grid gap-5 xl:grid-cols-[1.6fr_1fr]">
        <Card>
          <CardHeader>
            <CardTitle>{t('checklist')}</CardTitle>
          </CardHeader>
          <Table>
            <TableHead>
              <tr>
                <TableHeaderCell>{t('columns.item')}</TableHeaderCell>
                <TableHeaderCell className="hidden lg:table-cell">
                  {t('columns.agency')}
                </TableHeaderCell>
                <TableHeaderCell>{t('columns.status')}</TableHeaderCell>
                <TableHeaderCell className="hidden md:table-cell">
                  {t('columns.protocol')}
                </TableHeaderCell>
              </tr>
            </TableHead>
            <TableBody>
              {items.map((i) => (
                <TableRow key={i.id}>
                  <TableCell>
                    <span className="block font-medium">{i.title}</span>
                    {i.regulation && (
                      <span className="text-xs text-muted-foreground">{i.regulation}</span>
                    )}
                    {i.notes && (
                      <span className="mt-0.5 block text-xs text-muted-foreground">{i.notes}</span>
                    )}
                  </TableCell>
                  <TableCell className="hidden lg:table-cell">{dir.name(i.agencyId)}</TableCell>
                  <TableCell>
                    <StatusBadge tone={TONE[i.status]} label={t(`status.${i.status}`)} />
                  </TableCell>
                  <TableCell className="hidden md:table-cell font-numeric text-xs">
                    {i.protocol}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>{t('deadlines')}</CardTitle>
          </CardHeader>
          <CardContent>
            {upcoming.length === 0 ? (
              <p className="text-muted-foreground">{t('noDeadlines')}</p>
            ) : (
              <ul className="space-y-3">
                {upcoming.map((i) => {
                  const date = (i.dueDate ?? i.validUntil) as string;
                  const days = daysFromToday(date);
                  return (
                    <li key={i.id} className="flex items-start justify-between gap-3 text-base">
                      <span className="min-w-0">
                        <span className="block truncate">{i.title}</span>
                        <span className="text-sm text-muted-foreground">
                          {i.dueDate
                            ? t('actionBy', { date: formatDate(date) })
                            : t('validUntil', { date: formatDate(date) })}
                        </span>
                      </span>
                      <StatusBadge
                        tone={days < 0 ? 'danger' : days <= 30 ? 'warning' : 'neutral'}
                        label={`${days}d`}
                      />
                    </li>
                  );
                })}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
  if (obraId) return body;
  return (
    <div>
      <PageHeader
        title={t('title')}
        description={t('subtitle')}
        actions={
          <Select
            value={work}
            onChange={(e) => setWork(e.target.value)}
            aria-label={t('work')}
            className="w-72"
          >
            {dir.obras.map((o) => (
              <option key={o.id} value={o.id}>
                {o.name}
              </option>
            ))}
          </Select>
        }
      />
      {body}
    </div>
  );
}
