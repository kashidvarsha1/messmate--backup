import { useNavigate } from 'react-router-dom';
import { FaArrowLeft } from 'react-icons/fa';

const BackButton = ({ fallbackPath = '/', className = '' }) => {
  const navigate = useNavigate();

  const handleBack = () => {
    if (window.history.length > 2) {
      navigate(-1);
    } else {
      navigate(fallbackPath);
    }
  };

  return (
    <button
      onClick={handleBack}
      className={`flex items-center gap-2 text-gray-600 hover:text-primary-600 transition-colors duration-200 ${className}`}
    >
      <FaArrowLeft className="text-sm" />
      <span>Back</span>
    </button>
  );
};

export default BackButton;
