import type { OnboardRequest, RequestCriteria, ValidationError } from '../types';

export const validateRequest = (
  request: OnboardRequest
): ValidationError[] => {
  const errors: ValidationError[] = [];
  const criteria = request.requestCriteria || [];

  // If no criteria selected, return empty errors (validation message shown separately in UI)
  if (criteria.length === 0) {
    return errors;
  }

  // Validate authorization token (required for all requests)
  if (!request.authorization?.trim()) {
    errors.push({ field: 'authorization', message: 'Authorization token is required' });
  }

  // Validate mongodbandredis
  if (criteria.includes('mongodbandredis')) {
    if (!request.eventName?.trim()) {
      errors.push({ field: 'eventName', message: 'Event name is required for MongoDB and Redis' });
    }
    if (!request.headerSchema?.trim()) {
      errors.push({ field: 'headerSchema', message: 'Header schema is required for MongoDB and Redis' });
    } else {
      try {
        JSON.parse(request.headerSchema);
      } catch (e) {
        errors.push({ field: 'headerSchema', message: 'Header schema must be valid JSON' });
      }
    }
    if (!request.payloadSchema?.trim()) {
      errors.push({ field: 'payloadSchema', message: 'Payload schema is required for MongoDB and Redis' });
    } else {
      try {
        JSON.parse(request.payloadSchema);
      } catch (e) {
        errors.push({ field: 'payloadSchema', message: 'Payload schema must be valid JSON' });
      }
    }
    if (!request.downstreamDetails || request.downstreamDetails.length === 0) {
      errors.push({ field: 'downstreamDetails', message: 'At least one downstream detail is required for MongoDB and Redis' });
    } else {
      request.downstreamDetails.forEach((detail, index) => {
        if (!detail.name?.trim()) {
          errors.push({ field: `downstreamDetails[${index}].name`, message: 'Name is required' });
        }
        if (!detail.endpoint?.trim()) {
          errors.push({ field: `downstreamDetails[${index}].endpoint`, message: 'Endpoint is required' });
        }
        const hasAnyClientFields = !!(detail.clientId?.trim() || detail.clientSecret?.trim() || detail.scope?.trim());
        if (hasAnyClientFields) {
          if (!detail.clientId?.trim()) {
            errors.push({ field: `downstreamDetails[${index}].clientId`, message: 'Client ID is required when any client credential is provided' });
          }
          if (!detail.clientSecret?.trim()) {
            errors.push({ field: `downstreamDetails[${index}].clientSecret`, message: 'Client secret is required when any client credential is provided' });
          }
          if (!detail.scope?.trim()) {
            errors.push({ field: `downstreamDetails[${index}].scope`, message: 'Scope is required when any client credential is provided' });
          }
        }
      });
    }
    if (!request.subscriberName?.trim()) {
      errors.push({ field: 'subscriberName', message: 'Subscriber name is required for MongoDB and Redis' });
    }
  }

  // Validate kafkatopic
  if (criteria.includes('kafkatopic')) {
    if (!request.subscriberName?.trim()) {
      errors.push({ field: 'subscriberName', message: 'Subscriber name is required for Kafka topic' });
    }
    if (request.numPartitions === undefined || request.numPartitions < 1) {
      errors.push({ field: 'numPartitions', message: 'Number of partitions is required and must be at least 1' });
    }
    if (request.replicationFactor === undefined || request.replicationFactor < 1) {
      errors.push({ field: 'replicationFactor', message: 'Replication factor is required and must be at least 1' });
    }
  }

  // Validate deploymentmanifest
  if (criteria.includes('deploymentmanifest')) {
    if (!request.subscriberName?.trim()) {
      errors.push({ field: 'subscriberName', message: 'Subscriber name is required for deployment manifest' });
    }
    if (!request.commitMessage?.trim()) {
      errors.push({ field: 'commitMessage', message: 'Commit message is required for deployment manifest' });
    }
    if (!request.gitAccessToken?.trim()) {
      errors.push({ field: 'gitAccessToken', message: 'Git access token is required for deployment manifest' });
    }
  }

  // Validate orionproperties
  if (criteria.includes('orionproperties')) {
    if (!request.subscriberName?.trim()) {
      errors.push({ field: 'subscriberName', message: 'Subscriber name is required for Orion properties' });
    }
    if (!request.commitMessage?.trim()) {
      errors.push({ field: 'commitMessage', message: 'Commit message is required for Orion properties' });
    }
    if (!request.gitAccessToken?.trim()) {
      errors.push({ field: 'gitAccessToken', message: 'Git access token is required for Orion properties' });
    }
  }

  // Validate fallbackdb
  if (criteria.includes('fallbackdb')) {
    if (!request.downstreamDetails || request.downstreamDetails.length === 0) {
      errors.push({ field: 'downstreamDetails', message: 'At least one downstream detail is required for fallback DB' });
    } else {
      request.downstreamDetails.forEach((detail, index) => {
        if (!detail.name?.trim()) {
          errors.push({ field: `downstreamDetails[${index}].name`, message: 'Name is required for fallback DB' });
        }
        if (detail.httpStatusCode === undefined) {
          errors.push({ field: `downstreamDetails[${index}].httpStatusCode`, message: 'HTTP status code is required for fallback DB' });
        }
        if (detail.maintenanceFlag === undefined) {
          errors.push({ field: `downstreamDetails[${index}].maintenanceFlag`, message: 'Maintenance flag is required for fallback DB' });
        }
        if (detail.maxRetryCount === undefined) {
          errors.push({ field: `downstreamDetails[${index}].maxRetryCount`, message: 'Max retry count is required for fallback DB' });
        }
        if (detail.retryDelay === undefined) {
          errors.push({ field: `downstreamDetails[${index}].retryDelay`, message: 'Retry delay is required for fallback DB' });
        }
      });
    }
  }

  // Validate concoursevault
  if (criteria.includes('concoursevault')) {
    if (!request.subscriberName?.trim()) {
      errors.push({ field: 'subscriberName', message: 'Subscriber name is required for Concourse Vault' });
    }
  }

  return errors;
};

export const getTasksForCriteria = (criteria: RequestCriteria[]): string[] => {
  const taskMap: Record<RequestCriteria, string> = {
    mongodbandredis: 'mongoDBAndRedis',
    kafkatopic: 'kafka',
    deploymentmanifest: 'deploymentManifest',
    orionproperties: 'orionProperties',
    fallbackdb: 'fallbackDB',
    concoursevault: 'concourseVault',
  };

  return criteria.map(c => taskMap[c] || c);
};

