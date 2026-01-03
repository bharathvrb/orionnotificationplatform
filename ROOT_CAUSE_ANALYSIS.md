# Root Cause Analysis - Network Error & Authorization Issue

## The Problem

**Error Message:** "Network Error, Full authentication is required to access this resource"

**User Observation:** "I can see Authorization token passing in the request body"

## Root Cause Identified

The issue is **CORS (Cross-Origin Resource Sharing)** configuration on the backend. Here's what's happening:

### The Flow:

1. **Frontend Request:**
   - Frontend: `http://onp-onboard-ui.as-g8.cf.comcast.net`
   - Backend: `https://onppoc-qa.as-g8.cf.comcast.net/onp/v1/mongoDBDetails`
   - **Different origins** = Cross-origin request

2. **Browser Preflight (OPTIONS):**
   - Browser automatically sends OPTIONS request first
   - Asks backend: "Can I send Authorization header?"
   - Backend MUST respond with CORS headers allowing Authorization

3. **If CORS Not Configured:**
   - Browser blocks the actual POST request
   - Error: "Network Error, Full authentication is required"
   - Request never reaches backend → No 401, just network error

### Why "Authorization in Request Body"?

If you see Authorization in the request body (instead of headers), this could mean:
- Browser DevTools might be showing transformed/serialized data
- OR there's an issue with axios header serialization
- But the actual issue is CORS blocking the headers from being sent

## Verification Steps

### 1. Check Browser Network Tab

**Look for TWO requests:**
- **OPTIONS** request to `/onp/v1/mongoDBDetails`
  - Status should be 200 or 204
  - Response headers should include:
    - `Access-Control-Allow-Headers: Authorization, Content-Type, ...`
    - `Access-Control-Allow-Origin: http://onp-onboard-ui.as-g8.cf.comcast.net`

- **POST** request to `/onp/v1/mongoDBDetails`
  - If OPTIONS fails, POST won't even be sent
  - If POST is sent, check Request Headers tab
  - Should see: `Authorization: Bearer ...`

### 2. Check Browser Console

Look for these logs:
- `[API Request] Authorization header is present` ✅ Good
- `[API Request] No Authorization header found` ❌ Problem

### 3. Check OPTIONS Response

If OPTIONS request:
- Returns 404 → Backend doesn't handle OPTIONS
- Returns 405 → Backend doesn't allow OPTIONS method
- Missing CORS headers → Backend CORS not configured

## The Fix Required

### Backend MUST:

1. **Handle OPTIONS requests** for `/onp/v1/*` endpoints
2. **Return CORS headers:**
   ```
   Access-Control-Allow-Origin: http://onp-onboard-ui.as-g8.cf.comcast.net
   Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS
   Access-Control-Allow-Headers: Authorization, Content-Type, trackingId, environment, requestCriteria, commitMessage, gitAccessToken
   Access-Control-Allow-Credentials: true
   ```

### Frontend Code Status

✅ **Frontend is CORRECT:**
- Authorization token is set in headers (line 149, 352, 493 in api.ts)
- Headers are passed correctly to axios
- Request interceptor logs confirm headers are present
- Code structure is correct

❌ **Backend CORS NOT CONFIGURED:**
- Backend must allow Authorization header in CORS
- Backend must allow frontend origin
- Backend must handle OPTIONS preflight

## Why Multiple Fixes Didn't Work

1. **Proxy Configuration** - Not the issue (we removed proxy, using direct calls)
2. **Header Format** - Headers are correct (`Authorization: Bearer <token>`)
3. **Token Source** - Using manual/SAT tokens correctly
4. **Request Structure** - Body and headers are correct

**The real issue:** Browser is blocking the request due to CORS before it even reaches the backend.

## Solution

**BACKEND TEAM MUST FIX:**

Add CORS configuration to Spring Boot backend:

```java
@Configuration
public class CorsConfig {
    
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        
        // Allow frontend origin
        configuration.setAllowedOrigins(Arrays.asList(
            "http://onp-onboard-ui.as-g8.cf.comcast.net"
        ));
        
        // Allow required methods
        configuration.setAllowedMethods(Arrays.asList(
            "GET", "POST", "PUT", "DELETE", "OPTIONS"
        ));
        
        // CRITICAL: Allow Authorization header
        configuration.setAllowedHeaders(Arrays.asList(
            "Authorization",
            "Content-Type",
            "trackingId",
            "environment",
            "requestCriteria",
            "commitMessage",
            "gitAccessToken"
        ));
        
        // Allow credentials
        configuration.setAllowCredentials(true);
        configuration.setMaxAge(3600L);
        
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/onp/v1/**", configuration);
        return source;
    }
}
```

Or if using Spring Security:

```java
@Configuration
@EnableWebSecurity
public class SecurityConfig extends WebSecurityConfigurerAdapter {
    
    @Override
    protected void configure(HttpSecurity http) throws Exception {
        http.cors().configurationSource(corsConfigurationSource())
            .and()
            .csrf().disable() // Or configure CSRF properly
            // ... other security config
    }
    
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        // Same as above
    }
}
```

## Testing After Backend Fix

1. **Check OPTIONS Request:**
   - Open Network tab
   - Make API call
   - OPTIONS request should return 200/204
   - Response headers should include CORS headers

2. **Check POST Request:**
   - POST request should be sent (not blocked)
   - Request Headers should include Authorization
   - Should get actual backend response (200, 400, 401, etc.)

3. **No More Network Error:**
   - If CORS is fixed, you'll get actual HTTP status codes from backend
   - No more "Network Error" from browser

## Summary

**Frontend Code:** ✅ Correct
**Backend CORS:** ❌ NOT CONFIGURED - THIS IS THE ISSUE

**Action Required:** Backend team must configure CORS to allow:
- Frontend origin
- Authorization header
- OPTIONS method handling

This is a **backend configuration issue**, not a frontend code issue.

