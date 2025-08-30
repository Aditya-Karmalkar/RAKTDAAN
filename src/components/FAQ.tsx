import { motion } from "framer-motion";
import { ChevronDown, ChevronUp, HelpCircle } from "lucide-react";
import { useState } from "react";

interface FAQItem {
  id: number;
  question: string;
  answer: string;
  category: string;
}

export function FAQ() {
  const [openItems, setOpenItems] = useState<number[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("all");

  const faqData: FAQItem[] = [
    {
      id: 1,
      question: "What is RaktDaan and how does it work?",
      answer: "RaktDaan is a blood donation platform that connects hospitals, blood donors, and recipients. We facilitate emergency blood requests, donor registration, and real-time matching between donors and those in need.",
      category: "general"
    },
    {
      id: 2,
      question: "Who can donate blood?",
      answer: "Generally, healthy individuals aged 18-65, weighing at least 50kg, can donate blood. You must not have donated blood in the last 3 months and should be free from infections or chronic diseases. A medical screening is conducted before donation.",
      category: "donation"
    },
    {
      id: 3,
      question: "How often can I donate blood?",
      answer: "You can donate whole blood every 3 months (12 weeks). For platelets, you can donate every 2 weeks, and for plasma, every 4 weeks. Our system tracks your donation history to ensure safe intervals.",
      category: "donation"
    },
    {
      id: 4,
      question: "Is blood donation safe?",
      answer: "Yes, blood donation is completely safe. We use sterile, single-use equipment for each donor. The donation process is conducted by trained medical professionals following strict safety protocols.",
      category: "safety"
    },
    {
      id: 5,
      question: "How do I register as a donor?",
      answer: "Click on 'Become a Donor' on our homepage, fill out the registration form with your details, blood type, and contact information. You'll receive a confirmation email and can start receiving donation requests immediately.",
      category: "registration"
    },
    {
      id: 6,
      question: "How do hospitals request blood through RaktDaan?",
      answer: "Hospitals can register on our platform and submit blood requests specifying blood type, quantity, urgency level, and location. Our system automatically notifies matching donors in the area.",
      category: "hospital"
    },
    {
      id: 7,
      question: "What happens during an emergency blood request?",
      answer: "Emergency requests are marked as high priority and sent immediately to all compatible donors within a 25km radius. Donors receive instant notifications via SMS, email, and app notifications.",
      category: "emergency"
    },
    {
      id: 8,
      question: "Can I specify my availability for donations?",
      answer: "Yes, you can set your availability preferences in your donor profile. You can specify preferred times, days, and even temporarily mark yourself as unavailable during travel or illness.",
      category: "donation"
    },
    {
      id: 9,
      question: "How is my personal information protected?",
      answer: "We follow strict data protection protocols. Your personal information is encrypted and only shared with verified hospitals when you consent to a donation. We never sell or share your data with third parties.",
      category: "privacy"
    },
    {
      id: 10,
      question: "What blood types are most needed?",
      answer: "O-negative is the universal donor type and is always in high demand. AB-positive is the universal plasma donor. However, all blood types are needed regularly, especially during emergencies.",
      category: "general"
    },
    {
      id: 11,
      question: "Do I get compensated for donating blood?",
      answer: "Blood donation through RaktDaan is voluntary and unpaid. However, some partner hospitals may provide refreshments, certificates of appreciation, or small tokens of gratitude.",
      category: "donation"
    },
    {
      id: 12,
      question: "What should I do before and after donating blood?",
      answer: "Before: Eat a healthy meal, stay hydrated, get adequate sleep, and avoid alcohol. After: Rest for 10-15 minutes, drink plenty of fluids, avoid heavy lifting for 24 hours, and eat iron-rich foods.",
      category: "safety"
    },
    {
      id: 13,
      question: "Can I track my donation history?",
      answer: "Yes, your donor dashboard shows your complete donation history, including dates, locations, blood components donated, and the impact of your donations.",
      category: "platform"
    },
    {
      id: 14,
      question: "What if I have a rare blood type?",
      answer: "Rare blood types are especially valuable. We maintain a special registry for rare blood donors and prioritize matching for rare blood requests. You may receive more frequent but critical donation requests.",
      category: "general"
    },
    {
      id: 15,
      question: "How do I update my contact information?",
      answer: "Log into your account and go to 'Profile Settings' to update your contact information, address, availability, or medical information. Keep your details current to receive relevant donation requests.",
      category: "platform"
    }
  ];

  const categories = [
    { id: "all", label: "All Questions" },
    { id: "general", label: "General" },
    { id: "donation", label: "Blood Donation" },
    { id: "safety", label: "Safety" },
    { id: "registration", label: "Registration" },
    { id: "hospital", label: "For Hospitals" },
    { id: "emergency", label: "Emergency" },
    { id: "privacy", label: "Privacy" },
    { id: "platform", label: "Platform" }
  ];

  const toggleItem = (id: number) => {
    setOpenItems(prev => 
      prev.includes(id) 
        ? prev.filter(item => item !== id)
        : [...prev, id]
    );
  };

  const filteredFAQs = selectedCategory === "all" 
    ? faqData 
    : faqData.filter(item => item.category === selectedCategory);

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-white py-16">
      <div className="container mx-auto px-4">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center shadow-lg">
              <HelpCircle className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Frequently Asked Questions
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Find answers to common questions about blood donation, the RaktDaan platform, 
            and how you can help save lives in your community.
          </p>
        </motion.div>

        {/* Category Filter */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <div className="flex flex-wrap justify-center gap-2 mb-8">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  selectedCategory === category.id
                    ? "bg-red-600 text-white"
                    : "bg-white text-gray-700 hover:bg-red-50 hover:text-red-600 border border-gray-200"
                }`}
              >
                {category.label}
              </button>
            ))}
          </div>
        </motion.div>

        {/* FAQ Items */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="max-w-4xl mx-auto"
        >
          <div className="space-y-4">
            {filteredFAQs.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow"
              >
                <button
                  onClick={() => toggleItem(item.id)}
                  className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-50 rounded-xl transition-colors"
                >
                  <h3 className="text-lg font-semibold text-gray-900 pr-4">
                    {item.question}
                  </h3>
                  {openItems.includes(item.id) ? (
                    <ChevronUp className="w-5 h-5 text-red-600 flex-shrink-0" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-red-600 flex-shrink-0" />
                  )}
                </button>
                {openItems.includes(item.id) && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                    className="px-6 pb-4"
                  >
                    <div className="border-t border-gray-100 pt-4">
                      <p className="text-gray-700 leading-relaxed">
                        {item.answer}
                      </p>
                    </div>
                  </motion.div>
                )}
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Contact Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-16 text-center"
        >
          <div className="bg-white rounded-xl shadow-lg p-8 max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Still have questions?
            </h2>
            <p className="text-gray-600 mb-6">
              Can't find the answer you're looking for? Our support team is here to help 24/7.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <div className="flex items-center justify-center text-red-600">
                <span className="font-semibold">Emergency Hotline: +91 8XX-Rakt-Daan</span>
              </div>
              <div className="flex items-center justify-center text-gray-600">
                <span>Email: support@raktdaan.org</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
