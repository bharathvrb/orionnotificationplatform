# Schema Escaping/Unescaping Flow Verification

## Complete Flow Analysis

### 1. STORAGE FLOW (Frontend → Backend → MongoDB/Redis)

#### Step 1: User Input (Frontend)
- **Location**: `InsertEventForm.tsx` / `UpdateEventForm.tsx`
- **User enters**: Clean JSON (e.g., `{"type": "object", "properties": {...}}`)
- **Format**: Plain JSON object string

#### Step 2: Frontend Sends to Backend
- **Location**: `src/services/api.ts` (lines 176-211)
- **Process**:
  1. Parse user input: `JSON.parse(request.headerSchema)` → Gets JSON object
  2. Double-stringify: `JSON.stringify(JSON.stringify(parsed))`
  3. **Result**: `"{\"type\":\"object\",\"properties\":{...}}"`
- **Format**: Double-escaped JSON string (JSON string containing escaped JSON)
- **Status**: ✅ CORRECT - Sends with escape chars

#### Step 3: Backend Receives and Validates
- **Location**: `ONPValidatorUtils.java` (lines 31-50)
- **Process**:
  1. Receives: `"{\"type\":\"object\",\"properties\":{...}}"`
  2. Parses as JSON string: Gets inner JSON string
  3. Validates inner JSON is valid
- **Status**: ✅ CORRECT - Validates escaped JSON properly

#### Step 4: Backend Stores in MongoDB
- **Location**: `ONPActivator.java` (lines 527-531)
- **Process**:
  1. Gets escaped string: `onpEventRequest.getHeaderSchema()` → `"{\"type\":\"object\"}"`
  2. Stores in XML: `<HeaderAttributes>"{\"type\":\"object\"}"</HeaderAttributes>`
  3. **MongoDB stores**: XML string with escaped JSON inside
- **Format**: XML with escaped JSON string
- **Status**: ✅ CORRECT - Stores WITH escape chars

#### Step 5: Backend Stores in Redis
- **Location**: `ONPActivator.java` (lines 126-132)
- **Process**:
  1. Gets NotificationSchema object (with schemaDefinition containing XML + escaped JSON)
  2. Serializes entire object: `objectMapper.writeValueAsString(notificationSchema)`
  3. **Redis stores**: JSON string of entire NotificationSchema object
  4. **Format**: `{"schemaId":"...","eventType":"...","schemaDefinition":"<NotificationSchema><Header><HeaderAttributes>\"{\\\"type\\\":\\\"object\\\"}\"</HeaderAttributes>...</NotificationSchema>"}`
- **Status**: ✅ CORRECT - Stores WITH escape chars (double-escaped in JSON)

---

### 2. RETRIEVAL FLOW (MongoDB/Redis → Backend → Frontend)

#### Step 1: Backend Retrieves from MongoDB
- **Location**: `MongoDBDetailsService.java` (line 129)
- **Process**:
  1. Gets NotificationSchema from MongoDB
  2. Extracts schemaDefinition: `notificationSchema.getSchemaDefinition()`
  3. **Returns**: XML string with escaped JSON inside
  4. **Format**: `<NotificationSchema><Header><HeaderAttributes>"{\"type\":\"object\"}"</HeaderAttributes>...</NotificationSchema>`
- **Status**: ✅ CORRECT - Returns WITH escape chars

#### Step 2: Backend Retrieves from Redis
- **Location**: `MongoDBDetailsService.java` (lines 138-145)
- **Process**:
  1. Gets raw JSON string from Redis
  2. **Returns**: JSON string of NotificationSchema object
  3. **Format**: `{"schemaId":"...","schemaDefinition":"<NotificationSchema>..."}`
- **Status**: ✅ CORRECT - Returns WITH escape chars (in JSON format)

#### Step 3: Backend Sends to Frontend
- **Location**: `MongoDBDetailsResponse.java`
- **Process**:
  1. MongoDB data: Sets `mongoDBData.setSchemaDefinition(xmlStringWithEscapedJson)`
  2. Redis data: Sets `redisData.setNotificationSchema(jsonStringWithEscapedJson)`
  3. **Both contain escape chars**
- **Status**: ✅ CORRECT - Sends WITH escape chars

#### Step 4: Frontend Receives and Displays MongoDB Data
- **Location**: `MongoDBDetails.tsx` (lines 795-884)
- **Process**:
  1. Receives XML: `<NotificationSchema><Header><HeaderAttributes>"{\"type\":\"object\"}"</HeaderAttributes>...</NotificationSchema>`
  2. Extracts from XML: Gets `"{\"type\":\"object\"}"`
  3. Unescapes: `JSON.parse("{\"type\":\"object\"}")` → `{"type":"object"}`
  4. Formats: `JSON.stringify(parsed, null, 2)` → Pretty JSON
  5. **Displays**: Clean, formatted JSON
- **Status**: ✅ CORRECT - Unescapes for display

#### Step 5: Frontend Receives and Displays Redis Data
- **Location**: `MongoDBDetails.tsx` (lines 1025-1055)
- **Process**:
  1. Receives JSON string from Redis: `{"schemaId":"...","schemaDefinition":"<NotificationSchema>..."}`
  2. Parses JSON: Extracts `schemaDefinition` field
  3. Uses `parseSchemaDefinition()`: Same unescape logic as MongoDB
  4. Displays: Clean, formatted JSON for Header and Payload schemas
  5. Also shows: Full Redis JSON object for reference
- **Status**: ✅ CORRECT - Parses Redis JSON and unescapes schemaDefinition

---

## Verification Checklist

### Storage Flow ✅
- [x] Frontend sends double-escaped JSON string
- [x] Backend validates escaped JSON correctly
- [x] Backend stores in MongoDB with escape chars (in XML)
- [x] Backend stores in Redis with escape chars (in JSON object)

### Retrieval Flow ✅
- [x] Backend retrieves from MongoDB with escape chars
- [x] Backend retrieves from Redis with escape chars
- [x] Backend sends to frontend with escape chars
- [x] Frontend unescapes MongoDB data for display
- [x] Frontend unescapes Redis data for display

---

## Summary

**Storage**: ✅ **VERIFIED** - Schemas stored WITH escape chars in both MongoDB and Redis

**Retrieval**: ✅ **VERIFIED** - Schemas retrieved WITH escape chars and properly unescaped for display

**Display**: ✅ **FIXED** - Both MongoDB and Redis data are now properly unescaped and displayed as clean JSON

### Complete Flow Verification

1. **User Input** → Clean JSON
2. **Frontend Send** → Double-escaped JSON string (`"{\"type\":\"object\"}"`)
3. **Backend Store (MongoDB)** → XML with escaped JSON inside
4. **Backend Store (Redis)** → JSON object with escaped JSON in schemaDefinition
5. **Backend Retrieve** → Returns data WITH escape chars
6. **Frontend Display** → Unescapes and shows clean JSON

**All flows verified and working correctly!** ✅

