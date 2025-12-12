# Company SSO Setup Guide

This guide will help you configure Single Sign-On (SSO) with your company's identity provider.

## Information Needed from Your IT Team

To configure SSO, you'll need the following information from your company's IT/Identity team:

### Required Information:

1. **OIDC Authority URL** (also called Issuer URL or Discovery URL)
   - This is the base URL of your identity provider
   - Examples:
     - Azure AD: `https://login.microsoftonline.com/{tenant-id}`
     - Okta: `https://{your-domain}.okta.com`
     - Auth0: `https://{your-domain}.auth0.com`
     - Generic: `https://your-identity-provider.com`

2. **Client ID** (also called Application ID)
   - Unique identifier for your application
   - Format varies by provider

3. **Client Secret** (optional, for token refresh)
   - Secret key for your application
   - May not be required for public clients

4. **Redirect URI**
   - Must match exactly what's registered in your identity provider
   - Local: `http://localhost:5173/auth/callback`
   - Production: `https://your-domain.com/auth/callback`

5. **Scopes** (optional)
   - Usually: `openid profile email offline_access`
   - Your IT team can confirm required scopes

## Common Enterprise SSO Providers

### Microsoft Azure AD (Entra ID)

**Authority URL Format:**
```
https://login.microsoftonline.com/{tenant-id}
```
or
```
https://login.microsoftonline.com/{your-domain}.onmicrosoft.com
```

**Steps:**
1. Go to Azure Portal → Azure Active Directory
2. App registrations → New registration
3. Set redirect URI: `http://localhost:5173/auth/callback`
4. Copy Application (client) ID
5. Get tenant ID from Overview page

**Configuration:**
```env
VITE_SSO_PROVIDER=oidc
VITE_SSO_AUTHORITY=https://login.microsoftonline.com/{tenant-id}
VITE_SSO_CLIENT_ID={application-id}
VITE_SSO_SCOPES=openid,profile,email,offline_access
```

### Okta

**Authority URL Format:**
```
https://{your-domain}.okta.com
```

**Steps:**
1. Go to Okta Admin Console
2. Applications → Create App Integration
3. Choose OIDC - OpenID Connect
4. Application type: Web Application
5. Set redirect URI: `http://localhost:5173/auth/callback`
6. Copy Client ID and Client Secret

**Configuration:**
```env
VITE_SSO_PROVIDER=oidc
VITE_SSO_AUTHORITY=https://{your-domain}.okta.com
VITE_SSO_CLIENT_ID={client-id}
VITE_SSO_CLIENT_SECRET={client-secret}
VITE_SSO_SCOPES=openid,profile,email,offline_access
```

### Auth0

**Authority URL Format:**
```
https://{your-domain}.auth0.com
```

**Steps:**
1. Go to Auth0 Dashboard
2. Applications → Create Application
3. Choose Regular Web Application
4. Set Allowed Callback URLs: `http://localhost:5173/auth/callback`
5. Copy Client ID and Client Secret

**Configuration:**
```env
VITE_SSO_PROVIDER=oidc
VITE_SSO_AUTHORITY=https://{your-domain}.auth0.com
VITE_SSO_CLIENT_ID={client-id}
VITE_SSO_CLIENT_SECRET={client-secret}
VITE_SSO_SCOPES=openid,profile,email,offline_access
```

### Generic OIDC Provider

For any OIDC-compliant identity provider:

**Configuration:**
```env
VITE_SSO_PROVIDER=oidc
VITE_SSO_AUTHORITY=https://your-identity-provider.com
VITE_SSO_CLIENT_ID={client-id}
VITE_SSO_CLIENT_SECRET={client-secret}
VITE_SSO_SCOPES=openid,profile,email
```

## Setup Steps

1. **Contact Your IT Team**
   - Request OIDC/OAuth 2.0 application registration
   - Provide them with:
     - Application name: "ONP Onboard UI"
     - Redirect URI: `http://localhost:5173/auth/callback` (for dev)
     - Redirect URI: `https://your-production-domain.com/auth/callback` (for prod)
     - Required scopes: `openid profile email offline_access`

2. **Get Credentials**
   - Client ID
   - Client Secret (if required)
   - Authority/Issuer URL
   - Confirmed scopes

3. **Update .env File**
   - Open `.env` file in the project root
   - Fill in the values from your IT team
   - Save the file

4. **Restart Development Server**
   ```bash
   # Stop current server (Ctrl+C)
   npm run dev
   ```

5. **Test Login**
   - Navigate to `http://localhost:5173`
   - You should be redirected to your company's login page
   - After successful login, you'll be redirected back to the app

## Troubleshooting

### "Invalid redirect URI" Error
- Ensure the redirect URI in `.env` matches exactly what's registered in your identity provider
- Check for trailing slashes, http vs https, port numbers

### "Invalid client" Error
- Verify Client ID is correct
- Check that the application is active in your identity provider

### "Invalid scope" Error
- Verify scopes are correct and allowed for your application
- Check with IT team for required scopes

### Token Refresh Issues
- Ensure `offline_access` scope is included
- Verify Client Secret is set if required by your provider

## Security Notes

- **Never commit `.env` file to version control**
- Client Secret should ideally be handled server-side in production
- Use HTTPS in production
- Implement proper token storage and refresh logic
- Consider using httpOnly cookies for token storage in production

## Need Help?

Contact your IT/Identity team with:
- This guide
- Your application's redirect URI
- Required OIDC scopes
- Any error messages you encounter

