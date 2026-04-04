import { useState, useEffect } from 'react';
import axios from '../../api/axios';

const formatTypeLabel = (type = '') =>
  type
    .split('_')
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');

const HygieneProofList = ({ providerId, proofs: externalProofs = null, title = 'Uploaded Proofs' }) => {
  const [proofs, setProofs] = useState([]);
  const [loading, setLoading] = useState(true);

  const getStatusMeta = (status = 'pending') => {
    switch (status) {
      case 'approved':
        return { label: 'Approved', cls: 'bg-green-100 text-green-700 border-green-200' };
      case 'rejected':
        return { label: 'Rejected', cls: 'bg-red-100 text-red-700 border-red-200' };
      default:
        return { label: 'Pending', cls: 'bg-amber-100 text-amber-700 border-amber-200' };
    }
  };

  useEffect(() => {
    if (Array.isArray(externalProofs)) {
      setProofs(externalProofs);
      setLoading(false);
    } else if (providerId) {
      fetchProofs();
    }
  }, [providerId, externalProofs]);

  const fetchProofs = async () => {
    try {
      const response = await axios.get(`/hygiene/mess/${providerId}`);
      setProofs(response.data.data || []);
    } catch (error) {
      console.error('Error fetching proofs:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="text-center py-4">Loading...</div>;
  
  if (proofs.length === 0) {
    return <p className="text-gray-500 text-center py-4">No hygiene proofs uploaded yet</p>;
  }

  return (
    <div className="space-y-3 mt-4">
      <h4 className="font-medium text-gray-700">{title} ({proofs.length})</h4>
      {proofs.map((proof) => (
        <div
          key={proof._id || proof.imageUrl || proof.createdAt}
          className="border rounded-lg p-3 flex items-center gap-3 bg-white"
        >
          {(proof.imageUrl || proof.mediaUrl) ? (
            <img
              src={proof.imageUrl || proof.mediaUrl}
              alt="Hygiene proof"
              className="w-16 h-16 object-cover rounded-lg"
            />
          ) : (
            <div className="w-16 h-16 rounded-lg bg-amber-100 flex items-center justify-center text-xl">
              📷
            </div>
          )}
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-sm font-medium">{formatTypeLabel(proof.type)}</p>
              <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-semibold ${getStatusMeta(proof.status).cls}`}>
                {getStatusMeta(proof.status).label}
              </span>
            </div>
            <p className="mt-1 text-xs text-gray-400">
              Uploaded on {new Date(proof.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default HygieneProofList;
