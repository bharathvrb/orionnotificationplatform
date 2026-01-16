# Frontend-Backend API Validation Report

## Update MongoDB and Redis API Compatibility Check

### Backend Endpoint: `PUT /onp/v1/updateonp`

#### Backend Expected Structure

**Headers:**
- `trackingId` (required): String
- `environment` (optional): String
- `requestCriteria` (optional): String (comma-separated)
- `Authorization` (required): String (Bearer token)

**Request Body (ONPEventRequest):**
```java
{
  "eventName": String,
  "headerSchema": String,  // Double-escaped JSON string
  "payloadSchema": String, // Double-escaped JSON string
  "subscriberName": String,
  "downstreamDetails": List<DownstreamDetail>,
  "numPartitions": Integer,
  "replicationFactor": int,
  "branchName": String
}
```

**DownstreamDetail Structure:**
```java
{
  "name": String,
  "endpoint": String,
  "clientId": String,
  "clientSecret": String,
  "scope": String,
  "httpStatusCode": String,  // Note: String, not int!
  "maintenanceFlag": int,     // 0 or 1
  "maxRetryCount": int,
  "retryDelay": int
}
```

---

### Frontend Implementation Check

#### Headers ✅
- ✅ `trackingId`: Generated correctly (`update-${timestamp}-${random}`)
- ✅ `environment`: Sent from request.environment
- ✅ `requestCriteria`: Sent as comma-separated string
- ✅ `Authorization`: Sent with Bearer prefix

#### Request Body Mapping

**✅ CORRECT:**
1. **eventName**: ✅ Correctly mapped
2. **headerSchema**: ✅ Double-escaped: `JSON.stringify(JSON.stringify(parsed))`
3. **payloadSchema**: ✅ Double-escaped: `JSON.stringify(JSON.stringify(parsed))`
4. **subscriberName**: ✅ Correctly mapped
5. **downstreamDetails**: ✅ All fields correctly mapped

**⚠️ POTENTIAL ISSUES:**

1. **httpStatusCode handling:**
   - Frontend: `detail.httpStatusCode?.toString()` 
   - Issue: If `httpStatusCode` is `undefined`, this sends `undefined` (not a valid JSON value)
   - Backend expects: `String` or `null`
   - **Fix needed**: Send `null` or omit field when undefined

2. **maintenanceFlag handling:**
   - Frontend: `detail.maintenanceFlag ? 1 : 0`
   - Issue: If `maintenanceFlag` is `undefined`, sends `0` (which is correct)
   - ✅ **No fix needed**

3. **maxRetryCount/retryDelay handling:**
   - Frontend: `detail.maxRetryCount || 0`
   - Issue: If value is `0`, it will still send `0` (correct), but if `undefined`, sends `0`
   - ✅ **No fix needed** - defaults are acceptable

4. **Missing fields:**
   - Frontend doesn't send empty/undefined fields (which is correct due to `@JsonInclude(NON_EMPTY)`)
   - ✅ **No fix needed**

---

## Recommended Fixes

### Fix 1: httpStatusCode Handling

**Current Code (api.ts:746):**
```typescript
httpStatusCode: detail.httpStatusCode?.toString(),
```

**Fixed Code:**
```typescript
httpStatusCode: detail.httpStatusCode !== undefined ? detail.httpStatusCode.toString() : undefined,
```

OR better - omit if undefined (already handled by JSON serialization, but explicit is better):
```typescript
...(detail.httpStatusCode !== undefined && { httpStatusCode: detail.httpStatusCode.toString() }),
```

---

## Schema Escaping Verification

### Frontend to Backend Flow ✅

1. **User Input**: Pretty JSON string (e.g., `{"type":"object"}`)
2. **Frontend Processing**: 
   - Parse: `JSON.parse(input)` → Object
   - Double-stringify: `JSON.stringify(JSON.stringify(object))` → `"{\"type\":\"object\"}"`
3. **Backend Receives**: Double-escaped JSON string ✅
4. **Backend Stores**: In MongoDB/Redis with escape chars ✅

### Backend to Frontend Flow ✅

1. **Backend Retrieves**: XML with escaped JSON from MongoDB
2. **Frontend Parses**: 
   - Extract from XML: `"{\"type\":\"object\"}"`
   - Unescape: `JSON.parse(JSON.parse(escaped))` → Object
   - Format: `JSON.stringify(object, null, 2)` → Pretty JSON
3. **User Sees**: Clean, formatted JSON ✅

---

## Summary

### ✅ Correctly Implemented:
- Header schema escaping (double-stringify)
- Payload schema escaping (double-stringify)
- Schema unescaping when fetching from MongoDB
- All downstream detail fields mapping
- HTTP method (PUT)
- Endpoint path (`/updateonp`)
- Headers (trackingId, environment, requestCriteria, Authorization)

### ⚠️ Needs Fix:
- **httpStatusCode**: Should handle `undefined` explicitly to avoid sending `undefined` string

### ✅ Verified:
- Backend endpoint accepts same structure as onboard endpoint
- Both endpoints use `ONPEventRequest` and `DownstreamDetail`
- Response structure matches (`ONPEventResponse`)

