import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

export const getApprovedTestimonials = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("testimonials")
      .withIndex("by_approved", (q) => q.eq("approved", true))
      .collect();
  },
});

export const submitTestimonial = mutation({
  args: {
    name: v.string(),
    role: v.string(),
    message: v.string(),
    location: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("testimonials", {
      name: args.name,
      role: args.role,
      message: args.message,
      location: args.location,
      approved: false, // Requires admin approval
    });
  },
});
