import { useState, useEffect } from 'react';
import { FaPlus, FaTimes } from 'react-icons/fa';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const FloatingActionButton = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [providerId, setProviderId] = useState(null);
  const { isAuthenticated, user } = useAuth();
  const location = useLocation();

  useEffect(() => {
    const match = location.pathname.match(/\/provider\/([^\/]+)/);
    if (match) {
      setProviderId(match[1]);
    } else {
      setProviderId(null);
    }
  }, [location]);

  if (!isAuthenticated) return null;

  const actions = [];
  
  if (user?.role === 'customer' && providerId) {
    actions.push({
      icon: '⭐',
      label: 'Write Review',
      link: `/provider/${providerId}/review`,
      color: 'bg-yellow-500',
      hoverColor: 'hover:bg-yellow-600'
    });
    actions.push({
      icon: '🚨',
      label: 'Report Issue',
      link: `/provider/${providerId}/report`,
      color: 'bg-red-500',
      hoverColor: 'hover:bg-red-600'
    });
  }
  
  if (user?.role === 'owner') {
    actions.push({
      icon: '📊',
      label: 'Dashboard',
      link: '/dashboard',
      color: 'bg-primary-600',
      hoverColor: 'hover:bg-primary-700'
    });
    if (providerId) {
      actions.push({
        icon: '📸',
        label: 'Upload Photo',
        link: `/provider/${providerId}/upload`,
        color: 'bg-blue-500',
        hoverColor: 'hover:bg-blue-600'
      });
    }
  }

  if (actions.length === 0) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {isOpen && (
        <div className="absolute bottom-16 right-0 flex flex-col gap-3">
          {actions.map((action, idx) => (
            <Link
              key={idx}
              to={action.link}
              className={`${action.color} ${action.hoverColor} text-white rounded-full w-12 h-12 flex items-center justify-center shadow-lg hover:scale-110 transition-all duration-200`}
              onClick={() => setIsOpen(false)}
              title={action.label}
            >
              <span className="text-xl">{action.icon}</span>
            </Link>
          ))}
        </div>
      )}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="bg-primary-600 text-white rounded-full w-14 h-14 flex items-center justify-center shadow-lg hover:bg-primary-700 transition-all duration-200 hover:scale-110"
      >
        {isOpen ? <FaTimes className="text-xl" /> : <FaPlus className="text-xl" />}
      </button>
    </div>
  );
};

export default FloatingActionButton;
