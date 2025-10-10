import { useEffect } from 'react';
import { themeFromGenreId } from './theme';

export function useScopedTheme(ref: React.RefObject<HTMLElement | null>, genreId?: number) {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const vars = themeFromGenreId(genreId);
    const prev: Record<string, string> = {};

    Object.entries(vars).forEach(([k, v]) => {
      prev[k] = el.style.getPropertyValue(k);
      el.style.setProperty(k, v);
    });

    return () => {
      Object.entries(prev).forEach(([k, v]) => {
        if (v) el.style.setProperty(k, v);
        else el.style.removeProperty(k);
      });
    };
  }, [ref, genreId]);
}
