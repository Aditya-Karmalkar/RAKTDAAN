import { useMutation, useQuery } from "convex/react";
import { useState } from "react";
import { toast } from "sonner";
import { api } from "../../convex/_generated/api";

export function SosAlert() {
  const [formData, setFormData] = useState({
    bloodGroup: "",
    urgency: "",
    unitsNeeded: 1,
    contactNumber: "",
    description: "",
    hoursValid: 24,
    targetArea: "",
    radiusKm: 50,
  });

  const createSosAlert = useMutation(api.hospitals.createSosAlert);
  const currentHospital = useQuery(api.hospitals.getCurrentHospital);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const bloodGroups = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];
  const urgencyLevels = [
    { value: "critical", label: "Critical", color: "red" },
    { value: "urgent", label: "Urgent", color: "orange" },
    { value: "normal", label: "Normal", color: "blue" },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const result = await createSosAlert(formData);
      toast.success(result?.message || "SOS Alert created successfully! Donors will be notified immediately.");
      setFormData({
        bloodGroup: "",
        urgency: "",
        unitsNeeded: 1,
        contactNumber: "",
        description: "",
        hoursValid: 24,
        targetArea: "",
        radiusKm: 50,
      });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to create SOS alert");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const value = e.target.type === "number" ? parseInt(e.target.value) : e.target.value;
    setFormData({
      ...formData,
      [e.target.name]: value,
    });
  };

  if (!currentHospital) {
    return (
      <div className="min-h-screen bg-gray-50 py-20">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Hospital Registration Required</h1>
            <p className="text-lg text-gray-600 mb-6">
              You need to register as a hospital to create SOS alerts.
            </p>
            <button className="bg-red-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-red-700 transition-colors">
              Register Hospital
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!currentHospital.verified) {
    return (
      <div className="min-h-screen bg-gray-50 py-20">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
            <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Verification Pending</h1>
            <p className="text-lg text-gray-600 mb-6">
              Your hospital registration is pending verification. You'll be able to create SOS alerts once verified.
            </p>
            <p className="text-gray-600">
              Our team will verify your hospital details within 24-48 hours.
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
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Create <span className="text-red-600">SOS Alert</span>
          </h1>
          <p className="text-lg text-gray-600">
            Send urgent blood requests to nearby donors instantly
          </p>
        </div>

        {/* SOS Alert Form */}
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="bloodGroup" className="block text-sm font-medium text-gray-700 mb-2">
                Blood Group Required *
              </label>
              <select
                id="bloodGroup"
                name="bloodGroup"
                required
                value={formData.bloodGroup}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-colors"
              >
                <option value="">Select blood group needed</option>
                {bloodGroups.map((group) => (
                  <option key={group} value={group}>
                    {group}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="urgency" className="block text-sm font-medium text-gray-700 mb-2">
                Urgency Level *
              </label>
              <select
                id="urgency"
                name="urgency"
                required
                value={formData.urgency}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-colors"
              >
                <option value="">Select urgency level</option>
                {urgencyLevels.map((level) => (
                  <option key={level.value} value={level.value}>
                    {level.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="unitsNeeded" className="block text-sm font-medium text-gray-700 mb-2">
                Units Needed *
              </label>
              <input
                type="number"
                id="unitsNeeded"
                name="unitsNeeded"
                required
                min="1"
                max="10"
                value={formData.unitsNeeded}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-colors"
                placeholder="Number of units required"
              />
            </div>

            <div>
              <label htmlFor="contactNumber" className="block text-sm font-medium text-gray-700 mb-2">
                Emergency Contact Number *
              </label>
              <input
                type="tel"
                id="contactNumber"
                name="contactNumber"
                required
                value={formData.contactNumber}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-colors"
                placeholder="+1 (555) 123-4567"
              />
            </div>

            <div>
              <label htmlFor="hoursValid" className="block text-sm font-medium text-gray-700 mb-2">
                Alert Valid For (Hours) *
              </label>
              <select
                id="hoursValid"
                name="hoursValid"
                required
                value={formData.hoursValid}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-colors"
              >
                <option value={6}>6 Hours</option>
                <option value={12}>12 Hours</option>
                <option value={24}>24 Hours</option>
                <option value={48}>48 Hours</option>
                <option value={72}>72 Hours</option>
              </select>
            </div>

            <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
              <h3 className="font-semibold text-blue-800 mb-3 flex items-center">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Location Targeting (Optional)
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="targetArea" className="block text-sm font-medium text-gray-700 mb-2">
                    Specific Area/Neighborhood
                  </label>
                  <input
                    type="text"
                    id="targetArea"
                    name="targetArea"
                    value={formData.targetArea}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                    placeholder="e.g., Manhattan, Downtown, etc."
                  />
                  <p className="text-xs text-gray-500 mt-1">Leave empty to target your entire city</p>
                </div>

                <div>
                  <label htmlFor="radiusKm" className="block text-sm font-medium text-gray-700 mb-2">
                    Target Radius (km)
                  </label>
                  <select
                    id="radiusKm"
                    name="radiusKm"
                    value={formData.radiusKm}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                  >
                    <option value={10}>10 km - Very Local</option>
                    <option value={25}>25 km - Local Area</option>
                    <option value={50}>50 km - City Wide</option>
                    <option value={100}>100 km - Regional</option>
                    <option value={200}>200 km - State Wide</option>
                  </select>
                </div>
              </div>
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                Additional Details *
              </label>
              <textarea
                id="description"
                name="description"
                required
                rows={4}
                value={formData.description}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-colors resize-none"
                placeholder="Provide details about the patient condition, surgery requirements, or any special instructions..."
              />
            </div>

            <div className="bg-red-50 rounded-lg p-4">
              <h3 className="font-semibold text-red-800 mb-2">🚨 SOS Alert Information:</h3>
              <ul className="text-sm text-red-700 space-y-1">
                <li>• This alert will be sent to all compatible {formData.bloodGroup || '[blood group]'} donors in your target area</li>
                <li>• {formData.targetArea ? `Targeting: ${formData.targetArea} within ${formData.radiusKm}km` : `Targeting: Your city (${formData.radiusKm}km radius)`}</li>
                <li>• Donors will see your hospital name and emergency contact information</li>
                <li>• You'll receive responses from interested donors immediately</li>
                <li>• The alert will automatically expire after {formData.hoursValid} hours</li>
              </ul>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-red-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isSubmitting ? "Creating Alert..." : "Send SOS Alert"}
            </button>
          </form>
        </div>

        {/* Hospital Info */}
        <div className="mt-8 bg-white rounded-lg p-6 shadow-sm">
          <h3 className="font-semibold text-gray-900 mb-4">Your Hospital Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium text-gray-700">Hospital:</span>
              <span className="ml-2">{currentHospital.name}</span>
            </div>
            <div>
              <span className="font-medium text-gray-700">Location:</span>
              <span className="ml-2">{currentHospital.location}</span>
            </div>
            <div>
              <span className="font-medium text-gray-700">Contact Person:</span>
              <span className="ml-2">{currentHospital.contactPerson}</span>
            </div>
            <div>
              <span className="font-medium text-gray-700">Phone:</span>
              <span className="ml-2">{currentHospital.phone}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
