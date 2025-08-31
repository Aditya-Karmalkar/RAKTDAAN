import { getAuthUserId } from "@convex-dev/auth/server";
import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const registerDonor = mutation({
  args: {
    name: v.string(),
    bloodGroup: v.string(),
    location: v.string(),
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

    return await ctx.db.insert("donorResponses", {
      sosAlertId: args.alertId,
      donorId: donor._id,
      status: "interested",
      responseTime: Date.now(),
      notes: args.notes,
    });
  },
});

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
