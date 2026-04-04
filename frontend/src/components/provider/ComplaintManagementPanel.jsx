import { useEffect, useState } from 'react';
import axios from '../../api/axios';
import toast from 'react-hot-toast';

const statusStyles = {
  pending: 'border-amber-200 bg-amber-50 text-amber-800',
  investigating: 'border-blue-200 bg-blue-50 text-blue-800',
  verified: 'border-green-200 bg-green-50 text-green-800',
  dismissed: 'border-gray-200 bg-gray-50 text-gray-700',
  resolved: 'border-emerald-200 bg-emerald-50 text-emerald-800',
};

const severityStyles = {
  low: 'border-gray-200 bg-gray-50 text-gray-700',
  medium: 'border-yellow-200 bg-yellow-50 text-yellow-800',
  high: 'border-orange-200 bg-orange-50 text-orange-800',
  critical: 'border-red-200 bg-red-50 text-red-800',
};

const formatLabel = (value = '') =>
  value
    .split('_')
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');

const ComplaintManagementPanel = ({ providerId, canManage = false }) => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (providerId && canManage) {
      fetchReports();
    } else {
      setReports([]);
      setLoading(false);
    }
  }, [providerId, canManage]);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/reports/provider/${providerId}`);
      setReports(response.data.data || []);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Complaints load nahi hue');
      setReports([]);
    } finally {
      setLoading(false);
    }
  };

  if (!canManage) {
    return null;
  }

  return (
    <div className="rounded-2xl border border-amber-100 bg-white p-6 shadow-sm">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="font-display text-lg font-bold text-gray-800">Complaint Manager</h3>
          <p className="mt-1 text-sm text-gray-500">Is provider ki saari complaints aur evidence yahan full detail me dikhengi.</p>
        </div>
        <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700">
          {reports.length} total complaints
        </span>
      </div>

      {loading ? (
        <p className="text-sm text-gray-500">Complaints loading...</p>
      ) : reports.length === 0 ? (
        <div className="rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-4 text-sm text-emerald-700">
          Is provider ke against abhi koi complaint register nahi hui hai.
        </div>
      ) : (
        <div className="space-y-4">
          {reports.map((report) => (
            <div key={report._id} className="rounded-2xl border border-gray-100 p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <h4 className="font-semibold text-gray-800">{report.title}</h4>
                    <span className={`rounded-full border px-3 py-1 text-[11px] font-semibold uppercase ${statusStyles[report.status] || statusStyles.pending}`}>
                      {formatLabel(report.status)}
                    </span>
                    <span className={`rounded-full border px-3 py-1 text-[11px] font-semibold uppercase ${severityStyles[report.severity] || severityStyles.low}`}>
                      {formatLabel(report.severity)}
                    </span>
                  </div>

                  <p className="text-sm text-gray-600">{report.description}</p>

                  <p className="text-xs text-gray-400">
                    Reporter: {report.userId?.name || 'Unknown'} | Category: {formatLabel(report.category)}
                    {report.subCategory ? ` | Sub-category: ${formatLabel(report.subCategory)}` : ''}
                  </p>

                  <p className="text-xs text-gray-400">
                    Submitted on {new Date(report.createdAt).toLocaleString('en-IN')}
                  </p>

                  {report.adminNote && (
                    <div className="rounded-xl border border-blue-100 bg-blue-50 px-3 py-2 text-sm text-blue-700">
                      Admin note: {report.adminNote}
                    </div>
                  )}

                  {report.evidence?.length > 0 && (
                    <div className="flex flex-wrap gap-2 pt-1">
                      {report.evidence.map((item, index) => (
                        <img
                          key={`${report._id}-${index}`}
                          src={item.url}
                          alt="Complaint evidence"
                          className="h-20 w-20 rounded-xl border border-gray-100 object-cover"
                        />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ComplaintManagementPanel;
