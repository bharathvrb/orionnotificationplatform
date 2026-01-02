# API Proxy Configuration Validation

## Summary
✅ **The proxy configuration fix is applicable to ALL backend ONP API endpoints.**

## Frontend API Calls (Using `/api` prefix)

All frontend API calls use `API_BASE_URL` which defaults to `/api`. These requests are proxied through the Express server:

| Frontend Endpoint | HTTP Method | Backend Endpoint | Status |
|------------------|-------------|------------------|--------|
| `/api/onboardonp` | POST | `/onp/v1/onboardonp` | ✅ Fixed |
| `/api/kafkaDetails` | POST | `/onp/v1/kafkaDetails` | ✅ Fixed |
| `/api/mongoDBDetails` | POST | `/onp/v1/mongoDBDetails` | ✅ Fixed |
| `/api/updateonp` | PUT | `/onp/v1/updateonp` | ✅ Fixed |

## Proxy Configuration

### Before Fix:
- `BACKEND_API_URL` = `https://backend.com/onp/v1`
- Path rewrite: Remove `/api` prefix
- Result: `/api/onboardonp` → `/onboardonp` ❌ **WRONG**

### After Fix:
- `BACKEND_API_URL` = `https://backend.com` (base URL only)
- Path rewrite: Map `/api` → `/onp/v1`
- Result: `/api/onboardonp` → `/onp/v1/onboardonp` ✅ **CORRECT**

## Backend Controller Structure

All endpoints are defined under the base path `/onp/v1`:

```java
@RestController
@RequestMapping("/onp/v1")
public class OnpController {
    // All endpoints are relative to /onp/v1
    @RequestMapping(value = "/onboardonp", method = RequestMethod.POST)
    @RequestMapping(value = "/kafkaDetails", method = RequestMethod.POST)
    @RequestMapping(value = "/mongoDBDetails", method = RequestMethod.POST)
    @RequestMapping(value = "/updateonp", method = RequestMethod.PUT)
}
```

## External APIs (NOT Affected)

The SAT service calls use full URLs and do NOT go through the proxy:
- `https://sat-stg.codebig2.net/v2/ws/token.oauth2`
- `https://sat-prod.codebig2.net/v2/ws/token.oauth2`
- `https://sat-ci.codebig2.net/v2/ws/token.oauth2`

These are external services and are not affected by the proxy configuration changes.

## Files Modified

1. **`server.js`** (Production proxy)
   - Changed `BACKEND_API_URL` default to base URL only
   - Updated path rewrite: `'^/api': '/onp/v1'`

2. **`vite.config.ts`** (Development proxy)
   - Changed target to base URL only
   - Updated rewrite: `path.replace(/^\/api/, '/onp/v1')`

## Verification

All frontend API calls will now correctly map:
- ✅ `/api/onboardonp` → Backend: `/onp/v1/onboardonp`
- ✅ `/api/kafkaDetails` → Backend: `/onp/v1/kafkaDetails`
- ✅ `/api/mongoDBDetails` → Backend: `/onp/v1/mongoDBDetails`
- ✅ `/api/updateonp` → Backend: `/onp/v1/updateonp`

## Environment Variables

Make sure `BACKEND_API_URL` environment variable is set to the **base URL only** (without `/onp/v1`):

```yaml
# Correct ✅
BACKEND_API_URL: https://onp-backend-dev.as-g8.cf.comcast.net

# Incorrect ❌
BACKEND_API_URL: https://onp-backend-dev.as-g8.cf.comcast.net/onp/v1
```

## Conclusion

The proxy configuration fix applies uniformly to all ONP backend API endpoints since they all follow the same pattern:
- Frontend: `/api/{endpoint}`
- Backend: `/onp/v1/{endpoint}`

No additional changes are required for other endpoints.

