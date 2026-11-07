import { useMemo, useState, type FormEvent } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import Img from '../components/Img';
import RestaurantCard from '../components/RestaurantCard';
import { CardSkeletons, ErrorState } from '../components/Skeleton';
import { CATEGORIES } from '../data/mockData';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { fetchCatalog } from '../store/restaurantSlice';
import { formatINR } from '../utils/pricing';

type Sort = 'relevance' | 'rating' | 'time';

export default function ListingPage() {
  const dispatch = useAppDispatch();
  const [params, setParams] = useSearchParams();
  const { restaurants, foods, status, error } = useAppSelector((s) => s.restaurants);
  const favIds = useAppSelector((s) => s.favourites.ids);

  const q = params.get('q') ?? '';
  const cat = params.get('cat') ?? 'All';
  const [input, setInput] = useState(q);
  const [sort, setSort] = useState<Sort>('relevance');
  const [topRated, setTopRated] = useState(false);
  const [fast, setFast] = useState(false);
  const [offers, setOffers] = useState(false);
  const [onlyFav, setOnlyFav] = useState(false);

  const setParam = (key: string, value: string) => {
    const next = new URLSearchParams(params);
    if (value && value !== 'All') next.set(key, value);
    else next.delete(key);
    setParams(next, { replace: true });
  };

  const term = q.trim().toLowerCase();

  const matchedFoods = useMemo(
    () => (term ? foods.filter((f) => (f.name.toLowerCase().includes(term) || f.category.toLowerCase().includes(term)) && (cat === 'All' || f.category === cat)) : []),
    [foods, term, cat],
  );

  const results = useMemo(() => {
    let list = restaurants.filter((r) => {
      if (cat !== 'All' && !r.categories.includes(cat)) return false;
      if (!term) return true;
      return (
        r.name.toLowerCase().includes(term) ||
        r.cuisines.some((c) => c.toLowerCase().includes(term)) ||
        foods.some((f) => f.restaurantId === r.id && (f.name.toLowerCase().includes(term) || f.category.toLowerCase().includes(term)))
      );
    });
    if (topRated) list = list.filter((r) => r.rating >= 4.3);
    if (fast) list = list.filter((r) => r.deliveryTime <= 30);
    if (offers) list = list.filter((r) => r.offer !== '');
    if (onlyFav) list = list.filter((r) => favIds.includes(r.id));
    if (sort === 'rating') list = [...list].sort((a, b) => b.rating - a.rating);
    if (sort === 'time') list = [...list].sort((a, b) => a.deliveryTime - b.deliveryTime);
    return list;
  }, [restaurants, foods, cat, term, topRated, fast, offers, onlyFav, favIds, sort]);

  const submit = (e: FormEvent) => { e.preventDefault(); setParam('q', input.trim()); };
  const reset = () => { setParams({}, { replace: true }); setInput(''); setTopRated(false); setFast(false); setOffers(false); setOnlyFav(false); setSort('relevance'); };
  const loading = status === 'idle' || status === 'loading';
  const nameOf = (id: string) => restaurants.find((r) => r.id === id)?.name ?? '';

  return (
    <div className="container page">
      <h1 className="page-title">Restaurants near you</h1>

      <form className="search-bar" onSubmit={submit} role="search">
        <input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Search restaurants or food" aria-label="Search restaurants or food" />
        <button className="btn btn-primary" type="submit">Search</button>
        {q && <button className="btn btn-outline" type="button" onClick={() => { setInput(''); setParam('q', ''); }}>Clear</button>}
      </form>

      <div className="chips" role="tablist" aria-label="Food categories">
        {['All', ...CATEGORIES.map((c) => c.name)].map((c) => (
          <button key={c} role="tab" aria-selected={cat === c} className={`chip ${cat === c ? 'active' : ''}`} onClick={() => setParam('cat', c)}>
            {CATEGORIES.find((x) => x.name === c)?.emoji ?? '🍽️'} {c}
          </button>
        ))}
      </div>

      <div className="toolbar">
        <div className="chips">
          <button className={`chip ${topRated ? 'active' : ''}`} aria-pressed={topRated} onClick={() => setTopRated((v) => !v)}>★ 4.3+ rating</button>
          <button className={`chip ${fast ? 'active' : ''}`} aria-pressed={fast} onClick={() => setFast((v) => !v)}>⚡ Under 30 min</button>
          <button className={`chip ${offers ? 'active' : ''}`} aria-pressed={offers} onClick={() => setOffers((v) => !v)}>🏷️ Offers</button>
          <button className={`chip ${onlyFav ? 'active' : ''}`} aria-pressed={onlyFav} onClick={() => setOnlyFav((v) => !v)}>♥ Favourites</button>
        </div>
        <label className="sort">
          Sort by
          <select value={sort} onChange={(e) => setSort(e.target.value as Sort)}>
            <option value="relevance">Relevance</option>
            <option value="rating">Rating: high to low</option>
            <option value="time">Delivery time: fastest</option>
          </select>
        </label>
      </div>

      {error && status === 'failed' ? (
        <ErrorState message={error} onRetry={() => void dispatch(fetchCatalog())} />
      ) : loading ? (
        <CardSkeletons count={8} />
      ) : (
        <>
          {matchedFoods.length > 0 && (
            <section className="section">
              <h2>Dishes matching “{q}”</h2>
              <div className="dish-row">
                {matchedFoods.slice(0, 8).map((f) => (
                  <Link key={f.id} to={`/restaurants/${f.restaurantId}?food=${f.id}`} className="dish-chip">
                    <Img src={f.image} alt={f.name} emoji={f.emoji} />
                    <div>
                      <strong>{f.name}</strong>
                      <span className="muted small">{nameOf(f.restaurantId)} • {formatINR(f.price)}</span>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}

          <p className="muted" aria-live="polite">{results.length} restaurant{results.length === 1 ? '' : 's'} found</p>
          {results.length === 0 ? (
            <div className="empty-state">
              <div className="empty-emoji">🔍</div>
              <h3>No restaurants match your search</h3>
              <p className="muted">Try a different keyword, category or remove some filters.</p>
              <button className="btn btn-primary" onClick={reset}>Reset search &amp; filters</button>
            </div>
          ) : (
            <div className="grid">{results.map((r) => <RestaurantCard key={r.id} restaurant={r} />)}</div>
          )}
        </>
      )}
    </div>
  );
}
