import { getAuthUserId } from "@convex-dev/auth/server";
import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Admin check function
const ADMIN_EMAILS = ["admin@raktdaan.com", "superadmin@raktdaan.com", "test.admin@raktdaan.com"];

async function isCurrentUserAdmin(ctx: any) {
  const userId = await getAuthUserId(ctx);
  if (!userId) return false;
  
  const user = await ctx.db.get(userId);
  return user && ADMIN_EMAILS.includes(user.email);
}

// Team Member Management
export const createTeamMember = mutation({
  args: {
    name: v.string(),
    email: v.string(),
    password: v.string(),
    role: v.string(),
    department: v.string(),
    phone: v.optional(v.string()),
    bio: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Check if current user is admin
    const isAdmin = await isCurrentUserAdmin(ctx);
    if (!isAdmin) {
      throw new Error("Unauthorized: Admin access required");
    }

    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("User not authenticated");

    // Check if email already exists
    const existingMember = await ctx.db
      .query("teamMembers")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first();

    if (existingMember) {
      throw new Error("Team member with this email already exists");
    }

    // Create team member
    const teamMemberId = await ctx.db.insert("teamMembers", {
      name: args.name,
      email: args.email,
      password: args.password, // In production, this should be hashed
      role: args.role,
      department: args.department,
      phone: args.phone,
      bio: args.bio,
      joinDate: Date.now(),
      status: "active",
      createdBy: userId,
    });

    // Create notification for new team member
    await ctx.db.insert("teamNotifications", {
      recipientId: teamMemberId,
      recipientType: "team_member",
      title: "Welcome to the Team!",
      message: `Welcome ${args.name}! You have been added to the ${args.department} department.`,
      type: "system",
      read: false,
      timestamp: Date.now(),
    });

    return teamMemberId;
  },
});

export const getAllTeamMembers = query({
  handler: async (ctx) => {
    const isAdmin = await isCurrentUserAdmin(ctx);
    if (!isAdmin) {
      throw new Error("Unauthorized: Admin access required");
    }

    const teamMembers = await ctx.db.query("teamMembers").collect();
    return teamMembers.map(member => ({
      ...member,
      password: undefined, // Don't return password
    }));
  },
});

export const getTeamMembersByDepartment = query({
  args: { department: v.string() },
  handler: async (ctx, args) => {
    const isAdmin = await isCurrentUserAdmin(ctx);
    if (!isAdmin) {
      throw new Error("Unauthorized: Admin access required");
    }

    const teamMembers = await ctx.db
      .query("teamMembers")
      .withIndex("by_department", (q) => q.eq("department", args.department))
      .filter((q) => q.eq(q.field("status"), "active"))
      .collect();

    return teamMembers.map(member => ({
      ...member,
      password: undefined,
    }));
  },
});

export const updateTeamMemberStatus = mutation({
  args: {
    teamMemberId: v.id("teamMembers"),
    status: v.string(),
  },
  handler: async (ctx, args) => {
    const isAdmin = await isCurrentUserAdmin(ctx);
    if (!isAdmin) {
      throw new Error("Unauthorized: Admin access required");
    }

    await ctx.db.patch(args.teamMemberId, {
      status: args.status,
    });

    // Create notification
    const member = await ctx.db.get(args.teamMemberId);
    if (member) {
      await ctx.db.insert("teamNotifications", {
        recipientId: args.teamMemberId,
        recipientType: "team_member",
        title: "Status Update",
        message: `Your account status has been updated to: ${args.status}`,
        type: "system",
        read: false,
        timestamp: Date.now(),
      });
    }

    return { success: true };
  },
});

export const deleteTeamMember = mutation({
  args: { teamMemberId: v.id("teamMembers") },
  handler: async (ctx, args) => {
    const isAdmin = await isCurrentUserAdmin(ctx);
    if (!isAdmin) {
      throw new Error("Unauthorized: Admin access required");
    }

    await ctx.db.delete(args.teamMemberId);
    return { success: true };
  },
});

// Chat Channel Management
export const createChatChannel = mutation({
  args: {
    name: v.string(),
    description: v.optional(v.string()),
    type: v.string(),
    participants: v.array(v.string()), // Array of IDs as strings
  },
  handler: async (ctx, args) => {
    const isAdmin = await isCurrentUserAdmin(ctx);
    if (!isAdmin) {
      throw new Error("Unauthorized: Admin access required");
    }

    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("User not authenticated");

    // Convert string IDs to proper ID types
    const participantIds = args.participants.map(id => {
      // Determine if it's a user ID or team member ID based on the format
      // In practice, you might want a more robust way to determine this
      return id as any; // Type assertion for now
    });

    const channelId = await ctx.db.insert("chatChannels", {
      name: args.name,
      description: args.description,
      type: args.type,
      createdBy: userId,
      participants: participantIds,
      isActive: true,
    });

    // Send system message to channel
    await ctx.db.insert("chatMessages", {
      channelId,
      senderId: userId as any,
      senderType: "admin",
      senderName: "System",
      message: `Channel "${args.name}" has been created.`,
      messageType: "system",
      timestamp: Date.now(),
      edited: false,
    });

    return channelId;
  },
});

export const getAllChatChannels = query({
  handler: async (ctx) => {
    const isAdmin = await isCurrentUserAdmin(ctx);
    if (!isAdmin) {
      throw new Error("Unauthorized: Admin access required");
    }

    return await ctx.db.query("chatChannels").collect();
  },
});

// Chat Messages
export const sendMessage = mutation({
  args: {
    channelId: v.id("chatChannels"),
    message: v.string(),
    messageType: v.optional(v.string()),
    replyTo: v.optional(v.id("chatMessages")),
  },
  handler: async (ctx, args) => {
    const isAdmin = await isCurrentUserAdmin(ctx);
    if (!isAdmin) {
      throw new Error("Unauthorized: Admin access required");
    }

    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("User not authenticated");

    const user = await ctx.db.get(userId);
    if (!user) throw new Error("User not found");

    const messageId = await ctx.db.insert("chatMessages", {
      channelId: args.channelId,
      senderId: userId as any,
      senderType: "admin",
      senderName: user.name || user.email || "Admin",
      message: args.message,
      messageType: args.messageType || "text",
      timestamp: Date.now(),
      edited: false,
      replyTo: args.replyTo,
    });

    return messageId;
  },
});

export const getChannelMessages = query({
  args: { 
    channelId: v.id("chatChannels"),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const isAdmin = await isCurrentUserAdmin(ctx);
    if (!isAdmin) {
      throw new Error("Unauthorized: Admin access required");
    }

    const messages = await ctx.db
      .query("chatMessages")
      .withIndex("by_channel", (q) => q.eq("channelId", args.channelId))
      .order("desc")
      .take(args.limit || 50);

    return messages.reverse(); // Return in chronological order
  },
});

// Notifications
export const getTeamNotifications = query({
  args: { 
    recipientId: v.string(),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const isAdmin = await isCurrentUserAdmin(ctx);
    if (!isAdmin) {
      throw new Error("Unauthorized: Admin access required");
    }

    const notifications = await ctx.db
      .query("teamNotifications")
      .withIndex("by_recipient", (q) => q.eq("recipientId", args.recipientId as any))
      .order("desc")
      .take(args.limit || 20);

    return notifications;
  },
});

export const markNotificationAsRead = mutation({
  args: { notificationId: v.id("teamNotifications") },
  handler: async (ctx, args) => {
    const isAdmin = await isCurrentUserAdmin(ctx);
    if (!isAdmin) {
      throw new Error("Unauthorized: Admin access required");
    }

    await ctx.db.patch(args.notificationId, {
      read: true,
    });

    return { success: true };
  },
});

// Team Analytics
export const getTeamAnalytics = query({
  handler: async (ctx) => {
    const isAdmin = await isCurrentUserAdmin(ctx);
    if (!isAdmin) {
      throw new Error("Unauthorized: Admin access required");
    }

    const teamMembers = await ctx.db.query("teamMembers").collect();
    const chatChannels = await ctx.db.query("chatChannels").collect();
    const recentMessages = await ctx.db
      .query("chatMessages")
      .withIndex("by_timestamp")
      .order("desc")
      .take(100);

    const analytics = {
      totalTeamMembers: teamMembers.length,
      activeTeamMembers: teamMembers.filter(m => m.status === "active").length,
      totalChatChannels: chatChannels.length,
      activeChatChannels: chatChannels.filter(c => c.isActive).length,
      recentMessagesCount: recentMessages.length,
      departmentStats: teamMembers.reduce((acc, member) => {
        acc[member.department] = (acc[member.department] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      roleStats: teamMembers.reduce((acc, member) => {
        acc[member.role] = (acc[member.role] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
    };

    return analytics;
  },
});
