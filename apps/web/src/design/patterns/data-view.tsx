import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameMonth,
  parseISO,
  startOfMonth,
  startOfWeek,
} from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  ArrowDownUp,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  GalleryVerticalEnd,
  KanbanSquare,
  LayoutGrid,
  Search,
  Table2,
} from 'lucide-react';
import {
  createColumnHelper,
  createSortedRowModel,
  rowSortingFeature,
  tableFeatures,
  useTable,
} from '@tanstack/react-table';
import { useMemo, useState, type ReactNode } from 'react';
import { createT } from '@/core/i18n/create-t';
import { messages } from '@/core/i18n/messages';
import { cn } from '@/design/cn';
import { useMediaQuery } from '@/design/hooks/use-media-query';
import { Button } from '@/design/ui/button';
import { Input } from '@/design/ui/form';
import { Segmented } from '@/design/ui/segmented';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableRow,
} from '@/design/ui/table';
import { Cascade, CascadeItem } from './cascade';
import { EmptyState, ErrorState } from './empty-state';
import { FunnelBoard, type BoardStage } from './funnel-board';
import { SkeletonRows } from './skeleton';
import { VerticalTimeline } from './timeline';

const t = createT(messages);
export type DataViewKind = 'table' | 'cards' | 'board' | 'timeline' | 'calendar';
const ICON = {
  table: Table2,
  cards: LayoutGrid,
  board: KanbanSquare,
  timeline: GalleryVerticalEnd,
  calendar: CalendarDays,
} as const;
const PAGE = 50;
const features = tableFeatures({ rowSortingFeature, sortedRowModel: createSortedRowModel() });

export interface DataColumn<T> {
  id: string;
  header: string;
  cell: (row: T) => ReactNode;
  sort?: (row: T) => string | number | null;
  align?: 'right';
  hideOnMobile?: boolean;
}

export interface DataViewProps<T extends { id: string }> {
  rows: T[];
  columns: DataColumn<T>[];
  views?: DataViewKind[];
  defaultView?: DataViewKind;
  searchText?: (row: T) => string;
  card?: (row: T) => ReactNode;
  board?: {
    stages: BoardStage[];
    stageOf: (row: T) => string;
    render: (row: T) => ReactNode;
    onMove?: (row: T, stageId: string) => void;
  };
  dateOf?: (row: T) => string | null | undefined;
  titleOf?: (row: T) => string;
  loading?: boolean;
  error?: boolean;
  onRetry?: () => void;
  onRowClick?: (row: T) => void;
  toolbar?: ReactNode;
  emptyAction?: ReactNode;
}

/** Lista universal: tabela, cartões, quadro, linha do tempo e calendário sobre os mesmos dados. */
export function DataView<T extends { id: string }>(props: DataViewProps<T>) {
  const {
    rows,
    views = ['table', 'cards'],
    loading,
    error,
    onRetry,
    toolbar,
    emptyAction,
    searchText,
  } = props;
  const [view, setView] = useState<DataViewKind>(props.defaultView ?? views[0] ?? 'table');
  const [query, setQuery] = useState('');
  const [limit, setLimit] = useState(PAGE);
  const compact = useMediaQuery('(max-width: 767px)');
  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return rows;
    return rows.filter((row) =>
      (searchText
        ? searchText(row)
        : Object.values(row)
            .filter((v) => typeof v === 'string' || typeof v === 'number')
            .join(' ')
      )
        .toLowerCase()
        .includes(needle),
    );
  }, [rows, query, searchText]);
  const effective: DataViewKind = view === 'table' && compact ? 'cards' : view;

  let body: ReactNode;
  if (loading) body = <SkeletonRows />;
  else if (error) body = <ErrorState onRetry={onRetry} />;
  else if (rows.length === 0) body = <EmptyState action={emptyAction} />;
  else if (filtered.length === 0)
    body = (
      <EmptyState
        title={t('state.noResultsTitle')}
        description={t('state.noResultsDescription')}
        action={
          <Button variant="outline" onClick={() => setQuery('')}>
            {t('common.clear')}
          </Button>
        }
      />
    );
  else if (effective === 'table') body = <DataTable {...props} rows={filtered.slice(0, limit)} />;
  else if (effective === 'cards') body = <CardGrid {...props} rows={filtered.slice(0, limit)} />;
  else if (effective === 'board' && props.board)
    body = (
      <FunnelBoard
        stages={props.board.stages}
        cards={filtered.map((row) => ({
          id: row.id,
          stageId: props.board?.stageOf(row) ?? '',
          row,
        }))}
        render={(card) => props.board?.render(card.row)}
        onMove={(card, stageId) => props.board?.onMove?.(card.row, stageId)}
      />
    );
  else if (effective === 'timeline') body = <TimelineBody {...props} rows={filtered} />;
  else body = <CalendarBody {...props} rows={filtered} />;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative min-w-52 flex-1 sm:max-w-sm">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setLimit(PAGE);
            }}
            placeholder={t('dataView.searchPlaceholder')}
            aria-label={t('common.search')}
            className="pl-9"
          />
        </div>
        {toolbar}
        {views.length > 1 && (
          <Segmented
            className="ml-auto"
            value={view}
            onChange={setView}
            options={views.map((kind) => {
              const Icon = ICON[kind];
              return {
                value: kind,
                ariaLabel: t(`dataView.${kind}`),
                label: (
                  <>
                    <Icon className="size-4" />
                    <span className="hidden lg:inline">{t(`dataView.${kind}`)}</span>
                  </>
                ),
              };
            })}
          />
        )}
      </div>
      {body}
      {!loading && !error && filtered.length > limit && effective !== 'board' && (
        <div className="flex items-center justify-center gap-3 text-sm text-muted-foreground">
          <span className="tnum">
            {t('common.results', {
              count: Math.min(limit, filtered.length),
              total: filtered.length,
            })}
          </span>
          <Button variant="outline" size="sm" onClick={() => setLimit((n) => n + PAGE)}>
            {t('dataView.showMore')}
          </Button>
        </div>
      )}
    </div>
  );
}

function DataTable<T extends { id: string }>({ rows, columns, onRowClick }: DataViewProps<T>) {
  const columnDefs = useMemo(() => {
    const helper = createColumnHelper<typeof features, T>();
    return helper.columns(
      columns.map((col) =>
        helper.accessor((row) => (col.sort ? col.sort(row) : null), {
          id: col.id,
          header: col.header,
          cell: ({ row }) => col.cell(row.original),
          enableSorting: Boolean(col.sort),
        }),
      ),
    );
  }, [columns]);
  const table = useTable({ features, columns: columnDefs, data: rows });
  return (
    <div className="surface-card overflow-hidden">
      <Table>
        <TableHead className="border-b border-border">
          {table.getHeaderGroups().map((group) => (
            <tr key={group.id}>
              {group.headers.map((header, index) => {
                const sorted = header.column.getIsSorted();
                const source = columns[index];
                return (
                  <TableHeaderCell
                    key={header.id}
                    className={cn(source?.align === 'right' && 'text-right')}
                    aria-sort={
                      sorted === 'asc' ? 'ascending' : sorted === 'desc' ? 'descending' : undefined
                    }
                  >
                    {header.column.getCanSort() ? (
                      <button
                        type="button"
                        onClick={header.column.getToggleSortingHandler()}
                        className="inline-flex items-center gap-1 hover:text-foreground"
                        aria-label={`${t('dataView.sortBy')} ${source?.header ?? ''}`}
                      >
                        <table.FlexRender header={header} />
                        <ArrowDownUp
                          className={cn('size-3.5', sorted ? 'text-primary' : 'opacity-40')}
                        />
                      </button>
                    ) : (
                      <table.FlexRender header={header} />
                    )}
                  </TableHeaderCell>
                );
              })}
            </tr>
          ))}
        </TableHead>
        <TableBody>
          {table.getRowModel().rows.map((row) => (
            <TableRow
              key={row.id}
              className={cn(onRowClick && 'cursor-pointer')}
              onClick={() => onRowClick?.(row.original)}
            >
              {row.getAllCells().map((cell, index) => (
                <TableCell
                  key={cell.id}
                  className={cn(
                    columns[index]?.align === 'right' && 'text-right',
                    columns[index]?.hideOnMobile && 'hidden lg:table-cell',
                  )}
                >
                  <table.FlexRender cell={cell} />
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

function CardGrid<T extends { id: string }>({ rows, columns, card, onRowClick }: DataViewProps<T>) {
  return (
    <Cascade className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
      {rows.map((row) => (
        <CascadeItem key={row.id}>
          <div
            role={onRowClick ? 'button' : undefined}
            tabIndex={onRowClick ? 0 : undefined}
            onClick={() => onRowClick?.(row)}
            onKeyDown={(event) => event.key === 'Enter' && onRowClick?.(row)}
            className={cn(
              'surface-card h-full p-4 transition-shadow',
              onRowClick && 'cursor-pointer hover:shadow-md',
            )}
          >
            {card ? (
              card(row)
            ) : (
              <dl className="space-y-1.5">
                {columns.map((col, index) => (
                  <div
                    key={col.id}
                    className={cn(
                      index === 0
                        ? 'text-base font-semibold'
                        : 'flex justify-between gap-3 text-sm',
                    )}
                  >
                    {index === 0 ? (
                      col.cell(row)
                    ) : (
                      <>
                        <dt className="text-muted-foreground">{col.header}</dt>
                        <dd className="text-right">{col.cell(row)}</dd>
                      </>
                    )}
                  </div>
                ))}
              </dl>
            )}
          </div>
        </CascadeItem>
      ))}
    </Cascade>
  );
}

function TimelineBody<T extends { id: string }>({
  rows,
  dateOf,
  titleOf,
  onRowClick,
}: DataViewProps<T>) {
  const dated = rows
    .filter((row) => dateOf?.(row))
    .sort((a, b) => (dateOf?.(a) ?? '').localeCompare(dateOf?.(b) ?? ''));
  return (
    <div className="surface-card p-5">
      <VerticalTimeline
        entries={dated.map((row) => ({
          id: row.id,
          date: dateOf?.(row) ?? '',
          title: titleOf?.(row) ?? row.id,
        }))}
        onSelect={(entry) => {
          const row = rows.find((r) => r.id === entry.id);
          if (row) onRowClick?.(row);
        }}
      />
    </div>
  );
}

function CalendarBody<T extends { id: string }>({
  rows,
  dateOf,
  titleOf,
  onRowClick,
}: DataViewProps<T>) {
  const [month, setMonth] = useState(() => startOfMonth(new Date()));
  const days = eachDayOfInterval({ start: startOfWeek(month), end: endOfWeek(endOfMonth(month)) });
  return (
    <div className="surface-card overflow-hidden">
      <div className="flex items-center justify-between border-b border-border p-3">
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label={t('dataView.previousMonth')}
          onClick={() => setMonth((m) => addMonths(m, -1))}
        >
          <ChevronLeft />
        </Button>
        <span className="text-base font-semibold first-letter:uppercase">
          {format(month, "MMMM 'de' yyyy", { locale: ptBR })}
        </span>
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label={t('dataView.nextMonth')}
          onClick={() => setMonth((m) => addMonths(m, 1))}
        >
          <ChevronRight />
        </Button>
      </div>
      <div className="grid grid-cols-7 border-b border-border text-center text-xs font-medium text-muted-foreground">
        {days.slice(0, 7).map((d) => (
          <span key={d.toISOString()} className="py-2 first-letter:uppercase">
            {format(d, 'EEE', { locale: ptBR })}
          </span>
        ))}
      </div>
      <div className="grid grid-cols-7">
        {days.map((day) => {
          const key = format(day, 'yyyy-MM-dd');
          const items = rows.filter((row) => dateOf?.(row)?.slice(0, 10) === key);
          return (
            <div
              key={key}
              className={cn(
                'min-h-20 border-r border-b border-border p-1.5 text-xs',
                !isSameMonth(day, month) && 'bg-muted/40 text-muted-foreground',
              )}
            >
              <span
                className={cn(
                  'tnum mb-1 inline-flex size-5 items-center justify-center rounded-full',
                  format(new Date(), 'yyyy-MM-dd') === key && 'bg-primary text-primary-foreground',
                )}
              >
                {format(parseISO(key), 'd')}
              </span>
              {items.slice(0, 3).map((row) => (
                <button
                  key={row.id}
                  type="button"
                  onClick={() => onRowClick?.(row)}
                  className="mb-0.5 block w-full truncate rounded-sm bg-primary-soft px-1.5 py-0.5 text-left"
                >
                  {titleOf?.(row) ?? row.id}
                </button>
              ))}
              {items.length > 3 && (
                <span className="text-muted-foreground">
                  {t('dataView.moreItems', { count: items.length - 3 })}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
