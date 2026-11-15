import { useMemo, useState } from 'react';
import { Link } from 'react-router';
import { z } from 'zod';
import { useList } from '@/core/api/hooks';
import { defineResource } from '@/core/api/resource';
import { useQuery } from '@tanstack/react-query';
import { obraLights } from '@/core/domain/health-labels';
import { allocations, employees, obras } from '@/core/entities';
import { formatNumber, formatPercent } from '@/core/format';
import { EmptyState } from '@/design/patterns/empty-state';
import { MapView, type MapMarker, type MapRoute } from '@/design/patterns/map-view';
import { PageHeader } from '@/design/patterns/page-header';
import { ProgressRing } from '@/design/patterns/progress-ring';
import { StatusBadge } from '@/design/patterns/status-badge';
import { Button } from '@/design/ui/button';
import { Checkbox, Label } from '@/design/ui/form';
import { Card, CardContent, CardHeader, CardTitle } from '@/design/ui/misc';
import { t } from '@/modules/works/map/i18n';

const company = defineResource(
  'company',
  z.object({ id: z.string(), name: z.string(), latitude: z.number(), longitude: z.number() }),
);
const TONE = { green: 'success', yellow: 'warning', red: 'danger', gray: 'neutral' } as const;
const EARTH_KM = 6371;

function distanceKm(a: [number, number], b: [number, number]): number {
  const rad = (d: number) => (d * Math.PI) / 180;
  const h =
    Math.sin(rad(b[1] - a[1]) / 2) ** 2 +
    Math.cos(rad(a[1])) * Math.cos(rad(b[1])) * Math.sin(rad(b[0] - a[0]) / 2) ** 2;
  return 2 * EARTH_KM * Math.asin(Math.sqrt(h));
}

export default function MapPage() {
  const works = useList(obras, { pageSize: 50 });
  const team = useList(allocations, { pageSize: 500 });
  const staff = useList(employees, { pageSize: 500 });
  const hq = useQuery({
    queryKey: ['company'],
    queryFn: async () => (await company.list()).data[0],
  });
  const [selected, setSelected] = useState<string>();
  const [showRoutes, setShowRoutes] = useState(true);
  const [showTeam, setShowTeam] = useState(true);
  const list = useMemo(() => works.data?.data ?? [], [works.data]);
  const markers: MapMarker[] = useMemo(
    () => [
      ...list.map((o) => ({
        id: o.id,
        lat: o.latitude,
        lng: o.longitude,
        label: o.name,
        tone: TONE[obraLights(o)[0]?.tone ?? 'gray'],
      })),
      ...(hq.data
        ? [
            {
              id: 'hq',
              lat: hq.data.latitude,
              lng: hq.data.longitude,
              label: `${t('hq')}: ${hq.data.name}`,
              tone: 'primary' as const,
              kind: 'office' as const,
            },
          ]
        : []),
    ],
    [list, hq.data],
  );
  const routes: MapRoute[] = useMemo(() => {
    const origin = hq.data;
    return showRoutes && origin
      ? list.map((o) => ({
          from: [origin.longitude, origin.latitude] as [number, number],
          to: [o.longitude, o.latitude] as [number, number],
        }))
      : [];
  }, [showRoutes, hq.data, list]);
  const obra = list.find((o) => o.id === selected);
  const roles = new Map<string, number>();
  if (obra)
    for (const a of (team.data?.data ?? []).filter((x) => x.obraId === obra.id))
      roles.set(
        staff.data?.data.find((e) => e.id === a.employeeId)?.roleLabel ?? a.role,
        (roles.get(staff.data?.data.find((e) => e.id === a.employeeId)?.roleLabel ?? a.role) ?? 0) +
          1,
      );

  return (
    <div>
      <PageHeader title={t('title')} description={t('subtitle')} />
      <div className="grid gap-5 lg:grid-cols-[1fr_360px]">
        <MapView
          className="h-[calc(100vh-15rem)] min-h-[460px]"
          markers={markers}
          routes={routes}
          selectedId={selected}
          onSelect={(id) => id !== 'hq' && setSelected(id)}
        />
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{t('layers')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2">
                <Checkbox
                  id="routes"
                  checked={showRoutes}
                  onCheckedChange={(v) => setShowRoutes(v === true)}
                />
                <Label htmlFor="routes">{t('routes')}</Label>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox
                  id="team"
                  checked={showTeam}
                  onCheckedChange={(v) => setShowTeam(v === true)}
                />
                <Label htmlFor="team">{t('team')}</Label>
              </div>
            </CardContent>
          </Card>
          {obra ? (
            <Card>
              <CardHeader>
                <CardTitle>{obra.name}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-4">
                  <ProgressRing
                    value={obra.actualPhysicalPct}
                    planned={obra.plannedPhysicalPct}
                    size={72}
                    stroke={7}
                  >
                    <span className="text-sm font-semibold tnum">
                      {formatPercent(obra.actualPhysicalPct, 0)}
                    </span>
                  </ProgressRing>
                  <div className="space-y-1.5 text-base">
                    <p>
                      {obra.city}/{obra.state}
                    </p>
                    {hq.data && (
                      <p className="text-sm text-muted-foreground">
                        {t('distance')}:{' '}
                        {t('km', {
                          value: formatNumber(
                            distanceKm(
                              [hq.data.longitude, hq.data.latitude],
                              [obra.longitude, obra.latitude],
                            ),
                          ),
                        })}
                      </p>
                    )}
                    <StatusBadge
                      tone={TONE[obraLights(obra)[0]?.tone ?? 'gray']}
                      label={obraLights(obra)[0]?.value ?? ''}
                    />
                  </div>
                </div>
                {showTeam && (
                  <div>
                    <p className="mb-1 text-sm font-medium text-muted-foreground">
                      {t('teamTitle')} · {t('headcount')} {obra.headcount}
                    </p>
                    {roles.size === 0 ? (
                      <p className="text-sm text-muted-foreground">{t('noTeam')}</p>
                    ) : (
                      <ul className="space-y-1 text-base">
                        {[...roles.entries()].map(([role, n]) => (
                          <li key={role} className="flex justify-between">
                            <span>{role}</span>
                            <span className="tnum font-medium">{n}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}
                <Button asChild className="w-full">
                  <Link to={`/works/${obra.id}`}>{t('open')}</Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <EmptyState title={t('selectHint')} className="py-8" />
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
