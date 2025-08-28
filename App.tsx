import { Authenticated, Unauthenticated, useQuery } from "convex/react";
import { useState } from "react";
import { Toaster } from "sonner";
// import { api } from "../convex/_generated/api"; // Disabled due to missing module
import { AdminDashboard } from "./src/components/AdminDashboard";
import { Contact } from "./src/components/Contact";
import { Dashboard } from "./src/components/Dashboard";
import { DonorRegistration } from "./src/components/DonorRegistration";
import { Footer } from "./src/components/Footer";
import { Gallery } from "./src/components/Gallery";
import { Home } from "./src/components/Home";
import { HospitalRegistration } from "./src/components/HospitalRegistration";
import { HowItWorks } from "./src/components/HowItWorks";
import { LiveDonorAlert } from "./src/components/LiveDonorAlert";
import { Mission } from "./src/components/Mission";
import { SosAlert } from "./src/components/SosAlert";
import Testimonials from "./src/components/Testimonials";
import { SignOutButton } from "./src/SignOutButton";
import { useNotifications } from "./src/hooks/useNotifications";
import NotificationPopup from "./src/components/NotificationPopup";
import ScrollToTopButton from "./src/components/ScrollToTopButton";

export default function App() {
  const [currentScreen, setCurrentScreen] = useState("home");
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  // Disabled api usage due to missing module
  // const loggedInUser = useQuery(api.auth.loggedInUser);
  // const currentDonor = useQuery(api.donors.getCurrentDonor);
  // const currentHospital = useQuery(api.hospitals.getCurrentHospital);
  // const isAdmin = useQuery(api.admin.isCurrentUserAdmin);
  // Notification system
  const { notifications, hideNotification } = useNotifications();
  // Dummy values for navigation (remove when api is available)
  const currentDonor = true;
  const currentHospital = true;
  const isAdmin = true;

  const screens = [
    { id: "home", label: "Home" },
    { id: "mission", label: "Mission" },
    { id: "how-it-works", label: "How It Works" },
    { id: "gallery", label: "Gallery" },
    { id: "donor-registration", label: "Become a Donor" },
    { id: "hospital-registration", label: "Hospital Registration" },
    { id: "sos-alert", label: "SOS Alert" },
    { id: "live-alerts", label: "Live Alerts" },
    { id: "dashboard", label: "Dashboard" },
    ...(isAdmin ? [{ id: "admin", label: "Admin" }] : []),
    { id: "testimonials", label: "Stories" },
    { id: "contact", label: "Contact" },
  ];

  const renderScreen = () => {
    switch (currentScreen) {
      case "home":
        return <Home />;
      case "mission":
        return <Mission />;
      case "how-it-works":
        return <HowItWorks />;
      case "gallery":
        return <Gallery />;
      case "donor-registration":
        return <DonorRegistration />;
      case "hospital-registration":
        return <HospitalRegistration />;
      case "sos-alert":
        return <SosAlert />;
      case "live-alerts":
        return <LiveDonorAlert />;
      case "dashboard":
        return <Dashboard />;
      case "admin":
        return <AdminDashboard />;
      case "testimonials":
        return <Testimonials />;
      case "contact":
        return <Contact />;
      default:
        return <Home />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sticky Navigation */}
      <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-red-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div 
              className="flex items-center cursor-pointer"
              onClick={() => setCurrentScreen("home")}
            >
              <div className="w-8 h-8 bg-red-600 rounded-full flex items-center justify-center mr-3">
                <span className="text-white font-bold text-sm">R</span>
              </div>
              <span className="text-xl font-bold text-red-600">RaktDaan</span>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-6">
              {screens.slice(0, 6).map((screen) => (
                <button
                  key={screen.id}
                  onClick={() => setCurrentScreen(screen.id)}
                  className={`px-3 py-2 text-sm font-medium transition-colors ${
                    currentScreen === screen.id
                      ? "text-red-600 border-b-2 border-red-600"
                      : "text-gray-700 hover:text-red-600"
                  }`}
                >
                  {screen.label}
                </button>
              ))}
              
              <Authenticated>
                <div className="flex items-center space-x-4">
                  {currentDonor !== undefined && currentDonor && (
                    <button
                      onClick={() => setCurrentScreen("live-alerts")}
                      className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
                    >
                      Live Alerts
                    </button>
                  )}
                  {currentHospital !== undefined && currentHospital && (
                    <button
                      onClick={() => setCurrentScreen("dashboard")}
                      className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
                    >
                      Dashboard
                    </button>
                  )}
                  {isAdmin === true && (
                    <button
                      onClick={() => setCurrentScreen("admin")}
                      className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
                    >
                      Admin Dashboard
                    </button>
                  )}
                  <SignOutButton />
                </div>
              </Authenticated>

              <Unauthenticated>
                <button
                  onClick={() => setCurrentScreen("home")}
                  className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
                >
                  Sign In
                </button>
              </Unauthenticated>
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="text-gray-700 hover:text-red-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
          </div>

          {/* Mobile Navigation */}
          {isMenuOpen && (
            <div className="md:hidden py-4 border-t border-gray-200">
              <div className="flex flex-col space-y-2">
                {screens.map((screen) => (
                  <button
                    key={screen.id}
                    onClick={() => {
                      setCurrentScreen(screen.id);
                      setIsMenuOpen(false);
                    }}
                    className={`text-left px-3 py-2 text-sm font-medium transition-colors ${
                      currentScreen === screen.id
                        ? "text-red-600 bg-red-50"
                        : "text-gray-700 hover:text-red-600"
                    }`}
                  >
                    {screen.label}
                  </button>
                ))}
                <div className="pt-2 border-t border-gray-200">
                  <Authenticated>
                    <SignOutButton />
                  </Authenticated>
                  <Unauthenticated>
                    <button
                      onClick={() => {
                        setCurrentScreen("home");
                        setIsMenuOpen(false);
                      }}
                      className="w-full text-left bg-red-600 text-white px-3 py-2 rounded-lg hover:bg-red-700 transition-colors"
                    >
                      Sign In
                    </button>
                  </Unauthenticated>
                </div>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Main Content */}
      <main className="transition-all duration-500 ease-in-out">
        {renderScreen()}
      </main>

      {/* Footer */}
      <Footer />

      <Toaster />
      
      {/* Notification Popups */}
      {notifications.map(notification => (
        <NotificationPopup
          key={notification.id}
          notification={notification}
          onClose={hideNotification}
        />
      ))}
      <ScrollToTopButton />
    </div>
  );
}
