import { Authenticated, Unauthenticated } from "convex/react";
import { SignInForm } from "../SignInForm";
import Counter from "./StatsCountingUI"; // counting UI feature


interface HomeProps {
  onNavigate: (screen: string) => void;
}

export function Home({ onNavigate }: HomeProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-white">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            {/* Hero Image/Icon */}
            <div className="mb-8 flex justify-center">
              <div className="relative">
                <div className="w-32 h-32 bg-red-600 rounded-full flex items-center justify-center shadow-2xl">
                  <svg
                    className="w-16 h-16 text-white"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                  </svg>
                </div>
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-lg">
                  <span className="text-red-600 text-xl">+</span>
                </div>
              </div>
            </div>

            {/* Main Heading */}
            <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-6">
              <span className="text-red-600">Rakt</span>Daan
            </h1>

            {/* Tagline */}
            <p className="text-2xl md:text-3xl text-gray-700 mb-4 font-light">
              Where You Bond By Blood
            </p>

            {/* Subtitle */}
            <p className="text-lg md:text-xl text-gray-600 mb-12 max-w-3xl mx-auto leading-relaxed">
              Connecting hospitals, blood donors, and recipients for a fast,
              seamless, and trusted blood donation experience, especially in
              emergencies.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Authenticated>
                <button
                  onClick={() => onNavigate("donor-registration")}
                  className="bg-red-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-red-700 transform hover:scale-105 transition-all duration-200 shadow-lg"
                >
                  Become a Lifesaver
                </button>
                <button
                  onClick={() => onNavigate("hospital-registration")}
                  className="border-2 border-red-600 text-red-600 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-red-600 hover:text-white transition-all duration-200"
                >
                  Hospital Registration
                </button>
              </Authenticated>

              <Unauthenticated>
                <div className="w-full max-w-md">
                  <SignInForm />
                  <p className="text-sm text-gray-600 mt-4">
                    Sign in to become a lifesaver or register your hospital
                  </p>
                </div>
              </Unauthenticated>
            </div>
          </div>
        </div>

        {/* Floating Elements */}
        <div className="absolute top-20 left-10 w-4 h-4 bg-red-200 rounded-full animate-pulse"></div>
        <div className="absolute top-40 right-20 w-6 h-6 bg-red-300 rounded-full animate-pulse delay-1000"></div>
        <div className="absolute bottom-20 left-20 w-3 h-3 bg-red-400 rounded-full animate-pulse delay-2000"></div>
      </div>

      {/* Quick Stats */}
      <div className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <Counter target={24} label="Emergency Response (Hours)" suffix="/7" />
            <Counter target={1000} label="Lives Saved" />
            <Counter target={500} label="Active Donors" />
          </div>
        </div>
      </div>


      {/* 🌟 Get Started Today Section */}
      <div className="bg-gray-50 py-20">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          {/* Heading */}
          <h2 className="text-4xl font-extrabold text-center text-red-600 mb-6">
            Get Started Today 🚑
          </h2>
          <p className="text-center text-gray-700 mb-12 max-w-2xl mx-auto">
            Join our mission to save lives by registering as a donor, requesting
            blood, or spreading awareness in your community.
          </p>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Donor Registration */}
            <div className="bg-white shadow-md rounded-2xl p-6 text-center hover:shadow-xl transition">
              <div className="text-5xl mb-4">🩸</div>
              <h3 className="text-xl font-semibold mb-2">Become a Donor</h3>
              <p className="text-gray-600 mb-4">
                Register yourself as a blood donor and give the gift of life.
              </p>
              <button className="bg-red-500 text-white px-5 py-2 rounded-lg hover:bg-red-600 transition">
                Register Now
              </button>
            </div>

            {/* Request Blood */}
            <div className="bg-white shadow-md rounded-2xl p-6 text-center hover:shadow-xl transition">
              <div className="text-5xl mb-4">❤️</div>
              <h3 className="text-xl font-semibold mb-2">Request Blood</h3>
              <p className="text-gray-600 mb-4">
                Need urgent blood? Post a request and find nearby donors.
              </p>
              <button className="bg-red-500 text-white px-5 py-2 rounded-lg hover:bg-red-600 transition">
                Request Now
              </button>
            </div>

            {/* Spread Awareness */}
            <div className="bg-white shadow-md rounded-2xl p-6 text-center hover:shadow-xl transition">
              <div className="text-5xl mb-4">📢</div>
              <h3 className="text-xl font-semibold mb-2">Spread Awareness</h3>
              <p className="text-gray-600 mb-4">
                Help us reach more people by sharing and educating others.
              </p>
              <button className="bg-red-500 text-white px-5 py-2 rounded-lg hover:bg-red-600 transition">
                Share Now
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
