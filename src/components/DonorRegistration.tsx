import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { toast } from "sonner";

export function DonorRegistration() {
  const [formData, setFormData] = useState({
    name: "",
    bloodGroup: "",
    location: "",
    phone: "",
    emergencyContact: "",
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const registerDonor = useMutation(api.donors.registerDonor);
  const currentDonor = useQuery(api.donors.getCurrentDonor);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const bloodGroups = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

  // ------------------ Custom Validation ------------------
  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.name.trim()) newErrors.name = "Full name is required";

    if (!formData.bloodGroup) newErrors.bloodGroup = "Please select your blood group";

    if (!formData.location.trim()) newErrors.location = "Location is required";

    if (!formData.phone.trim()) {
      newErrors.phone = "Phone number is required";
    } else if (!/^[0-9]{10}$/.test(formData.phone)) {
      newErrors.phone = "Enter a valid 10-digit phone number";
    }

    if (formData.emergencyContact && !/^[0-9]{10}$/.test(formData.emergencyContact)) {
      newErrors.emergencyContact = "Emergency contact must be 10 digits";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ------------------ Submit Handler ------------------
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Please fix the errors before submitting");
      return;
    }

    setIsSubmitting(true);
    try {
      await registerDonor({
        name: formData.name,
        bloodGroup: formData.bloodGroup,
        location: formData.location,
        phone: formData.phone,
        emergencyContact: formData.emergencyContact || undefined,
      });

      toast.success("Registration successful! You're now a registered donor.");
      setFormData({ name: "", bloodGroup: "", location: "", phone: "", emergencyContact: "" });
      setErrors({});
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Registration failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  if (currentDonor) {
    return (
      <div className="min-h-screen bg-gray-50 py-20">
        {/* Existing Already Registered UI unchanged */}
      </div>
    );
  }

  // ------------------ Registration Form ------------------
  return (
    <div className="min-h-screen bg-gray-50 py-20">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Full Name */}
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
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 outline-none transition-colors ${
                  errors.name ? "border-red-500 focus:ring-red-500" : "border-gray-300 focus:ring-red-500"
                }`}
                placeholder="Enter your full name"
              />
              {errors.name && <p className="text-red-600 text-sm mt-1">{errors.name}</p>}
            </div>

            {/* Blood Group */}
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
                  errors.bloodGroup ? "border-red-500 focus:ring-red-500" : "border-gray-300 focus:ring-red-500"
                }`}
              >
                <option value="">Select your blood group</option>
                {bloodGroups.map((group) => (
                  <option key={group} value={group}>
                    {group}
                  </option>
                ))}
              </select>
              {errors.bloodGroup && <p className="text-red-600 text-sm mt-1">{errors.bloodGroup}</p>}
            </div>

            {/* Location */}
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
                  errors.location ? "border-red-500 focus:ring-red-500" : "border-gray-300 focus:ring-red-500"
                }`}
                placeholder="City, State"
              />
              {errors.location && <p className="text-red-600 text-sm mt-1">{errors.location}</p>}
            </div>

            {/* Phone */}
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
                  errors.phone ? "border-red-500 focus:ring-red-500" : "border-gray-300 focus:ring-red-500"
                }`}
                placeholder="10-digit phone number"
              />
              {errors.phone && <p className="text-red-600 text-sm mt-1">{errors.phone}</p>}
            </div>

            {/* Emergency Contact */}
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
                  errors.emergencyContact ? "border-red-500 focus:ring-red-500" : "border-gray-300 focus:ring-red-500"
                }`}
                placeholder="10-digit phone number"
              />
              {errors.emergencyContact && (
                <p className="text-red-600 text-sm mt-1">{errors.emergencyContact}</p>
              )}
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
      </div>
    </div>
  );
}
