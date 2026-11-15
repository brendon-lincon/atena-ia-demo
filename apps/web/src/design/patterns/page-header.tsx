import { ChevronRight } from 'lucide-react';
import type { ReactNode } from 'react';
import { Link } from 'react-router';
import { createT } from '@/core/i18n/create-t';
import { messages } from '@/core/i18n/messages';
import { cn } from '@/design/cn';

const t = createT(messages);

export interface Crumb {
  label: string;
  to?: string;
}

/** Cabeçalho de página: trilha de navegação, título, descrição e ações. */
export function PageHeader({
  title,
  description,
  crumbs,
  actions,
  meta,
  className,
}: {
  title: string;
  description?: string;
  crumbs?: Crumb[];
  actions?: ReactNode;
  meta?: ReactNode;
  className?: string;
}) {
  return (
    <header className={cn('flex flex-col gap-3 pb-5', className)}>
      {crumbs && crumbs.length > 0 && (
        <nav aria-label={t('common.breadcrumb')}>
          <ol className="flex flex-wrap items-center gap-1 text-sm text-muted-foreground">
            {crumbs.map((crumb, index) => (
              <li key={crumb.label} className="flex items-center gap-1">
                {crumb.to ? (
                  <Link to={crumb.to} className="rounded-sm hover:text-foreground hover:underline">
                    {crumb.label}
                  </Link>
                ) : (
                  <span aria-current="page">{crumb.label}</span>
                )}
                {index < crumbs.length - 1 && <ChevronRight className="size-3.5" aria-hidden />}
              </li>
            ))}
          </ol>
        </nav>
      )}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0 space-y-1">
          <h1 className="text-3xl font-semibold tracking-tight text-balance">{title}</h1>
          {description && (
            <p className="max-w-2xl text-base text-muted-foreground">{description}</p>
          )}
          {meta}
        </div>
        {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
      </div>
    </header>
  );
}
