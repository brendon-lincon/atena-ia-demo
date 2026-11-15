import type { EapItem } from '@/core/entities';

export interface EapNode {
  item: EapItem;
  children: EapItem[];
}

/** Frentes com suas folhas, na ordem do código da EAP. */
export function eapTree(items: EapItem[]): EapNode[] {
  const order = (a: EapItem, b: EapItem) =>
    a.code.localeCompare(b.code, 'pt-BR', { numeric: true });
  return items
    .filter((i) => i.level === 'front')
    .sort(order)
    .map((item) => ({ item, children: items.filter((c) => c.parentId === item.id).sort(order) }));
}
