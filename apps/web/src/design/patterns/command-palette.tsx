import { Command } from 'cmdk';
import { ArrowLeft, CornerDownLeft, Sparkles } from 'lucide-react';
import { useEffect, useState, type ReactNode } from 'react';
import { createT } from '@/core/i18n/create-t';
import { messages } from '@/core/i18n/messages';
import { Button } from '@/design/ui/button';
import { AtenaOrb } from './atena-orb';
import { SourceTag } from './source-tag';

const t = createT(messages);
export interface PaletteItem {
  id: string;
  label: string;
  group: 'navigate' | 'create';
  icon?: ReactNode;
  keywords?: string[];
  onSelect: () => void;
}
export interface AtenaAnswer {
  reply: string;
  actions: { label: string; run: () => void }[];
  sources: { label: string }[];
}

/** Atalho global Ctrl+K / ⌘+K. */
export function useCommandShortcut(toggle: () => void): void {
  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        toggle();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [toggle]);
}

/** Barra da Atena: navegar, criar e perguntar. Respostas com fontes e ações clicáveis. */
export function CommandPalette({
  open,
  onOpenChange,
  items,
  suggestions,
  ask,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  items: PaletteItem[];
  suggestions: string[];
  ask: (text: string) => Promise<AtenaAnswer>;
}) {
  const [query, setQuery] = useState('');
  const [pending, setPending] = useState(false);
  const [answer, setAnswer] = useState<AtenaAnswer | null>(null);

  const reset = () => {
    setQuery('');
    setAnswer(null);
    setPending(false);
  };
  const submit = async (text: string) => {
    setPending(true);
    setAnswer(null);
    setAnswer(await ask(text));
    setPending(false);
  };
  const close = (next: boolean) => {
    onOpenChange(next);
    if (!next) reset();
  };

  return (
    <Command.Dialog
      open={open}
      onOpenChange={close}
      label={t('command.placeholder')}
      className="fixed top-[14vh] left-1/2 z-[70] w-[calc(100vw-2rem)] max-w-2xl -translate-x-1/2 overflow-hidden rounded-lg border border-border bg-elevated shadow-lg"
      overlayClassName="fixed inset-0 z-[65] bg-overlay backdrop-blur-[2px]"
    >
      <div className="flex items-center gap-3 border-b border-border px-4 py-3">
        <AtenaOrb size={30} thinking={pending} />
        <Command.Input
          value={query}
          onValueChange={(value) => {
            setQuery(value);
            setAnswer(null);
          }}
          placeholder={t('command.placeholder')}
          className="h-9 flex-1 bg-transparent text-lg outline-none placeholder:text-muted-foreground"
        />
        <kbd className="hidden rounded-sm border border-border px-1.5 py-0.5 text-xs text-muted-foreground sm:inline">
          {t('command.escape')}
        </kbd>
      </div>
      {pending || answer ? (
        <div className="space-y-4 p-5" aria-live="polite">
          {pending ? (
            <p className="text-base text-muted-foreground">{t('command.thinking')}…</p>
          ) : (
            answer && (
              <>
                <p className="text-lg leading-relaxed">{answer.reply}</p>
                {answer.sources.length > 0 && (
                  <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                    {t('command.sources')}:
                    {answer.sources.map((source) => (
                      <SourceTag key={source.label} kind="file">
                        {source.label}
                      </SourceTag>
                    ))}
                  </div>
                )}
                <div className="flex flex-wrap gap-2">
                  {answer.actions.map((action) => (
                    <Button
                      key={action.label}
                      variant="atena"
                      onClick={() => {
                        action.run();
                        close(false);
                      }}
                    >
                      {action.label}
                    </Button>
                  ))}
                  <Button
                    variant="ghost"
                    onClick={() => {
                      setAnswer(null);
                      setQuery('');
                    }}
                  >
                    <ArrowLeft /> {t('common.back')}
                  </Button>
                </div>
              </>
            )
          )}
        </div>
      ) : (
        <Command.List className="scrollbar-thin max-h-[50vh] overflow-auto p-2">
          <Command.Empty className="p-6 text-center text-base text-muted-foreground">
            {t('command.empty')}
          </Command.Empty>
          {query.trim() && (
            <Command.Group heading={t('command.ask')} forceMount>
              <Command.Item
                forceMount
                value={`ask ${query}`}
                onSelect={() => void submit(query)}
                className={itemClass}
              >
                <Sparkles className="size-4 text-primary" /> {query}
                <CornerDownLeft className="ml-auto size-4 text-muted-foreground" />
              </Command.Item>
            </Command.Group>
          )}
          {!query.trim() && (
            <Command.Group heading={t('command.suggestions')}>
              {suggestions.map((s) => (
                <Command.Item
                  key={s}
                  value={`sugestao ${s}`}
                  onSelect={() => {
                    setQuery(s);
                    void submit(s);
                  }}
                  className={itemClass}
                >
                  <Sparkles className="size-4 text-primary" /> {s}
                </Command.Item>
              ))}
            </Command.Group>
          )}
          {(['navigate', 'create'] as const).map((group) => (
            <Command.Group key={group} heading={t(`command.${group}`)}>
              {items
                .filter((item) => item.group === group)
                .map((item) => (
                  <Command.Item
                    key={item.id}
                    value={`${item.label} ${item.keywords?.join(' ') ?? ''}`}
                    onSelect={() => {
                      item.onSelect();
                      close(false);
                    }}
                    className={itemClass}
                  >
                    {item.icon} {item.label}
                  </Command.Item>
                ))}
            </Command.Group>
          ))}
        </Command.List>
      )}
    </Command.Dialog>
  );
}

const itemClass =
  'flex cursor-pointer items-center gap-3 rounded-md px-3 py-2.5 text-base data-[selected=true]:bg-primary-soft [&_svg]:size-4 [&_svg]:text-muted-foreground';
