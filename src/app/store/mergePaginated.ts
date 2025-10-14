import { Paginated } from '@/api/domain/model/Pagination';
import { Movie } from '@domain/model';

export function mergePaginatedMovies(
  current: Paginated<Movie> | undefined,
  incoming: Paginated<Movie>,
): Paginated<Movie> {
  if (!current) return incoming;

  const seen = new Set(current.items.map((m) => m.id));
  const mergedItems = current.items.concat(incoming.items.filter((m) => !seen.has(m.id)));

  return {
    items: mergedItems,
    page: incoming.page,
    totalPages: incoming.totalPages,
    total: incoming.total,
    perPage: incoming.perPage,
  };
}
