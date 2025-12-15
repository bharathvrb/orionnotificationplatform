import axios from 'axios';
import type { Environment } from '../types';

export interface SatTokenRequest {
  clientId: string;
  clientSecret: string;
  scope: string;
}

export interface SatTokenResponse {
  access_token: string;
  token_type?: string;
  expires_in?: number;
  scope?: string;
}

/**
 * Maps environment to the appropriate SAT endpoint URL
 */
export const getSatEndpoint = (environment: Environment): string => {
  // STG environments
  if (environment === 'STG CH2-G2' || environment === 'STG HO-G4') {
    return 'https://sat-stg.codebig2.net/v2/ws/token.oauth2';
  }
  
  // PROD environments
  if (
    environment === 'PROD G1' ||
    environment === 'PROD AS-G6' ||
    environment === 'PROD HO-G1' ||
    environment === 'PROD HO-G3'
  ) {
    return 'https://sat-prod.codebig2.net/v2/ws/token.oauth2';
  }
  
  // Default to CI endpoint for: QA AS-G8, QA HO-G2, DEV AS-G8, DEV HO-G2, INT, FLX, TRN, BUS
  // This includes: INT AS-G8, INT HO-G2, FLX AS-G8, FLA HO-G2, TRN AS-G8, TRN HO-G2, BUS AS-G8, BUS HO-G2
  return 'https://sat-ci.codebig2.net/v2/ws/token.oauth2';
};

/**
 * Generates an OAuth2 token from the SAT service
 */
export const generateSatToken = async (
  environment: Environment,
  credentials: SatTokenRequest
): Promise<string> => {
  const endpoint = getSatEndpoint(environment);
  
  try {
    const params = new URLSearchParams();
    params.append('grant_type', 'client_credentials');
    params.append('client_id', credentials.clientId);
    params.append('client_secret', credentials.clientSecret);
    params.append('scope', credentials.scope);

    const response = await axios.post<SatTokenResponse>(
      endpoint,
      params,
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      }
    );

    if (!response.data.access_token) {
      throw new Error('No access token received from SAT service');
    }

    return response.data.access_token;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const message = error.response?.data?.error_description || 
                     error.response?.data?.error ||
                     error.message ||
                     'Failed to generate SAT token';
      throw new Error(message);
    }
    throw error;
  }
};

