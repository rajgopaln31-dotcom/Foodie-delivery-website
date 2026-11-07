export const errorMessage = (e: unknown, fallback = 'Something went wrong'): string =>
  e instanceof Error ? e.message : fallback;
