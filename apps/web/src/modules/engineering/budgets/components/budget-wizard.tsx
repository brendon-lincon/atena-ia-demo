import { Download, Send, Stamp } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router';
import { useCreate } from '@/core/api/hooks';
import { useJob, useStartJob } from '@/core/jobs/use-job';
import { JobTracker } from '@/design/patterns/job-tracker';
import { SkeletonCard } from '@/design/patterns/skeleton';
import { StepWizard } from '@/design/patterns/step-wizard';
import { Button } from '@/design/ui/button';
import { useToasts } from '@/design/ui/toast';
import {
  budgetsApi,
  proposalsApi,
  reviewApi,
  useBudget,
  useBudgetItems,
  useCompositions,
  useProjectFiles,
  type Budget,
} from '@/modules/engineering/budgets/api';
import {
  BdiStep,
  IndirectsStep,
  InputStep,
  PricesStep,
  QuantitiesStep,
  ResultStep,
} from '@/modules/engineering/budgets/components/steps';
import { t } from '@/modules/engineering/budgets/i18n';
import { price, toPricingItems, type PricingItem } from '@/modules/engineering/budgets/lib/pricing';

const STEP_IDS = ['input', 'quantities', 'prices', 'indirects', 'bdi', 'result'] as const;

/**
 * Assistente de orçamento em 6 passos. Sem `budgetId`, começa pela entrada do projeto (a leitura é um job);
 * com `budgetId`, abre o orçamento existente no passo de quantitativos.
 */
export function BudgetWizard({ budgetId: fixedId }: { budgetId?: string }) {
  const navigate = useNavigate();
  const push = useToasts((s) => s.push);
  const startJob = useStartJob();
  const [step, setStep] = useState(fixedId ? 1 : 0);
  const [level, setLevel] = useState<Budget['level']>('analytic');
  const [mode, setMode] = useState<'upload' | 'paste'>('upload');
  const [file, setFile] = useState('');
  const [jobId, setJobId] = useState<string>();
  const job = useJob(jobId);
  const projectFiles = (useProjectFiles().data?.data ?? [])
    .filter((f) => f.discipline !== 'geral')
    .sort(
      (a, b) =>
        Number(String(b.name).startsWith('GER-PE-001')) -
        Number(String(a.name).startsWith('GER-PE-001')),
    );
  const result =
    job.data?.status === 'done' ? (job.data.result as { budgetId?: string } | null) : null;
  const budgetId = fixedId ?? result?.budgetId;
  const budget = useBudget(budgetId).data;
  const items = useBudgetItems(budgetId).data?.data;
  const compositions = useCompositions().data?.data;

  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [confirmed, setConfirmed] = useState<Set<string>>(new Set());
  const [overrides, setOverrides] = useState<{
    charges?: number;
    bdi?: number;
    rates?: Record<number, number>;
    people?: number;
  }>({});
  const [added, setAdded] = useState<Set<string>>(new Set());
  const create = useCreate(proposalsApi);

  const labels = useMemo(() => budget?.indirects.map((i) => i.label) ?? [], [budget]);
  const baseRates = useMemo(
    () => (budget ? budget.indirects.map((i) => i.cents / budget.directCostCents) : []),
    [budget],
  );
  const rates = baseRates.map((r, i) => overrides.rates?.[i] ?? r);
  const charges = overrides.charges ?? budget?.socialChargesPct ?? 0;
  const bdi = overrides.bdi ?? budget?.bdiPct ?? 0;

  const pricingItems: PricingItem[] = useMemo(() => {
    const base = toPricingItems(items ?? [], compositions ?? []).map((p) => ({
      ...p,
      quantity: quantities[p.id] ?? p.quantity,
    }));
    const extras = (budget?.crossCheck ?? [])
      .filter((f) => added.has(f.title))
      .map((f) => {
        const comp = compositions?.find((c) => c.id === f.compositionId);
        return {
          id: `extra:${f.title}`,
          group: 'Complementares',
          description: f.title,
          quantity: f.suggestedQuantity,
          baseQuantity: f.suggestedQuantity,
          baseTotalCents: Math.round((comp?.unitCostCents ?? 0) * f.suggestedQuantity),
          laborShare: comp
            ? comp.inputs
                .filter((i) => i.kind === 'labor')
                .reduce((s, i) => s + i.coefficient * i.unitCostCents, 0) /
              (comp.unitCostCents || 1)
            : 0,
        };
      });
    return [...base, ...extras];
  }, [items, compositions, quantities, added, budget]);
  const priced = useMemo(
    () =>
      price(pricingItems, {
        socialChargesPct: charges,
        baseChargesPct: budget?.socialChargesPct ?? charges,
        bdiPct: bdi,
        indirectRates: rates,
      }),
    [pricingItems, charges, bdi, rates, budget],
  );
  const totals = useMemo(() => new Map(priced.items.map((r) => [r.id, r.totalCents])), [priced]);
  const allItems = useMemo(
    () => [
      ...(items ?? []),
      ...pricingItems
        .filter((p) => p.id.startsWith('extra:'))
        .map((p) => ({
          id: p.id,
          budgetId: budgetId ?? '',
          code: 'X',
          group: p.group,
          description: p.description,
          unit: '',
          quantity: p.quantity,
          unitCostCents: 0,
          totalCents: totals.get(p.id) ?? 0,
          compositionId: '',
          confidence: 1,
          source: { fileName: '', page: 0 },
          priceSource: '',
          priceBaseDate: '',
        })),
    ],
    [items, pricingItems, budgetId, totals],
  );

  const read = () =>
    startJob.mutate('budget-takeoff', {
      onSuccess: (j) => {
        setJobId(j.id);
        setStep(1);
      },
    });
  const persist = (status: Budget['status']) =>
    budgetId && budget
      ? budgetsApi.update(budgetId, {
          status,
          bdiPct: bdi,
          socialChargesPct: charges,
          directCostCents: priced.directCents,
          indirectCostCents: priced.indirectTotalCents,
          bdiCents: priced.bdiCents,
          totalCents: priced.totalCents,
        })
      : Promise.resolve(undefined);

  const actions = (
    <div className="flex flex-wrap gap-2">
      <Button variant="outline" onClick={() => push(t('result.exported'))}>
        <Download /> {t('result.export')}
      </Button>
      <Button
        variant="outline"
        onClick={() =>
          budget &&
          create.mutate(
            {
              number: `PRO-${Date.now().toString().slice(-5)}`,
              title: budget.name,
              valueCents: priced.totalCents,
              stage: 'proposal',
              obraId: budget.obraId ?? null,
            },
            { onSuccess: () => push(t('result.proposalDone')) },
          )
        }
      >
        <Stamp /> {t('result.proposal')}
      </Button>
      <Button
        onClick={() =>
          void persist('in_review')
            .then(() =>
              reviewApi.create({
                kind: 'quantity_takeoff',
                title: budget?.name,
                recordType: 'budgets',
                recordId: budgetId,
                obraId: budget?.obraId ?? null,
                confidence: 0.9,
                priority: 1,
                source: { label: budget?.sourceFileName ?? '', preview: `${items?.length ?? 0}` },
                suggestedValue: priced.totalCents,
                status: 'pending',
                needsYou: true,
              }),
            )
            .then(() => {
              push(t('result.approvalDone'));
              void navigate('/review');
            })
        }
      >
        <Send /> {t('result.approval')}
      </Button>
    </div>
  );

  const waiting = step > 0 && !budget;
  let body;
  if (step === 0)
    body = (
      <InputStep
        level={level}
        onLevel={setLevel}
        files={projectFiles.map((f) => ({ id: f.id, name: String(f.name) }))}
        file={file || (projectFiles[0]?.id ?? '')}
        onFile={setFile}
        mode={mode}
        onMode={setMode}
      />
    );
  else if (waiting)
    body = job.data ? <JobTracker job={job.data} title={t('input.jobTitle')} /> : <SkeletonCard />;
  else if (step === 1)
    body = (
      <QuantitiesStep
        items={items ?? []}
        quantities={quantities}
        onQuantity={(id, v) => setQuantities((q) => ({ ...q, [id]: v }))}
        confirmed={confirmed}
        onConfirm={(id) => setConfirmed((c) => new Set(c).add(id))}
        totals={totals}
      />
    );
  else if (step === 2) body = <PricesStep items={items ?? []} compositions={compositions ?? []} />;
  else if (step === 3)
    body = (
      <IndirectsStep
        labels={labels}
        rates={rates}
        onRate={(i, r) => setOverrides((o) => ({ ...o, rates: { ...o.rates, [i]: r } }))}
        result={priced}
        people={overrides.people ?? 9}
        onPeople={(n) => setOverrides((o) => ({ ...o, people: n }))}
      />
    );
  else if (step === 4)
    body = (
      <BdiStep
        charges={charges}
        onCharges={(n) => setOverrides((o) => ({ ...o, charges: n }))}
        bdi={bdi}
        onBdi={(n) => setOverrides((o) => ({ ...o, bdi: n }))}
        result={priced}
      />
    );
  else
    body = (
      <ResultStep
        result={priced}
        items={allItems}
        totals={totals}
        findings={budget?.crossCheck ?? []}
        added={added}
        onAdd={(title) => setAdded((a) => new Set(a).add(title))}
        actions={actions}
        status={budget?.status ?? 'draft'}
      />
    );

  const canAdvance = step === 0 ? mode === 'paste' || Boolean(file || projectFiles[0]) : !waiting;
  return (
    <StepWizard
      steps={STEP_IDS.map((id) => ({ id, label: t(`steps.${id}`) }))}
      current={step}
      onStepChange={(next) => (step === 0 && next === 1 ? read() : setStep(next))}
      canAdvance={canAdvance && !startJob.isPending}
      onFinish={() => void navigate('/budgets')}
    >
      {body}
    </StepWizard>
  );
}
