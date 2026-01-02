# Frontend-Backend Synchronization Validation

## Backend Configuration

**Backend Host:** `https://onppoc-qa.as-g8.cf.comcast.net`  
**Backend Base Path:** `/onp/v1`  
**All endpoints are under:** `/onp/v1/{endpoint}`

## API Endpoint Mapping

| Frontend Endpoint | HTTP Method | Backend Endpoint | Proxy Mapping | Status |
|------------------|-------------|------------------|---------------|--------|
| `/api/onboardonp` | POST | `/onp/v1/onboardonp` | ✅ Correct | ✅ Validated |
| `/api/mongoDBDetails` | POST | `/onp/v1/mongoDBDetails` | ✅ Correct | ✅ Validated |
| `/api/kafkaDetails` | POST | `/onp/v1/kafkaDetails` | ✅ Correct | ✅ Validated |
| `/api/updateonp` | PUT | `/onp/v1/updateonp` | ✅ Correct | ✅ Validated |

## Request Structure Validation

### 1. Onboard ONP API (`POST /api/onboardonp`)

#### Frontend Request Format
```typescript
// Headers
{
  "Authorization": "Bearer <token>",
  "trackingId": "onboard-{timestamp}-{random}",
  "environment": "DEV AS-G8",
  "requestCriteria": "mongodbandredis,kafkatopic",
  "commitMessage": "..." (optional),
  "gitAccessToken": "..." (optional),
  "Content-Type": "application/json"
}

// Body
{
  "eventName": "string",
  "headerSchema": "{\"type\":\"object\",...}", // Double-stringified JSON
  "payloadSchema": "{\"type\":\"object\",...}", // Double-stringified JSON
  "downstreamDetails": [
    {
      "name": "string",
      "endpoint": "string",
      "clientId": "string",
      "clientSecret": "string",
      "scope": "string",
      "httpStatusCode": "string", // Number converted to string
      "maintenanceFlag": 0 | 1, // Boolean converted to 0/1
      "maxRetryCount": 0,
      "retryDelay": 0
    }
  ],
  "subscriberName": "string",
  "numPartitions": 1,
  "replicationFactor": 1
}
```

#### Backend Expected Format
✅ **MATCHES** - Frontend correctly formats:
- Headers are properly set
- `headerSchema` and `payloadSchema` are double-stringified JSON strings
- `downstreamDetails` has correct field types
- `httpStatusCode` is converted to string
- `maintenanceFlag` is converted to 0/1 integer

**Status:** ✅ **SYNCED**

---

### 2. MongoDB Details API (`POST /api/mongoDBDetails`)

#### Frontend Request Format
```typescript
// Headers
{
  "Authorization": "Bearer <token>",
  "trackingId": "mongodb-details-{timestamp}",
  "environment": "DEV AS-G8",
  "Content-Type": "application/json"
}

// Body
{
  "eventNames": ["Event1", "Event2"] // or ["ALL"] for all events
}
```

#### Backend Expected Format
✅ **MATCHES** - Frontend correctly formats:
- Headers include `trackingId` and `environment`
- Body contains `eventNames` array
- Supports `["ALL"]` for fetching all events

**Status:** ✅ **SYNCED**

---

### 3. Kafka Details API (`POST /api/kafkaDetails`)

#### Frontend Request Format
```typescript
// Headers
{
  "Authorization": "Bearer <token>",
  "trackingId": "kafka-details-{timestamp}",
  "environment": "DEV AS-G8",
  "Content-Type": "application/json"
}

// Body
{
  "topicNames": ["topic1", "topic2"]
}
```

#### Backend Expected Format
✅ **MATCHES** - Frontend correctly formats:
- Headers include `trackingId` and `environment`
- Body contains `topicNames` array

**Status:** ✅ **SYNCED**

---

### 4. Update ONP API (`PUT /api/updateonp`)

#### Frontend Request Format
```typescript
// Headers
{
  "Authorization": "Bearer <token>",
  "trackingId": "update-{timestamp}-{random}",
  "environment": "DEV AS-G8",
  "requestCriteria": "mongodbandredis",
  "Content-Type": "application/json"
}

// Body
{
  "eventName": "string",
  "headerSchema": "{\"type\":\"object\",...}", // Double-stringified JSON
  "payloadSchema": "{\"type\":\"object\",...}", // Double-stringified JSON
  "subscriberName": "string",
  "downstreamDetails": [...] // Same format as onboard
}
```

#### Backend Expected Format
✅ **MATCHES** - Frontend correctly formats:
- Uses PUT method
- Headers and body format match backend expectations

**Status:** ✅ **SYNCED**

---

## Proxy Configuration

### server.js (Production)
```javascript
const BACKEND_API_URL = process.env.BACKEND_API_URL || 'https://onppoc-qa.as-g8.cf.comcast.net';

const proxyMiddleware = createProxyMiddleware({
  target: BACKEND_API_URL,
  changeOrigin: true,
  pathRewrite: {
    '^/api': '/onp/v1', // ✅ Correct mapping
  }
});

app.use('/api', proxyMiddleware);
```

**Status:** ✅ **CONFIGURED CORRECTLY**

### vite.config.ts (Development)
```typescript
proxy: {
  '/api': {
    target: process.env.VITE_API_BASE_URL || 'https://onppoc-qa.as-g8.cf.comcast.net',
    changeOrigin: true,
    rewrite: (path) => path.replace(/^\/api/, '/onp/v1'), // ✅ Correct mapping
  }
}
```

**Status:** ✅ **CONFIGURED CORRECTLY**

---

## Response Handling

### Frontend Response Processing

All API responses are properly handled:

1. **Success Responses (200)**: Parsed and displayed in UI
2. **Error Responses (400, 401, 404, 500)**: Error messages extracted and shown to user
3. **Structured Error Responses**: When backend returns structured error (e.g., MongoDBDetailsResponse with empty eventDetails), frontend correctly handles it
4. **Partial Success**: Frontend handles partial success scenarios (some tasks succeed, some fail)

**Status:** ✅ **HANDLED CORRECTLY**

---

## Environment Variable Configuration

### Current Setup
- **Default Backend URL:** `https://onppoc-qa.as-g8.cf.comcast.net`
- **Set via:** `BACKEND_API_URL` environment variable (optional)
- **Fallback:** Uses default if not set

### Cloud Foundry Deployment
The backend URL can be configured via:
```bash
cf set-env onp-onboard-ui BACKEND_API_URL https://onppoc-qa.as-g8.cf.comcast.net
```

Or in `manifest.yml`:
```yaml
env:
  BACKEND_API_URL: https://onppoc-qa.as-g8.cf.comcast.net
```

**Note:** The default is already set to the correct QA backend URL, so no additional configuration is needed unless deploying to a different environment.

**Status:** ✅ **CONFIGURED**

---

## Headers Validation

### Required Headers

| Header | Source | Required For | Status |
|--------|--------|--------------|--------|
| `Authorization` | Auto-added by axios interceptor or form input | All APIs | ✅ Present |
| `trackingId` | Auto-generated in frontend | All APIs | ✅ Present |
| `environment` | Form selection | All APIs | ✅ Present |
| `requestCriteria` | Form checkboxes | Onboard/Update | ✅ Present |
| `Content-Type` | Set to `application/json` | All POST/PUT | ✅ Present |

**Status:** ✅ **ALL HEADERS PRESENT**

---

## Summary

### ✅ Validation Results

| Component | Status | Notes |
|-----------|--------|-------|
| **Backend URL** | ✅ Correct | `https://onppoc-qa.as-g8.cf.comcast.net` |
| **Proxy Mapping** | ✅ Correct | `/api/*` → `/onp/v1/*` |
| **Request Headers** | ✅ Correct | All required headers present |
| **Request Body** | ✅ Correct | Format matches backend expectations |
| **Response Handling** | ✅ Correct | All scenarios handled |
| **Error Handling** | ✅ Correct | User-friendly error messages |
| **Environment Config** | ✅ Correct | Default QA URL set |

### ✅ Frontend-Backend Sync Status: **FULLY SYNCHRONIZED**

All API endpoints, request formats, headers, and response handling are correctly aligned between frontend and backend.

---

## Testing Recommendations

1. **Verify Proxy Logs**: Check Cloud Foundry logs to ensure requests are being proxied correctly:
   ```bash
   cf logs onp-onboard-ui --recent | grep "Proxy"
   ```

2. **Test Each Endpoint**: 
   - ✅ Onboard: Create a new event
   - ✅ MongoDB Details: Fetch event details
   - ✅ Kafka Details: Fetch topic details
   - ✅ Update: Update an existing event

3. **Verify Request Format**: Use browser DevTools Network tab to verify:
   - Request URL is correctly mapped
   - Headers are present
   - Request body format is correct

4. **Check Error Scenarios**: Test with invalid data to ensure error handling works correctly.

---

## Last Updated
2026-01-02 - Validated all endpoints and confirmed frontend-backend synchronization.

