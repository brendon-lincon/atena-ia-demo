import { Plus } from 'lucide-react';
import { Link, useNavigate } from 'react-router';
import { formatMoney } from '@/core/format';
import { DataView } from '@/design/patterns/data-view';
import { EmptyState } from '@/design/patterns/empty-state';
import { PageHeader } from '@/design/patterns/page-header';
import { StatusBadge } from '@/design/patterns/status-badge';
import { Button } from '@/design/ui/button';
import { useBudgets, type Budget } from '@/modules/engineering/budgets/api';
import { t } from '@/modules/engineering/budgets/i18n';

const STATUS = { draft: 'draft', in_review: 'in_review', approved: 'approved' } as const;

export default function BudgetsPage() {
  const list = useBudgets();
  const navigate = useNavigate();
  const action = (
    <Button asChild>
      <Link to="/budgets/new">
        <Plus /> {t('newBudget')}
      </Link>
    </Button>
  );
  return (
    <div>
      <PageHeader title={t('title')} description={t('subtitle')} actions={action} />
      <DataView<Budget>
        rows={list.data?.data ?? []}
        views={['table', 'cards']}
        loading={list.isLoading}
        error={list.isError}
        onRetry={() => void list.refetch()}
        emptyAction={action}
        onRowClick={(b) => void navigate(`/budgets/${b.id}`)}
        searchText={(b) => b.name}
        columns={[
          {
            id: 'name',
            header: t('columns.name'),
            cell: (b) => <span className="font-medium">{b.name}</span>,
            sort: (b) => b.name,
          },
          {
            id: 'level',
            header: t('columns.level'),
            cell: (b) => t(`levels.${b.level}`),
            hideOnMobile: true,
          },
          {
            id: 'status',
            header: t('columns.status'),
            cell: (b) => <StatusBadge status={STATUS[b.status]} />,
          },
          {
            id: 'total',
            header: t('columns.total'),
            cell: (b) => formatMoney(b.totalCents, { compact: true }),
            sort: (b) => b.totalCents,
            align: 'right',
          },
          {
            id: 'version',
            header: t('columns.version'),
            cell: (b) => `v${b.version}`,
            hideOnMobile: true,
          },
          { id: 'base', header: t('columns.base'), cell: (b) => b.baseDate, hideOnMobile: true },
        ]}
      />
      {list.data?.data.length === 0 && (
        <EmptyState title={t('emptyTitle')} description={t('emptyDescription')} />
      )}
    </div>
  );
}
