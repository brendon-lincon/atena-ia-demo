import { z } from 'zod';
import type { AtenaAction } from '@/core/api/endpoints';
import { looseRecord } from '@/core/api/loose';
import { defineResource } from '@/core/api/resource';
import { registry } from '@/core/module-registry/registry';

const tasks = defineResource('tasks', looseRecord);
const stringField = z.string();

/**
 * Executa uma ação sugerida (pela Atena ou pelo Olhar de Atena): navegar, abrir um registro ou criar uma tarefa.
 * Devolve `true` quando a ação criou algo (para o chamador avisar a pessoa).
 */
export async function runAtenaAction(
  action: AtenaAction,
  navigate: (to: string) => void,
): Promise<boolean> {
  if (action.type === 'navigate' && typeof action.to === 'string') {
    navigate(action.to);
    return false;
  }
  if (action.type === 'open-record') {
    const type = stringField.safeParse(action.recordType);
    const id = stringField.safeParse(action.recordId);
    if (type.success && id.success)
      navigate(registry.recordPath(type.data, id.data) ?? `/${type.data}`);
    return false;
  }
  if (action.type === 'create-task') {
    await tasks.create({
      title: action.title,
      obraId: action.obraId ?? null,
      status: 'todo',
      priority: 'high',
      origin: 'atena',
    });
    navigate('/tasks');
    return true;
  }
  return false;
}
