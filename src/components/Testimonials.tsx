import { motion } from "framer-motion";
import { Heart, Hospital, Users, X } from "lucide-react";
import { useState } from "react";

export function Testimonials() {
  const [showForm, setShowForm] = useState(false);

  // 🔹 Dummy hardcoded stories
  const stories = [
    {
      _id: "1",
      name: "Ravi Sharma",
      role: "Donor",
      content:
        "I donated blood for the first time during a college camp. A week later, I got to know that my blood helped save a 10-year-old boy who had met with an accident. That feeling of being able to save a life was priceless!",
    },
    {
      _id: "2",
      name: "Priya Mehta",
      role: "Recipient",
      content:
        "During my pregnancy, I faced heavy blood loss and urgently needed donors. Within hours, volunteers stepped in and I received the required units. Today, I am alive and holding my healthy baby — thanks to those selfless donors.",
    },
    {
      _id: "3",
      name: "Apollo City Hospital",
      role: "Hospital",
      content:
        "We often face emergencies where blood is needed at odd hours. Through this platform, multiple donors have come forward at the right time, making it possible for us to save critical patients almost immediately.",
    },
    {
      _id: "4",
      name: "Ankit Verma",
      role: "Donor",
      content:
        "My father survived because of timely donors during his surgery. Since then, I make it a point to donate blood every 3 months. It feels like giving someone else’s family the same gift of life my father received.",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-white py-16">
      <div className="container mx-auto px-4">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Life-Saving Stories
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Read inspiring stories from donors and recipients whose lives were
            touched by the power of blood donation.
          </p>
          <button
            onClick={() => setShowForm(true)}
            className="mt-6 bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-colors"
          >
            Share Your Story
          </button>
        </motion.div>

        {/* Stories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {stories.map((story, index) => (
            <motion.div
              key={story._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow"
            >
              <div className="flex items-center mb-4">
                {story.role === "Donor" && (
                  <Heart className="w-6 h-6 text-red-600 mr-2" />
                )}
                {story.role === "Recipient" && (
                  <Users className="w-6 h-6 text-blue-600 mr-2" />
                )}
                {story.role === "Hospital" && (
                  <Hospital className="w-6 h-6 text-green-600 mr-2" />
                )}
                <h3 className="font-semibold text-gray-900">{story.name}</h3>
              </div>
              <p className="text-gray-700 mb-4">{story.content}</p>
              <span className="text-sm font-medium text-gray-500">
                {story.role}
              </span>
            </motion.div>
          ))}
        </div>

        {/* Form Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-white rounded-xl p-8 max-w-md w-full relative"
            >
              <button
                onClick={() => setShowForm(false)}
                className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
              >
                <X className="w-6 h-6" />
              </button>
              <h2 className="text-2xl font-bold mb-4">Share Your Story</h2>
              <form className="space-y-4">
                <input
                  type="text"
                  placeholder="Your Name"
                  className="w-full p-3 border rounded-lg"
                />
                <select className="w-full p-3 border rounded-lg">
                  <option value="">Select Role</option>
                  <option value="Donor">Donor</option>
                  <option value="Recipient">Recipient</option>
                  <option value="Hospital">Hospital</option>
                </select>
                <textarea
                  placeholder="Your Story"
                  className="w-full p-3 border rounded-lg h-32"
                />
                <button
                  type="submit"
                  className="w-full bg-red-600 text-white py-3 rounded-lg hover:bg-red-700 transition-colors"
                >
                  Submit Story
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
}
