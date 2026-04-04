import { useEffect, useState } from 'react';
import axios from '../../api/axios';
import toast from 'react-hot-toast';

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const proofTypeOptions = [
  { value: 'kitchen', label: 'Kitchen' },
  { value: 'food', label: 'Food' },
  { value: 'dining_area', label: 'Dining Area' },
  { value: 'staff', label: 'Staff Hygiene' },
  { value: 'storage', label: 'Storage' },
  { value: 'food_prep', label: 'Food Prep' },
  { value: 'cleaning', label: 'Cleaning' },
  { value: 'certificate', label: 'Certificate' },
  { value: 'general', label: 'General' },
];

const HygieneProofUpload = ({ providerId, onUpload, proofType = 'kitchen' }) => {
  const [uploading, setUploading] = useState(false);
  const [selectedType, setSelectedType] = useState(proofType);

  useEffect(() => {
    setSelectedType(proofType);
  }, [proofType]);

  const handleFileUpload = async (event) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    if (!providerId) {
      toast.error('Provider ID is missing.');
      event.target.value = '';
      return;
    }

    if (!file.type.startsWith('image/')) {
      toast.error('Only image files are allowed.');
      event.target.value = '';
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      toast.error('Image must be 5MB or smaller.');
      event.target.value = '';
      return;
    }

    const formData = new FormData();
    formData.append('image', file);

    setUploading(true);

    try {
      const uploadResponse = await axios.post('/upload', formData);

      const imageUrl = uploadResponse.data?.data?.url || uploadResponse.data?.url;

      if (!imageUrl) {
        throw new Error('Upload response did not include an image URL.');
      }

      const hygieneResponse = await axios.post('/hygiene', {
        providerId,
        imageUrl,
        type: selectedType,
      });

      const createdProof = hygieneResponse.data?.data || {
        providerId,
        imageUrl,
        type: selectedType,
        status: 'approved',
        createdAt: new Date().toISOString(),
      };

      toast.success('Hygiene proof uploaded successfully.');
      event.target.value = '';

      if (typeof onUpload === 'function') {
        onUpload(createdProof);
      }
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || error.message || 'Upload failed.';
      toast.error(errorMessage);
      event.target.value = '';
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="rounded-xl border-2 border-dashed border-amber-300 bg-amber-50/30 p-6 text-center">
      <div className="mb-4 text-left">
        <label className="mb-1 block text-sm font-semibold text-gray-700">Photo Category</label>
        <select
          value={selectedType}
          onChange={(event) => setSelectedType(event.target.value)}
          className="w-full rounded-xl border border-amber-200 bg-white px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-orange-300"
          disabled={uploading}
        >
          {proofTypeOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      <input
        id="hygiene-upload-input"
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
        onChange={handleFileUpload}
        className="hidden"
        disabled={uploading}
      />
      <label htmlFor="hygiene-upload-input" className="block cursor-pointer">
        {uploading ? (
          <div className="flex flex-col items-center gap-3">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-orange-500 border-t-transparent" />
            <p className="text-gray-500">Uploading proof...</p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-orange-100">
              <span className="text-xl">📷</span>
            </div>
            <div>
              <p className="font-medium text-gray-700">Click to upload hygiene proof</p>
              <p className="mt-1 text-xs text-gray-400">
                JPG, PNG, GIF, or WEBP only. Maximum size 5MB.
              </p>
            </div>
          </div>
        )}
      </label>
    </div>
  );
};

export default HygieneProofUpload;
