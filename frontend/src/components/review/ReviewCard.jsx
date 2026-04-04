import { FaStar, FaImage } from 'react-icons/fa';
import { useState } from 'react';

const ReviewCard = ({ review }) => {
  const [selectedImage, setSelectedImage] = useState(null);

  return (
    <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className="flex">
            {[1, 2, 3, 4, 5].map(star => (
              <FaStar key={star} className={star <= review.rating ? 'text-yellow-500' : 'text-gray-300'} />
            ))}
          </div>
          <span className="font-semibold text-gray-800">{review.userId?.name || 'Anonymous'}</span>
          {review.isVerified && (
            <span className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full">✓ Verified</span>
          )}
        </div>
        <span className="text-xs text-gray-400">{new Date(review.createdAt).toLocaleDateString()}</span>
      </div>
      <p className="text-gray-600">{review.comment}</p>
      
      {/* Review Images */}
      {review.images && review.images.length > 0 && (
        <div className="mt-3 flex gap-2">
          {review.images.map((img, idx) => (
            <div key={idx} className="relative">
              <img
                src={img.url}
                alt="Review"
                className="w-16 h-16 object-cover rounded-lg cursor-pointer hover:opacity-80 transition"
                onClick={() => setSelectedImage(img.url)}
              />
            </div>
          ))}
        </div>
      )}
      
      {/* Lightbox Modal */}
      {selectedImage && (
        <div
          className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedImage(null)}
        >
          <img
            src={selectedImage}
            alt="Review"
            className="max-w-full max-h-[90vh] object-contain rounded-lg"
          />
        </div>
      )}
    </div>
  );
};

export default ReviewCard;
