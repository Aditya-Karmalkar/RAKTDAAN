# Admin Dashboard Documentation

## Overview

The Admin Dashboard provides comprehensive platform management capabilities for the RaktDaan blood donation system. It allows administrators to monitor platform activity, verify hospitals, manage users, and oversee all aspects of the blood donation ecosystem.

## Access Control

Admin access is controlled by email-based authorization. Only pre-approved admin emails can access the dashboard:

- `admin@raktdaan.com`
- `superadmin@raktdaan.com`
- `test.admin@raktdaan.com` (for testing)

## Features

### 1. Overview Dashboard

- **Platform Statistics:** Total users, donors, hospitals, and SOS alerts
- **Real-time Analytics:** Active donors, verified hospitals, pending verifications
- **Quick Actions:** Direct navigation to management sections
- **Pending Items:** Hospitals awaiting verification, testimonials for approval, new contact messages

### 2. User Management

- View all registered users (donors and hospitals)
- Monitor user registration trends
- Track user profile completion status
- User activity monitoring

### 3. Hospital Verification

- Review hospital registration applications
- Verify hospital authenticity and credentials
- Approve or reject hospital accounts
- Monitor hospital activity and SOS alert creation

### 4. SOS Alert Monitoring

- Track all emergency blood requests
- Monitor response rates and fulfillment
- Analyze location-based alert distribution
- Review alert status (active, fulfilled, expired)

### 5. Content Moderation

- Review and approve donor testimonials
- Manage contact form submissions
- Monitor platform content quality
- Ensure community guidelines compliance

## Backend API

### Admin Verification

```typescript
isCurrentUserAdmin(): boolean
```

Checks if the current authenticated user has admin privileges.

### Analytics Queries

```typescript
getAdminAnalytics(): AdminAnalytics
```

Returns comprehensive platform statistics including:

- User counts and trends
- Donor activity and blood group distribution
- Hospital verification status
- SOS alert statistics
- Content moderation queue

### Management Operations

```typescript
adminVerifyHospital(hospitalId, verified): void
adminApproveTestimonial(testimonialId, approved): void
adminUpdateContactMessage(messageId, status): void
```

## Security Considerations

### Email-Based Authorization

- Admin emails are hardcoded in the backend
- In production, should be moved to environment variables
- Regular audit of admin access required

### Data Protection

- All admin actions are logged
- Sensitive user data access is controlled
- Hospital verification requires manual approval

### Role Separation

- Clear distinction between admin and regular user capabilities
- Hospital verification is admin-only
- Content moderation requires admin approval

## Navigation Integration

The admin dashboard is seamlessly integrated into the main application:

- Admin tab appears only for authorized users
- Maintains consistent UI/UX with the rest of the platform
- Responsive design for all screen sizes

## Testing

Use the test admin account for development and testing:

- **Email:** test.admin@raktdaan.com
- **Password:** admin123

## Future Enhancements

1. **Enhanced Analytics:** Charts and graphs for better data visualization
2. **Notification System:** Real-time alerts for admin actions required
3. **Audit Logging:** Detailed logs of all admin activities
4. **Bulk Operations:** Mass approve/reject functionality
5. **Advanced Filtering:** Search and filter capabilities for all data tables
6. **Export Functions:** Data export for reporting and analysis
7. **Mobile Administration:** Enhanced mobile experience for admin tasks

## Implementation Notes

- Built with React and TypeScript for type safety
- Uses Convex for real-time data and authentication
- Responsive design with Tailwind CSS
- Modular component architecture for maintainability

## Support and Maintenance

Regular monitoring of admin dashboard performance and user feedback is essential for optimal platform management. Admin users should be trained on platform policies and verification procedures to ensure consistent operation.
