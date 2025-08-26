import { getAuthUserId } from "@convex-dev/auth/server";
import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { api } from "./_generated/api";

export const registerDonor = mutation({
  args: {
    name: v.string(),
    bloodGroup: v.string(),
    location: v.string(),
    latitude: v.optional(v.number()),
    longitude: v.optional(v.number()),
    phone: v.string(),
    emergencyContact: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Must be logged in to register as donor");
    }

    // Check if donor already exists
    const existingDonor = await ctx.db
      .query("donors")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .unique();

    if (existingDonor) {
      throw new Error("You are already registered as a donor");
    }

    return await ctx.db.insert("donors", {
      userId,
      name: args.name,
      bloodGroup: args.bloodGroup,
      location: args.location,
      latitude: args.latitude,
      longitude: args.longitude,
      phone: args.phone,
      availability: true,
      emergencyContact: args.emergencyContact,
    });
  },
});

export const updateAvailability = mutation({
  args: {
    available: v.boolean(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Must be logged in");
    }

    const donor = await ctx.db
      .query("donors")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .unique();

    if (!donor) {
      throw new Error("Donor not found");
    }

    await ctx.db.patch(donor._id, {
      availability: args.available,
    });
  },
});

export const updateLocation = mutation({
  args: {
    latitude: v.number(),
    longitude: v.number(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Must be logged in");
    }

    const donor = await ctx.db
      .query("donors")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .unique();

    if (!donor) {
      throw new Error("Donor not found");
    }

    await ctx.db.patch(donor._id, {
      latitude: args.latitude,
      longitude: args.longitude,
      lastUpdate: Date.now(),
    });
  },
});

export const getCurrentDonor = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return null;
    }

    return await ctx.db
      .query("donors")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .unique();
  },
});

export const updateEligibility = mutation({
  args: {
    healthStatus: v.union(v.literal("excellent"), v.literal("good"), v.literal("fair"), v.literal("restricted")),
    lastDonation: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Must be logged in");
    }

    const donor = await ctx.db
      .query("donors")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .unique();

    if (!donor) {
      throw new Error("Donor not found");
    }

    await ctx.db.patch(donor._id, {
      healthStatus: args.healthStatus,
      lastDonation: args.lastDonation,
      lastUpdate: Date.now(),
    });
  },
});

export const submitEligibility = mutation({
  args: {
    lastDonationDate: v.optional(v.number()),
    healthConditions: v.optional(v.array(v.string())),
    eligibilityConsent: v.boolean(),
    lastDonationProof: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Must be logged in");

    const donor = await ctx.db
      .query("donors")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .unique();
    if (!donor) throw new Error("Donor not found");

    const existing = await ctx.db
      .query("donorVerifications")
      .withIndex("by_donor", (q) => q.eq("donorId", donor._id))
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, {
        lastDonationDate: args.lastDonationDate,
        healthConditions: args.healthConditions,
        eligibilityConsent: args.eligibilityConsent,
        lastDonationProof: args.lastDonationProof,
        submittedAt: Date.now(),
        status: "pending",
      });
      return existing._id;
    }

    return await ctx.db.insert("donorVerifications", {
      donorId: donor._id,
      userId,
      verified: false,
      idType: "aadhar",
      idNumber: "",
      idImageUrl: "",
      lastDonationProof: args.lastDonationProof,
      lastDonationDate: args.lastDonationDate,
      healthConditions: args.healthConditions,
      eligibilityConsent: args.eligibilityConsent,
      submittedAt: Date.now(),
      status: "pending",
    } as any);
  },
});

export const getActiveSosAlerts = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return [];
    }

    const donor = await ctx.db
      .query("donors")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .unique();

    if (!donor) {
      return [];
    }

    const now = Date.now();
    const alerts = await ctx.db
      .query("sosAlerts")
      .withIndex("by_status", (q) => q.eq("status", "active"))
      .filter((q) => q.gt(q.field("expiresAt"), now))
      .collect();

    // Filter alerts that match donor's blood group or need universal donors
    const compatibleAlerts = alerts.filter(alert => {
      const donorBlood = donor.bloodGroup;
      const neededBlood = alert.bloodGroup;
      
      // Universal donor O- can donate to anyone
      if (donorBlood === "O-") return true;
      
      // O+ can donate to positive blood types
      if (donorBlood === "O+" && neededBlood.endsWith("+")) return true;
      
      // Same blood group
      if (donorBlood === neededBlood) return true;
      
      // AB+ can receive from anyone (but we're checking what donor can give)
      return false;
    });

    // Get hospital details for each alert
    const alertsWithHospitals = await Promise.all(
      compatibleAlerts.map(async (alert) => {
        const hospital = await ctx.db.get(alert.hospitalId);
        return {
          ...alert,
          hospital,
        };
      })
    );

    return alertsWithHospitals;
  },
});

export const respondToSosAlert = mutation({
  args: {
    alertId: v.id("sosAlerts"),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Must be logged in");
    }

    const donor = await ctx.db
      .query("donors")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .unique();

    if (!donor) {
      throw new Error("Donor not found");
    }

    // Check if already responded
    const existingResponse = await ctx.db
      .query("donorResponses")
      .withIndex("by_alert", (q) => q.eq("sosAlertId", args.alertId))
      .filter((q) => q.eq(q.field("donorId"), donor._id))
      .unique();

    if (existingResponse) {
      throw new Error("You have already responded to this alert");
    }

    // Calculate match score for this donor
    const alert = await ctx.db.get(args.alertId);
    if (!alert) {
      throw new Error("SOS Alert not found");
    }

    const matchScore = calculateDonorMatchScore(donor, alert);
    const responseSpeed = Date.now() - alert._creationTime;
    
    return await ctx.db.insert("donorResponses", {
      sosAlertId: args.alertId,
      donorId: donor._id,
      status: "interested",
      responseTime: Date.now(),
      notes: args.notes,
      // Smart Matching Fields
      matchScore,
      responseSpeed: Math.round(responseSpeed / 1000), // Convert to seconds
      availabilityConfirmed: donor.availability,
      healthCheckPassed: donor.healthStatus !== "restricted",
      priorityRank: 0, // Will be calculated by smart matching system
    });
  },
});

// Helper function to calculate donor match score
function calculateDonorMatchScore(donor: any, alert: any): number {
  let score = 0;
  const now = Date.now();
  
  // Base score for blood group compatibility
  score += 30;
  
  // Health status bonus
  const healthScore = {
    "excellent": 20,
    "good": 15,
    "fair": 10,
    "restricted": 5,
  };
  score += healthScore[donor.healthStatus as keyof typeof healthScore] || 10;
  
  // Availability bonus
  if (donor.availability) score += 15;
  
  // Response time bonus (faster = better)
  if (donor.responseTime) {
    const responseBonus = Math.max(0, 20 - donor.responseTime);
    score += responseBonus;
  }
  
  // Success rate bonus
  if (donor.successRate) {
    score += (donor.successRate / 100) * 10;
  }
  
  // Last donation penalty (longer ago = better)
  if (donor.lastDonation) {
    const daysSinceDonation = (now - donor.lastDonation) / (1000 * 60 * 60 * 24);
    if (daysSinceDonation >= 56) { // 8 weeks minimum
      score += 10;
    } else if (daysSinceDonation >= 30) {
      score += 5;
    }
  }
  
  // Location proximity bonus
  if (alert.targetArea && donor.location.toLowerCase().includes(alert.targetArea.toLowerCase())) {
    score += 10;
  }
  
  // Emergency preference bonus
  if (alert.urgency === "critical" && donor.emergencyOnly) {
    score += 15;
  }
  
  return Math.min(100, Math.max(0, score));
}

// Enhanced query to get location-based SOS alerts for donors
export const getNearbyActiveSosAlerts = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return [];
    }

    const donor = await ctx.db
      .query("donors")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .unique();

    if (!donor) {
      return [];
    }

    // Get all active alerts
    const activeAlerts = await ctx.db
      .query("sosAlerts")
      .withIndex("by_status", (q) => q.eq("status", "active"))
      .filter((q) => q.gt(q.field("expiresAt"), Date.now()))
      .collect();

    // Filter alerts based on donor's blood group compatibility and location
    const compatibleAlerts = activeAlerts.filter(alert => {
      // Check blood group compatibility
      const isBloodCompatible = alert.bloodGroup === donor.bloodGroup || 
                               alert.bloodGroup === "O+" || alert.bloodGroup === "O-" ||
                               (donor.bloodGroup === "AB+" && true) || // AB+ can receive from anyone
                               (donor.bloodGroup === "AB-" && ["AB-", "A-", "B-", "O-"].includes(alert.bloodGroup));

      if (!isBloodCompatible) {
        return false;
      }

      // Check location proximity
      if (alert.targetArea) {
        return donor.location.toLowerCase().includes(alert.targetArea.toLowerCase());
      }

      return true; // If no specific target area, include all alerts
    });

    // Get hospital details for each alert
    const alertsWithHospitals = await Promise.all(
      compatibleAlerts.map(async (alert) => {
        const hospital = await ctx.db.get(alert.hospitalId);
        return {
          ...alert,
          hospital,
        };
      })
    );

    // Sort by urgency and creation time
    return alertsWithHospitals.sort((a, b) => {
      const urgencyOrder = { critical: 3, urgent: 2, normal: 1 };
      const aUrgency = urgencyOrder[a.urgency as keyof typeof urgencyOrder] || 0;
      const bUrgency = urgencyOrder[b.urgency as keyof typeof urgencyOrder] || 0;
      
      if (aUrgency !== bUrgency) {
        return bUrgency - aUrgency; // Higher urgency first
      }
      
      return b._creationTime - a._creationTime; // Newer alerts first
    });
  },
});
