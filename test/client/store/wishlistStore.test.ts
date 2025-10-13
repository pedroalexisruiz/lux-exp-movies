import { Movie } from '@/api/domain/model';
import { useWishlist } from '@app/store/whishListStore';

it('adds and remove items', () => {
  const state = useWishlist.getState();
  state.clear();
  state.add({ id: 123, title: 'X', posterPath: null } as unknown as Movie);
  expect(useWishlist.getState().has(123)).toBe(true);
  state.remove(123);
  expect(useWishlist.getState().has(123)).toBe(false);
});
