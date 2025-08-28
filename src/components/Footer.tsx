interface FooterProps {
  setCurrentScreen: (screen: string) => void;
}

export function Footer({ setCurrentScreen }: FooterProps) {
  return (
    <footer className="bg-gray-900 text-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo and Description */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center mb-4">
              <div className="w-8 h-8 bg-red-600 rounded-full flex items-center justify-center mr-3">
                <span className="text-white font-bold text-sm">R</span>
              </div>
              <span className="text-2xl font-bold text-red-600">RaktDaan</span>
            </div>
            <p className="text-gray-300 mb-6 max-w-md">
              Connecting hospitals, blood donors, and recipients for a fast, seamless, 
              and trusted blood donation experience, especially in emergencies.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li><button onClick={() => setCurrentScreen("home")} className="text-gray-300 hover:text-white transition-colors">Home</button></li>
              <li><button onClick={() => setCurrentScreen("mission")} className="text-gray-300 hover:text-white transition-colors">Our Mission</button></li>
              <li><button onClick={() => setCurrentScreen("how-it-works")} className="text-gray-300 hover:text-white transition-colors">How It Works</button></li>
              <li><button onClick={() => setCurrentScreen("donor-registration")} className="text-gray-300 hover:text-white transition-colors">Become a Donor</button></li>
              <li><button onClick={() => setCurrentScreen("hospital-registration")} className="text-gray-300 hover:text-white transition-colors">Hospital Registration</button></li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Support</h3>
            <ul className="space-y-2">
              <li><button onClick={() => setCurrentScreen("contact")} className="text-gray-300 hover:text-white transition-colors">Contact Us</button></li>
              <li><a href="#" className="text-gray-300 hover:text-white transition-colors">FAQ</a></li>
              <li><a href="#" className="text-gray-300 hover:text-white transition-colors">Privacy Policy</a></li>
              <li>
                <button 
                  onClick={() => setCurrentScreen("term")} 
                  className="text-gray-300 hover:text-white transition-colors"
                >
                  Terms of Service
                </button>
              </li>
              <li><button onClick={() => setCurrentScreen("emergency")} className="text-gray-300 hover:text-white transition-colors">Emergency Hotline</button></li>
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-gray-800 mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="text-gray-400 text-sm mb-4 md:mb-0">
              © 2024 RaktDaan. All rights reserved. Saving lives, one donation at a time.
            </div>
            <div className="flex items-center space-x-6 text-sm">
              <div className="flex items-center text-green-400">
                <div className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></div>
                System Status: Online
              </div>
              <div className="text-gray-400">
                24/7 Emergency Support: +91 8XX-Rakt-Daan
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
