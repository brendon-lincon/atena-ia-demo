import { create } from 'zustand';
import { endpoints, type SessionUser } from '@/core/api/endpoints';
import { session } from './session';

type Status = 'unknown' | 'anonymous' | 'authenticated';
interface AuthState {
  status: Status;
  user: SessionUser | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  restore: () => Promise<void>;
}

export const useAuth = create<AuthState>((set) => ({
  status: session.get() ? 'unknown' : 'anonymous',
  user: null,
  async login(email, password) {
    const { token, user } = await endpoints.login(email, password);
    session.set(token);
    set({ status: 'authenticated', user });
  },
  async logout() {
    try {
      await endpoints.logout();
    } finally {
      session.set(null);
      set({ status: 'anonymous', user: null });
    }
  },
  async restore() {
    if (!session.get()) {
      set({ status: 'anonymous', user: null });
      return;
    }
    try {
      set({ status: 'authenticated', user: await endpoints.me() });
    } catch {
      session.set(null);
      set({ status: 'anonymous', user: null });
    }
  },
}));

session.onExpire(() => useAuth.setState({ status: 'anonymous', user: null }));
