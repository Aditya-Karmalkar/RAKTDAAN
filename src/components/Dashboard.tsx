import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { useState } from "react";
import { toast } from "sonner";

export function Dashboard() {
  const currentHospital = useQuery(api.hospitals.getCurrentHospital);
  const sosAlerts = useQuery(api.hospitals.getHospitalSosAlerts) || [];
  const updateAlertStatus = useMutation(api.hospitals.updateSosAlertStatus);
  const [updatingAlert, setUpdatingAlert] = useState<Id<"sosAlerts"> | null>(null);

  const handleStatusUpdate = async (alertId: Id<"sosAlerts">, status: string) => {
    setUpdatingAlert(alertId);
    try {
      await updateAlertStatus({ alertId, status });
      toast.success(`Alert status updated to ${status}`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to update status");
    } finally {
      setUpdatingAlert(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800 border-green-200";
      case "fulfilled":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "expired":
        return "bg-gray-100 text-gray-800 border-gray-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case "critical":
        return "bg-red-100 text-red-800";
      case "urgent":
        return "bg-orange-100 text-orange-800";
      case "normal":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatTimeRemaining = (expiresAt: number) => {
    const now = Date.now();
    const remaining = expiresAt - now;
    
    if (remaining <= 0) return "Expired";
    
    const hours = Math.floor(remaining / (1000 * 60 * 60));
    const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 0) {
      return `${hours}h ${minutes}m remaining`;
    }
    return `${minutes}m remaining`;
  };

  if (!currentHospital) {
    return (
      <div className="min-h-screen bg-background py-20">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-card rounded-2xl shadow-lg p-8 text-center">
            <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-foreground mb-4">Hospital Registration Required</h1>
            <p className="text-lg text-muted-foreground mb-6">
              You need to register as a hospital to access the dashboard.
            </p>
            <button className="bg-primary text-primary-foreground px-8 py-3 rounded-lg font-semibold hover:bg-primary-hover transition-colors">
              Register Hospital
            </button>
          </div>
        </div>
      </div>
    );
  }

  const activeAlerts = sosAlerts.filter(alert => alert.status === "active");
  const totalResponses = sosAlerts.reduce((sum, alert) => sum + alert.responses.length, 0);

  return (
    <div className="min-h-screen bg-background py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Hospital Dashboard
          </h1>
          <p className="text-muted-foreground">
            Welcome back, {currentHospital.name}
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-card rounded-lg p-6 shadow-sm">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Total Alerts</p>
                <p className="text-2xl font-bold text-foreground">{sosAlerts.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-card rounded-lg p-6 shadow-sm">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Active Alerts</p>
                <p className="text-2xl font-bold text-foreground">{activeAlerts.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-card rounded-lg p-6 shadow-sm">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-destructive/10 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-destructive" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Total Responses</p>
                <p className="text-2xl font-bold text-foreground">{totalResponses}</p>
              </div>
            </div>
          </div>

          <div className="bg-card rounded-lg p-6 shadow-sm">
            <div className="flex items-center">
              <div className={`w-12 h-12 ${currentHospital.verified ? 'bg-green-100' : 'bg-yellow-100'} rounded-lg flex items-center justify-center`}>
                {currentHospital.verified ? (
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                ) : (
                  <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                )}
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Status</p>
                <p className={`text-sm font-bold ${currentHospital.verified ? 'text-green-600' : 'text-yellow-600'}`}>
                  {currentHospital.verified ? 'Verified' : 'Pending'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* SOS Alerts */}
        <div className="bg-card rounded-2xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-foreground">Your SOS Alerts</h2>
            <button className="bg-primary text-primary-foreground px-4 py-2 rounded-lg font-semibold hover:bg-primary-hover transition-colors">
              Create New Alert
            </button>
          </div>

          {sosAlerts.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-foreground mb-2">No SOS Alerts</h3>
              <p className="text-muted-foreground">You haven't created any SOS alerts yet.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {sosAlerts.map((alert) => (
                <div key={alert._id} className="border border-border rounded-lg p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <div className="flex items-center space-x-3 mb-2">
                        <span className="text-2xl font-bold text-primary">{alert.bloodGroup}</span>
                        <div className={`px-2 py-1 rounded-full text-xs font-medium ${getUrgencyColor(alert.urgency)}`}>
                          {alert.urgency.toUpperCase()}
                        </div>
                        <div className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(alert.status)}`}>
                          {alert.status.toUpperCase()}
                        </div>
                      </div>
                      <p className="text-muted-foreground mb-2">{alert.description}</p>
                      <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                        <span>{alert.unitsNeeded} units needed</span>
                        <span>•</span>
                        <span>{formatTimeRemaining(alert.expiresAt)}</span>
                        <span>•</span>
                        <span>{alert.responses.length} responses</span>
                      </div>
                    </div>
                    {alert.status === "active" && (
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleStatusUpdate(alert._id, "fulfilled")}
                          disabled={updatingAlert === alert._id}
                          className="bg-green-600 text-white px-3 py-1 rounded text-sm font-medium hover:bg-green-700 disabled:opacity-50 transition-colors"
                        >
                          Mark Fulfilled
                        </button>
                        <button
                          onClick={() => handleStatusUpdate(alert._id, "expired")}
                          disabled={updatingAlert === alert._id}
                          className="bg-muted text-foreground px-3 py-1 rounded text-sm font-medium hover:bg-muted-foreground hover:text-background disabled:opacity-50 transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    )}
                  </div>

                  {alert.responses.length > 0 && (
                    <div className="border-t pt-4 border-border">
                      <h4 className="font-semibold text-foreground mb-3">Donor Responses ({alert.responses.length})</h4>
                      <div className="space-y-3">
                        {alert.responses.map((response) => (
                          <div key={response._id} className="bg-muted rounded-lg p-4">
                            <div className="flex items-start justify-between">
                              <div>
                                <div className="flex items-center space-x-3 mb-2">
                                  <span className="font-semibold text-foreground">{response.donor?.name}</span>
                                  <span className="text-sm text-muted-foreground">{response.donor?.bloodGroup}</span>
                                  <span className="text-sm text-muted-foreground">•</span>
                                  <span className="text-sm text-muted-foreground">{response.donor?.location}</span>
                                </div>
                                <div className="text-sm text-muted-foreground mb-2">
                                  Phone: <span className="font-medium">{response.donor?.phone}</span>
                                </div>
                                {response.notes && (
                                  <p className="text-sm text-foreground italic">"{response.notes}"</p>
                                )}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {new Date(response.responseTime).toLocaleString()}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
