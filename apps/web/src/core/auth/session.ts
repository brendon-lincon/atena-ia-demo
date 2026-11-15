import { readPreference, writePreference } from '@/core/preferences/storage';

/**
 * Token da sessão de demonstração. Na versão definitiva a sessão vira cookie httpOnly;
 * aqui o token só precisa sobreviver a uma atualização da página.
 */
let token: string | null = readPreference('session');
let onExpire: (() => void) | undefined;

export const session = {
  get: (): string | null => token,
  set(next: string | null): void {
    token = next;
    writePreference('session', next ?? '');
  },
  onExpire(handler: () => void): void {
    onExpire = handler;
  },
  expire(): void {
    session.set(null);
    onExpire?.();
  },
};
