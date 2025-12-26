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
    const token = await getValidAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
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

    const response = await apiClient.post<ONPEventResponse>(
      `${API_BASE_URL}/onboardonp`,
      body,
      { headers }
    );

    // Transform backend response to frontend expected format
    return transformResponse(response.data);
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError<{ message?: string } | ONPEventResponse>;
      if (axiosError.response?.data) {
        // Try to transform if it's an ONPEventResponse
        if ('mongoDBAndRedis' in axiosError.response.data || 'kafka' in axiosError.response.data) {
          return transformResponse(axiosError.response.data as ONPEventResponse);
        }
        // Otherwise throw error
        const errorData = axiosError.response.data as { message?: string };
        throw new Error(
          errorData.message || 
          axiosError.message || 
          'Failed to onboard ONP'
        );
      }
      throw new Error(axiosError.message || 'Network error');
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

    const response = await apiClient.post<KafkaDetailsListResponse>(
      `${API_BASE_URL}/kafkaDetails`,
      request,
      { headers }
    );

    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError<{ message?: string }>;
      if (axiosError.response?.data) {
        // If server returns structured error, return it
        if (axiosError.response.data.message) {
          throw new Error(axiosError.response.data.message);
        }
        throw new Error(
          axiosError.response.data.message || 
          axiosError.message || 
          'Failed to fetch Kafka details'
        );
      }
      throw new Error(axiosError.message || 'Network error');
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

    const response = await apiClient.post<MongoDBDetailsResponse>(
      `${API_BASE_URL}/mongoDBDetails`,
      request,
      { headers }
    );

    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError<{ message?: string }>;
      if (axiosError.response?.data) {
        // If server returns structured error, return it
        if (axiosError.response.data.message) {
          throw new Error(axiosError.response.data.message);
        }
        throw new Error(
          axiosError.response.data.message || 
          axiosError.message || 
          'Failed to fetch MongoDB details'
        );
      }
      throw new Error(axiosError.message || 'Network error');
    }
    throw error;
  }
};

