import { useQuery } from '@tanstack/react-query';
import { Search } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { endpoints } from '@/core/api/endpoints';
import { registry } from '@/core/module-registry/registry';
import { Button } from '@/design/ui/button';
import { Input } from '@/design/ui/form';
import { Dialog, DialogContent, DialogTitle } from '@/design/ui/overlay';
import { Tooltip } from '@/design/ui/overlay';
import { t } from '@/app/i18n';

const MIN_CHARS = 2;
const DEBOUNCE_MS = 250;

/** Busca global agrupada por tipo; cada resultado abre o detalhe declarado no manifesto do módulo dono. */
export function GlobalSearch() {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState('');
  const [debounced, setDebounced] = useState('');
  const navigate = useNavigate();
  useEffect(() => {
    const id = window.setTimeout(() => setDebounced(text.trim()), DEBOUNCE_MS);
    return () => window.clearTimeout(id);
  }, [text]);
  const results = useQuery({
    queryKey: ['search', debounced],
    queryFn: () => endpoints.search(debounced),
    enabled: debounced.length >= MIN_CHARS,
  });
  return (
    <>
      <Tooltip label={t('shell.search')}>
        <Button
          variant="ghost"
          size="icon"
          aria-label={t('shell.search')}
          onClick={() => setOpen(true)}
        >
          <Search />
        </Button>
      </Tooltip>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="top-[14vh] max-w-xl translate-y-0">
          <DialogTitle className="sr-only">{t('shell.search')}</DialogTitle>
          <Input
            autoFocus
            value={text}
            onChange={(event) => setText(event.target.value)}
            placeholder={t('shell.searchPlaceholder')}
            aria-label={t('shell.search')}
          />
          <div className="scrollbar-thin max-h-[50vh] space-y-4 overflow-auto">
            {debounced.length < MIN_CHARS && (
              <p className="text-sm text-muted-foreground">{t('shell.searchHint')}</p>
            )}
            {results.data?.length === 0 && (
              <p className="text-base text-muted-foreground">{t('shell.searchEmpty')}</p>
            )}
            {results.data?.map((group) => (
              <section key={group.type}>
                <h3 className="mb-1 text-xs font-semibold tracking-wide text-muted-foreground">
                  {registry.byId(group.type)?.label ?? group.type}
                </h3>
                <ul>
                  {group.items.map((item) => (
                    <li key={item.id}>
                      <button
                        type="button"
                        className="flex w-full flex-col rounded-md px-3 py-2 text-left hover:bg-muted"
                        onClick={() => {
                          setOpen(false);
                          void navigate(
                            registry.recordPath(group.type, item.id) ?? `/${group.type}`,
                          );
                        }}
                      >
                        <span className="text-base">{item.title}</span>
                        {item.subtitle && (
                          <span className="text-sm text-muted-foreground">{item.subtitle}</span>
                        )}
                      </button>
                    </li>
                  ))}
                </ul>
              </section>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
