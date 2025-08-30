import { motion } from "framer-motion";

export function HowItWorks() {
  return (
    <div className="min-h-screen bg-background py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6">
            How It <span className="text-primary">Works</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Simple steps to connect life-savers with those in need
          </p>
        </div>

        {/* For Donors */}
        <div className="mb-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">For Donors</h2>
            <p className="text-lg text-muted-foreground">Become a hero in just a few simple steps</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <motion.div className="text-center"
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
            >
              <div className="relative mb-6 hover:scale-150 transition-transform duration-300">
                <div className="w-20 h-20 bg-primary rounded-full flex items-center justify-center mx-auto shadow-lg hover:bg-primary-hover transition-colors duration-300">
                  <span className="text-primary-foreground text-2xl font-bold">1</span>
                </div>
                <div className="hidden md:block absolute top-10 left-full w-full h-0.5 bg-primary/20 -translate-y-0.5"></div>
              </div>
              <h3 className="text-xl font-bold text-foreground mb-3">Register</h3>
              <p className="text-muted-foreground">
                Sign up and provide your basic information, blood type, and location
              </p>
            </motion.div>

            <motion.div className="text-center"
                        initial={{ opacity: 0, y: -30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
            >
              <div className="relative mb-6 hover:scale-150 transition-transform duration-300">
                <div className="w-20 h-20 bg-primary rounded-full flex items-center justify-center mx-auto shadow-lg hover:bg-primary-hover transition-colors duration-300">
                  <span className="text-primary-foreground text-2xl font-bold">2</span>
                </div>
                <div className="hidden md:block absolute top-10 left-full w-full h-0.5 bg-primary/20 -translate-y-0.5"></div>
              </div>
              <h3 className="text-xl font-bold text-foreground mb-3">Get Alerts</h3>
              <p className="text-muted-foreground">
                Receive real-time SOS alerts when hospitals near you need your blood type
              </p>
            </motion.div>

            <motion.div className="text-center"
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
            >
              <div className="relative mb-6 hover:scale-150 transition-transform duration-300">
                <div className="w-20 h-20 bg-primary rounded-full flex items-center justify-center mx-auto shadow-lg hover:bg-primary-hover transition-colors duration-300">
                  <span className="text-primary-foreground text-2xl font-bold">3</span>
                </div>
                <div className="hidden md:block absolute top-10 left-full w-full h-0.5 bg-primary/20 -translate-y-0.5"></div>
              </div>
              <h3 className="text-xl font-bold text-foreground mb-3">Respond</h3>
              <p className="text-muted-foreground">
                Choose to help and get instant contact details of the requesting hospital
              </p>
            </motion.div>

            <motion.div className="text-center"
                        initial={{ opacity: 0, y: -30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
            >
              <div className="relative mb-6 hover:scale-150 transition-transform duration-300">
                <div className="w-20 h-20 bg-primary rounded-full flex items-center justify-center mx-auto shadow-lg hover:bg-primary-hover transition-colors duration-300">
                  <span className="text-primary-foreground text-2xl font-bold">4</span>
                </div>
              </div>
              <h3 className="text-xl font-bold text-foreground mb-3">Save Lives</h3>
              <p className="text-muted-foreground">
                Visit the hospital and donate blood to save precious lives
              </p>
            </motion.div>
          </div>
        </div>

        {/* For Hospitals */}
        <div className="mb-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">For Hospitals</h2>
            <p className="text-lg text-muted-foreground">Get the blood you need, when you need it</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <motion.div className="text-center"
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
            >
              <div className="relative mb-6 hover:scale-150 transition-transform duration-300">
                <div className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center mx-auto shadow-lg hover:bg-blue-500 transition-colors duration-300">
                  <span className="text-white text-2xl font-bold">1</span>
                </div>
                <div className="hidden md:block absolute top-10 left-full w-full h-0.5 bg-blue-200 -translate-y-0.5"></div>
              </div>
              <h3 className="text-xl font-bold text-foreground mb-3">Register & Verify</h3>
              <p className="text-muted-foreground">
                Register your hospital and get verified by our team for authenticity
              </p>
            </motion.div>

            <motion.div className="text-center"
                        initial={{ opacity: 0, y: -30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
            >
              <div className="relative mb-6 hover:scale-150 transition-transform duration-300">
                <div className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center mx-auto shadow-lg hover:bg-blue-500 transition-colors duration-300">
                  <span className="text-white text-2xl font-bold">2</span>
                </div>
                <div className="hidden md:block absolute top-10 left-full w-full h-0.5 bg-blue-200 -translate-y-0.5"></div>
              </div>
              <h3 className="text-xl font-bold text-foreground mb-3">Send SOS Alert</h3>
              <p className="text-muted-foreground">
                Create urgent blood requests with specific requirements and urgency level
              </p>
            </motion.div>

            <motion.div className="text-center"
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
            >
              <div className="relative mb-6 hover:scale-150 transition-transform duration-300">
                <div className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center mx-auto shadow-lg hover:bg-blue-500 transition-colors duration-300">
                  <span className="text-white text-2xl font-bold">3</span>
                </div>
                <div className="hidden md:block absolute top-10 left-full w-full h-0.5 bg-blue-200 -translate-y-0.5"></div>
              </div>
              <h3 className="text-xl font-bold text-foreground mb-3">Get Responses</h3>
              <p className="text-muted-foreground">
                Receive instant responses from nearby donors willing to help
              </p>
            </motion.div>

            <motion.div className="text-center"
                        initial={{ opacity: 0, y: -30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
            >
              <div className="relative mb-6 hover:scale-150 transition-transform duration-300">
                <div className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center mx-auto shadow-lg hover:bg-blue-500 transition-colors duration-300">
                  <span className="text-white text-2xl font-bold">4</span>
                </div>
              </div>
              <h3 className="text-xl font-bold text-foreground mb-3">Coordinate</h3>
              <p className="text-muted-foreground">
                Manage donor visits and track blood collection through your dashboard
              </p>
            </motion.div>
          </div>
        </div>

        {/* Key Features */}
        <div className="bg-card rounded-2xl p-8 md:p-12">
          <h2 className="text-3xl font-bold text-center text-foreground mb-12">Key Features</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-foreground mb-2">Real-time Alerts</h3>
              <p className="text-muted-foreground text-sm">Instant notifications for urgent blood requirements</p>
            </div>

            <div className="text-center p-6">
              <div className="w-16 h-16 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-foreground mb-2">Location-based Matching</h3>
              <p className="text-muted-foreground text-sm">Connect with the nearest available donors</p>
            </div>

            <div className="text-center p-6">
              <div className="w-16 h-16 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-foreground mb-2">Verified Network</h3>
              <p className="text-muted-foreground text-sm">All hospitals and donors are verified for safety</p>
            </div>

            <div className="text-center p-6">
              <div className="w-16 h-16 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-foreground mb-2">Mobile-First</h3>
              <p className="text-muted-foreground text-sm">Optimized for mobile devices for quick access</p>
            </div>

            <div className="text-center p-6">
              <div className="w-16 h-16 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-foreground mb-2">Analytics Dashboard</h3>
              <p className="text-muted-foreground text-sm">Track donations and manage requests efficiently</p>
            </div>

            <div className="text-center p-6">
              <div className="w-16 h-16 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-foreground mb-2">24/7 Availability</h3>
              <p className="text-muted-foreground text-sm">Round-the-clock service for emergency situations</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
