# Proxy 404 Error Fix

## Issue
Getting `404 Not Found` for `/api/mongoDBDetails` endpoint with empty response body.

## Root Cause Analysis

The 404 error with `x-powered-by: Express` header indicates:
1. Express server IS running ✓
2. Request is reaching Express ✓
3. Proxy middleware may not be matching the route, OR backend is returning 404

## Solution Applied

1. **Updated proxy middleware route matching**: Changed from `app.use('/api', ...)` to `app.all('/api/*', ...)` to explicitly match all routes starting with `/api/`
2. **Added comprehensive logging**: Added logging at multiple stages to diagnose proxy issues
3. **Improved error handling**: Enhanced error messages to include target URL information
4. **Middleware order**: Ensured proxy middleware is before static file serving

## Changes Made

### server.js
- Changed route matching from `app.use('/api', ...)` to `app.all('/api/*', ...)`
- Added detailed logging for request interception and proxy forwarding
- Enhanced error messages with target URL details

## Verification Steps

1. Check Cloud Foundry logs to see if proxy middleware is intercepting requests:
   ```
   cf logs onp-onboard-ui --recent
   ```
   
2. Look for these log messages:
   - `[Server] Received ... request to /api/mongoDBDetails`
   - `[Proxy] Forwarding ... to https://onppoc-qa.as-g8.cf.comcast.net/onp/v1/mongoDBDetails`
   - `[Proxy] Response: ...`

3. If proxy logs appear but still get 404:
   - Backend URL might be incorrect
   - Backend service might not be available at that URL
   - Check if `BACKEND_API_URL` environment variable needs to be set in Cloud Foundry

## Environment Variable Configuration

For DEV environment, you may need to set `BACKEND_API_URL` in Cloud Foundry:

```bash
cf set-env onp-onboard-ui BACKEND_API_URL https://onppoc-dev.as-g8.cf.comcast.net
```

Or add to manifest.yml:
```yaml
env:
  BACKEND_API_URL: https://onppoc-dev.as-g8.cf.comcast.net
```

## Expected Behavior

After fix:
- Request to `/api/mongoDBDetails` should be intercepted by proxy middleware
- Proxy should forward to `${BACKEND_API_URL}/onp/v1/mongoDBDetails`
- Response should come from backend (success or error, but not 404 from Express)

## If Issue Persists

1. Verify `staticfile` isn't interfering (Cloud Foundry might prefer staticfile buildpack)
2. Check if backend URL is correct for your environment
3. Verify backend service is accessible from Cloud Foundry
4. Check Cloud Foundry logs for proxy errors

