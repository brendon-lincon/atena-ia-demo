import { Sparkles } from 'lucide-react';
import { useState } from 'react';
import { useSearchParams } from 'react-router';
import { useCreate, useList, useUpdate } from '@/core/api/hooks';
import { useDirectory } from '@/core/directory/use-directory';
import { tasks, type Task } from '@/core/entities';
import { daysFromToday, formatDate } from '@/core/format';
import { DataView } from '@/design/patterns/data-view';
import { PageHeader } from '@/design/patterns/page-header';
import { Badge, type Tone } from '@/design/ui/misc';
import { Button } from '@/design/ui/button';
import { Input } from '@/design/ui/form';
import { useToasts } from '@/design/ui/toast';
import { t } from '@/modules/home/tasks/i18n';

const STAGES = [
  { id: 'todo', label: t('status.todo'), tone: 'neutral' as const },
  { id: 'doing', label: t('status.doing'), tone: 'primary' as const },
  { id: 'blocked', label: t('status.blocked'), tone: 'danger' as const },
  { id: 'done', label: t('status.done'), tone: 'success' as const },
];
const PRIORITY: Record<Task['priority'], Tone> = {
  low: 'neutral',
  medium: 'info',
  high: 'warning',
  urgent: 'danger',
};
const PRIORITY_RANK: Record<Task['priority'], number> = { urgent: 0, high: 1, medium: 2, low: 3 };

/** Tarefas (empresa e obra) — uma entidade só, com obra opcional. Também entregue como aba da obra. */
export default function TasksPage({ obraId }: { obraId?: string }) {
  const [params] = useSearchParams();
  const dir = useDirectory();
  const list = useList(tasks, {
    filter: obraId ? { obraId } : undefined,
    pageSize: 200,
    sort: 'dueDate',
  });
  const update = useUpdate(tasks);
  const create = useCreate(tasks);
  const push = useToasts((s) => s.push);
  const [title, setTitle] = useState('');
  const rows = list.data?.data ?? [];
  const card = (task: Task) => (
    <div className="space-y-1.5">
      <p className="text-base leading-snug font-medium">{task.title}</p>
      <div className="flex flex-wrap items-center gap-1.5 text-xs">
        <Badge tone={PRIORITY[task.priority]}>{t(`priority.${task.priority}`)}</Badge>
        {task.dueDate && (
          <Badge
            tone={task.status !== 'done' && daysFromToday(task.dueDate) < 0 ? 'danger' : 'neutral'}
          >
            {formatDate(task.dueDate, 'dd/MM')}
          </Badge>
        )}
        {task.origin === 'atena' && (
          <span title={t('fromAtena')} className="text-primary">
            <Sparkles className="size-3.5" />
          </span>
        )}
      </div>
      {task.assigneeId && (
        <p className="text-xs text-muted-foreground">{dir.name(task.assigneeId)}</p>
      )}
    </div>
  );
  const body = (
    <DataView<Task>
      rows={[...rows].sort((a, b) => PRIORITY_RANK[a.priority] - PRIORITY_RANK[b.priority])}
      views={['board', 'table']}
      loading={list.isLoading}
      error={list.isError}
      onRetry={() => void list.refetch()}
      searchText={(task) => `${task.title} ${dir.name(task.assigneeId)}`}
      board={{
        stages: STAGES,
        stageOf: (task) => task.status,
        render: card,
        onMove: (task, stage) =>
          update.mutate({ id: task.id, patch: { status: stage as Task['status'] } }),
      }}
      columns={[
        {
          id: 'title',
          header: t('columns.title'),
          cell: (task) => <span className="font-medium">{task.title}</span>,
          sort: (task) => task.title,
        },
        {
          id: 'assignee',
          header: t('columns.assignee'),
          cell: (task) => dir.name(task.assigneeId),
          hideOnMobile: true,
        },
        {
          id: 'due',
          header: t('columns.due'),
          cell: (task) => (task.dueDate ? formatDate(task.dueDate) : ''),
          sort: (task) => task.dueDate ?? '',
        },
        {
          id: 'priority',
          header: t('columns.priority'),
          cell: (task) => (
            <Badge tone={PRIORITY[task.priority]}>{t(`priority.${task.priority}`)}</Badge>
          ),
          sort: (task) => PRIORITY_RANK[task.priority],
        },
        { id: 'status', header: t('columns.status'), cell: (task) => t(`status.${task.status}`) },
      ]}
      toolbar={
        <form
          className="flex gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            if (!title.trim()) return;
            create.mutate(
              {
                title: title.trim(),
                status: 'todo',
                priority: 'medium',
                obraId: obraId ?? null,
                origin: 'manual',
              },
              {
                onSuccess: () => {
                  setTitle('');
                  push(t('created'));
                },
              },
            );
          }}
        >
          <Input
            autoFocus={params.get('new') === '1'}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={t('newPlaceholder')}
            aria-label={t('newTask')}
            className="w-64"
          />
          <Button type="submit" variant="outline" disabled={!title.trim()}>
            {t('add')}
          </Button>
        </form>
      }
    />
  );
  if (obraId) return body;
  return (
    <div>
      <PageHeader title={t('title')} description={t('subtitle')} />
      {body}
    </div>
  );
}
