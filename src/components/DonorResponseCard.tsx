import React, { useState } from 'react';
import { useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { 
  Heart, 
  MapPin, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  TrendingUp,
  Users
} from 'lucide-react';

interface DonorResponseCardProps {
  alert: {
    _id: string;
    bloodGroup: string;
    urgency: string;
    unitsNeeded: number;
    location: string;
    description: string;
    expiresAt: number;
    priorityScore?: number;
    hospital: {
      name: string;
      location: string;
      contactPerson: string;
    };
  };
  donorId: string;
  onResponse: () => void;
}

export default function DonorResponseCard({ alert, donorId, onResponse }: DonorResponseCardProps) {
  const [isResponding, setIsResponding] = useState(false);
  const [responseStatus, setResponseStatus] = useState<'idle' | 'interested' | 'confirmed' | 'completed'>('idle');

  // Mutations
  const processResponse = useMutation(api.smartMatching.processDonorResponse);
  const updateAvailability = useMutation(api.smartMatching.updateDonorAvailability);

  const formatTimeRemaining = (milliseconds: number) => {
    const hours = Math.floor(milliseconds / (1000 * 60 * 60));
    const minutes = Math.floor((milliseconds % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 0) {
      return `${hours}h ${minutes}m remaining`;
    }
    return `${minutes}m remaining`;
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'critical':
        return 'text-red-600 bg-red-100 border-red-300';
      case 'urgent':
        return 'text-orange-600 bg-orange-100 border-orange-300';
      case 'normal':
        return 'text-green-600 bg-green-100 border-green-300';
      default:
        return 'text-gray-600 bg-gray-100 border-gray-300';
    }
  };

  const handleResponse = async (status: 'interested' | 'confirmed' | 'completed') => {
    setIsResponding(true);
    try {
      // Update donor availability
      await updateAvailability({
        donorId: donorId as any,
        available: true,
        responseTime: Date.now(),
      });

      // Process the response
      await processResponse({
        alertId: alert._id as any,
        donorId: donorId as any,
        status,
        notes: `Donor ${status} for ${alert.bloodGroup} blood request`,
      });

      setResponseStatus(status);
      onResponse();
    } catch (error) {
      console.error('Error processing response:', error);
    } finally {
      setIsResponding(false);
    }
  };

  const timeRemaining = alert.expiresAt - Date.now();
  const isExpired = timeRemaining <= 0;

  if (isExpired) {
    return (
      <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
        <div className="text-center text-gray-500">
          <Clock className="w-8 h-8 mx-auto mb-2" />
          <p>This SOS alert has expired</p>
        </div>
      </div>
    );
  }

  if (responseStatus !== 'idle') {
    return (
      <div className="border border-green-200 rounded-lg p-4 bg-green-50">
        <div className="text-center text-green-700">
          <CheckCircle className="w-8 h-8 mx-auto mb-2" />
          <p className="font-medium">Response Submitted!</p>
          <p className="text-sm">Status: {responseStatus}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getUrgencyColor(alert.urgency)}`}>
          {alert.urgency.toUpperCase()}
        </span>
        <span className="text-sm text-gray-500">
          {formatTimeRemaining(timeRemaining)}
        </span>
      </div>

      {/* Blood Group & Units */}
      <div className="flex items-center gap-3 mb-3">
        <Heart className="w-5 h-5 text-red-600" />
        <span className="text-lg font-bold text-gray-900">{alert.bloodGroup}</span>
        <span className="text-sm text-gray-600">({alert.unitsNeeded} units needed)</span>
      </div>

      {/* Location */}
      <div className="flex items-center gap-2 mb-3">
        <MapPin className="w-4 h-4 text-gray-500" />
        <span className="text-sm text-gray-700">{alert.location}</span>
      </div>

      {/* Description */}
      <p className="text-gray-700 mb-4 text-sm">{alert.description}</p>

      {/* Hospital Info */}
      <div className="bg-gray-50 rounded-lg p-3 mb-4">
        <div className="flex items-center gap-2 mb-2">
          <Users className="w-4 h-4 text-gray-500" />
          <span className="font-medium text-sm">{alert.hospital.name}</span>
        </div>
        <div className="text-xs text-gray-600">
          Contact: {alert.hospital.contactPerson}
        </div>
      </div>

      {/* Priority Score */}
      {alert.priorityScore && (
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="w-4 h-4 text-blue-500" />
          <span className="text-sm text-gray-600">
            Priority Score: <span className="font-medium">{alert.priorityScore}</span>
          </span>
        </div>
      )}

      {/* Response Buttons */}
      <div className="space-y-2">
        <button
          onClick={() => handleResponse('interested')}
          disabled={isResponding}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white py-2 rounded-md text-sm transition-colors flex items-center justify-center gap-2"
        >
          {isResponding ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              Processing...
            </>
          ) : (
            <>
              <CheckCircle className="w-4 h-4" />
              I'm Interested
            </>
          )}
        </button>
        
        <button
          onClick={() => handleResponse('confirmed')}
          disabled={isResponding}
          className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white py-2 rounded-md text-sm transition-colors flex items-center justify-center gap-2"
        >
          {isResponding ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              Processing...
            </>
          ) : (
            <>
              <CheckCircle className="w-4 h-4" />
              Confirm Availability
            </>
          )}
        </button>
      </div>

      {/* Smart Matching Info */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="text-xs text-gray-500 text-center">
          <p>Smart matching will prioritize you based on:</p>
          <p>• Proximity to hospital</p>
          <p>• Health status & availability</p>
          <p>• Response time & success rate</p>
        </div>
      </div>
    </div>
  );
}
