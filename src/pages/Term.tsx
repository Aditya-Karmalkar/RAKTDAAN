import React from "react";
import { Shield, AlertTriangle, FileWarning, UserCheck } from "lucide-react";

const Term = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Header */}
      <div className="bg-gradient-to-r from-red-600 to-red-700 py-16 text-white text-center shadow-lg">
        <div className="max-w-3xl mx-auto">
          <Shield className="w-12 h-12 mx-auto mb-4" />
          <h1 className="text-4xl sm:text-5xl font-bold mb-3">Terms of Service</h1>
          <p className="text-lg text-red-100">Last updated: August 2025</p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-10 mb-4">
        <div className="bg-white shadow-xl rounded-2xl p-8 sm:p-12">
          <div className="space-y-12">
            {/* 1. Acceptance */}
            <section>
              <h2 className="text-2xl font-semibold text-red-600 mb-4 flex items-center">
                <FileWarning className="w-6 h-6 mr-2 text-red-500" /> 1. Acceptance of Terms
              </h2>
              <p className="text-gray-700 leading-relaxed">
                Welcome to <span className="font-semibold text-red-600">RaktDaan</span>, a life-saving
                blood donation platform. By accessing or using our services, you agree to be bound by these
                Terms of Service. If you do not agree, please discontinue use immediately.
              </p>
            </section>

            {/* 2. Donor Eligibility */}
            <section>
              <h2 className="text-2xl font-semibold text-red-600 mb-4 flex items-center">
                <UserCheck className="w-6 h-6 mr-2 text-red-500" /> 2. Donor Eligibility & Requirements
              </h2>
              <div className="bg-red-50 p-6 rounded-lg mb-4 border border-red-200">
                <h3 className="font-semibold text-gray-900 mb-3">Essential Requirements:</h3>
                <ul className="space-y-2 text-gray-700">
                  {[
                    "Must be between 18-65 years of age",
                    "Minimum weight of 50kg (110 lbs)",
                    "Pass medical screening and health questionnaire",
                    "No recent illnesses, surgeries, or disqualifying medications",
                    "Maintain proper intervals between donations (56 days for whole blood)",
                  ].map((req, i) => (
                    <li key={i} className="flex items-start">
                      <span className="text-red-600 font-bold mr-2">•</span> {req}
                    </li>
                  ))}
                </ul>
              </div>
              <p className="text-gray-700">
                All donations are voluntary and uncompensated. Donors must provide accurate medical
                information for safety.
              </p>
            </section>

            {/* 3. Privacy */}
            <section>
              <h2 className="text-2xl font-semibold text-red-600 mb-4 flex items-center">
                <Shield className="w-6 h-6 mr-2 text-red-500" /> 3. Privacy & Data Protection
              </h2>
              <p className="text-gray-700 mb-6">
                We are committed to protecting your personal and medical information in accordance with
                healthcare privacy laws.
              </p>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-gray-50 p-5 rounded-lg shadow-sm border border-gray-100">
                  <h4 className="font-semibold text-gray-900 mb-2">We Collect:</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Personal identification</li>
                    <li>• Medical history & health data</li>
                    <li>• Contact details</li>
                    <li>• Location data</li>
                  </ul>
                </div>
                <div className="bg-gray-50 p-5 rounded-lg shadow-sm border border-gray-100">
                  <h4 className="font-semibold text-gray-900 mb-2">We Protect:</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Encrypted transmissions</li>
                    <li>• Secure storage</li>
                    <li>• Limited access controls</li>
                    <li>• Regular audits</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* 4. Responsibilities */}
            <section>
              <h2 className="text-2xl font-semibold text-red-600 mb-4">4. Platform Usage & Responsibilities</h2>
              <p className="text-gray-700 mb-4">
                Users agree to use <span className="text-red-600 font-semibold">RaktDaan</span> responsibly.
                Misuse may lead to suspension or termination.
              </p>
              <div className="bg-yellow-50 border border-yellow-300 p-5 rounded-lg">
                <h4 className="font-semibold text-yellow-800 mb-2">🚫 Prohibited Activities:</h4>
                <ul className="text-yellow-700 space-y-1 text-sm">
                  <li>• False emergency requests</li>
                  <li>• Inaccurate medical info</li>
                  <li>• Harassment of users</li>
                  <li>• Commercial exploitation</li>
                  <li>• Circumventing safety measures</li>
                </ul>
              </div>
            </section>

            {/* 5. Liability */}
            <section>
              <h2 className="text-2xl font-semibold text-red-600 mb-4">5. Liability & Disclaimers</h2>
              <p className="text-gray-700 mb-4">
                RaktDaan only connects donors and recipients. We do not provide medical services. Always
                consult healthcare professionals.
              </p>
              <div className="bg-red-50 border border-red-200 p-5 rounded-lg">
                <p className="text-red-800 font-semibold text-sm flex items-center">
                  <AlertTriangle className="w-5 h-5 mr-2 text-red-600" />
                  IMPORTANT: In emergencies, call <span className="ml-1 font-bold">102 / 911</span>. RaktDaan is
                  not a substitute for emergency care.
                </p>
              </div>
            </section>

            {/* 6. Account */}
            <section>
              <h2 className="text-2xl font-semibold text-red-600 mb-4">6. Account Management</h2>
              <p className="text-gray-700">
                Users are responsible for their accounts. Suspicious or violating activity may result in
                suspension.
              </p>
            </section>

            {/* 7. Changes */}
            <section>
              <h2 className="text-2xl font-semibold text-red-600 mb-4">7. Changes to Terms</h2>
              <p className="text-gray-700">
                We reserve the right to modify terms. Continued use implies acceptance of changes.
              </p>
            </section>

            {/* Contact */}
            <div className="mt-10 pt-8 border-t border-gray-200 text-center">
              <p className="text-gray-600 text-sm">
                Questions? Contact us at{" "}
                <span className="text-red-600 font-semibold">legal@raktdaan.org</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Term;
