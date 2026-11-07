import { toggleFavourite } from '../store/favouriteSlice';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { useToast } from './Toast';

export default function FavouriteButton({ restaurantId, name }: { restaurantId: string; name: string }) {
  const dispatch = useAppDispatch();
  const notify = useToast();
  const active = useAppSelector((s) => s.favourites.ids.includes(restaurantId));

  return (
    <button
      type="button"
      className={`fav-btn ${active ? 'active' : ''}`}
      aria-pressed={active}
      aria-label={active ? `Remove ${name} from favourites` : `Add ${name} to favourites`}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        dispatch(toggleFavourite(restaurantId));
        notify(active ? `${name} removed from favourites` : `${name} added to favourites`, active ? 'info' : 'success');
      }}
    >
      {active ? '♥' : '♡'}
    </button>
  );
}
