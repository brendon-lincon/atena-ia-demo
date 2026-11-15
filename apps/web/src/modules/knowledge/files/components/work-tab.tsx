import { ConfigTabView } from '@/core/module-config/config-tab-view';
import { tabs } from '@/modules/knowledge/files/config';

/** Aba da obra: a mesma aba "all" do módulo, filtrada pela obra. */
export default function WorkTab({ obraId }: { obraId: string }) {
  const tab = tabs.find((x) => x.id === 'all');
  return tab ? <ConfigTabView tab={tab} extraFilter={{ obraId: obraId }} /> : null;
}
