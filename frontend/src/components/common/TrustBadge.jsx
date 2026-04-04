import { motion } from 'framer-motion';
import { scaleOnHover } from '../../utils/animations';

const TrustBadge = ({ score, size = 'md' }) => {
  const getTrustDetails = (score) => {
    if (score >= 80) {
      return {
        icon: '🏆',
        label: 'Highly Trusted',
        color: 'from-yellow-500 to-amber-600',
        bgColor: 'bg-yellow-50',
        textColor: 'text-yellow-800',
        borderColor: 'border-yellow-200',
        description: 'Verified and trusted by community'
      };
    }
    if (score >= 60) {
      return {
        icon: '👍',
        label: 'Trusted',
        color: 'from-green-500 to-emerald-600',
        bgColor: 'bg-green-50',
        textColor: 'text-green-800',
        borderColor: 'border-green-200',
        description: 'Consistently reliable'
      };
    }
    if (score >= 40) {
      return {
        icon: '⭐',
        label: 'Average',
        color: 'from-blue-500 to-cyan-600',
        bgColor: 'bg-blue-50',
        textColor: 'text-blue-800',
        borderColor: 'border-blue-200',
        description: 'Building trust'
      };
    }
    return {
      icon: '⚠️',
      label: 'Needs Review',
      color: 'from-orange-500 to-red-600',
      bgColor: 'bg-orange-50',
      textColor: 'text-orange-800',
      borderColor: 'border-orange-200',
      description: 'Recently joined'
    };
  };

  const details = getTrustDetails(score);
  const sizeClasses = {
    sm: 'text-xs px-2 py-1',
    md: 'text-sm px-3 py-1.5',
    lg: 'text-base px-4 py-2'
  };

  return (
    <motion.div
      {...scaleOnHover}
      className={`inline-flex items-center gap-2 rounded-full border ${details.borderColor} ${details.bgColor} ${sizeClasses[size]} shadow-sm`}
    >
      <span className="text-lg">{details.icon}</span>
      <div>
        <span className={`font-semibold ${details.textColor}`}>
          {details.label} ({score}/100)
        </span>
        <p className="text-xs text-gray-500 hidden md:block">{details.description}</p>
      </div>
    </motion.div>
  );
};

export default TrustBadge;
