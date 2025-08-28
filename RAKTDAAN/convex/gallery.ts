import { getAuthUserId } from "@convex-dev/auth/server";
import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Admin user IDs
const ADMIN_EMAILS = ["admin@raktdaan.com", "superadmin@raktdaan.com", "test.admin@raktdaan.com"];

// Check if current user is admin
const isCurrentUserAdmin = async (ctx: any) => {
  const userId = await getAuthUserId(ctx);
  if (!userId) return false;
  
  const user = await ctx.db.get(userId);
  if (!user) return false;
  
  return ADMIN_EMAILS.includes(user.email || "");
};

// Upload photo to gallery
export const uploadPhoto = mutation({
  args: {
    title: v.string(),
    description: v.optional(v.string()),
    imageUrl: v.string(),
    category: v.string(),
    tags: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    const isAdmin = await isCurrentUserAdmin(ctx);
    if (!isAdmin) {
      throw new Error("Unauthorized: Admin access required");
    }

    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("User not authenticated");

    const photoId = await ctx.db.insert("gallery", {
      ...args,
      uploadedBy: userId,
      uploadedAt: Date.now(),
      isActive: true,
    });

    return photoId;
  },
});

// Get all gallery photos
export const getAllPhotos = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("gallery")
      .withIndex("by_active", (q) => q.eq("isActive", true))
      .order("desc")
      .collect();
  },
});

// Get public photos (for everyone to see)
export const getPublicPhotos = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("gallery")
      .withIndex("by_active", (q) => q.eq("isActive", true))
      .order("desc")
      .collect();
  },
});

// Get photos by category
export const getPhotosByCategory = query({
  args: { category: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("gallery")
      .withIndex("by_category", (q) => q.eq("category", args.category))
      .filter((q) => q.eq(q.field("isActive"), true))
      .order("desc")
      .collect();
  },
});

// Update photo
export const updatePhoto = mutation({
  args: {
    photoId: v.id("gallery"),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    category: v.optional(v.string()),
    isActive: v.optional(v.boolean()),
    tags: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    const isAdmin = await isCurrentUserAdmin(ctx);
    if (!isAdmin) {
      throw new Error("Unauthorized: Admin access required");
    }

    const { photoId, ...updates } = args;
    await ctx.db.patch(photoId, updates);

    return { success: true };
  },
});

// Delete photo
export const deletePhoto = mutation({
  args: { photoId: v.id("gallery") },
  handler: async (ctx, args) => {
    const isAdmin = await isCurrentUserAdmin(ctx);
    if (!isAdmin) {
      throw new Error("Unauthorized: Admin access required");
    }

    await ctx.db.delete(args.photoId);
    return { success: true };
  },
});

// Get gallery analytics
export const getGalleryAnalytics = query({
  args: {},
  handler: async (ctx) => {
    const isAdmin = await isCurrentUserAdmin(ctx);
    if (!isAdmin) {
      throw new Error("Unauthorized: Admin access required");
    }

    const photos = await ctx.db.query("gallery").collect();
    const activePhotos = photos.filter(p => p.isActive);

    const photosByCategory = photos.reduce((acc, photo) => {
      acc[photo.category] = (acc[photo.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      totalPhotos: photos.length,
      activePhotos: activePhotos.length,
      photosByCategory,
      recentUploads: photos.slice(0, 5),
    };
  },
});

// Public upload for community photos (no admin required)
export const uploadPublicPhoto = mutation({
  args: {
    title: v.string(),
    description: v.optional(v.string()),
    imageUrl: v.string(),
    category: v.string(),
    tags: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    // This allows any authenticated user to upload
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("User not authenticated");

    const photoId = await ctx.db.insert("gallery", {
      ...args,
      uploadedBy: userId,
      uploadedAt: Date.now(),
      isActive: true,
    });

    return photoId;
  },
});
