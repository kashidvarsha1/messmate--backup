import { Link } from 'react-router-dom';

const NotFound = () => {
  return (
    <div className="min-h-screen bg-amber-50 flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="text-8xl mb-6">🍽️</div>
        <h1 className="font-display font-bold text-6xl text-gray-800 mb-2">404</h1>
        <h2 className="font-display font-bold text-2xl text-gray-600 mb-4">Yeh Page Nahi Mila!</h2>
        <p className="text-gray-400 mb-8 leading-relaxed">
          Lagta hai aap galat jagah aa gaye. Shayad page delete ho gaya ya link galat hai.
        </p>
        <div className="flex gap-3 justify-center">
          <Link to="/" className="btn-primary">🏠 Home Jao</Link>
          <button onClick={() => window.history.back()} className="btn-secondary">← Wapas</button>
        </div>
        <div className="mt-12 p-4 bg-white rounded-2xl border border-amber-100 shadow-sm">
          <p className="text-sm text-gray-500">Ghar ka khana dhundh rahe ho?</p>
          <Link to="/" className="text-orange-500 font-semibold text-sm hover:underline">Providers dekho →</Link>
        </div>
      </div>
    </div>
  );
};

export default NotFound;