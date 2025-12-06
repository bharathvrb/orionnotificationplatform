import { validateRequest, getTasksForCriteria } from '../validation';
import type { OnboardRequest, RequestCriteria } from '../../types';

describe('validation', () => {
  describe('validateRequest', () => {
    it('should return no errors for valid mongodbandredis request', () => {
      const request: OnboardRequest = {
        requestCriteria: ['mongodbandredis'],
        eventName: 'test-event',
        headerSchema: '{"type": "object"}',
        payloadSchema: '{"type": "object"}',
        subscriberName: 'test-subscriber',
        downstreamDetails: [
          {
            name: 'test-downstream',
            endpoint: 'https://example.com',
            clientId: 'client-id',
            clientSecret: 'client-secret',
            scope: 'scope',
            subscriberName: 'test-subscriber',
          },
        ],
      };

      const errors = validateRequest(request);
      expect(errors).toHaveLength(0);
    });

    it('should return errors for missing required fields in mongodbandredis', () => {
      const request: OnboardRequest = {
        requestCriteria: ['mongodbandredis'],
      };

      const errors = validateRequest(request);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors.some((e) => e.field === 'eventName')).toBe(true);
      expect(errors.some((e) => e.field === 'headerSchema')).toBe(true);
      expect(errors.some((e) => e.field === 'payloadSchema')).toBe(true);
      expect(errors.some((e) => e.field === 'subscriberName')).toBe(true);
    });

    it('should return errors for invalid JSON in schemas', () => {
      const request: OnboardRequest = {
        requestCriteria: ['mongodbandredis'],
        eventName: 'test-event',
        headerSchema: 'invalid json',
        payloadSchema: '{"type": "object"}',
        subscriberName: 'test-subscriber',
        downstreamDetails: [],
      };

      const errors = validateRequest(request);
      expect(errors.some((e) => e.field === 'headerSchema' && e.message.includes('valid JSON'))).toBe(true);
    });

    it('should validate kafkatopic requirements', () => {
      const request: OnboardRequest = {
        requestCriteria: ['kafkatopic'],
      };

      const errors = validateRequest(request);
      expect(errors.some((e) => e.field === 'subscriberName')).toBe(true);
      expect(errors.some((e) => e.field === 'numPartitions')).toBe(true);
      expect(errors.some((e) => e.field === 'replicationFactor')).toBe(true);
    });

    it('should validate deploymentmanifest requirements', () => {
      const request: OnboardRequest = {
        requestCriteria: ['deploymentmanifest'],
      };

      const errors = validateRequest(request);
      expect(errors.some((e) => e.field === 'subscriberName')).toBe(true);
      expect(errors.some((e) => e.field === 'commitMessage')).toBe(true);
      expect(errors.some((e) => e.field === 'gitAccessToken')).toBe(true);
    });

    it('should validate fallbackdb requirements', () => {
      const request: OnboardRequest = {
        requestCriteria: ['fallbackdb'],
        downstreamDetails: [
          {
            name: 'test',
            endpoint: 'https://example.com',
            clientId: 'id',
            clientSecret: 'secret',
            scope: 'scope',
          },
        ],
      };

      const errors = validateRequest(request);
      expect(errors.some((e) => e.field.includes('httpStatusCode'))).toBe(true);
    });

    it('should validate concoursevault requirements', () => {
      const request: OnboardRequest = {
        requestCriteria: ['concoursevault'],
      };

      const errors = validateRequest(request);
      expect(errors.some((e) => e.field === 'subscriberName')).toBe(true);
    });
  });

  describe('getTasksForCriteria', () => {
    it('should map criteria to task names correctly', () => {
      const criteria: RequestCriteria[] = [
        'mongodbandredis',
        'kafkatopic',
        'deploymentmanifest',
      ];
      const tasks = getTasksForCriteria(criteria);
      expect(tasks).toEqual(['mongoDBAndRedis', 'kafka', 'deploymentManifest']);
    });

    it('should return empty array for empty criteria', () => {
      const tasks = getTasksForCriteria([]);
      expect(tasks).toEqual([]);
    });
  });
});

