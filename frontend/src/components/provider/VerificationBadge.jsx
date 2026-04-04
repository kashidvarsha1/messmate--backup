import { FaCheckCircle, FaShieldAlt, FaClock } from 'react-icons/fa';

const VerificationBadge = ({ badgeType, size = 'md' }) => {
  const getBadgeConfig = (type) => {
    switch (type) {
      case 'HYGIENE_CERTIFIED':
        return {
          icon: <FaShieldAlt className="text-green-500" />,
          text: 'Hygiene Certified',
          color: 'bg-green-100 text-green-800',
          borderColor: 'border-green-200',
        };
      case 'BASIC_VERIFIED':
        return {
          icon: <FaCheckCircle className="text-blue-500" />,
          text: 'Basic Verified',
          color: 'bg-blue-100 text-blue-800',
          borderColor: 'border-blue-200',
        };
      default:
        return {
          icon: <FaClock className="text-gray-500" />,
          text: 'Not Verified',
          color: 'bg-gray-100 text-gray-800',
          borderColor: 'border-gray-200',
        };
    }
  };

  const config = getBadgeConfig(badgeType);
  const sizeClasses = {
    sm: 'text-xs px-2 py-1',
    md: 'text-sm px-3 py-1.5',
    lg: 'text-base px-4 py-2',
  };

  return (
    <div className={`inline-flex items-center gap-2 rounded-full border ${config.borderColor} ${config.color} ${sizeClasses[size]} shadow-sm`}>
      {config.icon}
      <span className="font-medium">{config.text}</span>
    </div>
  );
};

export default VerificationBadge;