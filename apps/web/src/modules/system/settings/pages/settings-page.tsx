import { useQuery } from '@tanstack/react-query';
import { addDays, format } from 'date-fns';
import { useState } from 'react';
import { Link, useSearchParams } from 'react-router';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { useAuth } from '@/core/auth/auth-store';
import { ConfigTabView } from '@/core/module-config/config-tab-view';
import type { ConfigTab } from '@/core/module-config/types';
import { useList } from '@/core/api/hooks';
import { request } from '@/core/api/client';
import { useCompany } from '@/core/entities/use-company';
import { formatRelative } from '@/core/format';
import { useJob, useStartJob } from '@/core/jobs/use-job';
import { readPreference, writePreference } from '@/core/preferences/storage';
import { registry } from '@/core/module-registry/registry';
import { resolvedTheme, useTheme, type ThemeMode } from '@/core/theme/theme-store';
import { duration } from '@/design/motion.generated';
import { JobTracker } from '@/design/patterns/job-tracker';
import { PageHeader } from '@/design/patterns/page-header';
import { Segmented } from '@/design/ui/segmented';
import { Button } from '@/design/ui/button';
import { Input, Label, Slider, Switch } from '@/design/ui/form';
import { Badge, Card, CardContent, CardHeader, CardTitle } from '@/design/ui/misc';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/design/ui/tabs';
import { useToasts } from '@/design/ui/toast';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableRow,
} from '@/design/ui/table';
import { t } from '@/modules/system/settings/i18n';
import { libraryApi } from '@/modules/system/settings/api';

const TABS = [
  'account',
  'company',
  'users',
  'modules',
  'channels',
  'ai',
  'memory',
  'sources',
  'integrations',
  'health',
  'backup',
  'transfer',
  'activity',
] as const;
const USERS: ConfigTab = {
  id: 'users',
  label: '',
  resource: 'users',
  columns: [
    { id: 'name', header: t('users.name'), field: 'name' },
    { id: 'email', header: t('users.email'), field: 'email', hideOnMobile: true },
    { id: 'role', header: t('users.role'), field: 'roleLabel' },
    { id: 'active', header: t('users.active'), field: 'active', format: 'bool' },
  ],
};
const ACTIVITY: ConfigTab = {
  id: 'activity',
  label: '',
  resource: 'activity',
  sort: '-at',
  columns: [
    { id: 'at', header: t('activity.when'), field: 'at', format: 'datetime' },
    { id: 'who', header: t('activity.who'), field: 'userId', format: 'name', hideOnMobile: true },
    { id: 'what', header: t('activity.what'), field: 'summary' },
  ],
};
const SERVICES = [
  'api',
  'database',
  'queue',
  'ai',
  'whatsapp',
  'email',
  'storage',
  'jobs',
] as const;
const axis = {
  stroke: 'var(--border)',
  tick: { fill: 'var(--muted-foreground)', fontSize: 12 },
} as const;
const tooltipStyle = {
  background: 'var(--elevated)',
  border: '1px solid var(--border)',
  borderRadius: 12,
  color: 'var(--foreground)',
  fontSize: 13,
} as const;

function Account() {
  const user = useAuth((s) => s.user);
  const { mode, setMode } = useTheme();
  const [density, setDensity] = useState(() => readPreference('density') ?? 'comfortable');
  const pick = (value: string) => {
    setDensity(value);
    writePreference('density', value);
    if (value === 'compact') document.documentElement.setAttribute('data-density', 'compact');
    else document.documentElement.removeAttribute('data-density');
  };
  return (
    <Card className="max-w-xl">
      <CardContent className="space-y-5 pt-5">
        <dl className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-2 text-base">
          <dt className="text-muted-foreground">{t('account.name')}</dt>
          <dd className="text-right font-medium">{user?.name}</dd>
          <dt className="text-muted-foreground">{t('account.email')}</dt>
          <dd className="text-right">{user?.email}</dd>
          <dt className="text-muted-foreground">{t('account.role')}</dt>
          <dd className="text-right">{user?.roleLabel}</dd>
        </dl>
        <div className="space-y-1.5">
          <Label>{t('account.theme')}</Label>
          <Segmented
            value={mode}
            onChange={(v: ThemeMode) => setMode(v)}
            options={[
              {
                value: 'system',
                label: resolvedTheme('system') === 'dark' ? '◐' : '◑',
                ariaLabel: 'system',
              },
              { value: 'light', label: '☀' },
              { value: 'dark', label: '☾' },
            ]}
          />
        </div>
        <div className="space-y-1.5">
          <Label>{t('account.density')}</Label>
          <Segmented
            value={density}
            onChange={pick}
            options={[
              { value: 'comfortable', label: t('account.comfortable') },
              { value: 'compact', label: t('account.compact') },
            ]}
          />
        </div>
        <p className="text-sm text-muted-foreground">{t('account.session')}</p>
      </CardContent>
    </Card>
  );
}

function Company() {
  const c = useCompany().data;
  if (!c) return null;
  return (
    <Card className="max-w-xl">
      <CardContent className="space-y-4 pt-5">
        <dl className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-2 text-base">
          <dt className="text-muted-foreground">{t('company.name')}</dt>
          <dd className="text-right font-medium">{c.legalName}</dd>
          <dt className="text-muted-foreground">{t('company.cnpj')}</dt>
          <dd className="text-right font-numeric">{c.cnpj}</dd>
          <dt className="text-muted-foreground">{t('company.address')}</dt>
          <dd className="text-right">
            {c.address.street}, {c.address.city}/{c.address.state}
          </dd>
          <dt className="text-muted-foreground">{t('company.responsible')}</dt>
          <dd className="text-right">
            {c.technicalResponsible.name} — {c.technicalResponsible.council}{' '}
            {c.technicalResponsible.registration}
          </dd>
        </dl>
        <p className="text-sm text-muted-foreground">{t('company.identity')}</p>
        <Button asChild variant="outline">
          <Link to="/standards">{t('company.open')}</Link>
        </Button>
      </CardContent>
    </Card>
  );
}

function Switches({ rows, columns }: { rows: string[]; columns: string[] }) {
  const push = useToasts((s) => s.push);
  return (
    <div className="surface-card overflow-hidden">
      <Table>
        <TableHead>
          <tr>
            <TableHeaderCell>{t('channels.type')}</TableHeaderCell>
            {columns.map((c) => (
              <TableHeaderCell key={c} className="text-center">
                {c}
              </TableHeaderCell>
            ))}
          </tr>
        </TableHead>
        <TableBody>
          {rows.map((r) => (
            <TableRow key={r}>
              <TableCell className="font-medium">{r}</TableCell>
              {columns.map((c, i) => (
                <TableCell key={c} className="text-center">
                  <Switch
                    defaultChecked={i === 0}
                    aria-label={`${r} — ${c}`}
                    onCheckedChange={() => push(t('channels.saved'))}
                  />
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

function Health() {
  const [checked, setChecked] = useState(0);
  const push = useToasts((s) => s.push);
  const ping = useQuery({
    queryKey: ['health', checked],
    queryFn: async () => {
      const start = performance.now();
      await request('GET', '/health', { auth: false });
      return Math.round(performance.now() - start);
    },
  });
  return (
    <div className="space-y-4">
      <Button
        onClick={() => {
          setChecked((n) => n + 1);
          push(t('health.checked'));
        }}
        variant="outline"
      >
        {ping.isFetching ? t('health.checking') : t('health.check')}
      </Button>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {SERVICES.map((s) => (
          <div key={s} className="surface-card flex items-center gap-3 p-4">
            <span className="relative flex size-3">
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-success opacity-50 motion-reduce:hidden" />
              <span className="relative inline-flex size-3 rounded-full bg-success" />
            </span>
            <span className="min-w-0">
              <span className="block text-base font-semibold">{t(`health.services.${s}`)}</span>
              <span className="text-sm text-muted-foreground">
                {t('health.ok')} ·{' '}
                {s === 'api' && ping.data !== undefined
                  ? t('health.latency', { ms: ping.data })
                  : t('health.simulated')}
              </span>
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function Ai() {
  const [limit, setLimit] = useState([400]);
  const [now] = useState(() => new Date());
  const days = Array.from({ length: 14 }, (_, i) => ({
    label: format(addDays(now, i - 13), 'dd/MM'),
    value: 8 + ((i * 7) % 19) + (i > 9 ? 12 : 0),
  }));
  const byModule = (['budgets', 'documents', 'athena', 'files'] as const).map((k, i) => ({
    name: t(`ai.modules.${k}`),
    value: [42, 28, 19, 11][i] ?? 0,
  }));
  const ms = duration.data * 1000;
  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">{t('ai.hint')}</p>
      <div className="grid gap-5 lg:grid-cols-[1fr_1.4fr]">
        <Card>
          <CardContent className="space-y-4 pt-5">
            <div className="flex justify-between">
              <Label>{t('ai.limit')}</Label>
              <span className="tnum font-semibold">
                {t('ai.limitValue', { value: limit[0] ?? 0 })}
              </span>
            </div>
            <Slider
              value={limit}
              min={100}
              max={1000}
              step={50}
              onValueChange={setLimit}
              aria-label={t('ai.limit')}
            />
            <p className="text-sm text-muted-foreground">{t('ai.provider', { name: 'Claude' })}</p>
            <div className="h-48">
              <ResponsiveContainer>
                <BarChart data={byModule} layout="vertical" margin={{ left: 16 }}>
                  <CartesianGrid stroke="var(--border)" horizontal={false} strokeDasharray="3 5" />
                  <XAxis type="number" {...axis} />
                  <YAxis type="category" dataKey="name" {...axis} width={96} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Bar
                    dataKey="value"
                    fill="var(--chart-3)"
                    radius={[0, 4, 4, 0]}
                    animationDuration={ms}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>{t('ai.usage')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer>
                <BarChart data={days}>
                  <CartesianGrid stroke="var(--border)" vertical={false} strokeDasharray="3 5" />
                  <XAxis dataKey="label" {...axis} />
                  <YAxis {...axis} width={32} />
                  <Tooltip contentStyle={tooltipStyle} cursor={{ fill: 'var(--muted)' }} />
                  <Bar
                    dataKey="value"
                    fill="var(--chart-2)"
                    radius={[4, 4, 0, 0]}
                    animationDuration={ms}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function Memory() {
  const [items, setItems] = useState<('a' | 'b' | 'c' | 'd')[]>(['a', 'b', 'c', 'd']);
  return items.length === 0 ? (
    <p className="text-muted-foreground">{t('memory.empty')}</p>
  ) : (
    <div className="space-y-3">
      <p className="text-sm text-muted-foreground">{t('memory.hint')}</p>
      <ul className="max-w-2xl space-y-2">
        {items.map((k) => (
          <li
            key={k}
            className="surface-card flex items-center justify-between gap-3 p-3 text-base"
          >
            {t(`memory.items.${k}`)}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setItems((cur) => cur.filter((x) => x !== k))}
            >
              {t('memory.remove')}
            </Button>
          </li>
        ))}
      </ul>
    </div>
  );
}

function Sources() {
  const list = useList(libraryApi, { pageSize: 100 });
  const [now] = useState(() => Date.now());
  const rows = (list.data?.data ?? [])
    .filter((i) => i.kind === 'law' || i.kind === 'regulation')
    .slice(0, 12);
  if (rows.length === 0) return <p className="text-muted-foreground">{t('sources.empty')}</p>;
  return (
    <div className="space-y-3">
      <p className="text-sm text-muted-foreground">{t('sources.hint')}</p>
      <div className="surface-card overflow-hidden">
        <Table>
          <TableHead>
            <tr>
              <TableHeaderCell>{t('sources.source')}</TableHeaderCell>
              <TableHeaderCell>{t('sources.routine')}</TableHeaderCell>
              <TableHeaderCell className="hidden md:table-cell">
                {t('sources.lastCheck')}
              </TableHeaderCell>
            </tr>
          </TableHead>
          <TableBody>
            {rows.map((r, i) => (
              <TableRow key={r.id}>
                <TableCell>
                  <span className="block font-medium">{r.code}</span>
                  <span className="text-sm text-muted-foreground">{r.title}</span>
                </TableCell>
                <TableCell>{i % 2 ? t('sources.monthly') : t('sources.weekly')}</TableCell>
                <TableCell className="hidden md:table-cell">
                  <Badge tone="success">{t('sources.ok')}</Badge>{' '}
                  <span className="text-sm text-muted-foreground">
                    {formatRelative(new Date(now - (i + 1) * 36e5 * 5).toISOString())}
                  </span>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

function Backup() {
  const push = useToasts((s) => s.push);
  return (
    <div className="grid max-w-3xl gap-3 sm:grid-cols-3">
      {[
        ['backup.last', t('backup.hours', { n: 6 })],
        ['backup.external', t('backup.hours', { n: 12 })],
        ['backup.restore', t('backup.days', { n: 7 })],
      ].map(([k, v]) => (
        <div key={k} className="surface-card p-4">
          <p className="text-sm text-muted-foreground">{t(k as 'backup.last')}</p>
          <p className="text-lg font-semibold">{v}</p>
          <Badge tone="success">{t('backup.okLabel')}</Badge>
        </div>
      ))}
      <Button className="sm:col-span-3 sm:w-fit" onClick={() => push(t('backup.done'))}>
        {t('backup.now')}
      </Button>
    </div>
  );
}

function Transfer() {
  const start = useStartJob();
  const [jobId, setJobId] = useState<string>();
  const job = useJob(jobId);
  const push = useToasts((s) => s.push);
  const name = (job.data?.result as { fileName?: string } | null)?.fileName ?? '';
  return (
    <div className="grid gap-5 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>{t('transfer.exportTitle')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">{t('transfer.exportHint')}</p>
          <Button
            onClick={() => start.mutate('export-package', { onSuccess: (j) => setJobId(j.id) })}
            disabled={Boolean(jobId) && job.data?.status !== 'done'}
          >
            {t('transfer.export')}
          </Button>
          {job.data && (
            <JobTracker
              job={job.data}
              title={t('transfer.jobTitle')}
              result={<p className="text-base font-medium">{t('transfer.ready', { name })}</p>}
            />
          )}
        </CardContent>
      </Card>
      <Card className="h-fit">
        <CardHeader>
          <CardTitle>{t('transfer.importTitle')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">{t('transfer.importHint')}</p>
          <div className="space-y-1.5">
            <Label htmlFor="pkg">{t('transfer.file')}</Label>
            <Input id="pkg" type="file" accept=".zip" />
          </div>
          <Button variant="outline" onClick={() => push(t('transfer.importDone'))}>
            {t('transfer.import')}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

/** Configurações: todas as abas da seção 5.7.3 da arquitetura, incluindo telemetria e saúde e exportação. */
export default function SettingsPage() {
  const [params, setParams] = useSearchParams();
  const tab = (TABS as readonly string[]).includes(params.get('tab') ?? '')
    ? (params.get('tab') as (typeof TABS)[number])
    : 'account';
  return (
    <div>
      <PageHeader title={t('title')} description={t('subtitle')} />
      <Tabs value={tab} onValueChange={(v) => setParams({ tab: v }, { replace: true })}>
        <TabsList>
          {TABS.map((k) => (
            <TabsTrigger key={k} value={k}>
              {t(`tabs.${k}`)}
            </TabsTrigger>
          ))}
        </TabsList>
        <TabsContent value="account">
          <Account />
        </TabsContent>
        <TabsContent value="company">
          <Company />
        </TabsContent>
        <TabsContent value="users">
          <ConfigTabView tab={USERS} />
        </TabsContent>
        <TabsContent value="modules">
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">{t('modules.hint')}</p>
            <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
              {registry.all().map((m) => (
                <div key={m.id} className="surface-card flex items-center gap-3 p-3">
                  <m.icon className="size-4 text-primary" />
                  <span className="min-w-0 flex-1 truncate text-base">{m.label}</span>
                  <Switch defaultChecked aria-label={m.label} />
                </div>
              ))}
            </div>
          </div>
        </TabsContent>
        <TabsContent value="channels">
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">{t('channels.hint')}</p>
            <Switches
              rows={[
                t('channels.deadlines'),
                t('channels.insights'),
                t('channels.reviews'),
                t('channels.messages'),
              ]}
              columns={[t('channels.system'), t('channels.email'), t('channels.whatsapp')]}
            />
          </div>
        </TabsContent>
        <TabsContent value="ai">
          <Ai />
        </TabsContent>
        <TabsContent value="memory">
          <Memory />
        </TabsContent>
        <TabsContent value="sources">
          <Sources />
        </TabsContent>
        <TabsContent value="integrations">
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {(['whatsapp', 'email', 'calendar', 'maps'] as const).map((k, i) => (
              <div key={k} className="surface-card space-y-2 p-4">
                <p className="text-base font-semibold">{t(`integrations.${k}`)}</p>
                <p className="text-sm text-muted-foreground">{t(`integrations.${k}Hint`)}</p>
                <Badge tone={i === 2 ? 'neutral' : 'success'}>
                  {i === 2 ? t('integrations.available') : t('integrations.connected')}
                </Badge>
              </div>
            ))}
          </div>
        </TabsContent>
        <TabsContent value="health">
          <Health />
        </TabsContent>
        <TabsContent value="backup">
          <Backup />
        </TabsContent>
        <TabsContent value="transfer">
          <Transfer />
        </TabsContent>
        <TabsContent value="activity">
          <ConfigTabView tab={ACTIVITY} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
