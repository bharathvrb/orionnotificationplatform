# Backend API Request Details

This document outlines all the details passed to each backend API endpoint in the Orion Notification Platform application.

## Table of Contents
1. [Onboard ONP API](#1-onboard-onp-api)
2. [Kafka Details API](#2-kafka-details-api)
3. [MongoDB Details API](#3-mongodb-details-api)
4. [SAT Token API](#4-sat-token-api)
5. [Common Headers](#common-headers)

---

## 1. Onboard ONP API

**Endpoint:** `POST /api/onboardonp`

### Headers
All headers are automatically added to the request:

| Header Name | Description | Source | Required | Example |
|------------|-------------|--------|----------|---------|
| `Authorization` | Bearer token from SSO/auth | Auto-added by axios interceptor | Yes | `Bearer <token>` |
| `trackingId` | Unique tracking identifier | Auto-generated if not provided | Yes | `onboard-1234567890-abc123xyz` |
| `environment` | Target environment | From form selection | Conditional* | `DEV AS-G8` |
| `requestCriteria` | Comma-separated list of criteria | From form checkboxes | Yes | `mongodbandredis,kafkatopic` |
| `commitMessage` | Git commit message | From form input | Conditional** | `Add new event schema` |
| `gitAccessToken` | Git access token | From form input | Conditional** | `<token>` |
| `Authorization` (custom) | Custom authorization token | From form input or generated | Conditional*** | `Bearer <custom-token>` |

\* Required when environment is selected in form  
\** Required when `deploymentmanifest` or `orionproperties` criteria are selected  
\*** Required for all requests (can be generated via SAT token modal)

**⚠️ Important Note on Authorization Header:**
- The axios interceptor automatically adds `Authorization: Bearer <SSO-token>` to all requests
- The `onboardOnp` function also sets `Authorization` header from `request.authorization` (custom token)
- **The custom authorization token overwrites the SSO token** when both are present
- Only **one** Authorization header is actually sent (the custom one takes precedence)
- This means the SSO token is effectively ignored when a custom authorization token is provided

### Request Body

The request body is a JSON object with the following structure:

```json
{
  "eventName": "string",
  "headerSchema": "string (JSON stringified)",
  "payloadSchema": "string (JSON stringified)",
  "downstreamDetails": [
    {
      "name": "string",
      "endpoint": "string",
      "clientId": "string",
      "clientSecret": "string",
      "scope": "string",
      "httpStatusCode": "string",
      "maintenanceFlag": 0 or 1,
      "maxRetryCount": 0,
      "retryDelay": 0
    }
  ],
  "subscriberName": "string",
  "numPartitions": 1,
  "replicationFactor": 1
}
```

### Field Details

| Field | Type | Required When | Description | Example |
|-------|------|---------------|-------------|---------|
| `eventName` | string | `mongodbandredis` selected | Event name identifier | `"OrderUpdateEvent"` |
| `headerSchema` | string (JSON) | `mongodbandredis` selected | JSON schema for event headers (stringified) | `"{\"type\":\"object\",\"properties\":{}}"` |
| `payloadSchema` | string (JSON) | `mongodbandredis` selected | JSON schema for event payloads (stringified) | `"{\"type\":\"object\",\"properties\":{}}"` |
| `subscriberName` | string | Multiple criteria | Subscriber identifier | `"order-service"` |
| `numPartitions` | number | `kafkatopic` selected | Number of Kafka partitions | `3` |
| `replicationFactor` | number | `kafkatopic` selected | Kafka replication factor | `2` |
| `downstreamDetails` | array | `mongodbandredis` or `fallbackdb` selected | Array of downstream configurations | See below |

### Downstream Details Structure

Each item in `downstreamDetails` array contains:

| Field | Type | Required | Description | Notes |
|-------|------|----------|-------------|-------|
| `name` | string | Yes | Downstream service name | - |
| `endpoint` | string | Conditional* | API endpoint URL | Required for `mongodbandredis` |
| `clientId` | string | Conditional* | OAuth client ID | Required for `mongodbandredis` |
| `clientSecret` | string | Conditional* | OAuth client secret | Required for `mongodbandredis` |
| `scope` | string | Conditional* | OAuth scope | Required for `mongodbandredis` |
| `httpStatusCode` | string | Conditional** | HTTP status code | Required for `fallbackdb`, converted to string |
| `maintenanceFlag` | number (0 or 1) | No | Maintenance mode flag | Boolean converted to 0/1 |
| `maxRetryCount` | number | No | Maximum retry attempts | Defaults to 0 |
| `retryDelay` | number | No | Retry delay in milliseconds | Defaults to 0 |

\* Required when `mongodbandredis` is selected  
\** Required when `fallbackdb` is selected

### Request Criteria Values

The `requestCriteria` header accepts comma-separated values from:
- `mongodbandredis`
- `kafkatopic`
- `deploymentmanifest`
- `orionproperties`
- `fallbackdb`
- `concoursevault`

### Example Request

```http
POST /api/onboardonp HTTP/1.1
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
trackingId: onboard-1704123456789-xyz789abc
environment: DEV AS-G8
requestCriteria: mongodbandredis,kafkatopic
commitMessage: Initial event onboarding
gitAccessToken: ghp_xxxxxxxxxxxxx
Authorization: Bearer custom-auth-token-here

{
  "eventName": "OrderUpdateEvent",
  "headerSchema": "{\"type\":\"object\",\"properties\":{\"correlationId\":{\"type\":\"string\"}}}",
  "payloadSchema": "{\"type\":\"object\",\"properties\":{\"orderId\":{\"type\":\"string\"}}}",
  "subscriberName": "order-service",
  "numPartitions": 3,
  "replicationFactor": 2,
  "downstreamDetails": [
    {
      "name": "payment-service",
      "endpoint": "https://api.example.com/payment",
      "clientId": "client-123",
      "clientSecret": "secret-456",
      "scope": "payment.write",
      "maintenanceFlag": 0,
      "maxRetryCount": 3,
      "retryDelay": 1000
    }
  ]
}
```

---

## 2. Kafka Details API

**Endpoint:** `POST /api/kafkaDetails`

### Headers

| Header Name | Description | Source | Required | Example |
|------------|-------------|--------|----------|---------|
| `Authorization` | Bearer token from SSO/auth | Auto-added by axios interceptor | Yes | `Bearer <token>` |
| `trackingId` | Unique tracking identifier | Auto-generated if not provided | Yes | `kafka-details-1704123456789` |
| `environment` | Target environment | From form selection | Conditional* | `DEV AS-G8` |

\* Required when environment is selected in form

### Request Body

```json
{
  "topicNames": ["string"]
}
```

### Field Details

| Field | Type | Required | Description | Example |
|-------|------|----------|-------------|---------|
| `topicNames` | array of strings | Yes | Array of Kafka topic names to query | `["onp-cbgupdate-topic", "onp-order-topic"]` |

### Example Request

```http
POST /api/kafkaDetails HTTP/1.1
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
trackingId: kafka-details-1704123456789
environment: DEV AS-G8

{
  "topicNames": [
    "onp-cbgupdate-topic",
    "onp-order-topic",
    "onp-payment-topic"
  ]
}
```

---

## 3. MongoDB Details API

**Endpoint:** `POST /api/mongoDBDetails`

### Headers

| Header Name | Description | Source | Required | Example |
|------------|-------------|--------|----------|---------|
| `Authorization` | Bearer token from SSO/auth | Auto-added by axios interceptor | Yes | `Bearer <token>` |
| `trackingId` | Unique tracking identifier | Auto-generated if not provided | Yes | `mongodb-details-1704123456789` |
| `environment` | Target environment | From form selection | Conditional* | `DEV AS-G8` |

\* Required when environment is selected in form

### Request Body

```json
{
  "eventNames": ["string"]
}
```

### Field Details

| Field | Type | Required | Description | Example |
|-------|------|----------|-------------|---------|
| `eventNames` | array of strings | Yes | Array of event names to query, or `["ALL"]` for all events | `["OrderUpdateEvent", "PaymentEvent"]` or `["ALL"]` |

**Note:** When "Fetch All Events" is selected in the UI, the request body will contain `["ALL"]` instead of individual event names.

### Example Request

```http
POST /api/mongoDBDetails HTTP/1.1
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
trackingId: mongodb-details-1704123456789
environment: DEV AS-G8

{
  "eventNames": [
    "OrderUpdateEvent",
    "PaymentEvent",
    "ShippingEvent"
  ]
}
```

**Or for fetching all events:**

```http
POST /api/mongoDBDetails HTTP/1.1
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
trackingId: mongodb-details-1704123456789
environment: DEV AS-G8

{
  "eventNames": ["ALL"]
}
```

---

## 4. SAT Token API

**Endpoint:** Varies by environment (see below)

This API is used to generate OAuth2 tokens for authorization. The endpoint URL depends on the selected environment.

### Endpoint URLs by Environment

| Environment | Endpoint URL |
|------------|--------------|
| `STG CH2-G2`, `STG HO-G4` | `https://sat-stg.codebig2.net/v2/ws/token.oauth2` |
| `PROD G1`, `PROD AS-G6`, `PROD HO-G1`, `PROD HO-G3` | `https://sat-prod.codebig2.net/v2/ws/token.oauth2` |
| All others (DEV, QA, INT, FLX, TRN, BUS) | `https://sat-ci.codebig2.net/v2/ws/token.oauth2` |

### Headers

| Header Name | Description | Required | Example |
|------------|-------------|----------|---------|
| `Content-Type` | Form data content type | Yes | `application/x-www-form-urlencoded` |

### Request Body (Form Data)

The request is sent as `application/x-www-form-urlencoded` with the following parameters:

| Parameter | Type | Required | Description | Example |
|-----------|------|----------|-------------|---------|
| `grant_type` | string | Yes | OAuth2 grant type | `client_credentials` |
| `client_id` | string | Yes | OAuth2 client ID | `my-client-id` |
| `client_secret` | string | Yes | OAuth2 client secret | `my-client-secret` |
| `scope` | string | Yes | OAuth2 scope | `api.read api.write` |

### Example Request

```http
POST https://sat-ci.codebig2.net/v2/ws/token.oauth2 HTTP/1.1
Content-Type: application/x-www-form-urlencoded

grant_type=client_credentials&client_id=my-client-id&client_secret=my-client-secret&scope=api.read%20api.write
```

### Response

The API returns an OAuth2 token response:

```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "Bearer",
  "expires_in": 3600,
  "scope": "api.read api.write"
}
```

The `access_token` from this response is then used as the `Authorization` header value (with "Bearer " prefix) in other API requests.

---

## Common Headers

All API requests (except SAT Token API) include the following common headers:

### Authorization Header
- **Source:** Automatically added by axios interceptor
- **Method:** Retrieved from `getValidAccessToken()` function
- **Format:** `Bearer <token>`
- **Storage:** Stored in localStorage under key `onp_tokens`
- **Expiration:** Tokens expire after 24 hours (configurable)

**Authorization Header Behavior by API:**
- **Kafka Details API:** ✅ Receives `Authorization: Bearer <SSO-token>` from interceptor only
- **MongoDB Details API:** ✅ Receives `Authorization: Bearer <SSO-token>` from interceptor only
- **Onboard ONP API:** ⚠️ Receives `Authorization: Bearer <custom-token>` (custom token from form overwrites SSO token)
  - If `request.authorization` is provided, it overrides the SSO token
  - If not provided, the SSO token from interceptor is used

### Tracking ID
- **Format:** Auto-generated with pattern: `<service>-<timestamp>-<random-string>`
- **Examples:**
  - Onboard: `onboard-1704123456789-abc123xyz`
  - Kafka: `kafka-details-1704123456789`
  - MongoDB: `mongodb-details-1704123456789`

### Environment Header
- **Values:** One of the predefined environment values (see types)
- **Available Environments:**
  - `DEV AS-G8`, `DEV HO-G2`
  - `QA AS-G8`, `QA HO-G2`
  - `INT AS-G8`, `INT HO-G2`
  - `FLX AS-G8`, `FLX HO-G2`
  - `TRN AS-G8`, `TRN HO-G2`
  - `STG CH2-G2`, `STG HO-G4`
  - `PROD G1`, `PROD AS-G6`, `PROD HO-G1`, `PROD HO-G3`
  - `BUS AS-G8`, `BUS HO-G2`

---

## Data Transformations

### Schema Stringification
- `headerSchema` and `payloadSchema` are always sent as JSON strings, even if provided as objects
- The API service automatically stringifies JSON objects before sending

### Boolean to Integer Conversion
- `maintenanceFlag` is converted from boolean to integer (0 or 1)
- `true` → `1`, `false` → `0`

### Number to String Conversion
- `httpStatusCode` is converted from number to string for backend compatibility

### Array Joining
- `requestCriteria` array is joined with commas for the header: `["a", "b"]` → `"a,b"`

---

## Error Handling

All API calls include error handling:
- Network errors are caught and wrapped in user-friendly messages
- Backend error responses are parsed and displayed
- Validation errors are shown before submission
- Token expiration is automatically detected and handled

---

## Notes

1. **Base URL:** The API base URL is configurable via `VITE_API_BASE_URL` environment variable. If not set, defaults to `/api` (proxied through Express server).

2. **CORS:** In production, requests are proxied through the Express server to avoid CORS issues.

3. **Token Management:** Access tokens are stored in localStorage and automatically refreshed when expired.

4. **Request Validation:** Frontend validation ensures required fields are present before API calls are made.

5. **Tracking IDs:** All requests include tracking IDs for request correlation and debugging.

