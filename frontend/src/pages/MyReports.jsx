import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from '../api/axios';
import toast from 'react-hot-toast';

const MyReports = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMyReports();
  }, []);

  const fetchMyReports = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/reports/my');
      setReports(response.data.data || []);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to load reports');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      investigating: 'bg-blue-100 text-blue-800',
      verified: 'bg-green-100 text-green-800',
      dismissed: 'bg-red-100 text-red-800',
      resolved: 'bg-purple-100 text-purple-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getStatusIcon = (status) => {
    const icons = {
      pending: '⏳',
      investigating: '🔍',
      verified: '✅',
      dismissed: '❌',
      resolved: '✔️'
    };
    return icons[status] || '📋';
  };

  if (loading) {
    return <div className="min-h-screen bg-amber-50 flex items-center justify-center">Lod ho raha...</div>;
  }

  return (
    <div className="min-h-screen bg-amber-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">🚨 Mere Reports</h1>
          <p className="text-gray-600">Aapne jo reports kiye hain unka status dekho</p>
        </div>

        {reports.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-amber-100">
            <div className="text-5xl mb-4">📋</div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">Koi report nahi</h3>
            <p className="text-gray-600 mb-6">Aapne abhi koi report submit nahi kiya hai.</p>
            <Link
              to="/"
              className="bg-orange-500 text-white px-6 py-2 rounded-lg hover:bg-orange-600 inline-block"
            >
              Mess dhundho aur report do
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {reports.map((report) => (
              <div key={report._id} className="bg-white rounded-2xl p-6 border border-amber-100 shadow-sm hover:shadow-md transition">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-bold text-gray-800">{report.title}</h3>
                      <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(report.status)}`}>
                        {getStatusIcon(report.status)} {report.status}
                      </span>
                    </div>
                    <p className="text-gray-600 text-sm mb-2">
                      <Link to={`/provider/${report.providerId._id}`} className="text-orange-500 hover:underline font-semibold">
                        {report.providerId.name}
                      </Link>
                      {' '} • {report.providerId.address?.city}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-400">
                      {new Date(report.createdAt).toLocaleDateString('hi-IN')}
                    </p>
                  </div>
                </div>

                {/* Category and Severity */}
                <div className="flex gap-4 mb-4 flex-wrap">
                  <div className="flex items-center gap-2">
                    <span className="text-sm px-3 py-1 bg-gray-100 rounded-full capitalize">
                      {report.category.replace(/_/g, ' ')}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-sm px-3 py-1 rounded-full font-semibold ${
                      report.severity === 'high' ? 'bg-red-100 text-red-800' :
                      report.severity === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {report.severity} severity
                    </span>
                  </div>
                </div>

                {/* Description */}
                <p className="text-gray-700 mb-4">{report.description}</p>

                {/* Evidence */}
                {report.evidence && report.evidence.length > 0 && (
                  <div className="mb-4">
                    <p className="text-sm font-semibold text-gray-600 mb-2">📸 Evidence:</p>
                    <div className="flex gap-2 flex-wrap">
                      {report.evidence.map((img, idx) => (
                        <a
                          key={idx}
                          href={img.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-20 h-20 bg-gray-200 rounded-lg overflow-hidden hover:opacity-75 transition"
                        >
                          <img src={img.url} alt="Evidence" className="w-full h-full object-cover" />
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                {/* Admin Note */}
                {report.adminNote && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mt-4">
                    <p className="text-sm text-blue-900 font-semibold mb-1">👨‍⚖️ Admin ka reply:</p>
                    <p className="text-sm text-blue-800">{report.adminNote}</p>
                  </div>
                )}

                {/* Status Timeline */}
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <div className="text-xs text-gray-500">
                    <p>📅 Submitted: {new Date(report.createdAt).toLocaleString('hi-IN')}</p>
                    {report.resolvedAt && (
                      <p>✅ Resolved: {new Date(report.resolvedAt).toLocaleString('hi-IN')}</p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Info Box */}
        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6 mt-8">
          <h3 className="font-bold text-blue-900 mb-2">💡 Report Status Kya Matlab?</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>⏳ <strong>Pending:</strong> Admin review me hai</li>
            <li>🔍 <strong>Investigating:</strong> Admin check kar raha hai</li>
            <li>✅ <strong>Verified:</strong> Report sahi hai aur public hai</li>
            <li>❌ <strong>Dismissed:</strong> Report face ho gayer</li>
            <li>✔️ <strong>Resolved:</strong> Issue fix ho gaya</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default MyReports;
