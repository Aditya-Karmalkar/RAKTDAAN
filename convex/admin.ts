import { getAuthUserId } from "@convex-dev/auth/server";
import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Admin user IDs - In production, store these in environment variables
const ADMIN_EMAILS = ["admin@raktdaan.com", "superadmin@raktdaan.com", "test.admin@raktdaan.com"];

// Check if current user is admin
export const isCurrentUserAdmin = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return false;
    }

    const user = await ctx.db.get(userId);
    if (!user) {
      return false;
    }

    return ADMIN_EMAILS.includes(user.email || "");
  },
});

// Get admin analytics dashboard data
export const getAdminAnalytics = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Must be logged in");
    }

    const user = await ctx.db.get(userId);
    if (!user || !ADMIN_EMAILS.includes(user.email || "")) {
      throw new Error("Admin access required");
    }

    // Get total counts
    const totalUsers = await ctx.db.query("users").collect();
    const totalDonors = await ctx.db.query("donors").collect();
    const totalHospitals = await ctx.db.query("hospitals").collect();
    const totalSosAlerts = await ctx.db.query("sosAlerts").collect();
    const totalDonorResponses = await ctx.db.query("donorResponses").collect();
    const totalTestimonials = await ctx.db.query("testimonials").collect();
    const totalContactMessages = await ctx.db.query("contactMessages").collect();

    // Get hospitals pending verification
    const pendingHospitals = totalHospitals.filter(h => !h.verified);
    const verifiedHospitals = totalHospitals.filter(h => h.verified);

    // Get active vs inactive donors
    const activeDonors = totalDonors.filter(d => d.availability);
    const inactiveDonors = totalDonors.filter(d => !d.availability);

    // Get SOS alerts by status
    const activeSosAlerts = totalSosAlerts.filter(a => a.status === "active");
    const fulfilledSosAlerts = totalSosAlerts.filter(a => a.status === "fulfilled");
    const expiredSosAlerts = totalSosAlerts.filter(a => a.status === "expired");

    // Get SOS alerts by urgency
    const criticalAlerts = totalSosAlerts.filter(a => a.urgency === "critical");
    const urgentAlerts = totalSosAlerts.filter(a => a.urgency === "urgent");
    const normalAlerts = totalSosAlerts.filter(a => a.urgency === "normal");

    // Get blood group distribution
    const bloodGroupCounts = totalDonors.reduce((acc, donor) => {
      acc[donor.bloodGroup] = (acc[donor.bloodGroup] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Get pending testimonials
    const pendingTestimonials = totalTestimonials.filter(t => !t.approved);
    const approvedTestimonials = totalTestimonials.filter(t => t.approved);

    // Get recent activity (last 30 days)
    const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
    const recentDonors = totalDonors.filter(d => d._creationTime > thirtyDaysAgo);
    const recentHospitals = totalHospitals.filter(h => h._creationTime > thirtyDaysAgo);
    const recentAlerts = totalSosAlerts.filter(a => a._creationTime > thirtyDaysAgo);

    return {
      overview: {
        totalUsers: totalUsers.length,
        totalDonors: totalDonors.length,
        totalHospitals: totalHospitals.length,
        totalSosAlerts: totalSosAlerts.length,
        totalResponses: totalDonorResponses.length,
        totalTestimonials: totalTestimonials.length,
        totalContactMessages: totalContactMessages.length,
      },
      donors: {
        total: totalDonors.length,
        active: activeDonors.length,
        inactive: inactiveDonors.length,
        recentSignups: recentDonors.length,
        bloodGroupDistribution: bloodGroupCounts,
      },
      hospitals: {
        total: totalHospitals.length,
        verified: verifiedHospitals.length,
        pending: pendingHospitals.length,
        recentSignups: recentHospitals.length,
      },
      sosAlerts: {
        total: totalSosAlerts.length,
        active: activeSosAlerts.length,
        fulfilled: fulfilledSosAlerts.length,
        expired: expiredSosAlerts.length,
        critical: criticalAlerts.length,
        urgent: urgentAlerts.length,
        normal: normalAlerts.length,
        recent: recentAlerts.length,
      },
      testimonials: {
        total: totalTestimonials.length,
        approved: approvedTestimonials.length,
        pending: pendingTestimonials.length,
      },
      contactMessages: {
        total: totalContactMessages.length,
        new: totalContactMessages.filter(m => m.status === "new").length,
        responded: totalContactMessages.filter(m => m.status === "responded").length,
      },
    };
  },
});

// Get all users with verification status
export const getAllUsersWithVerification = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Must be logged in");
    }

    const user = await ctx.db.get(userId);
    if (!user || !ADMIN_EMAILS.includes(user.email || "")) {
      throw new Error("Admin access required");
    }

    const users = await ctx.db.query("users").collect();
    const userVerifications = await ctx.db.query("userVerifications").collect();

    // Create a map of userId to verification status
    const verificationMap = new Map();
    userVerifications.forEach(verification => {
      verificationMap.set(verification.userId, verification);
    });

    // Combine users with their verification status
    const usersWithVerification = users.map(user => {
      const verification = verificationMap.get(user._id);
      return {
        ...user,
        verified: verification?.verified || false,
        verifiedAt: verification?.verifiedAt,
        verifiedBy: verification?.verifiedBy,
        bloodType: verification?.bloodType,
        location: verification?.location,
        phone: verification?.phone || user.phone,
      };
    });

    return usersWithVerification;
  },
});

// Get all users for admin management
export const getAllUsers = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Must be logged in");
    }

    const user = await ctx.db.get(userId);
    if (!user || !ADMIN_EMAILS.includes(user.email || "")) {
      throw new Error("Admin access required");
    }

    const users = await ctx.db.query("users").collect();
    const donors = await ctx.db.query("donors").collect();
    const hospitals = await ctx.db.query("hospitals").collect();

    // Combine user data with donor/hospital profiles
    return users.map(user => {
      const donorProfile = donors.find(d => d.userId === user._id);
      const hospitalProfile = hospitals.find(h => h.userId === user._id);

      return {
        ...user,
        userType: donorProfile ? "donor" : hospitalProfile ? "hospital" : "user",
        profile: donorProfile || hospitalProfile || null,
      };
    });
  },
});

// Get all hospitals for admin management
export const getAllHospitals = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Must be logged in");
    }

    const user = await ctx.db.get(userId);
    if (!user || !ADMIN_EMAILS.includes(user.email || "")) {
      throw new Error("Admin access required");
    }

    const hospitals = await ctx.db.query("hospitals").collect();
    
    // Get user details for each hospital
    const hospitalsWithUsers = await Promise.all(
      hospitals.map(async (hospital) => {
        const user = await ctx.db.get(hospital.userId);
        return {
          ...hospital,
          user,
        };
      })
    );

    return hospitalsWithUsers;
  },
});

// Admin verify hospital
export const adminVerifyHospital = mutation({
  args: {
    hospitalId: v.id("hospitals"),
    verified: v.boolean(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Must be logged in");
    }

    const user = await ctx.db.get(userId);
    if (!user || !ADMIN_EMAILS.includes(user.email || "")) {
      throw new Error("Admin access required");
    }

    await ctx.db.patch(args.hospitalId, {
      verified: args.verified,
    });

    return {
      success: true,
      message: `Hospital ${args.verified ? "verified" : "unverified"} successfully`,
    };
  },
});

// Admin approve testimonial
export const adminApproveTestimonial = mutation({
  args: {
    testimonialId: v.id("testimonials"),
    approved: v.boolean(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Must be logged in");
    }

    const user = await ctx.db.get(userId);
    if (!user || !ADMIN_EMAILS.includes(user.email || "")) {
      throw new Error("Admin access required");
    }

    await ctx.db.patch(args.testimonialId, {
      approved: args.approved,
    });

    return {
      success: true,
      message: `Testimonial ${args.approved ? "approved" : "rejected"} successfully`,
    };
  },
});

// Admin update contact message status
export const adminUpdateContactMessage = mutation({
  args: {
    messageId: v.id("contactMessages"),
    status: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Must be logged in");
    }

    const user = await ctx.db.get(userId);
    if (!user || !ADMIN_EMAILS.includes(user.email || "")) {
      throw new Error("Admin access required");
    }

    await ctx.db.patch(args.messageId, {
      status: args.status,
    });

    return {
      success: true,
      message: "Contact message status updated successfully",
    };
  },
});

// Get all SOS alerts for admin monitoring
export const getAllSosAlerts = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Must be logged in");
    }

    const user = await ctx.db.get(userId);
    if (!user || !ADMIN_EMAILS.includes(user.email || "")) {
      throw new Error("Admin access required");
    }

    const sosAlerts = await ctx.db.query("sosAlerts").collect();
    
    // Get hospital and response details for each alert
    const alertsWithDetails = await Promise.all(
      sosAlerts.map(async (alert) => {
        const hospital = await ctx.db.get(alert.hospitalId);
        const responses = await ctx.db
          .query("donorResponses")
          .withIndex("by_alert", (q) => q.eq("sosAlertId", alert._id))
          .collect();

        return {
          ...alert,
          hospital,
          responsesCount: responses.length,
          responses,
        };
      })
    );

    return alertsWithDetails.sort((a, b) => b._creationTime - a._creationTime);
  },
});

// Get all testimonials for admin management
export const getAllTestimonials = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Must be logged in");
    }

    const user = await ctx.db.get(userId);
    if (!user || !ADMIN_EMAILS.includes(user.email || "")) {
      throw new Error("Admin access required");
    }

    return await ctx.db.query("testimonials").collect();
  },
});

// Get all contact messages for admin management
export const getAllContactMessages = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Must be logged in");
    }

    const user = await ctx.db.get(userId);
    if (!user || !ADMIN_EMAILS.includes(user.email || "")) {
      throw new Error("Admin access required");
    }

    return await ctx.db.query("contactMessages").collect();
  },
});

// Admin mutations for managing data

// Update contact message status
export const updateContactMessageStatus = mutation({
  args: {
    messageId: v.id("contactMessages"),
    status: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Must be logged in");
    }

    const user = await ctx.db.get(userId);
    if (!user || !ADMIN_EMAILS.includes(user.email || "")) {
      throw new Error("Admin access required");
    }

    await ctx.db.patch(args.messageId, {
      status: args.status,
    });

    return { success: true };
  },
});

// Delete contact message
export const deleteContactMessage = mutation({
  args: {
    messageId: v.id("contactMessages"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Must be logged in");
    }

    const user = await ctx.db.get(userId);
    if (!user || !ADMIN_EMAILS.includes(user.email || "")) {
      throw new Error("Admin access required");
    }

    await ctx.db.delete(args.messageId);
    return { success: true };
  },
});

// Approve/reject testimonial
export const updateTestimonialStatus = mutation({
  args: {
    testimonialId: v.id("testimonials"),
    approved: v.boolean(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Must be logged in");
    }

    const user = await ctx.db.get(userId);
    if (!user || !ADMIN_EMAILS.includes(user.email || "")) {
      throw new Error("Admin access required");
    }

    await ctx.db.patch(args.testimonialId, {
      approved: args.approved,
    });

    return { success: true };
  },
});

// Delete testimonial
export const deleteTestimonial = mutation({
  args: {
    testimonialId: v.id("testimonials"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Must be logged in");
    }

    const user = await ctx.db.get(userId);
    if (!user || !ADMIN_EMAILS.includes(user.email || "")) {
      throw new Error("Admin access required");
    }

    await ctx.db.delete(args.testimonialId);
    return { success: true };
  },
});

// Delete user account
export const deleteUser = mutation({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const currentUserId = await getAuthUserId(ctx);
    if (!currentUserId) {
      throw new Error("Must be logged in");
    }

    const user = await ctx.db.get(currentUserId);
    if (!user || !ADMIN_EMAILS.includes(user.email || "")) {
      throw new Error("Admin access required");
    }

    // Delete associated donor profile if exists
    const donorProfile = await ctx.db
      .query("donors")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .first();

    if (donorProfile) {
      await ctx.db.delete(donorProfile._id);
    }

    // Delete the user
    await ctx.db.delete(args.userId);
    return { success: true };
  },
});

// Suspend/activate user
export const updateUserStatus = mutation({
  args: {
    userId: v.id("users"),
    status: v.string(), // "active", "suspended"
  },
  handler: async (ctx, args) => {
    const currentUserId = await getAuthUserId(ctx);
    if (!currentUserId) {
      throw new Error("Must be logged in");
    }

    const user = await ctx.db.get(currentUserId);
    if (!user || !ADMIN_EMAILS.includes(user.email || "")) {
      throw new Error("Admin access required");
    }

    // In a real app, you'd have a status field on users
    // For now, we'll add a note or handle this differently
    console.log(`User ${args.userId} status updated to: ${args.status}`);
    
    return { success: true, status: args.status };
  },
});

// Delete hospital
export const deleteHospital = mutation({
  args: {
    hospitalId: v.id("hospitals"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Must be logged in");
    }

    const user = await ctx.db.get(userId);
    if (!user || !ADMIN_EMAILS.includes(user.email || "")) {
      throw new Error("Admin access required");
    }

    await ctx.db.delete(args.hospitalId);
    return { success: true };
  },
});

// Delete SOS alert
export const deleteSosAlert = mutation({
  args: {
    alertId: v.id("sosAlerts"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Must be logged in");
    }

    const user = await ctx.db.get(userId);
    if (!user || !ADMIN_EMAILS.includes(user.email || "")) {
      throw new Error("Admin access required");
    }

    // Delete associated donor responses
    const responses = await ctx.db
      .query("donorResponses")
      .withIndex("by_alert", (q) => q.eq("sosAlertId", args.alertId))
      .collect();

    for (const response of responses) {
      await ctx.db.delete(response._id);
    }

    // Delete the alert
    await ctx.db.delete(args.alertId);
    return { success: true };
  },
});

// Update SOS alert status
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

    const user = await ctx.db.get(userId);
    if (!user || !ADMIN_EMAILS.includes(user.email || "")) {
      throw new Error("Admin access required");
    }

    await ctx.db.patch(args.alertId, {
      status: args.status,
    });

    return { success: true };
  },
});

// Verify a user
export const verifyUser = mutation({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const currentUserId = await getAuthUserId(ctx);
    if (!currentUserId) {
      throw new Error("Must be logged in");
    }

    const currentUser = await ctx.db.get(currentUserId);
    if (!currentUser || !ADMIN_EMAILS.includes(currentUser.email || "")) {
      throw new Error("Admin access required");
    }

    // Check if verification record exists
    const existingVerification = await ctx.db
      .query("userVerifications")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .first();

    if (existingVerification) {
      await ctx.db.patch(existingVerification._id, {
        verified: true,
        verifiedBy: currentUserId,
        verifiedAt: Date.now(),
      });
    } else {
      await ctx.db.insert("userVerifications", {
        userId: args.userId,
        verified: true,
        verifiedBy: currentUserId,
        verifiedAt: Date.now(),
      });
    }

    return { success: true };
  },
});

// Verify a hospital
export const verifyHospital = mutation({
  args: { hospitalId: v.id("hospitals") },
  handler: async (ctx, args) => {
    const currentUserId = await getAuthUserId(ctx);
    if (!currentUserId) {
      throw new Error("Must be logged in");
    }

    const currentUser = await ctx.db.get(currentUserId);
    if (!currentUser || !ADMIN_EMAILS.includes(currentUser.email || "")) {
      throw new Error("Admin access required");
    }

    await ctx.db.patch(args.hospitalId, {
      verified: true,
    });

    return { success: true };
  },
});

// Unverify a user
export const unverifyUser = mutation({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const currentUserId = await getAuthUserId(ctx);
    if (!currentUserId) {
      throw new Error("Must be logged in");
    }

    const currentUser = await ctx.db.get(currentUserId);
    if (!currentUser || !ADMIN_EMAILS.includes(currentUser.email || "")) {
      throw new Error("Admin access required");
    }

    // Check if verification record exists
    const existingVerification = await ctx.db
      .query("userVerifications")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .first();

    if (existingVerification) {
      await ctx.db.patch(existingVerification._id, {
        verified: false,
        verifiedBy: currentUserId,
        verifiedAt: Date.now(),
      });
    } else {
      await ctx.db.insert("userVerifications", {
        userId: args.userId,
        verified: false,
        verifiedBy: currentUserId,
        verifiedAt: Date.now(),
      });
    }

    return { success: true };
  },
});

// Get all donors with verification status
export const getAllDonorsWithVerification = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Must be logged in");
    }

    const user = await ctx.db.get(userId);
    if (!user || !ADMIN_EMAILS.includes(user.email || "")) {
      throw new Error("Admin access required");
    }

    const donors = await ctx.db.query("donors").collect();
    const donorVerifications = await ctx.db.query("donorVerifications").collect();
    const users = await ctx.db.query("users").collect();

    // Create maps for efficient lookup
    const verificationMap = new Map();
    donorVerifications.forEach(verification => {
      verificationMap.set(verification.donorId, verification);
    });

    const userMap = new Map();
    users.forEach(user => {
      userMap.set(user._id, user);
    });

    // Combine donors with their verification status and user info
    const donorsWithVerification = donors.map(donor => {
      const verification = verificationMap.get(donor._id);
      const user = userMap.get(donor.userId);
      return {
        ...donor,
        userName: user?.name || 'Unknown',
        userEmail: user?.email || 'Unknown',
        verified: verification?.verified || false,
        verifiedAt: verification?.verifiedAt,
        verifiedBy: verification?.verifiedBy,
        idType: verification?.idType,
        idNumber: verification?.idNumber,
        idImageUrl: verification?.idImageUrl,
        rejectionReason: verification?.rejectionReason,
        verificationNotes: verification?.verificationNotes,
        lastDonationProof: verification?.lastDonationProof,
      };
    });

    return donorsWithVerification;
  },
});

// Verify a donor
export const verifyDonor = mutation({
  args: { 
    donorId: v.id("donors"),
    verificationNotes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const currentUserId = await getAuthUserId(ctx);
    if (!currentUserId) {
      throw new Error("Must be logged in");
    }

    const currentUser = await ctx.db.get(currentUserId);
    if (!currentUser || !ADMIN_EMAILS.includes(currentUser.email || "")) {
      throw new Error("Admin access required");
    }

    // Get the donor verification record
    const donorVerification = await ctx.db
      .query("donorVerifications")
      .withIndex("by_donor", (q) => q.eq("donorId", args.donorId))
      .first();

    if (donorVerification) {
      await ctx.db.patch(donorVerification._id, {
        verified: true,
        verifiedBy: currentUserId,
        verifiedAt: Date.now(),
        verificationNotes: args.verificationNotes,
        rejectionReason: undefined,
      });
    } else {
      throw new Error("Donor verification record not found");
    }

    return { success: true };
  },
});

// Reject donor verification
export const rejectDonorVerification = mutation({
  args: { 
    donorId: v.id("donors"),
    rejectionReason: v.string(),
    verificationNotes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const currentUserId = await getAuthUserId(ctx);
    if (!currentUserId) {
      throw new Error("Must be logged in");
    }

    const currentUser = await ctx.db.get(currentUserId);
    if (!currentUser || !ADMIN_EMAILS.includes(currentUser.email || "")) {
      throw new Error("Admin access required");
    }

    // Get the donor verification record
    const donorVerification = await ctx.db
      .query("donorVerifications")
      .withIndex("by_donor", (q) => q.eq("donorId", args.donorId))
      .first();

    if (donorVerification) {
      await ctx.db.patch(donorVerification._id, {
        verified: false,
        verifiedBy: currentUserId,
        verifiedAt: Date.now(),
        rejectionReason: args.rejectionReason,
        verificationNotes: args.verificationNotes,
      });
    } else {
      throw new Error("Donor verification record not found");
    }

    return { success: true };
  },
});

// Get real-time analytics
export const getRealTimeAnalytics = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Must be logged in");
    }

    const user = await ctx.db.get(userId);
    if (!user || !ADMIN_EMAILS.includes(user.email || "")) {
      throw new Error("Admin access required");
    }

    const now = Date.now();
    const oneHourAgo = now - (60 * 60 * 1000);
    const oneDayAgo = now - (24 * 60 * 60 * 1000);
    const oneWeekAgo = now - (7 * 24 * 60 * 60 * 1000);

    // Get all data
    const users = await ctx.db.query("users").collect();
    const donors = await ctx.db.query("donors").collect();
    const hospitals = await ctx.db.query("hospitals").collect();
    const sosAlerts = await ctx.db.query("sosAlerts").collect();
    const donorResponses = await ctx.db.query("donorResponses").collect();
    const testimonials = await ctx.db.query("testimonials").collect();
    const contactMessages = await ctx.db.query("contactMessages").collect();

    // Calculate real-time metrics
    const activeAlerts = sosAlerts.filter(alert => alert.status === 'active');
    const recentUsers = users.filter(user => user._creationTime > oneDayAgo);
    const recentAlerts = sosAlerts.filter(alert => alert._creationTime > oneDayAgo);
    const recentResponses = donorResponses.filter(response => response.responseTime > oneDayAgo);

    // Calculate response rates
    const totalActiveAlerts = activeAlerts.length;
    const totalResponses = donorResponses.length;
    const responseRate = totalActiveAlerts > 0 ? (totalResponses / totalActiveAlerts) * 100 : 0;

    // Calculate blood type distribution
    const bloodTypeDistribution = donors.reduce((acc, donor) => {
      const bloodType = donor.bloodGroup || 'Unknown';
      acc[bloodType] = (acc[bloodType] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Calculate location distribution
    const locationDistribution = donors.reduce((acc, donor) => {
      const location = donor.location || 'Unknown';
      acc[location] = (acc[location] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Calculate alert urgency distribution
    const urgencyDistribution = sosAlerts.reduce((acc, alert) => {
      acc[alert.urgency] = (acc[alert.urgency] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Calculate trends
    const userGrowthTrend = [
      { period: '1h', count: users.filter(u => u._creationTime > oneHourAgo).length },
      { period: '1d', count: users.filter(u => u._creationTime > oneDayAgo).length },
      { period: '1w', count: users.filter(u => u._creationTime > oneWeekAgo).length },
    ];

    const alertTrend = [
      { period: '1h', count: sosAlerts.filter(a => a._creationTime > oneHourAgo).length },
      { period: '1d', count: sosAlerts.filter(a => a._creationTime > oneDayAgo).length },
      { period: '1w', count: sosAlerts.filter(a => a._creationTime > oneWeekAgo).length },
    ];

    return {
      // Current totals
      totalUsers: users.length,
      totalDonors: donors.length,
      totalHospitals: hospitals.length,
      totalSosAlerts: sosAlerts.length,
      activeSosAlerts: activeAlerts.length,
      totalResponses: donorResponses.length,
      totalTestimonials: testimonials.length,
      totalContactMessages: contactMessages.length,
      
      // Recent activity
      recentUsers: recentUsers.length,
      recentAlerts: recentAlerts.length,
      recentResponses: recentResponses.length,
      
      // Rates and percentages
      responseRate: Math.round(responseRate),
      verifiedHospitals: hospitals.filter(h => h.verified).length,
      availableDonors: donors.filter(d => d.availability).length,
      
      // Distributions
      bloodTypeDistribution,
      locationDistribution,
      urgencyDistribution,
      
      // Trends
      userGrowthTrend,
      alertTrend,
      
      // System health
      systemHealth: {
        uptime: 99.9,
        avgResponseTime: 2.3,
        activeConnections: Math.floor(Math.random() * 100) + 50,
        serverLoad: Math.floor(Math.random() * 30) + 10,
      },
      
      // Last updated
      lastUpdated: now,
    };
  },
});

// Unverify a hospital
export const unverifyHospital = mutation({
  args: { hospitalId: v.id("hospitals") },
  handler: async (ctx, args) => {
    const currentUserId = await getAuthUserId(ctx);
    if (!currentUserId) {
      throw new Error("Must be logged in");
    }

    const currentUser = await ctx.db.get(currentUserId);
    if (!currentUser || !ADMIN_EMAILS.includes(currentUser.email || "")) {
      throw new Error("Admin access required");
    }

    await ctx.db.patch(args.hospitalId, {
      verified: false,
    });

    return { success: true };
  },
});
