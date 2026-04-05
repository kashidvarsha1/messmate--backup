import { useState } from 'react';
import { FaImage, FaSpinner, FaTimes } from 'react-icons/fa';
import axios from '../../api/axios';
import toast from 'react-hot-toast';

const ReportForm = ({ providerId, onSuccess }) => {
  const [formData, setFormData] = useState({
    category: 'bad_hygiene',
    subCategory: '',
    title: '',
    description: '',
    severity: 'medium',
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const categories = [
    { value: 'bad_hygiene', label: 'Bad Hygiene', icon: '🧼' },
    { value: 'fake_review', label: 'Fake Review', icon: '🎭' },
    { value: 'food_quality', label: 'Food Quality', icon: '🍲' },
    { value: 'misleading_info', label: 'Misleading Info', icon: '⚠️' },
    { value: 'other', label: 'Other', icon: '📢' },
  ];

  const subCategories = {
    bad_hygiene: ['dirty_kitchen', 'pest_issue', 'unclean_storage', 'stale_food'],
    food_quality: ['bad_taste', 'undercooked', 'foreign_object'],
    fake_review: ['fake_positive_review', 'fake_negative_review', 'paid_review'],
  };

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
    if (!formData.title.trim()) {
      toast.error('Please enter a title');
      return;
    }
    if (!formData.description.trim()) {
      toast.error('Please enter a description');
      return;
    }

    setSubmitting(true);
    let imageUrl = null;

    try {
      // Upload image if selected
      if (selectedFile) {
        const uploadFormData = new FormData();
        uploadFormData.append('image', selectedFile);
        const uploadResponse = await axios.post('/upload', uploadFormData);
        imageUrl = uploadResponse.data.data.url;
      }

      // Submit report with image
      await axios.post('/reports', {
        providerId,
        ...formData,
        evidence: imageUrl ? [{ url: imageUrl, type: 'image' }] : []
      });
      
      toast.success('✅ Report submitted successfully and is now visible publicly!');
      setFormData({
        category: 'bad_hygiene',
        subCategory: '',
        title: '',
        description: '',
        severity: 'medium',
      });
      setSelectedFile(null);
      setPreview(null);
      if (onSuccess) onSuccess();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error submitting report');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-md p-6">
      <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
        <span>🚨</span> Report Issue
      </h3>

      {/* Category Selection */}
      <div className="mb-4">
        <label className="block text-sm font-medium mb-2">Category</label>
        <div className="grid grid-cols-2 gap-2">
          {categories.map(cat => (
            <button
              key={cat.value}
              type="button"
              onClick={() => setFormData({ ...formData, category: cat.value, subCategory: '' })}
              className={`p-3 border rounded-lg text-left transition ${
                formData.category === cat.value
                  ? 'border-red-500 bg-red-50 text-red-700'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <span className="text-xl mr-2">{cat.icon}</span>
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Sub Category */}
      {subCategories[formData.category] && (
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">Sub Category</label>
          <select
            value={formData.subCategory}
            onChange={(e) => setFormData({ ...formData, subCategory: e.target.value })}
            className="w-full border rounded-lg px-4 py-2"
            required
          >
            <option value="">Select sub category</option>
            {subCategories[formData.category].map(sub => (
              <option key={sub} value={sub}>{sub.replace(/_/g, ' ')}</option>
            ))}
          </select>
        </div>
      )}

      {/* Title */}
      <div className="mb-4">
        <label className="block text-sm font-medium mb-2">Title</label>
        <input
          type="text"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
          placeholder="Brief title of the issue"
          required
        />
      </div>

      {/* Photo Upload */}
      <div className="mb-4">
        <label className="block text-sm font-medium mb-2">Add Evidence Photo (Optional)</label>
        
        {!preview ? (
          <div className="flex items-center justify-center w-full">
            <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition">
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <FaImage className="text-3xl text-gray-400 mb-2" />
                <p className="text-sm text-gray-500">
                  <span className="font-semibold">Click to upload</span> evidence photo
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
            <img 
              src={preview} 
              alt="Evidence" 
              className="w-32 h-32 object-cover rounded-lg border"
            />
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

      {/* Description */}
      <div className="mb-4">
        <label className="block text-sm font-medium mb-2">Description</label>
        <textarea
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          rows="4"
          className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
          placeholder="Detailed description of the issue..."
          required
        />
      </div>

      {/* Severity */}
      <div className="mb-6">
        <label className="block text-sm font-medium mb-2">Severity</label>
        <select
          value={formData.severity}
          onChange={(e) => setFormData({ ...formData, severity: e.target.value })}
          className="w-full border rounded-lg px-4 py-2"
        >
          <option value="low">Low - Minor issue</option>
          <option value="medium">Medium - Concerning</option>
          <option value="high">High - Serious issue</option>
          <option value="critical">Critical - Urgent attention</option>
        </select>
      </div>

      <button
        type="submit"
        disabled={submitting}
        className="btn-primary w-full disabled:opacity-50 bg-red-600 hover:bg-red-700"
      >
        {submitting ? 'Submitting...' : 'Submit Report'}
      </button>
    </form>
  );
};

export default ReportForm;


