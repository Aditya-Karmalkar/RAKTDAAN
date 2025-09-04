import { mutation } from "./_generated/server";

export const seedSampleData = mutation({
  handler: async (ctx) => {
    // Create sample testimonials
    const testimonials = [
      {
        name: "John Doe",
        role: "donor",
        message: "Donating blood through RaktDaan was incredibly easy and meaningful. The platform connected me with a local hospital in need, and I was able to help save a life!",
        location: "New York, NY",
        approved: true
      },
      {
        name: "Dr. Sarah Wilson",
        role: "hospital",
        message: "RaktDaan has revolutionized how we manage blood shortages. The real-time donor alerts have helped us secure blood supplies 3x faster than traditional methods.",
        location: "City General Hospital, NY",
        approved: true
      },
      {
        name: "Maria Garcia",
        role: "recipient",
        message: "Thanks to RaktDaan and the generous donors, I received the blood transfusion I needed during my surgery. This platform literally saved my life!",
        location: "Los Angeles, CA", 
        approved: true
      },
      {
        name: "Michael Chen",
        role: "donor",
        message: "As a regular blood donor, RaktDaan makes it so convenient to find nearby hospitals in need. I love being able to help my community!",
        location: "Chicago, IL",
        approved: true
      }
    ];

    // Insert testimonials
    for (const testimonial of testimonials) {
      await ctx.db.insert("testimonials", testimonial);
    }

    // Create sample contact messages
    const contactMessages = [
      {
        name: "Alex Johnson",
        email: "alex@example.com",
        subject: "Partnership Inquiry",
        message: "Hi, I represent a medical NGO and would like to partner with RaktDaan to expand blood donation awareness in rural areas.",
        status: "new"
      },
      {
        name: "Dr. Robert Lee",
        email: "rlee@hospital.com", 
        subject: "Hospital Verification",
        message: "Please help verify our hospital for the RaktDaan platform. We are Metro Health Center with license #MH2024.",
        status: "new"
      }
    ];

    // Insert contact messages
    for (const message of contactMessages) {
      await ctx.db.insert("contactMessages", message);
    }

    return {
      success: true,
      message: "Sample data seeded successfully!",
      data: {
        testimonials: testimonials.length,
        contactMessages: contactMessages.length
      },
      testCredentials: {
        note: "To test the application, create accounts using these details:",
        donors: [
          { email: "donor1@test.com", password: "password123", name: "John Doe", bloodGroup: "O+" },
          { email: "donor2@test.com", password: "password123", name: "Sarah Smith", bloodGroup: "A+" },
          { email: "donor3@test.com", password: "password123", name: "Mike Johnson", bloodGroup: "B-" }
        ],
        hospitals: [
          { email: "hospital1@test.com", password: "password123", name: "City General Hospital" },
          { email: "hospital2@test.com", password: "password123", name: "Metro Health Center" }
        ],
        instructions: [
          "1. Use the sign-up form to create accounts with the above credentials",
          "2. After signing up, complete the donor or hospital registration",
          "3. Hospitals can create SOS alerts from their dashboard",
          "4. Donors will see live alerts and can respond to them"
        ]
      }
    };
  },
});
