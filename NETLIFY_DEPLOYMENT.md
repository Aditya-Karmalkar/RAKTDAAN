# 🚀 Netlify Deployment Guide for Raktdaan

## Prerequisites

Before deploying to Netlify, ensure you have:

1. **Convex Backend Deployed** - Your Convex backend must be deployed to production
2. **Firebase Project Setup** - Firebase configuration for production
3. **Environment Variables** - All required environment variables

## Step-by-Step Deployment Process

### 1. Deploy Convex Backend First

```bash
# Navigate to your project directory
cd "e:\Aditya flutter\Web-Dev\project-red-stream-main\raktdaan\raktdaan"

# Deploy Convex to production
npx convex deploy

# Note down the production URL that gets generated
```

### 2. Set Up Environment Variables

Create a `.env.local` file with your production values:

```env
# Convex Production URL (from step 1)
VITE_CONVEX_URL=https://your-convex-deployment.convex.cloud

# Firebase Production Configuration
VITE_FIREBASE_API_KEY=your-firebase-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abcdef123456
```

### 3. Test Local Production Build

Before deploying, test the production build locally:

```bash
# Install dependencies
npm install

# Build for production
npm run build

# Preview the production build
npm run preview
```

### 4. Deploy to Netlify

#### Option A: Deploy via Netlify CLI

```bash
# Install Netlify CLI globally
npm install -g netlify-cli

# Login to Netlify
netlify login

# Deploy to Netlify
netlify deploy

# For production deployment
netlify deploy --prod
```

#### Option B: Deploy via Netlify Dashboard

1. **Connect Repository:**

   - Go to [Netlify Dashboard](https://app.netlify.com/)
   - Click "Add new site" → "Import an existing project"
   - Connect your Git repository

2. **Configure Build Settings:**

   - Build command: `npm run build`
   - Publish directory: `dist`
   - Base directory: (leave empty)

3. **Set Environment Variables:**
   Go to Site settings → Environment variables and add:

   ```
   VITE_CONVEX_URL=https://your-convex-deployment.convex.cloud
   VITE_FIREBASE_API_KEY=your-firebase-api-key
   VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your-project-id
   VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
   VITE_FIREBASE_APP_ID=1:123456789:web:abcdef123456
   ```

4. **Deploy:**
   - Click "Deploy site"

### 5. Configure Custom Domain (Optional)

1. In Netlify dashboard, go to Site settings → Domain management
2. Add your custom domain
3. Configure DNS settings as instructed

## Common Deployment Issues & Solutions

### Issue 1: "Secrets scanning detected secrets in build files"

**Solution:** This is caused by hardcoded API keys or URLs in the build. We've configured the project to handle this:

- Environment variables are properly validated in `src/main.tsx` and `src/firebase/config.ts`
- Secrets scanning is configured in `netlify.toml` with `SECRETS_SCAN_OMIT_KEYS`
- Ensure all environment variables are set in Netlify dashboard, not hardcoded

### Issue 2: "VITE_CONVEX_URL is not defined"

**Solution:** Ensure you've set the environment variable in Netlify:

- Go to Site settings → Environment variables
- Add `VITE_CONVEX_URL` with your Convex production URL

### Issue 3: "404 Not Found" on page refresh

**Solution:** The `netlify.toml` and `_redirects` files should handle this, but if issues persist:

- Check that `public/_redirects` exists with content: `/*    /index.html   200`

### Issue 4: Build fails with TypeScript errors

**Solution:** Fix TypeScript errors locally first:

```bash
# Check for TypeScript errors
npx tsc --noEmit

# Fix any errors before deploying
```

### Issue 4: Firebase/Convex connection issues

**Solution:**

- Verify all environment variables are correctly set in Netlify
- Ensure Convex backend is deployed and accessible
- Check Firebase project settings match your environment variables

### Issue 5: Large bundle size warnings

**Solution:** The Vite config includes optimization settings, but you can further optimize:

- Consider code splitting for large components
- Use dynamic imports for heavy dependencies

## Post-Deployment Checklist

✅ **Test Core Features:**

- [ ] User registration/login works
- [ ] Admin dashboard accessible with test credentials
- [ ] Image uploads function correctly
- [ ] Real-time features (chat, notifications) work
- [ ] Mobile responsiveness

✅ **Performance Check:**

- [ ] Page load times are acceptable
- [ ] Images load properly
- [ ] No console errors

✅ **Security Check:**

- [ ] Admin access is properly restricted
- [ ] Firebase security rules are configured
- [ ] Environment variables are not exposed in client

## Production URLs

After successful deployment, you'll have:

- **Frontend:** `https://your-site-name.netlify.app`
- **Backend:** `https://your-convex-deployment.convex.cloud`
- **Admin Access:** `https://your-site-name.netlify.app` (login with admin credentials)

## Support

If you encounter issues:

1. Check Netlify deployment logs
2. Check browser console for errors
3. Verify all environment variables are set
4. Ensure Convex backend is deployed and accessible

## Files Added for Deployment

- `netlify.toml` - Netlify configuration
- `public/_redirects` - SPA routing redirects
- `.env.example` - Environment variables template
- Updated `package.json` - Build scripts
- Updated `vite.config.ts` - Production optimizations

Ready to deploy! 🚀
