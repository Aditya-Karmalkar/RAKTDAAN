# 🏥 Hospital Sign-In Testing Guide

## Quick Start for Hospital Testing

### **Step 1: Create Hospital Account**

1. Go to http://localhost:5173/
2. Click **"Sign In"** button
3. Click **"Sign up instead"**
4. Use these credentials:
   - Email: `hospital1@test.com`
   - Password: `password123`
5. Click **"Sign up"**

### **Step 2: Complete Hospital Registration**

After signing up, you'll be redirected. Follow these steps:

1. Click **"Hospital Registration"** in the navigation
2. Fill out the form with these details:
   ```
   Hospital Name: City General Hospital
   Hospital ID: CGH001
   Location: New York, NY
   Phone: +1-555-1001
   Contact Person: Dr. Emily Wilson
   Address: 123 Medical Center Drive, New York, NY 10001
   ```
3. Click **"Register Hospital"**

### **Step 3: Access Hospital Dashboard**

1. You'll be automatically verified ✅
2. Click **"Dashboard"** in the navigation (should now be visible)
3. You can now create SOS alerts!

## Test Hospital Dashboard Features

### **Create SOS Alerts:**

1. In the Dashboard, click **"Create New SOS Alert"**
2. Test with different scenarios:

   ```
   Critical Alert:
   - Blood Group: O+
   - Urgency: Critical
   - Units Needed: 5
   - Description: Emergency surgery patient

   Urgent Alert:
   - Blood Group: A+
   - Urgency: Urgent
   - Units Needed: 3
   - Description: Scheduled surgery tomorrow

   Normal Alert:
   - Blood Group: B-
   - Urgency: Normal
   - Units Needed: 2
   - Description: Elective procedure
   ```

### **Manage Alerts:**

- View all your hospital's alerts
- Update alert status (Active → Fulfilled/Expired)
- Monitor donor responses

## Test Multiple Hospital Accounts

### **Second Hospital:**

- Email: `hospital2@test.com`
- Password: `password123`
- Details:
  ```
  Hospital Name: Metro Health Center
  Hospital ID: MHC002
  Location: Los Angeles, CA
  Contact Person: Dr. Robert Chen
  Phone: +1-555-2001
  Address: 456 Healthcare Blvd, Los Angeles, CA 90210
  ```

## Testing Flow Between Hospital and Donor

### **Complete Testing Scenario:**

1. **As Hospital (hospital1@test.com):**

   - Sign up and register
   - Create a critical O+ blood alert
   - Leave the dashboard open

2. **As Donor (donor1@test.com):**

   - Sign up in a new browser/incognito tab
   - Register as donor with O+ blood group
   - Navigate to "Live Alerts"
   - Respond to the hospital's alert

3. **Back as Hospital:**
   - Refresh dashboard
   - See the donor response
   - Update alert status to "Fulfilled"

## Important Notes

- ✅ **Hospitals are auto-verified** for testing (no waiting period)
- ✅ **Dashboard access is immediate** after registration
- ✅ **All features are enabled** for testing
- 🔄 **Switch between accounts** to test full workflow
- 📱 **Responsive design** - test on different screen sizes

## Troubleshooting

**Can't see Dashboard button?**

- Make sure you completed hospital registration
- Try refreshing the page
- Check that you're signed in as the hospital account

**No alerts showing?**

- Create some alerts first from the dashboard
- Check if you're viewing the correct screen (Live Alerts vs Dashboard)

**Want to test with sample data?**

- Run the `seedSampleData` mutation in Convex dashboard
- This adds testimonials and makes the app look more realistic
