import { differenceInCalendarDays, format, formatDistanceToNowStrict, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const LOCALE = 'pt-BR';
const moneyFormat = new Intl.NumberFormat(LOCALE, { style: 'currency', currency: 'BRL' });
const moneyCompact = new Intl.NumberFormat(LOCALE, {
  style: 'currency',
  currency: 'BRL',
  notation: 'compact',
  maximumFractionDigits: 1,
});

/** Dinheiro sempre chega em centavos inteiros (`amountCents`). */
export function formatMoney(cents: number, options: { compact?: boolean } = {}): string {
  return (options.compact ? moneyCompact : moneyFormat).format(cents / 100);
}

export function formatNumber(value: number, digits = 0): string {
  return value.toLocaleString(LOCALE, {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  });
}

/** Percentuais vão de 0 a 100. */
export function formatPercent(value: number, digits = 0): string {
  return `${formatNumber(value, digits)}%`;
}

export function formatQuantity(value: number, unit: string, digits = 0): string {
  return `${formatNumber(value, digits)} ${unit}`;
}

export function toDate(iso: string): Date {
  return parseISO(iso);
}

export function formatDate(iso: string, pattern = 'dd/MM/yyyy'): string {
  return format(parseISO(iso), pattern, { locale: ptBR });
}

export function formatDateShort(iso: string): string {
  return format(parseISO(iso), "d 'de' MMM", { locale: ptBR });
}

export function formatDateTime(iso: string): string {
  return format(parseISO(iso), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR });
}

export function formatWeekday(iso: string): string {
  return format(parseISO(iso), 'EEEE', { locale: ptBR });
}

export function formatRelative(iso: string): string {
  return formatDistanceToNowStrict(parseISO(iso), { locale: ptBR, addSuffix: true });
}

/** Dias entre hoje e a data (negativo = já passou). */
export function daysFromToday(iso: string): number {
  return differenceInCalendarDays(parseISO(iso), new Date());
}

export function formatLongDate(date: Date): string {
  return format(date, "EEEE, d 'de' MMMM 'de' yyyy", { locale: ptBR });
}

export function formatKilobytes(kb: number): string {
  return kb >= 1024 ? `${formatNumber(kb / 1024, 1)} MB` : `${formatNumber(kb)} KB`;
}
