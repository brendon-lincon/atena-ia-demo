import { useParams } from 'react-router';
import { PageHeader } from '@/design/patterns/page-header';
import { BudgetWizard } from '@/modules/engineering/budgets/components/budget-wizard';
import { t } from '@/modules/engineering/budgets/i18n';
import { useBudget } from '@/modules/engineering/budgets/api';

/** `/budgets/new` abre o assistente do zero; `/budgets/:id` abre um orçamento existente. */
export default function BudgetPage() {
  const { id } = useParams();
  const budget = useBudget(id);
  return (
    <div>
      <PageHeader
        title={budget.data?.name ?? t('newBudget')}
        crumbs={[
          { label: t('detail.crumb'), to: '/budgets' },
          { label: budget.data ? `v${budget.data.version}` : t('newBudget') },
        ]}
      />
      <BudgetWizard key={id ?? 'new'} budgetId={id} />
    </div>
  );
}
