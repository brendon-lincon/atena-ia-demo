import { formatMoney, formatNumber } from '@/core/format';
import type { DocumentBlock } from '@/design/patterns/document-page';
import type { MeasurementFull, MeasurementItem } from '@/modules/works/measurements/api';
import { t } from '@/modules/works/measurements/i18n';

/** Blocos do boletim de medição (folha A4): cabeçalho, tabela de itens e totais com retenção. */
export function bulletinBlocks(
  measurement: MeasurementFull,
  items: MeasurementItem[],
  workName: string,
  dates: { start: string; end: string },
): DocumentBlock[] {
  const rows = [
    [
      t('bulletin.table'),
      t('columns.unit'),
      t('columns.contracted'),
      t('columns.period'),
      t('columns.accumulated'),
      t('columns.amount'),
    ],
    ...items.map((i) => [
      i.description,
      i.unit,
      formatNumber(i.contractedQty, 1),
      formatNumber(i.periodQty, 1),
      formatNumber(i.accumulatedQty, 1),
      formatMoney(i.periodCents),
    ]),
  ];
  return [
    { type: 'heading', text: t('bulletin.title', { number: measurement.number }) },
    {
      type: 'paragraph',
      text: t('bulletin.subtitle', { work: workName, start: dates.start, end: dates.end }),
    },
    { type: 'table', rows },
    {
      type: 'paragraph',
      text: `${t('totals.period')}: ${formatMoney(measurement.amountCents)}\n${t('totals.accumulated')}: ${formatMoney(measurement.accumulatedCents)}\n${t('totals.retention', { pct: measurement.retentionPct })}: ${formatMoney(measurement.retentionCents)}\n${t('totals.net')}: ${formatMoney(measurement.netCents)}`,
    },
    { type: 'paragraph', text: t('bulletin.note') },
  ];
}
