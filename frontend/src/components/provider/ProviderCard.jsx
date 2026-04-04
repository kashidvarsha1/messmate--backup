import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const ProviderCard = ({ provider, index }) => {
  const getStatusBadge = (status) => {
    switch (status) {
      case 'open':    return { cls: 'badge-status-open',    icon: '🟢', label: 'Open' };
      case 'closed':  return { cls: 'badge-status-closed',  icon: '🔴', label: 'Closed' };
      case 'limited': return { cls: 'badge-status-limited', icon: '🟡', label: 'Limited' };
      default: return { cls: 'inline-flex items-center gap-1 bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-xs font-semibold', icon: '⚪', label: 'Unknown' };
    }
  };

  const getHygieneStyle = (score) => {
    if (score >= 4.5) return { cls: 'text-green-700 bg-green-50 border-green-200', label: 'Excellent 🌟' };
    if (score >= 3.5) return { cls: 'text-yellow-700 bg-yellow-50 border-yellow-200', label: 'Good 👍' };
    if (score >= 2.5) return { cls: 'text-orange-700 bg-orange-50 border-orange-200', label: 'Average ⚠️' };
    return { cls: 'text-red-700 bg-red-50 border-red-200', label: 'Poor ❌' };
  };

  const status  = getStatusBadge(provider.status);
  const hygiene = provider.hygieneScore || 0;
  const hStyle  = getHygieneStyle(hygiene);

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.08 }}
      whileHover={{ y: -4 }}
      className="h-full"
    >
      <Link to={`/provider/${provider._id}`} className="block h-full">
        <div className="card p-5 h-full flex flex-col border border-gray-100">
          <div className="flex justify-between items-start mb-3">
            <div className="flex-1 mr-2">
              <h3 className="font-display font-bold text-gray-800 text-lg leading-tight line-clamp-1">{provider.name}</h3>
              <p className="text-xs text-gray-400 mt-0.5 flex items-center gap-1">
                <span>📍</span>{provider.address?.city}, {provider.address?.state}
              </p>
            </div>
            <span className={status.cls}>{status.icon} {status.label}</span>
          </div>

          <div className={`flex items-center gap-3 p-3 rounded-xl mb-3 border ${hStyle.cls}`}>
            <div className="text-center min-w-[48px]">
              <div className="text-2xl font-display font-bold leading-none">{hygiene.toFixed(1)}</div>
              <div className="text-xs opacity-60 mt-0.5">/ 5.0</div>
            </div>
            <div className="flex-1">
              <div className="text-xs font-bold uppercase tracking-wider opacity-60 mb-0.5">Hygiene Score</div>
              <div className="text-sm font-semibold">{hStyle.label}</div>
              <div className="flex gap-0.5 mt-1.5">
                {[1,2,3,4,5].map(s => (
                  <div key={s} className={`h-1.5 flex-1 rounded-full ${s <= Math.round(hygiene) ? 'bg-current' : 'bg-current opacity-15'}`} />
                ))}
              </div>
            </div>
          </div>

          <p className="text-gray-500 text-sm line-clamp-2 mb-4 flex-grow leading-relaxed">
            {provider.description || 'Ghar ka swadisht khana — fresh aur hygienic.'}
          </p>

          <div className="flex items-center justify-between pt-3 border-t border-gray-100">
            <div className="flex items-center gap-1">
              <span className="text-yellow-400">⭐</span>
              <span className="font-semibold text-sm text-gray-700">{provider.averageRating?.toFixed(1) || '—'}</span>
              <span className="text-gray-400 text-xs">({provider.totalReviews || 0})</span>
            </div>
            <div>
              <span className="font-display font-bold text-spice-500 text-xl">₹{provider.pricePerMeal}</span>
              <span className="text-xs text-gray-400">/meal</span>
            </div>
          </div>

          <div className="flex gap-1.5 mt-3 flex-wrap">
            {provider.isVegetarian && (
              <span className="text-xs bg-green-50 text-green-700 px-2 py-0.5 rounded-full border border-green-100 font-medium">🥬 Pure Veg</span>
            )}
            {provider.mealTypes?.slice(0, 2).map(type => (
              <span key={type} className="text-xs bg-amber-50 text-amber-700 px-2 py-0.5 rounded-full border border-amber-100 font-medium capitalize">{type}</span>
            ))}
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

export default ProviderCard;