export type RequestCriteria =
  | 'mongodbandredis'
  | 'kafkatopic'
  | 'deploymentmanifest'
  | 'orionproperties'
  | 'fallbackdb'
  | 'concoursevault';

export interface DownstreamDetail {
  name: string;
  endpoint: string;
  clientId: string;
  clientSecret: string;
  scope: string;
  subscriberName?: string;
  httpStatusCode?: number;
}

export interface OnboardRequest {
  requestCriteria: RequestCriteria[];
  eventName?: string;
  headerSchema?: string; // JSON string
  payloadSchema?: string; // JSON string
  downstreamDetails?: DownstreamDetail[];
  subscriberName?: string;
  numPartitions?: number;
  replicationFactor?: number;
  commitMessage?: string;
  gitAccessToken?: string;
}

export interface TaskResult {
  task: string;
  status: 'Success' | 'Failure' | 'Partial';
  message: string;
  rawData?: any;
}

export interface OnboardResponse {
  tasks: TaskResult[];
}

export interface ValidationError {
  field: string;
  message: string;
}

