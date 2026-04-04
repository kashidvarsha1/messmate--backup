import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaStar, FaImage, FaSpinner, FaTimes } from 'react-icons/fa';
import axios from '../../api/axios';
import toast from 'react-hot-toast';

const ReviewForm = ({ providerId, onSuccess }) => {
  const navigate = useNavigate();
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [uploading, setUploading] = useState(false);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('File too large. Max 5MB');
        return;
      }
      if (!file.type.startsWith('image/')) {
        toast.error('Only image files are allowed');
        return;
      }
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const clearImage = () => {
    setSelectedFile(null);
    setPreview(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (rating === 0) {
      toast.error('Please select a rating');
      return;
    }
    if (!comment.trim()) {
      toast.error('Please write a review');
      return;
    }

    setUploading(true);
    let imageUrl = null;

    try {
      if (selectedFile) {
        const formData = new FormData();
        formData.append('image', selectedFile);
        const uploadResponse = await axios.post('/upload', formData);
        imageUrl = uploadResponse.data.data.url;
      }

      await axios.post('/reviews', {
        providerId,
        rating,
        comment,
        images: imageUrl ? [{ url: imageUrl, caption: comment.substring(0, 100) }] : []
      });
      
      toast.success('✅ Review submitted successfully!');
      if (onSuccess) onSuccess();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error submitting review');
    } finally {
      setUploading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-md p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-bold">Write a Review</h3>
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="text-gray-400 hover:text-gray-600 transition"
        >
          ✕
        </button>
      </div>
      
      {/* Rating Stars */}
      <div className="mb-4">
        <label className="block text-sm font-medium mb-2">Your Rating</label>
        <div className="flex gap-2">
          {[1, 2, 3, 4, 5].map(star => (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star)}
              onMouseEnter={() => setHoverRating(star)}
              onMouseLeave={() => setHoverRating(0)}
              className="text-3xl focus:outline-none"
            >
              <FaStar className={star <= (hoverRating || rating) ? 'text-yellow-500' : 'text-gray-300'} />
            </button>
          ))}
          <span className="text-sm text-gray-500 ml-2">{rating > 0 ? `${rating} out of 5` : 'Select rating'}</span>
        </div>
      </div>

      {/* Photo Upload */}
      <div className="mb-4">
        <label className="block text-sm font-medium mb-2">Add Photo (Optional)</label>
        
        {!preview ? (
          <div className="flex items-center justify-center w-full">
            <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition">
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <FaImage className="text-3xl text-gray-400 mb-2" />
                <p className="text-sm text-gray-500">
                  <span className="font-semibold">Click to upload</span> a photo
                </p>
                <p className="text-xs text-gray-400">PNG, JPG, JPEG (Max 5MB)</p>
              </div>
              <input
                type="file"
                className="hidden"
                accept="image/*"
                onChange={handleFileChange}
                capture="environment"
              />
            </label>
          </div>
        ) : (
          <div className="relative inline-block">
            <img src={preview} alt="Preview" className="w-32 h-32 object-cover rounded-lg border" />
            <button
              type="button"
              onClick={clearImage}
              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
            >
              <FaTimes size={12} />
            </button>
          </div>
        )}
      </div>

      {/* Review Comment */}
      <div className="mb-4">
        <label className="block text-sm font-medium mb-2">Your Experience</label>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          rows="4"
          className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
          placeholder="Share your experience with this provider..."
          required
        />
      </div>

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={uploading}
          className="btn-primary flex-1 disabled:opacity-50"
        >
          {uploading ? 'Submitting...' : 'Submit Review'}
        </button>
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="btn-secondary flex-1"
        >
          Cancel
        </button>
      </div>
    </form>
  );
};

export default ReviewForm;
