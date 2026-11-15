import { Compass, Plus } from 'lucide-react';
import { createElement, useMemo } from 'react';
import { useNavigate } from 'react-router';
import { endpoints, type AtenaAction } from '@/core/api/endpoints';
import { runAtenaAction } from '@/core/atena/actions';
import { registry } from '@/core/module-registry/registry';
import type { AtenaAnswer, PaletteItem } from '@/design/patterns/command-palette';
import { useToasts } from '@/design/ui/toast';
import { t } from '@/app/i18n';

/** Itens da barra da Atena (nascem dos manifestos) e execução das respostas e ações dela. */
export function useAtena() {
  const navigate = useNavigate();
  const push = useToasts((state) => state.push);

  const items = useMemo<PaletteItem[]>(() => {
    const go = (to: string) => () => void navigate(to);
    const navigation = registry.all().map((m) => ({
      id: `go.${m.id}`,
      label: m.label,
      group: 'navigate' as const,
      icon: createElement(m.icon),
      keywords: [m.description],
      onSelect: go(registry.modulePath(m.id)),
    }));
    const creation = registry.all().flatMap((m) =>
      (m.commands ?? []).map((c) => ({
        id: c.id,
        label: c.label,
        group: c.group,
        icon: createElement(c.group === 'create' ? Plus : Compass),
        keywords: c.keywords,
        onSelect: go(c.to),
      })),
    );
    return [...navigation, ...creation];
  }, [navigate]);

  const run = async (action: AtenaAction) => {
    if (await runAtenaAction(action, (to) => void navigate(to))) push(t('shell.taskCreated'));
  };

  const ask = async (text: string): Promise<AtenaAnswer> => {
    const answer = await endpoints.atena(text);
    return {
      reply: answer.reply,
      sources: answer.sources.map((s) => ({ label: s.label })),
      actions: answer.actions.map((a) => ({
        label: a.label ?? t('shell.openRecord'),
        run: () => void run(a),
      })),
    };
  };

  return { items, ask };
}
