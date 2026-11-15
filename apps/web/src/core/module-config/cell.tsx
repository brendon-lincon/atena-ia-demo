import { createT } from '@/core/i18n/create-t';
import { messages } from '@/core/i18n/messages';
import {
  daysFromToday,
  formatDate,
  formatDateTime,
  formatMoney,
  formatNumber,
  formatPercent,
} from '@/core/format';
import { StatusBadge } from '@/design/patterns/status-badge';
import { Badge } from '@/design/ui/misc';
import type { ConfigColumn } from './types';

const t = createT(messages);
const EXPIRING_DAYS = 30;

export type Cell = string | number | boolean | (string | number)[] | null | undefined;

/** Lê um campo (aceita caminho com pontos); objetos aninhados não são valores de célula. */
export function pick(record: Record<string, unknown>, field: string): Cell {
  let value: unknown = record;
  for (const part of field.split('.')) {
    if (typeof value !== 'object' || value === null) return undefined;
    value = (value as Record<string, unknown>)[part];
  }
  if (
    typeof value === 'string' ||
    typeof value === 'number' ||
    typeof value === 'boolean' ||
    value === null ||
    value === undefined
  )
    return value;
  return Array.isArray(value)
    ? value.filter((v): v is string | number => typeof v === 'string' || typeof v === 'number')
    : undefined;
}

/** Valor de uma coluna formatado conforme o tipo declarado na configuração. */
export function renderCell(
  column: ConfigColumn,
  record: Record<string, unknown>,
  nameOf: (id: string | null | undefined) => string,
) {
  const value = pick(record, column.field);
  if (value === undefined || value === null || value === '') return t('common.noValue');
  switch (column.format) {
    case 'money':
      return formatMoney(Number(value));
    case 'date':
      return formatDate(String(value));
    case 'datetime':
      return formatDateTime(String(value));
    case 'percent':
      return formatPercent(Number(value), 1);
    case 'number':
      return formatNumber(Number(value));
    case 'name':
      return nameOf(String(value)) || t('common.noValue');
    case 'bool':
      return value === true ? t('common.yes') : t('common.no');
    case 'list':
      return Array.isArray(value) ? value.join(', ') : String(value);
    case 'multiline':
      return <span className="whitespace-pre-line">{String(value)}</span>;
    case 'badge': {
      const entry = column.labels?.[String(value)];
      return <StatusBadge tone={entry?.tone ?? 'neutral'} label={entry?.label ?? String(value)} />;
    }
    case 'validity': {
      const days = daysFromToday(String(value));
      const tone = days < 0 ? 'danger' : days <= EXPIRING_DAYS ? 'warning' : 'neutral';
      return (
        <span className="inline-flex items-center gap-2">
          <span className="tnum">{formatDate(String(value))}</span>
          <Badge tone={tone}>{`${days}d`}</Badge>
        </span>
      );
    }
    default:
      return String(value);
  }
}

/** Valor ordenável de uma coluna (números e textos; datas já ordenam como texto ISO). */
export function sortValue(
  column: ConfigColumn,
  record: Record<string, unknown>,
): string | number | null {
  const value = pick(record, column.field);
  if (value === undefined || value === null) return null;
  return typeof value === 'number' ? value : String(value);
}
