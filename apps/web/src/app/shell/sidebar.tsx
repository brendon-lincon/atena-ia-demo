import { motion } from 'motion/react';
import { Link, NavLink, useLocation } from 'react-router';
import { useCan } from '@/core/permissions';
import { AREAS, registry } from '@/core/module-registry/registry';
import { BrandLockup, BrandSymbol } from '@/design/brand/logo';
import { cn } from '@/design/cn';
import { spring } from '@/design/motion.generated';
import { Tooltip } from '@/design/ui/overlay';
import { t } from '@/app/i18n';

/** Trilho com as 7 áreas (ícone, rótulo ao passar o mouse) e painel secundário com os módulos da área. */
export function Sidebar() {
  const { pathname } = useLocation();
  const can = useCan();
  const current = registry.ofPath(pathname);
  const active = current?.area ?? 'home';
  const visible = (area: string) =>
    registry.inArea(area as never).filter((m) => can(m.requires ?? 'read', m.id));
  return (
    <>
      <nav
        aria-label={t('shell.mainMenu')}
        className="fixed inset-y-0 left-0 z-30 hidden w-16 flex-col items-center gap-2 bg-sidebar py-4 text-sidebar-foreground md:flex"
      >
        <Link
          to="/"
          aria-label={t('shell.brand')}
          className="mb-4 flex size-10 items-center justify-center rounded-md"
        >
          <BrandSymbol micro className="h-8 w-auto" />
        </Link>
        {AREAS.map((area) => {
          const first = visible(area.id)[0];
          if (!first) return null;
          const Icon = area.icon;
          const selected = area.id === active;
          return (
            <Tooltip key={area.id} label={t(`areas.${area.id}`)}>
              <Link
                to={registry.modulePath(first.id)}
                aria-label={t(`areas.${area.id}`)}
                aria-current={selected ? 'page' : undefined}
                className={cn(
                  'relative flex size-11 items-center justify-center rounded-md transition-colors hover:bg-sidebar-active',
                  selected ? 'text-sidebar-foreground' : 'text-sidebar-muted',
                )}
              >
                {selected && (
                  <motion.span
                    layoutId="rail-active"
                    transition={spring}
                    className="absolute inset-0 rounded-md bg-sidebar-active"
                  />
                )}
                <Icon className="relative size-5" />
              </Link>
            </Tooltip>
          );
        })}
      </nav>
      <aside className="fixed inset-y-0 left-16 z-20 hidden w-64 flex-col border-r border-border bg-surface lg:flex">
        <div className="flex h-16 items-center px-5">
          <BrandLockup className="h-9 w-auto text-foreground" />
        </div>
        <p className="px-5 pt-3 pb-2 text-sm font-semibold text-muted-foreground">
          {t(`areas.${active}`)}
        </p>
        <ul className="scrollbar-thin flex-1 space-y-0.5 overflow-y-auto px-3 pb-4">
          {visible(active).map((m) => (
            <li key={m.id}>
              <NavLink
                to={registry.modulePath(m.id)}
                end={m.id === 'dashboard'}
                className={({ isActive }) =>
                  cn(
                    'relative flex items-center gap-3 rounded-md px-3 py-2.5 text-base transition-colors hover:bg-muted',
                    isActive ? 'font-medium text-foreground' : 'text-muted-foreground',
                  )
                }
              >
                {({ isActive }) => (
                  <>
                    {isActive && (
                      <motion.span
                        layoutId="panel-active"
                        transition={spring}
                        className="absolute inset-0 rounded-md bg-primary-soft"
                      />
                    )}
                    <m.icon className="relative size-[18px]" />
                    <span className="relative">{m.label}</span>
                  </>
                )}
              </NavLink>
            </li>
          ))}
        </ul>
      </aside>
    </>
  );
}
