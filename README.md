# ONP Onboard UI

A single-page React application for interacting with the ONP (Orion Notification Platform) backend API to onboard events and configure downstream systems.

## Features

- **Form-based Configuration**: Intuitive form interface for configuring onboarding requests
- **Dynamic Validation**: Client-side validation based on selected request criteria
- **JSON Schema Editor**: Built-in JSON editor with syntax highlighting for header and payload schemas
- **Downstream Details Management**: Add/remove and validate downstream configuration rows
- **Task Results Viewer**: Real-time display of task execution status with detailed messages
- **Template Management**: Save and load request templates from localStorage
- **Responsive Design**: Modern UI built with TailwindCSS

## Tech Stack

- **React 19** with **TypeScript**
- **Vite** for build tooling
- **TailwindCSS** for styling
- **React Query** for API state management
- **AJV** for JSON schema validation
- **React Ace** for JSON editing
- **Jest** + **React Testing Library** for testing

## Prerequisites

- Node.js 18+ and npm

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd orionnotificationplatform
```

2. Install dependencies:
```bash
npm install
```

## Development

Start the development server:

```bash
npm run dev
```

The application will be available at `http://localhost:5173` (or the port shown in the terminal).

## Building for Production

Build the application:

```bash
npm run build
```

The built files will be in the `dist` directory.

Preview the production build:

```bash
npm run preview
```

## Testing

Run unit tests:

```bash
npm test
```

Run tests in watch mode:

```bash
npm run test:watch
```

Run tests with coverage:

```bash
npm run test:coverage
```

## Configuration

### API Endpoint

The application expects the backend API to be available at `/onboardonp`. By default, it will use `http://localhost:3000` as the base URL.

To configure a different API base URL, create a `.env` file in the root directory:

```env
VITE_API_BASE_URL=http://your-api-url:port
```

### SSO Authentication

The application supports Single Sign-On (SSO) authentication using OAuth 2.0/OIDC. Configure SSO by setting the following environment variables in your `.env` file:

#### Google OAuth Configuration

```env
VITE_SSO_PROVIDER=google
VITE_SSO_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
VITE_SSO_REDIRECT_URI=http://localhost:5173/auth/callback
VITE_SSO_SCOPES=openid,profile,email
```

**To get Google OAuth credentials:**
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Navigate to **APIs & Services** → **Credentials**
4. Click **Create Credentials** → **OAuth client ID**
5. Select **Web application** as the application type
6. Add your redirect URI (e.g., `http://localhost:5173/auth/callback`)
7. Copy the **Client ID** and use it as `VITE_SSO_CLIENT_ID`

#### Generic OIDC Configuration

```env
VITE_SSO_PROVIDER=oidc
VITE_SSO_CLIENT_ID=your-oidc-client-id
VITE_SSO_AUTHORITY=https://your-identity-provider.com
VITE_SSO_REDIRECT_URI=http://localhost:5173/auth/callback
VITE_SSO_SCOPES=openid,profile,email
```

**Environment Variables:**
- `VITE_SSO_PROVIDER`: SSO provider type (`google` or `oidc`)
- `VITE_SSO_CLIENT_ID`: OAuth client ID (required)
- `VITE_SSO_CLIENT_SECRET`: OAuth client secret (optional, for token refresh)
- `VITE_SSO_AUTHORITY`: OIDC authority URL (required for OIDC provider)
- `VITE_SSO_REDIRECT_URI`: OAuth redirect URI (defaults to `/auth/callback`)
- `VITE_SSO_SCOPES`: Comma-separated list of OAuth scopes (defaults to `openid,profile,email`)

**Note:** All routes are protected by default. Users must authenticate via SSO before accessing the application.

## Usage

### Request Criteria

Select one or more request criteria to determine which tasks will be executed:

- **MongoDB and Redis**: Requires event name, header/payload schemas, downstream details, and subscriber name
- **Kafka Topic**: Requires subscriber name, number of partitions, and replication factor
- **Deployment Manifest**: Requires subscriber name, commit message, and git access token
- **Orion Properties**: Requires subscriber name, commit message, and git access token
- **Fallback DB**: Requires downstream details with HTTP status codes
- **Concourse Vault**: Requires subscriber name

### Form Fields

The form dynamically shows/hides fields based on selected criteria. Required fields are marked with an asterisk (*).

### JSON Editors

When "MongoDB and Redis" is selected, JSON editors appear for:
- **Header Schema**: JSON schema for event headers
- **Payload Schema**: JSON schema for event payloads

The editors provide:
- Syntax highlighting
- JSON validation
- Auto-completion
- Error highlighting

### Downstream Details

For MongoDB/Redis and Fallback DB criteria, you can add multiple downstream configurations. Each row includes:
- Name, Endpoint, Client ID, Client Secret, Scope
- Subscriber Name (for MongoDB/Redis)
- HTTP Status Code (for Fallback DB)

### Validation

The validation panel shows:
- List of tasks that will run based on selected criteria
- Validation status (pass/fail)
- Detailed error messages for any validation failures

The submit button is disabled until all validations pass.

### Task Results

After submission, the task results panel displays:
- One card per task with color-coded status:
  - 🟢 **Success** (green)
  - 🔴 **Failure** (red)
  - 🟡 **Partial** (yellow)
- Task name and status
- Message from the server
- "View Raw" button to expand and see full JSON response

### Template Management

The application automatically saves your form configuration to localStorage. When you reload the page, your previous configuration will be restored.

## API Contract

### Request

**Endpoint**: `POST /onboardonp`

**Headers**:
- `requestCriteria`: Comma-separated list of criteria (e.g., "mongodbandredis,kafkatopic")
- `commitMessage`: Commit message (required for deployment manifest and orion properties)
- `gitAccessToken`: Git access token (required for deployment manifest and orion properties)

**Body**:
```json
{
  "eventName": "string",
  "headerSchema": {},
  "payloadSchema": {},
  "downstreamDetails": [
    {
      "name": "string",
      "endpoint": "string",
      "clientId": "string",
      "clientSecret": "string",
      "scope": "string",
      "subscriberName": "string",
      "httpStatusCode": 200
    }
  ],
  "subscriberName": "string",
  "numPartitions": 1,
  "replicationFactor": 1
}
```

### Response

```json
{
  "tasks": [
    {
      "task": "mongoDBAndRedis",
      "status": "Success",
      "message": "Successfully onboarded",
      "rawData": {}
    }
  ]
}
```

## Project Structure

```
src/
├── components/
│   ├── DownstreamEditor.tsx      # Downstream details editor
│   ├── JsonEditor.tsx            # JSON schema editor
│   ├── OnboardForm.tsx           # Main form component
│   ├── TaskResults.tsx           # Task results display
│   └── ValidationPanel.tsx       # Validation status panel
├── services/
│   ├── api.ts                    # API client
│   ├── validation.ts             # Validation logic
│   └── storage.ts                 # localStorage utilities
├── types/
│   └── index.ts                  # TypeScript type definitions
├── App.tsx                        # Root component
└── main.tsx                       # Application entry point
```

## Development Notes

- The application uses React Query for managing API state and caching
- Validation is performed client-side before submission
- All form state is automatically persisted to localStorage
- The UI is fully responsive and works on desktop and tablet devices

## License

[Add your license here]
