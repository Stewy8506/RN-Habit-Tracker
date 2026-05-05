export function compactTitle(value: string) {
  return value.trim().replace(/\s+/g, ' ');
}

export function pluralize(count: number, singular: string, plural = `${singular}s`) {
  return count === 1 ? singular : plural;
}
