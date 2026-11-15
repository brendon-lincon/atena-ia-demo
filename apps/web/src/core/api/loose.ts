import { z } from 'zod';

/** Registro sem esquema próprio (operações genéricas de casca, como criar uma nota ou uma tarefa). */
export const looseRecord = z.object({ id: z.string() }).catchall(z.unknown());
export type LooseRecord = z.infer<typeof looseRecord>;
