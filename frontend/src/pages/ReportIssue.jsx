import { useParams, useNavigate } from 'react-router-dom';
import BackButton from '../components/common/BackButton';
import ReportForm from '../components/report/ReportForm';

const ReportIssue = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const handleSuccess = () => {
    navigate(`/provider/${id}`);
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <div className="flex items-center justify-between mb-6">
        <BackButton fallbackPath={`/provider/${id}`} />
        <h1 className="text-2xl font-bold">Report an Issue</h1>
        <div className="w-20"></div>
      </div>
      <ReportForm providerId={id} onSuccess={handleSuccess} />
    </div>
  );
};

export default ReportIssue;
