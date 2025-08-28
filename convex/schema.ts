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
    lastDonationDate: v.optional(v.number()), // Epoch ms - self-reported or verified
    healthConditions: v.optional(v.array(v.string())), // self-reported conditions
    eligibilityConsent: v.optional(v.boolean()), // consent for using self-reported data
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
    latitude: v.optional(v.number()),
    longitude: v.optional(v.number()),
    phone: v.string(),
    availability: v.boolean(),
    lastDonation: v.optional(v.number()),
    emergencyContact: v.optional(v.string()),
    // Smart Matching Fields
    healthStatus: v.optional(v.string()), // "excellent", "good", "fair", "restricted"
    travelRadius: v.optional(v.number()), // Maximum travel distance in km
    responseTime: v.optional(v.number()), // Average response time in minutes
    successRate: v.optional(v.number()), // Percentage of successful donations
    lastAvailabilityUpdate: v.optional(v.number()), // Timestamp of last availability update
    preferredHospitals: v.optional(v.array(v.string())), // List of preferred hospital names
    restrictions: v.optional(v.array(v.string())), // Health restrictions or conditions
    emergencyOnly: v.optional(v.boolean()), // Whether donor only responds to emergency alerts
    // Enhanced Analytics Fields
    totalDonations: v.optional(v.number()),
    successfulDonations: v.optional(v.number()),
    averageResponseTime: v.optional(v.number()),
    lastUpdate: v.optional(v.number()),
  }).index("by_user", ["userId"])
    .index("by_blood_group", ["bloodGroup"])
    .index("by_availability", ["availability"])
    .index("by_health_status", ["healthStatus"])
    .index("by_emergency_only", ["emergencyOnly"]),

  hospitals: defineTable({
    userId: v.id("users"),
    name: v.string(),
    hospitalId: v.string(),
    location: v.string(),
    latitude: v.optional(v.number()),
    longitude: v.optional(v.number()),
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
    status: v.string(), // "active", "fulfilled", "expired", "cancelled", "donor_confirmed", "completed", "escalated"
    expiresAt: v.number(),
    notificationsSent: v.optional(v.number()), // Track how many donors were notified
    // Smart Matching Fields
    priorityScore: v.optional(v.number()), // Calculated priority score
    matchedDonors: v.optional(v.array(v.id("donors"))), // Top recommended donors
    matchingAlgorithm: v.optional(v.string()), // "smart", "traditional", "hybrid"
    lastMatchingUpdate: v.optional(v.number()), // When matching was last updated
    estimatedResponseTime: v.optional(v.number()), // Estimated time to get response in minutes
    // Enhanced Response Management Fields
    acceptedDonorId: v.optional(v.id("donors")),
    lastUpdate: v.optional(v.number()),
    lastRankingUpdate: v.optional(v.number()),
    totalResponses: v.optional(v.number()),
    topDonorScore: v.optional(v.number()),
    completedAt: v.optional(v.number()),
    // Escalation Fields
    escalatedAt: v.optional(v.number()),
    escalationReason: v.optional(v.string()),
    escalationLevel: v.optional(v.number()), // 1 = low, 2 = medium, 3 = high, 4 = critical
  }).index("by_hospital", ["hospitalId"])
    .index("by_blood_group", ["bloodGroup"])
    .index("by_status", ["status"])
    .index("by_urgency", ["urgency"])
    .index("by_location", ["location"])
    .index("by_priority", ["priorityScore"])
    .index("by_escalation", ["escalationLevel"]),

  donorResponses: defineTable({
    sosAlertId: v.id("sosAlerts"),
    donorId: v.id("donors"),
    status: v.string(), // "interested", "confirmed", "accepted", "rejected", "on_hold", "completed", "unavailable", "escalated"
    responseTime: v.number(),
    notes: v.optional(v.string()),
    matchScore: v.optional(v.number()),
    responseSpeed: v.optional(v.number()), // Time from alert creation to response
    availabilityConfirmed: v.optional(v.boolean()),
    estimatedTravelTime: v.optional(v.number()),
    healthCheckPassed: v.optional(v.boolean()),
    priorityRank: v.optional(v.number()),
    // Enhanced Response Management Fields
    acceptedAt: v.optional(v.number()),
    rejectedAt: v.optional(v.number()),
    heldAt: v.optional(v.number()),
    completedAt: v.optional(v.number()),
    fulfilledAt: v.optional(v.number()),
    hospitalNotes: v.optional(v.string()),
    isPrimaryDonor: v.optional(v.boolean()),
    lastRankingUpdate: v.optional(v.number()),
    // Donor Unavailability Fields
    unavailableAt: v.optional(v.number()),
    unavailabilityReason: v.optional(v.string()),
    isReplacement: v.optional(v.boolean()), // Whether this donor is replacing an unavailable one
    replacementFor: v.optional(v.id("donorResponses")), // Reference to the unavailable donor response
  }).index("by_alert", ["sosAlertId"])
    .index("by_donor", ["donorId"])
    .index("by_status", ["status"])
    .index("by_alert_and_donor", ["sosAlertId", "donorId"])
    .index("by_priority", ["priorityRank"])
    .index("by_match_score", ["matchScore"]),

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

  // Smart Matching Analytics
  matchingAnalytics: defineTable({
    alertId: v.id("sosAlerts"),
    hospitalId: v.id("hospitals"),
    algorithm: v.string(), // "smart", "traditional", "hybrid"
    totalDonorsFound: v.number(),
    eligibleDonors: v.number(),
    responseRate: v.number(), // Percentage of donors who responded
    averageResponseTime: v.number(), // Average response time in minutes
    successfulMatches: v.number(),
    totalUnitsFulfilled: v.number(),
    matchingDuration: v.number(), // Time taken to find matches in minutes
    priorityScore: v.number(),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_alert", ["alertId"])
    .index("by_hospital", ["hospitalId"])
    .index("by_algorithm", ["algorithm"])
    .index("by_priority_score", ["priorityScore"]),
};

export default defineSchema({
  ...authTables,
  ...applicationTables,
});
