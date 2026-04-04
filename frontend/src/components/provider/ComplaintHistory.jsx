import { useState, useEffect } from 'react';
import axios from '../../api/axios';
import { FaExclamationTriangle, FaCheckCircle, FaClock, FaShieldAlt } from 'react-icons/fa';

const ComplaintHistory = ({ providerId }) => {
  const [complaints, setComplaints] = useState([]);
  const [summary, setSummary] = useState({ total: 0, verified: 0, underReview: 0 });
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(null);

  useEffect(() => { fetchComplaints(); }, [providerId]);

  const fetchComplaints = async () => {
    try {
      const response = await axios.get(`/reports/provider/${providerId}/public`);
      setComplaints(response.data.data || []);
      setSummary({
        total: response.data.total || 0,
        verified: response.data.verified || 0,
        underReview: response.data.underReview || 0,
      });
    } catch (error) {
      console.error('Error fetching complaints:', error);
      setComplaints([]);
    } finally {
      setLoading(false);
    }
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-300';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'verified': return <FaCheckCircle className="text-green-500" />;
      case 'investigating': return <FaClock className="text-yellow-500" />;
      default: return <FaExclamationTriangle className="text-red-500" />;
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'verified': return 'Verified';
      case 'investigating': return 'Under review';
      default: return 'Reported';
    }
  };

  if (loading) return (
    <div className="bg-white rounded-2xl shadow-md p-6 mt-6">
      <div className="animate-pulse h-6 bg-gray-200 rounded w-48 mb-4"></div>
      <div className="space-y-3">
        {[1,2].map(i => <div key={i} className="animate-pulse h-16 bg-gray-100 rounded"></div>)}
      </div>
    </div>
  );

  return (
    <div className="bg-white rounded-2xl shadow-md p-6 mt-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold flex items-center gap-2">
          <FaExclamationTriangle className="text-orange-500" />
          Complaint History
        </h3>
        <div className="flex flex-wrap gap-3 text-sm">
          <span className="bg-gray-100 px-3 py-1 rounded-full">Total: <strong>{summary.total}</strong></span>
          <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full">Verified: <strong>{summary.verified}</strong></span>
          {summary.underReview > 0 && (
            <span className="bg-amber-100 text-amber-800 px-3 py-1 rounded-full">
              Under Review: <strong>{summary.underReview}</strong>
            </span>
          )}
        </div>
      </div>
      {complaints.length === 0 ? (
        <div className="text-center py-6">
          <FaShieldAlt className="text-green-500 text-4xl mx-auto mb-2" />
          <p className="text-green-700 font-medium">No reviewed complaints visible yet.</p>
          <p className="text-gray-500 text-sm mt-1">Reports appear here after admin moderation.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {complaints.map(complaint => (
            <div key={complaint._id} className="border-l-4 border-orange-300 bg-orange-50 p-3 rounded-lg">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-xs px-2 py-0.5 rounded-full border ${getSeverityColor(complaint.severity)}`}>
                      {complaint.severity?.toUpperCase()}
                    </span>
                    <span className="text-xs text-gray-400 capitalize">{complaint.category}</span>
                    <span className="text-xs text-gray-400">{new Date(complaint.createdAt).toLocaleDateString('en-IN')}</span>
                  </div>
                  <p className="font-medium text-gray-800 text-sm">{complaint.title}</p>
                  {complaint.evidence?.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {complaint.evidence
                        .filter((item) => item.type === 'image' && item.url)
                        .map((item, index) => (
                          <img
                            key={`${complaint._id}-${index}`}
                            src={item.url}
                            alt="Complaint evidence"
                            className="h-16 w-16 cursor-pointer rounded-xl border border-orange-200 object-cover transition hover:opacity-80"
                            onClick={() => setSelectedImage(item.url)}
                          />
                        ))}
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-1 text-xs text-gray-500 ml-2">
                  {getStatusIcon(complaint.status)}
                  <span>{getStatusLabel(complaint.status)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
          onClick={() => setSelectedImage(null)}
        >
          <img
            src={selectedImage}
            alt="Complaint evidence"
            className="max-h-[90vh] max-w-full rounded-2xl object-contain"
          />
        </div>
      )}
    </div>
  );
};

export default ComplaintHistory;
