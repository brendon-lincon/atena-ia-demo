import type { ComponentType } from 'react';
import type { DataViewKind } from '@/design/patterns/data-view';
import type { Tone } from '@/design/ui/misc';

export type Format =
  | 'text'
  | 'money'
  | 'date'
  | 'datetime'
  | 'percent'
  | 'number'
  | 'name'
  | 'badge'
  | 'validity'
  | 'bool'
  | 'list'
  | 'multiline';

export interface BadgeLabel {
  label: string;
  tone?: Tone;
}

export interface ConfigColumn {
  id: string;
  header: string;
  field: string;
  format?: Format;
  labels?: Record<string, BadgeLabel>;
  align?: 'right';
  sortable?: boolean;
  hideOnMobile?: boolean;
}

/** Descrição de uma aba de módulo sem tela sob medida: o `ConfigTabView` renderiza lista, quadro, calendário e detalhe. */
export interface ConfigTab {
  id: string;
  label: string;
  resource: string;
  columns: ConfigColumn[];
  filter?: Record<string, string>;
  sort?: string;
  views?: DataViewKind[];
  board?: {
    field: string;
    stages: { id: string; label: string; tone?: 'neutral' | 'primary' | 'success' | 'danger' }[];
    funnel?: boolean;
    valueField?: string;
  };
  dateField?: string;
  titleField?: string;
  /** Campos mostrados no detalhe (padrão: as colunas). */
  detail?: ConfigColumn[];
  emptyTitle?: string;
  emptyDescription?: string;
  /** Aba com tela própria (ex.: visão geral com gráficos). */
  Custom?: () => Promise<{ default: ComponentType }>;
}
