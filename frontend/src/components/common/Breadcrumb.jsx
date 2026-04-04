import { Link, useLocation } from 'react-router-dom';
import { FaHome } from 'react-icons/fa';

const Breadcrumb = () => {
  const location = useLocation();
  const pathnames = location.pathname.split('/').filter(x => x);

  return (
    <nav className="flex items-center gap-2 text-sm text-gray-500 mb-4 flex-wrap">
      <Link to="/" className="hover:text-primary-600 flex items-center gap-1">
        <FaHome className="text-xs" />
        Home
      </Link>
      {pathnames.map((name, index) => {
        const routeTo = `/${pathnames.slice(0, index + 1).join('/')}`;
        const isLast = index === pathnames.length - 1;
        
        const formattedName = name
          .replace(/-/g, ' ')
          .replace(/\b\w/g, l => l.toUpperCase());
        
        return (
          <div key={name} className="flex items-center gap-2">
            <span className="text-gray-400">/</span>
            {isLast ? (
              <span className="text-gray-800 font-medium">{formattedName}</span>
            ) : (
              <Link to={routeTo} className="hover:text-primary-600">
                {formattedName}
              </Link>
            )}
          </div>
        );
      })}
    </nav>
  );
};

export default Breadcrumb;
