import React, { useState } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { 
  AlertTriangle, 
  Clock, 
  MapPin, 
  Users, 
  TrendingUp, 
  Target,
  Heart,
  CheckCircle,
  BarChart3,
  MessageSquare
} from 'lucide-react';
import ResponseManagementDashboard from './ResponseManagementDashboard';

interface SmartMatchingDashboardProps {
  hospitalId: string;
  hospitalData?: any; // Hospital object with location and other details
}

export default function SmartMatchingDashboard({ hospitalId, hospitalData }: SmartMatchingDashboardProps) {
  const [selectedAlert, setSelectedAlert] = useState<string | null>(null);
  const [showCreateAlert, setShowCreateAlert] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  // Form state - auto-fill hospital location if available
  const [formData, setFormData] = useState({
    bloodGroup: '',
    urgency: 'normal',
    unitsNeeded: 1,
    location: hospitalData?.location || '',
    targetArea: hospitalData?.location || '',
    radiusKm: 50,
    contactNumber: hospitalData?.phone || '',
    description: '',
    expiresInHours: 24
  });

  // Queries
  const urgentAlerts = useQuery(api.sosAlerts.getUrgentSOSAlerts);
  const activeAlerts = useQuery(api.sosAlerts.getActiveSOSAlerts, {});

  // Mutations
  const createAlert = useMutation(api.sosAlerts.createSOSAlert);

  // Form handlers
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'unitsNeeded' || name === 'radiusKm' || name === 'expiresInHours' 
        ? parseInt(value) || 0 
        : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Demo mode - show success message without actually creating
    if (!hospitalId) {
      alert('Demo Mode: SOS Alert would be created with the following details:\n\n' +
        `Blood Group: ${formData.bloodGroup}\n` +
        `Urgency: ${formData.urgency}\n` +
        `Units: ${formData.unitsNeeded}\n` +
        `Location: ${formData.location || 'Demo Location'}\n` +
        `Description: ${formData.description}\n\n` +
        'In production, this would trigger the smart matching system to find donors.');
      setShowCreateAlert(false);
      resetForm();
      return;
    }

    setIsCreating(true);
    try {
      await createAlert({
        hospitalId: hospitalId as any, // Type assertion for now
        ...formData
      });
      
      // Reset form and close modal
      setFormData({
        bloodGroup: '',
        urgency: 'normal',
        unitsNeeded: 1,
        location: '',
        targetArea: '',
        radiusKm: 50,
        contactNumber: '',
        description: '',
        expiresInHours: 24
      });
      setShowCreateAlert(false);
    } catch (error) {
      console.error('Failed to create alert:', error);
      alert('Failed to create SOS alert. Please try again.');
    } finally {
      setIsCreating(false);
    }
  };

  const resetForm = () => {
    setFormData({
      bloodGroup: '',
      urgency: 'normal',
      unitsNeeded: 1,
      location: hospitalData?.location || '',
      targetArea: hospitalData?.location || '',
      radiusKm: 50,
      contactNumber: hospitalData?.phone || '',
      description: '',
      expiresInHours: 24
    });
  };

  // Show message if no hospital ID (for testing/demo purposes)
  if (!hospitalId) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 max-w-md text-center">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">🧠</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Smart Matching Dashboard</h1>
          <p className="text-gray-600 mb-4">
            This dashboard is designed for hospital users to manage SOS alerts with AI-powered donor matching.
          </p>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-left">
            <h3 className="font-semibold text-blue-900 mb-2">Features:</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Priority-based alert scoring</li>
              <li>• AI-powered donor matching</li>
              <li>• Real-time response tracking</li>
              <li>• Smart analytics & insights</li>
            </ul>
          </div>
          <p className="text-sm text-gray-500 mt-4">
            To access full functionality, please log in as a hospital user or create a hospital account.
          </p>
          <div className="mt-4 space-y-2">
            <button
              onClick={() => setShowCreateAlert(true)}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Try Creating Alert (Demo Mode)
            </button>
          </div>
        </div>
      </div>
    );
  }

  const formatTimeRemaining = (milliseconds: number) => {
    const hours = Math.floor(milliseconds / (1000 * 60 * 60));
    const minutes = Math.floor((milliseconds % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Smart Matching Dashboard</h1>
            <p className="text-gray-600 mt-1">
              AI-powered donor matching for faster emergency response
            </p>
          </div>
          <button
            onClick={() => setShowCreateAlert(true)}
            disabled={!hospitalId}
            className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-colors ${
              hospitalId 
                ? 'bg-red-600 hover:bg-red-700 text-white' 
                : 'bg-gray-400 text-gray-200 cursor-not-allowed'
            }`}
          >
            <AlertTriangle className="w-5 h-5" />
            Create SOS Alert
          </button>
        </div>
      </div>

      {/* Urgent Alerts Section */}
      {urgentAlerts && urgentAlerts.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <div className="flex items-center gap-3 mb-4">
            <AlertTriangle className="w-6 h-6 text-red-600" />
            <h2 className="text-xl font-semibold text-red-900">Urgent Alerts Requiring Attention</h2>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {urgentAlerts.map((alert) => (
              <div key={alert._id} className="bg-white rounded-lg border border-red-300 p-4">
                <div className="flex items-center justify-between mb-3">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getUrgencyColor(alert.urgency)}`}>
                    {alert.urgency.toUpperCase()}
                  </span>
                  <span className="text-sm text-red-600 font-medium">
                    {formatTimeRemaining(alert.timeUntilExpiry)}
                  </span>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Heart className="w-4 h-4 text-red-600" />
                    <span className="font-medium">{alert.bloodGroup}</span>
                    <span className="text-sm text-gray-600">({alert.unitsNeeded} units)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-gray-500" />
                    <span className="text-sm text-gray-700">{alert.location}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-gray-500" />
                    <span className="text-sm text-gray-700">{alert.donorCount} donors matched</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-gray-500" />
                    <span className="text-sm text-gray-700">Score: {alert.priorityScore || 0}</span>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedAlert(alert._id)}
                  className="w-full mt-3 bg-red-600 hover:bg-red-700 text-white py-2 rounded-md text-sm transition-colors"
                >
                  View Details
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Active Alerts Grid */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Active SOS Alerts</h2>
        </div>
        <div className="p-6">
          {activeAlerts && activeAlerts.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {activeAlerts.map((alert) => (
                <div key={alert._id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getUrgencyColor(alert.urgency)}`}>
                      {alert.urgency.toUpperCase()}
                    </span>
                    <span className="text-sm text-gray-500">
                      {formatTimeRemaining(alert.timeUntilExpiry)}
                    </span>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Heart className="w-4 h-4 text-red-600" />
                      <span className="font-medium">{alert.bloodGroup}</span>
                      <span className="text-sm text-gray-600">({alert.unitsNeeded} units)</span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-gray-500" />
                      <span className="text-sm text-gray-700">{alert.location}</span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-gray-500" />
                      <span className="text-sm text-gray-700">{alert.donorCount} donors matched</span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-gray-500" />
                      <span className="text-sm text-gray-700">Score: {alert.priorityScore || 0}</span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Target className="w-4 h-4 text-gray-500" />
                      <span className="text-sm text-gray-700">{alert.hospital.name}</span>
                    </div>
                  </div>
                  
                                     <div className="flex gap-2 mt-4">
                     <button
                       onClick={() => setSelectedAlert(alert._id)}
                       className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-md text-sm transition-colors"
                     >
                       View Details
                     </button>
                     <button
                       onClick={() => setSelectedAlert(alert._id)}
                       className="px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md text-sm transition-colors flex items-center gap-1"
                       title="Manage Responses"
                     >
                       <MessageSquare className="w-4 h-4" />
                       Responses
                     </button>
                   </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <AlertTriangle className="w-12 h-12 mx-auto mb-3 text-gray-400" />
              <p>No active SOS alerts found</p>
            </div>
          )}
        </div>
      </div>

      {/* Create Alert Modal with Form */}
      {showCreateAlert && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold">
                Create New SOS Alert
                {!hospitalId && <span className="text-sm text-blue-600 ml-2">(Demo Mode)</span>}
              </h3>
              <button
                onClick={() => {
                  setShowCreateAlert(false);
                  resetForm();
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-blue-800">
                <strong>Smart matching will automatically find the best donors based on:</strong><br/>
                • Blood group compatibility • Health status and availability • Proximity and response time • Historical success rate
              </p>
            </div>
            
            {hospitalData?.location && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                <p className="text-sm text-green-800">
                  <strong>✓ Auto-fill enabled:</strong> Your hospital location and contact details have been automatically filled from your profile to ensure accuracy and save time.
                </p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Blood Group */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Blood Group Required *
                  </label>
                  <select
                    name="bloodGroup"
                    value={formData.bloodGroup}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  >
                    <option value="">Select Blood Group</option>
                    <option value="A+">A+</option>
                    <option value="A-">A-</option>
                    <option value="B+">B+</option>
                    <option value="B-">B-</option>
                    <option value="AB+">AB+</option>
                    <option value="AB-">AB-</option>
                    <option value="O+">O+</option>
                    <option value="O-">O-</option>
                  </select>
                </div>

                {/* Urgency Level */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Urgency Level *
                  </label>
                  <select
                    name="urgency"
                    value={formData.urgency}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  >
                    <option value="normal">Normal</option>
                    <option value="urgent">Urgent</option>
                    <option value="critical">Critical</option>
                  </select>
                </div>

                {/* Units Needed */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Units Needed *
                  </label>
                  <input
                    type="number"
                    name="unitsNeeded"
                    value={formData.unitsNeeded}
                    onChange={handleInputChange}
                    min="1"
                    max="100"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  />
                </div>

                {/* Expiry Time */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Expires In (Hours) *
                  </label>
                  <input
                    type="number"
                    name="expiresInHours"
                    value={formData.expiresInHours}
                    onChange={handleInputChange}
                    min="1"
                    max="168"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  />
                </div>
              </div>

              {/* Location */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Hospital Location *
                  {hospitalData?.location && (
                    <span className="text-xs text-green-600 ml-2">(Auto-filled from your profile)</span>
                  )}
                </label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  placeholder="e.g., Mumbai, Maharashtra"
                  required
                  readOnly={!!hospitalData?.location}
                  className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 ${
                    hospitalData?.location ? 'bg-gray-50 text-gray-600 cursor-not-allowed' : ''
                  }`}
                />
                {hospitalData?.location && (
                  <p className="text-xs text-green-600 mt-1">
                    Location automatically filled from your hospital profile. Contact admin if you need to update this.
                  </p>
                )}
              </div>

              {/* Target Area */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Target Area (Optional)
                </label>
                <input
                  type="text"
                  name="targetArea"
                  value={formData.targetArea}
                  onChange={handleInputChange}
                  placeholder="e.g., Andheri West, Bandra East"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                />
              </div>

              {/* Radius */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Search Radius (km)
                </label>
                <input
                  type="number"
                  name="radiusKm"
                  value={formData.radiusKm}
                  onChange={handleInputChange}
                  min="5"
                  max="200"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                />
              </div>

              {/* Contact Number */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Contact Number *
                  {hospitalData?.phone && (
                    <span className="text-xs text-green-600 ml-2">(Auto-filled from your profile)</span>
                  )}
                </label>
                <input
                  type="tel"
                  name="contactNumber"
                  value={formData.contactNumber}
                  onChange={handleInputChange}
                  placeholder="e.g., +91 98765 43210"
                  required
                  readOnly={!!hospitalData?.phone}
                  className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 ${
                    hospitalData?.phone ? 'bg-gray-50 text-gray-600 cursor-not-allowed' : ''
                  }`}
                />
                {hospitalData?.phone && (
                  <p className="text-xs text-green-600 mt-1">
                    Contact number automatically filled from your hospital profile. Contact admin if you need to update this.
                  </p>
                )}
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description *
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={3}
                  placeholder="Describe the emergency situation, patient details, or any special requirements..."
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                />
              </div>

              {/* Form Actions */}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateAlert(false);
                    resetForm();
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
                  disabled={isCreating}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreating}
                  className="flex-1 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white px-4 py-2 rounded-md transition-colors flex items-center justify-center gap-2"
                >
                  {isCreating ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Creating...
                    </>
                  ) : (
                    <>
                      <AlertTriangle className="w-4 h-4" />
                      Create SOS Alert
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Response Management Modal */}
      {selectedAlert && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-7xl mx-4 max-h-[95vh] overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-xl font-semibold">Response Management Dashboard</h3>
              <button
                onClick={() => setSelectedAlert(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            <div className="overflow-y-auto max-h-[calc(95vh-80px)]">
              <ResponseManagementDashboard 
                alertId={selectedAlert} 
                hospitalId={hospitalId} 
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
