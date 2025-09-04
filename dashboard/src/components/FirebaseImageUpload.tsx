import React, { useState, useRef } from 'react';
import { Upload, Image, X, Check } from 'lucide-react';
import { uploadImage } from '../firebase/gallery';
import { useNotifications } from '../hooks/useNotifications';

interface FirebaseImageUploadProps {
  category?: string;
  onUploadComplete?: (imageId: string, imageUrl: string) => void;
  onUploadError?: (error: string) => void;
  currentUser: {
    id: string;
    name: string;
    email?: string;
  };
  maxFileSize?: number; // in MB
  allowedTypes?: string[];
  showPreview?: boolean;
  className?: string;
}

const FirebaseImageUpload: React.FC<FirebaseImageUploadProps> = ({
  category = 'general',
  onUploadComplete,
  onUploadError,
  currentUser,
  maxFileSize = 10,
  allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  showPreview = true,
  className = '',
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState('');
  const [isDragOver, setIsDragOver] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { showSuccess, showError, showInfo } = useNotifications();

  // Handle file selection
  const handleFileSelect = (file: File) => {
    // Validate file type
    if (!allowedTypes.includes(file.type)) {
      const error = `Please select a valid image file (${allowedTypes.join(', ')})`;
      showError('Invalid File Type', error);
      onUploadError?.(error);
      return;
    }

    // Validate file size
    if (file.size > maxFileSize * 1024 * 1024) {
      const error = `File size must be less than ${maxFileSize}MB`;
      showError('File Too Large', error);
      onUploadError?.(error);
      return;
    }

    setSelectedFile(file);
    
    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreviewUrl(e.target?.result as string);
    };
    reader.readAsDataURL(file);

    // Auto-generate title from filename
    if (!title) {
      const fileName = file.name.split('.')[0];
      setTitle(fileName.replace(/[-_]/g, ' '));
    }
  };

  // Handle drag and drop
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  // Handle file input change
  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  // Handle upload
  const handleUpload = async () => {
    if (!selectedFile || !title.trim()) {
      showError('Missing Information', 'Please select a file and enter a title');
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      showInfo('Upload Started', 'Your image is being uploaded...');
      
      const tagsArray = tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0);
      
      const imageId = await uploadImage(
        selectedFile,
        {
          title: title.trim(),
          description: description.trim() || undefined,
          category,
          tags: tagsArray,
          uploadedBy: currentUser.id,
          uploaderName: currentUser.name,
        },
        (progress) => {
          setUploadProgress(progress);
        }
      );

      showSuccess('Upload Complete!', 'Your image has been uploaded to the gallery successfully!');
      onUploadComplete?.(imageId, previewUrl || '');
      
      // Reset form
      setSelectedFile(null);
      setPreviewUrl(null);
      setTitle('');
      setDescription('');
      setTags('');
      setUploadProgress(0);
      
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      
    } catch (error) {
      console.error('Upload error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to upload image';
      showError('Upload Failed', errorMessage);
      onUploadError?.(errorMessage);
    } finally {
      setIsUploading(false);
    }
  };

  // Clear selection
  const handleClear = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setTitle('');
    setDescription('');
    setTags('');
    setUploadProgress(0);
    
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* File Drop Zone */}
      <div
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          isDragOver
            ? 'border-blue-500 bg-blue-50'
            : selectedFile
            ? 'border-green-500 bg-green-50'
            : 'border-gray-300 bg-gray-50 hover:bg-gray-100'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={allowedTypes.join(',')}
          onChange={handleFileInputChange}
          className="hidden"
          disabled={isUploading}
        />

        {selectedFile ? (
          <div className="space-y-4">
            <div className="flex items-center justify-center">
              <Check className="w-12 h-12 text-green-500" />
            </div>
            <div>
              <p className="text-lg font-semibold text-green-700">File Selected</p>
              <p className="text-sm text-gray-600">{selectedFile.name}</p>
              <p className="text-xs text-gray-500">
                {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-center">
              <Upload className="w-12 h-12 text-gray-400" />
            </div>
            <div>
              <p className="text-lg font-semibold text-gray-700">
                {isDragOver ? 'Drop your image here' : 'Drag & drop an image'}
              </p>
              <p className="text-sm text-gray-500">or click to browse</p>
            </div>
          </div>
        )}

        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          className="mt-4 px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {selectedFile ? 'Choose Different File' : 'Select File'}
        </button>
      </div>

      {/* Preview and Form */}
      {selectedFile && showPreview && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Image Preview */}
          <div className="space-y-4">
            <h4 className="font-semibold text-gray-900">Preview</h4>
            {previewUrl && (
              <div className="relative">
                <img
                  src={previewUrl}
                  alt="Preview"
                  className="w-full h-64 object-cover rounded-lg border border-gray-200"
                />
                <button
                  onClick={handleClear}
                  className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                  title="Remove image"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          {/* Upload Form */}
          <div className="space-y-4">
            <h4 className="font-semibold text-gray-900">Image Details</h4>
            
            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Title *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter image title"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                disabled={isUploading}
                maxLength={100}
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Enter image description"
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none"
                disabled={isUploading}
                maxLength={500}
              />
            </div>

            {/* Tags */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tags
              </label>
              <input
                type="text"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="Enter tags separated by commas"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                disabled={isUploading}
              />
              <p className="text-xs text-gray-500 mt-1">
                Example: event, blood donation, community
              </p>
            </div>

            {/* Category Display */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category
              </label>
              <div className="px-3 py-2 bg-gray-100 rounded-lg text-gray-700 capitalize">
                {category}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Upload Progress */}
      {isUploading && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Uploading...</span>
            <span className="text-gray-600">{Math.round(uploadProgress)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
        </div>
      )}

      {/* Action Buttons */}
      {selectedFile && (
        <div className="flex space-x-3">
          <button
            onClick={handleUpload}
            disabled={isUploading || !title.trim()}
            className={`flex-1 py-3 px-4 rounded-lg font-medium transition-colors ${
              isUploading || !title.trim()
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-gradient-to-r from-green-500 to-blue-500 text-white hover:from-green-600 hover:to-blue-600'
            }`}
          >
            {isUploading ? (
              <div className="flex items-center justify-center">
                <div className="w-5 h-5 animate-spin rounded-full border-2 border-white border-t-transparent mr-2"></div>
                Uploading...
              </div>
            ) : (
              'Upload to Gallery'
            )}
          </button>

          <button
            onClick={handleClear}
            disabled={isUploading}
            className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Clear
          </button>
        </div>
      )}

      {/* File Info */}
      <div className="text-xs text-gray-500 space-y-1">
        <p>• Supported formats: {allowedTypes.join(', ')}</p>
        <p>• Maximum file size: {maxFileSize}MB</p>
        <p>• Images will be visible in the public gallery</p>
      </div>
    </div>
  );
};

export default FirebaseImageUpload;
