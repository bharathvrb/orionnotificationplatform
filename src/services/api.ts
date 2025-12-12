import axios, { type AxiosError } from 'axios';
import type { OnboardRequest, OnboardResponse } from '../types';
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

export const onboardOnp = async (
  request: OnboardRequest
): Promise<OnboardResponse> => {
  try {
    // Extract headers from request
    const headers: Record<string, string> = {};
    
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

    // Build request body
    const body: any = {};
    
    if (request.eventName) {
      body.eventName = request.eventName;
    }
    if (request.headerSchema) {
      try {
        body.headerSchema = JSON.parse(request.headerSchema);
      } catch (e) {
        throw new Error('Invalid headerSchema JSON');
      }
    }
    if (request.payloadSchema) {
      try {
        body.payloadSchema = JSON.parse(request.payloadSchema);
      } catch (e) {
        throw new Error('Invalid payloadSchema JSON');
      }
    }
    if (request.downstreamDetails && request.downstreamDetails.length > 0) {
      body.downstreamDetails = request.downstreamDetails;
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

    const response = await apiClient.post<OnboardResponse>(
      `${API_BASE_URL}/onboardonp`,
      body,
      { headers }
    );

    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError<{ message?: string; tasks?: any[] }>;
      if (axiosError.response?.data) {
        // If server returns structured error with tasks, return it
        if (axiosError.response.data.tasks) {
          return axiosError.response.data as OnboardResponse;
        }
        throw new Error(
          axiosError.response.data.message || 
          axiosError.message || 
          'Failed to onboard ONP'
        );
      }
      throw new Error(axiosError.message || 'Network error');
    }
    throw error;
  }
};

