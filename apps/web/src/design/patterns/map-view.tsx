import { useEffect, useRef, useState } from 'react';
import type { Map as MapLibreMap, Marker } from 'maplibre-gl';
import { createT } from '@/core/i18n/create-t';
import { messages } from '@/core/i18n/messages';
import { resolvedTheme, useTheme } from '@/core/theme/theme-store';
import { cn } from '@/design/cn';
import { EmptyState } from './empty-state';
import { Skeleton } from './skeleton';

const t = createT(messages);
export type MapTone = 'success' | 'warning' | 'danger' | 'neutral' | 'primary';
export interface MapMarker {
  id: string;
  lat: number;
  lng: number;
  label: string;
  tone: MapTone;
  kind?: 'work' | 'office';
}
export interface MapRoute {
  from: [number, number];
  to: [number, number];
  tone?: MapTone;
}

const STYLES = {
  light: 'https://tiles.openfreemap.org/styles/positron',
  dark: 'https://tiles.openfreemap.org/styles/dark',
} as const;
const FALLBACK_STYLE = {
  version: 8,
  sources: {
    osm: {
      type: 'raster',
      tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
      tileSize: 256,
      attribution: '© OpenStreetMap',
    },
  },
  layers: [{ id: 'osm', type: 'raster', source: 'osm' }],
} as const;
const TONE_VAR: Record<MapTone, string> = {
  success: 'var(--success)',
  warning: 'var(--warning)',
  danger: 'var(--danger)',
  neutral: 'var(--muted-foreground)',
  primary: 'var(--primary)',
};
const CLUSTER_PX = 44;

function markerElement(marker: MapMarker, selected: boolean, onSelect: () => void): HTMLElement {
  const el = document.createElement('button');
  el.type = 'button';
  el.setAttribute('aria-label', marker.label);
  el.className = cn('atena-pin', selected && 'atena-pin-selected');
  el.style.setProperty('--pin', TONE_VAR[marker.tone]);
  el.dataset.kind = marker.kind ?? 'work';
  el.addEventListener('click', (event) => {
    event.stopPropagation();
    onSelect();
  });
  return el;
}

/**
 * Mapa MapLibre (base aberta OpenFreeMap; mosaicos do OpenStreetMap se indisponível).
 * Marcadores animados por situação, agrupamento por proximidade e linhas de rota. Carregado sob demanda.
 */
export function MapView({
  markers,
  routes = [],
  selectedId,
  onSelect,
  className,
}: {
  markers: MapMarker[];
  routes?: MapRoute[];
  selectedId?: string;
  onSelect?: (id: string) => void;
  className?: string;
}) {
  const container = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MapLibreMap | null>(null);
  const pins = useRef<Marker[]>([]);
  const [status, setStatus] = useState<'loading' | 'ready' | 'failed'>('loading');
  const mode = useTheme((state) => state.mode);
  const theme = resolvedTheme(mode);

  useEffect(() => {
    const life = { disposed: false, fallbackUsed: false };
    void (async () => {
      try {
        const [maplibre, worker] = await Promise.all([
          import('maplibre-gl'),
          import('maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url'),
          import('maplibre-gl/dist/maplibre-gl.css'),
        ]);
        maplibre.setWorkerUrl(worker.default);
        if (life.disposed || !container.current) return;
        const map = new maplibre.Map({
          container: container.current,
          style: STYLES[theme],
          center: [-50, -17],
          zoom: 3.4,
          attributionControl: { compact: true },
        });
        mapRef.current = map;
        map.addControl(new maplibre.NavigationControl({ showCompass: false }), 'top-right');
        map.on('load', () => {
          if (!life.disposed) setStatus('ready');
        });
        map.on('error', () => {
          if (life.fallbackUsed || life.disposed) return;
          life.fallbackUsed = true;
          try {
            map.setStyle(FALLBACK_STYLE as never);
          } catch {
            setStatus('failed');
          }
        });
      } catch {
        if (!life.disposed) setStatus('failed');
      }
    })();
    return () => {
      life.disposed = true;
      mapRef.current?.remove();
      mapRef.current = null;
    };
    // O mapa é criado uma vez; o tema muda o estilo no efeito seguinte.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (map && status === 'ready' && !map.isStyleLoaded()) return;
    map?.setStyle(STYLES[theme]);
  }, [theme, status]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || status !== 'ready') return;
    const life = { cancelled: false };
    const draw = async () => {
      const maplibre = await import('maplibre-gl');
      if (life.cancelled) return;
      pins.current.forEach((p) => p.remove());
      pins.current = [];
      const projected = markers.map((m) => ({ m, p: map.project([m.lng, m.lat]) }));
      const used = new Set<string>();
      for (const a of projected) {
        if (used.has(a.m.id)) continue;
        const group = projected.filter(
          (b) => !used.has(b.m.id) && Math.hypot(a.p.x - b.p.x, a.p.y - b.p.y) < CLUSTER_PX,
        );
        group.forEach((g) => used.add(g.m.id));
        if (group.length === 1) {
          pins.current.push(
            new maplibre.Marker({
              element: markerElement(a.m, a.m.id === selectedId, () => onSelect?.(a.m.id)),
            })
              .setLngLat([a.m.lng, a.m.lat])
              .addTo(map),
          );
        } else {
          const el = document.createElement('button');
          el.type = 'button';
          el.className = 'atena-cluster';
          el.textContent = String(group.length);
          const lng = group.reduce((sum, g) => sum + g.m.lng, 0) / group.length;
          const lat = group.reduce((sum, g) => sum + g.m.lat, 0) / group.length;
          el.addEventListener('click', () =>
            map.easeTo({ center: [lng, lat], zoom: map.getZoom() + 2 }),
          );
          pins.current.push(new maplibre.Marker({ element: el }).setLngLat([lng, lat]).addTo(map));
        }
      }
      const data = {
        type: 'FeatureCollection',
        features: routes.map((r) => ({
          type: 'Feature',
          properties: { tone: r.tone ?? 'primary' },
          geometry: { type: 'LineString', coordinates: [r.from, r.to] },
        })),
      } as const;
      const source = map.getSource('routes');
      if (source && 'setData' in source)
        (source as { setData: (d: unknown) => void }).setData(data);
      else if (map.isStyleLoaded()) {
        map.addSource('routes', { type: 'geojson', data: data as never });
        map.addLayer({
          id: 'routes',
          type: 'line',
          source: 'routes',
          paint: {
            'line-color': getComputedStyle(document.documentElement)
              .getPropertyValue('--primary')
              .trim(),
            'line-width': 2,
            'line-dasharray': [2, 2],
            'line-opacity': 0.85,
          },
        });
      }
    };
    const redraw = () => {
      void draw();
    };
    redraw();
    map.on('zoomend', redraw);
    map.on('style.load', redraw);
    return () => {
      life.cancelled = true;
      map.off('zoomend', redraw);
      map.off('style.load', redraw);
    };
  }, [markers, routes, selectedId, onSelect, status]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || status !== 'ready' || markers.length === 0) return;
    void import('maplibre-gl').then((maplibre) => {
      const bounds = new maplibre.LngLatBounds();
      markers.forEach((m) => bounds.extend([m.lng, m.lat]));
      map.fitBounds(bounds, { padding: 80, maxZoom: 7, duration: 900 });
    });
  }, [markers, status]);

  if (status === 'failed')
    return <EmptyState title={t('map.fallback')} description={t('map.fallbackHint')} />;
  return (
    <div className={cn('relative overflow-hidden rounded-lg border border-border', className)}>
      <div ref={container} className="size-full min-h-80" />
      {status === 'loading' && (
        <div className="absolute inset-0" role="status" aria-label={t('map.loading')}>
          <Skeleton className="size-full rounded-none" />
        </div>
      )}
    </div>
  );
}
