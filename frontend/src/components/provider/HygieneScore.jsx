import { FaStar, FaStarHalfAlt, FaRegStar } from 'react-icons/fa';

const HygieneScore = ({ score, size = 'lg', showLabel = true }) => {
  const getColor = (score) => {
    if (score >= 4.5) return 'text-green-500';
    if (score >= 3.5) return 'text-blue-500';
    if (score >= 2.5) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getProgressColor = (score) => {
    if (score >= 4.5) return 'bg-green-500';
    if (score >= 3.5) return 'bg-blue-500';
    if (score >= 2.5) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const fullStars = Math.floor(score);
  const hasHalfStar = score % 1 >= 0.5;
  const emptyStars = 5 - Math.ceil(score);
  const starSize = size === 'lg' ? 'text-2xl' : size === 'md' ? 'text-xl' : 'text-lg';

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <div className="flex">
          {[...Array(fullStars)].map((_, i) => (
            <FaStar key={`full-${i}`} className={`${starSize} text-yellow-500`} />
          ))}
          {hasHalfStar && <FaStarHalfAlt className={`${starSize} text-yellow-500`} />}
          {[...Array(emptyStars)].map((_, i) => (
            <FaRegStar key={`empty-${i}`} className={`${starSize} text-gray-300`} />
          ))}
        </div>
        <span className={`font-bold text-2xl ${getColor(score)}`}>{score.toFixed(1)}</span>
        {showLabel && <span className="text-gray-500">/ 5 Hygiene Score</span>}
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className={`${getProgressColor(score)} h-2 rounded-full transition-all duration-500`}
          style={{ width: `${(score / 5) * 100}%` }}
        />
      </div>
    </div>
  );
};

export default HygieneScore;
