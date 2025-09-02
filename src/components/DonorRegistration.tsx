import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { toast } from "sonner";
import { useFormValidation } from "../hooks/useFormValidation";
import { required, phone } from "../lib/validation";

// Define validation rules for the donor registration form.
const donorValidationRules = {
  name: required,
  bloodGroup: required,
  location: required,
  phone: phone,
  emergencyContact: (value: string) => {
    if (!value) return ""; // Not required, so no error if empty
    return phone(value); // But if a value is entered, it must be a valid phone number
  },
};

export function DonorRegistration() {
  const { formData, errors, handleChange, validate, resetForm } = useFormValidation(
    {
      name: "",
      bloodGroup: "",
      location: "",
      phone: "",
      emergencyContact: "",
    },
    donorValidationRules
  );

  const registerDonor = useMutation(api.donors.registerDonor);
  const currentDonor = useQuery(api.donors.getCurrentDonor);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const bloodGroups = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) {
      toast.error("Please correct the errors before submitting.");
      return;
    }
  setIsSubmitting(true);

    try {
      await registerDonor({
        ...formData,
        emergencyContact: formData.emergencyContact || undefined,
      });
      
      toast.success("Registration successful! You're now a registered donor.");
     resetForm();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Registration failed");
    } finally {
      setIsSubmitting(false);
    }
  };

    if (currentDonor) {
    return (
      <div className="min-h-screen bg-gray-50 py-20">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">You're Already Registered!</h1>
            <p className="text-lg text-gray-600 mb-6">
              Thank you for being a registered donor, <strong>{currentDonor.name}</strong>!
            </p>
            <div className="bg-gray-50 rounded-lg p-6 mb-6">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-semibold text-gray-700">Blood Group:</span>
                  <span className="ml-2 text-red-600 font-bold">{currentDonor.bloodGroup}</span>
                </div>
                <div>
                  <span className="font-semibold text-gray-700">Location:</span>
                  <span className="ml-2">{currentDonor.location}</span>
                </div>
                <div>
                  <span className="font-semibold text-gray-700">Phone:</span>
                  <span className="ml-2">{currentDonor.phone}</span>
                </div>
                <div>
                  <span className="font-semibold text-gray-700">Status:</span>
                  <span className={`ml-2 ${currentDonor.availability ? 'text-green-600' : 'text-red-600'}`}>
                    {currentDonor.availability ? 'Available' : 'Not Available'}
                  </span>
                </div>
              </div>
            </div>
            <p className="text-gray-600">
              You'll receive real-time alerts when hospitals near you need your blood type.
            </p>
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
          <div className="w-20 h-20 bg-red-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
            </svg>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Become a <span className="text-red-600">Lifesaver</span>
          </h1>
          <p className="text-lg text-gray-600">
            Join our community of heroes and help save lives through blood donation
          </p>
        </div>

        {/* Registration Form */}
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <form onSubmit={handleSubmit} noValidate className="space-y-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                Full Name *
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className={`w-full px-4 py-3 border  rounded-lg focus:ring-2  focus:ring-red-500 focus:border-red-500 outline-none transition-colors ${
                errors.name 
                ? 'border-red-500 ring-red-500' 
                 : formData.name && !errors.name
                ? "border-green-500 focus:ring-green-500"
                : "border-gray-300 focus:ring-red-500"
               }`}
                placeholder="Enter your full name"
             />
               {errors.name && <p className="error-message flex items-center"><svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>{errors.name}</p>}
            </div>

            <div>
              <label htmlFor="bloodGroup" className="block text-sm font-medium text-gray-700 mb-2">
                Blood Group *
              </label>
              <select
                id="bloodGroup"
                name="bloodGroup"
                value={formData.bloodGroup}
                onChange={handleChange}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 outline-none transition-colors ${
                  errors.bloodGroup
                    ? "border-red-500 focus:ring-red-500"
                    : formData.bloodGroup && !errors.bloodGroup
                    ? "border-green-500 focus:ring-green-500"
                    : "border-gray-300 focus:ring-red-500"
                }`}
              >
                <option value="">Select your blood group</option>
                {bloodGroups.map((group) => (
                  <option key={group} value={group}>
                    {group}
                  </option>
                ))}
              </select>
                {errors.bloodGroup && <p className="error-message flex items-center"><svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>{errors.bloodGroup}</p>}
            </div>

            <div>
      
              <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-2">
                Location *
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
                    : "border-gray-300 focus:ring-red-500"
                }`}
                  placeholder="City, State"
              />
                 {errors.location && <p className="error-message flex items-center"><svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>{errors.location}</p>}
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number *
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
                    : "border-gray-300 focus:ring-red-500"
                }`}
                placeholder="+1 (555) 123-4567"
              />
              {errors.phone && <p className="error-message flex items-center"><svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>{errors.phone}</p>}
            </div>

            <div>
              <label htmlFor="emergencyContact" className="block text-sm font-medium text-gray-700 mb-2">
                Emergency Contact (Optional)
              </label>
              <input
                type="tel"
                id="emergencyContact"
                name="emergencyContact"
                value={formData.emergencyContact}
                onChange={handleChange}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 outline-none transition-colors ${
                  errors.emergencyContact
                    ? "border-red-500 focus:ring-red-500"
                    : formData.emergencyContact && !errors.emergencyContact
                    ? "border-green-500 focus:ring-green-500"
                    : "border-gray-300 focus:ring-red-500"
                }`}
                placeholder="+1 (555) 987-6543"
              />
              {errors.emergencyContact && <p className="error-message flex items-center"><svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>{errors.emergencyContact}</p>}
            </div>

            <div className="bg-red-50 rounded-lg p-4">
              <h3 className="font-semibold text-red-800 mb-2">Important Information:</h3>
              <ul className="text-sm text-red-700 space-y-1">
                <li>• You must be 18-65 years old and weigh at least 50kg</li>
                <li>• You should be in good health with no recent illnesses</li>
                <li>• Wait at least 56 days between whole blood donations</li>
                <li>• You'll receive real-time alerts for emergency blood needs</li>
              </ul>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-red-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isSubmitting ? "Registering..." : "Register as Donor"}
            </button>
          </form>
        </div>

        {/* Benefits */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg p-6 text-center shadow-sm">
            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Instant Alerts</h3>
            <p className="text-sm text-gray-600">Get notified immediately when your blood type is needed</p>
          </div>

          <div className="bg-white rounded-lg p-6 text-center shadow-sm">
            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              </svg>
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Nearby Hospitals</h3>
            <p className="text-sm text-gray-600">Connect with hospitals in your area that need help</p>
          </div>

          <div className="bg-white rounded-lg p-6 text-center shadow-sm">
            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Save Lives</h3>
            <p className="text-sm text-gray-600">Make a direct impact by helping those in critical need</p>
          </div>
        </div>
      </div>
    </div>
              );
 }
            
