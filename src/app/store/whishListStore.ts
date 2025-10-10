import { create } from 'zustand';
import { persist, createJSONStorage, devtools } from 'zustand/middleware';
import { Movie } from '@domain/model';

type WishlistState = {
  items: Record<number, Movie>;
  add: (item: Movie) => void;
  remove: (id: number) => void;
  has: (id: number) => boolean;
  clear: () => void;
};

const memoryStorage = () => {
  const store: Record<string, string> = {};
  return {
    getItem: (name: string) => store[name] ?? null,
    setItem: (name: string, value: string) => {
      store[name] = value;
    },
    removeItem: (name: string) => {
      delete store[name];
    },
  };
};

export const useWishlist = create<WishlistState>()(
  devtools(
    persist(
      (set, get) => ({
        items: {},
        add: (item) => set((state) => ({ items: { ...state.items, [item.id]: item } })),
        remove: (id) =>
          set((state) => {
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const { [id]: _, ...rest } = state.items;
            return { items: rest };
          }),
        has: (id) => !!get().items[id],
        clear: () => set({ items: {} }),
      }),
      {
        name: 'wishlist:v1',
        storage: createJSONStorage(() =>
          typeof window !== 'undefined' ? window.localStorage : memoryStorage(),
        ),
        partialize: (s) => ({ items: s.items }),
        version: 1,
        migrate: (persisted) => persisted,
      },
    ),
    { name: 'WishlistStore', enabled: !import.meta.env.SSR && import.meta.env.DEV },
  ),
);
