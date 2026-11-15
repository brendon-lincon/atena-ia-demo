import { LayoutGrid, MapIcon, Table2 } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router';
import { useList } from '@/core/api/hooks';
import { useDirectory } from '@/core/directory/use-directory';
import { obras, type Obra } from '@/core/entities';
import { formatDate, formatMoney, formatPercent } from '@/core/format';
import { Cascade, CascadeItem } from '@/design/patterns/cascade';
import { DataView } from '@/design/patterns/data-view';
import { EmptyState, ErrorState } from '@/design/patterns/empty-state';
import { MapView, type MapMarker } from '@/design/patterns/map-view';
import { PageHeader } from '@/design/patterns/page-header';
import { SkeletonCard } from '@/design/patterns/skeleton';
import { StatusBadge } from '@/design/patterns/status-badge';
import { Select } from '@/design/ui/form';
import { Segmented } from '@/design/ui/segmented';
import { WorkCard } from '@/modules/works/works/components/work-card';
import { t } from '@/modules/works/works/i18n';
import { obraLights } from '@/core/domain/health-labels';

type View = 'cards' | 'table' | 'map';
const TONE = { green: 'success', yellow: 'warning', red: 'danger', gray: 'neutral' } as const;

/** Lista de obras: cartões, tabela ou mapa, com filtros por situação, contratante e UF. */
export default function WorksPage() {
  const list = useList(obras, { pageSize: 200 });
  const dir = useDirectory();
  const navigate = useNavigate();
  const [view, setView] = useState<View>('cards');
  const [status, setStatus] = useState('');
  const [client, setClient] = useState('');
  const [uf, setUf] = useState('');
  const all = useMemo(() => list.data?.data ?? [], [list.data]);
  const rows = useMemo(
    () =>
      all.filter(
        (o) =>
          (!status || o.status === status) &&
          (!client || o.clientId === client) &&
          (!uf || o.state === uf),
      ),
    [all, status, client, uf],
  );
  const markers: MapMarker[] = rows.map((o) => ({
    id: o.id,
    lat: o.latitude,
    lng: o.longitude,
    label: o.name,
    tone: TONE[obraLights(o)[0]?.tone ?? 'gray'],
  }));
  const clients = [...new Set(all.map((o) => o.clientId))];
  const states = [...new Set(all.map((o) => o.state))].sort();
  const filters = (
    <>
      <Select
        value={status}
        onChange={(e) => setStatus(e.target.value)}
        aria-label={t('list.filterStatus')}
        className="w-44"
      >
        <option value="">
          {t('list.filterStatus')}: {t('list.all')}
        </option>
        {(['in_progress', 'mobilizing', 'closing'] as const).map((s) => (
          <option key={s} value={s}>
            {t(`status.${s}`)}
          </option>
        ))}
      </Select>
      <Select
        value={client}
        onChange={(e) => setClient(e.target.value)}
        aria-label={t('list.filterClient')}
        className="w-52"
      >
        <option value="">
          {t('list.filterClient')}: {t('list.allClients')}
        </option>
        {clients.map((id) => (
          <option key={id} value={id}>
            {dir.name(id)}
          </option>
        ))}
      </Select>
      <Select
        value={uf}
        onChange={(e) => setUf(e.target.value)}
        aria-label={t('list.filterState')}
        className="w-32"
      >
        <option value="">
          {t('list.filterState')}: {t('list.all')}
        </option>
        {states.map((s) => (
          <option key={s} value={s}>
            {s}
          </option>
        ))}
      </Select>
    </>
  );
  let body;
  if (list.isError) body = <ErrorState onRetry={() => void list.refetch()} />;
  else if (list.isLoading)
    body = (
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
      </div>
    );
  else if (all.length === 0)
    body = <EmptyState title={t('list.emptyTitle')} description={t('list.emptyDescription')} />;
  else if (view === 'map')
    body = (
      <MapView
        className="h-[560px]"
        markers={markers}
        onSelect={(id) => void navigate(`/works/${id}`)}
      />
    );
  else if (view === 'cards') {
    body = (
      <Cascade
        key={rows.map((r) => r.id).join()}
        className="grid gap-4 md:grid-cols-2 xl:grid-cols-3"
      >
        {rows.map((o) => (
          <CascadeItem key={o.id}>
            <WorkCard obra={o} />
          </CascadeItem>
        ))}
      </Cascade>
    );
  } else {
    body = (
      <DataView<Obra>
        rows={rows}
        views={['table']}
        onRowClick={(o) => void navigate(`/works/${o.id}`)}
        searchText={(o) => `${o.name} ${o.code} ${o.city}`}
        columns={[
          {
            id: 'name',
            header: t('columns.name'),
            cell: (o) => <span className="font-medium">{o.name}</span>,
            sort: (o) => o.name,
          },
          {
            id: 'client',
            header: t('columns.client'),
            cell: (o) => dir.name(o.clientId),
            hideOnMobile: true,
          },
          {
            id: 'place',
            header: t('columns.place'),
            cell: (o) => `${o.city}/${o.state}`,
            hideOnMobile: true,
          },
          {
            id: 'value',
            header: t('columns.value'),
            cell: (o) => formatMoney(o.contractValueCents, { compact: true }),
            sort: (o) => o.contractValueCents,
            align: 'right',
          },
          {
            id: 'progress',
            header: t('columns.progress'),
            cell: (o) => formatPercent(o.actualPhysicalPct, 1),
            sort: (o) => o.actualPhysicalPct,
            align: 'right',
          },
          {
            id: 'end',
            header: t('columns.end'),
            cell: (o) => formatDate(o.endDate),
            sort: (o) => o.endDate,
          },
          {
            id: 'status',
            header: t('columns.status'),
            cell: (o) => (
              <StatusBadge
                tone={
                  o.status === 'closing'
                    ? 'neutral'
                    : o.status === 'mobilizing'
                      ? 'info'
                      : 'success'
                }
                label={t(`status.${o.status}`)}
              />
            ),
          },
        ]}
      />
    );
  }
  return (
    <div>
      <PageHeader
        title={t('list.title')}
        description={t('list.subtitle')}
        actions={
          <Segmented
            value={view}
            onChange={setView}
            options={[
              {
                value: 'cards',
                ariaLabel: t('list.cards'),
                label: (
                  <>
                    <LayoutGrid className="size-4" />
                    <span className="hidden sm:inline">{t('list.cards')}</span>
                  </>
                ),
              },
              {
                value: 'table',
                ariaLabel: t('list.table'),
                label: (
                  <>
                    <Table2 className="size-4" />
                    <span className="hidden sm:inline">{t('list.table')}</span>
                  </>
                ),
              },
              {
                value: 'map',
                ariaLabel: t('list.map'),
                label: (
                  <>
                    <MapIcon className="size-4" />
                    <span className="hidden sm:inline">{t('list.map')}</span>
                  </>
                ),
              },
            ]}
          />
        }
      />
      <div className="mb-5 flex flex-wrap gap-2">{filters}</div>
      {body}
    </div>
  );
}
