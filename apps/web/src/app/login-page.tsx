import { zodResolver } from '@hookform/resolvers/zod';
import { motion, useReducedMotion } from 'motion/react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Navigate, useLocation, useNavigate } from 'react-router';
import { z } from 'zod';
import { ApiError } from '@/core/api/client';
import { endpoints } from '@/core/api/endpoints';
import { useAuth } from '@/core/auth/auth-store';
import { BrandLockup } from '@/design/brand/logo';
import { duration, easing } from '@/design/motion.generated';
import { AtenaOrb } from '@/design/patterns/atena-orb';
import { ThemeToggle } from '@/design/patterns/theme-toggle';
import { Button } from '@/design/ui/button';
import { Input, Label } from '@/design/ui/form';
import { t } from './i18n';

const schema = z.object({
  email: z.email(t('login.emailInvalid')),
  password: z.string().min(1, t('login.passwordRequired')),
});
type Fields = z.infer<typeof schema>;
const TYPE_STEP_MS = 28;

/** Entrada: metade com a marca e um fundo de malha de planta em movimento lento; metade com o formulário. */
export function LoginPage() {
  const status = useAuth((state) => state.status);
  const login = useAuth((state) => state.login);
  const navigate = useNavigate();
  const location = useLocation() as { state: { from?: string } | null };
  const reduced = useReducedMotion();
  const [error, setError] = useState<string | null>(null);
  const [demoLoading, setDemoLoading] = useState(false);
  const form = useForm<Fields>({
    resolver: zodResolver(schema),
    defaultValues: { email: '', password: '' },
  });
  const target = location.state?.from ?? '/';

  if (status === 'authenticated') return <Navigate to={target} replace />;

  const submit = async (values: Fields) => {
    setError(null);
    try {
      await login(values.email, values.password);
      void navigate(target, { replace: true });
    } catch (e) {
      setError(
        e instanceof ApiError && e.status === 0 ? t('login.unavailable') : t('login.invalid'),
      );
    }
  };

  const enterDemo = async () => {
    setDemoLoading(true);
    setError(null);
    try {
      const credentials = await endpoints.demoCredentials();
      // Preenche os campos letra a letra (a pessoa vê o que está acontecendo) e entra.
      for (const [field, text] of [
        ['email', credentials.email],
        ['password', credentials.password],
      ] as const) {
        for (let i = 1; i <= text.length; i++) {
          form.setValue(field, text.slice(0, i));
          if (!reduced) await new Promise((resolve) => window.setTimeout(resolve, TYPE_STEP_MS));
        }
      }
      await submit(credentials);
    } catch {
      setError(t('login.unavailable'));
    } finally {
      setDemoLoading(false);
    }
  };

  return (
    <div className="grid min-h-screen md:grid-cols-2">
      <aside className="brand-deep-gradient relative hidden overflow-hidden text-sidebar-foreground md:flex md:flex-col md:justify-between md:p-12">
        <div className="login-grid absolute inset-0" aria-hidden />
        <BrandLockup className="relative w-64 text-sidebar-foreground" />
        <div className="relative space-y-6">
          <motion.div
            initial={reduced ? false : { opacity: 0, scale: 0.6, filter: 'blur(12px)' }}
            animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
            transition={{ duration: duration.data * 1.6, ease: easing }}
          >
            <AtenaOrb size={112} />
          </motion.div>
          <h1 className="max-w-md text-4xl leading-tight font-semibold text-balance">
            {t('login.headline')}
          </h1>
          <p className="max-w-md text-lg text-sidebar-muted">{t('login.subtitle')}</p>
        </div>
        <span />
      </aside>
      <main className="relative flex items-center justify-center p-6 sm:p-12">
        <div className="absolute top-4 right-4">
          <ThemeToggle />
        </div>
        <motion.div
          initial={reduced ? false : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: duration.emphasis, ease: easing, delay: 0.1 }}
          className="w-full max-w-sm space-y-6"
        >
          <BrandLockup className="mx-auto mb-2 w-52 text-foreground md:hidden" />
          <div className="space-y-1">
            <h2 className="text-2xl font-semibold tracking-tight">{t('login.welcome')}</h2>
            <p className="text-muted-foreground">{t('login.instruction')}</p>
          </div>
          <form
            onSubmit={(event) => void form.handleSubmit(submit)(event)}
            className="space-y-4"
            noValidate
          >
            <div className="space-y-1.5">
              <Label htmlFor="email">{t('login.email')}</Label>
              <Input
                id="email"
                type="email"
                autoComplete="username"
                aria-invalid={Boolean(form.formState.errors.email)}
                {...form.register('email')}
              />
              {form.formState.errors.email && (
                <p className="text-sm text-danger-text">{form.formState.errors.email.message}</p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="password">{t('login.password')}</Label>
              <Input
                id="password"
                type="password"
                autoComplete="current-password"
                aria-invalid={Boolean(form.formState.errors.password)}
                {...form.register('password')}
              />
              {form.formState.errors.password && (
                <p className="text-sm text-danger-text">{form.formState.errors.password.message}</p>
              )}
            </div>
            {error && (
              <p
                role="alert"
                className="rounded-md bg-danger-soft px-3 py-2 text-sm text-danger-text"
              >
                {error}
              </p>
            )}
            <Button
              type="submit"
              className="w-full"
              disabled={form.formState.isSubmitting || demoLoading}
            >
              {form.formState.isSubmitting ? t('login.submitting') : t('login.submit')}
            </Button>
          </form>
          <div className="space-y-2 border-t border-border pt-5">
            <Button
              type="button"
              variant="atena"
              className="w-full"
              onClick={() => void enterDemo()}
              disabled={demoLoading || form.formState.isSubmitting}
            >
              {t('login.demo')}
            </Button>
            <p className="text-center text-sm text-muted-foreground">{t('login.demoHint')}</p>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
