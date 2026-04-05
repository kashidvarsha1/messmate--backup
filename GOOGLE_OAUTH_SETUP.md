# 🔐 Google OAuth Setup Guide

This guide explains how to set up Google OAuth integration for MessMate AI.

## 🎯 What is Google OAuth?

Google OAuth allows users to login with their Google account instead of creating a new password. It's more secure and convenient.

## 📋 Prerequisites

- Google Account
- Google Cloud Console Access
- Backend running with updated routes
- Frontend with Google login button

## 🚀 Step-by-Step Setup

### Step 1: Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click **Select a Project** → **New Project**
3. Name it: `MessMate`
4. Click **Create**

### Step 2: Enable OAuth 2.0

1. In the left sidebar, click **APIs & Services** → **OAuth consent screen**
2. Select **External** as User Type
3. Click **Create**
4. Fill in Application Details:
   - **App name**: MessMate
   - **User support email**: your-email@gmail.com
   - **Developer contact email**: your-email@gmail.com
5. Click **Save and Continue**
6. Skip optional fields → **Save and Continue**
7. Click **Back to Dashboard**

### Step 3: Create OAuth Credentials

1. Go to **APIs & Services** → **Credentials**
2. Click **+ Create Credentials** → **OAuth client ID**
3. Choose **Web application**
4. Add Authorized JavaScript origins:
   ```
   http://localhost:8000
   http://localhost:5173
   https://your-domain.com (production)
   ```
5. Add Authorized redirect URIs:
   ```
   http://localhost:8000/api/auth/google/callback
   https://your-domain.com/api/auth/google/callback (production)
   ```
6. Click **Create**
7. Copy your credentials:
   - **Client ID**
   - **Client Secret**

### Step 4: Update .env Files

#### Backend (.env)
```
GOOGLE_CLIENT_ID=your_client_id_here
GOOGLE_CLIENT_SECRET=your_client_secret_here
BACKEND_URL=http://localhost:8000
```

#### Frontend (.env) - Optional
No additional variables needed if using VITE_API_URL

### Step 5: Test Google Login

1. Start backend: `npm run dev`
   - Should automatically use Passport strategy

2. Start frontend: `npm run dev`
   - Click "Google se Login Karo" button
   - You'll be redirected to Google login
   - After login, redirected back to app

3. You should be logged in! ✅

## 🔄 How It Works

### Login Flow

```
User clicks "Google se Login Karo"
         ↓
   Frontend redirects to: /api/auth/google
         ↓
   Google OAuth consent screen
         ↓
   User grants permission
         ↓
   Google redirects to: /api/auth/google/callback
         ↓
   Backend verifies token & creates/finds user
         ↓
   Backend redirects to: /auth-callback?token=JWT&email=...
         ↓
   Frontend stores token & redirects to dashboard
         ↓
   User logged in! ✅
```

## 📝 User Data Stored

When a user logs in via Google, we store:
- Email (from Google)
- Name (from Google)
- Avatar/Profile picture (from Google)
- Generated JWT token for our app
- Role: Customer (default for new OAuth users)

## 🔒 Security Features

- ✅ No passwords stored for OAuth users
- ✅ JWT token for session management
- ✅ HTTPS/Secure cookies (in production)
- ✅ CSRF protection via session tokens
- ✅ Rate limiting on auth endpoints

## ⚙️ Environment Variables Required

### Backend
| Variable | Value | Example |
|----------|-------|---------|
| `GOOGLE_CLIENT_ID` | From Google Cloud Console | `123456789.apps.googleusercontent.com` |
| `GOOGLE_CLIENT_SECRET` | From Google Cloud Console | `GOCSPX-xxxxx` |
| `BACKEND_URL` | Your backend URL | `http://localhost:8000` |

### Files Modified

**Backend:**
- `server.js` - Added Passport middleware
- `routes/authRoutes.js` - Added Google routes
- `controllers/googleAuthController.js` - New OAuth controller
- `config/googleAuth.js` - New Passport strategy
- `.env` - Added Google credentials

**Frontend:**
- `src/pages/Login.jsx` - Added Google login button
- `src/pages/AuthCallback.jsx` - New OAuth callback handler
- `src/App.jsx` - Added auth-callback route

## 🐛 Troubleshooting

### Error: "Invalid redirect URI"
- Check that redirect URI in Google Cloud Console matches exactly:
  - `http://localhost:8000/api/auth/google/callback`
- No trailing slashes or different domains

### Error: "GOOGLE_CLIENT_ID is undefined"
- Check `.env` file has correct values
- Restart backend after changing .env
- Make sure no spaces around `=` sign

### Error: "User already exists"
- OAuth users can have same email as password users
- Current implementation will login existing users

### User not redirected after login
- Check browser console for errors
- Verify FRONTEND_URL is correct in backend .env
- Check auth-callback page is loading

## 📱 Mobile Setup

For mobile apps, you might need:
- Google SDK integration
- Different redirect URIs
- Consider using Firebase Authentication instead

## 🚀 Production Deployment

Before going live:

1. **Update Google Console:**
   - Add production domain to Authorized JavaScript origins
   - Add production redirect URI
   - Update both FRONTEND_URL and BACKEND_URL in .env

2. **Update Hosts:**
   ```
   GOOGLE_CLIENT_ID=your_production_client_id
   GOOGLE_CLIENT_SECRET=your_production_secret
   BACKEND_URL=https://your-backend-domain.com
   FRONTEND_URL=https://your-frontend-domain.com
   ```

3. **Test Thoroughly:**
   - Test login with new Google account
   - Test login with existing account
   - Test logout and re-login
   - Test mobile login

## 📚 Additional Resources

- [Google OAuth Documentation](https://developers.google.com/identity/protocols/oauth2)
- [Passport.js Google Strategy](http://www.passportjs.org/packages/passport-google-oauth20/)
- [Google Cloud Console](https://console.cloud.google.com/)

## 🆘 Need Help?

If Google login isn't working:

1. Check console for error messages
2. Verify backend is running: `http://localhost:8000`
3. Check .env variables are set correctly
4. Ensure Google Cloud project is set up
5. Check redirect URIs match exactly

---

**Setup Time: ~10 minutes**  
**Difficulty: Medium** 
**Status: ✅ Ready for Production**
