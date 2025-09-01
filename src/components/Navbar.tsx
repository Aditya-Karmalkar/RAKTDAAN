"use client";
import { useState } from "react";
import AddToggle from "./AddToggle"; // ✅ Dark/Light toggle component import
import { Authenticated } from "@supabase/auth-helpers-react"; // अगर तुम auth यूज़ कर रहे हो

interface Screen {
  id: string;
  label: string;
}

const screens: Screen[] = [
  { id: "home", label: "Home" },
  { id: "about", label: "About" },
  { id: "services", label: "Services" },
  { id: "projects", label: "Projects" },
  { id: "contact", label: "Contact" },
  { id: "blog", label: "Blog" },
];

export default function Navbar() {
  const [currentScreen, setCurrentScreen] = useState("home");
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <nav className="bg-white dark:bg-gray-900 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Logo */}
          <div className="text-xl font-bold text-red-600">MySite</div>

          {/* ✅ Desktop Nav */}
          <div className="hidden md:flex items-center space-x-6">
            {screens.slice(0, 6).map((screen) => (
              <button
                key={screen.id}
                onClick={() => setCurrentScreen(screen.id)}
                className={`px-3 py-2 text-sm font-medium transition-colors ${
                  currentScreen === screen.id
                    ? "text-red-600 border-b-2 border-red-600"
                    : "text-gray-700 dark:text-gray-200 hover:text-red-600"
                }`}
              >
                {screen.label}
              </button>
            ))}

            {/* ✅ Dark/Light Toggle Button */}
            <AddToggle />

            <Authenticated>
              <div className="flex items-center space-x-4">
                <span className="text-gray-700 dark:text-gray-200">Profile</span>
              </div>
            </Authenticated>
          </div>

          {/* ✅ Mobile Hamburger */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="text-gray-700 dark:text-gray-200 hover:text-red-600"
            >
              ☰
            </button>
          </div>
        </div>
      </div>

      {/* ✅ Mobile Menu */}
      {mobileOpen && (
        <div className="md:hidden px-4 pb-4 space-y-2 border-t border-gray-200 dark:border-gray-700">
          {screens.map((screen) => (
            <button
              key={screen.id}
              onClick={() => {
                setCurrentScreen(screen.id);
                setMobileOpen(false);
              }}
              className={`block w-full text-left px-3 py-2 text-sm font-medium transition-colors ${
                currentScreen === screen.id
                  ? "text-red-600 border-b-2 border-red-600"
                  : "text-gray-700 dark:text-gray-200 hover:text-red-600"
              }`}
            >
              {screen.label}
            </button>
          ))}

          {/* ✅ Mobile Toggle */}
          <div className="py-2">
            <AddToggle />
          </div>
        </div>
      )}
    </nav>
  );
}
