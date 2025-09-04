# ✅ Admin Access - RaktDaan Platform

## � Admin Credentials

**Email:** `test.admin@raktdaan.com`  
**Password:** `admin123`

## 📋 Quick Access Steps:

1. **Start the server:** `npm run dev`
2. **Open:** http://localhost:5175/
3. **Sign up** with the admin credentials above
4. **Look for the purple "Admin Dashboard" button** in the top navigation
5. **Click it** to access the medical-style dashboard

## 🎯 What You'll See:

✅ **Modern Medical Dashboard UI** - Similar to the uploaded image style  
✅ **RaktDaan Red Color Scheme** - Consistent with your platform  
✅ **Analytics & Reports** - Real-time platform insights  
✅ **User Management** - View all donors and hospitals  
✅ **System Status** - Server health monitoring  
✅ **Blood Group Distribution** - Visual charts  
✅ **Recent Activity Feed** - Live platform updates

## 🏥 Dashboard Features:

- **Dashboard:** Main overview with charts and stats
- **Patients:** User management (donors/hospitals)
- **Calendar:** Appointment scheduling (coming soon)
- **Reports:** Detailed analytics and insights
- **Messages:** Communication management

The dashboard has a clean, medical-style interface with your red branding, exactly like the uploaded reference image but adapted for blood donation management.

## Donor Accounts

Use these credentials to create donor accounts:

1. **John Doe (O+ Blood Group)**

   - Email: `donor1@test.com`
   - Password: `password123`

2. **Sarah Smith (A+ Blood Group)**

   - Email: `donor2@test.com`
   - Password: `password123`

3. **Mike Johnson (B- Blood Group)**
   - Email: `donor3@test.com`
   - Password: `password123`

### Test Hospital Accounts

Use these credentials to create hospital accounts:

1. **City General Hospital**

   - Email: `hospital1@test.com`
   - Password: `password123`

2. **Metro Health Center**
   - Email: `hospital2@test.com`
   - Password: `password123`

## Setup Instructions

1. **Start the application:**

   ```bash
   npm run dev
   ```

2. **Seed sample data (testimonials, etc.):**

   - Open the Convex dashboard
   - Run the `seedSampleData` mutation from `convex/seedData.ts`

3. **Create test accounts:**

   - Go to the sign-in page
   - Click "Sign up instead"
   - Use the test credentials above to create accounts
   - After signing up, you'll be redirected to complete your profile

4. **Complete profiles:**

   - **For donors:** Fill out the donor registration form with your details
   - **For hospitals:** Fill out the hospital registration form with your details

5. **Test the application:**
   - **Hospitals** can create SOS alerts from their dashboard (auto-verified for testing)
   - **Donors** can view live alerts and respond to them
   - Switch between accounts to test different user flows

## 🏥 **Hospital Sign-In & Testing Guide**

### **Hospital Accounts are Auto-Verified for Testing!**

When you register as a hospital using the test credentials, your account will be automatically verified so you can immediately access the dashboard and create SOS alerts.

### **Hospital Testing Steps:**

1. **Sign up** using `hospital1@test.com` / `password123`
2. **Complete hospital registration** with these details:

   - Hospital Name: "City General Hospital"
   - Hospital ID: "CGH001"
   - Location: "New York, NY"
   - Contact Person: "Dr. Emily Wilson"
   - Phone: "+1-555-1001"
   - Address: "123 Medical Center Drive, New York, NY 10001"

3. **Access Dashboard** - You'll immediately see the "Dashboard" button in the nav
4. **Create SOS Alerts** - Test creating blood requests with location targeting:
   - Choose blood group and urgency
   - **Target specific areas** (e.g., "Manhattan", "Downtown")
   - **Set radius** (10km for local, 50km for city-wide, 100km+ for regional)
   - System will show how many compatible donors will be notified
5. **Monitor Responses** - See when nearby donors respond to your alerts

### **Second Hospital for Testing:**

Use `hospital2@test.com` / `password123` with:

- Hospital Name: "Metro Health Center"
- Hospital ID: "MHC002"
- Location: "Los Angeles, CA"
- Contact Person: "Dr. Robert Chen"

## Features to Test

### As a Hospital:

- ✅ **Sign up and auto-verification**
- ✅ **Create location-targeted SOS alerts** with specific areas and radius
- ✅ **Blood group matching** - alerts sent only to compatible donors
- ✅ **Geographic targeting** - choose specific neighborhoods or set radius (10km-200km)
- ✅ **Real-time donor notifications** - see how many donors will be notified
- ✅ **View donor responses** to your alerts
- ✅ **Update alert status** (Active/Fulfilled/Expired)
- ✅ **Manage hospital profile**

### As a Donor:

- ✅ **View location-filtered blood donation alerts** - only see alerts from nearby hospitals
- ✅ **Blood group compatibility** - automatically filtered to your blood type
- ✅ **Respond to SOS alerts** with notes and availability
- ✅ **Smart targeting** - see alerts within your area first
- ✅ **Update availability status**
- ✅ **View donation history**

### General Features:

- View testimonials
- Contact form
- Mission and how it works pages

## 🎯 **New Location-Based SOS Features**

### **For Hospitals:**

- **Target Specific Areas**: Send alerts to specific neighborhoods (e.g., "Manhattan", "Downtown")
- **Set Geographic Radius**: Choose from 10km (very local) to 200km (state-wide) targeting
- **Real-time Donor Count**: See how many compatible donors will receive your alert
- **Smart Filtering**: Only compatible blood group donors in your target area are notified

### **For Donors:**

- **Location-Filtered Alerts**: Only see SOS alerts from hospitals in your area
- **Blood Compatibility**: Automatically filtered to show only alerts you can help with
- **Priority Sorting**: Critical alerts from nearby hospitals appear first
- **Smart Notifications**: Get notified about emergencies you can actually respond to

### **Example Hospital SOS Workflow:**

1. **Emergency Scenario**: Need O+ blood urgently
2. **Create Alert**: Select O+ blood group, Critical urgency
3. **Target Location**: Choose "Manhattan" with 25km radius
4. **System Response**: "Alert created! 12 nearby O+ donors have been notified"
5. **Monitor**: Watch as compatible donors in Manhattan respond in real-time

## Database Seeding

Run this mutation in the Convex dashboard to add sample testimonials and contact messages:

```javascript
api.seedData.seedSampleData();
```

This will populate the database with sample testimonials and contact messages to make the application look more realistic during testing.
