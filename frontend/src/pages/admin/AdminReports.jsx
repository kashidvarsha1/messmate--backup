import { useEffect, useState } from 'react';
import axios from '../../api/axios';
import toast from 'react-hot-toast';

const AdminReports = () => {
  const [reports, setReports] = useState([]);
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    status: '',
    severity: '',
  });

  useEffect(() => {
    fetchData();
  }, [filters.status, filters.severity]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [reportsRes, complaintsRes] = await Promise.all([
        axios.get('/reports/admin/all', {
          params: {
            status: filters.status || undefined,
            severity: filters.severity || undefined,
          },
        }),
        axios.get('/admin/complaints'),
      ]);

      setReports(reportsRes.data.data || []);
      setComplaints(complaintsRes.data.data || []);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Reports load nahi hue');
    } finally {
      setLoading(false);
    }
  };

  const updateReportStatus = async (reportId, nextStatus) => {
    try {
      await axios.put(`/reports/${reportId}/verify`, {
        status: nextStatus,
        adminNote: `Marked as ${nextStatus} by admin`,
      });
      toast.success(`Report ${nextStatus}`);
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Report update failed');
    }
  };

  if (loading) {
    return <div className="rounded-3xl border border-amber-100 bg-white p-8 text-center shadow-sm">Loading reports...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-amber-100 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-orange-500">Admin Reports</p>
            <h1 className="mt-2 font-display text-3xl font-bold text-gray-800">Reports and complaints</h1>
            <p className="mt-2 text-sm text-gray-500">Verified reports provider ke hygiene score ko affect karenge.</p>
          </div>

          <div className="flex flex-wrap gap-3">
            <select
              value={filters.status}
              onChange={(e) => setFilters((prev) => ({ ...prev, status: e.target.value }))}
              className="input-field py-2.5"
            >
              <option value="">All statuses</option>
              <option value="pending">Pending</option>
              <option value="investigating">Investigating</option>
              <option value="verified">Verified</option>
              <option value="dismissed">Dismissed</option>
              <option value="resolved">Resolved</option>
            </select>

            <select
              value={filters.severity}
              onChange={(e) => setFilters((prev) => ({ ...prev, severity: e.target.value }))}
              className="input-field py-2.5"
            >
              <option value="">All severities</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="critical">Critical</option>
            </select>
          </div>
        </div>
      </div>

      <section className="rounded-3xl border border-amber-100 bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-xl font-bold text-gray-800">User Reports</h2>
          <span className="rounded-full bg-orange-100 px-3 py-1 text-xs font-semibold text-orange-700">{reports.length} reports</span>
        </div>

        <div className="space-y-4">
          {reports.length === 0 ? (
            <p className="text-sm text-gray-500">No reports found.</p>
          ) : (
            reports.map((report) => (
              <div key={report._id} className="rounded-2xl border border-gray-100 p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-semibold text-gray-800">{report.title}</h3>
                      <span className="rounded-full bg-amber-100 px-3 py-1 text-[11px] font-semibold uppercase text-amber-700">
                        {report.status}
                      </span>
                      <span className="rounded-full bg-red-100 px-3 py-1 text-[11px] font-semibold uppercase text-red-700">
                        {report.severity}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">{report.description}</p>
                    <p className="text-xs text-gray-400">
                      Provider: {report.providerId?.name || 'Unknown'} | Reporter: {report.userId?.name || 'Unknown'} | Category: {report.category}
                    </p>
                    <p className="text-xs text-gray-400">{new Date(report.createdAt).toLocaleString()}</p>
                    {report.evidence?.length > 0 && (
                      <div className="flex flex-wrap gap-2 pt-1">
                        {report.evidence.map((item, index) => (
                          <img
                            key={`${report._id}-${index}`}
                            src={item.url}
                            alt="Evidence"
                            className="h-16 w-16 rounded-xl border border-gray-100 object-cover"
                          />
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => updateReportStatus(report._id, 'investigating')}
                      className="rounded-xl border border-blue-200 bg-blue-50 px-3 py-2 text-xs font-semibold text-blue-700"
                    >
                      Investigate
                    </button>
                    <button
                      onClick={() => updateReportStatus(report._id, 'verified')}
                      className="rounded-xl border border-green-200 bg-green-50 px-3 py-2 text-xs font-semibold text-green-700"
                    >
                      Verify
                    </button>
                    <button
                      onClick={() => updateReportStatus(report._id, 'dismissed')}
                      className="rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-xs font-semibold text-gray-700"
                    >
                      Dismiss
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      <section className="rounded-3xl border border-amber-100 bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-xl font-bold text-gray-800">Complaints</h2>
          <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700">{complaints.length} complaints</span>
        </div>

        <div className="space-y-4">
          {complaints.length === 0 ? (
            <p className="text-sm text-gray-500">No complaints found.</p>
          ) : (
            complaints.map((complaint) => (
              <div key={complaint._id} className="rounded-2xl border border-gray-100 p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-semibold text-gray-800">{complaint.title}</h3>
                      <span className="rounded-full bg-amber-100 px-3 py-1 text-[11px] font-semibold uppercase text-amber-700">
                        {complaint.status}
                      </span>
                      <span className="rounded-full bg-red-100 px-3 py-1 text-[11px] font-semibold uppercase text-red-700">
                        {complaint.priority}
                      </span>
                    </div>
                    <p className="mt-2 text-sm text-gray-600">{complaint.description}</p>
                    <p className="mt-2 text-xs text-gray-400">
                      Provider: {complaint.providerName} | Reporter: {complaint.reporterName}
                    </p>
                  </div>
                  <p className="text-xs text-gray-400">{new Date(complaint.createdAt).toLocaleString()}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
};

export default AdminReports;
