import { useEffect, type ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router';
import { useAuth } from '@/core/auth/auth-store';
import { AtenaOrb } from '@/design/patterns/atena-orb';
import { t } from './i18n';

/** Guarda das rotas internas: restaura a sessão ao abrir e envia para a entrada se não houver. */
export function AuthGate({ children }: { children: ReactNode }) {
  const status = useAuth((state) => state.status);
  const restore = useAuth((state) => state.restore);
  const location = useLocation();
  useEffect(() => {
    if (status === 'unknown') void restore();
  }, [status, restore]);
  if (status === 'unknown') {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4" role="status">
        <AtenaOrb size={64} thinking />
        <p className="text-muted-foreground">{t('shell.loadingSession')}</p>
      </div>
    );
  }
  if (status === 'anonymous')
    return <Navigate to="/login" replace state={{ from: location.pathname + location.search }} />;
  return children;
}
