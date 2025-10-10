export const getImagePath = (
  path?: string | null,
  size: 'w342' | 'w500' | 'w780' | 'w1280' = 'w342',
) => (path ? `https://image.tmdb.org/t/p/${size}${path}` : undefined);
