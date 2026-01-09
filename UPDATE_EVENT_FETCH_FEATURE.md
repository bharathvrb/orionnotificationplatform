# Update Event - Auto-Fetch Feature

## Overview
Enhanced the Update Event form to automatically fetch and pre-populate event details from MongoDB when the user enters an event name. This improves user experience by eliminating the need to manually enter all fields.

## Changes Made

### Frontend Changes

#### File: `src/components/UpdateEventForm.tsx`

**New Features:**
1. **Auto-Fetch Event Details**
   - Added "📥 Fetch Details" button next to Event Name input
   - Fetches event details from MongoDB when:
     - Event name is entered
     - Environment is selected
     - Authorization token is provided
   - Shows loading state during fetch
   - Displays success/error messages

2. **Schema Parsing**
   - Added `parseSchemaDefinition()` function to extract and unescape header/payload schemas from XML
   - Handles double-escaped JSON strings from MongoDB
   - Formats JSON with proper indentation for display

3. **Form Pre-Population**
   - Pre-populates all fields with fetched data:
     - Event Name (from eventType)
     - Subscriber Name (extracted from topic)
     - Header Schema (unescaped and formatted)
     - Payload Schema (unescaped and formatted)
     - Downstream Details (with authorization info)

4. **Downstream Details Mapping**
   - Maps downstream details from MongoDB response
   - Includes authorization data (clientId, clientSecret, scope)
   - Stores decoded values in form for easy editing
   - Automatically encodes to base64 before sending to backend

5. **Base64 Encoding Handling**
   - Stores decoded values in form (user-friendly)
   - Automatically encodes to base64 in `handleSubmit` before sending
   - Handles both already-encoded and plain text values

**New State Variables:**
- `isFetchingEvent`: Loading state for fetch operation
- `fetchError`: Error message for fetch failures
- `eventFetched`: Flag indicating if event was successfully fetched

**New Functions:**
- `parseSchemaDefinition()`: Parses XML schema definition and unescapes JSON
- `handleFetchEventDetails()`: Fetches event details and pre-populates form

### Backend Changes

**No backend changes required!**
- Uses existing `/mongoDBDetails` endpoint
- Uses existing `fetchMongoDBDetails()` API function
- Backend already supports fetching event details by eventName

## User Flow

### Before (Old Flow):
1. User selects environment
2. User enters authorization token
3. User manually enters:
   - Event Name
   - Subscriber Name
   - Header Schema (JSON)
   - Payload Schema (JSON)
   - Downstream Details (all fields)
4. User clicks "Update Event"

### After (New Flow):
1. User selects environment
2. User enters authorization token
3. User enters Event Name
4. User clicks "📥 Fetch Details" button
5. System automatically:
   - Fetches event details from MongoDB
   - Parses and unescapes schemas
   - Pre-populates all form fields
6. User can:
   - Edit any pre-populated fields
   - Add new downstream details
   - Remove existing downstream details
   - Modify existing downstream details
7. User clicks "Update Event"

## Features

### ✅ Auto-Fetch
- Fetches event details when eventName, environment, and authorization are provided
- Shows loading spinner during fetch
- Displays success message when data is loaded
- Shows error message if event not found or fetch fails

### ✅ Pre-Population
- All fields automatically populated with existing data
- Schemas are unescaped and formatted for easy editing
- Downstream details include all authorization information

### ✅ Editing Capabilities
- Users can edit any pre-populated field
- Users can add new downstream details
- Users can remove existing downstream details
- Users can modify existing downstream details

### ✅ Base64 Encoding
- Form stores decoded values (user-friendly)
- Automatically encodes to base64 before sending
- Handles both encoded and plain text inputs

### ✅ Error Handling
- Validates eventName, environment, and authorization before fetch
- Shows clear error messages
- Handles network errors gracefully
- Handles "event not found" scenarios

## Technical Details

### Schema Parsing
The `parseSchemaDefinition()` function:
1. Extracts HeaderAttributes from XML
2. Extracts Payload Schema from XML
3. Unescapes double-escaped JSON strings
4. Formats JSON with proper indentation
5. Returns clean, editable JSON strings

### Downstream Details Mapping
1. Iterates through `downstreamDetails` from MongoDB response
2. Extracts downstream information (name, endpoint)
3. Extracts authorization information (clientId, clientSecret, scope)
4. Maps to `DownstreamDetail` format
5. Stores decoded values for editing

### Base64 Encoding
- **In Form**: Stores decoded values (from MongoDB Authorization object)
- **On Submit**: Encodes to base64 before sending to backend
- **Smart Detection**: Checks if value is already encoded before encoding again

## Impact Analysis

### ✅ No Breaking Changes
- Existing update flow still works
- Users can still manually enter all fields if desired
- Backend endpoints unchanged
- No impact on other forms or features

### ✅ Improved UX
- Reduces manual data entry
- Eliminates copy-paste errors
- Shows existing data for reference
- Allows incremental updates

### ✅ Data Integrity
- Fetches from source of truth (MongoDB)
- Properly unescapes schemas
- Maintains data format consistency
- Handles edge cases gracefully

## Testing Recommendations

1. **Happy Path**:
   - Enter valid eventName
   - Click "Fetch Details"
   - Verify all fields are populated
   - Edit some fields
   - Submit update
   - Verify update succeeds

2. **Error Cases**:
   - Enter non-existent eventName
   - Verify error message
   - Enter eventName without environment
   - Verify validation message
   - Enter eventName without authorization
   - Verify validation message

3. **Editing**:
   - Fetch event details
   - Edit header schema
   - Edit payload schema
   - Add new downstream detail
   - Remove existing downstream detail
   - Modify existing downstream detail
   - Submit update
   - Verify all changes are saved

4. **Edge Cases**:
   - Event with no downstream details
   - Event with malformed schemas
   - Event with missing authorization
   - Multiple downstream details

## Future Enhancements

1. **Auto-fetch on eventName change**: Automatically fetch when eventName is entered (with debounce)
2. **Cache fetched data**: Store fetched data to avoid re-fetching
3. **Compare view**: Show diff between original and edited values
4. **Validation on fetch**: Validate fetched data before pre-populating
5. **Bulk update**: Support updating multiple events at once

