// Quick script to seed the database with sample data
// Run this in your browser console when connected to the Convex dashboard

// Or use this in a mutation to seed data
const sampleTestimonials = [
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
  }
];

// Instructions:
// 1. Open Convex dashboard: https://dashboard.convex.dev
// 2. Go to your project
// 3. Navigate to the Functions tab
// 4. Find and run the "seedSampleData" mutation from seedData.ts
// 5. This will populate your database with sample testimonials and contact messages
