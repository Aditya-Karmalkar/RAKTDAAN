import { getAuthUserId } from "@convex-dev/auth/server";
import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Admin user IDs - In production, store these in environment variables
const ADMIN_EMAILS = ["admin@raktdaan.com", "superadmin@raktdaan.com", "test.admin@raktdaan.com"];

// Check if current user is admin
const isCurrentUserAdmin = async (ctx: any) => {
  const userId = await getAuthUserId(ctx);
  if (!userId) return false;
  
  const user = await ctx.db.get(userId);
  if (!user) return false;
  
  return ADMIN_EMAILS.includes(user.email || "");
};

// Create a new campaign
export const createCampaign = mutation({
  args: {
    title: v.string(),
    description: v.string(),
    shortDescription: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
    bannerImageUrl: v.optional(v.string()),
    targetBloodType: v.optional(v.string()),
    targetLocation: v.optional(v.string()),
    targetGoal: v.optional(v.number()),
    startDate: v.number(),
    endDate: v.number(),
    priority: v.string(),
    organizingHospital: v.optional(v.id("hospitals")),
    contactInfo: v.object({
      phone: v.string(),
      email: v.string(),
      address: v.optional(v.string()),
    }),
    requirements: v.optional(v.array(v.string())),
    benefits: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    const isAdmin = await isCurrentUserAdmin(ctx);
    if (!isAdmin) {
      throw new Error("Unauthorized: Admin access required");
    }

    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("User not authenticated");

    const campaignId = await ctx.db.insert("campaigns", {
      ...args,
      currentCount: 0,
      isActive: true,
      createdBy: userId,
    });

    return campaignId;
  },
});

// Get all campaigns
export const getAllCampaigns = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("campaigns").order("desc").collect();
  },
});

// Get active campaigns
export const getActiveCampaigns = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("campaigns")
      .withIndex("by_active", (q) => q.eq("isActive", true))
      .order("desc")
      .collect();
  },
});

// Get campaign by ID
export const getCampaignById = query({
  args: { campaignId: v.id("campaigns") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.campaignId);
  },
});

// Update campaign
export const updateCampaign = mutation({
  args: {
    campaignId: v.id("campaigns"),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    shortDescription: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
    bannerImageUrl: v.optional(v.string()),
    targetBloodType: v.optional(v.string()),
    targetLocation: v.optional(v.string()),
    targetGoal: v.optional(v.number()),
    startDate: v.optional(v.number()),
    endDate: v.optional(v.number()),
    isActive: v.optional(v.boolean()),
    priority: v.optional(v.string()),
    organizingHospital: v.optional(v.id("hospitals")),
    contactInfo: v.optional(v.object({
      phone: v.string(),
      email: v.string(),
      address: v.optional(v.string()),
    })),
    requirements: v.optional(v.array(v.string())),
    benefits: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    const isAdmin = await isCurrentUserAdmin(ctx);
    if (!isAdmin) {
      throw new Error("Unauthorized: Admin access required");
    }

    const { campaignId, ...updates } = args;
    await ctx.db.patch(campaignId, updates);

    return { success: true };
  },
});

// Delete campaign
export const deleteCampaign = mutation({
  args: { campaignId: v.id("campaigns") },
  handler: async (ctx, args) => {
    const isAdmin = await isCurrentUserAdmin(ctx);
    if (!isAdmin) {
      throw new Error("Unauthorized: Admin access required");
    }

    await ctx.db.delete(args.campaignId);
    return { success: true };
  },
});

// Register for campaign (for users)
export const registerForCampaign = mutation({
  args: {
    campaignId: v.id("campaigns"),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("User not authenticated");

    // Check if already registered
    const existingRegistration = await ctx.db
      .query("campaignRegistrations")
      .withIndex("by_campaign", (q) => q.eq("campaignId", args.campaignId))
      .filter((q) => q.eq(q.field("userId"), userId))
      .first();

    if (existingRegistration) {
      throw new Error("Already registered for this campaign");
    }

    // Get donor info if exists
    const donor = await ctx.db
      .query("donors")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    const registrationId = await ctx.db.insert("campaignRegistrations", {
      campaignId: args.campaignId,
      userId,
      donorId: donor?._id,
      registeredAt: Date.now(),
      status: "registered",
      notes: args.notes,
    });

    // Update campaign count
    const campaign = await ctx.db.get(args.campaignId);
    if (campaign) {
      await ctx.db.patch(args.campaignId, {
        currentCount: (campaign.currentCount || 0) + 1,
      });
    }

    return registrationId;
  },
});

// Get campaign registrations (admin only)
export const getCampaignRegistrations = query({
  args: { campaignId: v.id("campaigns") },
  handler: async (ctx, args) => {
    const isAdmin = await isCurrentUserAdmin(ctx);
    if (!isAdmin) {
      throw new Error("Unauthorized: Admin access required");
    }

    return await ctx.db
      .query("campaignRegistrations")
      .withIndex("by_campaign", (q) => q.eq("campaignId", args.campaignId))
      .collect();
  },
});

// Get campaign analytics
export const getCampaignAnalytics = query({
  args: {},
  handler: async (ctx) => {
    const isAdmin = await isCurrentUserAdmin(ctx);
    if (!isAdmin) {
      throw new Error("Unauthorized: Admin access required");
    }

    const campaigns = await ctx.db.query("campaigns").collect();
    const registrations = await ctx.db.query("campaignRegistrations").collect();

    const totalCampaigns = campaigns.length;
    const activeCampaigns = campaigns.filter(c => c.isActive).length;
    const totalRegistrations = registrations.length;
    const completedRegistrations = registrations.filter(r => r.status === "completed").length;

    const campaignsByPriority = campaigns.reduce((acc, campaign) => {
      acc[campaign.priority] = (acc[campaign.priority] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const registrationsByStatus = registrations.reduce((acc, reg) => {
      acc[reg.status] = (acc[reg.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      totalCampaigns,
      activeCampaigns,
      totalRegistrations,
      completedRegistrations,
      campaignsByPriority,
      registrationsByStatus,
      successRate: totalRegistrations > 0 ? Math.round((completedRegistrations / totalRegistrations) * 100) : 0,
    };
  },
});
