# Apple Sign In Setup Guide

## Overview

Your car rental application already has **Apple Sign In fully implemented**. You just need to configure the Apple Developer credentials in Supabase to make it work.

## What's Already Implemented

✅ **Social Auth Buttons Component** (`components/auth/social-auth-buttons.tsx`)
- Apple Sign In button with proper loading states
- OAuth flow handling with error management
- Redirect URL configuration

✅ **OAuth Callback Handler** (`app/auth/callback/route.ts`)
- Exchanges OAuth code for session
- Auto-creates user profiles for first-time Apple users
- Preserves user metadata (name, email, avatar)
- Role-based redirects (admin → `/admin`, customer → `/dashboard`)

✅ **Sign In/Sign Up Pages**
- Both pages include Apple Sign In button
- Error handling for OAuth failures
- Redirect parameter support for seamless UX

✅ **Middleware Protection** (`middleware.ts`)
- Authenticates protected routes
- Refreshes sessions automatically

---

## Setup Instructions

### Step 1: Apple Developer Account Setup

1. **Go to Apple Developer Portal**
   - Visit: https://developer.apple.com/account
   - Sign in with your Apple ID
   - If you don't have a developer account, enroll in the Apple Developer Program ($99/year)

2. **Create an App ID**
   - Navigate to: **Certificates, Identifiers & Profiles** → **Identifiers**
   - Click the **+** button to create a new identifier
   - Select **App IDs** and click **Continue**
   - Choose **App** as the type
   - Fill in:
     - **Description**: `Car Rental App` (or your app name)
     - **Bundle ID**: Use explicit (e.g., `com.yourcompany.carrental`)
   - Under **Capabilities**, enable **Sign In with Apple**
   - Click **Continue** and **Register**

3. **Create a Services ID** (for web authentication)
   - Go back to **Identifiers** and click **+** again
   - Select **Services IDs** and click **Continue**
   - Fill in:
     - **Description**: `Car Rental Web Auth` (or your preference)
     - **Identifier**: `com.yourcompany.carrental.auth` (must be unique)
   - Click **Continue** and **Register**

4. **Configure the Services ID**
   - Click on your newly created Services ID
   - Check **Sign In with Apple**
   - Click **Configure** next to Sign In with Apple
   - Add your domains and redirect URLs:
     - **Domains**: Add your production domain (e.g., `yourdomain.com`)
     - **Return URLs**: Add your callback URL:
       ```
       https://yourdomain.com/auth/callback
       ```
     - For Supabase projects, also add:
       ```
       https://[your-project-ref].supabase.co/auth/v1/callback
       ```
   - Click **Save** and **Continue**

5. **Create a Private Key**
   - Navigate to: **Keys** section
   - Click the **+** button
   - Fill in:
     - **Key Name**: `Car Rental Sign In Key`
   - Check **Sign In with Apple**
   - Click **Configure** and select your primary App ID
   - Click **Save**
   - Click **Continue** and **Register**
   - **IMPORTANT**: Download the `.p8` key file immediately (you can't download it again!)
   - Note down the **Key ID** (10 characters, displayed after creation)

6. **Get Your Team ID**
   - Go to: **Membership** section
   - Copy your **Team ID** (10 characters)

---

### Step 2: Configure Supabase

1. **Go to Supabase Dashboard**
   - Navigate to your project: https://supabase.com/dashboard
   - Go to: **Authentication** → **Providers**

2. **Enable Apple Provider**
   - Find **Apple** in the providers list
   - Toggle it **ON**

3. **Enter Apple Credentials**
   - **Services ID**: Enter the identifier you created (e.g., `com.yourcompany.carrental.auth`)
   - **Team ID**: Enter your 10-character Team ID from Apple Developer
   - **Key ID**: Enter your 10-character Key ID from the private key
   - **Private Key**: Open the `.p8` file you downloaded and paste the entire content (including the `-----BEGIN PRIVATE KEY-----` and `-----END PRIVATE KEY-----` lines)

4. **Set Redirect URL** (if not already set)
   - The redirect URL should be:
     ```
     https://[your-project-ref].supabase.co/auth/v1/callback
     ```
   - Supabase usually auto-fills this

5. **Save Settings**
   - Click **Save** at the bottom of the form

---

### Step 3: Test Apple Sign In

1. **Local Testing** (Optional)
   - For local development, add `localhost` domains to your Apple Services ID:
     - Domains: `localhost`
     - Return URLs: `http://localhost:3000/auth/callback`
   - Note: Apple may not allow localhost for production apps

2. **Production Testing**
   - Deploy your app to production (Vercel, etc.)
   - Navigate to: `https://yourdomain.com/auth/signin`
   - Click the **Apple** button
   - You should be redirected to Apple's sign-in page
   - After authentication, you'll be redirected back to your app

3. **Verify User Creation**
   - After successful sign-in, check your Supabase **Authentication** → **Users** table
   - You should see a new user with provider = `apple`
   - Check your **users** table in **Table Editor** to confirm the profile was auto-created

---

## How It Works

### Authentication Flow

```
1. User clicks "Apple" button
   ↓
2. App calls supabase.auth.signInWithOAuth({ provider: 'apple' })
   ↓
3. User is redirected to Apple sign-in page
   ↓
4. User authorizes the app
   ↓
5. Apple redirects to: /auth/callback?code=XXX
   ↓
6. Callback handler exchanges code for session
   ↓
7. If first-time user:
   - Create profile in users table
   - Extract name/email from Apple metadata
   - Set role as 'customer'
   ↓
8. Redirect based on role:
   - Admin → /admin
   - Customer → /dashboard
   - Or custom redirect (if specified)
```

### Auto-Profile Creation

When a user signs in with Apple for the first time, the app automatically:

1. Creates a record in the `users` table with:
   - `id`: Supabase user UUID
   - `email`: User's Apple email
   - `full_name`: Name from Apple (or email prefix if not provided)
   - `avatar_url`: Apple profile picture (if available)
   - `role`: Set to `customer` by default

2. Preserves Apple metadata in Supabase auth user:
   - `user_metadata.full_name`
   - `user_metadata.avatar_url`
   - `app_metadata.provider` = `apple`

---

## Troubleshooting

### Common Issues

**1. "Invalid Client ID"**
- Verify the Services ID in Supabase matches exactly what you created in Apple Developer Portal
- Make sure the Services ID is configured with Sign In with Apple enabled

**2. "Invalid redirect_uri"**
- Check that your callback URL is added to the Apple Services ID Return URLs list
- Verify the domain is added to the Domains list
- Format must be exact: `https://yourdomain.com/auth/callback`

**3. "Invalid Private Key"**
- Make sure you copied the entire key content including the header and footer lines
- The key should start with `-----BEGIN PRIVATE KEY-----`
- Don't modify or format the key content

**4. "User email not provided"**
- Apple users can choose to "Hide My Email"
- Your app handles this by using a proxy email provided by Apple
- The email will look like: `[random]@privaterelay.appleid.com`

**5. User not redirected after sign-in**
- Check browser console for errors
- Verify middleware.ts is not blocking the callback route
- Ensure the `users` table insert doesn't have foreign key constraints failing

---

## Security Best Practices

1. **Never commit your private key** to version control
2. **Rotate keys annually** for security
3. **Use environment variables** for sensitive data (already implemented)
4. **Enable Row Level Security** (RLS) on the `users` table if needed
5. **Validate user roles** before granting admin access (already implemented in middleware)

---

## Testing Checklist

- [ ] Apple provider enabled in Supabase
- [ ] Services ID, Team ID, Key ID, and Private Key configured
- [ ] Callback URL added to Apple Services ID
- [ ] Production domain added to Apple Services ID
- [ ] Apple Sign In button appears on signin/signup pages
- [ ] Click Apple button redirects to Apple sign-in
- [ ] After Apple auth, user is redirected back to app
- [ ] New user record created in `users` table
- [ ] User can access dashboard after sign-in
- [ ] User session persists across page refreshes
- [ ] Sign out functionality works correctly

---

## Additional Features Already Implemented

### Error Handling
- OAuth errors display user-friendly messages
- Failed authentications redirect back to signin with error parameter
- Network errors are caught and logged

### User Experience
- Loading states during authentication
- Smooth redirects after successful sign-in
- Preserves intended destination with `redirect_to` parameter
- Handles pending bookings (if user was booking a car before signing in)

### Admin Features
- Admin users are automatically detected and redirected to `/admin`
- Admin role verification in middleware
- Non-admin users are blocked from admin routes

---

## Support

If you encounter issues:

1. Check the browser console for error messages
2. Verify Supabase dashboard logs: **Authentication** → **Logs**
3. Test with a different Apple ID
4. Ensure your Apple Developer account is active
5. Confirm your production domain is using HTTPS (required by Apple)

---

## Next Steps

After setting up Apple Sign In, you may want to:

1. **Add more OAuth providers**: GitHub, Microsoft, etc.
2. **Customize the sign-in UI**: Update colors, add branding
3. **Set up email notifications**: Welcome emails, booking confirmations
4. **Implement 2FA**: For enhanced security
5. **Add social account linking**: Let users connect multiple providers

Your authentication system is production-ready and follows Supabase best practices!
