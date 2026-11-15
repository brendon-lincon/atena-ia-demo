/** Iniciais (até duas letras) de um título, ignorando traços e símbolos. */
export function initialsOf(title: string): string {
  return title
    .split(/\s+/)
    .filter((word) => /^\p{L}/u.test(word))
    .map((word) => word.charAt(0))
    .slice(0, 2)
    .join('')
    .toUpperCase();
}
