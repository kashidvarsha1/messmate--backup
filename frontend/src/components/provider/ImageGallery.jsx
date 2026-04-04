import { useState, useEffect } from 'react';
import axios from '../../api/axios';
import { FaCamera, FaCheckCircle } from 'react-icons/fa';

const formatTypeLabel = (type = '') =>
  type
    .split('_')
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');

const ImageGallery = ({ providerId, extraImages = [], refreshKey = 0, title = 'Real Kitchen Photos' }) => {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(null);
  const [activeType, setActiveType] = useState('all');

  useEffect(() => {
    fetchImages();
  }, [providerId, refreshKey]);

  useEffect(() => {
    setActiveType('all');
  }, [providerId, refreshKey]);

  const fetchImages = async () => {
    if (!providerId) {
      setImages([]);
      setLoading(false);
      return;
    }

    setLoading(true);

    try {
      const response = await axios.get(`/media/provider/${providerId}`);
      setImages(response.data.data || []);
    } catch (error) {
      console.error('Error fetching images:', error);
    } finally {
      setLoading(false);
    }
  };

  const normalizedExtraImages = (extraImages || []).map((image) => ({
    ...image,
    _galleryId: image._id || image.imageUrl || image.url || image.createdAt,
    url: image.url || image.imageUrl,
    caption: image.caption || image.type,
    verified: image.verified ?? image.status === 'approved',
  }));

  const normalizedImages = (images || []).map((image) => ({
    ...image,
    _galleryId: image._id || image.url || image.createdAt,
  }));

  const mergedImages = [...normalizedExtraImages, ...normalizedImages].filter(
    (image, index, array) =>
      image.url &&
      index === array.findIndex((item) => (item.url || '') === (image.url || ''))
  ).sort((left, right) => new Date(right.createdAt || 0) - new Date(left.createdAt || 0));

  const imageTypes = ['all', ...new Set(mergedImages.map((image) => image.type).filter(Boolean))];
  const visibleImages =
    activeType === 'all'
      ? mergedImages
      : mergedImages.filter((image) => image.type === activeType);

  const getTypeIcon = (type) => {
    switch (type) {
      case 'kitchen': return '🍳';
      case 'food': return '🍲';
      case 'dining_area': return '🍽️';
      case 'staff': return '👨‍🍳';
      case 'storage': return '📦';
      case 'food_prep': return '🥘';
      case 'cleaning': return '🧼';
      case 'certificate': return '📄';
      default: return '📸';
    }
  };

  if (loading) return <div className="text-center py-4">Loading images...</div>;

  return (
    <div className="bg-white rounded-2xl shadow-md p-6 mt-6">
      <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
        <FaCamera className="text-primary-500" />
        {title} ({visibleImages.length})
      </h3>

      {imageTypes.length > 1 && (
        <div className="mb-4 flex flex-wrap gap-2">
          {imageTypes.map((type) => (
            <button
              key={type}
              onClick={() => setActiveType(type)}
              className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
                activeType === type
                  ? 'border-orange-200 bg-orange-500 text-white'
                  : 'border-gray-200 bg-gray-50 text-gray-600'
              }`}
            >
              {type === 'all' ? 'All Photos' : formatTypeLabel(type)}
            </button>
          ))}
        </div>
      )}
      
      {visibleImages.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <div className="text-4xl mb-2">📸</div>
          <p>No photos uploaded yet. Be the first to share!</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {visibleImages.map(img => (
            <div
              key={img._galleryId}
              className="relative group cursor-pointer"
              onClick={() => setSelectedImage(img)}
            >
              <img
                src={img.url}
                alt={img.caption || img.type}
                className="w-full h-40 object-cover rounded-lg shadow-sm hover:shadow-md transition"
              />
              <div className="absolute top-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
                <span>{getTypeIcon(img.type)}</span>
                <span>{formatTypeLabel(img.type)}</span>
              </div>
              {img.verified && (
                <div className="absolute top-2 right-2 bg-green-500 text-white rounded-full p-1">
                  <FaCheckCircle size={16} />
                </div>
              )}
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
          <div className="max-w-4xl max-h-[90vh]">
            <img
              src={selectedImage.url}
              alt={selectedImage.caption}
              className="max-w-full max-h-[80vh] object-contain rounded-lg"
            />
            <div className="mt-4 text-white text-center">
              <p className="font-medium">{selectedImage.caption || formatTypeLabel(selectedImage.type)}</p>
              <p className="text-sm text-gray-300">
                {selectedImage.userId?.name ? `Uploaded by ${selectedImage.userId.name} • ` : ''}
                {new Date(selectedImage.createdAt).toLocaleDateString()}
              </p>
              {selectedImage.verified && (
                <p className="text-green-400 text-sm mt-1">✓ Verified by admin</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageGallery;

