# 🔑 Admin Access Setup Guide

## Quick Steps to Access Admin Dashboard

### 1. Ensure Server is Running

Your development server should be running on `http://localhost:5178/`

### 2. Create Admin Account

1. **Go to:** `http://localhost:5178/`
2. **Click "Sign In"** in the top navigation
3. **Click "Sign up instead"** at the bottom
4. **Enter admin credentials:**
   - Email: `test.admin@raktdaan.com`
   - Password: `admin123`
5. **Click "Sign up"**

### 3. Access Admin Dashboard

After successful signup:

1. You'll be redirected to the home page
2. **Look for the "Admin" tab** in the navigation bar (it appears automatically for admin users)
3. **Click the "Admin" tab** to open the dashboard

## ✅ What You'll See in Admin Dashboard

### Overview Section

- Total platform statistics (users, donors, hospitals, SOS alerts)
- Recent activity metrics
- Quick action buttons

### Analytics Charts

- Donor blood group distribution
- Hospital verification status
- SOS alert trends
- User registration patterns

### Management Sections

- **Users Tab:** View all registered users
- **Hospitals Tab:** Verify hospital accounts
- **Donors Tab:** Manage donor verification with ID uploads
- **Campaigns Tab:** Create and manage blood donation campaigns
- **Gallery Tab:** Upload and manage photos with device upload
- **Alerts Tab:** Monitor SOS alerts
- **Content Tab:** Approve testimonials and messages

### 📸 Image Upload Features

#### Gallery Management

- **Quick Upload:** Drag & drop or click to upload images from your device
- **Real-time Progress:** Live upload progress with preview
- **File Validation:** Automatic file type and size validation (max 10MB)
- **Categories:** Organize photos by events, campaigns, donors, awareness
- **Image Preview:** See uploaded images before saving
- **Auto Metadata:** Automatic filename and upload date tracking

#### ID Verification System

- **Multiple ID Types:** Support for Aadhar, PAN, Voter ID, Passport, Driving License
- **Secure Upload:** Direct device upload for donor ID verification
- **Status Tracking:** Real-time verification status updates
- **Document Guidelines:** Built-in upload guidelines for clear documents
- **File Size Limit:** 5MB max for ID documents

## 🔍 Troubleshooting

### Admin Tab Not Showing?

- Make sure you used the exact email: `test.admin@raktdaan.com`
- Try refreshing the page after login
- Check the browser console for any errors

### Login Issues?

- Ensure the Convex backend is running (you should see Convex logs in terminal)
- Try clearing browser cache and cookies
- Make sure you're using the exact credentials

### Dashboard Not Loading?

- Check the browser developer console for errors
- Ensure all Convex functions are deployed successfully
- Verify the admin email is in the ADMIN_EMAILS array

## 📧 Admin Email Configuration

The admin access is controlled by this list in `convex/admin.ts`:

```typescript
const ADMIN_EMAILS = [
  "admin@raktdaan.com",
  "superadmin@raktdaan.com",
  "test.admin@raktdaan.com",
];
```

Only users with these email addresses can access the admin dashboard.

## 🚀 Next Steps

Once you have admin access:

1. **Explore the Overview** - See platform statistics
2. **Test Hospital Verification** - Create a test hospital and verify it
3. **Monitor SOS Alerts** - Create test alerts and monitor responses
4. **Manage Users** - View registered users and their profiles
5. **Upload Images** - Test the new image upload features:
   - Go to Gallery tab and use the Quick Upload section
   - Drag and drop images or click to browse
   - Try different categories and watch the real-time progress
6. **Test ID Verification** - Upload sample ID documents for donor verification

### 🖼️ Using Image Upload Features

#### Gallery Upload:

1. Navigate to **Gallery** tab in admin dashboard
2. Use the **Quick Upload from Device** section
3. Drag and drop an image or click to browse
4. Watch the real-time upload progress
5. Image will automatically appear in the photo grid

#### ID Verification Upload:

1. Go to **Donors** tab
2. Find a donor that needs verification
3. Click on their verification status
4. Select the ID document type (Aadhar, PAN, etc.)
5. Upload the ID document image
6. Review and approve/reject the verification

**Ready to test?** Go to `http://localhost:5180/` and follow the steps above!
