import React, { useState, useRef } from 'react';
import { useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';

interface SimpleImageUploadProps {
  onUploadComplete?: (message: string) => void;
  onUploadError?: (error: string) => void;
  category?: string;
}

export const SimpleImageUpload: React.FC<SimpleImageUploadProps> = ({
  onUploadComplete,
  onUploadError,
  category = "general",
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [imageData, setImageData] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const uploadPhoto = useMutation(api.gallery.uploadPublicPhoto);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      onUploadError?.('Please select an image file');
      return;
    }

    // Validate file size (10MB)
    if (file.size > 10 * 1024 * 1024) {
      onUploadError?.('File size must be less than 10MB');
      return;
    }

    // Create preview and convert to base64
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setPreviewUrl(result);
      setImageData(result);
    };
    reader.readAsDataURL(file);
  };

  const handleUpload = async () => {
    if (!imageData) {
      onUploadError?.('Please select an image first');
      return;
    }

    try {
      setIsUploading(true);
      
      await (uploadPhoto as any)({
        title: `Photo ${new Date().toLocaleDateString()}`,
        description: `Uploaded on ${new Date().toLocaleDateString()}`,
        imageUrl: imageData,
        category: category,
        tags: [category],
      });

      onUploadComplete?.('Image uploaded successfully!');
      setPreviewUrl(null);
      setImageData(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      console.error('Upload error:', error);
      onUploadError?.('Failed to upload image');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100"
      />

      {/* Preview */}
      {previewUrl && (
        <div className="space-y-4">
          <div className="border rounded-lg p-4">
            <img
              src={previewUrl}
              alt="Preview"
              className="max-w-full h-48 object-cover mx-auto rounded"
            />
          </div>
          
          {/* Upload Button */}
          <button
            onClick={handleUpload}
            disabled={isUploading}
            className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${
              isUploading
                ? 'bg-gray-400 text-white cursor-not-allowed'
                : 'bg-purple-600 text-white hover:bg-purple-700'
            }`}
          >
            {isUploading ? 'Uploading...' : 'Upload to Gallery'}
          </button>
        </div>
      )}

      {/* Instructions */}
      <div className="text-sm text-gray-500">
        <p>• Supported formats: JPG, PNG, GIF</p>
        <p>• Maximum file size: 10MB</p>
        <p>• Images will appear in the public gallery</p>
      </div>
    </div>
  );
};

export default SimpleImageUpload;
