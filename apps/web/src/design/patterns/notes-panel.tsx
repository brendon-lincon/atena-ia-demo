import { Pin } from 'lucide-react';
import { useState } from 'react';
import { createT } from '@/core/i18n/create-t';
import { messages } from '@/core/i18n/messages';
import { formatRelative } from '@/core/format';
import { Avatar } from '@/design/ui/misc';
import { Button } from '@/design/ui/button';
import { Textarea } from '@/design/ui/form';
import { EmptyState } from './empty-state';

const t = createT(messages);
export interface NoteItem {
  id: string;
  author: string;
  initials: string;
  body: string;
  at: string;
  pinned?: boolean;
}

/** Notas de qualquer registro; alimentam o Olhar de Atena. */
export function NotesPanel({
  notes,
  onAdd,
}: {
  notes: NoteItem[];
  onAdd?: (body: string) => void;
}) {
  const [draft, setDraft] = useState('');
  return (
    <div className="space-y-4">
      {onAdd && (
        <form
          className="space-y-2"
          onSubmit={(event) => {
            event.preventDefault();
            if (!draft.trim()) return;
            onAdd(draft.trim());
            setDraft('');
          }}
        >
          <Textarea
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            placeholder={t('record.notesPlaceholder')}
            aria-label={t('record.notesPlaceholder')}
          />
          <Button type="submit" size="sm" disabled={!draft.trim()}>
            {t('record.notesAdd')}
          </Button>
        </form>
      )}
      {notes.length === 0 ? (
        <EmptyState
          title={t('record.notesEmpty')}
          description={t('record.notesPlaceholder')}
          className="py-6"
        />
      ) : (
        <ul className="space-y-3">
          {notes.map((note) => (
            <li key={note.id} className="flex gap-3">
              <Avatar initials={note.initials} className="size-8 text-xs" />
              <div className="min-w-0 flex-1 rounded-md bg-muted/70 p-3">
                <div className="mb-1 flex items-center gap-2 text-xs text-muted-foreground">
                  <span className="font-medium text-foreground">{note.author}</span>
                  <span>{formatRelative(note.at)}</span>
                  {note.pinned && (
                    <span className="inline-flex items-center gap-1">
                      <Pin className="size-3" /> {t('record.pinned')}
                    </span>
                  )}
                </div>
                <p className="text-base">{note.body}</p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
