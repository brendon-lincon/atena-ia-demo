import { useMemo, useState } from 'react';
import { AlertTriangle, ListPlus } from 'lucide-react';
import { useCreate } from '@/core/api/hooks';
import { useDirectory } from '@/core/directory/use-directory';
import { tasks, type Allocation, type Employee } from '@/core/entities';
import { formatDate } from '@/core/format';
import { Histogram } from '@/design/patterns/charts';
import { Button } from '@/design/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/design/ui/misc';
import { useToasts } from '@/design/ui/toast';
import { conflicts, weeklyLoad } from '@/modules/works/planning/lib/resources';
import { t } from '@/modules/works/planning/i18n';

const WEEKS = 10;

/** Histograma de mão de obra; o conflito aparece em vermelho, com sugestão e atalho para criar a tarefa. */
export function ResourcesTab({
  allocations,
  employees,
}: {
  allocations: Allocation[];
  employees: Employee[];
}) {
  const dir = useDirectory();
  const [now] = useState(() => new Date());
  const create = useCreate(tasks);
  const push = useToasts((s) => s.push);
  const weeks = useMemo(() => weeklyLoad(allocations, WEEKS, now), [allocations, now]);
  const roles = useMemo(() => {
    const keys = [...new Set(weeks.flatMap((w) => Object.keys(w.byRole)))];
    return keys.map((key) => ({
      key,
      label: employees.find((e) => e.role === key)?.roleLabel ?? key,
    }));
  }, [weeks, employees]);
  const found = useMemo(
    () =>
      weeks.filter((w) => w.conflict).flatMap((w) => conflicts(allocations, employees, w.start)),
    [weeks, allocations, employees],
  );
  const first = found[0];
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>{t('resources.title')}</CardTitle>
          <span className="text-sm text-muted-foreground">{t('resources.weeks')}</span>
        </CardHeader>
        <CardContent>
          <Histogram
            data={weeks.map((w) => ({ label: w.label, values: w.byRole, capacity: w.capacity }))}
            roles={roles}
            height={340}
          />
        </CardContent>
      </Card>
      {first ? (
        <div
          role="alert"
          className="surface-card flex flex-col gap-3 border-l-4 border-l-danger p-4"
        >
          <p className="flex items-center gap-2 text-lg font-semibold">
            <AlertTriangle className="size-5 text-danger" />
            {t('resources.conflictTitle')}
          </p>
          <p className="text-base">
            {t('resources.conflictBody', {
              role: employees.find((e) => e.role === first.role)?.roleLabel ?? first.role,
              count: first.employees.length,
              week: formatDate(first.week, 'dd/MM'),
            })}
          </p>
          <p className="rounded-md bg-primary-soft px-3 py-2 text-base">
            {t('resources.suggestion', {
              keep: first.keep,
              first: dir.name(first.obras[0]),
              move: first.move,
              second: dir.name(first.obras[1]),
            })}
          </p>
          <Button
            className="self-start"
            variant="outline"
            onClick={() =>
              create.mutate(
                {
                  title: t('resources.suggestion', {
                    keep: first.keep,
                    first: dir.name(first.obras[0]),
                    move: first.move,
                    second: dir.name(first.obras[1]),
                  }),
                  status: 'todo',
                  priority: 'high',
                  origin: 'atena',
                },
                { onSuccess: () => push(t('resources.taskCreated')) },
              )
            }
          >
            <ListPlus /> {t('resources.openTasks')}
          </Button>
        </div>
      ) : (
        <p className="text-base text-muted-foreground">{t('resources.noConflict')}</p>
      )}
    </div>
  );
}
