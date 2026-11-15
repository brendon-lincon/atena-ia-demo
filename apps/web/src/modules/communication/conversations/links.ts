import { defineResource } from '@/core/api/resource';
import { looseRecord } from '@/core/api/loose';

/** Registros que uma mensagem pode virar ("transformar em"): o dono de cada dado segue sendo o seu módulo. */
export const tasksApi = defineResource('tasks', looseRecord);
export const notesApi = defineResource('notes', looseRecord);
export const diaryApi = defineResource('diary-entries', looseRecord);
export const advancesApi = defineResource('advances', looseRecord);
