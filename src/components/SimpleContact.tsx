import React, { useState } from "react";

export default function SimpleContact() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
        <h2 className="text-2xl font-bold mb-4 text-red-600">Contact Us</h2>
        {submitted ? (
          <div className="text-green-600 font-semibold text-center">Thank you for contacting us!</div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="text"
              placeholder="Your Name"
              className="w-full p-2 border rounded"
              value={name}
              onChange={e => setName(e.target.value)}
              required
            />
            <input
              type="email"
              placeholder="Your Email"
              className="w-full p-2 border rounded"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
            <textarea
              placeholder="Your Message"
              className="w-full p-2 border rounded"
              value={message}
              onChange={e => setMessage(e.target.value)}
              required
              rows={4}
            />
            <button
              type="submit"
              className="w-full bg-red-600 text-white py-2 rounded hover:bg-red-700 transition"
            >
              Send Message
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
