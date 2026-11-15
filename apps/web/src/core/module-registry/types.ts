import type { LucideIcon } from 'lucide-react';
import type { ComponentType } from 'react';
import type { Action } from '@/core/permissions';

export type AreaId =
  'home' | 'works' | 'engineering' | 'company' | 'communication' | 'knowledge' | 'system';

export interface RouteDef {
  /** Caminho relativo ao módulo ('' = página inicial do módulo, ':id' = detalhe). */
  path: string;
  load: () => Promise<{ default: ComponentType }>;
}

/** Ponto de extensão: um módulo entrega um componente que outro módulo apenas renderiza. */
export interface Contribution<P = object> {
  id: string;
  label: string;
  order?: number;
  load: () => Promise<{ default: ComponentType<P> }>;
}

export interface CommandContribution {
  id: string;
  label: string;
  group: 'navigate' | 'create';
  to: string;
  keywords?: string[];
}

export interface ModuleManifest {
  id: string;
  area: AreaId;
  order: number;
  label: string;
  description: string;
  icon: LucideIcon;
  routes?: RouteDef[];
  /** Rota de detalhe por coleção (ex.: `{ obras: '/works/:id' }`), usada por busca, avisos e Atena. */
  records?: Record<string, string>;
  commands?: CommandContribution[];
  contributes?: Record<string, Contribution<never>[]>;
  /** Ação exigida para ver o módulo (padrão: leitura). */
  requires?: Action;
}

/** Pontos de extensão conhecidos. */
export type ExtensionPoint =
  | 'work.tabs'
  | 'dashboard.cards'
  | 'command.actions'
  | 'record.actions'
  | 'contact.tabs'
  | 'employee.tabs';
