import { useMemo } from 'react';
import { useSearchParams } from 'react-router';
import { useList } from '@/core/api/hooks';
import { looseRecord, type LooseRecord } from '@/core/api/loose';
import { defineResource } from '@/core/api/resource';
import { useDirectory } from '@/core/directory/use-directory';
import { DataView, type DataColumn } from '@/design/patterns/data-view';
import { Dialog, DialogTitle, Sheet } from '@/design/ui/overlay';
import { renderCell, pick, sortValue } from './cell';
import type { ConfigTab } from './types';

const PAGE = 500;

/** Renderiza qualquer aba descrita por configuração: lista, cartões, quadro, linha do tempo ou calendário, com detalhe lateral. */
export function ConfigTabView({
  tab,
  extraFilter,
}: {
  tab: ConfigTab;
  extraFilter?: Record<string, string>;
}) {
  const dir = useDirectory();
  const [params, setParams] = useSearchParams();
  const resource = useMemo(() => defineResource(tab.resource, looseRecord), [tab.resource]);
  const list = useList(resource, {
    filter: { ...tab.filter, ...extraFilter },
    sort: tab.sort,
    pageSize: PAGE,
  });
  const rows = useMemo(() => list.data?.data ?? [], [list.data]);
  const openId = params.get('open');
  const open = rows.find((r) => r.id === openId);
  const columns: DataColumn<LooseRecord>[] = tab.columns.map((c) => ({
    id: c.id,
    header: c.header,
    cell: (row) => renderCell(c, row, dir.name),
    sort: c.sortable === false ? undefined : (row) => sortValue(c, row),
    align: c.align,
    hideOnMobile: c.hideOnMobile,
  }));
  const board = tab.board;
  const views = tab.views ?? ['table', 'cards'];
  const titleOf = (row: LooseRecord) =>
    String(pick(row, tab.titleField ?? tab.columns[0]?.field ?? 'id') ?? '');
  const detail = tab.detail ?? tab.columns;
  return (
    <>
      <DataView<LooseRecord>
        rows={rows}
        views={board ? [...new Set<'board' | (typeof views)[number]>(['board', ...views])] : views}
        defaultView={board ? 'board' : views[0]}
        loading={list.isLoading}
        error={list.isError}
        onRetry={() => void list.refetch()}
        columns={columns}
        titleOf={titleOf}
        dateOf={
          tab.dateField ? (row) => pick(row, tab.dateField ?? '') as string | undefined : undefined
        }
        onRowClick={(row) =>
          setParams(
            (cur) => {
              const next = new URLSearchParams(cur);
              next.set('open', row.id);
              return next;
            },
            { replace: true },
          )
        }
        searchText={(row) =>
          tab.columns
            .map((c) =>
              c.format === 'name'
                ? dir.name(String(pick(row, c.field) ?? ''))
                : String(pick(row, c.field) ?? ''),
            )
            .join(' ')
        }
        board={
          board && {
            stages: board.stages,
            stageOf: (row) => String(pick(row, board.field) ?? ''),
            render: (row) => (
              <div>
                <p className="text-base font-medium">{titleOf(row)}</p>
                {board.valueField && (
                  <p className="text-sm text-muted-foreground">
                    {renderCell(
                      { id: 'v', header: '', field: board.valueField, format: 'money' },
                      row,
                      dir.name,
                    )}
                  </p>
                )}
              </div>
            ),
          }
        }
      />
      <Dialog
        open={Boolean(open)}
        onOpenChange={(o) => {
          if (!o)
            setParams(
              (cur) => {
                const next = new URLSearchParams(cur);
                next.delete('open');
                return next;
              },
              { replace: true },
            );
        }}
      >
        <Sheet>
          <DialogTitle>{open ? titleOf(open) : ''}</DialogTitle>
          {open && (
            <dl className="space-y-3 text-base">
              {detail.map((c) => (
                <div key={c.id}>
                  <dt className="text-sm text-muted-foreground">{c.header}</dt>
                  <dd>{renderCell(c, open, dir.name)}</dd>
                </div>
              ))}
            </dl>
          )}
        </Sheet>
      </Dialog>
    </>
  );
}
