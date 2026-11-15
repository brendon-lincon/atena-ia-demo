import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { WifiOff } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { useLocation, useOutlet } from 'react-router';
import { useModuleStates } from '@/core/permissions';
import { startRealtime, stopRealtime } from '@/core/realtime/realtime';
import { useOnline } from '@/core/status/online';
import { duration, easing, shift } from '@/design/motion.generated';
import { CommandPalette, useCommandShortcut } from '@/design/patterns/command-palette';
import { t } from '@/app/i18n';
import { MobileNav } from './mobile-nav';
import { Sidebar } from './sidebar';
import { TopBar } from './top-bar';
import { useAtena } from './use-atena';

const SUGGESTIONS = [
  'Quanto gastei com hospedagem em Cuiabá?',
  'Abrir orçamento da Casa de Gerador',
  'Quais ASO vencem este mês?',
  'Quais atividades estão atrasadas?',
  'Como está Osasco?',
];

/** Casca: trilho + painel de módulos (computador), barra inferior (celular), barra superior e área de conteúdo. */
export function Shell() {
  const location = useLocation();
  const outlet = useOutlet();
  const reduced = useReducedMotion();
  const online = useOnline();
  const [palette, setPalette] = useState(false);
  const { items, ask } = useAtena();
  useModuleStates();
  useEffect(() => {
    startRealtime();
    return stopRealtime;
  }, []);
  const toggle = useCallback(() => setPalette((open) => !open), []);
  useCommandShortcut(toggle);

  return (
    <div className="min-h-screen md:pl-16 lg:pl-80">
      <a
        href="#content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:rounded-md focus:bg-primary focus:px-3 focus:py-2 focus:text-primary-foreground"
      >
        {t('shell.skip')}
      </a>
      <Sidebar />
      <div className="flex min-h-screen flex-col pb-20 md:pb-0">
        {!online && (
          <div
            role="status"
            className="flex items-center justify-center gap-2 bg-warning-soft px-4 py-2 text-sm text-warning-text"
          >
            <WifiOff className="size-4" /> {t('shell.offline')}
          </div>
        )}
        <TopBar onOpenAtena={() => setPalette(true)} />
        <main
          id="content"
          className="mx-auto w-full max-w-[1500px] flex-1 px-4 py-6 sm:px-6 lg:px-8"
        >
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: reduced ? 0 : shift }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: duration.base, ease: easing }}
            >
              {outlet}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
      <MobileNav />
      <CommandPalette
        open={palette}
        onOpenChange={setPalette}
        items={items}
        suggestions={SUGGESTIONS}
        ask={ask}
      />
    </div>
  );
}
