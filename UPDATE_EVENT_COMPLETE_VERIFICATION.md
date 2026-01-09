# Update Event Auto-Fetch Feature - Complete Verification

## Frontend and Backend Cross-Verification

### ✅ Backend Verification

#### 1. Endpoint: `/mongoDBDetails` (POST)
**Location**: `OnpController.java` (lines 217-237)
- **Method**: POST
- **Path**: `/onp/v1/mongoDBDetails`
- **Headers**: 
  - `trackingId` (required)
  - `environment` (optional)
  - `Authorization` (optional, but required for authenticated requests)
- **Request Body**: `MongoDBDetailsRequest` with `eventNames: string[]`
- **Response**: `MongoDBDetailsResponse` with `eventDetails: EventDetail[]`
- **Status**: ✅ **VERIFIED** - Endpoint exists and works correctly

#### 2. Service: `MongoDBDetailsService.getMongoDBDetails()`
**Location**: `MongoDBDetailsService.java` (lines 60-216)
- **Functionality**:
  - Fetches NotificationSchema from MongoDB by eventType
  - Links downstream with authorization by credentialsId
  - Fetches Redis data (notificationSchema and authorizations)
  - Returns complete event details with all relationships
- **Returns**:
  - `mongoDBData.schemaDefinition`: XML string with escaped JSON
  - `downstreamDetails`: Array of `DownstreamDetailWithAuth`
    - `downstream`: Downstream object (name, endpoint, etc.)
    - `authorization`: Authorization object with **decoded** clientId/clientSecret
- **Status**: ✅ **VERIFIED** - Service correctly returns all required data

#### 3. Authorization Data Format
**Location**: `ONPActivator.java` (lines 652-653)
- **Storage**: Authorization stored with **decoded** clientId/clientSecret
  ```java
  authorization.setClientId(new String(Base64.getDecoder().decode(downstreamDetail.getClientId())));
  authorization.setClientSecret(new String(Base64.getDecoder().decode(downstreamDetail.getClientSecret())));
  ```
- **Retrieval**: MongoDBDetailsService returns Authorization with **decoded** values
- **Status**: ✅ **VERIFIED** - Backend stores and returns decoded values

#### 4. Schema Definition Format
**Location**: `ONPActivator.java` (lines 527-531)
- **Storage**: XML string with escaped JSON inside
  ```java
  "<NotificationSchema><Header><HeaderAttributes>"
      + onpEventRequest.getHeaderSchema()  // "{\"type\":\"object\"}"
      + "</HeaderAttributes></Header><Payload><Schema>"
      + onpEventRequest.getPayloadSchema()  // "{\"type\":\"object\"}"
      + "</Schema></Payload></NotificationSchema>"
  ```
- **Retrieval**: MongoDBDetailsService returns schemaDefinition as-is
- **Status**: ✅ **VERIFIED** - Backend stores and returns XML with escaped JSON

#### 5. Topic Format
**Location**: `ONPActivator.java` (line 526)
- **Creation**: `subscriberName.replace("service", "topic")`
  - Example: "onp-subscriber-service" → "onp-subscriber-topic"
- **Reversal**: `topic.replace("topic", "service")`
  - Example: "onp-subscriber-topic" → "onp-subscriber-service"
- **Status**: ✅ **VERIFIED** - Topic format is consistent

---

### ✅ Frontend Verification

#### 1. API Call: `fetchMongoDBDetails()`
**Location**: `api.ts` (lines 506-670)
- **Endpoint**: `/onp/v1/mongoDBDetails`
- **Method**: POST
- **Headers**: 
  - `trackingId` (auto-generated)
  - `environment` (from form)
  - `Authorization` (from form)
- **Request Body**: `{ eventNames: [eventName] }`
- **Response**: `MongoDBDetailsResponse`
- **Status**: ✅ **VERIFIED** - API call is correct

#### 2. Schema Parsing: `parseSchemaDefinition()`
**Location**: `UpdateEventForm.tsx` (lines 145-230)
- **Functionality**:
  - Extracts HeaderAttributes from XML
  - Extracts Payload Schema from XML
  - Unescapes double-escaped JSON strings
  - Formats JSON with proper indentation
- **Input**: XML string with escaped JSON
- **Output**: Clean JSON strings for header and payload
- **Status**: ✅ **VERIFIED** - Parsing logic is correct

#### 3. Form Pre-Population: `handleFetchEventDetails()`
**Location**: `UpdateEventForm.tsx` (lines 232-320)
- **Functionality**:
  - Fetches event details from MongoDB
  - Parses schemas from XML
  - Extracts subscriber name from topic
  - Maps downstream details with authorization
  - Pre-populates all form fields
- **Status**: ✅ **VERIFIED** - Pre-population logic is correct

#### 4. Downstream Details Mapping
**Location**: `UpdateEventForm.tsx` (lines 273-295)
- **Source**: `eventDetail.downstreamDetails[]` (from backend)
- **Mapping**:
  - `downstream.downstreamName` → `detail.name`
  - `downstream.endpoint` → `detail.endpoint`
  - `authorization.clientId` → `detail.clientId` (decoded)
  - `authorization.clientSecret` → `detail.clientSecret` (decoded)
  - `authorization.scope` → `detail.scope`
- **Status**: ✅ **VERIFIED** - Mapping is correct

#### 5. Base64 Encoding: `handleSubmit()`
**Location**: `UpdateEventForm.tsx` (lines 374-399)
- **Functionality**:
  - Checks if clientId/clientSecret are already encoded
  - Encodes to base64 if not already encoded
  - Sends encoded values to backend
- **Backend Expectation**: Base64 encoded values (ONPActivator lines 701, 709)
- **Status**: ✅ **VERIFIED** - Encoding logic is correct

#### 6. Subscriber Name Extraction
**Location**: `UpdateEventForm.tsx` (lines 269-271)
- **Logic**: `topic.replace('topic', 'service')`
- **Example**: "onp-subscriber-topic" → "onp-subscriber-service"
- **Status**: ✅ **VERIFIED** - Extraction logic is correct

---

## Complete Data Flow Verification

### Flow 1: Fetch Event Details

```
1. User enters eventName → Frontend
2. User clicks "Fetch Details" → Frontend
3. Frontend calls fetchMongoDBDetails({ eventNames: [eventName] }) → API
4. API sends POST /onp/v1/mongoDBDetails → Backend
5. Backend MongoDBDetailsService.getMongoDBDetails() → Service
6. Service queries MongoDB by eventType → MongoDB
7. Service queries Authorization by credentialsId → MongoDB
8. Service queries Redis for notificationSchema → Redis
9. Service returns MongoDBDetailsResponse → Backend
10. Backend returns response → API
11. Frontend receives response → UpdateEventForm
12. Frontend parses schemaDefinition (XML → JSON) → parseSchemaDefinition()
13. Frontend extracts subscriberName from topic → topic.replace('topic', 'service')
14. Frontend maps downstreamDetails with authorization → handleFetchEventDetails()
15. Frontend pre-populates form fields → updateRequest()
16. User sees pre-populated form → UI
```

**Status**: ✅ **ALL STEPS VERIFIED**

### Flow 2: Update Event

```
1. User edits pre-populated fields → Frontend
2. User adds/removes/modifies downstream details → Frontend
3. User clicks "Update Event" → Frontend
4. Frontend encodes clientId/clientSecret to base64 → handleSubmit()
5. Frontend calls updateOnp(request) → API
6. API sends PUT /onp/v1/updateonp → Backend
7. Backend ONPActivator.updateMongoDBAndRedis() → Service
8. Backend validates request → ONPValidatorUtils
9. Backend decodes base64 clientId/clientSecret → ONPActivator (lines 701, 709)
10. Backend updates NotificationSchema in MongoDB → MongoDB
11. Backend updates Authorization in MongoDB → MongoDB
12. Backend updates Redis cache → Redis
13. Backend returns response → API
14. Frontend displays results → UI
```

**Status**: ✅ **ALL STEPS VERIFIED**

---

## Data Format Verification

### Schema Format

**Storage (MongoDB)**:
```
<NotificationSchema>
  <Header>
    <HeaderAttributes>"{\"type\":\"object\"}"</HeaderAttributes>
  </Header>
  <Payload>
    <Schema>"{\"type\":\"object\"}"</Schema>
  </Payload>
</NotificationSchema>
```

**Display (Frontend)**:
```json
{
  "type": "object",
  "properties": {
    ...
  }
}
```

**Status**: ✅ **VERIFIED** - Formats are correct

### Authorization Format

**Storage (MongoDB)**:
- `clientId`: Decoded string (e.g., "my-client-id")
- `clientSecret`: Decoded string (e.g., "my-client-secret")

**Display (Frontend Form)**:
- `clientId`: Decoded string (user-friendly)
- `clientSecret`: Decoded string (user-friendly)

**Send to Backend**:
- `clientId`: Base64 encoded (e.g., "bXktY2xpZW50LWlk")
- `clientSecret`: Base64 encoded (e.g., "bXktY2xpZW50LXNlY3JldA==")

**Status**: ✅ **VERIFIED** - Formats are correct

### Downstream Details Format

**From Backend**:
```json
{
  "downstream": {
    "downstreamName": "downstream1",
    "endpoint": "https://example.com",
    "credentialsId": "123"
  },
  "authorization": {
    "clientId": "decoded-client-id",
    "clientSecret": "decoded-client-secret",
    "scope": "read write"
  }
}
```

**In Frontend Form**:
```json
{
  "name": "downstream1",
  "endpoint": "https://example.com",
  "clientId": "decoded-client-id",
  "clientSecret": "decoded-client-secret",
  "scope": "read write"
}
```

**Send to Backend**:
```json
{
  "name": "downstream1",
  "endpoint": "https://example.com",
  "clientId": "ZGVjb2RlZC1jbGllbnQtaWQ=",  // base64 encoded
  "clientSecret": "ZGVjb2RlZC1jbGllbnQtc2VjcmV0",  // base64 encoded
  "scope": "read write"
}
```

**Status**: ✅ **VERIFIED** - Formats are correct

---

## Edge Cases Verification

### ✅ Case 1: Event Not Found
- **Backend**: Returns empty `eventDetails[]` or `status: "Failure"`
- **Frontend**: Shows error message "Event not found"
- **Status**: ✅ **HANDLED**

### ✅ Case 2: No Downstream Details
- **Backend**: Returns empty `downstreamDetails[]`
- **Frontend**: Pre-populates with empty array, user can add new
- **Status**: ✅ **HANDLED**

### ✅ Case 3: No Authorization for Downstream
- **Backend**: Returns `downstreamDetails` with `authorization: null`
- **Frontend**: Pre-populates downstream without clientId/clientSecret
- **Status**: ✅ **HANDLED**

### ✅ Case 4: Malformed Schema
- **Backend**: Returns schemaDefinition as-is
- **Frontend**: parseSchemaDefinition() handles gracefully, shows cleaned version
- **Status**: ✅ **HANDLED**

### ✅ Case 5: Already Encoded Values
- **Frontend**: Checks if value is base64 before encoding
- **Status**: ✅ **HANDLED**

---

## Backend Changes Required

### ❌ NO BACKEND CHANGES NEEDED!

**Reasoning**:
1. ✅ `/mongoDBDetails` endpoint already exists and works
2. ✅ `MongoDBDetailsService` already returns all required data
3. ✅ Authorization data is already decoded (as stored in MongoDB)
4. ✅ Schema definition is already in correct format (XML with escaped JSON)
5. ✅ Downstream details are already linked with authorization
6. ✅ Environment-specific connections are already supported

**Conclusion**: Backend is **already fully functional** for this feature!

---

## Frontend Changes Summary

### ✅ Changes Made

1. **Added Auto-Fetch Functionality**
   - `handleFetchEventDetails()` function
   - "📥 Fetch Details" button
   - Loading and error states

2. **Added Schema Parsing**
   - `parseSchemaDefinition()` function
   - Unescapes double-escaped JSON
   - Formats JSON for display

3. **Added Form Pre-Population**
   - Pre-populates all fields from fetched data
   - Maps downstream details with authorization
   - Extracts subscriber name from topic

4. **Added Base64 Encoding**
   - Encodes clientId/clientSecret before sending
   - Handles both encoded and plain text values

5. **Improved UX**
   - Success/error messages
   - Loading indicators
   - Validation before fetch

---

## Final Verification Checklist

### Backend ✅
- [x] `/mongoDBDetails` endpoint exists and works
- [x] Returns complete event details
- [x] Returns decoded authorization values
- [x] Returns schemaDefinition in XML format
- [x] Links downstream with authorization
- [x] Supports environment-specific connections
- [x] Handles errors gracefully

### Frontend ✅
- [x] Calls `/mongoDBDetails` endpoint correctly
- [x] Parses schemaDefinition correctly
- [x] Extracts subscriber name correctly
- [x] Maps downstream details correctly
- [x] Pre-populates all form fields
- [x] Encodes base64 before sending
- [x] Handles errors gracefully
- [x] Shows loading states
- [x] Validates prerequisites

### Data Flow ✅
- [x] Fetch flow works end-to-end
- [x] Update flow works end-to-end
- [x] Schema escaping/unescaping works
- [x] Base64 encoding/decoding works
- [x] Downstream details mapping works

---

## Conclusion

✅ **NO BACKEND CHANGES REQUIRED**

The backend is already fully functional and returns all required data in the correct format. The frontend changes are complete and properly handle:
- Fetching event details
- Parsing and unescaping schemas
- Pre-populating form fields
- Encoding data before sending

**The feature is ready to use!** 🎉

