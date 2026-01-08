import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import type { OnboardRequest, TaskResult, Environment } from '../types';
import { validateRequest } from '../services/validation';
import { onboardOnp } from '../services/api';
import { generateSatToken } from '../services/sat';
import { JsonEditor } from './JsonEditor';
import { DownstreamEditor } from './DownstreamEditor';
import { ValidationPanel } from './ValidationPanel';
import { TaskResults } from './TaskResults';
import { ProductionWarning } from './ProductionWarning';

const ENVIRONMENT_OPTIONS: Environment[] = [
  'DEV AS-G8',
  'DEV HO-G2',
  'QA AS-G8',
  'QA HO-G2',
  'INT AS-G8',
  'INT HO-G2',
  'FLX AS-G8',
  'FLX HO-G2',
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

interface InsertEventFormProps {
  hideHeader?: boolean;
}

export const InsertEventForm: React.FC<InsertEventFormProps> = ({ hideHeader = false }) => {
  const navigate = useNavigate();
  const [environment, setEnvironment] = useState<Environment | ''>('');
  const [request, setRequest] = useState<OnboardRequest>({
    requestCriteria: ['mongodbandredis'], // Pre-select MongoDB and Redis
    downstreamDetails: [],
  });
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [taskResults, setTaskResults] = useState<TaskResult[]>([]);
  const [lastRequestData, setLastRequestData] = useState<any>(null);
  const [lastResponseData, setLastResponseData] = useState<any>(null);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [formHasChanged, setFormHasChanged] = useState(false);
  const [showTokenModal, setShowTokenModal] = useState(false);
  const [tokenCredentials, setTokenCredentials] = useState({
    clientId: '',
    clientSecret: '',
    scope: '',
  });
  const [isGeneratingToken, setIsGeneratingToken] = useState(false);
  const [tokenError, setTokenError] = useState<string | null>(null);

  const updateRequest = (updates: Partial<OnboardRequest>) => {
    setRequest((prev) => ({ ...prev, ...updates }));
    if (hasSubmitted) {
      setFormHasChanged(true);
    }
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

  const [operationStatus, setOperationStatus] = useState<{
    type: 'success' | 'error' | 'warning' | null;
    message: string;
    statusCode?: number | null;
  } | null>(null);

  const mutation = useMutation({
    mutationFn: onboardOnp,
    onSuccess: (data) => {
      const tasks = data.tasks || [];
      setTaskResults(tasks);
      setLastResponseData(data);
      setHasSubmitted(true);
      setFormHasChanged(false);
      
      const successCount = tasks.filter(t => t.status === 'Success').length;
      const failureCount = tasks.filter(t => t.status === 'Failure').length;
      const partialCount = tasks.filter(t => t.status === 'Partial').length;
      
      if (failureCount === 0 && partialCount === 0) {
        setOperationStatus({
          type: 'success',
          message: `Event inserted successfully! All ${tasks.length} task(s) completed successfully in ${environment} environment.`,
        });
      } else if (failureCount > 0) {
        setOperationStatus({
          type: 'error',
          message: `Insertion completed with errors. ${failureCount} task(s) failed, ${successCount} succeeded in ${environment} environment. Please review the details below.`,
        });
      } else if (partialCount > 0) {
        setOperationStatus({
          type: 'warning',
          message: `Insertion completed with partial success. ${partialCount} task(s) completed partially, ${successCount} succeeded in ${environment} environment. Please review the details below.`,
        });
      }
    },
    onError: (error: Error) => {
      const errorAny = error as any;
      const statusCode = errorAny?.response?.status || errorAny?.status || null;
      
      let errorMessage = error.message;
      
      if (errorAny?.response?.data) {
        const responseData = errorAny.response.data;
        if (typeof responseData === 'string') {
          errorMessage = responseData;
        } else if (responseData.message) {
          errorMessage = responseData.message;
        } else if (responseData.error) {
          errorMessage = responseData.error;
        }
      }
      
      if (statusCode) {
        errorMessage = `[HTTP ${statusCode}] ${errorMessage}`;
      }
      
      if (environment && !errorMessage.includes(environment)) {
        errorMessage = `${errorMessage} (Environment: ${environment})`;
      }
      
      const errorResult = {
        task: 'Insertion Error',
        status: 'Failure' as const,
        message: errorMessage,
      };
      setTaskResults([errorResult]);
      setLastResponseData({ 
        error: errorMessage,
        tasks: [errorResult],
        status: 'Failure',
      });
      setHasSubmitted(true);
      setFormHasChanged(false);
      
      setOperationStatus({
        type: 'error',
        message: `Insertion failed: ${errorMessage}. Please check your request and try again.`,
        statusCode: statusCode,
      });
    },
  });

  const handleGenerateToken = async () => {
    if (!environment) {
      setTokenError('Please select an environment first');
      return;
    }

    if (!tokenCredentials.clientId.trim() || !tokenCredentials.clientSecret.trim() || !tokenCredentials.scope.trim()) {
      setTokenError('Please fill in all fields (Client ID, Client Secret, and Scope)');
      return;
    }

    setIsGeneratingToken(true);
    setTokenError(null);

    try {
      const token = await generateSatToken(environment as Environment, {
        clientId: tokenCredentials.clientId,
        clientSecret: tokenCredentials.clientSecret,
        scope: tokenCredentials.scope,
      });

      updateRequest({ authorization: token });
      setShowTokenModal(false);
      setTokenCredentials({ clientId: '', clientSecret: '', scope: '' });
    } catch (error) {
      setTokenError(error instanceof Error ? error.message : 'Failed to generate token');
    } finally {
      setIsGeneratingToken(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!environment) {
      setValidationErrors({ ...validationErrors, environment: 'Please select an environment' });
      return;
    }
    
    if (!validate()) {
      return;
    }

    const requestWithEnvironment: OnboardRequest = {
      ...request,
      environment: environment as Environment,
      requestCriteria: ['mongodbandredis'], // Ensure mongodbandredis is always selected
    };

    setLastRequestData(requestWithEnvironment);
    setOperationStatus(null);
    
    mutation.mutate(requestWithEnvironment);
  };

  const errors = validateRequest(request);
  const isValid = request.requestCriteria?.includes('mongodbandredis') && errors.length === 0 && !!environment;

  const content = (
    <>
      {!hideHeader && (
        <div className="mb-6">
          <button
            onClick={() => navigate('/')}
            className="mb-4 flex items-center text-white hover:text-primary-100 transition-colors"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Home
          </button>
          <div className="bg-gradient-to-r from-primary-500 via-primary-400 to-primary-500 rounded-xl shadow-2xl p-6 border-2 border-primary-600">
            <h1 className="text-2xl font-bold text-white mb-2 drop-shadow-lg">Insert New Event</h1>
            <p className="text-white text-lg font-medium">
              Create a new event in MongoDB and Redis cache with complete event configuration
            </p>
          </div>
        </div>
      )}

      {/* Environment Selection Section */}
      <div className="bg-white rounded-xl shadow-2xl border-2 border-primary-400 p-8 mb-6">
        <h2 className="text-lg font-semibold text-primary-700 mb-6 flex items-center">
          <span className="w-1 h-6 bg-gradient-to-b from-primary-500 to-primary-600 rounded-full mr-3"></span>
          Select Environment
        </h2>
        
        <div className="mb-6">
          <label htmlFor="environment" className="block text-sm font-semibold text-primary-700 mb-3">
            Environment *
          </label>
          <select
            id="environment"
            value={environment}
            onChange={(e) => {
              setEnvironment(e.target.value as Environment);
              if (e.target.value) {
                setRequest((prev) => ({ ...prev, environment: e.target.value as Environment }));
              }
              if (hasSubmitted) setFormHasChanged(true);
            }}
            className="w-full px-4 py-3 border-2 border-primary-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-300 focus:border-primary-500 bg-white text-gray-900 text-sm font-medium transition-all"
            disabled={mutation.isPending}
            required
          >
            <option value="">-- Select Environment --</option>
            {ENVIRONMENT_OPTIONS.map((env) => (
              <option key={env} value={env}>
                {env}
              </option>
            ))}
          </select>
          {validationErrors.environment && (
            <p className="mt-1 text-sm text-red-600 font-medium">
              {validationErrors.environment}
            </p>
          )}
          <ProductionWarning environment={environment} />
        </div>
      </div>

      {/* Form Fields - Show only when environment is selected */}
      {environment ? (
        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column - Form */}
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-2xl border-2 border-primary-400 p-6">
              <h2 className="text-lg font-semibold text-primary-700 mb-6 flex items-center">
                <span className="w-1 h-6 bg-gradient-to-b from-primary-500 to-primary-600 rounded-full mr-3"></span>
                Event Configuration
              </h2>

              {/* Authorization Token */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-primary-700 mb-2">
                  Authorization Token *
                </label>
                <div className="flex gap-2">
                  <input
                    type="password"
                    value={request.authorization || ''}
                    onChange={(e) => updateRequest({ authorization: e.target.value })}
                    className={`flex-1 px-4 py-2.5 border-2 rounded-lg focus:outline-none focus:ring-2 transition-all bg-white text-gray-900 placeholder-gray-400 ${
                      validationErrors.authorization 
                        ? 'border-red-500 focus:ring-red-300 focus:border-red-500' 
                        : 'border-primary-400 focus:ring-primary-300 focus:border-primary-500'
                    }`}
                    placeholder="Enter authorization token or generate one"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      updateRequest({ authorization: '' });
                      setShowTokenModal(true);
                    }}
                    disabled={!environment || !!(request.authorization && request.authorization.trim().length > 0)}
                    className={`px-4 py-2.5 rounded-lg font-semibold text-sm transition-all ${
                      !!(environment && (!request.authorization || !request.authorization.trim()))
                        ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white hover:from-primary-400 hover:to-primary-500 shadow-lg hover:shadow-xl'
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                    title={!environment ? 'Please select an environment first' : (request.authorization && request.authorization.trim()) ? 'Clear the token field to generate a new token' : 'Generate token'}
                  >
                    Generate Token
                  </button>
                </div>
                {validationErrors.authorization && (
                  <p className="mt-1 text-sm text-red-600 font-medium">
                    {validationErrors.authorization}
                  </p>
                )}
              </div>

              {/* Event Name */}
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

              {/* Subscriber Name */}
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

              {/* Downstream Details */}
              <DownstreamEditor
                downstreamDetails={request.downstreamDetails || []}
                onChange={(details) => updateRequest({ downstreamDetails: details })}
                errors={validationErrors}
                requireHttpStatusCode={false}
                showClientAndEndpoint={true}
              />
            </div>
          </div>

          {/* Right Column - JSON Preview & Submit */}
          <div className="space-y-6">
            {/* JSON Editors */}
            <div className="bg-white rounded-xl shadow-2xl border-2 border-primary-400 p-6">
              <h2 className="text-lg font-semibold text-primary-700 mb-6 flex items-center">
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
                disabled={!isValid || mutation.isPending || (hasSubmitted && !formHasChanged)}
                className={`w-full px-6 py-4 rounded-lg font-semibold text-lg transition-all transform ${
                  isValid && !mutation.isPending && (!hasSubmitted || formHasChanged)
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
                    Inserting...
                  </span>
                ) : (
                  'Insert New Event'
                )}
              </button>
            </div>

            {/* Operation Status Banner */}
            {operationStatus && (
              <div className={`mb-6 p-5 rounded-lg border-l-4 ${
                operationStatus.type === 'success'
                  ? 'bg-green-50 border-green-400'
                  : operationStatus.type === 'error'
                  ? 'bg-red-50 border-red-400'
                  : 'bg-yellow-50 border-yellow-400'
              }`}>
                <div className="flex items-start">
                  {operationStatus.type === 'success' ? (
                    <svg className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  ) : operationStatus.type === 'error' ? (
                    <svg className="w-5 h-5 text-red-400 mr-3 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5 text-yellow-500 mr-3 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  )}
                  <div className="flex-1">
                    <p className={`font-semibold mb-1 ${
                      operationStatus.type === 'success'
                        ? 'text-green-800'
                        : operationStatus.type === 'error'
                        ? 'text-red-800'
                        : 'text-yellow-800'
                    }`}>
                      {operationStatus.type === 'success' ? 'Success' : 
                       operationStatus.type === 'error' ? 'Error' : 'Warning'}
                    </p>
                    <p className={`text-sm ${
                      operationStatus.type === 'success'
                        ? 'text-green-700'
                        : operationStatus.type === 'error'
                        ? 'text-red-700'
                        : 'text-yellow-700'
                    }`}>
                      {operationStatus.message}
                    </p>
                    {operationStatus.statusCode && (
                      <div className={`mt-2 flex items-center gap-2 text-xs ${
                        operationStatus.type === 'success'
                          ? 'text-green-600'
                          : operationStatus.type === 'error'
                          ? 'text-red-600'
                          : 'text-yellow-600'
                      }`}>
                        <span className="px-2 py-1 bg-white bg-opacity-50 rounded border border-current font-mono font-semibold">
                          HTTP Status: {operationStatus.statusCode}
                        </span>
                      </div>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => setOperationStatus(null)}
                    className="ml-4 text-gray-400 hover:text-gray-600 transition-colors"
                    title="Dismiss"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
            )}

            {(mutation.isPending || taskResults.length > 0) && (
              <TaskResults
                results={taskResults}
                isLoading={mutation.isPending}
                requestData={lastRequestData}
                responseData={lastResponseData}
                operationName="Insert New Event"
              />
            )}
          </div>
        </form>
      ) : (
        <div className="bg-white rounded-xl shadow-2xl border-2 border-primary-400 p-8">
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🎯</div>
            <h2 className="text-2xl font-bold text-primary-700 mb-4">Select Environment First</h2>
            <p className="text-gray-600 mb-6">
              Please select an environment above to insert a new event into MongoDB and Redis.
            </p>
          </div>
        </div>
      )}

      {/* Token Generation Modal */}
      {showTokenModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl border-2 border-primary-400 max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-primary-700">
                Generate Authorization Token
              </h2>
              <button
                type="button"
                onClick={() => {
                  setShowTokenModal(false);
                  setTokenError(null);
                  setTokenCredentials({ clientId: '', clientSecret: '', scope: '' });
                }}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-primary-700 mb-2">
                  Environment
                </label>
                <div className="px-4 py-2 bg-primary-50 border-2 border-primary-300 rounded-lg">
                  <p className="text-sm font-medium text-primary-800">{environment}</p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-primary-700 mb-2">
                  Client ID *
                </label>
                <input
                  type="text"
                  value={tokenCredentials.clientId}
                  onChange={(e) =>
                    setTokenCredentials({ ...tokenCredentials, clientId: e.target.value })
                  }
                  className="w-full px-4 py-2.5 border-2 border-primary-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-300 focus:border-primary-500 bg-white text-gray-900"
                  placeholder="Enter client ID"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-primary-700 mb-2">
                  Client Secret *
                </label>
                <input
                  type="password"
                  value={tokenCredentials.clientSecret}
                  onChange={(e) =>
                    setTokenCredentials({ ...tokenCredentials, clientSecret: e.target.value })
                  }
                  className="w-full px-4 py-2.5 border-2 border-primary-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-300 focus:border-primary-500 bg-white text-gray-900"
                  placeholder="Enter client secret"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-primary-700 mb-2">
                  Scope *
                </label>
                <input
                  type="text"
                  value={tokenCredentials.scope}
                  onChange={(e) =>
                    setTokenCredentials({ ...tokenCredentials, scope: e.target.value })
                  }
                  className="w-full px-4 py-2.5 border-2 border-primary-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-300 focus:border-primary-500 bg-white text-gray-900"
                  placeholder="Enter scope"
                />
              </div>

              {tokenError && (
                <div className="bg-red-50 border-l-4 border-red-400 rounded-lg p-4">
                  <div className="flex items-start">
                    <svg className="w-5 h-5 text-red-400 mr-3 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-red-800 mb-1">Token Generation Error</p>
                      <p className="text-sm text-red-700">{tokenError}</p>
                      {environment && (
                        <p className="text-xs text-red-600 mt-2">
                          Environment: <span className="font-semibold">{environment}</span>
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowTokenModal(false);
                    setTokenError(null);
                    setTokenCredentials({ clientId: '', clientSecret: '', scope: '' });
                  }}
                  className="flex-1 px-4 py-2.5 border-2 border-primary-400 text-primary-700 rounded-lg font-semibold hover:bg-primary-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleGenerateToken}
                  disabled={isGeneratingToken}
                  className={`flex-1 px-4 py-2.5 rounded-lg font-semibold text-white transition-all ${
                    isGeneratingToken
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-400 hover:to-primary-500 shadow-lg hover:shadow-xl'
                  }`}
                >
                  {isGeneratingToken ? (
                    <span className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Generating...
                    </span>
                  ) : (
                    'Generate Token'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );

  if (hideHeader) {
    return content;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-400 via-primary-300 to-primary-400 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {content}
      </div>
    </div>
  );
};

