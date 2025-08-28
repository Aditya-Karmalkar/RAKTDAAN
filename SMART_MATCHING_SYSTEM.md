# 🧠 AI-Powered Smart Matching System

## 🎯 Problem Statement

Currently, the platform connects hospitals with nearby donors through location-based alerts. While this is helpful, in emergency situations it may still take time to find the right donor who is:

- **Available at the moment**
- **Healthy and eligible to donate**
- **Best matched based on blood group, urgency, and proximity**

This sometimes delays critical blood transfusions.

## 🚀 Proposed Solution

Implement an **AI-powered Smart Matching System** that prioritizes and recommends the most suitable donors based on:

- **Urgency level** of the hospital's request
- **Donor eligibility history** (last donation date, health conditions)
- **Real-time availability** (donor confirms availability through quick one-click response)
- **Proximity & travel time** instead of just distance

This helps hospitals get the **fastest and most reliable matches** in life-saving situations.

## 🎯 Impact

- **Faster donor–hospital coordination** in emergencies
- **Improved response rate** (only eligible and available donors notified)
- **Saves critical minutes** in urgent blood requests
- **Builds trust** in the platform as an emergency-ready system

## 🏗️ System Architecture

### Core Components

1. **Smart Matching Engine** (`convex/smartMatching.ts`)
2. **SOS Alerts Management** (`convex/sosAlerts.ts`)
3. **Donor Response System** (`src/components/DonorResponseCard.tsx`)
4. **Hospital Dashboard** (`src/components/SmartMatchingDashboard.tsx`)

### Database Schema Updates

The system extends the existing schema with smart matching fields:

```typescript
// Donors table - Smart Matching Fields
donors: defineTable({
  // ... existing fields
  healthStatus: v.optional(v.string()), // "excellent", "good", "fair", "restricted"
  travelRadius: v.optional(v.number()), // Maximum travel distance in km
  responseTime: v.optional(v.number()), // Average response time in minutes
  successRate: v.optional(v.number()), // Percentage of successful donations
  lastAvailabilityUpdate: v.optional(v.number()), // Timestamp of last availability update
  preferredHospitals: v.optional(v.array(v.string())), // List of preferred hospital names
  restrictions: v.optional(v.array(v.string())), // Health restrictions or conditions
  emergencyOnly: v.optional(v.boolean()), // Whether donor only responds to emergency alerts
})

// SOS Alerts table - Smart Matching Fields
sosAlerts: defineTable({
  // ... existing fields
  priorityScore: v.optional(v.number()), // Calculated priority score
  matchedDonors: v.optional(v.array(v.id("donors"))), // Top recommended donors
  matchingAlgorithm: v.optional(v.string()), // "smart", "traditional", "hybrid"
  lastMatchingUpdate: v.optional(v.number()), // When matching was last updated
  estimatedResponseTime: v.optional(v.number()), // Estimated time to get response in minutes
})

// Donor Responses table - Smart Matching Fields
donorResponses: defineTable({
  // ... existing fields
  matchScore: v.optional(v.number()), // How well this donor matches the request
  responseSpeed: v.optional(v.number()), // Response time in seconds
  availabilityConfirmed: v.optional(v.boolean()), // Whether donor confirmed availability
  estimatedTravelTime: v.optional(v.number()), // Estimated travel time in minutes
  healthCheckPassed: v.optional(v.boolean()), // Whether donor passed health check
  priorityRank: v.optional(v.number()), // Rank among all responses (1 = best match)
})
```

## 🧮 Smart Matching Algorithm

### Priority Score Calculation

The system calculates a **priority score (0-100)** for each SOS alert based on:

```typescript
// Base urgency score
switch (alert.urgency) {
  case "critical": priorityScore += 100;
  case "urgent": priorityScore += 70;
  case "normal": priorityScore += 30;
}

// Time sensitivity (closer to expiry = higher priority)
const timeUntilExpiry = alert.expiresAt - Date.now();
const hoursUntilExpiry = timeUntilExpiry / (1000 * 60 * 60);

if (hoursUntilExpiry < 1) priorityScore += 50;      // Critical time
else if (hoursUntilExpiry < 3) priorityScore += 30;  // Urgent time
else if (hoursUntilExpiry < 6) priorityScore += 15;  // Moderate time

// Blood group rarity bonus
const rareBloodGroups = ["AB-", "B-", "AB+"];
if (rareBloodGroups.includes(alert.bloodGroup)) {
  priorityScore += 20;
}

// Units needed (more units = higher priority)
if (alert.unitsNeeded > 5) priorityScore += 25;
else if (alert.unitsNeeded > 2) priorityScore += 15;
```

### Donor Match Score Calculation

For each donor, the system calculates a **match score** based on:

```typescript
// Distance score (closer = higher score, max 30 points)
const distanceScore = Math.max(0, 30 - (distance * 2));

// Health status score (max 25 points)
let healthScore = 0;
switch (donor.healthStatus) {
  case "excellent": healthScore = 25;
  case "good": healthScore = 20;
  case "fair": healthScore = 15;
  case "restricted": healthScore = 5;
  default: healthScore = 15;
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

const totalScore = distanceScore + healthScore + availabilityScore + 
                  responseScore + successScore + emergencyBonus;
```

## 🔄 Workflow

### 1. Hospital Creates SOS Alert

```typescript
// Hospital creates alert with urgency level
const alertId = await createSOSAlert({
  hospitalId: "hospital123",
  bloodGroup: "O+",
  urgency: "critical", // critical, urgent, normal
  unitsNeeded: 3,
  location: "Mumbai, Andheri",
  description: "Emergency surgery patient needs blood",
  expiresInHours: 6
});
```

### 2. Smart Matching Engine Activates

```typescript
// System automatically:
// 1. Calculates priority score
await calculatePriorityScore({ alertId });

// 2. Finds eligible donors
const eligibleDonors = await findEligibleDonors({ 
  alertId, 
  limit: 10 
});

// 3. Ranks donors by match score
const topDonors = eligibleDonors
  .sort((a, b) => b.matchScore - a.matchScore)
  .slice(0, 3);
```

### 3. Donors Receive Smart Notifications

- **Priority-based notifications** (critical alerts first)
- **Personalized matching** based on donor profile
- **One-click response** buttons for quick availability confirmation

### 4. Real-time Response Processing

```typescript
// Donor responds with one click
await processDonorResponse({
  alertId: "alert123",
  donorId: "donor456",
  status: "confirmed", // interested, confirmed, completed
  notes: "Available immediately"
});

// System automatically:
// 1. Updates donor availability
// 2. Calculates match score
// 3. Ranks responses by priority
// 4. Updates hospital dashboard
```

### 5. Hospital Gets Top Recommendations

```typescript
// Hospital sees top 3 recommended donors
const topDonors = await getTopRecommendedDonors({ alertId });

// Each donor shows:
// - Match score (0-100)
// - Priority rank (#1, #2, #3)
// - Estimated response time
// - Travel time to hospital
// - Health status
// - Last donation date
```

## 📊 Analytics & Insights

### Real-time Metrics

```typescript
const analytics = await getMatchingAnalytics({ alertId });

// Returns:
{
  totalDonorsFound: 25,           // Total donors in radius
  eligibleDonors: 8,              // Donors who responded
  responseRate: 32,               // Percentage response rate
  averageResponseTime: 4.5,       // Minutes to first response
  successfulMatches: 3,           // Confirmed donors
  estimatedFulfillmentTime: 35,   // Minutes to get blood
  topDonors: [...]                // Top 3 recommended donors
}
```

### Performance Tracking

- **Response rate** by urgency level
- **Average time** from alert to first donor response
- **Success rate** of smart matching vs. traditional matching
- **Geographic distribution** of donor responses

## 🚀 API Endpoints

### Smart Matching Functions

```typescript
// Calculate priority score for SOS alert
export const calculatePriorityScore = mutation({...})

// Find eligible donors with smart matching
export const findEligibleDonors = query({...})

// Get top 3 recommended donors
export const getTopRecommendedDonors = query({...})

// Calculate donor match score
export const calculateDonorMatchScore = internalQuery({...})

// Update donor availability
export const updateDonorAvailability = mutation({...})

// Process donor response
export const processDonorResponse = mutation({...})

// Rank donor responses by priority
export const rankDonorResponses = mutation({...})

// Get matching analytics
export const getMatchingAnalytics = query({...})
```

### SOS Alerts Functions

```typescript
// Create SOS alert with smart matching
export const createSOSAlert = mutation({...})

// Get active alerts with smart data
export const getActiveSOSAlerts = query({...})

// Get urgent alerts requiring attention
export const getUrgentSOSAlerts = query({...})

// Get alert details with recommendations
export const getSOSAlertDetails = query({...})

// Update alert status
export const updateSOSAlertStatus = mutation({...})

// Extend alert expiry time
export const extendSOSAlert = mutation({...})
```

## 🎨 User Interface Components

### 1. Smart Matching Dashboard (Hospital)

- **Urgent alerts** requiring immediate attention
- **Active alerts** with donor match counts
- **Priority scores** and estimated response times
- **Top recommended donors** for each alert
- **Real-time analytics** and performance metrics

### 2. Donor Response Card

- **One-click availability** confirmation
- **Smart matching info** explaining prioritization
- **Real-time status** updates
- **Hospital contact** information
- **Urgency indicators** and time remaining

### 3. Alert Management

- **Create alerts** with smart matching enabled
- **Monitor responses** in real-time
- **Extend alerts** when needed
- **Update status** (active, fulfilled, cancelled)

## 🔮 Future Enhancements

### 1. Google Maps Integration

```typescript
// Replace simplified distance calculation with Google Maps API
import { DistanceMatrixService } from '@googlemaps/js-api-loader';

const calculateRealDistance = async (origin: string, destination: string) => {
  const service = new DistanceMatrixService();
  const result = await service.getDistanceMatrix({
    origins: [origin],
    destinations: [destination],
    travelMode: 'DRIVING',
    unitSystem: 'METRIC'
  });
  
  return {
    distance: result.rows[0].elements[0].distance.value / 1000, // km
    duration: result.rows[0].elements[0].duration.value / 60,   // minutes
    traffic: result.rows[0].elements[0].duration_in_traffic?.value
  };
};
```

### 2. Machine Learning Improvements

- **Predictive matching** based on historical data
- **Donor behavior analysis** for better scoring
- **Dynamic threshold adjustment** based on demand
- **Seasonal pattern recognition** for blood shortages

### 3. Advanced Prioritization

```typescript
// Multi-factor priority scoring
const calculateAdvancedPriority = (alert, donor) => {
  let score = 0;
  
  // Base factors
  score += calculateBaseScore(alert, donor);
  
  // Time-based factors
  score += calculateTimeScore(alert);
  
  // Geographic factors
  score += calculateLocationScore(alert, donor);
  
  // Health factors
  score += calculateHealthScore(donor);
  
  // Historical factors
  score += calculateHistoricalScore(donor);
  
  // Emergency factors
  score += calculateEmergencyScore(alert, donor);
  
  return Math.min(100, Math.max(0, score));
};
```

### 4. Real-time Notifications

- **Push notifications** for urgent alerts
- **SMS alerts** for critical situations
- **Email summaries** with donor recommendations
- **WhatsApp integration** for quick responses

## 🧪 Testing & Validation

### Test Scenarios

1. **Critical Emergency**
   - Create critical alert
   - Verify priority score > 90
   - Check donor ranking by urgency

2. **Donor Response Flow**
   - Simulate donor availability update
   - Verify match score calculation
   - Test response ranking

3. **Performance Metrics**
   - Measure response time improvements
   - Compare smart vs. traditional matching
   - Validate analytics accuracy

### Performance Benchmarks

- **Alert creation**: < 2 seconds
- **Donor matching**: < 5 seconds
- **Response processing**: < 1 second
- **Dashboard updates**: Real-time (< 500ms)

## 📈 Success Metrics

### Key Performance Indicators (KPIs)

1. **Response Time Improvement**
   - Target: 40% faster donor response
   - Current: Traditional matching
   - Goal: Smart matching < 5 minutes

2. **Match Quality**
   - Target: 90% successful matches
   - Measure: Donor availability confirmation
   - Track: Hospital satisfaction ratings

3. **Emergency Response**
   - Target: Critical alerts < 3 minutes
   - Measure: Time to first donor response
   - Goal: Life-saving speed improvement

4. **Platform Efficiency**
   - Target: 60% reduction in false alerts
   - Measure: Donor response rate
   - Track: System utilization metrics

## 🚀 Deployment & Rollout

### Phase 1: Core System
- ✅ Smart matching engine
- ✅ Priority scoring algorithm
- ✅ Donor response system
- ✅ Basic analytics

### Phase 2: Enhanced Features
- 🔄 Google Maps integration
- 🔄 Advanced prioritization
- 🔄 Real-time notifications
- 🔄 Performance optimization

### Phase 3: AI/ML Features
- 🔮 Predictive matching
- 🔮 Behavioral analysis
- 🔮 Dynamic thresholds
- 🔮 Pattern recognition

## 🎯 Conclusion

The AI-powered Smart Matching System transforms the blood donation platform from a simple location-based service to an intelligent, emergency-ready system that:

- **Saves lives** by reducing response times in critical situations
- **Improves efficiency** by matching the right donors to the right requests
- **Builds trust** through reliable, fast emergency response
- **Scales intelligently** with machine learning and data-driven improvements

This system positions Raktdaan as a **world-class emergency blood donation platform** that hospitals can rely on in life-or-death situations.
