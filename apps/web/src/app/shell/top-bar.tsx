import { useQueryClient } from '@tanstack/react-query';
import { Bell, LogOut, RotateCcw } from 'lucide-react';
import { useNavigate } from 'react-router';
import { useAuth } from '@/core/auth/auth-store';
import { endpoints } from '@/core/api/endpoints';
import { formatRelative } from '@/core/format';
import { useNotifications } from '@/core/notifications/notifications';
import { AtenaOrb } from '@/design/patterns/atena-orb';
import { ThemeToggle } from '@/design/patterns/theme-toggle';
import { Button } from '@/design/ui/button';
import { Avatar } from '@/design/ui/misc';
import {
  Menu,
  MenuContent,
  MenuItem,
  MenuSeparator,
  MenuTrigger,
  Popover,
  PopoverContent,
  PopoverTrigger,
  Tooltip,
} from '@/design/ui/overlay';
import { useToasts } from '@/design/ui/toast';
import { t } from '@/app/i18n';
import { GlobalSearch } from './global-search';

const IS_MAC = typeof navigator !== 'undefined' && /mac/i.test(navigator.platform);

export function TopBar({ onOpenAtena }: { onOpenAtena: () => void }) {
  const user = useAuth((state) => state.user);
  const logout = useAuth((state) => state.logout);
  const navigate = useNavigate();
  const client = useQueryClient();
  const push = useToasts((state) => state.push);
  const { items, unread, markAllRead } = useNotifications((n) => push(n.title));
  return (
    <header className="sticky top-0 z-20 flex h-16 items-center gap-2 border-b border-border bg-background/85 px-4 backdrop-blur-md sm:px-6">
      <button
        type="button"
        onClick={onOpenAtena}
        className="group flex h-10 min-w-0 flex-1 items-center gap-3 rounded-full border border-border bg-surface px-2 pr-4 text-left text-muted-foreground shadow-sm transition-shadow hover:shadow-md sm:max-w-xl"
      >
        <AtenaOrb size={28} />
        <span className="min-w-0 flex-1 truncate">{t('shell.askBar')}</span>
        <kbd className="hidden rounded-sm border border-border px-1.5 py-0.5 text-xs sm:inline">
          {IS_MAC ? t('shell.shortcutMac') : t('shell.shortcutOther')}
        </kbd>
      </button>
      <div className="ml-auto flex items-center gap-1">
        <GlobalSearch />
        <Popover>
          <Tooltip label={t('shell.notifications')}>
            <PopoverTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                aria-label={t('shell.notifications')}
                className="relative"
              >
                <Bell />
                {unread > 0 && (
                  <span className="tnum absolute top-1.5 right-1.5 flex min-w-4 items-center justify-center rounded-full bg-danger px-1 text-[10px] font-semibold text-primary-foreground">
                    {unread}
                  </span>
                )}
              </Button>
            </PopoverTrigger>
          </Tooltip>
          <PopoverContent align="end" className="w-96 max-w-[calc(100vw-2rem)] p-0">
            <div className="flex items-center justify-between border-b border-border px-4 py-3">
              <p className="font-semibold">{t('shell.notifications')}</p>
              <Button variant="ghost" size="sm" onClick={markAllRead}>
                {t('shell.markAllRead')}
              </Button>
            </div>
            <ul className="scrollbar-thin max-h-96 overflow-auto">
              {items.length === 0 && (
                <li className="p-6 text-center text-muted-foreground">
                  {t('shell.notificationsEmpty')}
                </li>
              )}
              {items.map((n) => (
                <li key={n.id}>
                  <button
                    type="button"
                    className="flex w-full flex-col gap-0.5 border-b border-border px-4 py-3 text-left last:border-0 hover:bg-muted"
                    onClick={() => n.link && void navigate(n.link)}
                  >
                    <span className="flex items-center gap-2 text-base font-medium">
                      {!n.readAt && <span className="size-2 rounded-full bg-primary" />}
                      {n.title}
                    </span>
                    <span className="text-sm text-muted-foreground">{n.body}</span>
                    <span className="text-xs text-muted-foreground">
                      {formatRelative(n.createdAt)}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </PopoverContent>
        </Popover>
        <ThemeToggle />
        <Menu>
          <MenuTrigger asChild>
            <button type="button" aria-label={t('shell.profile')} className="ml-1 rounded-full">
              <Avatar initials={user?.initials ?? ''} />
            </button>
          </MenuTrigger>
          <MenuContent align="end">
            <div className="px-2.5 py-2">
              <p className="font-medium">{user?.name}</p>
              <p className="text-sm text-muted-foreground">{user?.roleLabel}</p>
            </div>
            <MenuSeparator />
            <MenuItem
              onSelect={() => {
                void endpoints
                  .reset()
                  .then(() => client.invalidateQueries())
                  .then(() => push(t('shell.resetDone')));
              }}
            >
              <RotateCcw /> {t('shell.resetDemo')}
            </MenuItem>
            <MenuItem
              onSelect={() => {
                void logout().then(() => navigate('/login'));
              }}
            >
              <LogOut /> {t('shell.logout')}
            </MenuItem>
          </MenuContent>
        </Menu>
      </div>
    </header>
  );
}
