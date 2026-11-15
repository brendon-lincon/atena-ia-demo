import { differenceInCalendarDays, eachMonthOfInterval, format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { motion } from 'motion/react';
import { Minus, Plus } from 'lucide-react';
import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { createT } from '@/core/i18n/create-t';
import { messages } from '@/core/i18n/messages';
import { formatDateShort } from '@/core/format';
import { cn } from '@/design/cn';
import { duration, easing } from '@/design/motion.generated';
import { Button } from '@/design/ui/button';

const t = createT(messages);
export type TimelineTone = 'primary' | 'success' | 'warning' | 'danger' | 'neutral';
const TONE: Record<TimelineTone, string> = {
  primary: 'bg-primary text-primary-foreground',
  success: 'bg-success text-primary-foreground',
  warning: 'bg-warning text-primary-strong',
  danger: 'bg-danger text-primary-foreground',
  neutral: 'bg-muted-foreground text-primary-foreground',
};
const TRACK_H = 44;
const LANE_H = 30;
const LABEL_W = 148;

export interface TimelineTrack {
  id: string;
  label: string;
  icon?: ReactNode;
}
export interface TimelineItem {
  id: string;
  trackId: string;
  label: string;
  start: string;
  end?: string;
  tone?: TimelineTone;
}

/** Linha do tempo horizontal com várias trilhas, zoom e linha de hoje. */
export function HorizontalTimeline({
  tracks,
  items,
  from: fromIso,
  to,
  onSelect,
  selectedId,
}: {
  tracks: TimelineTrack[];
  items: TimelineItem[];
  from: string;
  to: string;
  onSelect?: (item: TimelineItem) => void;
  selectedId?: string;
}) {
  const [px, setPx] = useState(6);
  const scroller = useRef<HTMLDivElement>(null);
  const [now] = useState(() => new Date());
  const start = parseISO(fromIso);
  const days = differenceInCalendarDays(parseISO(to), start) + 1;
  const x = (iso: string) => differenceInCalendarDays(parseISO(iso), start) * px;
  const todayX = differenceInCalendarDays(now, start) * px;
  // Barras que se sobrepõem na mesma trilha ocupam faixas (linhas) diferentes.
  const lanes = useMemo(() => {
    const laneOf = new Map<string, number>();
    const count = new Map<string, number>();
    for (const track of tracks) {
      const ends: number[] = [];
      const bars = items
        .filter((i) => i.trackId === track.id && i.end)
        .sort((a, b) => a.start.localeCompare(b.start));
      for (const bar of bars) {
        const from = differenceInCalendarDays(parseISO(bar.start), parseISO(fromIso));
        const to = differenceInCalendarDays(parseISO(bar.end ?? bar.start), parseISO(fromIso));
        let lane = ends.findIndex((end) => end < from);
        if (lane === -1) lane = ends.length;
        ends[lane] = to;
        laneOf.set(bar.id, lane);
      }
      count.set(track.id, Math.max(ends.length, 1));
    }
    return { laneOf, count };
  }, [tracks, items, fromIso]);
  const months = useMemo(
    () => eachMonthOfInterval({ start: parseISO(fromIso), end: parseISO(to) }),
    [fromIso, to],
  );
  useEffect(() => {
    scroller.current?.scrollTo({ left: Math.max(todayX - 220, 0) });
  }, [todayX]);
  return (
    <div className="surface-card overflow-hidden">
      <div className="flex items-center justify-end gap-1 border-b border-border p-2">
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label={t('timeline.zoomOut')}
          onClick={() => setPx((v) => Math.max(v / 1.5, 2))}
        >
          <Minus />
        </Button>
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label={t('timeline.zoomIn')}
          onClick={() => setPx((v) => Math.min(v * 1.5, 24))}
        >
          <Plus />
        </Button>
      </div>
      <div ref={scroller} className="scrollbar-thin overflow-x-auto">
        <div style={{ width: LABEL_W + days * px }} className="relative">
          <div className="sticky top-0 z-10 flex h-8 border-b border-border bg-surface text-xs text-muted-foreground">
            <div className="sticky left-0 z-20 shrink-0 bg-surface" style={{ width: LABEL_W }} />
            <div className="relative flex-1">
              {months.map((m) => (
                <span
                  key={m.toISOString()}
                  className="absolute top-0 flex h-full items-center border-l border-border pl-2 first-letter:uppercase"
                  style={{ left: Math.max(differenceInCalendarDays(m, start), 0) * px }}
                >
                  {format(m, "MMM 'de' yy", { locale: ptBR })}
                </span>
              ))}
            </div>
          </div>
          {tracks.map((track) => (
            <div
              key={track.id}
              className="flex border-b border-border last:border-0"
              style={{ height: Math.max(TRACK_H, (lanes.count.get(track.id) ?? 1) * LANE_H + 14) }}
            >
              <div
                className="sticky left-0 z-10 flex shrink-0 items-center gap-2 bg-surface px-3 text-sm font-medium"
                style={{ width: LABEL_W }}
              >
                {track.icon}
                <span className="truncate">{track.label}</span>
              </div>
              <div className="relative flex-1">
                {items
                  .filter((item) => item.trackId === track.id)
                  .map((item, index) => {
                    const left = x(item.start);
                    const width = item.end ? Math.max(x(item.end) - left + px, 10) : 0;
                    const selected = selectedId === item.id;
                    return (
                      <motion.button
                        key={item.id}
                        type="button"
                        title={`${item.label} · ${formatDateShort(item.start)}`}
                        onClick={() => onSelect?.(item)}
                        initial={{ opacity: 0, scale: 0.6 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{
                          delay: Math.min(index, 30) * 0.015,
                          duration: duration.base,
                          ease: easing,
                        }}
                        className={cn(
                          'absolute truncate text-left text-xs font-medium shadow-sm transition-shadow',
                          item.end ? '' : 'top-1/2 -translate-y-1/2',
                          TONE[item.tone ?? 'primary'],
                          item.end ? 'h-6 rounded-md px-2' : 'size-3.5 rounded-full',
                          selected && 'ring-2 ring-foreground ring-offset-2 ring-offset-surface',
                        )}
                        style={{
                          left,
                          width: item.end ? width : undefined,
                          top: item.end ? 8 + (lanes.laneOf.get(item.id) ?? 0) * LANE_H : undefined,
                        }}
                      >
                        {item.end && width > 56 ? item.label : null}
                      </motion.button>
                    );
                  })}
              </div>
            </div>
          ))}
          <div
            className="pointer-events-none absolute top-8 bottom-0 z-[5] w-px bg-primary"
            style={{ left: LABEL_W + todayX }}
          >
            <span className="absolute -top-0 left-1 rounded-sm bg-primary px-1.5 py-0.5 text-[10px] font-medium text-primary-foreground">
              {t('timeline.today')}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export interface VerticalEntry {
  id: string;
  date: string;
  title: string;
  description?: string;
  tone?: TimelineTone;
  meta?: ReactNode;
}

/** Linha do tempo vertical (diário, histórico, atividade) agrupada por dia. */
export function VerticalTimeline({
  entries,
  onSelect,
}: {
  entries: VerticalEntry[];
  onSelect?: (entry: VerticalEntry) => void;
}) {
  return (
    <ol className="relative space-y-4 border-l border-border pl-5">
      {entries.map((entry, index) => {
        const showDate = index === 0 || entries[index - 1]?.date !== entry.date;
        return (
          <li key={entry.id} className="relative">
            <span
              className={cn(
                'absolute top-1.5 -left-[27px] size-3 rounded-full border-2 border-surface',
                TONE[entry.tone ?? 'primary'].split(' ')[0],
              )}
            />
            {showDate && (
              <p className="mb-1 text-xs font-medium text-muted-foreground first-letter:uppercase">
                {formatDateShort(entry.date)}
              </p>
            )}
            <button
              type="button"
              onClick={() => onSelect?.(entry)}
              className="w-full rounded-md p-2 text-left transition-colors hover:bg-muted/60"
            >
              <p className="text-base font-medium">{entry.title}</p>
              {entry.description && (
                <p className="text-sm text-muted-foreground">{entry.description}</p>
              )}
              {entry.meta && <div className="mt-1.5">{entry.meta}</div>}
            </button>
          </li>
        );
      })}
    </ol>
  );
}
