import { z } from 'zod';
import { request } from './client';

export const userSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string(),
  role: z.string(),
  roleLabel: z.string(),
  initials: z.string(),
});
export type SessionUser = z.infer<typeof userSchema>;

export const moduleStateSchema = z.object({
  id: z.string(),
  enabled: z.boolean(),
  actions: z.array(z.string()),
});
export type ModuleState = z.infer<typeof moduleStateSchema>;

export const jobSchema = z.object({
  id: z.string(),
  type: z.string(),
  status: z.enum(['queued', 'running', 'done', 'failed']),
  progress: z.number(),
  stageIndex: z.number(),
  stages: z.array(z.object({ label: z.string(), status: z.enum(['done', 'running', 'pending']) })),
  result: z.record(z.string(), z.unknown()).nullable(),
});
export type Job = z.infer<typeof jobSchema>;

export const atenaActionSchema = z
  .object({ type: z.string(), label: z.string().optional() })
  .catchall(z.unknown());
export const atenaAnswerSchema = z.object({
  reply: z.string(),
  actions: z.array(atenaActionSchema),
  sources: z.array(z.object({ label: z.string() }).catchall(z.unknown())),
});
export type AtenaAction = z.infer<typeof atenaActionSchema>;
export type AtenaAnswer = z.infer<typeof atenaAnswerSchema>;

export const searchGroupSchema = z.object({
  type: z.string(),
  items: z.array(z.object({ id: z.string(), title: z.string(), subtitle: z.string() })),
});
export type SearchGroup = z.infer<typeof searchGroupSchema>;

/** Rotas que não são coleções. */
export const endpoints = {
  async login(email: string, password: string) {
    const { data } = await request<{ data: { token: string; user: unknown } }>(
      'POST',
      '/auth/login',
      { body: { email, password }, auth: false },
    );
    return { token: data.token, user: userSchema.parse(data.user) };
  },
  async demoCredentials() {
    const { data } = await request<{ data: { email: string; password: string } }>(
      'GET',
      '/demo/credentials',
      { auth: false },
    );
    return data;
  },
  async me() {
    return userSchema.parse((await request<{ data: unknown }>('GET', '/auth/me')).data);
  },
  async logout() {
    await request('POST', '/auth/logout');
  },
  async modules() {
    return z
      .array(moduleStateSchema)
      .parse((await request<{ data: unknown }>('GET', '/modules')).data);
  },
  async startJob(type: string) {
    return jobSchema.parse(
      (await request<{ data: unknown }>('POST', '/jobs', { body: { type } })).data,
    );
  },
  async job(id: string) {
    return jobSchema.parse((await request<{ data: unknown }>('GET', `/jobs/${id}`)).data);
  },
  async atena(text: string, context?: unknown) {
    return atenaAnswerSchema.parse(
      (await request<{ data: unknown }>('POST', '/atena/command', { body: { text, context } }))
        .data,
    );
  },
  async search(q: string) {
    return z.array(searchGroupSchema).parse(
      (
        await request<{ data: unknown }>('GET', '/search', {
          search: `?q=${encodeURIComponent(q)}`,
        })
      ).data,
    );
  },
  async reset() {
    await request('POST', '/demo/reset');
  },
};
