# ONP Platform User Guide

## Table of Contents
1. [Introduction](#introduction)
2. [Getting Started](#getting-started)
3. [Home Page](#home-page)
4. [ONP Event Onboarding](#onp-event-onboarding)
5. [View Event Details](#view-event-details)
6. [Update Event](#update-event)
7. [MongoDB Details](#mongodb-details)
8. [Kafka Details](#kafka-details)
9. [Download Functionality](#download-functionality)
10. [Authentication & Authorization](#authentication--authorization)
11. [Troubleshooting](#troubleshooting)
12. [Best Practices](#best-practices)

---

## Introduction

The **Orion Notification Platform (ONP)** is a comprehensive platform for managing event notifications, Kafka topics, MongoDB configurations, and downstream integrations. This user guide will help you navigate and utilize all features of the ONP platform effectively.

### What is ONP?

ONP is a notification platform that handles:
- **Event Onboarding**: Configure and onboard new events to the platform
- **Message Streaming**: Manage Kafka topics for event messaging
- **Data Storage**: Configure MongoDB and Redis for event data
- **Downstream Integration**: Connect events to downstream systems
- **Deployment Management**: Handle deployment manifests and configuration files

---

## Getting Started

### Accessing the Platform

1. Navigate to the ONP platform URL
2. You will be prompted to log in using your credentials
3. Upon successful authentication, you'll be redirected to the Home page

### Navigation

The platform consists of four main sections accessible from the Home page:
- **New ONP Event Onboarding**: Create and configure new events
- **View Event Details**: Browse existing event configurations
- **Check MongoDB Details**: View MongoDB connection and data details
- **Check Kafka Details**: Monitor Kafka topics and consumer groups

---

## Home Page

The Home page serves as the central hub for all platform operations.

### About ONP Section

The "About ONP" section provides:
- **Platform Overview**: High-level information about the ONP platform
- **Flow Diagrams**: Visual representations of:
  - High-level flow of schema cache, audit, Kafka topics, and downstream routing
  - ONP and ONPSubscriber sequence: cache lookup, Mongo refresh, validation, Kafka, downstream, and fallback

**Features:**
- Click on any image to view it in full-screen modal
- Download images directly from the modal using the download button
- Expand/collapse the section using "More" and "Less" buttons

### Platform Actions

Four action cards provide quick access to main features:

1. **New ONP Event Onboarding** (Blue)
   - Configure and onboard new events
   - Set up Kafka topics, MongoDB, and downstream systems

2. **View Event Details** (Purple)
   - Browse and search existing event configurations
   - View event details and status

3. **Check MongoDB Details** (Green)
   - View MongoDB connection details
   - Check event data in MongoDB and Redis

4. **Check Kafka Details** (Orange)
   - Monitor Kafka topics
   - View consumer groups and message details

### References Section

Quick links to important documentation:
- ONP Notifications Wiki
- Additional resources and documentation

---

## ONP Event Onboarding

The ONP Event Onboarding page allows you to configure and onboard new events to the platform.

### Step 1: Select Environment

1. Choose an environment from the dropdown:
   - **Development**: DEV AS-G8, DEV HO-G2
   - **QA**: QA AS-G8, QA HO-G2
   - **Integration**: INT AS-G8, INT HO-G2
   - **Flex**: FLX AS-G8, FLA HO-G2
   - **Training**: TRN AS-G8, TRN HO-G2
   - **Staging**: STG CH2-G2, STG HO-G4
   - **Production**: PROD G1, PROD AS-G6, PROD HO-G1, PROD HO-G3
   - **Business**: BUS AS-G8, BUS HO-G2

2. Click "Continue" to proceed to the form

### Step 2: Configure Request Criteria

Select one or more request criteria based on your needs:

#### Available Criteria:

1. **MongoDB and Redis**
   - Stores event data in MongoDB and Redis
   - Requires: Event Name, Subscriber Name, Header Schema, Payload Schema, Downstream Details

2. **Kafka Topic**
   - Creates Kafka topics for event messaging
   - Requires: Event Name, Subscriber Name, Number of Partitions, Replication Factor

3. **Deployment Manifest**
   - Generates deployment manifest files
   - Requires: Commit Message, Git Access Token

4. **Orion Properties**
   - Creates Orion properties configuration
   - Requires: Commit Message, Git Access Token

5. **Fallback DB**
   - Configures fallback database settings
   - Requires: Event Name, Subscriber Name, Downstream Details with HTTP Status Codes

6. **Concourse Vault**
   - Sets up Concourse Vault configuration
   - Requires: Subscriber Name

### Step 3: Fill Required Fields

Fields marked with an asterisk (*) are required.

#### Common Fields:

- **Event Name***: Unique identifier for the event (e.g., EVENT1, EVENT2)
- **Subscriber Name***: Name of the subscriber consuming the event
- **Authorization Token***: Bearer token for API authentication
  - Use "Generate Token" button to create a token using SAT service
  - Or enter a custom token manually

#### MongoDB and Redis Specific:

- **Header Schema***: JSON schema defining the structure of event headers
  - Use the JSON editor with syntax highlighting
  - Example:
    ```json
    {
      "type": "object",
      "properties": {
        "eventId": { "type": "string" },
        "timestamp": { "type": "string", "format": "date-time" }
      },
      "required": ["eventId", "timestamp"]
    }
    ```

- **Payload Schema***: JSON schema defining the structure of event payloads
  - Similar format to Header Schema
  - Define all required fields and their types

- **Downstream Details**: Add one or more downstream configurations
  - **Name**: Downstream system name
  - **Endpoint**: API endpoint URL
  - **Client ID**: OAuth client ID
  - **Client Secret**: OAuth client secret (can be encoded or original value)
  - **Scope**: OAuth scope
  - **Subscriber Name**: Subscriber for this downstream

#### Kafka Topic Specific:

- **Number of Partitions**: Number of Kafka topic partitions (default: 1)
- **Replication Factor**: Number of replicas for the topic (default: 1)

#### Deployment Manifest & Orion Properties:

- **Commit Message***: Description of changes for Git commit
- **Git Access Token***: Personal access token for Git repository access

#### Fallback DB Specific:

- **Downstream Details**: Similar to MongoDB, but includes:
  - **HTTP Status Code**: Status code that triggers fallback (e.g., 500, 503)

### Step 4: Authorization Token

You have two options for authorization:

1. **Generate Token (SAT Service)**:
   - Click "Generate Token" button
   - Enter:
     - **Client ID**: Your OAuth client ID
     - **Client Secret**: Your OAuth client secret
     - **Scope**: Required OAuth scope
   - Click "Generate" to create a token automatically
   - Token will be populated in the Authorization field

2. **Manual Token Entry**:
   - Enter your Bearer token directly
   - No need to include the word "Bearer" - it's added automatically

### Step 5: Validation

The Validation Panel shows:
- ✅ **Tasks that will execute** based on selected criteria
- ❌ **Validation errors** with detailed messages
- **Field-level errors** highlighted in red

**Important**: The Submit button is disabled until all validations pass.

### Step 6: Submit Request

1. Review all fields and validation status
2. Click "Submit Onboarding Request"
3. The button will be disabled after submission
4. To resubmit, edit any field to re-enable the button

### Step 7: View Results

After submission, the Task Results panel displays:

- **Success** (Green): Task completed successfully
- **Failure** (Red): Task failed with error message
- **Partial** (Yellow): Task completed with warnings

Each result card shows:
- Task name
- Status indicator
- Message from the server
- "View Raw" button to see full JSON response

### Download Results

Click "Download Excel" to export:
- Request details (endpoint, headers, body)
- Response details (status, data, errors)
- Metadata (operation timestamp, status summary)

The Excel file includes all information in a structured, user-friendly format.

### Template Management

- Your form configuration is automatically saved to browser storage
- When you reload the page, your previous configuration is restored
- Useful for making incremental changes or retrying submissions

---

## View Event Details

The View Event Details page allows you to browse and search existing event configurations.

### Current Status

This feature is currently under development. You can:
- Navigate to the page from the Home page
- See a placeholder indicating the feature is coming soon
- Use the "Create New Event" button to go to the onboarding page

### Future Features

When available, you'll be able to:
- Search events by name, subscriber, or environment
- Filter events by status or criteria
- View detailed event configurations
- Edit existing events
- View event history and audit logs

---

## Update Event

The Update Event page allows you to update existing event entries in MongoDB and refresh Redis cache.

### Environment Selection and Token Generation

The page features a separate box at the top for environment selection and token generation.

**Environment Selection Box:**
- Select the environment from the dropdown (same options as Event Onboarding)
- This is a required field

**Authorization Token:**
- Use "Generate Token" button to create a token using SAT service
  - Requires: Client ID, Client Secret, and Scope
  - Token is automatically populated after generation
- Or enter a custom Bearer token manually
- This field is optional but recommended for secure access

### Step 1: Enter Event Details

**Event Name***: 
- Enter the name of an existing event that you want to update
- The event must already exist in the selected environment
- This is a required field

**Subscriber Name**: 
- Optional: Enter subscriber name if you want to update subscriber-specific configurations

### Step 2: Configure Downstream Details

Add or modify downstream configurations:
- **Name**: Downstream system name
- **Endpoint**: API endpoint URL
- **Client ID**: OAuth client ID
- **Client Secret**: OAuth client secret
- **Scope**: OAuth scope
- **Subscriber Name**: Subscriber for this downstream

### Step 3: Update Schemas (Optional)

**Header Schema**: 
- Update the JSON schema for event headers
- Use the JSON editor with syntax highlighting

**Payload Schema**: 
- Update the JSON schema for event payloads
- Similar format to Header Schema

### Step 4: Submit Update

1. Review all fields and validation status
2. Click "Update Event" button
3. The button will be disabled after submission
4. To resubmit, edit any field to re-enable the button

### Step 5: View Results

After submission, the Task Results panel displays:
- **Success** (Green): Update completed successfully
- **Failure** (Red): Update failed with error message
- **Partial** (Yellow): Update completed with warnings

### Accessing from MongoDB Details

You can also navigate to the Update Event page from the MongoDB Details page:
- After viewing MongoDB/Redis details, a subtle link appears in the Results Summary
- Click "Go to Update Event page" to navigate directly

---

## MongoDB Details

The MongoDB Details page allows you to query and view MongoDB and Redis data for specific events.

### Environment Selection and Token Generation

The page features a separate box at the top for environment selection and token generation, similar to the Update Event page.

**Environment Selection Box:**
- Select the environment from the dropdown (same options as Event Onboarding)
- This is a required field

**Authorization Token:**
- Use "Generate Token" button to create a token using SAT service
  - Requires: Client ID, Client Secret, and Scope
  - Token is automatically populated after generation
- Or enter a custom Bearer token manually
- This field is optional but recommended for secure access

### Step 1: Specify Events

You have two options:

1. **Fetch All Events**:
   - Check the "Fetch All Events" checkbox
   - This will retrieve data for all events in the selected environment

2. **Specific Events**:
   - Enter event names separated by commas
   - Example: `EVENT1, EVENT2, EVENT3`
   - The "Fetch All Events" checkbox will be disabled

### Step 2: Submit Query

1. Click "Fetch Details" (or "Fetch All Events" if checkbox is selected)
2. The button will be disabled after submission
3. Edit any input to re-enable the button

### Step 3: View Results

Results are displayed in expandable cards:

- **Event Name**: Name of the event
- **Event Details**: Expandable section showing:
  - MongoDB connection details
  - Redis configuration
  - Event data
  - Subscriber information

Click on an event card to expand and view detailed information.

### Update Event Option

After submitting a query (whether successful or with errors), if you need to update any event:
- A subtle link appears in the Results Summary section (for successful responses) or in the Error/Warning section (for error responses): "Go to Update Event page"
- Click the link to navigate to the Update Event page
- This allows you to update existing event entries in MongoDB and refresh Redis cache
- The link is available for both success and error responses, so you can update events even if the query encountered issues

### Search Functionality

Use the search box to filter events by name or any content within the event details.

### Download Results

Click "Download Excel" to export:
- Query parameters (environment, event names)
- Request details
- Response data (all event details)
- Metadata (event count, status)

Available even if the query fails, including error information.

---

## Kafka Details

The Kafka Details page allows you to monitor Kafka topics and view topic configurations.

### Environment Selection and Token Generation

The page features a separate box at the top for environment selection and token generation, similar to the Update Event page.

**Environment Selection Box:**
- Select the environment from the dropdown (same options as Event Onboarding)
- This is a required field

**Authorization Token:**
- Use "Generate Token" button to create a token using SAT service
  - Requires: Client ID, Client Secret, and Scope
  - Token is automatically populated after generation
- Or enter a custom Bearer token manually
- This field is optional but recommended for secure access

### Step 1: Specify Topics

You have two options:

1. **Fetch All Topics**:
   - Check the "Fetch All Topics" checkbox
   - This will retrieve details for all topics in the selected environment
   - The topic names input field will be disabled

2. **Specific Topics**:
   - Enter Kafka topic names separated by commas
   - Example: `topic1, topic2, topic3`
   - You can query multiple topics at once
   - The "Fetch All Topics" checkbox will be disabled

### Step 2: Submit Query

1. Click "Fetch Details"
2. The button will be disabled after submission
3. Edit any input to re-enable the button

### Step 3: View Results

Results are displayed in expandable cards:

- **Topic Name**: Name of the Kafka topic
- **Topic Details**: Expandable section showing:
  - Partition information
  - Replication factor
  - Consumer group details
  - Message offsets
  - Topic configuration

Click on a topic card to expand and view detailed information.

### Search Functionality

Use the search box to filter topics by name or any content within the topic details.

### Summary Statistics

The results summary shows:
- Total number of topics found
- Quick overview of topic status

### Download Results

Click "Download Excel" to export:
- Query parameters (environment, topic names)
- Request details
- Response data (all topic details)
- Metadata (topic count, status)

Available even if the query fails, including error information.

---

## Download Functionality

The platform provides comprehensive download functionality for all operations.

### What Can Be Downloaded?

1. **ONP Event Onboarding Results**
   - Request configuration
   - Task execution results
   - Success/failure status for each task
   - Error messages and raw responses

2. **MongoDB Details**
   - Query parameters
   - Event data from MongoDB/Redis
   - Connection details
   - Error information (if any)

3. **Kafka Details**
   - Query parameters
   - Topic configurations
   - Partition and consumer group details
   - Error information (if any)

4. **Images from About ONP**
   - Flow diagrams
   - Platform architecture images

### Download Format

All downloads are provided as **Excel files (.xlsx)** containing:
- **Structured sections**: Request Details, Response Details, Metadata
- **Color-coded status**: Green for success, red for errors
- **Formatted data**: Easy-to-read tables and organized information
- **Complete information**: All request and response data included

### How to Download

1. After any operation completes (success or failure), a "Download Excel" button appears
2. Click the button to download the Excel file
3. The file is automatically named with:
   - Operation name
   - Timestamp
   - Example: `onp-event-onboard-2024-01-15T10-30-45.xlsx`

### Download from Image Modal

1. Click on any image in the "About ONP" section
2. The image opens in a full-screen modal
3. Click the download button (blue button with download icon) in the top-right corner
4. The image downloads with its original filename

---

## Authentication & Authorization

### Login

- The platform requires authentication to access
- Use your organization credentials to log in
- Session is maintained while you use the platform

### Authorization Tokens

Most operations require an authorization token:

#### Using SAT Service (Recommended)

1. Click "Generate Token" button
2. Enter your credentials:
   - **Client ID**: Your OAuth client ID
   - **Client Secret**: Your OAuth client secret
   - **Scope**: Required OAuth scope (e.g., `onp.read onp.write`)
3. Click "Generate"
4. Token is automatically populated in the Authorization field

#### Manual Token Entry

1. Obtain a Bearer token from your authentication service
2. Enter the token directly in the Authorization field
3. **Note**: Do not include the word "Bearer" - it's added automatically

### Token Security

- Tokens are masked in download files for security
- Never share your tokens with others
- Tokens expire based on your organization's policy
- Generate a new token if you receive 401 Unauthorized errors

---

## Troubleshooting

### Common Issues and Solutions

#### 1. "401 Unauthorized" Error

**Problem**: API requests are being rejected due to authentication issues.

**Solutions**:
- Verify your authorization token is valid
- Generate a new token using the SAT service
- Check that the token hasn't expired
- Ensure you're using the correct environment

#### 2. Validation Errors

**Problem**: Form validation is failing.

**Solutions**:
- Check all required fields (marked with *) are filled
- Verify JSON schemas are valid JSON format
- Ensure downstream details are complete
- Check that event names follow naming conventions

#### 3. Submit Button Disabled

**Problem**: Cannot submit the form.

**Solutions**:
- Check the Validation Panel for errors
- Fix all validation errors
- Ensure all required fields are completed
- If button is disabled after submission, edit any field to re-enable it

#### 4. No Results Displayed

**Problem**: Query returns no results.

**Solutions**:
- Verify the environment is correct
- Check that event/topic names are spelled correctly
- Ensure you have proper permissions for the environment
- Try querying with "Fetch All" option

#### 5. Download Not Working

**Problem**: Excel download fails or file is corrupted.

**Solutions**:
- Check browser popup blockers
- Ensure sufficient disk space
- Try a different browser
- Check browser console for errors

#### 6. Images Not Loading

**Problem**: Images in About ONP section don't display.

**Solutions**:
- Check internet connection
- Refresh the page
- Clear browser cache
- Contact support if issue persists

#### 7. Token Generation Fails

**Problem**: SAT token generation returns an error.

**Solutions**:
- Verify Client ID and Client Secret are correct
- Check that the scope is valid
- Ensure SAT service is accessible
- Try manual token entry as alternative

---

## Best Practices

### Event Onboarding

1. **Plan Your Configuration**
   - Review all required fields before starting
   - Prepare JSON schemas in advance
   - Have downstream endpoint details ready

2. **Use Descriptive Names**
   - Use clear, descriptive event names
   - Follow naming conventions
   - Avoid special characters

3. **Validate JSON Schemas**
   - Use JSON validators before entering
   - Test schemas with sample data
   - Ensure required fields are marked

4. **Test in Non-Production First**
   - Start with DEV or QA environments
   - Verify configuration works correctly
   - Then proceed to production

5. **Review Results Carefully**
   - Check all task statuses
   - Review error messages if any
   - Download results for record-keeping

### MongoDB & Kafka Queries

1. **Use Specific Queries**
   - Query specific events/topics when possible
   - Use "Fetch All" only when necessary
   - This improves performance

2. **Save Important Queries**
   - Download results for important queries
   - Keep records of configurations
   - Use for troubleshooting

3. **Monitor Regularly**
   - Check MongoDB details periodically
   - Monitor Kafka topics for issues
   - Review consumer group status

### Security

1. **Protect Your Tokens**
   - Never share authorization tokens
   - Regenerate tokens if compromised
   - Use tokens only for intended purposes

2. **Environment Selection**
   - Double-check environment before submission
   - Use appropriate environments for testing
   - Be cautious with production environments

3. **Data Privacy**
   - Be mindful of sensitive data in schemas
   - Review downstream configurations
   - Follow organization data policies

### General Tips

1. **Use Templates**
   - Leverage auto-saved templates
   - Save common configurations
   - Reuse validated setups

2. **Download Results**
   - Always download successful operations
   - Keep records of failed attempts
   - Use downloads for documentation

3. **Stay Updated**
   - Check platform updates regularly
   - Review new features and changes
   - Read release notes

4. **Get Help**
   - Refer to this guide for common questions
   - Contact support for technical issues
   - Check wiki pages for detailed documentation

---

## Additional Resources

- **ONP Notifications Wiki**: Comprehensive platform documentation
- **API Documentation**: Detailed API reference and examples
- **Support**: Contact your platform administrator for assistance

---

## Glossary

- **ONP**: Orion Notification Platform
- **Event**: A notification or message that triggers actions in the platform
- **Subscriber**: A system that consumes events from ONP
- **Downstream**: External systems that receive events from ONP
- **Kafka Topic**: A category or feed name to which messages are published
- **Partition**: A division of a Kafka topic for parallel processing
- **Replication Factor**: Number of copies of data across Kafka brokers
- **SAT Service**: Service Authentication Token service for generating tokens
- **Bearer Token**: An authentication token used in API requests
- **JSON Schema**: A specification for validating JSON data structure
- **Deployment Manifest**: Configuration file for deploying applications
- **Orion Properties**: Configuration properties for the Orion system

---

**Last Updated**: January 2026

**Version**: 1.0

For questions or feedback, please contact your platform administrator.

