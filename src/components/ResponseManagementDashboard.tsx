import React, { useState, useEffect } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { 
  Users, 
  Clock, 
  MapPin, 
  TrendingUp, 
  CheckCircle, 
  XCircle, 
  Pause,
  AlertTriangle,
  RefreshCw,
  BarChart3,
  MessageSquare,
  Phone
} from 'lucide-react';

interface ResponseManagementDashboardProps {
  alertId: string;
  hospitalId: string;
}

export default function ResponseManagementDashboard({ alertId, hospitalId }: ResponseManagementDashboardProps) {
  const [selectedResponse, setSelectedResponse] = useState<string | null>(null);
  const [actionNotes, setActionNotes] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'responses' | 'analytics' | 'unavailability'>('overview');
  const [showResponseModal, setShowResponseModal] = useState(false);
  const [showUnavailabilityModal, setShowUnavailabilityModal] = useState(false);
  const [unavailabilityData, setUnavailabilityData] = useState({
    reason: "",
    notes: "",
  });

  // Queries
  const alertDetails = useQuery(api.sosAlerts.getSOSAlertDetails, { alertId: alertId as any });
  const responseAnalytics = useQuery(api.smartMatching.getResponseAnalytics, { alertId: alertId as any });
  const availabilityUpdates = useQuery(api.smartMatching.getDonorAvailabilityUpdates, { alertId: alertId as any });

  // Mutations
  const manageResponse = useMutation(api.smartMatching.manageDonorResponses);
  const updateRankings = useMutation(api.smartMatching.updateResponseRankings);
  const handleUnavailability = useMutation(api.smartMatching.handleDonorUnavailability);

  // Auto-refresh rankings every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      if (alertId) {
        updateRankings({ alertId: alertId as any });
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [alertId, updateRankings]);

  const handleResponseAction = async (action: 'accept' | 'reject' | 'hold' | 'complete', donorId: string) => {
    if (!selectedResponse) return;

    setIsProcessing(true);
    try {
      await manageResponse({
        alertId: alertId as any,
        action,
        donorId: donorId as any,
        notes: actionNotes,
      });

      setActionNotes('');
      setSelectedResponse(null);
      
      // Refresh data
      window.location.reload();
    } catch (error) {
      console.error('Failed to manage response:', error);
      alert('Failed to process response. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDonorUnavailability = async (donorId: string, reason: string, notes?: string) => {
    try {
      await manageDonorResponses({
        alertId: alertId as any,
        action: "unavailable" as any,
        donorId: donorId as any,
        notes: `${reason}: ${notes || ""}`,
      });
      
      // Close modal and refresh data
      setShowUnavailabilityModal(false);
      setUnavailabilityData({ reason: "", notes: "" });
      
      // Show success message
      alert("Donor unavailability handled. System will automatically find replacement donors.");
    } catch (error) {
      console.error("Error handling donor unavailability:", error);
      alert("Error handling donor unavailability. Please try again.");
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'accepted': return 'text-green-600 bg-green-100 border-green-300';
      case 'rejected': return 'text-red-600 bg-red-100 border-red-300';
      case 'on_hold': return 'text-yellow-600 bg-yellow-100 border-yellow-300';
      case 'completed': return 'text-blue-600 bg-blue-100 border-blue-300';
      case 'alert_fulfilled': return 'text-gray-600 bg-gray-100 border-gray-300';
      default: return 'text-blue-600 bg-blue-100 border-blue-300';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'accepted': return <CheckCircle className="w-4 h-4" />;
      case 'rejected': return <XCircle className="w-4 h-4" />;
      case 'on_hold': return <Pause className="w-4 h-4" />;
      case 'completed': return <CheckCircle className="w-4 h-4" />;
      case 'alert_fulfilled': return <AlertTriangle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  if (!alertDetails || !responseAnalytics) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Response Management</h1>
            <p className="text-gray-600 mt-1">
              Managing {responseAnalytics.totalResponses} donor responses for {alertDetails.alert.bloodGroup} blood request
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => updateRankings({ alertId: alertId as any })}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Update Rankings
            </button>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {[
              { id: 'overview', label: 'Overview', icon: BarChart3 },
              { id: 'responses', label: 'All Responses', icon: Users },
              { id: 'analytics', label: 'Analytics', icon: TrendingUp },
              { id: 'unavailability', label: 'Donor Unavailability', icon: AlertTriangle },
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>

        <div className="p-6">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Response Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-blue-600">Total Responses</p>
                      <p className="text-2xl font-bold text-blue-900">{responseAnalytics.totalResponses}</p>
                    </div>
                    <Users className="w-8 h-8 text-blue-600" />
                  </div>
                </div>

                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-green-600">Top Score</p>
                      <p className="text-2xl font-bold text-green-900">
                        {responseAnalytics.topResponders[0]?.matchScore || 0}
                      </p>
                    </div>
                    <TrendingUp className="w-8 h-8 text-green-600" />
                  </div>
                </div>

                <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-orange-600">Avg Response Time</p>
                      <p className="text-2xl font-bold text-orange-900">
                        {responseAnalytics.averageResponseTime}m
                      </p>
                    </div>
                    <Clock className="w-8 h-8 text-orange-600" />
                  </div>
                </div>

                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-purple-600">Status</p>
                      <p className="text-lg font-bold text-purple-900 capitalize">
                        {responseAnalytics.fulfillmentStatus.replace('_', ' ')}
                      </p>
                    </div>
                    <CheckCircle className="w-8 h-8 text-purple-600" />
                  </div>
                </div>
              </div>

              {/* Top Responders */}
              <div className="bg-white border border-gray-200 rounded-lg">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900">Top 5 Responders</h3>
                </div>
                <div className="p-6">
                  <div className="space-y-3">
                    {responseAnalytics.topResponders.map((responder, index) => (
                      <div key={responder.donorId} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                            {index + 1}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{responder.name}</p>
                            <p className="text-sm text-gray-600">Score: {responder.matchScore}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(responder.status)}`}>
                            {responder.status.replace('_', ' ')}
                          </span>
                          <button
                            onClick={() => setSelectedResponse(responder.donorId)}
                            className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 transition-colors"
                          >
                            Manage
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Response Timeline */}
              <div className="bg-white border border-gray-200 rounded-lg">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900">Response Timeline</h3>
                </div>
                <div className="p-6">
                  <div className="space-y-3">
                    {responseAnalytics.responseTimeline.slice(0, 10).map((response) => (
                      <div key={response.donorId} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                            {getStatusIcon(response.status)}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{response.donorName}</p>
                            <p className="text-sm text-gray-600">
                              Rank #{response.priorityRank} • Score: {response.matchScore}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-600">
                            {new Date(response.responseTime).toLocaleTimeString()}
                          </p>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(response.status)}`}>
                            {response.status.replace('_', ' ')}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Top 3 Recommended Donors */}
              <div className="bg-white border border-gray-200 rounded-lg">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900">Top 3 Recommended Donors</h3>
                </div>
                <div className="p-6">
                  <div className="space-y-3">
                    {alertDetails.topDonors.map((d, idx) => (
                      <div key={d.donorId} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                            {idx + 1}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{d.name}</p>
                            <p className="text-sm text-gray-600">
                              Score: {d.matchScore} • Travel: {d.estimatedTravelTime}m • {d.location}
                            </p>
                          </div>
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium border ${d.availability ? 'text-green-600 bg-green-100 border-green-300' : 'text-gray-600 bg-gray-100 border-gray-300'}`}>
                          {d.availability ? 'Available' : 'Unavailable'}
                        </span>
                      </div>
                    ))}
                    {alertDetails.topDonors.length === 0 && (
                      <div className="text-sm text-gray-500">No recommendations yet.</div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Responses Tab */}
          {activeTab === 'responses' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">All Donor Responses</h3>
                <div className="text-sm text-gray-600">
                  Showing {responseAnalytics.totalResponses} responses
                </div>
              </div>

              <div className="space-y-3">
                {responseAnalytics.responseTimeline.map((response) => (
                  <div key={response.donorId} className="bg-white border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-blue-600 font-bold text-lg">
                            {response.priorityRank}
                          </span>
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900">{response.donorName}</h4>
                          <p className="text-sm text-gray-600">
                            Responded at {new Date(response.responseTime).toLocaleString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(response.status)}`}>
                          {response.status.replace('_', ' ')}
                        </span>
                        <button
                          onClick={() => setSelectedResponse(response.donorId)}
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                          Manage
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-gray-600">Match Score</p>
                        <p className="font-semibold text-gray-900">{response.matchScore}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Priority Rank</p>
                        <p className="font-semibold text-gray-900">#{response.priorityRank}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Response Time</p>
                        <p className="font-semibold text-gray-900">
                          {new Date(response.responseTime).toLocaleTimeString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-600">Status</p>
                        <p className="font-semibold text-gray-900 capitalize">
                          {response.status.replace('_', ' ')}
                        </p>
                      </div>
                    </div>

                    {response.hospitalNotes && (
                      <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-700">
                          <strong>Hospital Notes:</strong> {response.hospitalNotes}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Analytics Tab */}
          {activeTab === 'analytics' && (
            <div className="space-y-6">
              {/* Response Breakdown */}
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Response Breakdown</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {Object.entries(responseAnalytics.responseBreakdown).map(([status, count]) => (
                    <div key={status} className="text-center p-4 bg-gray-50 rounded-lg">
                      <p className="text-2xl font-bold text-gray-900">{count}</p>
                      <p className="text-sm text-gray-600 capitalize">
                        {status.replace('_', ' ')}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Performance Metrics */}
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Metrics</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-gray-700">Average Response Time</span>
                    <span className="font-semibold">{responseAnalytics.averageResponseTime} minutes</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-gray-700">Estimated Completion Time</span>
                    <span className="font-semibold">{responseAnalytics.estimatedCompletionTime} minutes</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-gray-700">Fulfillment Status</span>
                    <span className="font-semibold capitalize">
                      {responseAnalytics.fulfillmentStatus.replace('_', ' ')}
                    </span>
                  </div>
                </div>
              </div>

              {/* Real-time Updates */}
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Real-time Availability Updates</h3>
                <div className="space-y-3">
                  {availabilityUpdates?.map((update) => (
                    <div key={update.donorId} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className={`w-3 h-3 rounded-full ${update.availability ? 'bg-green-500' : 'bg-red-500'}`}></div>
                        <div>
                          <p className="font-medium text-gray-900">{update.name}</p>
                          <p className="text-sm text-gray-600">
                            Travel time: {update.estimatedTravelTime} min
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-600">
                          {new Date(update.lastUpdate).toLocaleTimeString()}
                        </p>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(update.status)}`}>
                          {update.status.replace('_', ' ')}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Donor Unavailability Tab */}
          {activeTab === 'unavailability' && (
            <div className="space-y-6">
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-yellow-800 mb-2">
                  Donor Unavailability Management
                </h3>
                <p className="text-yellow-700">
                  Handle cases where confirmed donors become unavailable. The system will automatically find replacement donors.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-lg shadow-sm border">
                  <h4 className="text-lg font-semibold text-gray-800 mb-2">Unavailable Donors</h4>
                  <p className="text-3xl font-bold text-red-600">
                    {responseAnalytics?.responseBreakdown?.unavailable || 0}
                  </p>
                  <p className="text-sm text-gray-600 mt-1">Need replacement</p>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-sm border">
                  <h4 className="text-lg font-semibold text-gray-800 mb-2">Replacement Success</h4>
                  <p className="text-3xl font-bold text-green-600">
                    {responseAnalytics?.responseBreakdown?.accepted || 0}
                  </p>
                  <p className="text-sm text-gray-600 mt-1">Successfully replaced</p>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-sm border">
                  <h4 className="text-lg font-semibold text-gray-800 mb-2">Escalated Alerts</h4>
                  <p className="text-3xl font-bold text-orange-600">
                    {alertDetails.alert?.status === "escalated" ? 1 : 0}
                  </p>
                  <p className="text-sm text-gray-600 mt-1">Need urgent attention</p>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm border">
                <div className="p-6 border-b">
                  <h3 className="text-lg font-semibold text-gray-800">Unavailable Donor Responses</h3>
                </div>
                <div className="p-6">
                  {responseAnalytics?.responseTimeline?.filter((r: any) => r.status === "unavailable").length > 0 ? (
                    <div className="space-y-4">
                      {responseAnalytics?.responseTimeline
                        ?.filter((r: any) => r.status === "unavailable")
                        .map((response: any) => (
                          <div key={response.donorId} className="flex items-center justify-between p-4 bg-red-50 rounded-lg border border-red-200">
                            <div>
                              <p className="font-medium text-gray-800">{response.donorName}</p>
                              <p className="text-sm text-gray-600">
                                Unavailable since: {new Date(response.responseTime).toLocaleString()}
                              </p>
                              {response.hospitalNotes && (
                                <p className="text-sm text-red-600 mt-1">{response.hospitalNotes}</p>
                              )}
                            </div>
                            <button
                              onClick={() => {
                                setSelectedResponse(response);
                                setShowUnavailabilityModal(true);
                              }}
                              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                            >
                              Handle Unavailability
                            </button>
                          </div>
                        ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <p>No unavailable donor responses found.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Response Management Modal */}
      {selectedResponse && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold">Manage Donor Response</h3>
              <button
                onClick={() => setSelectedResponse(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Action Notes (Optional)
                </label>
                <textarea
                  value={actionNotes}
                  onChange={(e) => setActionNotes(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Add notes about this action..."
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => handleResponseAction('accept', selectedResponse)}
                  disabled={isProcessing}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-green-400 transition-colors"
                >
                  Accept
                </button>
                <button
                  onClick={() => handleResponseAction('reject', selectedResponse)}
                  disabled={isProcessing}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-red-400 transition-colors"
                >
                  Reject
                </button>
                <button
                  onClick={() => handleResponseAction('hold', selectedResponse)}
                  disabled={isProcessing}
                  className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 disabled:bg-yellow-400 transition-colors"
                >
                  Hold
                </button>
                <button
                  onClick={() => handleResponseAction('complete', selectedResponse)}
                  disabled={isProcessing}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-400 transition-colors"
                >
                  Complete
                </button>
              </div>

              {isProcessing && (
                <div className="text-center text-sm text-gray-600">
                  Processing...
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Donor Unavailability Modal */}
      {showUnavailabilityModal && selectedResponse && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Handle Donor Unavailability
            </h3>
            
            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-2">Donor: {selectedResponse.donorName}</p>
              <p className="text-sm text-gray-600">Response Time: {new Date(selectedResponse.responseTime).toLocaleString()}</p>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Reason for Unavailability
              </label>
              <select
                value={unavailabilityData.reason}
                onChange={(e) => setUnavailabilityData({ ...unavailabilityData, reason: e.target.value })}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select a reason</option>
                <option value="emergency">Emergency/Personal Emergency</option>
                <option value="health_issue">Health Issue</option>
                <option value="personal">Personal Commitment</option>
                <option value="transportation">Transportation Issue</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Additional Notes (Optional)
              </label>
              <textarea
                value={unavailabilityData.notes}
                onChange={(e) => setUnavailabilityData({ ...unavailabilityData, notes: e.target.value })}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={3}
                placeholder="Provide additional details..."
              />
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => setShowUnavailabilityModal(false)}
                className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  try {
                    await handleUnavailability({
                      alertId: alertId as any,
                      donorId: (selectedResponse as any).donorId || (selectedResponse as any),
                      reason: unavailabilityData.reason,
                      notes: unavailabilityData.notes || undefined,
                    });
                    setShowUnavailabilityModal(false);
                    setUnavailabilityData({ reason: "", notes: "" });
                    alert("Donor marked unavailable. Replacement donors suggested where available.");
                  } catch (e) {
                    alert("Failed to handle unavailability.");
                  }
                }}
                disabled={!unavailabilityData.reason}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                Confirm Unavailability
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
