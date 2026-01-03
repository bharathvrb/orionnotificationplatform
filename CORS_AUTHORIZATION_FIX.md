# CORS Authorization Header Issue - Fix Guide

## Problem

Getting "Network Error, Full authentication is required to access this resource" even though Authorization token is being sent from frontend.

## Root Cause

This is a **CORS (Cross-Origin Resource Sharing)** issue. When making direct cross-origin requests from the frontend to the backend, the browser sends a **preflight OPTIONS request** first. If the backend's CORS configuration doesn't explicitly allow the `Authorization` header, the browser blocks the actual request.

## Solution

The backend **MUST** configure CORS to allow:
1. The `Authorization` header in `Access-Control-Allow-Headers`
2. The frontend origin in `Access-Control-Allow-Origin`

## Backend CORS Configuration Required

### Required CORS Headers

The backend should include these headers in responses (especially for OPTIONS preflight requests):

```
Access-Control-Allow-Origin: http://onp-onboard-ui.as-g8.cf.comcast.net
Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS
Access-Control-Allow-Headers: Authorization, Content-Type, trackingId, environment, requestCriteria, commitMessage, gitAccessToken
Access-Control-Allow-Credentials: true
Access-Control-Max-Age: 86400
```

### For Spring Boot Backend (Example)

```java
@Configuration
public class CorsConfig implements WebMvcConfigurer {
    
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/onp/v1/**")
            .allowedOrigins("http://onp-onboard-ui.as-g8.cf.comcast.net")
            .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
            .allowedHeaders("Authorization", "Content-Type", "trackingId", "environment", 
                           "requestCriteria", "commitMessage", "gitAccessToken")
            .allowCredentials(true)
            .maxAge(86400);
    }
}
```

### Or Using Spring Security

```java
@Configuration
@EnableWebSecurity
public class SecurityConfig {
    
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(Arrays.asList("http://onp-onboard-ui.as-g8.cf.comcast.net"));
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(Arrays.asList(
            "Authorization", 
            "Content-Type", 
            "trackingId", 
            "environment",
            "requestCriteria", 
            "commitMessage", 
            "gitAccessToken"
        ));
        configuration.setAllowCredentials(true);
        configuration.setMaxAge(86400L);
        
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/onp/v1/**", configuration);
        return source;
    }
}
```

## Frontend Changes Made

1. ✅ **Removed SSO Token Interceptor** - Frontend only sends manually entered or SAT-generated tokens
2. ✅ **Authorization Header Setup** - All API calls include Authorization in headers (not body)
3. ✅ **Enhanced Error Handling** - Better error messages for CORS/authentication issues
4. ✅ **Request Logging** - Added logging to verify Authorization header is being sent

## Verification Steps

### 1. Check Browser Console

Look for these log messages:
- `[API Request] Authorization header is present` - Confirms header is being sent
- Check Network tab → Request Headers → Should see `Authorization: Bearer ...`

### 2. Check Network Tab

1. Open Browser DevTools → Network tab
2. Make an API request
3. Look for **two requests**:
   - **OPTIONS** request (preflight) - Should return 200/204
   - **POST/PUT** request (actual) - Should include Authorization header

### 3. Check OPTIONS Response Headers

The OPTIONS request should return:
- `Access-Control-Allow-Headers: Authorization, Content-Type, ...`
- `Access-Control-Allow-Origin: http://onp-onboard-ui.as-g8.cf.comcast.net`

## Current Frontend Configuration

- **Backend URL**: `https://onppoc-qa.as-g8.cf.comcast.net/onp/v1`
- **Frontend Origin**: `http://onp-onboard-ui.as-g8.cf.comcast.net`
- **Authorization**: Sent in headers as `Authorization: Bearer <token>`

## Testing

After backend CORS is configured:

1. ✅ OPTIONS preflight request should succeed (200/204)
2. ✅ POST/PUT requests should include Authorization header
3. ✅ Backend should receive and validate the Authorization token
4. ✅ No "Network Error" or "Full authentication required" errors

## Next Steps

1. **Backend Team**: Configure CORS to allow Authorization header and frontend origin
2. **Test**: Verify OPTIONS preflight request succeeds
3. **Test**: Verify Authorization header reaches backend
4. **Monitor**: Check browser console and network tab for any remaining issues

---

**Note**: If the frontend and backend are on the same domain, CORS won't be an issue. But since they're on different domains (frontend on `onp-onboard-ui.as-g8.cf.comcast.net` and backend on `onppoc-qa.as-g8.cf.comcast.net`), CORS configuration is required.

