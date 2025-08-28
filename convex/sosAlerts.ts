import { query, mutation, internalMutation } from "./_generated/server";
import { v } from "convex/values";
import { api } from "./_generated/api";

/**
 * Create a new SOS alert with smart matching
 */
export const createSOSAlert = mutation({
  args: {
    hospitalId: v.id("hospitals"),
    bloodGroup: v.string(),
    urgency: v.string(), // "critical", "urgent", "normal"
    unitsNeeded: v.number(),
    location: v.string(),
    targetArea: v.optional(v.string()),
    radiusKm: v.optional(v.number()),
    contactNumber: v.string(),
    description: v.string(),
    expiresInHours: v.optional(v.number()), // Default 24 hours
  },
  returns: v.id("sosAlerts"),
  handler: async (ctx, args) => {
    const hospital = await ctx.db.get(args.hospitalId);
    if (!hospital) throw new Error("Hospital not found");

    // Calculate expiry time
    const expiresAt = Date.now() + (args.expiresInHours || 24) * 60 * 60 * 1000;

    // Create the SOS alert
    const alertId = await ctx.db.insert("sosAlerts", {
      hospitalId: args.hospitalId,
      bloodGroup: args.bloodGroup,
      urgency: args.urgency,
      unitsNeeded: args.unitsNeeded,
      location: args.location,
      targetArea: args.targetArea,
      radiusKm: args.radiusKm || 50, // Default 50km radius
      contactNumber: args.contactNumber,
      description: args.description,
      status: "active",
      expiresAt,
      notificationsSent: 0,
      priorityScore: 0, // Will be calculated by smart matching
      matchedDonors: [],
      matchingAlgorithm: "smart",
      lastMatchingUpdate: Date.now(),
      estimatedResponseTime: 0,
    });

    // Calculate priority score using smart matching
    await ctx.runMutation(api.smartMatching.calculatePriorityScore, {
      alertId,
    });

    // Find eligible donors and update the alert
    const eligibleDonors = await ctx.runQuery(api.smartMatching.findEligibleDonors, {
      alertId,
      limit: 10,
    });

    // Update alert with matched donors
    if (eligibleDonors.length > 0) {
             const topDonorIds = eligibleDonors.slice(0, 3).map((d: any) => d.donorId);
      await ctx.db.patch(alertId, {
        matchedDonors: topDonorIds,
        estimatedResponseTime: Math.round(
          eligibleDonors[0]?.responseTime || 10
        ),
      });
    }

    return alertId;
  },
});

/**
 * Get all active SOS alerts with smart matching data
 */
export const getActiveSOSAlerts = query({
  args: {
    bloodGroup: v.optional(v.string()),
    urgency: v.optional(v.string()),
    location: v.optional(v.string()),
  },
  returns: v.array(v.union(
    v.object({
      _id: v.id("sosAlerts"),
      _creationTime: v.number(),
      hospitalId: v.id("hospitals"),
      bloodGroup: v.string(),
      urgency: v.string(),
      unitsNeeded: v.number(),
      location: v.string(),
      targetArea: v.optional(v.string()),
      radiusKm: v.optional(v.number()),
      contactNumber: v.string(),
      description: v.string(),
      status: v.string(),
      expiresAt: v.number(),
      priorityScore: v.optional(v.number()),
      matchedDonors: v.optional(v.array(v.id("donors"))),
      matchingAlgorithm: v.optional(v.string()),
      lastMatchingUpdate: v.optional(v.number()),
      estimatedResponseTime: v.optional(v.number()),
      hospital: v.object({
        name: v.string(),
        location: v.string(),
        contactPerson: v.string(),
      }),
      donorCount: v.number(),
      timeUntilExpiry: v.number(),
    }),
    v.null()
  )),
  handler: async (ctx, args) => {
    // Start with status filter
    let alerts = await ctx.db
      .query("sosAlerts")
      .withIndex("by_status", (q) => q.eq("status", "active"))
      .collect();

    // Apply additional filters in memory for now
    if (args.bloodGroup) {
      alerts = alerts.filter(alert => alert.bloodGroup === args.bloodGroup);
    }

    if (args.urgency) {
      alerts = alerts.filter(alert => alert.urgency === args.urgency);
    }

    if (args.location) {
      alerts = alerts.filter(alert => alert.location === args.location);
    }

    // Enrich alerts with hospital and donor information
    const enrichedAlerts = await Promise.all(
      alerts.map(async (alert) => {
        const hospital = await ctx.db.get(alert.hospitalId);
        if (!hospital) return null;

        const donorCount = alert.matchedDonors?.length || 0;
        const timeUntilExpiry = alert.expiresAt - Date.now();

        return {
          _id: alert._id,
          _creationTime: alert._creationTime,
          hospitalId: alert.hospitalId,
          bloodGroup: alert.bloodGroup,
          urgency: alert.urgency,
          unitsNeeded: alert.unitsNeeded,
          location: alert.location,
          targetArea: alert.targetArea,
          radiusKm: alert.radiusKm,
          contactNumber: alert.contactNumber,
          description: alert.description,
          status: alert.status,
          expiresAt: alert.expiresAt,
          priorityScore: alert.priorityScore,
          matchedDonors: alert.matchedDonors,
          matchingAlgorithm: alert.matchingAlgorithm,
          lastMatchingUpdate: alert.lastMatchingUpdate,
          estimatedResponseTime: alert.estimatedResponseTime,
          hospital: {
            name: hospital.name,
            location: hospital.location,
            contactPerson: hospital.contactPerson,
          },
          donorCount,
          timeUntilExpiry,
        };
      })
    );

    // Filter out null values and sort by priority score
    return enrichedAlerts
      .filter(Boolean)
      .sort((a, b) => (b?.priorityScore || 0) - (a?.priorityScore || 0));
  },
});

/**
 * Get detailed information about a specific SOS alert
 */
export const getSOSAlertDetails = query({
  args: {
    alertId: v.id("sosAlerts"),
  },
  returns: v.object({
    alert: v.object({
      _id: v.id("sosAlerts"),
      _creationTime: v.number(),
      hospitalId: v.id("hospitals"),
      bloodGroup: v.string(),
      urgency: v.string(),
      unitsNeeded: v.number(),
      location: v.string(),
      targetArea: v.optional(v.string()),
      radiusKm: v.optional(v.number()),
      contactNumber: v.string(),
      description: v.string(),
      status: v.string(),
      expiresAt: v.number(),
      priorityScore: v.optional(v.number()),
      matchedDonors: v.optional(v.array(v.id("donors"))),
      matchingAlgorithm: v.optional(v.string()),
      lastMatchingUpdate: v.optional(v.number()),
      estimatedResponseTime: v.optional(v.number()),
    }),
    hospital: v.object({
      name: v.string(),
      location: v.string(),
      contactPerson: v.string(),
      phone: v.string(),
      address: v.string(),
    }),
    topDonors: v.array(v.object({
      donorId: v.id("donors"),
      name: v.string(),
      location: v.string(),
      matchScore: v.number(),
      priorityRank: v.number(),
      estimatedTravelTime: v.number(),
      estimatedResponseTime: v.number(),
      availability: v.boolean(),
      healthStatus: v.optional(v.string()),
      lastDonation: v.optional(v.number()),
    })),
    analytics: v.object({
      totalDonorsFound: v.number(),
      eligibleDonors: v.number(),
      responseRate: v.number(),
      averageResponseTime: v.number(),
      successfulMatches: v.number(),
      estimatedFulfillmentTime: v.number(),
    }),
  }),
  handler: async (ctx, args) => {
    const alert = await ctx.db.get(args.alertId);
    if (!alert) throw new Error("Alert not found");

    const hospital = await ctx.db.get(alert.hospitalId);
    if (!hospital) throw new Error("Hospital not found");

    // Get top recommended donors
    const topDonors: any[] = await ctx.runQuery(api.smartMatching.getTopRecommendedDonors, {
      alertId: args.alertId,
    });

    // Get matching analytics
    const analytics: any = await ctx.runQuery(api.smartMatching.getMatchingAnalytics, {
      alertId: args.alertId,
    });

    return {
      alert: {
        _id: alert._id,
        _creationTime: alert._creationTime,
        hospitalId: alert.hospitalId,
        bloodGroup: alert.bloodGroup,
        urgency: alert.urgency,
        unitsNeeded: alert.unitsNeeded,
        location: alert.location,
        targetArea: alert.targetArea,
        radiusKm: alert.radiusKm,
        contactNumber: alert.contactNumber,
        description: alert.description,
        status: alert.status,
        expiresAt: alert.expiresAt,
        priorityScore: alert.priorityScore,
        matchedDonors: alert.matchedDonors,
        matchingAlgorithm: alert.matchingAlgorithm,
        lastMatchingUpdate: alert.lastMatchingUpdate,
        estimatedResponseTime: alert.estimatedResponseTime,
      },
      hospital: {
        name: hospital.name,
        location: hospital.location,
        contactPerson: hospital.contactPerson,
        phone: hospital.phone,
        address: hospital.address,
      },
      topDonors,
      analytics,
    };
  },
});

/**
 * Update SOS alert status
 */
export const updateSOSAlertStatus = mutation({
  args: {
    alertId: v.id("sosAlerts"),
    status: v.string(), // "active", "fulfilled", "expired", "cancelled"
    notes: v.optional(v.string()),
  },
  returns: v.boolean(),
  handler: async (ctx, args) => {
    const alert = await ctx.db.get(args.alertId);
    if (!alert) throw new Error("Alert not found");

    await ctx.db.patch(args.alertId, {
      status: args.status,
      lastMatchingUpdate: Date.now(),
    });

    return true;
  },
});

/**
 * Extend SOS alert expiry time
 */
export const extendSOSAlert = mutation({
  args: {
    alertId: v.id("sosAlerts"),
    additionalHours: v.number(),
  },
  returns: v.boolean(),
  handler: async (ctx, args) => {
    const alert = await ctx.db.get(args.alertId);
    if (!alert) throw new Error("Alert not found");

    const newExpiryTime = alert.expiresAt + (args.additionalHours * 60 * 60 * 1000);

    await ctx.db.patch(args.alertId, {
      expiresAt: newExpiryTime,
      lastMatchingUpdate: Date.now(),
    });

    // Recalculate priority score
    await ctx.runMutation(api.smartMatching.calculatePriorityScore, {
      alertId: args.alertId,
    });

    return true;
  },
});

/**
 * Get urgent SOS alerts that need immediate attention
 */
export const getUrgentSOSAlerts = query({
  args: {},
  returns: v.array(v.object({
    _id: v.id("sosAlerts"),
    bloodGroup: v.string(),
    urgency: v.string(),
    unitsNeeded: v.number(),
    location: v.string(),
    priorityScore: v.optional(v.number()),
    timeUntilExpiry: v.number(),
    hospitalName: v.string(),
    donorCount: v.number(),
  })),
  handler: async (ctx) => {
    const now = Date.now();
    const urgentAlerts = await ctx.db
      .query("sosAlerts")
      .withIndex("by_status", (q) => q.eq("status", "active"))
      .filter((q) => 
        q.or(
          q.eq(q.field("urgency"), "critical"),
          q.eq(q.field("urgency"), "urgent")
        )
      )
      .collect();

    // Filter alerts that are expiring soon or have high priority
    const criticalAlerts = urgentAlerts.filter(alert => {
      const timeUntilExpiry = alert.expiresAt - now;
      const hoursUntilExpiry = timeUntilExpiry / (1000 * 60 * 60);
      
      return hoursUntilExpiry < 6 || (alert.priorityScore || 0) > 80;
    });

    // Enrich with hospital and donor information
    const enrichedAlerts = await Promise.all(
      criticalAlerts.map(async (alert) => {
        const hospital = await ctx.db.get(alert.hospitalId);
        const donorCount = alert.matchedDonors?.length || 0;
        const timeUntilExpiry = alert.expiresAt - now;

        return {
          _id: alert._id,
          bloodGroup: alert.bloodGroup,
          urgency: alert.urgency,
          unitsNeeded: alert.unitsNeeded,
          location: alert.location,
          priorityScore: alert.priorityScore,
          timeUntilExpiry,
          hospitalName: hospital?.name || "Unknown Hospital",
          donorCount,
        };
      })
    );

    // Sort by urgency and priority score
    return enrichedAlerts.sort((a, b) => {
      // Critical alerts first
      if (a.urgency === "critical" && b.urgency !== "critical") return -1;
      if (b.urgency === "critical" && a.urgency !== "critical") return 1;
      
      // Then by priority score
      return (b.priorityScore || 0) - (a.priorityScore || 0);
    });
  },
});

/**
 * Get SOS alerts by hospital
 */
export const getSOSAlertsByHospital = query({
  args: {
    hospitalId: v.id("hospitals"),
    status: v.optional(v.string()),
  },
  returns: v.array(v.object({
    _id: v.id("sosAlerts"),
    bloodGroup: v.string(),
    urgency: v.string(),
    unitsNeeded: v.number(),
    location: v.string(),
    status: v.string(),
    expiresAt: v.number(),
    priorityScore: v.optional(v.number()),
    matchedDonors: v.optional(v.array(v.id("donors"))),
    donorCount: v.number(),
    timeUntilExpiry: v.number(),
  })),
  handler: async (ctx, args) => {
    let alertsQuery = ctx.db
      .query("sosAlerts")
      .withIndex("by_hospital", (q) => q.eq("hospitalId", args.hospitalId));

    if (args.status) {
      alertsQuery = alertsQuery.filter((q) => q.eq(q.field("status"), args.status));
    }

    const alerts = await alertsQuery.collect();

    // Enrich with donor count and time information
    const enrichedAlerts = alerts.map(alert => ({
      ...alert,
      donorCount: alert.matchedDonors?.length || 0,
      timeUntilExpiry: alert.expiresAt - Date.now(),
    }));

    // Sort by creation time (newest first)
    return enrichedAlerts.sort((a, b) => b._creationTime - a._creationTime);
  },
});

/**
 * Search SOS alerts by location and blood group
 */
export const searchSOSAlerts = query({
  args: {
    bloodGroup: v.optional(v.string()),
    location: v.optional(v.string()),
    urgency: v.optional(v.string()),
    radiusKm: v.optional(v.number()),
  },
  returns: v.array(v.object({
    _id: v.id("sosAlerts"),
    bloodGroup: v.string(),
    urgency: v.string(),
    unitsNeeded: v.number(),
    location: v.string(),
    status: v.string(),
    expiresAt: v.number(),
    priorityScore: v.optional(v.number()),
    hospitalName: v.string(),
    timeUntilExpiry: v.number(),
  })),
  handler: async (ctx, args) => {
    // Start with status filter
    let alerts = await ctx.db
      .query("sosAlerts")
      .withIndex("by_status", (q) => q.eq("status", "active"))
      .collect();

    // Apply additional filters in memory for now
    if (args.bloodGroup) {
      alerts = alerts.filter(alert => alert.bloodGroup === args.bloodGroup);
    }

    if (args.location) {
      alerts = alerts.filter(alert => alert.location === args.location);
    }

    if (args.urgency) {
      alerts = alerts.filter(alert => alert.urgency === args.urgency);
    }

    // Enrich with hospital information
    const enrichedAlerts = await Promise.all(
      alerts.map(async (alert) => {
        const hospital = await ctx.db.get(alert.hospitalId);
        const timeUntilExpiry = alert.expiresAt - Date.now();

        return {
          ...alert,
          hospitalName: hospital?.name || "Unknown Hospital",
          timeUntilExpiry,
        };
      })
    );

    // Filter by radius if specified
    let filteredAlerts = enrichedAlerts;
    if (args.radiusKm && args.location) {
      filteredAlerts = enrichedAlerts.filter(alert => {
        // Simplified distance calculation - in production use proper geolocation
        const distance = Math.floor(Math.random() * 50) + 1; // Random 1-50 km
        return distance <= args.radiusKm!;
      });
    }

    // Sort by priority score and urgency
    return filteredAlerts.sort((a, b) => {
      // Critical alerts first
      if (a.urgency === "critical" && b.urgency !== "critical") return -1;
      if (b.urgency === "critical" && a.urgency !== "critical") return 1;
      
      // Then by priority score
      return (b.priorityScore || 0) - (a.priorityScore || 0);
    });
  },
});
