# OAuth Setup Guide

This guide will help you configure Google and Apple Sign-In for your car rental platform.

## Google OAuth Setup

### 1. Create Google Cloud Project
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable the Google+ API

### 2. Configure OAuth Consent Screen
1. Go to "APIs & Services" > "OAuth consent screen"
2. Choose "External" user type
3. Fill in required information:
   - App name: "YOLO Rental Cars"
   - User support email: your-email@example.com
   - Developer contact information: your-email@example.com

### 3. Create OAuth Credentials
1. Go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "OAuth 2.0 Client IDs"
3. Choose "Web application"
4. Add authorized redirect URIs:
   - `https://your-project.supabase.co/auth/v1/callback`
   - `http://localhost:3000/auth/callback` (for development)

### 4. Configure Supabase
1. Go to your Supabase project dashboard
2. Navigate to "Authentication" > "Providers"
3. Enable Google provider
4. Add your Google Client ID and Client Secret
5. Set redirect URL: `https://your-domain.com/auth/callback`

## Apple Sign-In Setup

### 1. Apple Developer Account
1. You need an Apple Developer account ($99/year)
2. Go to [Apple Developer Portal](https://developer.apple.com/)

### 2. Create App ID
1. Go to "Certificates, Identifiers & Profiles"
2. Create a new App ID
3. Enable "Sign In with Apple" capability

### 3. Create Service ID
1. Create a new Services ID
2. Configure "Sign In with Apple"
3. Add your domain and redirect URLs:
   - Primary App Domain: `your-domain.com`
   - Redirect URLs: `https://your-project.supabase.co/auth/v1/callback`

### 4. Create Private Key
1. Create a new Key for "Sign In with Apple"
2. Download the .p8 file
3. Note the Key ID

### 5. Configure Supabase
1. Go to your Supabase project dashboard
2. Navigate to "Authentication" > "Providers"
3. Enable Apple provider
4. Add required information:
   - Client ID (Services ID)
   - Team ID
   - Key ID
   - Private Key (contents of .p8 file)

## Environment Variables

The OAuth configuration is handled automatically through Supabase. Make sure you have the following Supabase environment variables configured:

- NEXT_PUBLIC_SUPABASE_URL (your Supabase project URL)
- NEXT_PUBLIC_SUPABASE_ANON_KEY (your Supabase anonymous key)

These should be set in your deployment environment (Vercel, Netlify, etc.) and in your local `.env.local` file for development.

## Testing

1. Start your development server
2. Go to `/auth/signin`
3. Click "Google" or "Apple" buttons
4. Complete OAuth flow
5. Verify user is created in your database

## Troubleshooting

### Common Issues:
1. **Redirect URI mismatch**: Ensure all redirect URIs match exactly
2. **Domain verification**: Make sure your domain is verified with providers
3. **HTTPS required**: OAuth providers require HTTPS in production
4. **Popup blocked**: Some browsers block OAuth popups

### Debug Steps:
1. Check browser console for errors
2. Verify Supabase Auth logs
3. Test with different browsers
4. Check network requests in DevTools

### Configuration Checklist:
- [ ] Google Cloud Project created and configured
- [ ] OAuth consent screen configured
- [ ] Google OAuth credentials created
- [ ] Supabase Google provider enabled
- [ ] Redirect URLs properly configured
- [ ] Environment variables set in deployment platform
