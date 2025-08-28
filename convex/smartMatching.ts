import { query, mutation, internalQuery, internalMutation, action } from "./_generated/server";
import { v } from "convex/values";
import { api, internal } from "./_generated/api";

// Types for smart matching
export type DonorMatch = {
  donorId: string;
  name: string;
  bloodGroup: string;
  location: string;
  distance: number;
  estimatedTravelTime: number;
  matchScore: number;
  availability: boolean;
  lastDonation: number | null;
  healthStatus: string;
  responseTime: number;
  successRate: number;
  emergencyOnly: boolean;
  restrictions: string[];
};

export type MatchRecommendation = {
  donorId: string;
  matchScore: number;
  priorityRank: number;
  estimatedResponseTime: number;
  travelTime: number;
  availability: boolean;
  healthStatus: string;
};

/**
 * Calculate priority score for an SOS alert based on urgency and other factors
 */
export const calculatePriorityScore = mutation({
  args: {
    alertId: v.id("sosAlerts"),
  },
  returns: v.number(),
  handler: async (ctx, args) => {
    const alert = await ctx.db.get(args.alertId);
    if (!alert) throw new Error("Alert not found");

    let priorityScore = 0;
    
    // Base urgency score
    switch (alert.urgency) {
      case "critical":
        priorityScore += 100;
        break;
      case "urgent":
        priorityScore += 70;
        break;
      case "normal":
        priorityScore += 30;
        break;
    }

    // Time sensitivity (closer to expiry = higher priority)
    const timeUntilExpiry = alert.expiresAt - Date.now();
    const hoursUntilExpiry = timeUntilExpiry / (1000 * 60 * 60);
    
    if (hoursUntilExpiry < 1) priorityScore += 50; // Critical time
    else if (hoursUntilExpiry < 3) priorityScore += 30; // Urgent time
    else if (hoursUntilExpiry < 6) priorityScore += 15; // Moderate time

    // Blood group rarity bonus
    const rareBloodGroups = ["AB-", "B-", "AB+"];
    if (rareBloodGroups.includes(alert.bloodGroup)) {
      priorityScore += 20;
    }

    // Units needed (more units = higher priority)
    if (alert.unitsNeeded > 5) priorityScore += 25;
    else if (alert.unitsNeeded > 2) priorityScore += 15;

    // Update the alert with calculated priority score
    await ctx.db.patch(args.alertId, {
      priorityScore,
      lastMatchingUpdate: Date.now(),
    });

    return priorityScore;
  },
});

/**
 * Find eligible donors for an SOS alert using smart matching
 */
export const findEligibleDonors = query({
  args: {
    alertId: v.id("sosAlerts"),
    limit: v.optional(v.number()),
  },
  returns: v.array(v.object({
    donorId: v.id("donors"),
    name: v.string(),
    bloodGroup: v.string(),
    location: v.string(),
    distance: v.number(),
    estimatedTravelTime: v.number(),
    matchScore: v.number(),
    availability: v.boolean(),
    lastDonation: v.optional(v.number()),
    healthStatus: v.optional(v.string()),
    responseTime: v.optional(v.number()),
    successRate: v.optional(v.number()),
    emergencyOnly: v.optional(v.boolean()),
    restrictions: v.optional(v.array(v.string())),
  })),
  handler: async (ctx, args) => {
    const alert = await ctx.db.get(args.alertId);
    if (!alert) throw new Error("Alert not found");

    // AI-Powered Smart Matching: Get all eligible donors
    let eligibleDonors = await ctx.db
      .query("donors")
      .withIndex("by_blood_group", (q) => q.eq("bloodGroup", alert.bloodGroup))
      .collect();

    // Enforce donor eligibility: health and last donation interval
    const now = Date.now();
    const minIntervalMs = 56 * 24 * 60 * 60 * 1000; // 56 days
    // Include donorVerifications self-reported eligibility when present
    const verifications = await Promise.all(eligibleDonors.map(async (d) => ({
      donorId: d._id,
      verification: await ctx.db
        .query("donorVerifications")
        .withIndex("by_donor", (q) => q.eq("donorId", d._id))
        .first()
    })));
    const verificationByDonor: Record<string, any> = {};
    for (const vrec of verifications) verificationByDonor[vrec.donorId as unknown as string] = vrec.verification;

    eligibleDonors = eligibleDonors.filter((donor) => {
      if (donor.healthStatus === "restricted") return false;
      const v = verificationByDonor[donor._id as unknown as string];
      const lastDonationCandidate = v?.lastDonationDate ?? donor.lastDonation;
      if (lastDonationCandidate && now - lastDonationCandidate < minIntervalMs) return false;
      // Basic screen-out for reported risky health conditions
      if (Array.isArray(v?.healthConditions) && v.healthConditions.some((c: string) => /hepatitis|hiv|malaria|recent surgery|pregnant/i.test(c))) {
        return false;
      }
      return true;
    });

    // AI-Enhanced Donor Scoring and Ranking
    const scoredDonors: Array<{
      donorId: any;
      name: string;
      bloodGroup: string;
      location: string;
      distance: number;
      estimatedTravelTime: number;
      matchScore: number;
      availability: boolean;
      lastDonation?: number;
      healthStatus?: string;
      responseTime?: number;
      successRate?: number;
      emergencyOnly?: boolean;
      restrictions?: string[];
    }> = await Promise.all(
      eligibleDonors.map(async (donor) => {
        // Core match score calculation
        const matchScore: any = await ctx.runQuery(internal.smartMatching.calculateDonorMatchScore, {
          donorId: donor._id,
          alertId: args.alertId,
        });

        // AI Learning: Get historical performance data
        const historicalScore = await ctx.runQuery(internal.smartMatching.getHistoricalPerformance, {
          donorId: donor._id,
          bloodGroup: alert.bloodGroup,
          urgency: alert.urgency,
        });

        // AI-Enhanced Final Score: Combine real-time + historical + availability
        let finalScore = matchScore?.totalScore || 0;
        
        // Availability bonus (available donors get priority)
        if (donor.availability) {
          finalScore += 25;
        }
        
        // Historical performance bonus
        finalScore += (historicalScore * 0.3);
        
        // Emergency preference bonus
        if (alert.urgency === "critical" && donor.emergencyOnly) {
          finalScore += 30;
        }
        
        // Health status bonus (use verified data if available)
        const healthBonus: Record<string, number> = { "excellent": 20, "good": 15, "fair": 10, "restricted": 0 };
        const v = verificationByDonor[donor._id as unknown as string];
        const derivedHealth = donor.healthStatus || (Array.isArray(v?.healthConditions) && v.healthConditions.length === 0 ? "good" : "fair");
        finalScore += healthBonus[derivedHealth] || 10;
        
        // Response time bonus (faster responders get higher scores)
        const responseBonus = Math.max(0, 30 - (donor.responseTime || 30));
        finalScore += responseBonus;

        // Calculate intelligent travel time estimation
        const estimatedTravelTime = await ctx.runQuery(internal.smartMatching.calculateTravelTime, {
          donorLocation: donor.location,
          hospitalLocation: alert.location,
          urgency: alert.urgency,
        });

        return {
          donorId: donor._id,
          name: donor.name,
          bloodGroup: donor.bloodGroup,
          location: donor.location,
          distance: matchScore?.distance || 0,
          estimatedTravelTime: estimatedTravelTime || Math.round((matchScore?.distance || 0) * 2),
          matchScore: finalScore,
          availability: donor.availability,
          lastDonation: donor.lastDonation,
          healthStatus: donor.healthStatus,
          responseTime: donor.responseTime,
          successRate: donor.successRate,
          emergencyOnly: donor.emergencyOnly,
          restrictions: donor.restrictions,
        };
      })
    );

    // AI-Enhanced Multi-Factor Sorting Algorithm
    const sortedDonors = scoredDonors.sort((a: any, b: any) => {
      // Primary: Final AI score
      if (Math.abs(a.matchScore - b.matchScore) > 15) {
        return b.matchScore - a.matchScore;
      }
      
      // Secondary: Availability status
      if (a.availability !== b.availability) {
        return b.availability ? 1 : -1;
      }
      
      // Tertiary: Health status priority
      const healthPriority: Record<string, number> = { "excellent": 4, "good": 3, "fair": 2, "restricted": 1 };
      const aHealth = healthPriority[a.healthStatus || "fair"] || 2;
      const bHealth = healthPriority[b.healthStatus || "fair"] || 2;
      if (aHealth !== bHealth) {
        return bHealth - aHealth;
      }
      
      // Quaternary: Response time efficiency
      const aResponse = a.responseTime || 30;
      const bResponse = b.responseTime || 30;
      return aResponse - bResponse;
      
      // Quinary: Success rate (more reliable donors)
      if (Math.abs(a.successRate - b.successRate) > 10) {
        return (b.successRate || 0) - (a.successRate || 0);
      }
    });

    return sortedDonors;
  },
});

/**
 * Get top 3 recommended donors for an urgent request
 */
export const getTopRecommendedDonors = query({
  args: {
    alertId: v.id("sosAlerts"),
  },
  returns: v.array(v.object({
    donorId: v.id("donors"),
    matchScore: v.number(),
    priorityRank: v.number(),
    estimatedResponseTime: v.number(),
    estimatedTravelTime: v.number(),
    availability: v.boolean(),
    healthStatus: v.optional(v.string()),
    name: v.string(),
    location: v.string(),
    lastDonation: v.optional(v.number()),
  })),
  handler: async (ctx, args) => {
    const topDonors: any[] = await ctx.runQuery(api.smartMatching.findEligibleDonors, {
      alertId: args.alertId,
      limit: 3,
    });

    return topDonors.map((donor, index) => ({
      donorId: donor.donorId,
      matchScore: donor.matchScore,
      priorityRank: index + 1,
      estimatedResponseTime: donor.responseTime || 5, // Default 5 minutes
      estimatedTravelTime: donor.estimatedTravelTime,
      availability: donor.availability,
      healthStatus: donor.healthStatus,
      name: donor.name,
      location: donor.location,
      lastDonation: donor.lastDonation,
    }));
  },
});

/**
 * Calculate comprehensive match score for a donor-alert combination
 */
export const calculateDonorMatchScore = internalQuery({
  args: {
    donorId: v.id("donors"),
    alertId: v.id("sosAlerts"),
  },
  returns: v.object({
    totalScore: v.number(),
    distance: v.number(),
    healthScore: v.number(),
    availabilityScore: v.number(),
    responseScore: v.number(),
    successScore: v.number(),
  }),
  handler: async (ctx, args) => {
    const [donor, alert] = await Promise.all([
      ctx.db.get(args.donorId),
      ctx.db.get(args.alertId),
    ]);

    if (!donor || !alert) throw new Error("Donor or alert not found");

    // Calculate distance using coordinates when available, fallback to string-based estimate
    const donorLat = (donor as any).latitude as number | undefined;
    const donorLng = (donor as any).longitude as number | undefined;
    const hospital = await ctx.db.get(alert.hospitalId);
    const hospLat = (hospital as any)?.latitude as number | undefined;
    const hospLng = (hospital as any)?.longitude as number | undefined;

    const distance = (donorLat != null && donorLng != null && hospLat != null && hospLng != null)
      ? haversineKm(donorLat, donorLng, hospLat, hospLng)
      : calculateDistance(donor.location, alert.location);
    
    // Distance score (closer = higher score, max 30 points)
    const distanceScore = Math.max(0, 30 - (distance * 2));

    // Health status score (max 25 points)
    let healthScore = 0;
    switch (donor.healthStatus) {
      case "excellent":
        healthScore = 25;
        break;
      case "good":
        healthScore = 20;
        break;
      case "fair":
        healthScore = 15;
        break;
      case "restricted":
        healthScore = 5;
        break;
      default:
        healthScore = 15;
    }

    // Availability score (max 20 points)
    const availabilityScore = donor.availability ? 20 : 0;

    // Response time score (faster = higher score, max 15 points)
    const responseScore = Math.max(0, 15 - (donor.responseTime || 10));

    // Success rate score (max 10 points)
    const successScore = (donor.successRate || 50) / 10;

    // Emergency preference bonus
    let emergencyBonus = 0;
    if (alert.urgency === "critical" && donor.emergencyOnly) {
      emergencyBonus = 10;
    }

    const totalScore = distanceScore + healthScore + availabilityScore + responseScore + successScore + emergencyBonus;

    return {
      totalScore: Math.round(totalScore * 100) / 100,
      distance: Math.round(distance * 100) / 100,
      healthScore,
      availabilityScore,
      responseScore,
      successScore,
    };
  },
});

/**
 * Update donor availability status with one-click response
 */
export const updateDonorAvailability = mutation({
  args: {
    donorId: v.id("donors"),
    available: v.boolean(),
    responseTime: v.optional(v.number()),
  },
  returns: v.boolean(),
  handler: async (ctx, args) => {
    const donor = await ctx.db.get(args.donorId);
    if (!donor) throw new Error("Donor not found");

    await ctx.db.patch(args.donorId, {
      availability: args.available,
      lastAvailabilityUpdate: Date.now(),
      responseTime: args.responseTime || donor.responseTime,
    });

    return true;
  },
});

/**
 * Process donor response to SOS alert with smart matching
 */
export const processDonorResponse = mutation({
  args: {
    alertId: v.id("sosAlerts"),
    donorId: v.id("donors"),
    status: v.string(), // "interested", "confirmed", "completed"
    notes: v.optional(v.string()),
  },
  returns: v.id("donorResponses"),
  handler: async (ctx, args) => {
    const [alert, donor] = await Promise.all([
      ctx.db.get(args.alertId),
      ctx.db.get(args.donorId),
    ]);

    if (!alert || !donor) throw new Error("Alert or donor not found");

    // Calculate match score for this response
    const matchScore: any = await ctx.runQuery(internal.smartMatching.calculateDonorMatchScore, {
      donorId: args.donorId,
      alertId: args.alertId,
    });

    // Calculate response speed
    const responseSpeed = Date.now() - alert._creationTime;

    // Create donor response record
    const responseId: any = await ctx.db.insert("donorResponses", {
      sosAlertId: args.alertId,
      donorId: args.donorId,
      status: args.status,
      responseTime: Date.now(),
      notes: args.notes,
      matchScore: matchScore?.totalScore || 0,
      responseSpeed,
      availabilityConfirmed: true,
      estimatedTravelTime: Math.round((matchScore?.distance || 0) * 2),
      healthCheckPassed: donor.healthStatus !== "restricted",
      priorityRank: 0, // Will be calculated when ranking all responses
    });

    // Update alert with matched donors if this is a good match
    if (matchScore.totalScore > 70) {
      const currentMatchedDonors = alert.matchedDonors || [];
      if (!currentMatchedDonors.includes(args.donorId)) {
        await ctx.db.patch(args.alertId, {
          matchedDonors: [...currentMatchedDonors, args.donorId],
          lastMatchingUpdate: Date.now(),
        });
      }
    }

    return responseId;
  },
});

/**
 * Rank all donor responses for an alert by priority
 */
export const rankDonorResponses = mutation({
  args: {
    alertId: v.id("sosAlerts"),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const responses = await ctx.db
      .query("donorResponses")
      .withIndex("by_alert", (q) => q.eq("sosAlertId", args.alertId))
      .collect();

    // Sort responses by match score and response speed
    const rankedResponses = responses
      .sort((a, b) => {
        // Primary sort by match score
        if (b.matchScore !== a.matchScore) {
          return (b.matchScore || 0) - (a.matchScore || 0);
        }
        // Secondary sort by response speed (faster = better)
        return (a.responseSpeed || 0) - (b.responseSpeed || 0);
      })
      .map((response, index) => ({ ...response, priorityRank: index + 1 }));

    // Update all responses with their priority rank
    for (const response of rankedResponses) {
      await ctx.db.patch(response._id, {
        priorityRank: response.priorityRank,
      });
    }

    return null;
  },
});

/**
 * Get real-time matching analytics for an alert
 */
export const getMatchingAnalytics = query({
  args: {
    alertId: v.id("sosAlerts"),
  },
  returns: v.object({
    totalDonorsFound: v.number(),
    eligibleDonors: v.number(),
    responseRate: v.number(),
    averageResponseTime: v.number(),
    successfulMatches: v.number(),
    estimatedFulfillmentTime: v.number(),
  }),
  handler: async (ctx, args) => {
    const alert = await ctx.db.get(args.alertId);
    if (!alert) throw new Error("Alert not found");

    const responses = await ctx.db
      .query("donorResponses")
      .withIndex("by_alert", (q) => q.eq("sosAlertId", args.alertId))
      .collect();

    const totalDonorsFound = alert.notificationsSent || 0;
    const eligibleDonors = responses.length;
    const responseRate = totalDonorsFound > 0 ? (eligibleDonors / totalDonorsFound) * 100 : 0;
    
    const averageResponseTime = responses.length > 0 
      ? responses.reduce((sum, r) => sum + (r.responseSpeed || 0), 0) / responses.length / (1000 * 60) // Convert to minutes
      : 0;

    const successfulMatches = responses.filter(r => r.status === "confirmed" || r.status === "completed").length;
    
    // Estimate fulfillment time based on response data
    const estimatedFulfillmentTime = responses.length > 0 
      ? Math.round((averageResponseTime + 30) / 60) // Response time + 30 min travel
      : 0;

    return {
      totalDonorsFound,
      eligibleDonors,
      responseRate: Math.round(responseRate * 100) / 100,
      averageResponseTime: Math.round(averageResponseTime * 100) / 100,
      successfulMatches,
      estimatedFulfillmentTime,
    };
  },
});

// Helper function to calculate distance (simplified)
function calculateDistance(location1: string, location2: string): number {
  // This is a simplified distance calculation
  // In production, use Google Maps Distance Matrix API or similar
  // For now, return a random distance between 1-20 km
  return Math.floor(Math.random() * 20) + 1;
}

// Haversine distance in kilometers
function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const toRad = (d: number) => (d * Math.PI) / 180;
  const R = 6371; // km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 100) / 100;
}

/**
 * AI Learning: Get historical performance data for a donor
 */
export const getHistoricalPerformance = internalQuery({
  args: {
    donorId: v.id("donors"),
    bloodGroup: v.string(),
    urgency: v.string(),
  },
  returns: v.number(),
  handler: async (ctx, args) => {
    // Get donor's historical responses for similar alerts
    const historicalResponses = await ctx.db
      .query("donorResponses")
      .withIndex("by_donor", (q) => q.eq("donorId", args.donorId))
      .collect();

    if (historicalResponses.length === 0) return 50; // Default score for new donors

    // Calculate performance score based on:
    // 1. Response success rate
    // 2. Response speed
    // 3. Blood group match success
    // 4. Urgency level handling

    let totalScore = 0;
    let validResponses = 0;

    for (const response of historicalResponses) {
      const alert = await ctx.db.get(response.sosAlertId);
      if (!alert) continue;

      validResponses++;
      
      // Success rate bonus (0-30 points)
      if (response.status === "completed") {
        totalScore += 30;
      } else if (response.status === "confirmed") {
        totalScore += 20;
      } else if (response.status === "interested") {
        totalScore += 10;
      }

      // Response speed bonus (0-20 points)
      const responseSpeed = response.responseSpeed || 0;
      const speedScore = Math.max(0, 20 - (responseSpeed / (1000 * 60))); // Convert to minutes
      totalScore += speedScore;

      // Blood group match bonus (0-25 points)
      if (alert.bloodGroup === args.bloodGroup) {
        totalScore += 25;
      }

      // Urgency handling bonus (0-25 points)
      if (alert.urgency === args.urgency) {
        totalScore += 25;
      }
    }

    return validResponses > 0 ? Math.round(totalScore / validResponses) : 50;
  },
});

/**
 * AI-Powered Travel Time Calculation with Google Maps Integration
 */
export const calculateTravelTime = internalQuery({
  args: {
    donorLocation: v.string(),
    hospitalLocation: v.string(),
    urgency: v.string(),
  },
  returns: v.number(),
  handler: async (ctx, args) => {
    // TODO: Integrate with Google Maps Distance Matrix API
    // For now, use intelligent estimation based on urgency and location
    
    // Calculate base distance
    const baseDistance = calculateDistance(args.donorLocation, args.hospitalLocation);
    
    // Apply urgency multiplier (critical cases get priority routing)
    let urgencyMultiplier = 1.0;
    switch (args.urgency) {
      case "critical":
        urgencyMultiplier = 0.7; // 30% faster for critical cases
        break;
      case "urgent":
        urgencyMultiplier = 0.85; // 15% faster for urgent cases
        break;
      case "normal":
        urgencyMultiplier = 1.0; // Normal speed
        break;
    }
    
    // Estimate travel time in minutes
    // Base: 2 minutes per km, adjusted by urgency
    const estimatedMinutes = Math.round((baseDistance * 2) * urgencyMultiplier);
    
    // Add traffic simulation (rush hour, etc.)
    const currentHour = new Date().getHours();
    let trafficMultiplier = 1.0;
    
    if (currentHour >= 7 && currentHour <= 9) { // Morning rush
      trafficMultiplier = 1.3;
    } else if (currentHour >= 17 && currentHour <= 19) { // Evening rush
      trafficMultiplier = 1.4;
    } else if (currentHour >= 22 || currentHour <= 6) { // Night (less traffic)
      trafficMultiplier = 0.8;
    }
    
    return Math.round(estimatedMinutes * trafficMultiplier);
  },
});

/**
 * AI-Powered Donor Preference Learning
 */
export const learnDonorPreferences = internalMutation({
  args: {
    donorId: v.id("donors"),
    alertId: v.id("sosAlerts"),
    responseStatus: v.string(),
    responseTime: v.number(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const donor = await ctx.db.get(args.donorId);
    if (!donor) return null;

    const alert = await ctx.db.get(args.alertId);
    if (!alert) return null;

    // Update donor's response time average
    const currentAvg = donor.responseTime || 30;
    const newAvg = Math.round((currentAvg + args.responseTime) / 2);
    
    // Update success rate based on response status
    let newSuccessRate = donor.successRate || 50;
    if (args.responseStatus === "completed") {
      newSuccessRate = Math.min(100, newSuccessRate + 5);
    } else if (args.responseStatus === "confirmed") {
      newSuccessRate = Math.min(100, newSuccessRate + 2);
    } else if (args.responseStatus === "interested") {
      newSuccessRate = Math.max(0, newSuccessRate - 1);
    }

    // Update donor with learned preferences
    await ctx.db.patch(args.donorId, {
      responseTime: newAvg,
      successRate: newSuccessRate,
      lastAvailabilityUpdate: Date.now(),
    });

    return null;
  },
});

/**
 * Enhanced Response Management: Handle multiple donor responses professionally
 */
export const manageDonorResponses = mutation({
  args: {
    alertId: v.id("sosAlerts"),
    action: v.union(
      v.literal("accept"),
      v.literal("reject"),
      v.literal("hold"),
      v.literal("complete")
    ),
    donorId: v.id("donors"),
    notes: v.optional(v.string()),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const [alert, donor] = await Promise.all([
      ctx.db.get(args.alertId),
      ctx.db.get(args.donorId),
    ]);

    if (!alert || !donor) throw new Error("Alert or donor not found");

    // Find the donor's response to this alert
    const response = await ctx.db
      .query("donorResponses")
      .withIndex("by_alert_and_donor", (q) => 
        q.eq("sosAlertId", args.alertId).eq("donorId", args.donorId)
      )
      .unique();

    if (!response) throw new Error("Donor response not found");

    let newStatus: string;
    let updateData: any = {};

    switch (args.action) {
      case "accept":
        newStatus = "accepted";
        updateData = {
          status: newStatus,
          acceptedAt: Date.now(),
          hospitalNotes: args.notes,
          isPrimaryDonor: true, // Mark as primary donor
        };
        
        // Update alert to show this donor is accepted
        await ctx.db.patch(args.alertId, {
          acceptedDonorId: args.donorId,
          status: "donor_confirmed",
          lastUpdate: Date.now(),
        });
        
        // Notify other donors that this alert is fulfilled
        await ctx.runMutation(internal.smartMatching.notifyOtherDonors, {
          alertId: args.alertId,
          acceptedDonorId: args.donorId,
        });
        break;

      case "reject":
        newStatus = "rejected";
        updateData = {
          status: newStatus,
          rejectedAt: Date.now(),
          hospitalNotes: args.notes,
        };
        break;

      case "hold":
        newStatus = "on_hold";
        updateData = {
          status: newStatus,
          heldAt: Date.now(),
          hospitalNotes: args.notes,
        };
        break;

      case "complete":
        newStatus = "completed";
        updateData = {
          status: newStatus,
          completedAt: Date.now(),
          hospitalNotes: args.notes,
        };
        
        // Update alert status
        await ctx.db.patch(args.alertId, {
          status: "completed",
          completedAt: Date.now(),
          lastUpdate: Date.now(),
        });
        
        // Learn from this successful donation
        await ctx.runMutation(internal.smartMatching.learnDonorPreferences, {
          donorId: args.donorId,
          alertId: args.alertId,
          responseStatus: "completed",
          responseTime: response.responseSpeed || 0,
        });
        break;
    }

    // Update the donor response
    await ctx.db.patch(response._id, updateData);

    return null;
  },
});

/**
 * Get comprehensive response analytics for an alert
 */
export const getResponseAnalytics = query({
  args: {
    alertId: v.id("sosAlerts"),
  },
  returns: v.object({
    totalResponses: v.number(),
    responseBreakdown: v.object({
      interested: v.number(),
      confirmed: v.number(),
      accepted: v.number(),
      rejected: v.number(),
      on_hold: v.number(),
      completed: v.number(),
    }),
    responseTimeline: v.array(v.object({
      donorId: v.id("donors"),
      donorName: v.string(),
      status: v.string(),
      responseTime: v.number(),
      matchScore: v.number(),
      priorityRank: v.number(),
      acceptedAt: v.optional(v.number()),
      hospitalNotes: v.optional(v.string()),
    })),
    averageResponseTime: v.number(),
    topResponders: v.array(v.object({
      donorId: v.id("donors"),
      name: v.string(),
      matchScore: v.number(),
      responseSpeed: v.number(),
      status: v.string(),
    })),
    fulfillmentStatus: v.string(),
    estimatedCompletionTime: v.number(),
  }),
  handler: async (ctx, args) => {
    const alert = await ctx.db.get(args.alertId);
    if (!alert) throw new Error("Alert not found");

    const responses = await ctx.db
      .query("donorResponses")
      .withIndex("by_alert", (q) => q.eq("sosAlertId", args.alertId))
      .collect();

    // Calculate response breakdown
    const breakdown = {
      interested: 0,
      confirmed: 0,
      accepted: 0,
      rejected: 0,
      on_hold: 0,
      completed: 0,
    };

    responses.forEach(response => {
      const status = response.status || "interested";
      if (breakdown[status as keyof typeof breakdown] !== undefined) {
        breakdown[status as keyof typeof breakdown]++;
      }
    });

    // Get response timeline with donor details
    const timeline = await Promise.all(
      responses.map(async (response) => {
        const donor = await ctx.db.get(response.donorId);
        return {
          donorId: response.donorId,
          donorName: donor?.name || "Unknown",
          status: response.status || "interested",
          responseTime: response.responseTime || 0,
          matchScore: response.matchScore || 0,
          priorityRank: response.priorityRank || 0,
          acceptedAt: response.acceptedAt,
          hospitalNotes: response.hospitalNotes,
        };
      })
    );

    // Calculate average response time
    const validResponseTimes = responses
      .filter(r => r.responseSpeed && r.responseSpeed > 0)
      .map(r => r.responseSpeed || 0);
    
    const averageResponseTime = validResponseTimes.length > 0
      ? validResponseTimes.reduce((sum, time) => sum + time, 0) / validResponseTimes.length
      : 0;

    // Get top responders (by match score and response speed)
    const topResponders = await Promise.all(
      responses
        .sort((a, b) => {
          const aScore = (a.matchScore || 0) * 0.7 + (30 - (a.responseSpeed || 30) / (1000 * 60)) * 0.3;
          const bScore = (b.matchScore || 0) * 0.7 + (30 - (b.responseSpeed || 30) / (1000 * 60)) * 0.3;
          return bScore - aScore;
        })
        .slice(0, 5)
        .map(async (response) => {
          const donor = await ctx.db.get(response.donorId);
          return {
            donorId: response.donorId,
            name: donor?.name || "Unknown",
            matchScore: response.matchScore || 0,
            responseSpeed: response.responseSpeed || 0,
            status: response.status || "interested",
          };
        })
    );

    // Determine fulfillment status
    let fulfillmentStatus = "waiting";
    if (breakdown.completed > 0) {
      fulfillmentStatus = "completed";
    } else if (breakdown.accepted > 0) {
      fulfillmentStatus = "donor_confirmed";
    } else if (breakdown.confirmed > 0) {
      fulfillmentStatus = "donors_interested";
    } else if (breakdown.interested > 0) {
      fulfillmentStatus = "initial_responses";
    }

    // Estimate completion time based on accepted donor
    const acceptedResponse = responses.find(r => r.status === "accepted");
    let estimatedCompletionTime = 0;
    
    if (acceptedResponse) {
      const donor = await ctx.db.get(acceptedResponse.donorId);
      const travelTime = await ctx.runQuery(internal.smartMatching.calculateTravelTime, {
        donorLocation: donor?.location || "",
        hospitalLocation: alert.location,
        urgency: alert.urgency,
      });
      estimatedCompletionTime = travelTime || 30; // Default 30 minutes
    }

    return {
      totalResponses: responses.length,
      responseBreakdown: breakdown,
      responseTimeline: timeline.sort((a, b) => a.responseTime - b.responseTime),
      averageResponseTime: Math.round(averageResponseTime / (1000 * 60)), // Convert to minutes
      topResponders,
      fulfillmentStatus,
      estimatedCompletionTime,
    };
  },
});

/**
 * Smart Response Ranking: Dynamically reorder responses based on new information
 */
export const updateResponseRankings = mutation({
  args: {
    alertId: v.id("sosAlerts"),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const alert = await ctx.db.get(args.alertId);
    if (!alert) throw new Error("Alert not found");

    const responses = await ctx.db
      .query("donorResponses")
      .withIndex("by_alert", (q) => q.eq("sosAlertId", args.alertId))
      .collect();

    // Get fresh donor data for each response
    const enhancedResponses = await Promise.all(
      responses.map(async (response) => {
        const donor = await ctx.db.get(response.donorId);
        if (!donor) return null;

        // Recalculate match score with latest data
        const matchScore = await ctx.runQuery(internal.smartMatching.calculateDonorMatchScore, {
          donorId: response.donorId,
          alertId: args.alertId,
        });

        // Get historical performance
        const historicalScore = await ctx.runQuery(internal.smartMatching.getHistoricalPerformance, {
          donorId: response.donorId,
          bloodGroup: alert.bloodGroup,
          urgency: alert.urgency,
        });

        // Calculate final score
        let finalScore = matchScore.totalScore || 0;
        finalScore += (historicalScore * 0.3);
        
        if (donor.availability) finalScore += 25;
        if (alert.urgency === "critical" && donor.emergencyOnly) finalScore += 30;
        
        const healthBonus: Record<string, number> = { "excellent": 20, "good": 15, "fair": 10, "restricted": 0 };
        finalScore += healthBonus[donor.healthStatus || "fair"] || 10;
        
        const responseBonus = Math.max(0, 30 - (donor.responseTime || 30));
        finalScore += responseBonus;

        return {
          ...response,
          donor,
          finalScore,
          recalculatedAt: Date.now(),
        };
      })
    );

    // Filter out null responses and sort by final score
    const validResponses = enhancedResponses.filter(r => r !== null);
    const sortedResponses = validResponses.sort((a, b) => b.finalScore - a.finalScore);

    // Update rankings and scores
    for (let i = 0; i < sortedResponses.length; i++) {
      const response = sortedResponses[i];
      await ctx.db.patch(response._id, {
        priorityRank: i + 1,
        matchScore: response.finalScore,
        lastRankingUpdate: Date.now(),
      });
    }

    // Update alert with latest ranking info
    await ctx.db.patch(args.alertId, {
      lastRankingUpdate: Date.now(),
      totalResponses: validResponses.length,
      topDonorScore: validResponses.length > 0 ? validResponses[0].finalScore : 0,
    });

    return null;
  },
});

/**
 * Notify other donors when one is accepted
 */
export const notifyOtherDonors = internalMutation({
  args: {
    alertId: v.id("sosAlerts"),
    acceptedDonorId: v.id("donors"),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const responses = await ctx.db
      .query("donorResponses")
      .withIndex("by_alert", (q) => q.eq("sosAlertId", args.alertId))
      .collect();

    // Update all other responses to "alert_fulfilled" status
    for (const response of responses) {
      if (response.donorId !== args.acceptedDonorId) {
        await ctx.db.patch(response._id, {
          status: "alert_fulfilled",
          fulfilledAt: Date.now(),
          hospitalNotes: "Another donor was selected for this alert",
        });
      }
    }

    return null;
  },
});

/**
 * Handle donor unavailability after confirmation - Find replacement donors automatically
 */
export const handleDonorUnavailability = mutation({
  args: {
    alertId: v.id("sosAlerts"),
    donorId: v.id("donors"),
    reason: v.string(), // "emergency", "health_issue", "personal", "other"
    notes: v.optional(v.string()),
  },
  returns: v.object({
    success: v.boolean(),
    replacementDonors: v.array(v.object({
      donorId: v.id("donors"),
      name: v.string(),
      matchScore: v.number(),
      estimatedTravelTime: v.number(),
      availability: v.boolean(),
    })),
    message: v.string(),
  }),
  handler: async (ctx, args): Promise<{
    success: boolean;
    replacementDonors: Array<{
      donorId: any;
      name: string;
      matchScore: number;
      estimatedTravelTime: number;
      availability: boolean;
    }>;
    message: string;
  }> => {
    const [alert, donor] = await Promise.all([
      ctx.db.get(args.alertId),
      ctx.db.get(args.donorId),
    ]);

    if (!alert || !donor) {
      return {
        success: false,
        replacementDonors: [],
        message: "Alert or donor not found",
      };
    }

    // Mark donor as unavailable
    await ctx.db.patch(args.donorId, {
      availability: false,
      lastAvailabilityUpdate: Date.now(),
    });

    // Update donor response status
    const existingResponse = await ctx.db
      .query("donorResponses")
      .withIndex("by_alert_and_donor", (q) =>
        q.eq("sosAlertId", args.alertId).eq("donorId", args.donorId)
      )
      .first();

    if (existingResponse) {
      await ctx.db.patch(existingResponse._id, {
        status: "unavailable",
        unavailableAt: Date.now(),
        unavailabilityReason: args.reason,
        notes: args.notes,
      });
    }

    // Find replacement donors
    const replacementDonors = await ctx.runQuery(api.smartMatching.findEligibleDonors, {
      alertId: args.alertId,
      limit: 10,
    });

    // Filter for available replacements
    const availableReplacements = replacementDonors.filter((donor: any) => {
      return donor.donorId !== args.donorId && donor.availability && donor.matchScore > 0;
    });

    if (availableReplacements.length > 0) {
      // Update alert with new top donors
      const topReplacementIds = availableReplacements.slice(0, 3).map((d: any) => d.donorId);
      
      await ctx.db.patch(args.alertId, {
        matchedDonors: topReplacementIds,
        lastMatchingUpdate: Date.now(),
        lastUpdate: Date.now(),
      });

      // Notify replacement donors
      for (const replacement of availableReplacements.slice(0, 3)) {
        await ctx.runMutation(internal.smartMatching.notifyOtherDonors, {
          alertId: args.alertId,
          acceptedDonorId: replacement.donorId,
        });
      }

      return {
        success: true,
        replacementDonors: availableReplacements.slice(0, 3).map((d: any) => ({
          donorId: d.donorId,
          name: d.name,
          matchScore: d.matchScore,
          estimatedTravelTime: d.estimatedTravelTime,
          availability: d.availability,
        })),
        message: `Found ${availableReplacements.length} replacement donors. Top 3 have been notified.`,
      };
    } else {
      // No replacements found - escalate the alert
      await ctx.db.patch(args.alertId, {
        status: "escalated",
        escalatedAt: Date.now(),
        escalationReason: `No replacement donors found after ${donor.name} became unavailable`,
        escalationLevel: 3, // High priority
        lastUpdate: Date.now(),
      });

      return {
        success: false,
        replacementDonors: [],
        message: "No replacement donors found. Alert has been escalated for urgent attention.",
      };
    }
  },
});

/**
 * Get donor unavailability analytics for hospitals
 */
export const getDonorUnavailabilityAnalytics = query({
  args: {
    alertId: v.id("sosAlerts"),
  },
  returns: v.object({
    totalUnavailable: v.number(),
    unavailabilityReasons: v.array(v.object({
      reason: v.string(),
      count: v.number(),
      percentage: v.number(),
    })),
    averageResponseTime: v.number(),
    replacementSuccessRate: v.number(),
    escalatedAlerts: v.number(),
  }),
  handler: async (ctx, args) => {
    const responses = await ctx.db
      .query("donorResponses")
      .withIndex("by_alert", (q) => q.eq("sosAlertId", args.alertId))
      .collect();

    const unavailableResponses = responses.filter(r => r.status === "unavailable");
    const totalResponses = responses.length;

    // Analyze unavailability reasons
    const reasonCounts: Record<string, number> = {};
    unavailableResponses.forEach(response => {
      const reason = response.hospitalNotes?.split(": ")[1]?.split(".")[0] || "unknown";
      reasonCounts[reason] = (reasonCounts[reason] || 0) + 1;
    });

    const unavailabilityReasons = Object.entries(reasonCounts).map(([reason, count]) => ({
      reason,
      count,
      percentage: Math.round((count / unavailableResponses.length) * 100),
    }));

    // Calculate replacement success rate
    const successfulReplacements = responses.filter(r => 
      r.status === "accepted" && r.isReplacement
    ).length;

    const replacementSuccessRate = unavailableResponses.length > 0 
      ? Math.round((successfulReplacements / unavailableResponses.length) * 100)
      : 0;

    return {
      totalUnavailable: unavailableResponses.length,
      unavailabilityReasons,
      averageResponseTime: Math.round(
        unavailableResponses.reduce((sum, r) => sum + (r.responseSpeed || 0), 0) / 
        unavailableResponses.length / (1000 * 60)
      ),
      replacementSuccessRate,
      escalatedAlerts: responses.filter(r => r.status === "escalated").length,
    };
  },
});


/**
 * Get real-time donor availability updates
 */
export const getDonorAvailabilityUpdates = query({
  args: {
    alertId: v.id("sosAlerts"),
  },
  returns: v.array(v.object({
    donorId: v.id("donors"),
    name: v.string(),
    availability: v.boolean(),
    lastUpdate: v.number(),
    status: v.string(),
    matchScore: v.number(),
    priorityRank: v.number(),
    estimatedTravelTime: v.number(),
  })),
  handler: async (ctx, args) => {
    const responses = await ctx.db
      .query("donorResponses")
      .withIndex("by_alert", (q) => q.eq("sosAlertId", args.alertId))
      .collect();

    const availabilityUpdates: Array<{
      donorId: any;
      name: string;
      availability: boolean;
      lastUpdate: number;
      status: string;
      matchScore: number;
      priorityRank: number;
      estimatedTravelTime: number;
    } | null> = await Promise.all(
      responses.map(async (response) => {
        const donor = await ctx.db.get(response.donorId);
        if (!donor) return null;

        const alert = await ctx.db.get(args.alertId);
        if (!alert) return null;

        const travelTime: any = await ctx.runQuery(internal.smartMatching.calculateTravelTime, {
          donorLocation: donor.latitude != null && donor.longitude != null ? `${donor.latitude},${donor.longitude}` : donor.location,
          hospitalLocation: (await ctx.db.get(alert.hospitalId))?.latitude != null && (await ctx.db.get(alert.hospitalId))?.longitude != null
            ? `${(await ctx.db.get(alert.hospitalId))?.latitude},${(await ctx.db.get(alert.hospitalId))?.longitude}`
            : alert.location,
          urgency: alert.urgency,
        });

        return {
          donorId: response.donorId,
          name: donor.name,
          availability: donor.availability,
          lastUpdate: donor.lastAvailabilityUpdate || 0,
          status: response.status || "interested",
          matchScore: response.matchScore || 0,
          priorityRank: response.priorityRank || 0,
          estimatedTravelTime: travelTime || 0,
        };
      })
    );

    return availabilityUpdates.filter((update): update is NonNullable<typeof update> => update !== null);
  },
});

/**
 * Build travel time pairs for an alert (for client to fetch ETAs via action)
 */
export const getTravelPairs = query({
  args: { alertId: v.id("sosAlerts") },
  returns: v.array(v.object({
    donorId: v.string(),
    donorLocation: v.string(),
    hospitalLocation: v.string(),
    urgency: v.string(),
  })),
  handler: async (ctx, args) => {
    const alert = await ctx.db.get(args.alertId);
    if (!alert) throw new Error("Alert not found");
    const hospital = await ctx.db.get(alert.hospitalId);
    if (!hospital) throw new Error("Hospital not found");

    const responses = await ctx.db
      .query("donorResponses")
      .withIndex("by_alert", (q) => q.eq("sosAlertId", args.alertId))
      .collect();

    const pairs = await Promise.all(responses.map(async (r) => {
      const donor = await ctx.db.get(r.donorId);
      if (!donor) return null;
      const donorLoc = donor.latitude != null && donor.longitude != null
        ? `${donor.latitude},${donor.longitude}`
        : donor.location;
      const hospLoc = hospital.latitude != null && hospital.longitude != null
        ? `${hospital.latitude},${hospital.longitude}`
        : alert.location;
      return {
        donorId: r.donorId as any,
        donorLocation: donorLoc,
        hospitalLocation: hospLoc,
        urgency: alert.urgency,
      };
    }));

    return pairs.filter((p): p is NonNullable<typeof p> => p !== null);
  },
});

/**
 * Apply travel times returned from Google Maps to donor responses
 */
export const applyTravelTimes = mutation({
  args: {
    alertId: v.id("sosAlerts"),
    results: v.array(v.object({ donorId: v.string(), duration: v.number() })),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const responses = await ctx.db
      .query("donorResponses")
      .withIndex("by_alert", (q) => q.eq("sosAlertId", args.alertId))
      .collect();
    const durationByDonor: Record<string, number> = {};
    for (const r of args.results) durationByDonor[r.donorId] = r.duration;

    for (const resp of responses) {
      const d = durationByDonor[resp.donorId as unknown as string];
      if (typeof d === "number") {
        await ctx.db.patch(resp._id, { estimatedTravelTime: d });
      }
    }
    return null;
  },
});
