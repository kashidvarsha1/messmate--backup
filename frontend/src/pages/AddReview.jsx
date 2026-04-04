import { useParams, useNavigate } from 'react-router-dom';
import BackButton from '../components/common/BackButton';
import ReviewForm from '../components/review/ReviewForm';

const AddReview = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const handleSuccess = () => {
    navigate(`/provider/${id}`);
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <div className="flex items-center justify-between mb-6">
        <BackButton fallbackPath={`/provider/${id}`} />
        <h1 className="text-2xl font-bold">Write a Review</h1>
        <div className="w-20"></div>
      </div>
      <ReviewForm providerId={id} onSuccess={handleSuccess} />
    </div>
  );
};

export default AddReview;
