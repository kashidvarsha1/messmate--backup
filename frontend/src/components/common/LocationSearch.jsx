import { getProviderByPublicId, providerIdMap } from '../utils/providerApi';
import { useState } from 'react';

const LocationSearch = ({ onLocationFound }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const getCurrentLocation = () => {
    setLoading(true);
    setError('');

    // Check if geolocation is supported
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        onLocationFound({
          lat: position.coords.latitude,
          lng: position.coords.longitude
        });
        setLoading(false);
      },
      () => {
        setError('Unable to get your location. Please enable location access.');
        setLoading(false);
      }
    );
  };

  return (
    <div className="mb-6">
      <button
        onClick={getCurrentLocation}
        disabled={loading}
        className="btn-secondary flex items-center gap-2"
      >
        <span>📍</span>
        {loading ? 'Getting location...' : 'Find Nearby Messes'}
      </button>
      {error && <p className="mt-2 text-sm text-red-500">{error}</p>}
    </div>
  );
};

export default LocationSearch;