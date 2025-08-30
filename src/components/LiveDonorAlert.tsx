import { useMutation, useQuery } from "convex/react";
import { useState } from "react";
import { toast } from "sonner";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";

export function LiveDonorAlert() {
  const alerts = useQuery(api.donors.getNearbyActiveSosAlerts) || [];
  const respondToAlert = useMutation(api.donors.respondToSosAlert);
  const currentDonor = useQuery(api.donors.getCurrentDonor);
  const [respondingTo, setRespondingTo] = useState<Id<"sosAlerts"> | null>(null);
  const [notes, setNotes] = useState("");

  const handleRespond = async (alertId: Id<"sosAlerts">) => {
    if (!currentDonor) {
      toast.error("You must be registered as a donor to respond");
      return;
    }

    setRespondingTo(alertId);
    try {
      await respondToAlert({
        alertId,
        notes: notes || undefined,
      });
      toast.success("Response sent! The hospital will contact you soon.");
      setNotes("");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to respond");
    } finally {
      setRespondingTo(null);
    }
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case "critical":
        return "bg-red-100 text-red-800 border-red-200";
      case "urgent":
        return "bg-orange-100 text-orange-800 border-orange-200";
      case "normal":
        return "bg-blue-100 text-blue-800 border-blue-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
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

  if (!currentDonor) {
    return (
      <div className="min-h-screen bg-background py-20">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-card rounded-2xl shadow-lg p-8 text-center">
            <div className="w-20 h-20 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-destructive" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-foreground mb-4">Donor Registration Required</h1>
            <p className="text-lg text-muted-foreground mb-6">
              You need to register as a donor to view and respond to live alerts.
            </p>
            <button className="bg-primary text-primary-foreground px-8 py-3 rounded-lg font-semibold hover:bg-primary-hover transition-colors">
              Register as Donor
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="w-20 h-20 bg-primary rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-primary-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <h1 className="text-4xl font-bold text-foreground mb-4">
            Live <span className="text-primary">Blood Alerts</span>
          </h1>
          <p className="text-lg text-muted-foreground">
            Emergency blood requests that match your blood type ({currentDonor.bloodGroup})
          </p>
        </div>

        {/* Donor Status */}
        <div className="bg-card rounded-lg p-4 mb-8 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className={`w-3 h-3 rounded-full mr-3 ${currentDonor.availability ? 'bg-green-500' : 'bg-destructive'}`}></div>
              <span className="font-medium text-foreground">
                Status: {currentDonor.availability ? 'Available' : 'Not Available'}
              </span>
            </div>
            <div className="text-sm text-muted-foreground">
              Blood Type: <span className="font-semibold text-primary">{currentDonor.bloodGroup}</span>
            </div>
          </div>
        </div>

        {/* Alerts List */}
        {alerts.length === 0 ? (
          <div className="bg-card rounded-2xl shadow-lg p-12 text-center">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-4">No Active Alerts</h2>
            <p className="text-muted-foreground">
              There are currently no emergency blood requests matching your blood type in your area.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {alerts.map((alert) => (
              <div key={alert._id} className="bg-card rounded-2xl shadow-lg p-6 border-l-4 border-primary">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-foreground mb-2">
                      {alert.hospital?.name || "Hospital"}
                    </h3>
                    <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                      <span className="flex items-center">
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        </svg>
                        {alert.location}
                      </span>
                      <span className="flex items-center">
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {formatTimeRemaining(alert.expiresAt)}
                      </span>
                    </div>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-xs font-medium border ${getUrgencyColor(alert.urgency)}`}>
                    {alert.urgency.toUpperCase()}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div className="bg-primary/10 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-primary mb-1">{alert.bloodGroup}</div>
                    <div className="text-sm text-muted-foreground">Blood Type</div>
                  </div>
                  <div className="bg-blue-100 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-blue-600 mb-1">{alert.unitsNeeded}</div>
                    <div className="text-sm text-muted-foreground">Units Needed</div>
                  </div>
                  <div className="bg-green-100 rounded-lg p-4 text-center">
                    <div className="text-lg font-bold text-green-600 mb-1">{alert.contactNumber}</div>
                    <div className="text-sm text-muted-foreground">Contact</div>
                  </div>
                </div>

                <div className="mb-4">
                  <h4 className="font-semibold text-foreground mb-2">Details:</h4>
                  <p className="text-foreground/80">{alert.description}</p>
                </div>

                <div className="border-t pt-4 border-border">
                  <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex-1">
                      <textarea
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="Add a note for the hospital (optional)..."
                        className="w-full px-3 py-2 border border-input rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-colors resize-none bg-background text-foreground"
                        rows={2}
                      />
                    </div>
                    <button
                      onClick={() => handleRespond(alert._id)}
                      disabled={respondingTo === alert._id}
                      className="bg-primary text-primary-foreground px-6 py-2 rounded-lg font-semibold hover:bg-primary-hover disabled:opacity-50 disabled:cursor-not-allowed transition-colors whitespace-nowrap"
                    >
                      {respondingTo === alert._id ? "Responding..." : "I Can Help"}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
