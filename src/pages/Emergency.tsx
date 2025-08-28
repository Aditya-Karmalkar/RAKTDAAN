import React, { useState } from 'react';

const Emergency = () => {
  const [selectedCity, setSelectedCity] = useState("all");

  // Static hospital data as fallback when Convex is not available
  const hospitals = [
    {
      _id: "1",
      name: "City General Hospital",
      address: "123 Main Street, Medical District",
      city: "Mumbai",
      phone: "+91-22-12345678",
      bloodAvailability: {
        "A+": 15,
        "O+": 20,
        "B+": 8,
        "AB+": 5,
        "O-": 12
      }
    },
    {
      _id: "2",
      name: "Red Cross Blood Bank",
      address: "456 Health Avenue, Central Area",
      city: "Delhi",
      phone: "+91-11-87654321",
      bloodAvailability: {
        "A+": 10,
        "O+": 25,
        "A-": 6,
        "O-": 18,
        "B+": 12
      }
    },
    {
      _id: "3",
      name: "Apollo Emergency Center",
      address: "789 Care Road, Health Zone",
      city: "Bangalore",
      phone: "+91-80-11223344",
      bloodAvailability: {
        "A+": 20,
        "B+": 15,
        "AB+": 8,
        "O+": 30,
        "O-": 10
      }
    },
    {
      _id: "4",
      name: "Lifeline Blood Bank",
      address: "321 Emergency Lane, Medical Hub",
      city: "Chennai",
      phone: "+91-44-99887766",
      bloodAvailability: {
        "A+": 12,
        "A-": 7,
        "B+": 14,
        "O+": 22,
        "AB-": 4
      }
    },
    {
      _id: "5",
      name: "Metro Hospital Blood Center",
      address: "654 Rescue Boulevard, City Center",
      city: "Mumbai",
      phone: "+91-22-55443322",
      bloodAvailability: {
        "O+": 28,
        "A+": 16,
        "B+": 11,
        "O-": 15,
        "AB+": 6
      }
    },
    {
      _id: "6",
      name: "Emergency Care Institute",
      address: "987 Urgent Care Street, Medical Plaza",
      city: "Delhi",
      phone: "+91-11-66554433",
      bloodAvailability: {
        "A+": 18,
        "B+": 13,
        "O+": 24,
        "A-": 9,
        "B-": 5
      }
    }
  ];

  // Get unique cities from hospitals
  const cities = [...new Set(hospitals.map(hospital => hospital.city))].sort();

  const filteredHospitals = hospitals.filter(hospital => 
    selectedCity === "all" || hospital.city === selectedCity
  );

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      {/* Header Section */}
      <div className="max-w-7xl mx-auto text-center mb-12">
        <div className="flex items-center justify-center mb-4">
          <div className="bg-red-100 p-3 rounded-full mr-4">
            <svg className="w-8 h-8 text-red-600" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
            </svg>
          </div>
          <h1 className="text-4xl font-bold text-gray-900">
            Emergency Blood Bank Hotlines
          </h1>
        </div>
        <p className="text-lg text-gray-600 max-w-3xl mx-auto">
          In case of emergency, contact these verified blood banks and hospitals. Available 24/7 for urgent blood requirements.
        </p>
      </div>

      {/* Emergency Alert Banner */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="bg-red-100 border-l-4 border-red-500 p-4 rounded-r-lg">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">
                <strong>Emergency Service:</strong> For immediate assistance, call the nearest blood bank or dial emergency services at <strong>102</strong>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* City Filter */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <label className="text-sm font-medium text-gray-700">Filter by City:</label>
          <select
            value={selectedCity}
            onChange={(e) => setSelectedCity(e.target.value)}
            className="block w-full sm:w-48 px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500 bg-white"
          >
            <option value="all">All Cities</option>
            {cities.map(city => (
              <option key={city} value={city}>{city}</option>
            ))}
          </select>
          <div className="text-sm text-gray-500">
            Showing {filteredHospitals.length} emergency centers
          </div>
        </div>
      </div>

      {/* Emergency Contacts Grid */}
      <div className="max-w-7xl mx-auto grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredHospitals.length === 0 ? (
          <div className="col-span-full text-center text-gray-500 py-12">
            <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
            <p>No hospitals found in this city.</p>
          </div>
        ) : (
          filteredHospitals.map((hospital) => (
            <div 
              key={hospital._id} 
              className="bg-white rounded-lg shadow-lg p-6 border border-gray-200 hover:border-red-300 hover:shadow-xl transition-all duration-200"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {hospital.name}
                  </h3>
                  <div className="text-sm text-gray-600 space-y-1">
                    <p className="flex items-center">
                      <svg className="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      {hospital.address}
                    </p>
                    <p className="flex items-center">
                      <svg className="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                      {hospital.city}
                    </p>
                  </div>
                </div>
                <div className="bg-red-100 p-2 rounded-full">
                  <svg 
                    className="w-6 h-6 text-red-600" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={2} 
                      d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" 
                    />
                  </svg>
                </div>
              </div>

              {/* Emergency Call Button */}
              <div className="mb-4">
                <a 
                  href={`tel:${hospital.phone}`}
                  className="inline-flex items-center justify-center w-full px-4 py-3 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors duration-200"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  {hospital.phone}
                </a>
              </div>

              {/* Blood Availability */}
              {hospital.bloodAvailability && Object.keys(hospital.bloodAvailability).length > 0 && (
                <div className="pt-4 border-t border-gray-100">
                  <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center">
                    <svg className="w-4 h-4 mr-2 text-red-500" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                    </svg>
                    Available Blood Groups
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(hospital.bloodAvailability)
                      .filter(([_, units]) => units > 0)
                      .map(([group, units]) => (
                        <span 
                          key={group}
                          className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200"
                        >
                          <span className="font-bold mr-1">{group}</span>
                          <span className="text-green-600">({units} units)</span>
                        </span>
                      ))
                    }
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Emergency Instructions */}
      <div className="max-w-7xl mx-auto mt-12 bg-white p-8 rounded-lg shadow-md border border-gray-200">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
          <svg className="w-6 h-6 mr-3 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Emergency Instructions
        </h2>
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-3">Before Calling:</h3>
            <ul className="space-y-2 text-gray-700">
              <li className="flex items-start">
                <span className="flex-shrink-0 h-2 w-2 bg-red-500 rounded-full mt-2 mr-3"></span>
                Have patient's blood group ready
              </li>
              <li className="flex items-start">
                <span className="flex-shrink-0 h-2 w-2 bg-red-500 rounded-full mt-2 mr-3"></span>
                Know the required number of units
              </li>
              <li className="flex items-start">
                <span className="flex-shrink-0 h-2 w-2 bg-red-500 rounded-full mt-2 mr-3"></span>
                Prepare medical documents and ID
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-3">During Emergency:</h3>
            <ul className="space-y-2 text-gray-700">
              <li className="flex items-start">
                <span className="flex-shrink-0 h-2 w-2 bg-red-500 rounded-full mt-2 mr-3"></span>
                Call the nearest blood bank immediately
              </li>
              <li className="flex items-start">
                <span className="flex-shrink-0 h-2 w-2 bg-red-500 rounded-full mt-2 mr-3"></span>
                Arrange transport for blood pickup
              </li>
              <li className="flex items-start">
                <span className="flex-shrink-0 h-2 w-2 bg-red-500 rounded-full mt-2 mr-3"></span>
                Contact emergency services (102) if needed
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* National Emergency Numbers */}
      <div className="max-w-7xl mx-auto mt-8 bg-red-50 p-6 rounded-lg border border-red-200">
        <h3 className="text-lg font-bold text-red-900 mb-4">National Emergency Numbers</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div className="bg-white p-3 rounded-lg">
            <div className="text-2xl font-bold text-red-600">102</div>
            <div className="text-sm text-gray-600">Emergency Services</div>
          </div>
          <div className="bg-white p-3 rounded-lg">
            <div className="text-2xl font-bold text-red-600">108</div>
            <div className="text-sm text-gray-600">Ambulance</div>
          </div>
          <div className="bg-white p-3 rounded-lg">
            <div className="text-2xl font-bold text-red-600">100</div>
            <div className="text-sm text-gray-600">Police</div>
          </div>
          <div className="bg-white p-3 rounded-lg">
            <div className="text-2xl font-bold text-red-600">101</div>
            <div className="text-sm text-gray-600">Fire Brigade</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Emergency;