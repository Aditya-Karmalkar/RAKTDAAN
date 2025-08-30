import { Authenticated, Unauthenticated } from "convex/react";
import { useNavigate } from "react-router-dom";
import { SignInForm } from "../SignInForm";
import Counter from "./StatsCountingUI"; // counting UI feature

interface HomeProps {
  onNavigate: (screen: string) => void;
}

export function Home({ onNavigate }: HomeProps) {
  const navigate = useNavigate(); // useNavigate for routing

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            {/* Hero Image/Icon */}
            <div className="mb-8 flex justify-center">
              <div className="relative">
                <div className="w-32 h-32 bg-primary rounded-full flex items-center justify-center shadow-2xl">
                  <svg
                    className="w-16 h-16 text-primary-foreground"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                  </svg>
                </div>
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-lg">
                  <span className="text-primary text-xl">+</span>
                </div>
              </div>
            </div>

            {/* Main Heading */}
            <h1 className="text-5xl md:text-7xl font-bold text-foreground mb-6 logo-heading">
              <span className="text-primary">Rakt</span>Daan
            </h1>

            {/* Tagline */}
            <p className="text-2xl md:text-3xl text-muted-foreground mb-4 font-light">
              Where You Bond By Blood
            </p>

            {/* Subtitle */}
            <p className="text-lg md:text-xl text-muted-foreground/90 mb-12 max-w-3xl mx-auto leading-relaxed">
              Connecting hospitals, blood donors, and recipients for a fast,
              seamless, and trusted blood donation experience, especially in
              emergencies.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Authenticated>
                <button
                  onClick={() => navigate("/donor-registration")}
                  className="bg-primary text-primary-foreground px-8 py-4 rounded-lg text-lg font-semibold hover:bg-primary-hover transform hover:scale-105 transition-all duration-200 shadow-lg"
                >
                  Become a Lifesaver
                </button>
                <button
                  onClick={() => navigate("/hospital-registration")}
                  className="border-2 border-primary text-primary px-8 py-4 rounded-lg text-lg font-semibold hover:bg-primary hover:text-primary-foreground transition-all duration-200"
                >
                  Hospital Registration
                </button>
              </Authenticated>

              <Unauthenticated>
                <div className="w-full max-w-md">
                  <SignInForm />
                  <p className="text-sm text-muted-foreground mt-4">
                    Sign in to become a lifesaver or register your hospital
                  </p>
                </div>
              </Unauthenticated>
            </div>
          </div>
        </div>

        {/* Floating Elements */}
        <div className="absolute top-20 left-10 w-4 h-4 bg-primary/20 rounded-full animate-pulse"></div>
        <div className="absolute top-40 right-20 w-6 h-6 bg-primary/30 rounded-full animate-pulse delay-1000"></div>
        <div className="absolute bottom-20 left-20 w-3 h-3 bg-primary/40 rounded-full animate-pulse delay-2000"></div>
      </div>

      {/* Quick Stats */}
      <div className="bg-card py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <Counter target={24} label="Emergency Response (Hours)" suffix="/7" />
            <Counter target={1000} label="Lives Saved" />
            <Counter target={500} label="Active Donors" />
          </div>
        </div>
      </div>

      {/* 🌟 Get Started Today Section */}
      <div className="bg-muted py-20">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          {/* Heading */}
          <h2 className="text-4xl font-extrabold text-center text-primary mb-6">
            Get Started Today 🚑
          </h2>
          <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
            Join our mission to save lives by registering as a donor, requesting
            blood, or spreading awareness in your community.
          </p>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Donor Registration */}
            <div className="bg-card shadow-md rounded-2xl p-6 text-center hover:shadow-xl transition border border-border">
              <div className="text-5xl mb-4">🩸</div>
              <h3 className="text-xl font-semibold mb-2 text-foreground">Become a Donor</h3>
              <p className="text-muted-foreground mb-4">
                Register yourself as a blood donor and give the gift of life.
              </p>
              <button
                onClick={() => navigate("/donor-registration")}
                className="bg-primary text-primary-foreground px-5 py-2 rounded-lg hover:bg-primary-hover transition"
              >
                Register Now
              </button>
            </div>

            {/* Request Blood */}
            <div className="bg-card shadow-md rounded-2xl p-6 text-center hover:shadow-xl transition border border-border">
              <div className="text-5xl mb-4">❤️</div>
              <h3 className="text-xl font-semibold mb-2 text-foreground">Request Blood</h3>
              <p className="text-muted-foreground mb-4">
                Need urgent blood? Post a request and find nearby donors.
              </p>
              <button
                onClick={() => navigate("/hospital-registration")}
                className="bg-primary text-primary-foreground px-5 py-2 rounded-lg hover:bg-primary-hover transition"
              >
                Request Now
              </button>
            </div>

            {/* Spread Awareness */}
            <div className="bg-card shadow-md rounded-2xl p-6 text-center hover:shadow-xl transition border border-border">
              <div className="text-5xl mb-4">📢</div>
              <h3 className="text-xl font-semibold mb-2 text-foreground">Spread Awareness</h3>
              <p className="text-muted-foreground mb-4">
                Help us reach more people by sharing and educating others.
              </p>
              <button
                onClick={() => alert("Sharing feature coming soon!")}
                className="bg-primary text-primary-foreground px-5 py-2 rounded-lg hover:bg-primary-hover transition"
              >
                Share Now
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
