# API Request and Response Samples

This document provides comprehensive examples of requests and responses for each section of the Orion Notification Platform, showing both UI representation and backend API format for success and error scenarios.

---

## Table of Contents

1. [New Event Onboarding](#1-new-event-onboarding)
2. [View MongoDB and Redis Details](#2-view-mongodb-and-redis-details)
3. [View Kafka Details](#3-view-kafka-details)
4. [Update Event](#4-update-event)
5. [View Complete Event Information](#5-view-complete-event-information)

---

## 1. New Event Onboarding

### UI Request Format

**Form Fields:**
- Environment: `DEV AS-G8`
- Request Criteria: `MongoDB and Redis`, `Kafka Topic`
- Event Name: `OrderUpdateEvent`
- Subscriber Name: `order-service`
- Header Schema: `{"type":"object","properties":{"correlationId":{"type":"string"}}}`
- Payload Schema: `{"type":"object","properties":{"orderId":{"type":"string"},"status":{"type":"string"}}}`
- Number of Partitions: `3`
- Replication Factor: `2`
- Authorization Token: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
- Downstream Details:
  - Name: `payment-service`
  - Endpoint: `https://api.example.com/payment`
  - Client ID: `client-123`
  - Client Secret: `secret-456`
  - Scope: `payment.write`

### Backend Request Format

**HTTP Request:**
```http
POST /api/onboardonp HTTP/1.1
Host: onppoc-qa.as-g8.cf.comcast.net
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json
trackingId: onboard-1704123456789-abc123xyz
environment: DEV AS-G8
requestCriteria: mongodbandredis,kafkatopic
commitMessage: Initial event onboarding
gitAccessToken: ghp_xxxxxxxxxxxxx

{
  "eventName": "OrderUpdateEvent",
  "headerSchema": "{\"type\":\"object\",\"properties\":{\"correlationId\":{\"type\":\"string\"}}}",
  "payloadSchema": "{\"type\":\"object\",\"properties\":{\"orderId\":{\"type\":\"string\"},\"status\":{\"type\":\"string\"}}}",
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

### Success Response

#### Backend Response (HTTP 200)
```json
{
  "eventName": "OrderUpdateEvent",
  "mongoDBAndRedis": {
    "status": "Success",
    "message": "Successfully created MongoDB schema and Redis cache for OrderUpdateEvent"
  },
  "kafka": {
    "status": "Success",
    "message": "Successfully created Kafka topic 'onp-orderupdateevent-topic' with 3 partitions and replication factor 2"
  }
}
```

#### UI Display
```
✅ Success Banner:
   "Operation completed successfully! All 2 task(s) completed successfully in DEV AS-G8 environment."

📊 Task Results Summary:
   Total Tasks: 2
   Successful: 2
   Failed: 0
   Partial: 0

✅ Task Cards:
   ┌─────────────────────────────────────┐
   │ ✅ MongoDB and Redis                │
   │ Status: Success                     │
   │ Successfully created MongoDB schema │
   │ and Redis cache for OrderUpdateEvent│
   │ [View Raw]                          │
   └─────────────────────────────────────┘

   ┌─────────────────────────────────────┐
   │ ✅ Kafka Topic                      │
   │ Status: Success                     │
   │ Successfully created Kafka topic    │
   │ 'onp-orderupdateevent-topic' with   │
   │ 3 partitions and replication factor 2│
   │ [View Raw]                          │
   └─────────────────────────────────────┘
```

### Error Response

#### Backend Response (HTTP 400)
```json
{
  "eventName": "OrderUpdateEvent",
  "mongoDBAndRedis": {
    "status": "Failure",
    "message": "Event 'OrderUpdateEvent' already exists in MongoDB"
  },
  "kafka": {
    "status": "Success",
    "message": "Successfully created Kafka topic 'onp-orderupdateevent-topic'"
  }
}
```

#### UI Display
```
⚠️ Warning Banner:
   "Operation completed with errors. 1 task(s) failed, 1 succeeded in DEV AS-G8 environment. Please review the details below."

📊 Task Results Summary:
   Total Tasks: 2
   Successful: 1
   Failed: 1
   Partial: 0
   Status: Some Tasks Failed

❌ Task Cards:
   ┌─────────────────────────────────────┐
   │ ❌ MongoDB and Redis                │
   │ Status: Failure                     │
   │ Event 'OrderUpdateEvent' already    │
   │ exists in MongoDB                   │
   │ [View Raw]                          │
   └─────────────────────────────────────┘

   ┌─────────────────────────────────────┐
   │ ✅ Kafka Topic                      │
   │ Status: Success                     │
   │ Successfully created Kafka topic    │
   │ [View Raw]                          │
   └─────────────────────────────────────┘
```

#### Backend Error Response (HTTP 401)
```json
{
  "message": "Authentication failed. Invalid or expired token"
}
```

#### UI Display
```
❌ Error Banner:
   "[HTTP 401] Authentication failed. Please check your authorization token or generate a new one."
   Status: 401
   Environment: DEV AS-G8

📊 Task Results:
   ┌─────────────────────────────────────┐
   │ ❌ Operation Error                  │
   │ Status: Failure                     │
   │ [HTTP 401] Authentication failed.   │
   │ Invalid or expired token            │
   │ [View Raw]                          │
   └─────────────────────────────────────┘
```

---

## 2. View MongoDB and Redis Details

### UI Request Format

**Form Fields:**
- Environment: `DEV AS-G8`
- Authorization Token: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
- Event Names: `OrderUpdateEvent, PaymentEvent` OR
- Fetch All Events: ☑ (checkbox checked)

### Backend Request Format

**HTTP Request (Specific Events):**
```http
POST /api/mongoDBDetails HTTP/1.1
Host: onppoc-qa.as-g8.cf.comcast.net
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json
trackingId: mongodb-details-1704123456789
environment: DEV AS-G8

{
  "eventNames": [
    "OrderUpdateEvent",
    "PaymentEvent"
  ]
}
```

**HTTP Request (All Events):**
```http
POST /api/mongoDBDetails HTTP/1.1
Host: onppoc-qa.as-g8.cf.comcast.net
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json
trackingId: mongodb-details-1704123456789
environment: DEV AS-G8

{
  "eventNames": ["ALL"]
}
```

### Success Response

#### Backend Response (HTTP 200)
```json
{
  "status": "Success",
  "message": "Successfully retrieved event details",
  "eventDetails": [
    {
      "eventType": "OrderUpdateEvent",
      "mongoDBData": {
        "schemaId": "schema-12345",
        "eventType": "OrderUpdateEvent",
        "schemaType": "NotificationSchema",
        "topic": "onp-orderupdateevent-topic",
        "schemaDefinition": "{\"type\":\"object\",\"properties\":{\"orderId\":{\"type\":\"string\"},\"status\":{\"type\":\"string\"}}}",
        "createdDate": "2024-01-15T10:30:00Z",
        "updatedDate": "2024-01-20T14:45:00Z",
        "downstream": [
          {
            "downstreamId": "downstream-001",
            "downstreamName": "payment-service",
            "endpoint": "https://api.example.com/payment",
            "credentialsId": "cred-123",
            "createdTimestamp": "2024-01-15T10:35:00Z",
            "updateTimestamp": "2024-01-20T14:50:00Z",
            "authenticationType": "OAuth2"
          }
        ]
      },
      "redisData": {
        "notificationSchema": "{\"type\":\"object\",\"properties\":{\"orderId\":{\"type\":\"string\"},\"status\":{\"type\":\"string\"}}}",
        "authorizations": [
          "{\"downstreamId\":\"downstream-001\",\"clientId\":\"client-123\",\"scope\":\"payment.write\"}"
        ]
      },
      "downstreamDetails": [
        {
          "downstream": {
            "downstreamId": "downstream-001",
            "downstreamName": "payment-service",
            "endpoint": "https://api.example.com/payment",
            "credentialsId": "cred-123",
            "authenticationType": "OAuth2"
          },
          "authorization": {
            "downstreamId": "downstream-001",
            "credentialsId": "cred-123",
            "downstreamName": "payment-service",
            "clientId": "client-123",
            "clientSecret": "secret-456",
            "grantType": "client_credentials",
            "scope": "payment.write"
          }
        }
      ]
    },
    {
      "eventType": "PaymentEvent",
      "mongoDBData": {
        "schemaId": "schema-67890",
        "eventType": "PaymentEvent",
        "schemaType": "NotificationSchema",
        "topic": "onp-paymentevent-topic",
        "schemaDefinition": "{\"type\":\"object\",\"properties\":{\"paymentId\":{\"type\":\"string\"},\"amount\":{\"type\":\"number\"}}}",
        "createdDate": "2024-01-16T09:15:00Z",
        "updatedDate": "2024-01-21T11:20:00Z"
      },
      "redisData": {
        "notificationSchema": "{\"type\":\"object\",\"properties\":{\"paymentId\":{\"type\":\"string\"},\"amount\":{\"type\":\"number\"}}}",
        "authorizations": []
      }
    }
  ]
}
```

#### UI Display
```
📊 Results Summary:
   Found 2 event(s) • Environment: DEV AS-G8
   Status: Success - Successfully retrieved event details

   Statistics:
   ┌─────────────────┬─────────────────┬──────────────────┐
   │ With MongoDB    │ With Redis      │ Total Downstreams │
   │ Data: 2         │ Data: 2         │ 1                 │
   └─────────────────┴─────────────────┴──────────────────┘

📋 Event Cards (Expandable):
   ┌─────────────────────────────────────────────┐
   │ OrderUpdateEvent                            │
   │ MongoDB data available • Redis data available│
   │ [Click to expand]                           │
   │                                             │
   │ Expanded View:                              │
   │ ┌─ MongoDB Data ─────────────────────────┐ │
   │ │ Schema ID: schema-12345                │ │
   │ │ Event Type: OrderUpdateEvent           │ │
   │ │ Topic: onp-orderupdateevent-topic      │ │
   │ │ Created: 2024-01-15 10:30:00           │ │
   │ │ Updated: 2024-01-20 14:45:00          │ │
   │ │ Schema Definition: [JSON view]        │ │
   │ └────────────────────────────────────────┘ │
   │                                             │
   │ ┌─ Redis Cache Data ────────────────────┐ │
   │ │ NotificationSchema: [JSON view]       │ │
   │ │ Authorizations: 1 found               │ │
   │ └────────────────────────────────────────┘ │
   │                                             │
   │ ┌─ Downstream Details ───────────────────┐ │
   │ │ payment-service                        │ │
   │ │ Endpoint: https://api.example.com/... │ │
   │ │ Linked Authorization: [Details]       │ │
   │ └────────────────────────────────────────┘ │
   └─────────────────────────────────────────────┘
```

### Error Response

#### Backend Response (HTTP 400 - Events Not Found)
```json
{
  "status": "Failure",
  "message": "No events found for the specified event names",
  "eventDetails": []
}
```

#### UI Display
```
❌ Error Banner:
   "[HTTP 400] No events found. The requested event name(s) may not exist in the DEV AS-G8 environment."
   Status: 400
   Environment: DEV AS-G8

📭 Empty State:
   "No Data Found"
   "No event details found for the provided event names."
```

#### Backend Error Response (HTTP 401)
```json
{
  "message": "Authentication failed. Invalid or expired token"
}
```

#### UI Display
```
❌ Error Banner:
   "[HTTP 401] Authentication failed. Please check your authorization token or generate a new one."
   Status: 401
   Environment: DEV AS-G8
```

#### Backend Error Response (HTTP 500)
```json
{
  "message": "Internal server error occurred while fetching MongoDB details",
  "error": "Database connection timeout"
}
```

#### UI Display
```
❌ Error Banner:
   "[HTTP 500] Server error: Internal server error occurred while fetching MongoDB details. Please try again later or contact support."
   Status: 500
   Environment: DEV AS-G8
```

---

## 3. View Kafka Details

### UI Request Format

**Form Fields:**
- Environment: `DEV AS-G8`
- Authorization Token: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
- Kafka Topic Names: `onp-orderupdateevent-topic, onp-paymentevent-topic`

### Backend Request Format

**HTTP Request:**
```http
POST /api/kafkaDetails HTTP/1.1
Host: onppoc-qa.as-g8.cf.comcast.net
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json
trackingId: kafka-details-1704123456789
environment: DEV AS-G8

{
  "topicNames": [
    "onp-orderupdateevent-topic",
    "onp-paymentevent-topic"
  ]
}
```

### Success Response

#### Backend Response (HTTP 200)
```json
{
  "status": "Success",
  "message": "Successfully retrieved Kafka topic details",
  "topicDetails": [
    {
      "topicName": "onp-orderupdateevent-topic",
      "health": "healthy",
      "status": "Success",
      "message": "Topic exists and is accessible",
      "partitions": 3,
      "replicationFactor": 2,
      "config": {
        "retention.ms": "604800000",
        "compression.type": "snappy",
        "max.message.bytes": "1048576"
      },
      "consumerGroups": [
        "order-service-consumer-group",
        "notification-service-consumer-group"
      ]
    },
    {
      "topicName": "onp-paymentevent-topic",
      "health": "healthy",
      "status": "Success",
      "message": "Topic exists and is accessible",
      "partitions": 2,
      "replicationFactor": 2,
      "config": {
        "retention.ms": "604800000",
        "compression.type": "gzip",
        "max.message.bytes": "2097152"
      },
      "consumerGroups": [
        "payment-service-consumer-group"
      ]
    }
  ]
}
```

#### UI Display
```
📊 Results Summary:
   Found 2 topic(s) • Environment: DEV AS-G8
   Status: Success - Successfully retrieved Kafka topic details

   Statistics:
   ┌──────────┬────────────┬────────────┬────────────────────┐
   │ Healthy  │ Unhealthy  │ Not Found  │ Total Consumer     │
   │ 2        │ 0          │ 0          │ Groups: 3          │
   └──────────┴────────────┴────────────┴────────────────────┘

📋 Topic Cards (Expandable):
   ┌─────────────────────────────────────────────┐
   │ ✅ onp-orderupdateevent-topic               │
   │ Health: healthy                             │
   │ 3 Partitions • RF: 2 • 2 Consumer Groups    │
   │ [Click to expand]                           │
   │                                             │
   │ Expanded View:                              │
   │ ┌─ Topic Overview ───────────────────────┐ │
   │ │ Topic Name: onp-orderupdateevent-topic │ │
   │ │ Health Status: healthy                  │ │
   │ │ Partitions: 3                           │ │
   │ │ Replication Factor: 2                   │ │
   │ └─────────────────────────────────────────┘ │
   │                                             │
   │ ┌─ Topic Configuration ───────────────────┐ │
   │ │ retention.ms: 604,800,000               │ │
   │ │ compression.type: snappy                │ │
   │ │ max.message.bytes: 1,048,576            │ │
   │ └─────────────────────────────────────────┘ │
   │                                             │
   │ ┌─ Consumer Groups ───────────────────────┐ │
   │ │ order-service-consumer-group            │ │
   │ │ notification-service-consumer-group     │ │
   │ └─────────────────────────────────────────┘ │
   └─────────────────────────────────────────────┘
```

### Error Response

#### Backend Response (HTTP 400 - Topics Not Found)
```json
{
  "status": "Failure",
  "message": "One or more topics not found",
  "topicDetails": [
    {
      "topicName": "onp-orderupdateevent-topic",
      "health": "not found",
      "status": "Failure",
      "message": "Topic does not exist in the specified environment"
    }
  ]
}
```

#### UI Display
```
❌ Error Banner:
   "[HTTP 400] Unable to fetch details for topic(s): onp-orderupdateevent-topic. These topics may not exist in the DEV AS-G8 environment."
   Status: 400
   Environment: DEV AS-G8

📋 Topic Card (with error):
   ┌─────────────────────────────────────────────┐
   │ ⚠️ onp-orderupdateevent-topic               │
   │ Health: not found                           │
   │ [Click to expand]                           │
   │                                             │
   │ Expanded View:                              │
   │ ┌─ Status Message ───────────────────────┐ │
   │ │ ⚠️ Topic does not exist in the         │ │
   │ │    specified environment               │ │
   │ └────────────────────────────────────────┘ │
   └─────────────────────────────────────────────┘
```

#### Backend Error Response (HTTP 400 - Partial Success)
```json
{
  "status": "Success",
  "message": "Partial results retrieved",
  "topicDetails": [
    {
      "topicName": "onp-orderupdateevent-topic",
      "health": "healthy",
      "status": "Success",
      "partitions": 3,
      "replicationFactor": 2,
      "consumerGroups": ["order-service-consumer-group"]
    },
    {
      "topicName": "onp-paymentevent-topic",
      "health": "not found",
      "status": "Failure",
      "message": "Topic does not exist"
    }
  ]
}
```

#### UI Display
```
⚠️ Warning Banner:
   "Warning: Some topics could not be fetched: onp-paymentevent-topic. These topics may not exist in the DEV AS-G8 environment."
   Status: (no status code badge shown for warnings)
   Environment: DEV AS-G8

📊 Results Summary:
   Found 2 topic(s) • Environment: DEV AS-G8
   Status: Success - Partial results retrieved

   Statistics:
   ┌──────────┬────────────┬────────────┬────────────────────┐
   │ Healthy  │ Unhealthy  │ Not Found  │ Total Consumer     │
   │ 1        │ 0          │ 1          │ Groups: 1          │
   └──────────┴────────────┴────────────┴────────────────────┘

📋 Topic Cards:
   [Shows both successful and failed topics]
```

#### Backend Error Response (HTTP 401)
```json
{
  "message": "Authentication failed. Invalid or expired token"
}
```

#### UI Display
```
❌ Error Banner:
   "[HTTP 401] Authentication failed. Please check your authorization token or generate a new one."
   Status: 401
   Environment: DEV AS-G8
```

#### Backend Error Response (HTTP 500)
```json
{
  "message": "Kafka broker connection failed",
  "error": "Connection timeout after 30 seconds"
}
```

#### UI Display
```
❌ Error Banner:
   "[HTTP 500] Server error: Kafka broker connection failed. Please try again later or contact support."
   Status: 500
   Environment: DEV AS-G8
```

---

## 4. Update Event

### UI Request Format

**Form Fields:**
- Environment: `DEV AS-G8`
- Authorization Token: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
- Request Criteria: `MongoDB and Redis` (default, can be changed)
- Event Name: `OrderUpdateEvent` (must exist)
- Subscriber Name: `order-service` (optional)
- Header Schema: `{"type":"object","properties":{"correlationId":{"type":"string"},"timestamp":{"type":"string"}}}`
- Payload Schema: `{"type":"object","properties":{"orderId":{"type":"string"},"status":{"type":"string"},"amount":{"type":"number"}}}`
- Downstream Details:
  - Name: `payment-service`
  - Endpoint: `https://api.example.com/payment`
  - Client ID: `client-123`
  - Client Secret: `secret-456`
  - Scope: `payment.write`

### Backend Request Format

**HTTP Request:**
```http
PUT /api/updateonp HTTP/1.1
Host: onppoc-qa.as-g8.cf.comcast.net
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json
trackingId: update-1704123456789-abc123xyz
environment: DEV AS-G8
requestCriteria: mongodbandredis

{
  "eventName": "OrderUpdateEvent",
  "headerSchema": "{\"type\":\"object\",\"properties\":{\"correlationId\":{\"type\":\"string\"},\"timestamp\":{\"type\":\"string\"}}}",
  "payloadSchema": "{\"type\":\"object\",\"properties\":{\"orderId\":{\"type\":\"string\"},\"status\":{\"type\":\"string\"},\"amount\":{\"type\":\"number\"}}}",
  "subscriberName": "order-service",
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

### Success Response

#### Backend Response (HTTP 200)
```json
{
  "eventName": "OrderUpdateEvent",
  "mongoDBAndRedis": {
    "status": "Success",
    "message": "Successfully updated MongoDB schema and refreshed Redis cache for OrderUpdateEvent"
  }
}
```

#### UI Display
```
✅ Success Banner:
   "Update completed successfully! All 1 task(s) completed successfully in DEV AS-G8 environment."

📊 Task Results Summary:
   Total Tasks: 1
   Successful: 1
   Failed: 0
   Partial: 0

✅ Task Cards:
   ┌─────────────────────────────────────┐
   │ ✅ MongoDB and Redis                │
   │ Status: Success                     │
   │ Successfully updated MongoDB schema │
   │ and refreshed Redis cache for       │
   │ OrderUpdateEvent                    │
   │ [View Raw]                          │
   └─────────────────────────────────────┘
```

### Error Response

#### Backend Response (HTTP 404 - Event Not Found)
```json
{
  "eventName": "OrderUpdateEvent",
  "mongoDBAndRedis": {
    "status": "Failure",
    "message": "Event 'OrderUpdateEvent' not found in the specified environment"
  }
}
```

#### UI Display
```
❌ Error Banner:
   "[HTTP 404] Event not found. The specified event does not exist in the selected environment. Please verify the event name and try again."
   Status: 404
   Environment: DEV AS-G8

📊 Task Results:
   ┌─────────────────────────────────────┐
   │ ❌ MongoDB and Redis                │
   │ Status: Failure                     │
   │ Event 'OrderUpdateEvent' not found  │
   │ in the specified environment        │
   │ [View Raw]                          │
   └─────────────────────────────────────┘
```

#### Backend Error Response (HTTP 400 - Invalid Request)
```json
{
  "eventName": "OrderUpdateEvent",
  "mongoDBAndRedis": {
    "status": "Failure",
    "message": "Invalid schema format. Header schema validation failed."
  }
}
```

#### UI Display
```
❌ Error Banner:
   "Update completed with errors. 1 task(s) failed, 0 succeeded in DEV AS-G8 environment. Please review the details below."

📊 Task Results Summary:
   Total Tasks: 1
   Successful: 0
   Failed: 1
   Partial: 0
   Status: Some Tasks Failed

❌ Task Cards:
   ┌─────────────────────────────────────┐
   │ ❌ MongoDB and Redis                │
   │ Status: Failure                     │
   │ Invalid schema format. Header       │
   │ schema validation failed.            │
   │ [View Raw]                          │
   └─────────────────────────────────────┘
```

#### Backend Error Response (HTTP 401)
```json
{
  "message": "Authentication failed. Invalid or expired token"
}
```

#### UI Display
```
❌ Error Banner:
   "[HTTP 401] Authentication failed. Please check your authorization token or generate a new one."
   Status: 401
   Environment: DEV AS-G8

📊 Task Results:
   ┌─────────────────────────────────────┐
   │ ❌ Update Error                     │
   │ Status: Failure                     │
   │ [HTTP 401] Authentication failed.  │
   │ Invalid or expired token            │
   │ [View Raw]                          │
   └─────────────────────────────────────┘
```

#### Backend Error Response (HTTP 503 - Service Unavailable)
```json
{
  "message": "Service not reachable. Update service is currently unavailable"
}
```

#### UI Display
```
❌ Error Banner:
   "[HTTP 503] Service not reachable. The update service is currently unavailable. Please try again later."
   Status: 503
   Environment: DEV AS-G8
```

---

## 5. View Complete Event Information

**Status:** This feature is currently under development. The endpoint and functionality will be available in a future release.

### UI Request Format (Planned)

**Form Fields:**
- Environment: `DEV AS-G8`
- Authorization Token: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
- Filter Options:
  - Event Name: (optional search)
  - Status: All / Active / Inactive
  - Date Range: (optional)

### Backend Request Format (Planned)

**HTTP Request:**
```http
POST /api/viewAllEvents HTTP/1.1
Host: onppoc-qa.as-g8.cf.comcast.net
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json
trackingId: view-all-events-1704123456789
environment: DEV AS-G8

{
  "filters": {
    "eventName": "Order",
    "status": "all",
    "dateRange": {
      "startDate": "2024-01-01",
      "endDate": "2024-01-31"
    }
  },
  "pagination": {
    "page": 1,
    "pageSize": 20
  }
}
```

### Success Response (Planned)

#### Backend Response (HTTP 200)
```json
{
  "status": "Success",
  "message": "Successfully retrieved event information",
  "totalEvents": 45,
  "page": 1,
  "pageSize": 20,
  "events": [
    {
      "eventName": "OrderUpdateEvent",
      "status": "active",
      "environment": "DEV AS-G8",
      "createdDate": "2024-01-15T10:30:00Z",
      "updatedDate": "2024-01-20T14:45:00Z",
      "hasMongoDB": true,
      "hasRedis": true,
      "hasKafka": true,
      "kafkaTopic": "onp-orderupdateevent-topic",
      "downstreamCount": 2,
      "subscriberName": "order-service"
    }
  ]
}
```

### Error Response (Planned)

#### Backend Error Response (HTTP 401)
```json
{
  "message": "Authentication failed. Invalid or expired token"
}
```

---

## Common Error Scenarios

### HTTP Status Code Reference

| Status Code | Meaning | UI Display | Example Scenario |
|------------|---------|------------|------------------|
| 200 | Success | ✅ Success banner with results | All operations completed successfully |
| 207 | Partial Success | ⚠️ Warning banner | Some tasks succeeded, some failed |
| 400 | Bad Request | ❌ Error banner with [HTTP 400] | Invalid input, missing topics/events |
| 401 | Unauthorized | ❌ Error banner with [HTTP 401] | Invalid or expired token |
| 403 | Forbidden | ❌ Error banner with [HTTP 403] | Insufficient permissions |
| 404 | Not Found | ❌ Error banner with [HTTP 404] | Endpoint not found |
| 500 | Server Error | ❌ Error banner with [HTTP 500] | Internal server error, database timeout |

### Error Message Format

All error messages in the UI follow this format:
```
[HTTP {statusCode}] {error message}
Status: {statusCode}
Environment: {environment name}
```

### Download Excel Format

All sections support downloading request/response data as Excel files with the following structure:

```
{OPERATION} - OPERATION REPORT

Timestamp: {ISO timestamp}
Operation: {operation name}

REQUEST DETAILS
Endpoint: POST /api/{endpoint}
Query Parameters:
  environment: {environment}

Request Body:
  {flattened request body}

RESPONSE DETAILS
Status: {status code} {status text}
Error: {error message if any}
Response Data:
  {flattened response data}

METADATA
{key}: {value}
{key}: {value}
```

---

## Notes

1. **Authorization Tokens**: All requests require a valid Bearer token. Tokens can be:
   - Generated via SAT service (using Generate Token button)
   - Entered manually in the authorization field
   - Automatically added from SSO session (for Kafka and MongoDB Details)

2. **Environment Selection**: All operations require selecting an environment. The environment determines:
   - Which backend instance to connect to
   - Which SAT token endpoint to use
   - Data isolation and access permissions

3. **Tracking IDs**: All requests include auto-generated tracking IDs for:
   - Request correlation
   - Debugging and troubleshooting
   - Audit logging

4. **Error Handling**: The UI provides:
   - Clear error messages with HTTP status codes
   - Environment context in error displays
   - Actionable guidance (e.g., "generate a new token")
   - Download capability for error details

5. **Response Display**: Success responses show:
   - Summary statistics
   - Expandable detail cards
   - Color-coded status indicators
   - Download functionality for Excel export

