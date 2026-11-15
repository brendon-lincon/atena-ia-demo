import { ExternalLink, FileQuestion, Minus, Plus } from 'lucide-react';
import { useState } from 'react';
import { createT } from '@/core/i18n/create-t';
import { messages } from '@/core/i18n/messages';
import { Button } from '@/design/ui/button';
import { EmptyState } from './empty-state';

const t = createT(messages);
export interface FileViewerProps {
  name: string;
  kind: 'pdf' | 'image' | 'dxf' | 'other';
  url?: string | null;
  previewUrl?: string | null;
}

/** Visualizador de arquivos: PDF e imagem (com zoom). DXF mostra prévia estática nesta fase. */
export function FileViewer({ name, kind, url, previewUrl }: FileViewerProps) {
  const [zoom, setZoom] = useState(1);
  const source = kind === 'dxf' ? previewUrl : url;
  return (
    <div className="surface-card overflow-hidden">
      <div className="flex items-center gap-2 border-b border-border p-2 pl-4">
        <span className="min-w-0 flex-1 truncate text-sm font-medium">{name}</span>
        {kind === 'dxf' && (
          <span className="rounded-full bg-primary-soft px-2 py-0.5 text-xs">
            {t('file.staticPreview')}
          </span>
        )}
        {(kind === 'image' || kind === 'dxf') && source && (
          <>
            <Button
              variant="ghost"
              size="icon-sm"
              aria-label={t('file.zoomOut')}
              onClick={() => setZoom((z) => Math.max(z - 0.25, 0.5))}
            >
              <Minus />
            </Button>
            <Button
              variant="ghost"
              size="icon-sm"
              aria-label={t('file.zoomIn')}
              onClick={() => setZoom((z) => Math.min(z + 0.25, 3))}
            >
              <Plus />
            </Button>
          </>
        )}
        {url && (
          <Button variant="ghost" size="icon-sm" asChild>
            <a href={url} target="_blank" rel="noreferrer" aria-label={t('file.openNewTab')}>
              <ExternalLink />
            </a>
          </Button>
        )}
      </div>
      <div className="scrollbar-thin h-[480px] overflow-auto bg-muted/50">
        {!source ? (
          <EmptyState
            title={t('file.unavailable')}
            description={t('file.unavailableHint')}
            className="h-full justify-center"
          />
        ) : kind === 'pdf' ? (
          <object
            data={`${source}#toolbar=0&navpanes=0`}
            type="application/pdf"
            className="size-full"
            aria-label={name}
          >
            <EmptyState title={t('file.unavailable')} description={t('file.unavailableHint')} />
          </object>
        ) : (
          <div className="flex min-h-full items-center justify-center p-4">
            <img
              src={source}
              alt={name}
              style={{ width: `${zoom * 100}%`, maxWidth: zoom > 1 ? 'none' : '100%' }}
              className="rounded-md shadow-md transition-[width] duration-[var(--duration-base)]"
            />
          </div>
        )}
        {kind === 'other' && !source && <FileQuestion className="hidden" />}
      </div>
    </div>
  );
}
