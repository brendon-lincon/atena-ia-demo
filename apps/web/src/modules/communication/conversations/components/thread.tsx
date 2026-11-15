import {
  CalendarClock,
  ChevronLeft,
  Clock,
  ListChecks,
  Mic,
  NotebookPen,
  Receipt,
  Send,
  Sparkles,
  ArrowRightLeft,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useCreate } from '@/core/api/hooks';
import {
  advancesApi,
  diaryApi,
  notesApi,
  tasksApi,
} from '@/modules/communication/conversations/links';
import { formatDateTime } from '@/core/format';
import { cn } from '@/design/cn';
import { EmptyState } from '@/design/patterns/empty-state';
import { SkeletonRows } from '@/design/patterns/skeleton';
import { Button } from '@/design/ui/button';
import { Input, Textarea } from '@/design/ui/form';
import { Menu, MenuContent, MenuItem, MenuTrigger } from '@/design/ui/overlay';
import { useToasts } from '@/design/ui/toast';
import {
  messagesApi,
  usePhoto,
  type Conversation,
  type Message,
} from '@/modules/communication/conversations/api';
import { t } from '@/modules/communication/conversations/i18n';

function Bubble({
  message,
  onConvert,
}: {
  message: Message;
  onConvert: (kind: 'task' | 'note' | 'diary' | 'voucher', text: string) => void;
}) {
  const photo = usePhoto(message.type === 'image' ? message.photoId : null);
  const out = message.direction === 'out';
  const text = message.body ?? message.transcript ?? message.caption ?? '';
  return (
    <div className={cn('group flex gap-2', out ? 'justify-end' : 'justify-start')}>
      <div
        className={cn(
          'max-w-[82%] space-y-1.5 rounded-lg px-3.5 py-2.5 text-base shadow-sm',
          out ? 'bg-primary text-primary-foreground' : 'bg-surface border border-border',
        )}
      >
        {message.type === 'image' && photo.data && (
          <img
            src={`/demo/photos/${photo.data.file}`}
            alt={message.caption ?? t('photo')}
            className="w-64 max-w-full rounded-md"
            loading="lazy"
          />
        )}
        {message.type === 'audio' && (
          <div className="flex items-center gap-2">
            <Mic className="size-4 shrink-0" />
            <span className="flex h-5 items-end gap-px" aria-hidden>
              {Array.from({ length: 22 }, (_, i) => (
                <span
                  key={i}
                  className="w-[3px] rounded-full bg-current opacity-60"
                  style={{ height: `${30 + ((i * 37) % 70)}%` }}
                />
              ))}
            </span>
            <span className="tnum text-xs opacity-80">
              {t('audio', { seconds: message.durationSec ?? 0 })}
            </span>
          </div>
        )}
        {text && (
          <p className={cn(message.type === 'audio' && 'text-sm italic opacity-90')}>
            {message.type === 'audio' ? `${t('transcript')}: ${text}` : text}
          </p>
        )}
        <p
          className={cn(
            'flex items-center gap-1 text-xs',
            out ? 'text-primary-foreground/75' : 'text-muted-foreground',
          )}
        >
          {message.status === 'scheduled' ? (
            <>
              <CalendarClock className="size-3" />
              {t('scheduled', { date: formatDateTime(message.sentAt) })}
            </>
          ) : (
            <>
              <Clock className="size-3" />
              {formatDateTime(message.sentAt)}
            </>
          )}
        </p>
      </div>
      {text && (
        <Menu>
          <MenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon-sm"
              aria-label={t('convertTo')}
              className="self-center opacity-0 group-hover:opacity-100 focus-visible:opacity-100"
            >
              <ArrowRightLeft />
            </Button>
          </MenuTrigger>
          <MenuContent align={out ? 'end' : 'start'}>
            <MenuItem onSelect={() => onConvert('task', text)}>
              <ListChecks /> {t('toTask')}
            </MenuItem>
            <MenuItem onSelect={() => onConvert('note', text)}>
              <NotebookPen /> {t('toNote')}
            </MenuItem>
            <MenuItem onSelect={() => onConvert('diary', text)}>
              <Sparkles /> {t('toDiary')}
            </MenuItem>
            <MenuItem onSelect={() => onConvert('voucher', text)}>
              <Receipt /> {t('toVoucher')}
            </MenuItem>
          </MenuContent>
        </Menu>
      )}
    </div>
  );
}

/** Conversa aberta: mensagens de texto, foto e áudio (com transcrição), envio simulado, agendamento e conversão em registros. */
export function Thread({
  conversation,
  messages,
  loading,
  onBack,
}: {
  conversation: Conversation;
  messages: Message[];
  loading: boolean;
  onBack: () => void;
}) {
  const client = useQueryClient();
  const push = useToasts((s) => s.push);
  const create = useCreate(messagesApi);
  const [draft, setDraft] = useState('');
  const [scheduleAt, setScheduleAt] = useState('');
  const [scheduling, setScheduling] = useState(false);
  const end = useRef<HTMLDivElement>(null);
  useEffect(() => {
    end.current?.scrollIntoView({ block: 'end' });
  }, [messages.length, conversation.id]);

  const send = (text: string) => {
    if (!text.trim()) return;
    const when =
      scheduling && scheduleAt ? new Date(scheduleAt).toISOString() : new Date().toISOString();
    create.mutate(
      {
        conversationId: conversation.id,
        direction: 'out',
        type: 'text',
        body: text.trim(),
        sentAt: when,
        status: scheduling && scheduleAt ? 'scheduled' : 'delivered',
      },
      {
        onSuccess: () => {
          setDraft('');
          setScheduling(false);
          setScheduleAt('');
          push(scheduling && scheduleAt ? t('scheduledDone') : t('sent'));
        },
      },
    );
  };

  const convert = async (kind: 'task' | 'note' | 'diary' | 'voucher', text: string) => {
    const today = new Date().toISOString().slice(0, 10);
    if (kind === 'task')
      await tasksApi.create({
        title: text.slice(0, 120),
        status: 'todo',
        priority: 'medium',
        obraId: conversation.obraId ?? null,
        origin: 'conversation',
      });
    if (kind === 'note')
      await notesApi.create({
        recordType: conversation.obraId ? 'obras' : 'general',
        recordId: conversation.obraId ?? '',
        body: text,
        pinned: false,
      });
    if (kind === 'diary')
      await diaryApi.create({
        obraId: conversation.obraId ?? null,
        date: today,
        notes: text,
        services: [],
        photoIds: [],
        headcountOwn: 0,
        headcountThird: 0,
        weather: { condition: '—', tempC: 0, rainMm: 0 },
        dayCostCents: 0,
      });
    if (kind === 'voucher') {
      const value = Number((window.prompt(t('voucherAsk')) ?? '').replace(',', '.'));
      if (!value) return;
      await advancesApi.create({
        kind: 'advance',
        amountCents: Math.round(value * 100),
        status: 'requested',
        date: today,
        obraId: conversation.obraId ?? null,
      });
    }
    void client.invalidateQueries();
    push(t(`converted.${kind === 'diary' ? 'diary' : kind}`));
  };

  return (
    <section className="flex h-full min-h-0 flex-col" aria-label={conversation.title}>
      <header className="flex items-center gap-2 border-b border-border px-3 py-3">
        <Button
          variant="ghost"
          size="icon-sm"
          className="md:hidden"
          onClick={onBack}
          aria-label={t('back')}
        >
          <ChevronLeft />
        </Button>
        <h2 className="truncate text-lg font-semibold tracking-tight">{conversation.title}</h2>
      </header>
      <div className="scrollbar-thin flex-1 space-y-3 overflow-y-auto bg-muted/40 p-4">
        {loading ? (
          <SkeletonRows rows={5} />
        ) : messages.length === 0 ? (
          <EmptyState title={t('noMessages')} />
        ) : (
          messages.map((m) => (
            <Bubble key={m.id} message={m} onConvert={(k, x) => void convert(k, x)} />
          ))
        )}
        <div ref={end} />
      </div>
      <div className="space-y-2 border-t border-border p-3">
        <div className="flex flex-wrap gap-1.5" aria-label={t('quickReplies')}>
          {(['a', 'b', 'c', 'd'] as const).map((k) => (
            <button
              key={k}
              type="button"
              onClick={() => setDraft(t(`quick.${k}`))}
              className="rounded-full border border-border px-2.5 py-1 text-xs hover:bg-muted"
            >
              {t(`quick.${k}`)}
            </button>
          ))}
        </div>
        <form
          className="flex items-end gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            send(draft);
          }}
        >
          <Textarea
            rows={1}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder={t('composer')}
            aria-label={t('composer')}
            className="min-h-10 flex-1 resize-none"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                send(draft);
              }
            }}
          />
          <Button
            type="button"
            variant={scheduling ? 'secondary' : 'ghost'}
            size="icon"
            aria-label={t('schedule')}
            onClick={() => setScheduling((s) => !s)}
          >
            <CalendarClock />
          </Button>
          <Button
            type="submit"
            size="icon"
            aria-label={t('send')}
            disabled={!draft.trim() || create.isPending}
          >
            <Send />
          </Button>
        </form>
        {scheduling && (
          <label className="flex items-center gap-2 text-sm text-muted-foreground">
            {t('scheduleAt')}
            <Input
              type="datetime-local"
              value={scheduleAt}
              onChange={(e) => setScheduleAt(e.target.value)}
              className="h-9 w-56"
            />
          </label>
        )}
      </div>
    </section>
  );
}
