import { motion } from 'motion/react';
import { Home, HardHat, LayoutGrid, MessageCircle, Plus } from 'lucide-react';
import { useState } from 'react';
import { Link, useLocation } from 'react-router';
import { cn } from '@/design/cn';
import { spring } from '@/design/motion.generated';
import { Dialog, DialogTitle, Sheet } from '@/design/ui/overlay';
import { AREAS, registry } from '@/core/module-registry/registry';
import { t } from '@/app/i18n';
import { RegisterSheet } from './register-sheet';

/** Barra inferior do celular: Início, Obras, Conversas, Registrar e Mais. */
export function MobileNav() {
  const { pathname } = useLocation();
  const [register, setRegister] = useState(false);
  const [more, setMore] = useState(false);
  const owner = registry.ofPath(pathname)?.id;
  const items = [
    { id: 'dashboard', to: '/', label: t('mobile.home'), icon: Home },
    { id: 'works', to: '/works', label: t('mobile.works'), icon: HardHat },
    {
      id: 'conversations',
      to: '/conversations',
      label: t('mobile.conversations'),
      icon: MessageCircle,
    },
  ];
  const conversations = items[2] ?? {
    id: 'conversations',
    to: '/conversations',
    label: t('mobile.conversations'),
    icon: MessageCircle,
  };
  return (
    <>
      <nav
        className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-5 items-end border-t border-border bg-surface/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-md md:hidden"
        aria-label={t('shell.mainMenu')}
      >
        {items.slice(0, 2).map((item) => (
          <Tab key={item.id} {...item} active={owner === item.id} />
        ))}
        <button
          type="button"
          onClick={() => setRegister(true)}
          className="-mt-5 flex flex-col items-center gap-0.5 pb-2 text-xs font-medium"
        >
          <span className="atena-gradient flex size-14 items-center justify-center rounded-full text-primary-strong shadow-lg">
            <Plus className="size-7" />
          </span>
          {t('mobile.register')}
        </button>
        <Tab {...conversations} active={owner === 'conversations'} />
        <button
          type="button"
          onClick={() => setMore(true)}
          className="flex flex-col items-center gap-0.5 py-2 text-xs font-medium text-muted-foreground"
        >
          <LayoutGrid className="size-5" />
          {t('mobile.more')}
        </button>
      </nav>
      <RegisterSheet open={register} onOpenChange={setRegister} />
      <Dialog open={more} onOpenChange={setMore}>
        <Sheet side="bottom">
          <DialogTitle>{t('mobile.moreTitle')}</DialogTitle>
          <div className="space-y-5">
            {AREAS.map((area) => (
              <section key={area.id}>
                <h3 className="mb-2 text-sm font-semibold text-muted-foreground">
                  {t(`areas.${area.id}`)}
                </h3>
                <ul className="grid grid-cols-2 gap-2">
                  {registry.inArea(area.id).map((m) => (
                    <li key={m.id}>
                      <Link
                        to={registry.modulePath(m.id)}
                        onClick={() => setMore(false)}
                        className="flex items-center gap-2 rounded-md border border-border px-3 py-2.5 text-base hover:bg-muted"
                      >
                        <m.icon className="size-4 text-primary" />
                        {m.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            ))}
          </div>
        </Sheet>
      </Dialog>
    </>
  );
}

function Tab({
  to,
  label,
  icon: Icon,
  active,
}: {
  to: string;
  label: string;
  icon: typeof Home;
  active: boolean;
}) {
  return (
    <Link
      to={to}
      className={cn(
        'relative flex flex-col items-center gap-0.5 py-2 text-xs font-medium',
        active ? 'text-primary' : 'text-muted-foreground',
      )}
      aria-current={active ? 'page' : undefined}
    >
      {active && (
        <motion.span
          layoutId="mobile-tab"
          transition={spring}
          className="absolute top-0 h-0.5 w-8 rounded-full bg-primary"
        />
      )}
      <Icon className="size-5" />
      {label}
    </Link>
  );
}
