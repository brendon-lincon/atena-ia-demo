/**
 * Preferências de interface (tema, densidade, última aba). Só aqui se toca o localStorage;
 * dado de negócio nunca passa por este arquivo.
 */
const PREFIX = 'atena:';

export function readPreference(key: string): string | null {
  try {
    return localStorage.getItem(PREFIX + key);
  } catch {
    return null;
  }
}

export function writePreference(key: string, value: string): void {
  try {
    localStorage.setItem(PREFIX + key, value);
  } catch {
    // modo privado ou armazenamento bloqueado: a interface segue sem lembrar a escolha
  }
}
