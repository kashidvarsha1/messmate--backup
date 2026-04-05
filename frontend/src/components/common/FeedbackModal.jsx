import { useState } from 'react';
import axios from '../../api/axios';
import toast from 'react-hot-toast';

const FeedbackModal = ({ isOpen, onClose }) => {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (rating === 0) {
      toast.error('Please select a rating');
      return;
    }
    if (!message.trim()) {
      toast.error('Please share your experience');
      return;
    }

    setLoading(true);
    try {
      await axios.post('/feedback', { rating, message });
      toast.success('Thank you for your feedback! 🙏');
      setRating(0);
      setMessage('');
      onClose();
    } catch (error) {
      toast.error('Failed to submit');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-6">
        <div className="text-center mb-4">
          <div className="text-3xl mb-2">💬</div>
          <h2 className="text-xl font-bold">Share Your Experience</h2>
          <p className="text-gray-500 text-sm">Aapka feedback humare liye important hai</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="flex justify-center gap-2 mb-4">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
                className="text-3xl focus:outline-none"
              >
                <span className={(hoverRating || rating) >= star ? 'text-yellow-400' : 'text-gray-300'}>
                  ★
                </span>
              </button>
            ))}
          </div>

          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-orange-400 outline-none mb-4"
            rows="4"
            placeholder="Apna experience share karo... 😊"
            maxLength="500"
          />

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-orange-500 text-white py-2 rounded-xl hover:bg-orange-600 transition"
            >
              {loading ? 'Submitting...' : 'Submit →'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-100 text-gray-600 py-2 rounded-xl hover:bg-gray-200 transition"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FeedbackModal;