import axios from 'axios';
import { onboardOnp } from '../api';
import type { OnboardRequest, OnboardResponse } from '../../types';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('api', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should successfully call onboardOnp API', async () => {
    const mockResponse: OnboardResponse = {
      tasks: [
        {
          task: 'mongoDBAndRedis',
          status: 'Success',
          message: 'Successfully onboarded',
        },
      ],
    };

    mockedAxios.post.mockResolvedValue({ data: mockResponse });

    const request: OnboardRequest = {
      requestCriteria: ['mongodbandredis'],
      eventName: 'test-event',
      headerSchema: '{"type": "object"}',
      payloadSchema: '{"type": "object"}',
      subscriberName: 'test-subscriber',
    };

    const result = await onboardOnp(request);

    expect(mockedAxios.post).toHaveBeenCalledWith(
      expect.stringContaining('/onboardonp'),
      expect.objectContaining({
        eventName: 'test-event',
        headerSchema: { type: 'object' },
        payloadSchema: { type: 'object' },
        subscriberName: 'test-subscriber',
      }),
      expect.objectContaining({
        headers: expect.objectContaining({
          requestCriteria: 'mongodbandredis',
        }),
      })
    );

    expect(result).toEqual(mockResponse);
  });

  it('should parse JSON schemas correctly', async () => {
    const mockResponse: OnboardResponse = {
      tasks: [],
    };

    mockedAxios.post.mockResolvedValue({ data: mockResponse });

    const request: OnboardRequest = {
      requestCriteria: ['mongodbandredis'],
      headerSchema: '{"type": "object", "properties": {}}',
      payloadSchema: '{"type": "object"}',
    };

    await onboardOnp(request);

    expect(mockedAxios.post).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        headerSchema: { type: 'object', properties: {} },
        payloadSchema: { type: 'object' },
      }),
      expect.any(Object)
    );
  });

  it('should throw error for invalid JSON in headerSchema', async () => {
    const request: OnboardRequest = {
      requestCriteria: ['mongodbandredis'],
      headerSchema: 'invalid json',
    };

    await expect(onboardOnp(request)).rejects.toThrow('Invalid headerSchema JSON');
  });

  it('should handle API errors gracefully', async () => {
    const errorMessage = 'Network error';
    mockedAxios.post.mockRejectedValue(new Error(errorMessage));

    const request: OnboardRequest = {
      requestCriteria: ['mongodbandredis'],
    };

    await expect(onboardOnp(request)).rejects.toThrow(errorMessage);
  });

  it('should include headers correctly', async () => {
    const mockResponse: OnboardResponse = { tasks: [] };
    mockedAxios.post.mockResolvedValue({ data: mockResponse });

    const request: OnboardRequest = {
      requestCriteria: ['mongodbandredis', 'kafkatopic'],
      commitMessage: 'test commit',
      gitAccessToken: 'token123',
    };

    await onboardOnp(request);

    expect(mockedAxios.post).toHaveBeenCalledWith(
      expect.any(String),
      expect.any(Object),
      expect.objectContaining({
        headers: expect.objectContaining({
          requestCriteria: 'mongodbandredis,kafkatopic',
          commitMessage: 'test commit',
          gitAccessToken: 'token123',
        }),
      })
    );
  });
});

