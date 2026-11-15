import { useQuery } from '@tanstack/react-query';
import { Link, useParams } from 'react-router';
import { z } from 'zod';
import { defineResource } from '@/core/api/resource';
import { looseRecord } from '@/core/api/loose';
import { useDirectory } from '@/core/directory/use-directory';
import { employees } from '@/core/entities';
import { formatDate, formatMoney } from '@/core/format';
import { useRecordShellData } from '@/core/record/use-record-shell';
import { useRecord } from '@/core/api/hooks';
import { EmptyState, ErrorState } from '@/design/patterns/empty-state';
import { RecordShell } from '@/design/patterns/record-shell';
import { SkeletonCard } from '@/design/patterns/skeleton';
import { VerticalTimeline, type VerticalEntry } from '@/design/patterns/timeline';
import { Button } from '@/design/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/design/ui/misc';
import { p } from '@/modules/company/people/page-i18n';

const sources = ['allocations', 'health-exams', 'trainings', 'advances', 'work-accidents'] as const;
const loose = z.array(looseRecord);

/** Ficha do colaborador: dados do vínculo e linha do tempo de alocações, exames, treinamentos, vales e ocorrências. */
export default function EmployeePage() {
  const { id } = useParams();
  const employee = useRecord(employees, id);
  const dir = useDirectory();
  const extras = useRecordShellData('employees', id);
  const events = useQuery({
    queryKey: ['employee-timeline', id],
    enabled: Boolean(id),
    queryFn: async () => {
      const lists = await Promise.all(
        sources.map(async (name) =>
          loose.parse(
            (
              await defineResource(name, looseRecord).list({
                filter: { employeeId: id ?? '' },
                pageSize: 100,
              })
            ).data,
          ),
        ),
      );
      const [alloc, exams, trainings, advances, accidents] = lists;
      const entries: VerticalEntry[] = [
        ...(alloc ?? []).map((r) => ({
          id: r.id,
          date: String(r.startDate),
          title: p('alloc', { obra: dir.name(String(r.obraId)) }),
          tone: 'primary' as const,
        })),
        ...(exams ?? []).map((r) => ({
          id: r.id,
          date: String(r.issuedAt),
          title: p('exam'),
          description: `${p('validUntil')} ${formatDate(String(r.validUntil))}`,
          tone: 'success' as const,
        })),
        ...(trainings ?? []).map((r) => ({
          id: r.id,
          date: String(r.completedAt),
          title: `${String(r.courseCode)} — ${String(r.title)}`,
          tone: 'success' as const,
        })),
        ...(advances ?? []).map((r) => ({
          id: r.id,
          date: String(r.date),
          title: p('advance', { value: formatMoney(Number(r.amountCents)) }),
          tone: 'neutral' as const,
        })),
        ...(accidents ?? []).map((r) => ({
          id: r.id,
          date: String(r.date),
          title: p('accident'),
          description: typeof r.description === 'string' ? r.description : '',
          tone: 'danger' as const,
        })),
      ];
      return entries.sort((a, b) => b.date.localeCompare(a.date));
    },
  });
  if (employee.isLoading) return <SkeletonCard />;
  if (employee.isError || !employee.data)
    return employee.error && 'status' in employee.error && employee.error.status === 404 ? (
      <EmptyState
        illustration="error"
        title={p('notFound')}
        action={
          <Button asChild variant="outline">
            <Link to="/people">{p('back')}</Link>
          </Button>
        }
      />
    ) : (
      <ErrorState onRetry={() => void employee.refetch()} />
    );
  const e = employee.data;
  return (
    <RecordShell
      title={e.name}
      description={`${e.roleLabel} · ${dir.name(e.obraId)}`}
      crumbs={[{ label: p('crumb'), to: '/people' }, { label: e.name }]}
      {...extras}
    >
      <div className="grid gap-5 lg:grid-cols-[1fr_1.4fr]">
        <Card>
          <CardHeader>
            <CardTitle>{p('data')}</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-2 text-base">
              <dt className="text-muted-foreground">{p('registration')}</dt>
              <dd className="text-right font-numeric">{registrationOf(e)}</dd>
              <dt className="text-muted-foreground">{p('work')}</dt>
              <dd className="text-right">{dir.name(e.obraId)}</dd>
              {e.teamName && (
                <>
                  <dt className="text-muted-foreground">{p('team')}</dt>
                  <dd className="text-right">{e.teamName}</dd>
                </>
              )}
            </dl>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>{p('timeline')}</CardTitle>
          </CardHeader>
          <CardContent>
            {events.data && events.data.length > 0 ? (
              <VerticalTimeline entries={events.data} />
            ) : (
              <EmptyState title={p('emptyTimeline')} className="py-6" />
            )}
          </CardContent>
        </Card>
      </div>
    </RecordShell>
  );
}

function registrationOf(e: object): string {
  const value = (e as { registration?: unknown }).registration;
  return typeof value === 'string' ? value : '—';
}
