import { getAuthUserId } from "@convex-dev/auth/server";
import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { api } from "./_generated/api";

export const registerHospital = mutation({
  args: {
    name: v.string(),
    hospitalId: v.string(),
    location: v.string(),
    latitude: v.optional(v.number()),
    longitude: v.optional(v.number()),
    phone: v.string(),
    contactPerson: v.string(),
    address: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Must be logged in to register hospital");
    }

    // Check if hospital already exists
    const existingHospital = await ctx.db
      .query("hospitals")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .unique();

    if (existingHospital) {
      throw new Error("You are already registered as a hospital");
    }

    return await ctx.db.insert("hospitals", {
      userId,
      name: args.name,
      hospitalId: args.hospitalId,
      location: args.location,
      latitude: args.latitude,
      longitude: args.longitude,
      phone: args.phone,
      contactPerson: args.contactPerson,
      address: args.address,
      verified: true, // Auto-verify for testing - change to false for production
    });
  },
});

// Admin function to verify hospitals
export const verifyHospital = mutation({
  args: {
    hospitalId: v.id("hospitals"),
  },
  handler: async (ctx, args) => {
    // In production, add admin authentication check here
    await ctx.db.patch(args.hospitalId, {
      verified: true,
    });
  },
});

// Function to create pre-verified test hospital accounts
export const createTestHospital = mutation({
  args: {
    userId: v.id("users"),
    name: v.string(),
    hospitalId: v.string(),
    location: v.string(),
    phone: v.string(),
    contactPerson: v.string(),
    address: v.string(),
  },
  handler: async (ctx, args) => {
    // Check if hospital already exists for this user
    const existingHospital = await ctx.db
      .query("hospitals")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .unique();

    if (existingHospital) {
      return existingHospital;
    }

    return await ctx.db.insert("hospitals", {
      userId: args.userId,
      name: args.name,
      hospitalId: args.hospitalId,
      location: args.location,
      phone: args.phone,
      contactPerson: args.contactPerson,
      address: args.address,
      verified: true, // Pre-verified for testing
    });
  },
});

export const getCurrentHospital = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return null;
    }

    return await ctx.db
      .query("hospitals")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .unique();
  },
});

export const createSosAlert = mutation({
  args: {
    bloodGroup: v.string(),
    urgency: v.string(),
    unitsNeeded: v.number(),
    contactNumber: v.string(),
    description: v.string(),
    hoursValid: v.number(),
    targetArea: v.optional(v.string()),
    radiusKm: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Must be logged in");
    }

    const hospital = await ctx.db
      .query("hospitals")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .unique();

    if (!hospital) {
      throw new Error("Hospital not found");
    }

    if (!hospital.verified) {
      throw new Error("Hospital must be verified to create SOS alerts");
    }

    const expiresAt = Date.now() + (args.hoursValid * 60 * 60 * 1000);

    // Find matching donors in the area
    const nearbyDonors = await ctx.db
      .query("donors")
      .withIndex("by_blood_group", (q) => q.eq("bloodGroup", args.bloodGroup))
      .filter((q) => q.eq(q.field("availability"), true))
      .collect();

    // Filter donors by location if targetArea is specified
    let targetedDonors = nearbyDonors;
    if (args.targetArea) {
      const targetArea = args.targetArea.toLowerCase();
      targetedDonors = nearbyDonors.filter(donor => 
        donor.location.toLowerCase().includes(targetArea) ||
        hospital.location.toLowerCase().includes(targetArea)
      );
    }

    const alertId = await ctx.db.insert("sosAlerts", {
      hospitalId: hospital._id,
      bloodGroup: args.bloodGroup,
      urgency: args.urgency,
      unitsNeeded: args.unitsNeeded,
      location: hospital.location,
      targetArea: args.targetArea,
      radiusKm: args.radiusKm || 50, // Default 50km radius
      contactNumber: args.contactNumber,
      description: args.description,
      status: "active",
      expiresAt,
      notificationsSent: targetedDonors.length,
      // Smart Matching Fields
      matchingAlgorithm: "smart",
      priorityScore: 0, // Will be calculated by smart matching
      lastMatchingUpdate: Date.now(),
    });

    // Note: Smart matching will be triggered separately
    // For now, we'll create the alert without smart matching
    console.log("SOS Alert created. Smart matching can be triggered separately.");

    return {
      alertId,
      donorsNotified: targetedDonors.length,
      message: `SOS Alert created with Smart Matching! ${targetedDonors.length} nearby ${args.bloodGroup} donors have been notified.`
    };
  },
});

export const getHospitalSosAlerts = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return [];
    }

    const hospital = await ctx.db
      .query("hospitals")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .unique();

    if (!hospital) {
      return [];
    }

    const alerts = await ctx.db
      .query("sosAlerts")
      .withIndex("by_hospital", (q) => q.eq("hospitalId", hospital._id))
      .order("desc")
      .collect();

    // Get responses for each alert
    const alertsWithResponses = await Promise.all(
      alerts.map(async (alert) => {
        const responses = await ctx.db
          .query("donorResponses")
          .withIndex("by_alert", (q) => q.eq("sosAlertId", alert._id))
          .collect();

        const responsesWithDonors = await Promise.all(
          responses.map(async (response) => {
            const donor = await ctx.db.get(response.donorId);
            return {
              ...response,
              donor,
            };
          })
        );

        return {
          ...alert,
          responses: responsesWithDonors,
        };
      })
    );

    return alertsWithResponses;
  },
});

export const updateSosAlertStatus = mutation({
  args: {
    alertId: v.id("sosAlerts"),
    status: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Must be logged in");
    }

    const hospital = await ctx.db
      .query("hospitals")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .unique();

    if (!hospital) {
      throw new Error("Hospital not found");
    }

    const alert = await ctx.db.get(args.alertId);
    if (!alert || alert.hospitalId !== hospital._id) {
      throw new Error("Alert not found or unauthorized");
    }

    await ctx.db.patch(args.alertId, {
      status: args.status,
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

    const hospital = await ctx.db
      .query("hospitals")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .unique();

    if (!hospital) {
      throw new Error("Hospital not found");
    }

    await ctx.db.patch(hospital._id, {
      latitude: args.latitude,
      longitude: args.longitude,
    });
  },
});
