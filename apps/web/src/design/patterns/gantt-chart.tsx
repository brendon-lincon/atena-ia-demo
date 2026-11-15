import {
  addDays,
  differenceInCalendarDays,
  eachDayOfInterval,
  eachMonthOfInterval,
  endOfMonth,
  format,
  parseISO,
  startOfWeek,
} from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { motion } from 'motion/react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { createT } from '@/core/i18n/create-t';
import { messages } from '@/core/i18n/messages';
import { formatDateShort } from '@/core/format';
import { cn } from '@/design/cn';
import { duration, easing } from '@/design/motion.generated';
import { useMediaQuery } from '@/design/hooks/use-media-query';
import { Segmented } from '@/design/ui/segmented';
import { VerticalTimeline } from './timeline';

const t = createT(messages);
export type GanttZoom = 'day' | 'week' | 'month';
export type DependencyType = 'FS' | 'SS' | 'FF' | 'SF';
export interface GanttActivity {
  id: string;
  name: string;
  group?: string;
  start: string;
  end: string;
  baselineStart?: string;
  baselineEnd?: string;
  progress: number;
  milestone?: boolean;
  critical?: boolean;
  predecessors?: { id: string; type: DependencyType }[];
}

const PX: Record<GanttZoom, number> = { day: 30, week: 11, month: 3.6 };
const ROW = 38;
const NAME_W = 240;
const HEAD_H = 44;
const OVERSCAN = 6;

type Row =
  | { kind: 'group'; id: string; label: string }
  | { kind: 'activity'; id: string; activity: GanttActivity };

/**
 * Gantt próprio (DOM + SVG): barras, dependências, marcos, linha de hoje, linha de base fantasma,
 * zoom dia/semana/mês, agrupamento e virtualização de linhas. No celular vira linha do tempo vertical.
 */
export function GanttChart({
  activities,
  zoom: controlledZoom,
  onZoomChange,
  onSelect,
  maxHeight = 560,
}: {
  activities: GanttActivity[];
  zoom?: GanttZoom;
  onZoomChange?: (zoom: GanttZoom) => void;
  onSelect?: (activity: GanttActivity) => void;
  maxHeight?: number;
}) {
  const compact = useMediaQuery('(max-width: 767px)');
  const [innerZoom, setInnerZoom] = useState<GanttZoom>('week');
  const zoom = controlledZoom ?? innerZoom;
  const [scrollTop, setScrollTop] = useState(0);
  const scroller = useRef<HTMLDivElement>(null);
  const [now] = useState(() => new Date());
  const px = PX[zoom];

  const layout = useMemo(() => {
    const dates = activities
      .flatMap((a) => [a.start, a.end, a.baselineStart ?? a.start, a.baselineEnd ?? a.end])
      .map((d) => parseISO(d));
    const min = addDays(new Date(Math.min(...dates.map((d) => d.getTime()), now.getTime())), -4);
    const max = addDays(new Date(Math.max(...dates.map((d) => d.getTime()))), 8);
    const rows: Row[] = [];
    const groups = [...new Set(activities.map((a) => a.group ?? ''))];
    for (const group of groups) {
      if (group) rows.push({ kind: 'group', id: `group:${group}`, label: group });
      for (const activity of activities.filter((a) => (a.group ?? '') === group))
        rows.push({ kind: 'activity', id: activity.id, activity });
    }
    return { min, max, rows, index: new Map(rows.map((r, i) => [r.id, i])) };
  }, [activities, now]);

  useEffect(() => {
    if (compact) return;
    const days = differenceInCalendarDays(now, layout.min);
    scroller.current?.scrollTo({ left: Math.max(days * PX[zoom] - 80, 0) });
  }, [compact, now, layout.min, zoom]);

  if (compact) {
    return (
      <VerticalTimeline
        entries={[...activities]
          .sort((a, b) => a.start.localeCompare(b.start))
          .map((a) => ({
            id: a.id,
            date: a.start,
            title: a.name,
            description: `${formatDateShort(a.start)} – ${formatDateShort(a.end)} · ${t('gantt.progress')} ${Math.round(a.progress)}%`,
            tone: a.critical ? 'danger' : a.progress >= 100 ? 'success' : 'primary',
          }))}
        onSelect={(entry) => {
          const found = activities.find((a) => a.id === entry.id);
          if (found) onSelect?.(found);
        }}
      />
    );
  }

  const days = differenceInCalendarDays(layout.max, layout.min) + 1;
  const width = days * px;
  const x = (iso: string) => differenceInCalendarDays(parseISO(iso), layout.min) * px;
  const xEnd = (iso: string) => (differenceInCalendarDays(parseISO(iso), layout.min) + 1) * px;
  const first = Math.max(Math.floor(scrollTop / ROW) - OVERSCAN, 0);
  const last = Math.min(Math.ceil((scrollTop + maxHeight) / ROW) + OVERSCAN, layout.rows.length);
  const visible = layout.rows.slice(first, last);
  const todayX = differenceInCalendarDays(now, layout.min) * px + px / 2;

  const edge = (a: GanttActivity, side: 'start' | 'end') =>
    side === 'start' ? x(a.start) : xEnd(a.end);
  const lines: string[] = [];
  for (const row of layout.rows.slice(Math.max(first - 12, 0), last + 12)) {
    if (row.kind !== 'activity') continue;
    for (const pred of row.activity.predecessors ?? []) {
      const predIndex = layout.index.get(pred.id);
      const predRow = predIndex === undefined ? undefined : layout.rows[predIndex];
      if (!predRow || predRow.kind !== 'activity') continue;
      const sourceSide = pred.type === 'FS' || pred.type === 'FF' ? 'end' : 'start';
      const targetSide = pred.type === 'FS' || pred.type === 'SS' ? 'start' : 'end';
      const sx = edge(predRow.activity, sourceSide);
      const tx = edge(row.activity, targetSide);
      const sy = (predIndex ?? 0) * ROW + ROW / 2;
      const ty = (layout.index.get(row.id) ?? 0) * ROW + ROW / 2;
      const out = sourceSide === 'end' ? 8 : -8;
      lines.push(`M${sx} ${sy}H${sx + out}V${ty}H${tx}`);
    }
  }

  const months = eachMonthOfInterval({ start: layout.min, end: layout.max });
  const ticks =
    zoom === 'day'
      ? eachDayOfInterval({ start: layout.min, end: layout.max })
      : zoom === 'week'
        ? eachDayOfInterval({ start: startOfWeek(layout.min), end: layout.max }).filter(
            (d) => d.getDay() === 0,
          )
        : [];

  return (
    <div className="surface-card overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border p-3">
        <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
          <Legend className="bg-primary" label={t('gantt.activity')} />
          <Legend className="bg-danger" label={t('gantt.critical')} />
          <Legend
            className="border border-dashed border-muted-foreground bg-transparent"
            label={t('gantt.baseline')}
          />
          <Legend className="rotate-45 bg-foreground" label={t('gantt.milestone')} />
        </div>
        <Segmented
          value={zoom}
          onChange={(next) => {
            setInnerZoom(next);
            onZoomChange?.(next);
          }}
          options={[
            { value: 'day', label: t('gantt.day') },
            { value: 'week', label: t('gantt.week') },
            { value: 'month', label: t('gantt.month') },
          ]}
        />
      </div>
      <div
        ref={scroller}
        className="scrollbar-thin overflow-auto"
        style={{ maxHeight }}
        onScroll={(event) => setScrollTop(event.currentTarget.scrollTop)}
      >
        <div
          className="relative"
          style={{ width: NAME_W + width, height: HEAD_H + layout.rows.length * ROW }}
        >
          <div
            className="sticky top-0 z-20 flex border-b border-border bg-surface"
            style={{ height: HEAD_H }}
          >
            <div
              className="sticky left-0 z-30 flex shrink-0 items-end border-r border-border bg-surface px-3 pb-2 text-xs font-medium text-muted-foreground"
              style={{ width: NAME_W }}
            >
              {t('gantt.activity')}
            </div>
            <div className="relative flex-1 text-xs text-muted-foreground">
              {months.map((m) => (
                <span
                  key={m.toISOString()}
                  className="absolute top-0 flex h-5 items-center border-l border-border pl-1.5 whitespace-nowrap first-letter:uppercase"
                  style={{
                    left: Math.max(differenceInCalendarDays(m, layout.min), 0) * px,
                    width: (differenceInCalendarDays(endOfMonth(m), m) + 1) * px,
                  }}
                >
                  {format(m, "MMM 'de' yyyy", { locale: ptBR })}
                </span>
              ))}
              {ticks.map((d) => (
                <span
                  key={d.toISOString()}
                  className="tnum absolute bottom-0.5 text-center"
                  style={{
                    left: differenceInCalendarDays(d, layout.min) * px,
                    width: zoom === 'day' ? px : px * 7,
                  }}
                >
                  {format(d, 'd')}
                </span>
              ))}
            </div>
          </div>
          <svg
            className="pointer-events-none absolute z-[3]"
            style={{ left: NAME_W, top: HEAD_H }}
            width={width}
            height={layout.rows.length * ROW}
            aria-hidden
          >
            <defs>
              <marker
                id="gantt-arrow"
                viewBox="0 0 6 6"
                refX="5"
                refY="3"
                markerWidth="5"
                markerHeight="5"
                orient="auto"
              >
                <path d="M0 0L6 3L0 6z" fill="var(--muted-foreground)" />
              </marker>
            </defs>
            {lines.map((d, i) => (
              <path
                key={i}
                d={d}
                fill="none"
                stroke="var(--muted-foreground)"
                strokeWidth="1.2"
                markerEnd="url(#gantt-arrow)"
                opacity="0.7"
              />
            ))}
            <line
              x1={todayX}
              x2={todayX}
              y1={0}
              y2={layout.rows.length * ROW}
              stroke="var(--primary)"
              strokeWidth="1.5"
            />
          </svg>
          <span
            className="absolute z-[25] rounded-sm bg-primary px-1.5 py-0.5 text-[10px] font-medium text-primary-foreground"
            style={{ left: NAME_W + todayX + 4, top: HEAD_H - 16 }}
          >
            {t('gantt.today')}
          </span>
          {visible.map((row, offset) => {
            const top = HEAD_H + (first + offset) * ROW;
            if (row.kind === 'group') {
              return (
                <div
                  key={row.id}
                  className="absolute inset-x-0 flex items-center bg-muted/70 text-sm font-semibold"
                  style={{ top, height: ROW }}
                >
                  <span className="sticky left-0 px-3">{row.label}</span>
                </div>
              );
            }
            const a = row.activity;
            const delay = a.baselineEnd
              ? differenceInCalendarDays(parseISO(a.end), parseISO(a.baselineEnd))
              : 0;
            return (
              <div
                key={row.id}
                className="absolute inset-x-0 border-b border-border/60"
                style={{ top, height: ROW }}
              >
                <button
                  type="button"
                  onClick={() => onSelect?.(a)}
                  className="sticky left-0 z-10 flex h-full items-center gap-2 border-r border-border bg-surface px-3 text-left text-sm hover:bg-muted/60"
                  style={{ width: NAME_W }}
                >
                  <span
                    className={cn(
                      'size-2 shrink-0 rounded-full',
                      a.critical ? 'bg-danger' : 'bg-primary',
                    )}
                  />
                  <span className="truncate">{a.name}</span>
                </button>
                <div className="absolute inset-y-0" style={{ left: NAME_W }}>
                  {a.baselineStart && a.baselineEnd && !a.milestone && (
                    <span
                      className="absolute h-1.5 rounded-full border border-dashed border-muted-foreground/70"
                      style={{
                        left: x(a.baselineStart),
                        width: xEnd(a.baselineEnd) - x(a.baselineStart),
                        top: ROW - 11,
                      }}
                    />
                  )}
                  {a.milestone ? (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ duration: duration.base, ease: easing }}
                      className="absolute size-3.5 rotate-45 bg-foreground"
                      style={{ left: x(a.start) + px / 2 - 7, top: ROW / 2 - 7 }}
                    />
                  ) : (
                    <motion.button
                      type="button"
                      onClick={() => onSelect?.(a)}
                      initial={{ opacity: 0, scaleX: 0 }}
                      animate={{ opacity: 1, scaleX: 1 }}
                      transition={{ duration: duration.emphasis, ease: easing }}
                      aria-label={a.name}
                      className={cn(
                        'absolute h-[18px] origin-left overflow-hidden rounded-[5px] border text-left',
                        a.critical ? 'border-danger bg-danger/25' : 'border-primary bg-primary/25',
                      )}
                      style={{
                        left: x(a.start),
                        width: Math.max(xEnd(a.end) - x(a.start), 6),
                        top: ROW / 2 - 11,
                      }}
                    >
                      <span
                        className={cn('block h-full', a.critical ? 'bg-danger' : 'bg-primary')}
                        style={{ width: `${Math.min(a.progress, 100)}%` }}
                      />
                    </motion.button>
                  )}
                  {delay > 0 && !a.milestone && (
                    <span
                      className="tnum absolute rounded-sm bg-danger-soft px-1 text-[10px] font-medium text-danger-text"
                      style={{ left: xEnd(a.end) + 6, top: ROW / 2 - 9 }}
                    >
                      +{delay}d
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function Legend({ className, label }: { className: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className={cn('inline-block size-2.5 rounded-sm', className)} />
      {label}
    </span>
  );
}
