import { v } from "convex/values";
import { mutation } from "./_generated/server";

// Function to create sample SOS alerts for testing
export const createSampleSosAlerts = mutation({
  args: {
    hospitalId: v.id("hospitals"),
  },
  handler: async (ctx, args) => {
    const sampleAlerts = [
      {
        hospitalId: args.hospitalId,
        bloodGroup: "O+",
        urgency: "critical",
        unitsNeeded: 5,
        location: "New York, NY",
        contactNumber: "+1-555-1001",
        description: "Urgent need for O+ blood for emergency surgery patient",
        status: "active",
        expiresAt: Date.now() + (24 * 60 * 60 * 1000), // 24 hours from now
      },
      {
        hospitalId: args.hospitalId,
        bloodGroup: "A+",
        urgency: "urgent",
        unitsNeeded: 3,
        location: "New York, NY", 
        contactNumber: "+1-555-1001",
        description: "A+ blood needed for scheduled surgery tomorrow",
        status: "active",
        expiresAt: Date.now() + (48 * 60 * 60 * 1000), // 48 hours from now
      },
      {
        hospitalId: args.hospitalId,
        bloodGroup: "B-",
        urgency: "normal",
        unitsNeeded: 2,
        location: "New York, NY",
        contactNumber: "+1-555-1001", 
        description: "B- blood for upcoming elective procedure",
        status: "active",
        expiresAt: Date.now() + (7 * 24 * 60 * 60 * 1000), // 7 days from now
      }
    ];

    const createdAlerts = [];
    for (const alert of sampleAlerts) {
      const alertId = await ctx.db.insert("sosAlerts", alert);
      createdAlerts.push(alertId);
    }

    return {
      success: true,
      message: `Created ${createdAlerts.length} sample SOS alerts`,
      alertIds: createdAlerts
    };
  },
});
