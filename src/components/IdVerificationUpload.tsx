import { useMutation } from 'convex/react';
import React, { useRef, useState } from 'react';
import { api } from '../../convex/_generated/api';
import type { Id } from '../../convex/_generated/dataModel';

interface IdVerificationUploadProps {
  donorId: Id<'donors'>;
  onUploadComplete?: (fileInfo: { verificationId: string; fileUrl: string; fileName: string }) => void;
  onUploadError?: (error: string) => void;
  className?: string;
  currentVerification?: any;
}

export const IdVerificationUpload: React.FC<IdVerificationUploadProps> = ({
  donorId,
  onUploadComplete,
  onUploadError,
  className = "",
  currentVerification,
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedIdType, setSelectedIdType] = useState<string>(currentVerification?.idType || 'aadhar');
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const generateUploadUrl = useMutation(api.fileStorage.generateUploadUrl);
  const uploadIdDocument = useMutation(api.fileStorage.uploadIdDocument);

  const idTypes = [
    { value: 'aadhar', label: 'Aadhar Card', icon: '🆔' },
    { value: 'pan', label: 'PAN Card', icon: '💳' },
    { value: 'voter', label: 'Voter ID', icon: '🗳️' },
    { value: 'passport', label: 'Passport', icon: '📘' },
    { value: 'driving_license', label: 'Driving License', icon: '🚗' },
  ];

  const handleFileSelect = (file: File) => {
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      onUploadError?.('Please select an image file');
      return;
    }

    // Validate file size (5MB max for ID documents)
    if (file.size > 5 * 1024 * 1024) {
      onUploadError?.('File size must be less than 5MB');
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
      const reader = new FileReader();
      reader.onload = (e) => setPreviewUrl(e.target?.result as string);
      reader.readAsDataURL(file);

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

            // Upload ID document
            const fileInfo = await uploadIdDocument({
              storageId,
              fileName: file.name,
              fileType: file.type,
              fileSize: file.size,
              idType: selectedIdType,
              donorId,
            });

            onUploadComplete?.(fileInfo);
            setUploadProgress(100);
            
            setTimeout(() => {
              setIsUploading(false);
              setUploadProgress(0);
            }, 1000);
          } catch (error) {
            onUploadError?.('Failed to save ID document');
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
    <div className={`space-y-4 ${className}`}>
      {/* ID Type Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Select ID Document Type
        </label>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {idTypes.map((type) => (
            <button
              key={type.value}
              onClick={() => setSelectedIdType(type.value)}
              className={`p-3 rounded-lg border-2 text-left transition-all ${
                selectedIdType === type.value
                  ? 'border-purple-500 bg-purple-50 text-purple-700'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center space-x-2">
                <span className="text-lg">{type.icon}</span>
                <span className="text-sm font-medium">{type.label}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Current Verification Status */}
      {currentVerification && (
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Current Status:</p>
              <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                currentVerification.status === 'approved' 
                  ? 'bg-green-100 text-green-800'
                  : currentVerification.status === 'rejected'
                  ? 'bg-red-100 text-red-800'
                  : 'bg-yellow-100 text-yellow-800'
              }`}>
                {currentVerification.status || 'Pending'}
              </span>
            </div>
            {currentVerification.idImageUrl && (
              <img 
                src={currentVerification.idImageUrl} 
                alt="Current ID"
                className="w-12 h-12 object-cover rounded border"
              />
            )}
          </div>
        </div>
      )}

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
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
        {previewUrl ? (
          <div className="space-y-4">
            <img
              src={previewUrl}
              alt="ID Document Preview"
              className="mx-auto h-32 w-auto rounded-lg object-cover border"
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
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>

            {/* Upload text */}
            <div>
              <p className="text-lg font-medium text-gray-900">
                {isUploading ? 'Uploading ID Document...' : `Upload ${idTypes.find(t => t.value === selectedIdType)?.label}`}
              </p>
              <p className="text-sm text-gray-500">
                Drag and drop or click to select
              </p>
              <p className="text-xs text-gray-400 mt-1">
                Max size: 5MB • JPG, PNG formats
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

      {/* Guidelines */}
      <div className="bg-blue-50 rounded-lg p-4">
        <h4 className="text-sm font-semibold text-blue-900 mb-2">📝 Upload Guidelines</h4>
        <ul className="text-xs text-blue-700 space-y-1">
          <li>• Ensure the document is clear and readable</li>
          <li>• All corners of the document should be visible</li>
          <li>• Avoid glare or shadows on the document</li>
          <li>• File size should be under 5MB</li>
          <li>• Supported formats: JPG, PNG</li>
        </ul>
      </div>
    </div>
  );
};

export default IdVerificationUpload;
