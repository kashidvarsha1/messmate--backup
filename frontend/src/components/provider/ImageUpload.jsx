import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import axios from '../../api/axios';

const ImageUpload = ({ onUploadComplete, providerId }) => {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState(null);

  const onDrop = useCallback(async (acceptedFiles) => {
    const file = acceptedFiles[0];
    if (!file) return;

    setPreview(URL.createObjectURL(file));
    setUploading(true);

    const formData = new FormData();
    formData.append('image', file);
    if (providerId) formData.append('providerId', providerId);

    try {
      const response = await axios.post('/upload', formData);
      if (onUploadComplete) onUploadComplete(response.data.data);
    } catch (error) {
      console.error('Upload failed:', error);
    } finally {
      setUploading(false);
    }
  }, [providerId, onUploadComplete]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': [] },
    maxFiles: 1,
    maxSize: 5242880
  });

  return (
    <div
      {...getRootProps()}
      className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-all
        ${isDragActive ? 'border-primary-500 bg-primary-50' : 'border-gray-300 hover:border-primary-400'}`}
    >
      <input {...getInputProps()} />
      {preview ? (
        <img src={preview} alt="Preview" className="max-h-48 mx-auto rounded-lg" />
      ) : (
        <div>
          <div className="text-4xl mb-2">📸</div>
          {isDragActive ? (
            <p className="text-primary-600">Drop the image here...</p>
          ) : (
            <p className="text-gray-500">Drag & drop an image here, or click to select</p>
          )}
          <p className="text-xs text-gray-400 mt-2">Max 5MB. JPG, PNG, WEBP</p>
        </div>
      )}
      {uploading && <p className="text-primary-600 mt-2">Uploading...</p>}
    </div>
  );
};

export default ImageUpload;
