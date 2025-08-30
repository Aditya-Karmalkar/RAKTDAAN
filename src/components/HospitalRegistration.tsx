import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { toast } from "sonner";

export function HospitalRegistration() {
  const [formData, setFormData] = useState({
    name: "",
    hospitalId: "",
    location: "",
    phone: "",
    contactPerson: "",
    address: "",
  });

  const registerHospital = useMutation(api.hospitals.registerHospital);
  const currentHospital = useQuery(api.hospitals.getCurrentHospital);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await registerHospital(formData);
      toast.success("Registration successful! Your hospital is pending verification.");
      setFormData({
        name: "",
        hospitalId: "",
        location: "",
        phone: "",
        contactPerson: "",
        address: "",
      });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Registration failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  if (currentHospital) {
    return (
      <div className="min-h-screen bg-background py-20">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-card rounded-2xl shadow-lg p-8 text-center">
            <div className={`w-20 h-20 ${currentHospital.verified ? 'bg-green-100 dark:bg-green-900/30' : 'bg-yellow-100 dark:bg-yellow-900/30'} rounded-full flex items-center justify-center mx-auto mb-6`}>
              {currentHospital.verified ? (
                <svg className="w-10 h-10 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                <svg className="w-10 h-10 text-yellow-600 dark:text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              )}
            </div>
            <h1 className="text-3xl font-bold text-foreground mb-4">
              {currentHospital.verified ? "Hospital Verified!" : "Registration Pending"}
            </h1>
            <p className="text-lg text-muted-foreground mb-6">
              {currentHospital.verified 
                ? `Welcome ${currentHospital.name}! You can now create SOS alerts.`
                : `Thank you for registering ${currentHospital.name}. Your hospital is pending verification.`
              }
            </p>
            <div className="bg-muted/50 rounded-lg p-6 mb-6">
              <div className="grid grid-cols-1 gap-4 text-sm">
                <div className="flex justify-between">
                  <span className="font-semibold text-muted-foreground">Hospital Name:</span>
                  <span className="text-foreground">{currentHospital.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-semibold text-muted-foreground">Hospital ID:</span>
                  <span className="text-foreground">{currentHospital.hospitalId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-semibold text-muted-foreground">Location:</span>
                  <span className="text-foreground">{currentHospital.location}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-semibold text-muted-foreground">Contact Person:</span>
                  <span className="text-foreground">{currentHospital.contactPerson}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-semibold text-muted-foreground">Status:</span>
                  <span className={`font-medium ${currentHospital.verified ? 'text-green-600 dark:text-green-400' : 'text-yellow-600 dark:text-yellow-400'}`}>
                    {currentHospital.verified ? 'Verified' : 'Pending Verification'}
                  </span>
                </div>
              </div>
            </div>
            {currentHospital.verified ? (
              <p className="text-muted-foreground">
                You can now create SOS alerts and manage blood requests through your dashboard.
              </p>
            ) : (
              <p className="text-muted-foreground">
                Our team will verify your hospital details within 24-48 hours. You'll be notified once approved.
              </p>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-20">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="w-20 h-20 bg-primary rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-primary-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
          <h1 className="text-4xl font-bold text-foreground mb-4">
            Hospital <span className="text-primary">Registration</span>
          </h1>
          <p className="text-lg text-muted-foreground">
            Join our network to get immediate access to blood donors in emergencies
          </p>
        </div>

        {/* Registration Form */}
        <div className="bg-card rounded-2xl shadow-lg p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-foreground mb-2">
                Hospital Name *
              </label>
              <input
                type="text"
                id="name"
                name="name"
                required
                value={formData.name}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-input rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-colors bg-background text-foreground"
                placeholder="Enter hospital name"
              />
            </div>

            <div>
              <label htmlFor="hospitalId" className="block text-sm font-medium text-foreground mb-2">
                Hospital Registration ID *
              </label>
              <input
                type="text"
                id="hospitalId"
                name="hospitalId"
                required
                value={formData.hospitalId}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-input rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-colors bg-background text-foreground"
                placeholder="Official hospital registration number"
              />
            </div>

            <div>
              <label htmlFor="contactPerson" className="block text-sm font-medium text-foreground mb-2">
                Contact Person *
              </label>
              <input
                type="text"
                id="contactPerson"
                name="contactPerson"
                required
                value={formData.contactPerson}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-input rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-colors bg-background text-foreground"
                placeholder="Name of authorized person"
              />
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-foreground mb-2">
                Contact Number *
              </label>
              <input
                type="tel"
                id="phone"
                name="phone"
                required
                value={formData.phone}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-input rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-colors bg-background text-foreground"
                placeholder="+1 (555) 123-4567"
              />
            </div>

            <div>
              <label htmlFor="location" className="block text-sm font-medium text-foreground mb-2">
                City/Location *
              </label>
              <input
                type="text"
                id="location"
                name="location"
                required
                value={formData.location}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-input rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-colors bg-background text-foreground"
                placeholder="City, State"
              />
            </div>

            <div>
              <label htmlFor="address" className="block text-sm font-medium text-foreground mb-2">
                Complete Address *
              </label>
              <textarea
                id="address"
                name="address"
                required
                rows={3}
                value={formData.address}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-input rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-colors resize-none bg-background text-foreground"
                placeholder="Complete hospital address with landmarks"
              />
            </div>

            <div className="bg-primary/10 rounded-lg p-4">
              <h3 className="font-semibold text-primary-foreground mb-2">Verification Process:</h3>
              <ul className="text-sm text-primary-foreground/90 space-y-1">
                <li>• Your hospital details will be verified within 24-48 hours</li>
                <li>• You'll receive an email confirmation once approved</li>
                <li>• Only verified hospitals can create SOS blood alerts</li>
                <li>• All information provided must be accurate and verifiable</li>
              </ul>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-primary text-primary-foreground py-3 px-6 rounded-lg font-semibold hover:bg-primary-hover disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isSubmitting ? "Registering..." : "Register Hospital"}
            </button>
          </form>
        </div>

        {/* Benefits */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-card rounded-lg p-6 text-center shadow-sm border border-border">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className="font-semibold text-foreground mb-2">Instant Access</h3>
            <p className="text-sm text-muted-foreground">Send SOS alerts to nearby donors immediately</p>
          </div>

          <div className="bg-card rounded-lg p-6 text-center shadow-sm border border-border">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h3 className="font-semibold text-foreground mb-2">Dashboard</h3>
            <p className="text-sm text-muted-foreground">Track and manage all blood requests efficiently</p>
          </div>

          <div className="bg-card rounded-lg p-6 text-center shadow-sm border border-border">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <h3 className="font-semibold text-foreground mb-2">Verified Network</h3>
            <p className="text-sm text-muted-foreground">Connect with verified donors in your area</p>
          </div>
        </div>
      </div>
    </div>
  );
}
