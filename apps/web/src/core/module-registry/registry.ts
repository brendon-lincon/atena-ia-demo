import {
  Building2,
  HardHat,
  Home,
  Library,
  MessagesSquare,
  Ruler,
  Settings2,
  type LucideIcon,
} from 'lucide-react';
import type { AreaId, Contribution, ExtensionPoint, ModuleManifest } from './types';

export interface Area {
  id: AreaId;
  order: number;
  icon: LucideIcon;
}

export const AREAS: Area[] = [
  { id: 'home', order: 1, icon: Home },
  { id: 'works', order: 2, icon: HardHat },
  { id: 'engineering', order: 3, icon: Ruler },
  { id: 'company', order: 4, icon: Building2 },
  { id: 'communication', order: 5, icon: MessagesSquare },
  { id: 'knowledge', order: 6, icon: Library },
  { id: 'system', order: 7, icon: Settings2 },
];

// Menu, rotas e paleta de comandos nascem dos manifestos: nenhum módulo é listado à mão.
const found = import.meta.glob<{ manifest: ModuleManifest }>('/src/modules/*/*/manifest.ts', {
  eager: true,
});
const modules: ModuleManifest[] = Object.values(found)
  .map((entry) => entry.manifest)
  .sort((a, b) => a.order - b.order);

export const registry = {
  all: (): ModuleManifest[] => modules,
  byId: (id: string): ModuleManifest | undefined => modules.find((m) => m.id === id),
  inArea: (area: AreaId): ModuleManifest[] => modules.filter((m) => m.area === area),
  /** Módulo dono de um caminho (o primeiro segmento é o id do módulo). */
  ofPath: (pathname: string): ModuleManifest | undefined => {
    const first = pathname.split('/').filter(Boolean)[0];
    return first ? modules.find((m) => m.id === first) : modules.find((m) => m.id === 'dashboard');
  },
  contributions<P = object>(point: ExtensionPoint): Contribution<P>[] {
    return modules
      .flatMap((m) => (m.contributes?.[point] ?? []) as Contribution<P>[])
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  },
  /** Caminho do detalhe de um registro, conforme `records` declarado por algum módulo. */
  recordPath(resource: string, id: string): string | undefined {
    const pattern = modules.map((m) => m.records?.[resource]).find(Boolean);
    return pattern?.replace(':id', id);
  },
  modulePath: (id: string): string => (id === 'dashboard' ? '/' : `/${id}`),
};
