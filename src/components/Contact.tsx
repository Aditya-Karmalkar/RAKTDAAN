import { useMutation } from "convex/react";
import { useState } from "react";
import { toast } from "sonner";
import { api } from "../../convex/_generated/api";

export function Contact() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const submitContactMessage = useMutation(api.contact.submitContactMessage);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await submitContactMessage(formData);
      toast.success("Message sent successfully! We'll get back to you soon.");
      setFormData({
        name: "",
        email: "",
        subject: "",
        message: "",
      });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to send message");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="min-h-screen bg-background py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6">
            Contact <span className="text-primary">Us</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Have questions, suggestions, or need help? We're here to assist you in saving lives.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact Form */}
          <div className="bg-card rounded-2xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-foreground mb-6">Send us a Message</h2>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-foreground mb-2">
                  Full Name *
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-input rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-colors bg-background text-foreground"
                  placeholder="Enter your full name"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-foreground mb-2">
                  Email Address *
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-input rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-colors bg-background text-foreground"
                  placeholder="your.email@example.com"
                />
              </div>

              <div>
                <label htmlFor="subject" className="block text-sm font-medium text-foreground mb-2">
                  Subject *
                </label>
                <select
                  id="subject"
                  name="subject"
                  required
                  value={formData.subject}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-input rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-colors bg-background text-foreground"
                >
                  <option value="">Select a subject</option>
                  <option value="General Inquiry">General Inquiry</option>
                  <option value="Donor Registration Help">Donor Registration Help</option>
                  <option value="Hospital Registration">Hospital Registration</option>
                  <option value="Technical Support">Technical Support</option>
                  <option value="Partnership Opportunity">Partnership Opportunity</option>
                  <option value="Feedback">Feedback</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label htmlFor="message" className="block text-sm font-medium text-foreground mb-2">
                  Message *
                </label>
                <textarea
                  id="message"
                  name="message"
                  required
                  rows={6}
                  value={formData.message}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-input rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-colors resize-none bg-background text-foreground"
                  placeholder="Please describe your inquiry in detail..."
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-primary text-primary-foreground py-3 px-6 rounded-lg font-semibold hover:bg-primary-hover disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isSubmitting ? "Sending..." : "Send Message"}
              </button>
            </form>
          </div>

          {/* Contact Information */}
          <div className="space-y-8">
            {/* Contact Details */}
            <div className="bg-card rounded-2xl shadow-lg p-8">
              <h2 className="text-2xl font-bold text-foreground mb-6">Get in Touch</h2>
              
              <div className="space-y-6">
                <div className="flex items-start">
                  <div className="w-12 h-12 bg-accent rounded-lg flex items-center justify-center mr-4 flex-shrink-0">
                    <svg className="w-6 h-6 text-accent-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-3 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-1">Email</h3>
                    <p className="text-muted-foreground">support@raktdaan.org</p>
                    <p className="text-muted-foreground">emergency@raktdaan.org</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="w-12 h-12 bg-accent rounded-lg flex items-center justify-center mr-4 flex-shrink-0">
                    <svg className="w-6 h-6 text-accent-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-1">Phone</h3>
                    <p className="text-muted-foreground">+91 8XX-Rakt-Daan</p>
                    <p className="text-muted-foreground">24/7 Emergency Hotline</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="w-12 h-12 bg-accent rounded-lg flex items-center justify-center mr-4 flex-shrink-0">
                    <svg className="w-6 h-6 text-accent-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-1">Address</h3>
                    <p className="text-muted-foreground">123 Lifesaver Street</p>
                    <p className="text-muted-foreground">Healthcare District</p>
                    <p className="text-muted-foreground">Pune, Maharashtra 12345</p>
                  </div>
                </div>
              </div>
            </div>

            {/* FAQ */}
            <div className="bg-card rounded-2xl shadow-lg p-8">
              <h2 className="text-2xl font-bold text-foreground mb-6">Frequently Asked Questions</h2>
              
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-foreground mb-2">How do I register as a donor?</h3>
                  <p className="text-muted-foreground text-sm">Simply sign in and navigate to "Become a Donor" to complete your registration with basic information and blood type.</p>
                </div>

                <div>
                  <h3 className="font-semibold text-foreground mb-2">How long does hospital verification take?</h3>
                  <p className="text-muted-foreground text-sm">Hospital verification typically takes 24-48 hours. Our team reviews all documentation to ensure authenticity.</p>
                </div>

                <div>
                  <h3 className="font-semibold text-foreground mb-2">Is my personal information secure?</h3>
                  <p className="text-muted-foreground text-sm">Yes, we use industry-standard encryption and security measures to protect all user data and medical information.</p>
                </div>

                <div>
                  <h3 className="font-semibold text-foreground mb-2">Can I update my availability status?</h3>
                  <p className="text-muted-foreground text-sm">Yes, donors can update their availability status anytime through their profile to control when they receive alerts.</p>
                </div>
              </div>
            </div>

            {/* Emergency Contact */}
            <div className="bg-destructive/10 rounded-2xl p-8 border border-destructive/20">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-destructive rounded-lg flex items-center justify-center mr-4">
                  <svg className="w-6 h-6 text-destructive-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
                <h2 className="text-xl font-bold text-destructive">Emergency Support</h2>
              </div>
              <p className="text-destructive mb-4">
                For urgent blood requirements or critical emergencies, contact our 24/7 hotline immediately.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <a
                  href="tel:+91 8XX-Rakt-Daan"
                  className="bg-destructive text-destructive-foreground px-6 py-3 rounded-lg font-semibold hover:bg-destructive/90 transition-colors text-center"
                >
                  Call Emergency Line
                </a>
                <a
                  href="mailto:emergency@raktdaan.org"
                  className="border-2 border-destructive text-destructive px-6 py-3 rounded-lg font-semibold hover:bg-destructive hover:text-destructive-foreground transition-colors text-center"
                >
                  Email Emergency
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
