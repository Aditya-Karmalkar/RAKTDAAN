import { useMutation } from 'convex/react';
import React, { useRef, useState } from 'react';
import { api } from '../../convex/_generated/api';

interface ImageUploadProps {
  onUploadComplete?: (fileInfo: { fileId: string; fileUrl: string; fileName: string }) => void;
  onUploadError?: (error: string) => void;
  category?: string;
  acceptedFileTypes?: string;
  maxFileSize?: number; // in MB
  className?: string;
  buttonText?: string;
  showPreview?: boolean;
}

export const ImageUpload: React.FC<ImageUploadProps> = ({
  onUploadComplete,
  onUploadError,
  category = "general",
  acceptedFileTypes = "image/*",
  maxFileSize = 10, // 10MB default
  className = "",
  buttonText = "Upload Image",
  showPreview = true,
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const generateUploadUrl = useMutation(api.fileStorage.generateUploadUrl);
  const storeFileMetadata = useMutation(api.fileStorage.storeFileMetadata);

  const handleFileSelect = (file: File) => {
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      onUploadError?.('Please select an image file');
      return;
    }

    // Validate file size
    if (file.size > maxFileSize * 1024 * 1024) {
      onUploadError?.(`File size must be less than ${maxFileSize}MB`);
      return;
    }

    uploadFile(file);
  };

  const uploadFile = async (file: File) => {
    try {
      setIsUploading(true);
      setUploadProgress(0);

      // Generate upload URL
      const uploadUrl = await generateUploadUrl();

      // Create preview
      if (showPreview) {
        const reader = new FileReader();
        reader.onload = (e) => setPreviewUrl(e.target?.result as string);
        reader.readAsDataURL(file);
      }

      // Upload file with progress tracking
      const xhr = new XMLHttpRequest();
      
      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable) {
          const progress = (e.loaded / e.total) * 100;
          setUploadProgress(progress);
        }
      });

      xhr.onload = async () => {
        if (xhr.status === 200) {
          try {
            const result = JSON.parse(xhr.responseText);
            const storageId = result.storageId;

            // Store file metadata
            const fileInfo = await storeFileMetadata({
              storageId,
              fileName: file.name,
              fileType: file.type,
              fileSize: file.size,
              category: category,
              title: file.name.split('.')[0], // Use filename without extension as title
              description: `Uploaded ${new Date().toLocaleDateString()}`,
            });

            onUploadComplete?.(fileInfo);
            setUploadProgress(100);
            
            setTimeout(() => {
              setIsUploading(false);
              setUploadProgress(0);
            }, 1000);
          } catch (error) {
            onUploadError?.('Failed to save file metadata');
            setIsUploading(false);
          }
        } else {
          onUploadError?.('Upload failed');
          setIsUploading(false);
        }
      };

      xhr.onerror = () => {
        onUploadError?.('Upload failed');
        setIsUploading(false);
      };

      // Prepare form data
      const formData = new FormData();
      formData.append('file', file);

      // Start upload
      xhr.open('POST', uploadUrl);
      xhr.send(formData);

    } catch (error) {
      console.error('Upload error:', error);
      onUploadError?.('Upload failed');
      setIsUploading(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className={`relative ${className}`}>
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept={acceptedFileTypes}
        onChange={handleFileInputChange}
        className="hidden"
      />

      {/* Upload area */}
      <div
        className={`
          border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-all duration-200
          ${dragOver 
            ? 'border-purple-400 bg-purple-50' 
            : 'border-gray-300 hover:border-purple-400 hover:bg-gray-50'
          }
          ${isUploading ? 'pointer-events-none opacity-50' : ''}
        `}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={triggerFileSelect}
      >
        {previewUrl && showPreview ? (
          <div className="space-y-4">
            <img
              src={previewUrl}
              alt="Preview"
              className="mx-auto h-32 w-auto rounded-lg object-cover"
            />
            {isUploading && (
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-purple-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {/* Upload icon */}
            <div className="mx-auto h-12 w-12 text-gray-400">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                />
              </svg>
            </div>

            {/* Upload text */}
            <div>
              <p className="text-lg font-medium text-gray-900">
                {isUploading ? 'Uploading...' : buttonText}
              </p>
              <p className="text-sm text-gray-500">
                Drag and drop or click to select
              </p>
              <p className="text-xs text-gray-400 mt-1">
                Max size: {maxFileSize}MB
              </p>
            </div>

            {/* Progress bar */}
            {isUploading && (
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-purple-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            )}
          </div>
        )}
      </div>

      {/* Upload status */}
      {isUploading && (
        <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-75 rounded-lg">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-2"></div>
            <p className="text-sm text-gray-600">Uploading... {Math.round(uploadProgress)}%</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageUpload;
