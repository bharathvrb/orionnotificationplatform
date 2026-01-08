export type RequestCriteria =
  | 'mongodbandredis'
  | 'kafkatopic'
  | 'deploymentmanifest'
  | 'orionproperties'
  | 'fallbackdb'
  | 'concoursevault';

export interface DownstreamDetail {
  name: string;
  endpoint?: string;
  clientId?: string;
  clientSecret?: string;
  scope?: string;
  httpStatusCode?: number;
  maintenanceFlag?: boolean;
  maxRetryCount?: number;
  retryDelay?: number;
}

export type Environment =
  | 'DEV AS-G8'
  | 'DEV HO-G2'
  | 'QA AS-G8'
  | 'QA HO-G2'
  | 'INT AS-G8'
  | 'INT HO-G2'
  | 'FLX AS-G8'
  | 'FLX HO-G2'
  | 'TRN AS-G8'
  | 'TRN HO-G2'
  | 'STG CH2-G2'
  | 'STG HO-G4'
  | 'PROD G1'
  | 'PROD AS-G6'
  | 'PROD HO-G1'
  | 'PROD HO-G3'
  | 'BUS AS-G8'
  | 'BUS HO-G2';

export interface OnboardRequest {
  environment?: Environment;
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
  authorization?: string;
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

export interface KafkaDetailsResponse {
  topicName?: string;
  health?: string;
  status?: string;
  message?: string;
  partitions?: number;
  replicationFactor?: number;
  config?: Record<string, string>;
  consumerGroups?: string[];
}

export interface KafkaDetailsRequest {
  topicNames: string[];
}

export interface KafkaDetailsListResponse {
  status?: string;
  message?: string;
  topicDetails?: KafkaDetailsResponse[];
}

export interface MongoDBDetailsRequest {
  eventNames: string[];
}

export interface Downstream {
  downstreamId?: string;
  downstreamName?: string;
  endpoint?: string;
  credentialsId?: string;
  createdTimestamp?: string;
  updateTimestamp?: string;
  authenticationType?: string;
}

export interface Authorization {
  downstreamId?: string;
  credentialsId?: string;
  downstreamName?: string;
  clientId?: string;
  clientSecret?: string;
  grantType?: string;
  scope?: string;
}

export interface MongoDBData {
  schemaId?: string;
  eventType?: string;
  schemaType?: string;
  topic?: string;
  schemaDefinition?: string;
  createdDate?: string;
  updatedDate?: string;
  downstream?: Downstream[];
}

export interface RedisData {
  notificationSchema?: string;
  authorizations?: string[];
}

export interface DownstreamDetailWithAuth {
  downstream?: Downstream;
  authorization?: Authorization;
}

export interface EventDetail {
  eventType?: string;
  mongoDBData?: MongoDBData;
  redisData?: RedisData;
  downstreamDetails?: DownstreamDetailWithAuth[];
}

export interface MongoDBDetailsResponse {
  status?: string;
  message?: string;
  eventDetails?: EventDetail[];
}

