import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { toast } from "sonner";
import { useFormValidation } from "../hooks/useFormValidation";
import { required, phone, minLength } from "../lib/validation";

// Define validation rules for the hospital registration form.
const hospitalValidationRules = {
  name: required,
  hospitalId: required,
  location: required,
  phone: phone,
  contactPerson: required,
  address: minLength(10),
};

export function HospitalRegistration() {
  const { formData, errors, handleChange, validate, resetForm } = useFormValidation(
    {
      name: "",
      hospitalId: "",
      location: "",
      phone: "",
      contactPerson: "",
      address: "",
    },
    hospitalValidationRules
  );

  const registerHospital = useMutation(api.hospitals.registerHospital);
  const currentHospital = useQuery(api.hospitals.getCurrentHospital);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) {
      toast.error("Please correct the errors before submitting.");
      return;
    }
    setIsSubmitting(true);

    try {
      await registerHospital(formData);
      toast.success("Registration successful! Your hospital is pending verification.");
      resetForm();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Registration failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (currentHospital) {
    return (
      <div className="min-h-screen bg-gray-50 py-20">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
            <div className={`w-20 h-20 ${currentHospital.verified ? 'bg-green-100' : 'bg-yellow-100'} rounded-full flex items-center justify-center mx-auto mb-6`}>
              {currentHospital.verified ? (
                <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                <svg className="w-10 h-10 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              )}
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              {currentHospital.verified ? "Hospital Verified!" : "Registration Pending"}
            </h1>
            <p className="text-lg text-gray-600 mb-6">
              {currentHospital.verified
                ? `Welcome ${currentHospital.name}! You can now create SOS alerts.`
                : `Thank you for registering ${currentHospital.name}. Your hospital is pending verification.`
              }
            </p>
            <div className="bg-gray-50 rounded-lg p-6 mb-6">
              <div className="grid grid-cols-1 gap-4 text-sm">
                <div className="flex justify-between">
                  <span className="font-semibold text-gray-700">Hospital Name:</span>
                  <span>{currentHospital.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-semibold text-gray-700">Hospital ID:</span>
                  <span>{currentHospital.hospitalId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-semibold text-gray-700">Location:</span>
                  <span>{currentHospital.location}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-semibold text-gray-700">Contact Person:</span>
                  <span>{currentHospital.contactPerson}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-semibold text-gray-700">Status:</span>
                  <span className={currentHospital.verified ? 'text-green-600' : 'text-yellow-600'}>
                    {currentHospital.verified ? 'Verified' : 'Pending Verification'}
                  </span>
                </div>
              </div>
            </div>
            {currentHospital.verified ? (
              <p className="text-gray-600">
                You can now create SOS alerts and manage blood requests through your dashboard.
              </p>
            ) : (
              <p className="text-gray-600">
                Our team will verify your hospital details within 24-48 hours. You'll be notified once approved.
              </p>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-20">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Hospital <span className="text-blue-600">Registration</span>
          </h1>
          <p className="text-lg text-gray-600">
            Join our network to get immediate access to blood donors in emergencies
          </p>
        </div>

        {/* Registration Form */}
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <form onSubmit={handleSubmit} noValidate className="space-y-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                Hospital Name *
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 outline-none transition-colors ${
                  errors.name
                    ? "border-red-500 focus:ring-red-500"
                    : formData.name && !errors.name
                    ? "border-green-500 focus:ring-green-500"
                    : "border-gray-300 focus:ring-blue-500"
                }`}
                placeholder="Enter hospital name"
              />
              {errors.name && <p className="error-message flex items-center"><svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>{errors.name}</p>}
            </div>

            <div>
              <label htmlFor="hospitalId" className="block text-sm font-medium text-gray-700 mb-2">
                Hospital Registration ID *
              </label>
              <input
                type="text"
                id="hospitalId"
                name="hospitalId"
                value={formData.hospitalId}
                onChange={handleChange}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 outline-none transition-colors ${
                  errors.hospitalId
                    ? "border-red-500 focus:ring-red-500"
                    : formData.hospitalId && !errors.hospitalId
                    ? "border-green-500 focus:ring-green-500"
                    : "border-gray-300 focus:ring-blue-500"
                }`}
                placeholder="Official hospital registration number"
              />
              {errors.hospitalId && <p className="error-message flex items-center"><svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>{errors.hospitalId}</p>}
            </div>

            <div>
              <label htmlFor="contactPerson" className="block text-sm font-medium text-gray-700 mb-2">
                Contact Person *
              </label>
              <input
                type="text"
                id="contactPerson"
                name="contactPerson"
                value={formData.contactPerson}
                onChange={handleChange}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 outline-none transition-colors ${
                  errors.contactPerson
                    ? "border-red-500 focus:ring-red-500"
                    : formData.contactPerson && !errors.contactPerson
                    ? "border-green-500 focus:ring-green-500"
                    : "border-gray-300 focus:ring-blue-500"
                }`}
                placeholder="Name of authorized person"
              />
              {errors.contactPerson && <p className="error-message flex items-center"><svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>{errors.contactPerson}</p>}
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                Contact Number *
              </label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 outline-none transition-colors ${
                  errors.phone
                    ? "border-red-500 focus:ring-red-500"
                    : formData.phone && !errors.phone
                    ? "border-green-500 focus:ring-green-500"
                    : "border-gray-300 focus:ring-blue-500"
                }`}
                placeholder="+1 (555) 123-4567"
              />
              {errors.phone && <p className="error-message flex items-center"><svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>{errors.phone}</p>}
            </div>

            <div>
              <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-2">
                City/Location *
              </label>
              <input
                type="text"
                id="location"
                name="location"
                value={formData.location}
                onChange={handleChange}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 outline-none transition-colors ${
                  errors.location
                    ? "border-red-500 focus:ring-red-500"
                    : formData.location && !errors.location
                    ? "border-green-500 focus:ring-green-500"
                    : "border-gray-300 focus:ring-blue-500"
                }`}
                placeholder="City, State"
              />
              {errors.location && <p className="error-message flex items-center"><svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>{errors.location}</p>}
            </div>

            <div>
              <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-2">
                Complete Address *
              </label>
              <textarea
                id="address"
                name="address"
                rows={3}
                value={formData.address}
                onChange={handleChange}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 outline-none transition-colors resize-none ${
                  errors.address
                    ? "border-red-500 focus:ring-red-500"
                    : formData.address && !errors.address
                    ? "border-green-500 focus:ring-green-500"
                    : "border-gray-300 focus:ring-blue-500"
                }`}
                placeholder="Complete hospital address with landmarks"
              />
              {errors.address && <p className="error-message flex items-center"><svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>{errors.address}</p>}
            </div>

            <div className="bg-blue-50 rounded-lg p-4">
              <h3 className="font-semibold text-blue-800 mb-2">Verification Process:</h3>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• Your hospital details will be verified within 24-48 hours</li>
                <li>• You'll receive an email confirmation once approved</li>
                <li>• Only verified hospitals can create SOS blood alerts</li>
                <li>• All information provided must be accurate and verifiable</li>
              </ul>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isSubmitting ? "Registering..." : "Register Hospital"}
            </button>
          </form>
        </div>

        {/* Benefits */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg p-6 text-center shadow-sm">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Instant Access</h3>
            <p className="text-sm text-gray-600">Send SOS alerts to nearby donors immediately</p>
          </div>

          <div className="bg-white rounded-lg p-6 text-center shadow-sm">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Dashboard</h3>
            <p className="text-sm text-gray-600">Track and manage all blood requests efficiently</p>
          </div>

          <div className="bg-white rounded-lg p-6 text-center shadow-sm">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Verified Network</h3>
            <p className="text-sm text-gray-600">Connect with verified donors in your area</p>
          </div>
        </div>
      </div>
    </div>
  );
}
