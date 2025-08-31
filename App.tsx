import { Authenticated, Unauthenticated, useQuery } from "convex/react";
import { useState } from "react";
import { Toaster } from "sonner";
import { api } from "../convex/_generated/api";
import { AdminDashboard } from "./components/AdminDashboard";
import { Contact } from "./components/Contact";
import { Dashboard } from "./components/Dashboard";
import { DonorRegistration } from "./components/DonorRegistration";
import { Footer } from "./components/Footer";
import { Gallery } from "./components/Gallery";
import { Home } from "./components/Home";
import { HospitalRegistration } from "./components/HospitalRegistration";
import { HowItWorks } from "./components/HowItWorks";
import { LiveDonorAlert } from "./components/LiveDonorAlert";
import { Mission } from "./components/Mission";
import { SosAlert } from "./components/SosAlert";
import { Testimonials } from "./components/Testimonials";
import { SignOutButton } from "./SignOutButton";
import { useNotifications } from "./hooks/useNotifications";
import NotificationPopup from "./components/NotificationPopup";
import ScrollToTopButton from "./components/ScrollToTopButton";
import React from "react";

export default function App() {
  const [currentScreen, setCurrentScreen] = useState("home");
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const loggedInUser = useQuery(api.auth.loggedInUser);
  const currentDonor = useQuery(api.donors.getCurrentDonor);
  const currentHospital = useQuery(api.hospitals.getCurrentHospital);
  const isAdmin = useQuery(api.admin.isCurrentUserAdmin);
  
  // Notification system
  const { notifications, hideNotification } = useNotifications();

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
        return <Home onNavigate={setCurrentScreen} />;
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
        return <Home onNavigate={setCurrentScreen} />;
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Sticky Navigation */}
      <nav className="sticky top-0 z-50 bg-background/80 backdrop-blur-sm border-b border-border/40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div 
              className="flex items-center cursor-pointer group"
              onClick={() => setCurrentScreen("home")}
            >
              <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center mr-3 transition-transform group-hover:scale-110">
                <span className="text-primary-foreground font-bold text-sm">R</span>
              </div>
              <span className="text-xl font-bold text-primary font-heading">RaktDaan</span>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-4">
              {screens.slice(0, 6).map((screen) => (
                <button
                  key={screen.id}
                  onClick={() => setCurrentScreen(screen.id)}
                  className={`px-3 py-2 text-sm font-medium transition-colors relative group ${
                    currentScreen === screen.id
                      ? "text-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {screen.label}
                  <span className={`absolute bottom-0 left-0 w-full h-0.5 bg-primary scale-x-0 group-hover:scale-x-100 transition-transform ${
                    currentScreen === screen.id ? "scale-x-100" : ""
                  }`}></span>
                </button>
              ))}
              
              <Authenticated>
                <div className="flex items-center space-x-3 ml-2">
                  {currentDonor !== undefined && currentDonor && (
                    <button
                      onClick={() => setCurrentScreen("live-alerts")}
                      className="bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors text-sm font-medium"
                    >
                      Live Alerts
                    </button>
                  )}
                  {currentHospital !== undefined && currentHospital && (
                    <button
                      onClick={() => setCurrentScreen("dashboard")}
                      className="bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors text-sm font-medium"
                    >
                      Dashboard
                    </button>
                  )}
                  {isAdmin === true && (
                    <button
                      onClick={() => setCurrentScreen("admin")}
                      className="bg-destructive text-destructive-foreground px-4 py-2 rounded-lg hover:bg-destructive/90 transition-colors text-sm font-medium"
                    >
                      Admin
                    </button>
                  )}
                  <SignOutButton />
                </div>
              </Authenticated>

              <Unauthenticated>
                <button
                  onClick={() => setCurrentScreen("home")}
                  className="bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors text-sm font-medium"
                >
                  Sign In
                </button>
              </Unauthenticated>
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="text-muted-foreground hover:text-foreground transition-colors p-2 -mr-2"
                aria-label="Toggle menu"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
          </div>

          {/* Mobile Navigation */}
          {isMenuOpen && (
            <div className="md:hidden py-2 border-t border-border/40 bg-background/95 backdrop-blur-sm">
              <div className="flex flex-col space-y-1">
                {screens.map((screen) => (
                  <button
                    key={screen.id}
                    onClick={() => {
                      setCurrentScreen(screen.id);
                      setIsMenuOpen(false);
                    }}
                    className={`text-left px-4 py-3 text-sm font-medium transition-colors rounded-md mx-2 ${
                      currentScreen === screen.id
                        ? "bg-accent text-accent-foreground"
                        : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                    }`}
                  >
                    {screen.label}
                  </button>
                ))}
                <div className="pt-2 border-t border-border/40 mt-2 px-2">
                  <Authenticated>
                    <div className="px-2 py-2">
                      <SignOutButton />
                    </div>
                  </Authenticated>
                  <Unauthenticated>
                    <button
                      onClick={() => {
                        setCurrentScreen("home");
                        setIsMenuOpen(false);
                      }}
                      className="w-full text-center bg-primary text-primary-foreground px-4 py-2.5 rounded-lg hover:bg-primary/90 transition-colors text-sm font-medium"
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
      <main className="min-h-[calc(100vh-4rem)]">{renderScreen()}</main>

      {/* Footer */}
      <Footer onNavigate={setCurrentScreen} />

      {/* Scroll to top button */}
      <ScrollToTopButton />

      {/* Toast Notifications */}
      <Toaster 
        position="top-center" 
        theme="light"
        toastOptions={{
          classNames: {
            toast: 'group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg',
            description: 'group-[.toast]:text-muted-foreground',
            actionButton: 'group-[.toast]:bg-primary group-[.toast]:text-primary-foreground',
            cancelButton: 'group-[.toast]:bg-muted group-[.toast]:text-muted-foreground',
          },
        }}
      />
      
      {/* Notification Popups */}
      <div className="fixed bottom-4 right-4 space-y-3 z-50">
        {notifications.map((notification) => (
          <NotificationPopup
            key={notification.id}
            notification={notification}
            onClose={() => hideNotification(notification.id)}
          />
        ))}
      </div>
      <ScrollToTopButton />
    </div>
  );
}
