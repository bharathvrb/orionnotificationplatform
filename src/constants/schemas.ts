/**
 * Default JSON schema for MongoDB Header Schema.
 * Used when the user has not entered a custom schema; fully editable.
 */
export const DEFAULT_MONGODB_HEADER_SCHEMA = `{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "definitions": {},
  "id": "http://example.com/example.json",
  "type": "object",
  "properties": {
    "trackingId": {
      "type": "string",
      "minLength": 1
    },
    "eventName": {
      "type": "string",
      "minLength": 1
    },
    "source": {
      "type": "string",
      "minLength": 1
    }
  },
  "required": ["trackingId", "eventName", "source"]
}`;
