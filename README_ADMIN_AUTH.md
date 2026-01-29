# Admin Authentication System

This document explains how the admin authentication system works and how to configure it for production use.

## Overview

The admin authentication system uses a client-side authentication wrapper component that works with HTTP-only cookies. When an unauthenticated user attempts to access an admin page, a login modal is displayed automatically.

## Components

1. **AdminAuthWrapper**: Client-side component that checks for authenticated status and shows the login modal
2. **LoginModal**: Popup modal for password entry
3. **LogoutButton**: Component to allow admins to log out
4. **PasswordChangeForm**: Section in the profile tab to update admin password
5. **Admin Layout**: Uses the wrapper to protect all admin pages

## How It Works

1. The `AdminAuthWrapper` component checks authentication by making a request to `/api/admin/check-auth`
2. If not authenticated, it shows the login modal automatically
3. After successful login, a secure HTTP-only cookie is set
4. The auth wrapper detects this cookie and renders the protected admin content
5. The logout button clears the auth cookie

## Configuration

The authentication system uses environment variables for security. These are set in `.env.local`:

- `ADMIN_PASSWORD`: Admin password
- `ADMIN_AUTH_TOKEN`: Security token used for cookie-based authentication

### For Production

When deploying to production, you should:

1. Change all credentials in the `.env` file to strong, unique values
2. Set `secure: true` for cookies in production to ensure HTTPS-only transmission
3. Consider implementing rate-limiting for login attempts
4. Rotate the `ADMIN_AUTH_TOKEN` periodically

## Security Notes

- The current implementation uses simple password authentication
- All sensitive data is stored in environment variables, not in the codebase
- HTTP-only cookies are used to prevent client-side JavaScript access
- Passwords can be changed from within the admin interface
- For enhanced security, consider adding:
  - Two-factor authentication
  - IP-based restrictions
  - Session timeouts
  - Audit logging

## How to Log In

When you access any admin page while not authenticated, a login modal will automatically appear. Enter your admin password to gain access.

## How to Log Out

Use the Logout button in the admin interface navbar, or manually clear your cookies.

## How to Change Password

1. Go to the admin dashboard
2. Navigate to the "Profile" tab
3. Use the "Change Admin Password" card to update your password 