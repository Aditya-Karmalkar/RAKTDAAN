import { authTables } from "@convex-dev/auth/server";
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

const applicationTables = {
  // User verification table to track verification status
  userVerifications: defineTable({
    userId: v.id("users"),
    verified: v.boolean(),
    verifiedBy: v.optional(v.id("users")), // Admin who verified
    verifiedAt: v.optional(v.number()),
    bloodType: v.optional(v.string()),
    location: v.optional(v.string()),
    phone: v.optional(v.string()),
    idType: v.optional(v.string()), // "aadhar", "pan", "voter", "passport", "driving_license"
    idNumber: v.optional(v.string()),
    idImageUrl: v.optional(v.string()), // URL to uploaded ID image
    rejectionReason: v.optional(v.string()),
    verificationNotes: v.optional(v.string()),
  }).index("by_user", ["userId"])
    .index("by_verified", ["verified"])
    .index("by_id_type", ["idType"]),

  // Donor verification table for additional donor-specific verification
  donorVerifications: defineTable({
    donorId: v.id("donors"),
    userId: v.id("users"),
    verified: v.boolean(),
    verifiedBy: v.optional(v.id("users")),
    verifiedAt: v.optional(v.number()),
    idType: v.string(), // "aadhar", "pan", "voter", "passport", "driving_license"
    idNumber: v.string(),
    idImageUrl: v.string(), // URL to uploaded ID image
    rejectionReason: v.optional(v.string()),
    verificationNotes: v.optional(v.string()),
    lastDonationProof: v.optional(v.string()), // URL to last donation certificate
    // File storage metadata
    fileName: v.optional(v.string()),
    fileType: v.optional(v.string()),
    fileSize: v.optional(v.number()),
    storageId: v.optional(v.id("_storage")),
    status: v.optional(v.string()), // "pending", "approved", "rejected"
    submittedAt: v.optional(v.number()),
  }).index("by_donor", ["donorId"])
    .index("by_user", ["userId"])
    .index("by_verified", ["verified"]),

  // Gallery/Photo carousel
  gallery: defineTable({
    title: v.string(),
    description: v.optional(v.string()),
    imageUrl: v.string(),
    category: v.string(), // "donation_drive", "awareness", "event", "testimonial"
    uploadedBy: v.id("users"),
    uploadedAt: v.number(),
    isActive: v.boolean(),
    tags: v.optional(v.array(v.string())),
    // File storage metadata
    fileName: v.optional(v.string()),
    fileType: v.optional(v.string()),
    fileSize: v.optional(v.number()),
    storageId: v.optional(v.id("_storage")),
  }).index("by_category", ["category"])
    .index("by_active", ["isActive"])
    .index("by_uploaded_by", ["uploadedBy"]),

  // Campaigns
  campaigns: defineTable({
    title: v.string(),
    description: v.string(),
    shortDescription: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
    bannerImageUrl: v.optional(v.string()),
    targetBloodType: v.optional(v.string()),
    targetLocation: v.optional(v.string()),
    targetGoal: v.optional(v.number()), // Number of donors needed
    currentCount: v.optional(v.number()), // Current registered donors
    startDate: v.number(),
    endDate: v.number(),
    isActive: v.boolean(),
    priority: v.string(), // "low", "medium", "high", "critical"
    createdBy: v.id("users"),
    organizingHospital: v.optional(v.id("hospitals")),
    contactInfo: v.object({
      phone: v.string(),
      email: v.string(),
      address: v.optional(v.string()),
    }),
    requirements: v.optional(v.array(v.string())),
    benefits: v.optional(v.array(v.string())),
  }).index("by_active", ["isActive"])
    .index("by_priority", ["priority"])
    .index("by_blood_type", ["targetBloodType"])
    .index("by_location", ["targetLocation"])
    .index("by_creator", ["createdBy"]),

  // Campaign registrations
  campaignRegistrations: defineTable({
    campaignId: v.id("campaigns"),
    userId: v.id("users"),
    donorId: v.optional(v.id("donors")),
    registeredAt: v.number(),
    status: v.string(), // "registered", "confirmed", "completed", "cancelled"
    notes: v.optional(v.string()),
  }).index("by_campaign", ["campaignId"])
    .index("by_user", ["userId"])
    .index("by_status", ["status"]),
  donors: defineTable({
    userId: v.id("users"),
    name: v.string(),
    bloodGroup: v.string(),
    location: v.string(),
    phone: v.string(),
    availability: v.boolean(),
    lastDonation: v.optional(v.number()),
    emergencyContact: v.optional(v.string()),
  }).index("by_user", ["userId"])
    .index("by_blood_group", ["bloodGroup"])
    .index("by_availability", ["availability"]),

  hospitals: defineTable({
    userId: v.id("users"),
    name: v.string(),
    hospitalId: v.string(),
    location: v.string(),
    phone: v.string(),
    contactPerson: v.string(),
    verified: v.boolean(),
    address: v.string(),
  }).index("by_user", ["userId"])
    .index("by_hospital_id", ["hospitalId"]),

  sosAlerts: defineTable({
    hospitalId: v.id("hospitals"),
    bloodGroup: v.string(),
    urgency: v.string(), // "critical", "urgent", "normal"
    unitsNeeded: v.number(),
    location: v.string(),
    targetArea: v.optional(v.string()), // Specific area/neighborhood targeting
    radiusKm: v.optional(v.number()), // Target radius in kilometers
    contactNumber: v.string(),
    description: v.string(),
    status: v.string(), // "active", "fulfilled", "expired"
    expiresAt: v.number(),
    notificationsSent: v.optional(v.number()), // Track how many donors were notified
  }).index("by_hospital", ["hospitalId"])
    .index("by_blood_group", ["bloodGroup"])
    .index("by_status", ["status"])
    .index("by_urgency", ["urgency"])
    .index("by_location", ["location"]),

  donorResponses: defineTable({
    sosAlertId: v.id("sosAlerts"),
    donorId: v.id("donors"),
    status: v.string(), // "interested", "confirmed", "completed"
    responseTime: v.number(),
    notes: v.optional(v.string()),
  }).index("by_alert", ["sosAlertId"])
    .index("by_donor", ["donorId"]),

  testimonials: defineTable({
    name: v.string(),
    role: v.string(), // "donor", "recipient", "hospital"
    message: v.string(),
    location: v.string(),
    approved: v.boolean(),
  }).index("by_approved", ["approved"]),

  contactMessages: defineTable({
    name: v.string(),
    email: v.string(),
    subject: v.string(),
    message: v.string(),
    status: v.string(), // "new", "responded", "closed"
  }).index("by_status", ["status"]),

  // Team Management Tables
  teamMembers: defineTable({
    name: v.string(),
    email: v.string(),
    password: v.string(), // Will be hashed
    role: v.string(), // "member", "lead", "moderator"
    department: v.string(),
    phone: v.optional(v.string()),
    joinDate: v.number(),
    status: v.string(), // "active", "inactive", "suspended"
    avatar: v.optional(v.string()),
    bio: v.optional(v.string()),
    createdBy: v.id("users"), // Admin who created this team member
  }).index("by_email", ["email"])
    .index("by_status", ["status"])
    .index("by_role", ["role"])
    .index("by_department", ["department"]),

  chatChannels: defineTable({
    name: v.string(),
    description: v.optional(v.string()),
    type: v.string(), // "general", "department", "private", "announcements"
    createdBy: v.id("users"),
    participants: v.array(v.union(v.id("users"), v.id("teamMembers"))),
    isActive: v.boolean(),
  }).index("by_type", ["type"])
    .index("by_creator", ["createdBy"]),

  chatMessages: defineTable({
    channelId: v.id("chatChannels"),
    senderId: v.union(v.id("users"), v.id("teamMembers")),
    senderType: v.string(), // "admin", "team_member"
    senderName: v.string(),
    message: v.string(),
    messageType: v.string(), // "text", "file", "image", "system"
    timestamp: v.number(),
    edited: v.boolean(),
    editedAt: v.optional(v.number()),
    replyTo: v.optional(v.id("chatMessages")),
    attachments: v.optional(v.array(v.object({
      name: v.string(),
      url: v.string(),
      type: v.string(),
      size: v.number()
    }))),
  }).index("by_channel", ["channelId"])
    .index("by_sender", ["senderId"])
    .index("by_timestamp", ["timestamp"]),

  teamNotifications: defineTable({
    recipientId: v.union(v.id("users"), v.id("teamMembers")),
    recipientType: v.string(), // "admin", "team_member"
    title: v.string(),
    message: v.string(),
    type: v.string(), // "announcement", "task", "mention", "system"
    read: v.boolean(),
    timestamp: v.number(),
    relatedId: v.optional(v.string()),
    actionUrl: v.optional(v.string()),
  }).index("by_recipient", ["recipientId"])
    .index("by_read", ["read"])
    .index("by_timestamp", ["timestamp"]),
};

export default defineSchema({
  ...authTables,
  ...applicationTables,
});
