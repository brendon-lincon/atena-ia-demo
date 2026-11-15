import { isRouteErrorResponse, Link, useRouteError } from 'react-router';
import { EmptyState, ErrorState } from '@/design/patterns/empty-state';
import { Button } from '@/design/ui/button';
import { t } from './i18n';

/** Página inexistente. */
export function NotFoundPage() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center p-6">
      <EmptyState
        illustration="error"
        title={t('shell.notFoundTitle')}
        description={t('shell.notFoundDescription')}
        action={
          <Button asChild variant="outline">
            <Link to="/">{t('shell.backHome')}</Link>
          </Button>
        }
      />
    </div>
  );
}

/** Tela de erro de rota: nunca deixa a pessoa diante de uma página em branco. */
export function ErrorPage() {
  const error = useRouteError();
  const notFound = isRouteErrorResponse(error) && error.status === 404;
  const home = (
    <Button asChild variant="outline">
      <Link to="/">{t('shell.backHome')}</Link>
    </Button>
  );
  return (
    <div className="flex min-h-screen items-center justify-center p-6">
      {notFound ? (
        <EmptyState
          illustration="error"
          title={t('shell.notFoundTitle')}
          description={t('shell.notFoundDescription')}
          action={home}
        />
      ) : (
        <div className="space-y-2">
          <ErrorState title={t('shell.errorTitle')} description={t('shell.errorDescription')} />
          <div className="flex justify-center">{home}</div>
        </div>
      )}
    </div>
  );
}
