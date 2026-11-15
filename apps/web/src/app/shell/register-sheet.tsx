import { Camera, Mic, NotebookPen, Receipt } from 'lucide-react';
import { useState } from 'react';
import { defineResource } from '@/core/api/resource';
import { looseRecord } from '@/core/api/loose';
import { cn } from '@/design/cn';
import { Button } from '@/design/ui/button';
import { Input, Textarea } from '@/design/ui/form';
import { Dialog, DialogDescription, DialogTitle, Sheet } from '@/design/ui/overlay';
import { useToasts } from '@/design/ui/toast';
import { t } from '@/app/i18n';

const notes = defineResource('notes', looseRecord);
const advances = defineResource('advances', looseRecord);
const CENTS = 100;
type Mode = 'menu' | 'note' | 'voucher' | 'audio';

/** "Registrar": foto, áudio, nota e vale, direto do canteiro (celular). */
export function RegisterSheet({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [mode, setMode] = useState<Mode>('menu');
  const [text, setText] = useState('');
  const push = useToasts((state) => state.push);
  const finish = (message: string) => {
    push(message);
    setMode('menu');
    setText('');
    onOpenChange(false);
  };
  const tiles = [
    { id: 'audio', label: t('mobile.audio'), icon: Mic, run: () => setMode('audio') },
    { id: 'note', label: t('mobile.note'), icon: NotebookPen, run: () => setMode('note') },
    { id: 'voucher', label: t('mobile.voucher'), icon: Receipt, run: () => setMode('voucher') },
  ];
  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        onOpenChange(next);
        if (!next) setMode('menu');
      }}
    >
      <Sheet side="bottom">
        <DialogTitle>{t('mobile.registerTitle')}</DialogTitle>
        <DialogDescription>{t('mobile.registerDescription')}</DialogDescription>
        {mode === 'menu' && (
          <div className="grid grid-cols-2 gap-3">
            <label className="flex h-24 cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border border-border bg-surface text-base font-medium transition-colors hover:bg-primary-soft active:scale-[0.98]">
              <Camera className="size-6 text-primary" />
              {t('mobile.photo')}
              <input
                type="file"
                accept="image/*"
                capture="environment"
                className="sr-only"
                onChange={(event) => {
                  if (event.target.files?.length) finish(t('mobile.photoDone'));
                }}
              />
            </label>
            {tiles.map(({ id, label, icon: Icon, run }) => (
              <button
                key={id}
                type="button"
                onClick={run}
                className="flex h-24 flex-col items-center justify-center gap-2 rounded-lg border border-border bg-surface text-base font-medium transition-colors hover:bg-primary-soft active:scale-[0.98]"
              >
                <Icon className="size-6 text-primary" />
                {label}
              </button>
            ))}
          </div>
        )}
        {mode === 'note' && (
          <form
            className="space-y-3"
            onSubmit={(event) => {
              event.preventDefault();
              void notes
                .create({ recordType: 'general', recordId: '', body: text, pinned: false })
                .then(() => finish(t('mobile.noteDone')));
            }}
          >
            <Textarea
              autoFocus
              value={text}
              onChange={(event) => setText(event.target.value)}
              placeholder={t('mobile.noteField')}
              aria-label={t('mobile.noteField')}
            />
            <Button type="submit" className="w-full" disabled={!text.trim()}>
              {t('mobile.send')}
            </Button>
          </form>
        )}
        {mode === 'voucher' && (
          <form
            className="space-y-3"
            onSubmit={(event) => {
              event.preventDefault();
              void advances
                .create({
                  kind: 'advance',
                  amountCents: Math.round(Number(text.replace(',', '.')) * CENTS),
                  status: 'requested',
                  date: new Date().toISOString().slice(0, 10),
                })
                .then(() => finish(t('mobile.voucherDone')));
            }}
          >
            <Input
              autoFocus
              inputMode="decimal"
              value={text}
              onChange={(event) => setText(event.target.value)}
              placeholder={t('mobile.voucherField')}
              aria-label={t('mobile.voucherField')}
            />
            <Button type="submit" className="w-full" disabled={!Number(text.replace(',', '.'))}>
              {t('mobile.send')}
            </Button>
          </form>
        )}
        {mode === 'audio' && (
          <Button
            variant="danger"
            className={cn('h-16 w-full animate-pulse text-lg')}
            onClick={() => finish(t('mobile.audioDone'))}
          >
            <Mic /> {t('mobile.recording')}
          </Button>
        )}
      </Sheet>
    </Dialog>
  );
}
