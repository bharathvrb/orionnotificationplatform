import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import type { OnboardRequest, RequestCriteria, TaskResult, Environment } from '../types';
import { validateRequest } from '../services/validation';
import { onboardOnp } from '../services/api';
import { saveTemplate, loadTemplate } from '../services/storage';
import { JsonEditor } from './JsonEditor';
import { DownstreamEditor } from './DownstreamEditor';
import { ValidationPanel } from './ValidationPanel';
import { TaskResults } from './TaskResults';

const CRITERIA_OPTIONS: { value: RequestCriteria; label: string }[] = [
  { value: 'mongodbandredis', label: 'MongoDB and Redis' },
  { value: 'kafkatopic', label: 'Kafka Topic' },
  { value: 'deploymentmanifest', label: 'Deployment Manifest' },
  { value: 'orionproperties', label: 'Orion Properties' },
  { value: 'fallbackdb', label: 'Fallback DB' },
  { value: 'concoursevault', label: 'Concourse Vault' },
];

const ENVIRONMENT_OPTIONS: Environment[] = [
  'DEV AS-G8',
  'DEV HO-G2',
  'QA AS-G8',
  'QA HO-G2',
  'INT AS-G8',
  'INT HO-G2',
  'FLX AS-G8',
  'FLA HO-G2',
  'TRN AS-G8',
  'TRN HO-G2',
  'STG CH2-G2',
  'STG HO-G4',
  'PROD G1',
  'PROD AS-G6',
  'PROD HO-G1',
  'PROD HO-G3',
  'BUS AS-G8',
  'BUS HO-G2',
];

export const OnboardForm: React.FC = () => {
  const navigate = useNavigate();
  const [environment, setEnvironment] = useState<Environment | ''>('');
  const [showForm, setShowForm] = useState(false);
  const [request, setRequest] = useState<OnboardRequest>({
    requestCriteria: [],
    downstreamDetails: [],
  });
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [taskResults, setTaskResults] = useState<TaskResult[]>([]);

  // Load template on mount
  useEffect(() => {
    const template = loadTemplate();
    if (template) {
      setRequest(template);
    }
  }, []);

  // Auto-save template on change
  useEffect(() => {
    if (request.requestCriteria.length > 0) {
      saveTemplate(request);
    }
  }, [request]);

  const updateRequest = (updates: Partial<OnboardRequest>) => {
    setRequest((prev) => ({ ...prev, ...updates }));
  };

  const handleCriteriaChange = (criteria: RequestCriteria, checked: boolean) => {
    setRequest((prev) => {
      const current = prev.requestCriteria || [];
      const updated = checked
        ? [...current, criteria]
        : current.filter((c) => c !== criteria);
      return { ...prev, requestCriteria: updated };
    });
  };

  const validate = () => {
    const errors = validateRequest(request);
    const errorMap: Record<string, string> = {};
    errors.forEach((err) => {
      errorMap[err.field] = err.message;
    });
    setValidationErrors(errorMap);
    return errors.length === 0;
  };

  const mutation = useMutation({
    mutationFn: onboardOnp,
    onSuccess: (data) => {
      setTaskResults(data.tasks || []);
    },
    onError: (error: Error) => {
      setTaskResults([
        {
          task: 'Error',
          status: 'Failure',
          message: error.message,
        },
      ]);
    },
  });

  const handleEnvironmentSelect = () => {
    if (environment) {
      setRequest((prev) => ({ ...prev, environment: environment as Environment }));
      setShowForm(true);
    }
  };

  const handleBackToEnvironment = () => {
    setShowForm(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) {
      return;
    }

    // Ensure environment is included in the request
    const requestWithEnvironment = {
      ...request,
      environment: environment as Environment,
    };

    mutation.mutate(requestWithEnvironment);
  };

  const errors = validateRequest(request);
  const hasCriteria = (request.requestCriteria?.length || 0) > 0;
  const isValid = hasCriteria && errors.length === 0;
  const requireHttpStatusCode = request.requestCriteria?.includes('fallbackdb') || false;

  // Environment Selection Screen
  if (!showForm) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-400 via-primary-300 to-primary-400 py-8">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <button
              onClick={() => navigate('/')}
              className="mb-4 flex items-center text-white hover:text-primary-100 transition-colors"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to Home
            </button>
            <div className="bg-gradient-to-r from-primary-500 via-primary-400 to-primary-500 rounded-xl shadow-2xl p-6 mb-4 border-2 border-primary-600">
              <h1 className="text-2xl font-bold text-white mb-2 drop-shadow-lg">ONP Event Onboard</h1>
              <p className="text-white text-lg font-medium">
                Select environment to configure and submit onboarding requests
              </p>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-2xl border-2 border-primary-400 p-8">
            <h2 className="text-xl font-semibold text-primary-700 mb-6 flex items-center">
              <span className="w-1 h-6 bg-gradient-to-b from-primary-500 to-primary-600 rounded-full mr-3"></span>
              Select Environment
            </h2>
            
            <div className="mb-6">
              <label className="block text-sm font-semibold text-primary-700 mb-3">
                Environment *
              </label>
              <select
                value={environment}
                onChange={(e) => setEnvironment(e.target.value as Environment)}
                className="w-full px-4 py-3 border-2 border-primary-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-300 focus:border-primary-500 bg-white text-gray-900 text-base font-medium transition-all"
              >
                <option value="">-- Select Environment --</option>
                {ENVIRONMENT_OPTIONS.map((env) => (
                  <option key={env} value={env}>
                    {env}
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={handleEnvironmentSelect}
              disabled={!environment}
              className={`w-full px-6 py-4 rounded-lg font-semibold text-lg transition-all transform ${
                environment
                  ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white hover:from-primary-400 hover:to-primary-500 shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              Continue
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Main Form Screen
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-400 via-primary-300 to-primary-400 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={handleBackToEnvironment}
              className="flex items-center text-white hover:text-primary-100 transition-colors"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to Environment Selection
            </button>
            <button
              onClick={() => navigate('/')}
              className="flex items-center text-white hover:text-primary-100 transition-colors"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              Home
            </button>
          </div>
          <div className="bg-gradient-to-r from-primary-500 via-primary-400 to-primary-500 rounded-xl shadow-2xl p-6 mb-4 border-2 border-primary-600">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-white mb-2 drop-shadow-lg">ONP Event Onboard</h1>
                <p className="text-white text-lg font-medium">
                  Configure and submit onboarding requests for the Orion Notification Platform
                </p>
              </div>
              <div className="bg-white/20 backdrop-blur-sm rounded-lg px-4 py-2 border border-white/30">
                <p className="text-xs text-white/80 mb-1">Environment</p>
                <p className="text-lg font-bold text-white">{environment}</p>
              </div>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column - Form */}
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-2xl border-2 border-primary-400 p-6">
              <h2 className="text-xl font-semibold text-primary-700 mb-6 flex items-center">
                <span className="w-1 h-6 bg-gradient-to-b from-primary-500 to-primary-600 rounded-full mr-3"></span>
                Request Configuration
              </h2>

              {/* Request Criteria */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-primary-700 mb-3">
                  Request Criteria *
                </label>
                <div className="space-y-3 bg-primary-50 rounded-lg p-4 border-2 border-primary-300">
                  {CRITERIA_OPTIONS.map((option) => (
                    <label
                      key={option.value}
                      className="flex items-center space-x-3 cursor-pointer group hover:bg-primary-100 p-2 rounded-lg transition-colors"
                    >
                      <input
                        type="checkbox"
                        checked={request.requestCriteria?.includes(option.value) || false}
                        onChange={(e) =>
                          handleCriteriaChange(option.value, e.target.checked)
                        }
                        className="w-5 h-5 text-primary-600 border-2 border-primary-400 rounded focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 cursor-pointer transition-all bg-white"
                      />
                      <span className="text-sm font-medium text-primary-800 group-hover:text-primary-900">{option.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Event Name */}
              {request.requestCriteria?.includes('mongodbandredis') && (
                <div className="mb-4">
                  <label className="block text-sm font-semibold text-primary-700 mb-2">
                    Event Name *
                  </label>
                  <input
                    type="text"
                    value={request.eventName || ''}
                    onChange={(e) => updateRequest({ eventName: e.target.value })}
                    className={`w-full px-4 py-2.5 border-2 rounded-lg focus:outline-none focus:ring-2 transition-all bg-white text-gray-900 placeholder-gray-400 ${
                      validationErrors.eventName 
                        ? 'border-red-500 focus:ring-red-300 focus:border-red-500' 
                        : 'border-primary-400 focus:ring-primary-300 focus:border-primary-500'
                    }`}
                    placeholder="Enter event name"
                  />
                  {validationErrors.eventName && (
                    <p className="mt-1 text-sm text-red-600 font-medium">
                      {validationErrors.eventName}
                    </p>
                  )}
                </div>
              )}

              {/* Subscriber Name */}
              {(request.requestCriteria?.includes('mongodbandredis') ||
                request.requestCriteria?.includes('kafkatopic') ||
                request.requestCriteria?.includes('deploymentmanifest') ||
                request.requestCriteria?.includes('orionproperties') ||
                request.requestCriteria?.includes('concoursevault')) && (
                <div className="mb-4">
                  <label className="block text-sm font-semibold text-primary-700 mb-2">
                    Subscriber Name *
                  </label>
                  <input
                    type="text"
                    value={request.subscriberName || ''}
                    onChange={(e) => updateRequest({ subscriberName: e.target.value })}
                    className={`w-full px-4 py-2.5 border-2 rounded-lg focus:outline-none focus:ring-2 transition-all bg-white text-gray-900 placeholder-gray-400 ${
                      validationErrors.subscriberName 
                        ? 'border-red-500 focus:ring-red-300 focus:border-red-500' 
                        : 'border-primary-400 focus:ring-primary-300 focus:border-primary-500'
                    }`}
                    placeholder="Enter subscriber name"
                  />
                  {validationErrors.subscriberName && (
                    <p className="mt-1 text-sm text-red-600 font-medium">
                      {validationErrors.subscriberName}
                    </p>
                  )}
                </div>
              )}

              {/* Kafka Topic Fields */}
              {request.requestCriteria?.includes('kafkatopic') && (
                <div className="mb-4 grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-primary-700 mb-2">
                      Number of Partitions *
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={request.numPartitions || ''}
                      onChange={(e) =>
                        updateRequest({
                          numPartitions: e.target.value ? parseInt(e.target.value, 10) : undefined,
                        })
                      }
                      className={`w-full px-4 py-2.5 border-2 rounded-lg focus:outline-none focus:ring-2 transition-all bg-white text-gray-900 placeholder-gray-400 ${
                        validationErrors.numPartitions 
                          ? 'border-red-500 focus:ring-red-300 focus:border-red-500' 
                          : 'border-primary-400 focus:ring-primary-300 focus:border-primary-500'
                      }`}
                      placeholder="1"
                    />
                    {validationErrors.numPartitions && (
                      <p className="mt-1 text-sm text-red-600 font-medium">
                        {validationErrors.numPartitions}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-primary-700 mb-2">
                      Replication Factor *
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={request.replicationFactor || ''}
                      onChange={(e) =>
                        updateRequest({
                          replicationFactor: e.target.value
                            ? parseInt(e.target.value, 10)
                            : undefined,
                        })
                      }
                      className={`w-full px-4 py-2.5 border-2 rounded-lg focus:outline-none focus:ring-2 transition-all bg-white text-gray-900 placeholder-gray-400 ${
                        validationErrors.replicationFactor 
                          ? 'border-red-500 focus:ring-red-300 focus:border-red-500' 
                          : 'border-primary-400 focus:ring-primary-300 focus:border-primary-500'
                      }`}
                      placeholder="1"
                    />
                    {validationErrors.replicationFactor && (
                      <p className="mt-1 text-sm text-red-600 font-medium">
                        {validationErrors.replicationFactor}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Git Fields */}
              {(request.requestCriteria?.includes('deploymentmanifest') ||
                request.requestCriteria?.includes('orionproperties')) && (
                <div className="mb-4 space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-primary-700 mb-2">
                      Commit Message *
                    </label>
                    <input
                      type="text"
                      value={request.commitMessage || ''}
                      onChange={(e) => updateRequest({ commitMessage: e.target.value })}
                      className={`w-full px-4 py-2.5 border-2 rounded-lg focus:outline-none focus:ring-2 transition-all bg-white text-gray-900 placeholder-gray-400 ${
                        validationErrors.commitMessage 
                          ? 'border-red-500 focus:ring-red-300 focus:border-red-500' 
                          : 'border-primary-400 focus:ring-primary-300 focus:border-primary-500'
                      }`}
                      placeholder="Enter commit message"
                    />
                    {validationErrors.commitMessage && (
                      <p className="mt-1 text-sm text-red-600 font-medium">
                        {validationErrors.commitMessage}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-primary-700 mb-2">
                      Git Access Token *
                    </label>
                    <input
                      type="password"
                      value={request.gitAccessToken || ''}
                      onChange={(e) => updateRequest({ gitAccessToken: e.target.value })}
                      className={`w-full px-4 py-2.5 border-2 rounded-lg focus:outline-none focus:ring-2 transition-all bg-white text-gray-900 placeholder-gray-400 ${
                        validationErrors.gitAccessToken 
                          ? 'border-red-500 focus:ring-red-300 focus:border-red-500' 
                          : 'border-primary-400 focus:ring-primary-300 focus:border-primary-500'
                      }`}
                      placeholder="Enter git access token"
                    />
                    {validationErrors.gitAccessToken && (
                      <p className="mt-1 text-sm text-red-600 font-medium">
                        {validationErrors.gitAccessToken}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Downstream Details */}
              {(request.requestCriteria?.includes('mongodbandredis') ||
                request.requestCriteria?.includes('fallbackdb')) && (
                <DownstreamEditor
                  downstreamDetails={request.downstreamDetails || []}
                  onChange={(details) => updateRequest({ downstreamDetails: details })}
                  errors={validationErrors}
                  requireHttpStatusCode={requireHttpStatusCode}
                />
              )}
            </div>
          </div>

          {/* Right Column - JSON Preview & Submit */}
          <div className="space-y-6">
            {/* JSON Editors */}
            {request.requestCriteria?.includes('mongodbandredis') && (
              <div className="bg-white rounded-xl shadow-2xl border-2 border-primary-400 p-6">
                <h2 className="text-xl font-semibold text-primary-700 mb-6 flex items-center">
                  <span className="w-1 h-6 bg-gradient-to-b from-primary-500 to-primary-600 rounded-full mr-3"></span>
                  Schema Configuration
                </h2>
                <JsonEditor
                  value={request.headerSchema || ''}
                  onChange={(value) => updateRequest({ headerSchema: value })}
                  label="Header Schema"
                  height="200px"
                  error={validationErrors.headerSchema}
                />
                <JsonEditor
                  value={request.payloadSchema || ''}
                  onChange={(value) => updateRequest({ payloadSchema: value })}
                  label="Payload Schema"
                  height="200px"
                  error={validationErrors.payloadSchema}
                />
              </div>
            )}

            {/* Validation Panel */}
            <ValidationPanel
              errors={errors}
              requestCriteria={request.requestCriteria || []}
              isValid={isValid}
            />

            {/* Submit Button */}
            <div className="bg-white rounded-xl shadow-2xl border-2 border-primary-400 p-6">
              <button
                type="submit"
                disabled={!isValid || mutation.isPending}
                className={`w-full px-6 py-4 rounded-lg font-semibold text-lg transition-all transform ${
                  isValid && !mutation.isPending
                    ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white hover:from-primary-400 hover:to-primary-500 shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                {mutation.isPending ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Submitting...
                  </span>
                ) : (
                  'Submit Onboarding Request'
                )}
              </button>
            </div>

            {/* Task Results */}
            {(mutation.isPending || taskResults.length > 0) && (
              <TaskResults results={taskResults} isLoading={mutation.isPending} />
            )}
          </div>
        </form>
      </div>
    </div>
  );
};
