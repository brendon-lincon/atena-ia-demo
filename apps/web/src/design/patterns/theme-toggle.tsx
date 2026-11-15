import { AnimatePresence, motion } from 'motion/react';
import { Monitor, Moon, Sun } from 'lucide-react';
import type { MouseEvent } from 'react';
import { createT } from '@/core/i18n/create-t';
import { messages } from '@/core/i18n/messages';
import { resolvedTheme, useTheme, type ThemeMode } from '@/core/theme/theme-store';
import { Button } from '@/design/ui/button';
import { Menu, MenuContent, MenuItem, MenuTrigger } from '@/design/ui/overlay';

const t = createT(messages);
const OPTIONS: {
  mode: ThemeMode;
  icon: typeof Sun;
  label: 'theme.light' | 'theme.dark' | 'theme.system';
}[] = [
  { mode: 'light', icon: Sun, label: 'theme.light' },
  { mode: 'dark', icon: Moon, label: 'theme.dark' },
  { mode: 'system', icon: Monitor, label: 'theme.system' },
];

/** Alternância de tema com revelação circular a partir do ponto clicado. */
export function ThemeToggle() {
  const { mode, setMode } = useTheme();
  const active = resolvedTheme(mode);
  const Icon = active === 'dark' ? Moon : Sun;
  const choose = (next: ThemeMode) => (event: Event | MouseEvent) => {
    const e = event as MouseEvent;
    setMode(next, { x: e.clientX, y: e.clientY });
  };
  return (
    <Menu>
      <MenuTrigger asChild>
        <Button variant="ghost" size="icon" aria-label={t('theme.toggle')}>
          <AnimatePresence mode="wait" initial={false}>
            <motion.span
              key={active}
              initial={{ rotate: -60, opacity: 0, scale: 0.6 }}
              animate={{ rotate: 0, opacity: 1, scale: 1 }}
              exit={{ rotate: 60, opacity: 0, scale: 0.6 }}
              transition={{ duration: 0.18 }}
              className="flex"
            >
              <Icon />
            </motion.span>
          </AnimatePresence>
        </Button>
      </MenuTrigger>
      <MenuContent align="end">
        {OPTIONS.map(({ mode: option, icon: OptionIcon, label }) => (
          <MenuItem
            key={option}
            onSelect={(event) => choose(option)(event)}
            data-active={mode === option}
          >
            <OptionIcon /> {t(label)}
          </MenuItem>
        ))}
      </MenuContent>
    </Menu>
  );
}
