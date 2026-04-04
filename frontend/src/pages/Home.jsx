import { useState, useEffect } from 'react';
import axios from '../api/axios';
import ProviderCard from '../components/provider/ProviderCard';
import { motion } from 'framer-motion';

const Home = () => {
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [filters, setFilters] = useState({
    cuisine: 'all',
    mealType: 'all',
    sortBy: 'newest',
    minPrice: '',
    maxPrice: '',
    vegetarian: false,
    status: 'all',
  });

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search.trim());
    }, 300);

    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    fetchProviders();
  }, [debouncedSearch, filters]);

  const fetchProviders = async () => {
    try {
      setLoading(true);
      setError('');

      const params = {
        sortBy: filters.sortBy,
      };

      if (debouncedSearch) params.search = debouncedSearch;
      if (filters.cuisine !== 'all') params.cuisine = filters.cuisine;
      if (filters.mealType !== 'all') params.mealType = filters.mealType;
      if (filters.minPrice) params.minPrice = filters.minPrice;
      if (filters.maxPrice) params.maxPrice = filters.maxPrice;
      if (filters.vegetarian) params.vegetarian = 'true';
      if (filters.status !== 'all') params.status = filters.status;

      const res = await axios.get('/providers', { params });
      setProviders(res.data.data || []);
    } catch (err) {
      console.error('Failed to fetch providers:', err);
      setError(err.response?.data?.message || 'Providers load nahi ho paye.');
      setProviders([]);
    } finally {
      setLoading(false);
    }
  };

  const updateFilter = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setSearch('');
    setFilters({
      cuisine: 'all',
      mealType: 'all',
      sortBy: 'newest',
      minPrice: '',
      maxPrice: '',
      vegetarian: false,
      status: 'all',
    });
  };

  const activeFilterCount = [
    debouncedSearch,
    filters.cuisine !== 'all',
    filters.mealType !== 'all',
    filters.minPrice,
    filters.maxPrice,
    filters.vegetarian,
    filters.status !== 'all',
    filters.sortBy !== 'newest',
  ].filter(Boolean).length;

  return (
    <div className="min-h-screen">
      <div className="border-b border-amber-200 bg-gradient-to-br from-amber-50 via-orange-50 to-amber-100">
        <div className="mx-auto max-w-6xl px-4 py-14 md:py-20">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mx-auto max-w-2xl text-center"
          >
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-amber-200 bg-white px-4 py-2 shadow-sm">
              <span className="text-lg">🏠</span>
              <span className="text-sm font-semibold text-spice-600">India ka Trusted Food Network</span>
            </div>

            <h1 className="mb-4 font-display text-4xl font-bold leading-tight text-gray-800 md:text-5xl">
              Ghar jaisa khana, <span className="text-spice-500">ghar jaisa trust</span>
            </h1>

            <p className="mb-8 text-lg leading-relaxed text-gray-500">
              Real hygiene scores. Real reviews. Real ghar ka khana. Mess, tiffin aur home kitchen sab ek jagah.
            </p>

            <div className="relative mx-auto max-w-lg">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xl">🔍</span>
              <input
                type="text"
                placeholder="City ya provider name dhundho..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-2xl border border-amber-200 bg-white py-4 pl-12 pr-4 text-gray-700 shadow-md placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-spice-300"
              />
            </div>
          </motion.div>
        </div>
      </div>

      <div className="border-b border-gray-100 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-4">
          <div className="flex flex-wrap justify-center gap-6 text-sm text-gray-500">
            <div className="flex items-center gap-2">
              <span className="text-lg text-green-500">✅</span>
              <span>Verified Providers</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-lg text-yellow-500">⭐</span>
              <span>Real Hygiene Scores</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-lg text-blue-500">🛡️</span>
              <span>Anti-Fake Reports</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-lg text-spice-500">📸</span>
              <span>Real Kitchen Photos</span>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 py-8">
        <div className="mb-6 rounded-3xl border border-amber-100 bg-white p-5 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="section-title">
                {providers.length} Provider{providers.length !== 1 ? 's' : ''} Found
              </h2>
              <p className="mt-1 text-sm text-gray-400">
                Search, filter aur sort karke best mess ya home kitchen choose karo.
              </p>
            </div>
            <button
              onClick={clearFilters}
              className="rounded-xl border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-600 transition hover:border-orange-300 hover:text-orange-500"
            >
              Reset Filters {activeFilterCount > 0 ? `(${activeFilterCount})` : ''}
            </button>
          </div>

          <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-6">
            <select
              value={filters.cuisine}
              onChange={(e) => updateFilter('cuisine', e.target.value)}
              className="input-field py-2.5"
            >
              <option value="all">All cuisines</option>
              <option value="multi-cuisine">Multi-cuisine</option>
              <option value="north-indian">North Indian</option>
              <option value="south-indian">South Indian</option>
              <option value="homestyle">Homestyle</option>
            </select>

            <select
              value={filters.mealType}
              onChange={(e) => updateFilter('mealType', e.target.value)}
              className="input-field py-2.5"
            >
              <option value="all">All meal types</option>
              <option value="breakfast">Breakfast</option>
              <option value="lunch">Lunch</option>
              <option value="dinner">Dinner</option>
              <option value="tiffin">Tiffin</option>
            </select>

            <input
              type="number"
              min="0"
              placeholder="Min price"
              value={filters.minPrice}
              onChange={(e) => updateFilter('minPrice', e.target.value)}
              className="input-field py-2.5"
            />

            <input
              type="number"
              min="0"
              placeholder="Max price"
              value={filters.maxPrice}
              onChange={(e) => updateFilter('maxPrice', e.target.value)}
              className="input-field py-2.5"
            />

            <select
              value={filters.sortBy}
              onChange={(e) => updateFilter('sortBy', e.target.value)}
              className="input-field py-2.5"
            >
              <option value="newest">Newest first</option>
              <option value="rating">Top rated</option>
              <option value="hygiene">Best hygiene</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
            </select>

            <select
              value={filters.status}
              onChange={(e) => updateFilter('status', e.target.value)}
              className="input-field py-2.5"
            >
              <option value="all">Any status</option>
              <option value="open">Open now</option>
              <option value="limited">Limited seats</option>
              <option value="closed">Closed</option>
            </select>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <button
              onClick={() => updateFilter('vegetarian', !filters.vegetarian)}
              className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${
                filters.vegetarian
                  ? 'border-green-200 bg-green-100 text-green-700'
                  : 'border-gray-200 bg-gray-50 text-gray-500'
              }`}
            >
              🥬 Veg Only
            </button>
            <button
              onClick={() => updateFilter('status', filters.status === 'open' ? 'all' : 'open')}
              className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${
                filters.status === 'open'
                  ? 'border-emerald-200 bg-emerald-100 text-emerald-700'
                  : 'border-gray-200 bg-gray-50 text-gray-500'
              }`}
            >
              🟢 Open Now
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {loading ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="animate-pulse rounded-2xl bg-white p-5 shadow-card">
                <div className="mb-3 h-5 w-3/4 rounded bg-gray-200"></div>
                <div className="mb-2 h-4 w-full rounded bg-gray-100"></div>
                <div className="mb-4 h-4 w-2/3 rounded bg-gray-100"></div>
                <div className="flex justify-between">
                  <div className="h-6 w-20 rounded bg-gray-200"></div>
                  <div className="h-6 w-16 rounded bg-gray-200"></div>
                </div>
              </div>
            ))}
          </div>
        ) : providers.length === 0 ? (
          <div className="py-20 text-center">
            <div className="mb-4 text-6xl">🍽️</div>
            <h3 className="mb-2 text-xl font-bold text-gray-600">Koi provider nahi mila</h3>
            <p className="text-gray-400">Search change karo ya filters hatao</p>
            <button onClick={clearFilters} className="btn-warm mt-4">
              Sab Dekho
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {providers.map((provider, index) => (
              <ProviderCard key={provider._id} provider={provider} index={index} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;
