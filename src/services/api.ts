import axios, { type AxiosError } from 'axios';
import type { OnboardRequest, OnboardResponse, KafkaDetailsRequest, KafkaDetailsListResponse, TaskResult, MongoDBDetailsRequest, MongoDBDetailsResponse } from '../types';
import { getValidAccessToken } from './auth';

// Use proxy path in production (when VITE_API_BASE_URL is not set)
// This avoids CORS issues by proxying through the Express server
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

// Create axios instance with interceptors for auth
export const apiClient = axios.create();

// Add auth token to requests
apiClient.interceptors.request.use(
  async (config) => {
    // Only add token if Authorization header is not already set
    // This allows custom tokens from forms to take precedence
    if (!config.headers.Authorization) {
      const token = await getValidAccessToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Backend response structure
interface ONPEventResponse {
  eventName?: string;
  mongoDBAndRedis?: { status: string; message: string };
  kafka?: { status: string; message: string };
  deploymentManifestFile?: { status: string; message: string };
  orionPropertiesFile?: { status: string; message: string };
  fallbackDB?: { status: string; message: string };
  concourseVault?: { status: string; message: string };
}

// Transform backend response to frontend expected format
const transformResponse = (backendResponse: ONPEventResponse): OnboardResponse => {
  const tasks: TaskResult[] = [];

  if (backendResponse.mongoDBAndRedis) {
    tasks.push({
      task: 'MongoDB and Redis',
      status: backendResponse.mongoDBAndRedis.status as 'Success' | 'Failure' | 'Partial',
      message: backendResponse.mongoDBAndRedis.message,
      rawData: backendResponse.mongoDBAndRedis,
    });
  }

  if (backendResponse.kafka) {
    tasks.push({
      task: 'Kafka Topic',
      status: backendResponse.kafka.status as 'Success' | 'Failure' | 'Partial',
      message: backendResponse.kafka.message,
      rawData: backendResponse.kafka,
    });
  }

  if (backendResponse.deploymentManifestFile) {
    tasks.push({
      task: 'Deployment Manifest',
      status: backendResponse.deploymentManifestFile.status as 'Success' | 'Failure' | 'Partial',
      message: backendResponse.deploymentManifestFile.message,
      rawData: backendResponse.deploymentManifestFile,
    });
  }

  if (backendResponse.orionPropertiesFile) {
    tasks.push({
      task: 'Orion Properties',
      status: backendResponse.orionPropertiesFile.status as 'Success' | 'Failure' | 'Partial',
      message: backendResponse.orionPropertiesFile.message,
      rawData: backendResponse.orionPropertiesFile,
    });
  }

  if (backendResponse.fallbackDB) {
    tasks.push({
      task: 'Fallback DB',
      status: backendResponse.fallbackDB.status as 'Success' | 'Failure' | 'Partial',
      message: backendResponse.fallbackDB.message,
      rawData: backendResponse.fallbackDB,
    });
  }

  if (backendResponse.concourseVault) {
    tasks.push({
      task: 'Concourse Vault',
      status: backendResponse.concourseVault.status as 'Success' | 'Failure' | 'Partial',
      message: backendResponse.concourseVault.message,
      rawData: backendResponse.concourseVault,
    });
  }

  return { tasks };
};

export const onboardOnp = async (
  request: OnboardRequest
): Promise<OnboardResponse> => {
  try {
    // Extract headers from request
    const headers: Record<string, string> = {};
    
    // Generate trackingId if not provided (required by backend)
    headers['trackingId'] = `onboard-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    // Add environment header if provided
    if (request.environment) {
      headers['environment'] = request.environment;
    }
    
    if (request.requestCriteria) {
      headers['requestCriteria'] = request.requestCriteria.join(',');
    }
    if (request.commitMessage) {
      headers['commitMessage'] = request.commitMessage;
    }
    if (request.gitAccessToken) {
      headers['gitAccessToken'] = request.gitAccessToken;
    }
    
    // Handle authorization token
    // If custom authorization is provided, use it (overrides SSO token from interceptor)
    // Otherwise, the interceptor will add the SSO token
    if (request.authorization) {
      // Prefix "Bearer " if not already present
      const token = request.authorization.trim();
      headers['Authorization'] = token.startsWith('Bearer ') ? token : `Bearer ${token}`;
    }

    // Build request body - backend expects ONPEventRequest structure
    const body: any = {};
    
    if (request.eventName) {
      body.eventName = request.eventName;
    }
    // Backend expects headerSchema and payloadSchema as escaped JSON string
    // Process: Accept pure JSON -> parse -> minify (remove whitespace) -> escape as string
    // Example: {"type":"object"} -> "{\"type\":\"object\"}"
    if (request.headerSchema) {
      try {
        let parsed: any;
        if (typeof request.headerSchema === 'string') {
          // Parse the JSON string (handles both pure JSON and already-escaped strings)
          const firstParse = JSON.parse(request.headerSchema);
          // If first parse gives us a string, it was already escaped, parse again
          parsed = typeof firstParse === 'string' ? JSON.parse(firstParse) : firstParse;
        } else {
          parsed = request.headerSchema;
        }
        // Minify by stringifying (removes whitespace/newlines) and then escape as string
        body.headerSchema = JSON.stringify(JSON.stringify(parsed));
      } catch (error) {
        // If parsing fails, throw error
        throw new Error('Invalid headerSchema JSON: ' + (error instanceof Error ? error.message : String(error)));
      }
    }
    if (request.payloadSchema) {
      try {
        let parsed: any;
        if (typeof request.payloadSchema === 'string') {
          // Parse the JSON string (handles both pure JSON and already-escaped strings)
          const firstParse = JSON.parse(request.payloadSchema);
          // If first parse gives us a string, it was already escaped, parse again
          parsed = typeof firstParse === 'string' ? JSON.parse(firstParse) : firstParse;
        } else {
          parsed = request.payloadSchema;
        }
        // Minify by stringifying (removes whitespace/newlines) and then escape as string
        body.payloadSchema = JSON.stringify(JSON.stringify(parsed));
      } catch (error) {
        // If parsing fails, throw error
        throw new Error('Invalid payloadSchema JSON: ' + (error instanceof Error ? error.message : String(error)));
      }
    }
    if (request.downstreamDetails && request.downstreamDetails.length > 0) {
      // Transform downstreamDetails to match backend types
      body.downstreamDetails = request.downstreamDetails.map(detail => ({
        name: detail.name,
        endpoint: detail.endpoint,
        clientId: detail.clientId,
        clientSecret: detail.clientSecret,
        scope: detail.scope,
        httpStatusCode: detail.httpStatusCode?.toString(), // Backend expects String
        maintenanceFlag: detail.maintenanceFlag ? 1 : 0, // Backend expects int (0 or 1)
        maxRetryCount: detail.maxRetryCount || 0, // Backend expects int
        retryDelay: detail.retryDelay || 0, // Backend expects int
      }));
    }
    if (request.subscriberName) {
      body.subscriberName = request.subscriberName;
    }
    if (request.numPartitions !== undefined) {
      body.numPartitions = request.numPartitions;
    }
    if (request.replicationFactor !== undefined) {
      body.replicationFactor = request.replicationFactor;
    }
    // Add branchName if available (backend supports it but frontend doesn't currently collect it)
    // This can be added to the form later if needed

    // Ensure Authorization header is properly set if provided
    const requestConfig: any = { headers };
    
    // Log for debugging (remove in production if needed)
    if (headers.Authorization) {
      console.log('Sending request with Authorization header');
    } else {
      console.warn('No Authorization header in request - token may be missing');
    }

    const response = await apiClient.post<ONPEventResponse>(
      `${API_BASE_URL}/onboardonp`,
      body,
      requestConfig
    );

    // Transform backend response to frontend expected format
    return transformResponse(response.data);
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError<any>;
      const status = axiosError.response?.status;
      const responseData = axiosError.response?.data;

      // Check if backend returned a structured ONPEventResponse (even on error)
      if (responseData && typeof responseData === 'object' && 
          ('mongoDBAndRedis' in responseData || 'kafka' in responseData || 
           'deploymentManifestFile' in responseData || 'orionPropertiesFile' in responseData ||
           'fallbackDB' in responseData || 'concourseVault' in responseData)) {
        // Transform and return the response even if status code indicates error
        // This allows partial success scenarios to be handled properly
        return transformResponse(responseData as ONPEventResponse);
      }

      // Handle different error scenarios with user-friendly messages
      if (status === 400) {
        let errorMessage = 'Invalid request. ';
        if (responseData) {
          if (typeof responseData === 'string') {
            errorMessage += responseData;
          } else if (responseData.message) {
            errorMessage += responseData.message;
          } else if (responseData.error) {
            errorMessage += responseData.error;
          } else {
            errorMessage += 'Please check your request data and try again.';
          }
        } else {
          errorMessage += 'Please check your request data and try again.';
        }
        throw new Error(errorMessage);
      } else if (status === 401) {
        throw new Error('Authentication failed. Please check your authorization token or generate a new one.');
      } else if (status === 403) {
        throw new Error('Access forbidden. You may not have permission to update events in this environment.');
      } else if (status === 404) {
        throw new Error('Event not found. The specified event does not exist in the selected environment. Please verify the event name and try again.');
      } else if (status === 500) {
        const serverError = responseData?.message || responseData?.error || 'Internal server error';
        throw new Error(`Server error: ${serverError}. Please try again later or contact support.`);
      } else if (status === 503) {
        throw new Error('Service not reachable. The update service is currently unavailable. Please try again later.');
      } else if (responseData) {
        if (typeof responseData === 'string') {
          throw new Error(responseData);
        } else if (responseData.message) {
          throw new Error(responseData.message);
        } else if (responseData.error) {
          throw new Error(responseData.error);
        }
      }
      
      throw new Error(
        axiosError.message || 
        `Request failed with status code ${status || 'unknown'}. Please try again.`
      );
    }
    throw error;
  }
};

export const fetchKafkaDetails = async (
  request: KafkaDetailsRequest,
  trackingId?: string,
  environment?: string,
  authorization?: string
): Promise<KafkaDetailsListResponse> => {
  try {
    const headers: Record<string, string> = {};
    
    if (trackingId) {
      headers['trackingId'] = trackingId;
    } else {
      // Generate a simple tracking ID if not provided
      headers['trackingId'] = `kafka-details-${Date.now()}`;
    }
    
    // Add environment header if provided
    if (environment) {
      headers['environment'] = environment;
    }

    // Add custom authorization token if provided (overrides SSO token from interceptor)
    if (authorization) {
      const token = authorization.trim();
      headers['Authorization'] = token.startsWith('Bearer ') ? token : `Bearer ${token}`;
    }

    // Log for debugging
    if (headers.Authorization) {
      console.log('Sending Kafka details request with Authorization header');
    } else {
      console.warn('No Authorization header in Kafka details request - token may be missing');
    }

    const response = await apiClient.post<KafkaDetailsListResponse>(
      `${API_BASE_URL}/kafkaDetails`,
      request,
      { headers }
    );

    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError<any>;
      const status = axiosError.response?.status;
      const responseData = axiosError.response?.data;

      // Handle different error scenarios with user-friendly messages
      if (status === 400) {
        // Check if backend returned a structured KafkaDetailsListResponse
        // Some backends return 400 with structured data that we should still process
        if (responseData && typeof responseData === 'object' && 
            ('topicDetails' in responseData || 'status' in responseData || 'message' in responseData)) {
          // This looks like a KafkaDetailsListResponse - return it so component can handle it
          // The component will check status and topicDetails to show appropriate messages
          return responseData as KafkaDetailsListResponse;
        }
        
        // Bad request - likely invalid topic names or missing topics
        let errorMessage = 'Invalid request. ';
        
        if (responseData) {
          // Try to extract meaningful error message from response
          if (typeof responseData === 'string') {
            errorMessage += responseData;
          } else if (responseData.message) {
            errorMessage += responseData.message;
          } else if (responseData.error) {
            errorMessage += responseData.error;
          } else {
            errorMessage += 'One or more Kafka topics may not exist in the specified environment. Please verify the topic names and try again.';
          }
        } else {
          errorMessage += 'One or more Kafka topics may not exist in the specified environment. Please verify the topic names and try again.';
        }
        
        throw new Error(errorMessage);
      } else if (status === 401) {
        throw new Error('Authentication failed. Please check your authorization token or generate a new one.');
      } else if (status === 403) {
        throw new Error('Access forbidden. You may not have permission to access Kafka details for this environment.');
      } else if (status === 404) {
        throw new Error('The Kafka details endpoint was not found. Please contact support.');
      } else if (status === 500) {
        const serverError = responseData?.message || responseData?.error || 'Internal server error';
        throw new Error(`Server error: ${serverError}. Please try again later or contact support.`);
      } else if (responseData) {
        // Try to extract error message from response
        if (typeof responseData === 'string') {
          throw new Error(responseData);
        } else if (responseData.message) {
          throw new Error(responseData.message);
        } else if (responseData.error) {
          throw new Error(responseData.error);
        }
      }
      
      // Fallback to status-specific message
      throw new Error(
        axiosError.message || 
        `Request failed with status code ${status || 'unknown'}. Please try again.`
      );
    }
    throw error;
  }
};

export const fetchMongoDBDetails = async (
  request: MongoDBDetailsRequest,
  trackingId?: string,
  environment?: string,
  authorization?: string
): Promise<MongoDBDetailsResponse> => {
  try {
    // Validate request structure
    if (!request || !request.eventNames || !Array.isArray(request.eventNames) || request.eventNames.length === 0) {
      throw new Error('Invalid request: eventNames array is required and must not be empty');
    }

    const headers: Record<string, string> = {};
    
    if (trackingId) {
      headers['trackingId'] = trackingId;
    } else {
      // Generate a simple tracking ID if not provided
      headers['trackingId'] = `mongodb-details-${Date.now()}`;
    }
    
    // Add environment header if provided
    if (environment) {
      headers['environment'] = environment;
    }

    // Add custom authorization token if provided (overrides SSO token from interceptor)
    if (authorization) {
      const token = authorization.trim();
      headers['Authorization'] = token.startsWith('Bearer ') ? token : `Bearer ${token}`;
    }

    // Log for debugging
    console.log('MongoDB Details Request:', {
      url: `${API_BASE_URL}/mongoDBDetails`,
      headers: { ...headers, Authorization: headers.Authorization ? '***masked***' : undefined },
      body: request
    });

    const response = await apiClient.post<MongoDBDetailsResponse>(
      `${API_BASE_URL}/mongoDBDetails`,
      request,
      { 
        headers: {
          ...headers,
          'Content-Type': 'application/json'
        }
      }
    );

    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError<any>;
      const status = axiosError.response?.status;
      const responseData = axiosError.response?.data;
      const responseHeaders = axiosError.response?.headers;

      // Log error details for debugging
      console.error('MongoDB Details Request Error:', {
        status,
        statusText: axiosError.response?.statusText,
        headers: responseHeaders,
        data: responseData,
        message: axiosError.message,
        request: {
          url: axiosError.config?.url,
          method: axiosError.config?.method,
          headers: axiosError.config?.headers,
          data: axiosError.config?.data
        }
      });

      // Check if backend returned a structured MongoDBDetailsResponse
      if (status === 400 && responseData && typeof responseData === 'object' && 
          ('eventDetails' in responseData || 'status' in responseData || 'message' in responseData)) {
        // This looks like a MongoDBDetailsResponse - return it so component can handle it
        return responseData as MongoDBDetailsResponse;
      }

      // Handle different error scenarios with user-friendly messages
      if (status === 400) {
        let errorMessage = 'Bad Request (400): ';
        
        // Check if response has content
        if (responseData === null || responseData === undefined || 
            (typeof responseData === 'string' && responseData.trim() === '') ||
            (typeof responseData === 'object' && Object.keys(responseData).length === 0)) {
          // Empty response body - likely a validation error before reaching controller
          errorMessage += 'Request validation failed. Please check: ';
          errorMessage += '1) Request body structure is correct (eventNames array is required), ';
          errorMessage += '2) All required headers are present (trackingId), ';
          errorMessage += '3) Content-Type is application/json. ';
          errorMessage += `Request sent: ${JSON.stringify(request)}`;
        } else if (typeof responseData === 'string') {
          errorMessage += responseData;
        } else if (responseData.message) {
          errorMessage += responseData.message;
        } else if (responseData.error) {
          errorMessage += responseData.error;
        } else {
          errorMessage += 'Invalid request format or missing required fields. Please verify the request structure and try again.';
        }
        throw new Error(errorMessage);
      } else if (status === 401) {
        throw new Error('Authentication failed. Please check your authorization token or generate a new one.');
      } else if (status === 403) {
        throw new Error('Access forbidden. You may not have permission to access MongoDB details for this environment.');
      } else if (status === 404) {
        throw new Error('The MongoDB details endpoint was not found. Please contact support.');
      } else if (status === 500) {
        const serverError = responseData?.message || responseData?.error || 'Internal server error';
        throw new Error(`Server error: ${serverError}. Please try again later or contact support.`);
      } else if (responseData) {
        if (typeof responseData === 'string') {
          throw new Error(responseData);
        } else if (responseData.message) {
          throw new Error(responseData.message);
        } else if (responseData.error) {
          throw new Error(responseData.error);
        }
      }
      
      throw new Error(
        axiosError.message || 
        `Request failed with status code ${status || 'unknown'}. Please try again.`
      );
    }
    throw error;
  }
};

export const updateOnp = async (
  request: OnboardRequest
): Promise<OnboardResponse> => {
  try {
    // Extract headers from request
    const headers: Record<string, string> = {};
    
    // Generate trackingId if not provided (required by backend)
    headers['trackingId'] = `update-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    // Add environment header if provided
    if (request.environment) {
      headers['environment'] = request.environment;
    }
    
    // Add requestCriteria header if provided
    if (request.requestCriteria && request.requestCriteria.length > 0) {
      headers['requestCriteria'] = request.requestCriteria.join(',');
    }
    
    // Handle authorization token
    if (request.authorization) {
      const token = request.authorization.trim();
      headers['Authorization'] = token.startsWith('Bearer ') ? token : `Bearer ${token}`;
    }

    // Build request body - backend expects ONPEventRequest structure
    const body: any = {};
    
    if (request.eventName) {
      body.eventName = request.eventName;
    }
    
    // Process headerSchema and payloadSchema similar to onboard
    if (request.headerSchema) {
      try {
        let parsed: any;
        if (typeof request.headerSchema === 'string') {
          const firstParse = JSON.parse(request.headerSchema);
          parsed = typeof firstParse === 'string' ? JSON.parse(firstParse) : firstParse;
        } else {
          parsed = request.headerSchema;
        }
        body.headerSchema = JSON.stringify(JSON.stringify(parsed));
      } catch (error) {
        throw new Error('Invalid headerSchema JSON: ' + (error instanceof Error ? error.message : String(error)));
      }
    }
    
    if (request.payloadSchema) {
      try {
        let parsed: any;
        if (typeof request.payloadSchema === 'string') {
          const firstParse = JSON.parse(request.payloadSchema);
          parsed = typeof firstParse === 'string' ? JSON.parse(firstParse) : firstParse;
        } else {
          parsed = request.payloadSchema;
        }
        body.payloadSchema = JSON.stringify(JSON.stringify(parsed));
      } catch (error) {
        throw new Error('Invalid payloadSchema JSON: ' + (error instanceof Error ? error.message : String(error)));
      }
    }
    
    if (request.downstreamDetails && request.downstreamDetails.length > 0) {
      body.downstreamDetails = request.downstreamDetails.map(detail => ({
        name: detail.name,
        endpoint: detail.endpoint,
        clientId: detail.clientId,
        clientSecret: detail.clientSecret,
        scope: detail.scope,
        httpStatusCode: detail.httpStatusCode?.toString(),
        maintenanceFlag: detail.maintenanceFlag ? 1 : 0,
        maxRetryCount: detail.maxRetryCount || 0,
        retryDelay: detail.retryDelay || 0,
      }));
    }
    
    if (request.subscriberName) {
      body.subscriberName = request.subscriberName;
    }

    const requestConfig: any = { headers };
    
    if (headers.Authorization) {
      console.log('Sending update request with Authorization header');
    } else {
      console.warn('No Authorization header in update request - token may be missing');
    }

    const response = await apiClient.put<ONPEventResponse>(
      `${API_BASE_URL}/updateonp`,
      body,
      requestConfig
    );

    // Transform backend response to frontend expected format
    return transformResponse(response.data);
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError<any>;
      const status = axiosError.response?.status;
      const responseData = axiosError.response?.data;

      // Check if backend returned a structured ONPEventResponse (even on error)
      if (responseData && typeof responseData === 'object' && 
          ('mongoDBAndRedis' in responseData || 'kafka' in responseData || 
           'deploymentManifestFile' in responseData || 'orionPropertiesFile' in responseData ||
           'fallbackDB' in responseData || 'concourseVault' in responseData)) {
        return transformResponse(responseData as ONPEventResponse);
      }

      // Handle different error scenarios with user-friendly messages
      if (status === 400) {
        let errorMessage = 'Invalid request. ';
        if (responseData) {
          if (typeof responseData === 'string') {
            errorMessage += responseData;
          } else if (responseData.message) {
            errorMessage += responseData.message;
          } else if (responseData.error) {
            errorMessage += responseData.error;
          } else {
            errorMessage += 'Please check your request data and try again.';
          }
        } else {
          errorMessage += 'Please check your request data and try again.';
        }
        throw new Error(errorMessage);
      } else if (status === 401) {
        throw new Error('Authentication failed. Please check your authorization token or generate a new one.');
      } else if (status === 403) {
        throw new Error('Access forbidden. You may not have permission to update events in this environment.');
      } else if (status === 404) {
        throw new Error('Event not found. The event you are trying to update does not exist in the specified environment.');
      } else if (status === 500) {
        const serverError = responseData?.message || responseData?.error || 'Internal server error';
        throw new Error(`Server error: ${serverError}. Please try again later or contact support.`);
      } else if (responseData) {
        if (typeof responseData === 'string') {
          throw new Error(responseData);
        } else if (responseData.message) {
          throw new Error(responseData.message);
        } else if (responseData.error) {
          throw new Error(responseData.error);
        }
      }
      
      throw new Error(
        axiosError.message || 
        `Request failed with status code ${status || 'unknown'}. Please try again.`
      );
    }
    throw error;
  }
};

