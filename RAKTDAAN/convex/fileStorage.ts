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

// Generate upload URL for file storage
export const generateUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    const isAdmin = await isCurrentUserAdmin(ctx);
    if (!isAdmin) {
      throw new Error("Unauthorized: Admin access required");
    }

    return await ctx.storage.generateUploadUrl();
  },
});

// Store file metadata after upload
export const storeFileMetadata = mutation({
  args: {
    storageId: v.id("_storage"),
    fileName: v.string(),
    fileType: v.string(),
    fileSize: v.number(),
    category: v.string(),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const isAdmin = await isCurrentUserAdmin(ctx);
    if (!isAdmin) {
      throw new Error("Unauthorized: Admin access required");
    }

    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("User not authenticated");

    // Get the file URL from storage
    const fileUrl = await ctx.storage.getUrl(args.storageId);
    if (!fileUrl) {
      throw new Error("Failed to get file URL");
    }

    // Store file metadata in gallery table
    const fileId = await ctx.db.insert("gallery", {
      title: args.title || args.fileName,
      description: args.description || "",
      imageUrl: fileUrl,
      category: args.category,
      uploadedBy: userId,
      uploadedAt: Date.now(),
      isActive: true,
      tags: [],
      // Additional metadata
      fileName: args.fileName,
      fileType: args.fileType,
      fileSize: args.fileSize,
      storageId: args.storageId,
    });

    return {
      fileId,
      fileUrl,
      fileName: args.fileName,
    };
  },
});

// Get file URL by storage ID
export const getFileUrl = query({
  args: {
    storageId: v.id("_storage"),
  },
  handler: async (ctx, args) => {
    return await ctx.storage.getUrl(args.storageId);
  },
});

// Delete file from storage
export const deleteFile = mutation({
  args: {
    fileId: v.id("gallery"),
  },
  handler: async (ctx, args) => {
    const isAdmin = await isCurrentUserAdmin(ctx);
    if (!isAdmin) {
      throw new Error("Unauthorized: Admin access required");
    }

    // Get the file record
    const file = await ctx.db.get(args.fileId);
    if (!file) {
      throw new Error("File not found");
    }

    // Delete from storage if storageId exists
    if (file.storageId) {
      await ctx.storage.delete(file.storageId);
    }

    // Delete from database
    await ctx.db.delete(args.fileId);

    return { success: true };
  },
});

// Upload ID document for verification
export const uploadIdDocument = mutation({
  args: {
    storageId: v.id("_storage"),
    fileName: v.string(),
    fileType: v.string(),
    fileSize: v.number(),
    idType: v.string(),
    donorId: v.id("donors"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("User not authenticated");

    // Get the file URL from storage
    const fileUrl = await ctx.storage.getUrl(args.storageId);
    if (!fileUrl) {
      throw new Error("Failed to get file URL");
    }

    // Check if verification record exists
    const existingVerification = await ctx.db
      .query("donorVerifications")
      .withIndex("by_donor", (q) => q.eq("donorId", args.donorId))
      .first();

    if (existingVerification) {
      // Update existing verification
      await ctx.db.patch(existingVerification._id, {
        idType: args.idType,
        idImageUrl: fileUrl,
        fileName: args.fileName,
        fileType: args.fileType,
        fileSize: args.fileSize,
        status: "pending",
        submittedAt: Date.now(),
        verifiedAt: undefined,
        verifiedBy: undefined,
        rejectionReason: undefined,
      });

      return {
        verificationId: existingVerification._id,
        fileUrl,
        fileName: args.fileName,
      };
    } else {
      // Get the donor's userId
      const donor = await ctx.db.get(args.donorId);
      if (!donor) {
        throw new Error("Donor not found");
      }

      // Create new verification record
      const verificationId = await ctx.db.insert("donorVerifications", {
        donorId: args.donorId,
        userId: donor.userId,
        verified: false,
        idType: args.idType,
        idNumber: "pending", // Will be updated when admin reviews
        idImageUrl: fileUrl,
        fileName: args.fileName,
        fileType: args.fileType,
        fileSize: args.fileSize,
        status: "pending",
        submittedAt: Date.now(),
      });

      return {
        verificationId,
        fileUrl,
        fileName: args.fileName,
      };
    }
  },
});
