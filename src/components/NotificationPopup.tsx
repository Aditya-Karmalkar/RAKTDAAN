import React, { useEffect, useState } from 'react';
import { X, CheckCircle, AlertTriangle, Info, XCircle } from 'lucide-react';

export type NotificationType = 'success' | 'error' | 'warning' | 'info';

export interface NotificationData {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  duration?: number; // in milliseconds, default 3000
  autoClose?: boolean;
}

interface NotificationPopupProps {
  notification: NotificationData | null;
  onClose: (id: string) => void;
}

const NotificationPopup: React.FC<NotificationPopupProps> = ({ 
  notification, 
  onClose 
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (notification) {
      setIsVisible(true);
      setIsAnimating(true);
      
      // Auto close after duration
      if (notification.autoClose !== false) {
        const duration = notification.duration || 3000;
        const timer = setTimeout(() => {
          handleClose();
        }, duration);
        
        return () => clearTimeout(timer);
      }
    }
  }, [notification]);

  const handleClose = () => {
    setIsAnimating(false);
    setTimeout(() => {
      setIsVisible(false);
      if (notification) {
        onClose(notification.id);
      }
    }, 300); // Animation duration
  };

  const getIcon = (type: NotificationType) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-6 h-6 text-green-500" />;
      case 'error':
        return <XCircle className="w-6 h-6 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="w-6 h-6 text-yellow-500" />;
      case 'info':
        return <Info className="w-6 h-6 text-blue-500" />;
      default:
        return <Info className="w-6 h-6 text-blue-500" />;
    }
  };

  const getBackgroundColor = (type: NotificationType) => {
    switch (type) {
      case 'success':
        return 'bg-green-50 border-green-200';
      case 'error':
        return 'bg-red-50 border-red-200';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200';
      case 'info':
        return 'bg-blue-50 border-blue-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  if (!isVisible || !notification) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
      {/* Backdrop */}
      <div 
        className={`absolute inset-0 bg-black transition-opacity duration-300 ${
          isAnimating ? 'bg-opacity-20' : 'bg-opacity-0'
        }`}
      />
      
      {/* Notification Card */}
      <div 
        className={`relative bg-white rounded-lg shadow-2xl border-2 max-w-md w-full mx-4 pointer-events-auto transform transition-all duration-300 ${
          isAnimating ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
        } ${getBackgroundColor(notification.type)}`}
      >
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 transition-colors z-10"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Content */}
        <div className="p-6">
          <div className="flex items-start space-x-4">
            {/* Icon */}
            <div className="flex-shrink-0 mt-1">
              {getIcon(notification.type)}
            </div>
            
            {/* Text Content */}
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-semibold text-gray-900 mb-1">
                {notification.title}
              </h3>
              <p className="text-gray-700 text-sm leading-relaxed">
                {notification.message}
              </p>
            </div>
          </div>

          {/* Progress Bar (if auto-close) */}
          {notification.autoClose !== false && (
            <div className="mt-4">
              <div className="w-full bg-gray-200 rounded-full h-1">
                <div 
                  className={`h-1 rounded-full transition-all ease-linear animate-shrink ${
                    notification.type === 'success' ? 'bg-green-500' :
                    notification.type === 'error' ? 'bg-red-500' :
                    notification.type === 'warning' ? 'bg-yellow-500' :
                    'bg-blue-500'
                  }`}
                  style={{
                    animationDuration: `${notification.duration || 3000}ms`
                  }}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NotificationPopup;
