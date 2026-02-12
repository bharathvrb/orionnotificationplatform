import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import type { OnboardRequest, TaskResult, Environment, DownstreamDetail } from '../types';
import { validateRequest } from '../services/validation';
import { updateOnp, fetchMongoDBDetails } from '../services/api';
import { JsonEditor } from './JsonEditor';
import { DownstreamEditor } from './DownstreamEditor';
import { ValidationPanel } from './ValidationPanel';
import { TaskResults } from './TaskResults';
import { generateSatToken } from '../services/sat';
import { ProductionWarning } from './ProductionWarning';
import { DEFAULT_MONGODB_HEADER_SCHEMA } from '../constants/schemas';

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

interface UpdateEventFormProps {
  hideHeader?: boolean;
}

export const UpdateEventForm: React.FC<UpdateEventFormProps> = ({ hideHeader = false }) => {
  const navigate = useNavigate();
  const [environment, setEnvironment] = useState<Environment | ''>('');
  const [authorization, setAuthorization] = useState<string>('');
  const [request, setRequest] = useState<OnboardRequest>({
    requestCriteria: ['mongodbandredis'], // Default to MongoDB and Redis for updates
    downstreamDetails: [],
    headerSchema: DEFAULT_MONGODB_HEADER_SCHEMA,
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
  const [isFetchingEvent, setIsFetchingEvent] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [eventFetched, setEventFetched] = useState(false);

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
    mutationFn: updateOnp,
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
          message: `Update completed successfully! All ${tasks.length} task(s) completed successfully in ${environment} environment.`,
        });
      } else if (failureCount > 0) {
        setOperationStatus({
          type: 'error',
          message: `Update completed with errors. ${failureCount} task(s) failed, ${successCount} succeeded in ${environment} environment. Please review the details below.`,
        });
      } else if (partialCount > 0) {
        setOperationStatus({
          type: 'warning',
          message: `Update completed with partial success. ${partialCount} task(s) completed partially, ${successCount} succeeded in ${environment} environment. Please review the details below.`,
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
        task: 'Update Error',
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
        message: `Update failed: ${errorMessage}. Please check your request and try again.`,
        statusCode: statusCode,
      });
    },
  });

  // Helper function to parse schema definition XML and extract Header and Payload
  // Handles escaped JSON strings (double-escaped) from MongoDB/Redis
  // This matches the implementation in MongoDBDetails.tsx for consistency
  const parseSchemaDefinition = (schemaDefinition: string): { header?: string; payload?: string } | null => {
    if (!schemaDefinition) return null;
    
    try {
      // Try to extract HeaderAttributes JSON - match content between tags (non-greedy, handles whitespace)
      const headerMatch = schemaDefinition.match(/<HeaderAttributes>([\s\S]*?)<\/HeaderAttributes>/);
      // Try to extract Payload Schema JSON - match content between <Schema> tags within <Payload>
      const payloadMatch = schemaDefinition.match(/<Payload>[\s\S]*?<Schema>([\s\S]*?)<\/Schema>[\s\S]*?<\/Payload>/);
      
      let headerJson: string | undefined;
      let payloadJson: string | undefined;
      
      // Helper function to unescape and parse JSON (handles both escaped and non-escaped JSON)
      // This function handles schemas stored in MongoDB/Redis which are double-escaped JSON strings
      const unescapeAndParseJson = (jsonString: string): string => {
        const trimmed = jsonString.trim();
        if (!trimmed) return trimmed;
        
        try {
          // First parse - might give us a string if it's escaped, or an object if it's not
          let parsed: any = JSON.parse(trimmed);
          
          // If the result is a string, it was escaped, so parse again to get the actual JSON object
          if (typeof parsed === 'string') {
            try {
              // Second parse to get the actual JSON object
              parsed = JSON.parse(parsed);
            } catch (e) {
              // If second parse fails, the string might have extra escaping or be malformed
              // Try to clean up common escaping issues and parse again
              const cleaned = parsed
                .replace(/\\"/g, '"')  // Replace escaped quotes
                .replace(/\\\\/g, '\\') // Replace double backslashes
                .replace(/\\n/g, '\n') // Replace escaped newlines
                .replace(/\\t/g, '\t'); // Replace escaped tabs
              try {
                parsed = JSON.parse(cleaned);
              } catch (e2) {
                // If still fails after cleaning, return the cleaned string as-is (might be invalid JSON)
                console.warn('Failed to parse JSON after cleaning:', e2);
                return cleaned;
              }
            }
          }
          
          // Format the parsed JSON nicely with proper indentation
          return JSON.stringify(parsed, null, 2);
        } catch (e) {
          // If initial parsing fails, the string might not be valid JSON or might need cleaning
          // Try to clean up common escaping issues
          const cleaned = trimmed
            .replace(/\\"/g, '"')  // Replace escaped quotes
            .replace(/\\\\/g, '\\') // Replace double backslashes
            .replace(/\\n/g, '\n') // Replace escaped newlines
            .replace(/\\t/g, '\t'); // Replace escaped tabs
          
          try {
            // Try parsing the cleaned string
            const parsed = JSON.parse(cleaned);
            return JSON.stringify(parsed, null, 2);
          } catch (e2) {
            // If still fails, return the cleaned string as-is
            // This handles edge cases where the JSON might be malformed
            console.warn('Failed to parse JSON even after cleaning:', e2);
            return cleaned;
          }
        }
      };
      
      if (headerMatch && headerMatch[1]) {
        headerJson = unescapeAndParseJson(headerMatch[1]);
      }
      
      if (payloadMatch && payloadMatch[1]) {
        payloadJson = unescapeAndParseJson(payloadMatch[1]);
      }
      
      if (headerJson || payloadJson) {
        return { header: headerJson, payload: payloadJson };
      }
    } catch (e) {
      // If parsing fails, return null to show original
      console.warn('Failed to parse schema definition:', e);
    }
    
    return null;
  };

  // Function to fetch event details and pre-populate form
  const handleFetchEventDetails = async () => {
    if (!request.eventName?.trim()) {
      setFetchError('Please enter an event name first');
      return;
    }

    if (!environment) {
      setFetchError('Please select an environment first');
      return;
    }

    if (!authorization && !request.authorization) {
      setFetchError('Please provide an authorization token first');
      return;
    }

    setIsFetchingEvent(true);
    setFetchError(null);

    try {
      const response = await fetchMongoDBDetails(
        { eventNames: [request.eventName] },
        undefined,
        environment,
        authorization || request.authorization || undefined
      );

      if (response.eventDetails && response.eventDetails.length > 0) {
        const eventDetail = response.eventDetails[0];
        
        if (eventDetail.mongoDBData) {
          // Parse and extract schemas from MongoDB schemaDefinition
          // The schemaDefinition contains XML with escaped JSON strings
          let parsedSchemas: { header?: string; payload?: string } | null = null;
          if (eventDetail.mongoDBData.schemaDefinition) {
            parsedSchemas = parseSchemaDefinition(eventDetail.mongoDBData.schemaDefinition);
            if (!parsedSchemas) {
              console.warn('Failed to parse schema definition from MongoDB');
            }
          }

          // Extract subscriber name from topic
          // Backend creates topic as: subscriberName.replace("service", "topic")
          // So we reverse it: topic.replace("topic", "service")
          const topic = eventDetail.mongoDBData.topic || '';
          let subscriberName = '';
          if (topic) {
            // Try to extract subscriber name by replacing "topic" with "service"
            subscriberName = topic.replace(/topic/gi, 'service');
          }
          
          // Fallback: if topic doesn't contain "topic", use it as-is (might already be subscriber name)
          if (!subscriberName) {
            subscriberName = topic;
          }

          // Map downstream details with all available fields
          // Extract all attributes from MongoDB response to populate editable form fields
          const downstreamDetails: DownstreamDetail[] = [];
          if (eventDetail.downstreamDetails && eventDetail.downstreamDetails.length > 0) {
            eventDetail.downstreamDetails.forEach((downstreamWithAuth) => {
              const downstream = downstreamWithAuth.downstream;
              const auth = downstreamWithAuth.authorization;
              
              if (downstream) {
                // Extract all available fields from MongoDB response
                // Include all fields that can be edited in the form
                downstreamDetails.push({
                  name: downstream.downstreamName || '',
                  endpoint: downstream.endpoint || '',
                  clientId: auth?.clientId || '',
                  clientSecret: auth?.clientSecret || '',
                  scope: auth?.scope || '',
                  // Include additional fields if present (for fallback DB scenarios)
                  httpStatusCode: undefined, // Not stored in MongoDB for regular downstreams
                  maintenanceFlag: false, // Default value if not present
                  maxRetryCount: undefined, // Default value if not present
                  retryDelay: undefined, // Default value if not present
                });
              }
            });
          }

          // Prepare form updates - only update fields that have values from MongoDB
          const updates: Partial<OnboardRequest> = {
            eventName: eventDetail.eventType || request.eventName,
          };
          
          // Update subscriber name if we found one
          if (subscriberName) {
            updates.subscriberName = subscriberName;
          }
          
          // Update schemas if parsed successfully
          if (parsedSchemas) {
            if (parsedSchemas.header) {
              updates.headerSchema = parsedSchemas.header;
            }
            if (parsedSchemas.payload) {
              updates.payloadSchema = parsedSchemas.payload;
            }
          }
          
          // Update downstream details if we found any
          if (downstreamDetails.length > 0) {
            updates.downstreamDetails = downstreamDetails;
          }

          // Update form with all fetched data
          updateRequest(updates);

          setEventFetched(true);
          setFetchError(null);
        } else {
          setFetchError(`Event "${request.eventName}" not found in MongoDB for environment ${environment}`);
        }
      } else {
        setFetchError(`Event "${request.eventName}" not found in MongoDB for environment ${environment}`);
      }
    } catch (error: any) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch event details';
      setFetchError(errorMessage);
      console.error('Error fetching event details:', error);
    } finally {
      setIsFetchingEvent(false);
    }
  };

  // Reset form when eventName changes
  useEffect(() => {
    if (request.eventName && eventFetched) {
      // Only reset if user manually changes eventName after fetching
      // This allows editing fetched data
    }
  }, [request.eventName]);

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

      setAuthorization(token);
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

    const requestWithEnvironment = {
      ...request,
      environment: environment as Environment,
      authorization: authorization || request.authorization,
    };

    setLastRequestData(requestWithEnvironment);
    setOperationStatus(null);
    
    mutation.mutate(requestWithEnvironment);
  };

  const errors = validateRequest(request);
  const hasCriteria = (request.requestCriteria?.length || 0) > 0;
  const isValid = hasCriteria && errors.length === 0 && !!environment;
  const requireHttpStatusCode = request.requestCriteria?.includes('fallbackdb') || false;

  const content = (
    <>
      {!hideHeader && (
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
            <h1 className="text-2xl font-bold text-white mb-2 drop-shadow-lg">Update Event</h1>
            <p className="text-white text-lg font-medium">
              Update existing event entries in MongoDB and refresh Redis cache
            </p>
          </div>
        </div>
      )}

        {/* Environment Selection Box - Show first */}
        <div className="bg-white rounded-xl shadow-2xl border-2 border-primary-400 p-8 mb-6">
          <div>
            <label htmlFor="environment" className="block text-sm font-semibold text-primary-700 mb-3">
              Environment *
            </label>
            <select
              id="environment"
              value={environment}
              onChange={(e) => {
                setEnvironment(e.target.value as Environment);
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

        {/* Form Fields - Show after environment is selected */}
        {environment && (
        <form onSubmit={handleSubmit}>
          {/* Single Update Event Box */}
          <div className="bg-white rounded-xl shadow-2xl border-2 border-primary-400 p-8 mb-6">
            <h2 className="text-lg font-semibold text-primary-700 mb-6 flex items-center">
              <span className="w-1 h-6 bg-gradient-to-b from-primary-500 to-primary-600 rounded-full mr-3"></span>
              Update Event
            </h2>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column - Form */}
          <div className="space-y-6">
              {/* Authorization Token */}
              <div className="mb-6">
                <label htmlFor="authorization" className="block text-sm font-semibold text-primary-700 mb-2">
                  Authorization Token
                </label>
                <div className="flex gap-2">
                  <input
                    id="authorization"
                    type="password"
                    value={authorization || request.authorization || ''}
                    onChange={(e) => {
                      const value = e.target.value;
                      setAuthorization(value);
                      updateRequest({ authorization: value });
                      if (hasSubmitted) setFormHasChanged(true);
                    }}
                    className="flex-1 px-4 py-2.5 border-2 border-primary-400 rounded-lg focus:ring-2 focus:ring-primary-300 focus:border-primary-500"
                    placeholder="Enter authorization token or generate one"
                    disabled={mutation.isPending}
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setAuthorization('');
                      updateRequest({ authorization: '' });
                      setShowTokenModal(true);
                    }}
                    disabled={!environment || mutation.isPending || !!((authorization && authorization.trim().length > 0) || (request.authorization && request.authorization.trim().length > 0))}
                    className={`px-4 py-2.5 rounded-lg font-semibold text-sm transition-all ${
                      !!(environment && !mutation.isPending && !authorization?.trim() && !request.authorization?.trim())
                        ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white hover:from-primary-400 hover:to-primary-500 shadow-lg hover:shadow-xl'
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                    title={!environment ? 'Please select an environment first' : ((authorization && authorization.trim()) || (request.authorization && request.authorization.trim())) ? 'Clear the token field to generate a new token' : 'Generate token'}
                  >
                    Generate Token
                  </button>
                </div>
                <p className="mt-1 text-sm text-gray-500">
                  Optional: Generate a token using SAT service or enter a custom token
                </p>
                {validationErrors.authorization && (
                  <p className="mt-1 text-sm text-red-600 font-medium">
                    {validationErrors.authorization}
                  </p>
                )}
              </div>

              {/* Event Name */}
              <div className="mb-4">
                <label className="block text-sm font-semibold text-primary-700 mb-2">
                  Event Name * <span className="text-xs text-gray-500 font-normal">(must exist)</span>
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={request.eventName || ''}
                    onChange={(e) => {
                      updateRequest({ eventName: e.target.value });
                      setEventFetched(false); // Reset fetched state when eventName changes
                      setFetchError(null);
                    }}
                    className={`flex-1 px-4 py-2.5 border-2 rounded-lg focus:outline-none focus:ring-2 transition-all bg-white text-gray-900 placeholder-gray-400 ${
                      validationErrors.eventName 
                        ? 'border-red-500 focus:ring-red-300 focus:border-red-500' 
                        : 'border-primary-400 focus:ring-primary-300 focus:border-primary-500'
                    }`}
                    placeholder="Enter existing event name to update"
                    disabled={mutation.isPending}
                  />
                  <button
                    type="button"
                    onClick={handleFetchEventDetails}
                    disabled={!request.eventName?.trim() || !environment || (!authorization && !request.authorization) || isFetchingEvent || mutation.isPending}
                    className={`px-4 py-2.5 rounded-lg font-semibold text-sm transition-all whitespace-nowrap ${
                      !!(request.eventName?.trim() && environment && (authorization || request.authorization) && !isFetchingEvent && !mutation.isPending)
                        ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-400 hover:to-blue-500 shadow-lg hover:shadow-xl'
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                    title={
                      !request.eventName?.trim() 
                        ? 'Enter event name first' 
                        : !environment 
                        ? 'Select environment first' 
                        : !authorization && !request.authorization
                        ? 'Provide authorization token first'
                        : 'Fetch event details from MongoDB'
                    }
                  >
                    {isFetchingEvent ? (
                      <span className="flex items-center">
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Fetching...
                      </span>
                    ) : (
                      '📥 Fetch Details'
                    )}
                  </button>
                </div>
                {validationErrors.eventName && (
                  <p className="mt-1 text-sm text-red-600 font-medium">
                    {validationErrors.eventName}
                  </p>
                )}
                {fetchError && (
                  <div className="mt-2 p-3 bg-red-50 border-2 border-red-300 rounded-lg">
                    <p className="text-sm text-red-700 font-medium">{fetchError}</p>
                  </div>
                )}
                {eventFetched && !fetchError && (
                  <div className="mt-2 p-3 bg-green-50 border-2 border-green-300 rounded-lg">
                    <p className="text-sm text-green-700 font-medium flex items-center">
                      <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      Event details loaded successfully. You can now edit the fields below.
                    </p>
                  </div>
                )}
              </div>

              {/* Subscriber Name */}
              <div className="mb-4">
                <label className="block text-sm font-semibold text-primary-700 mb-2">
                  Subscriber Name
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
                  placeholder="Enter subscriber name (optional)"
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
                requireHttpStatusCode={requireHttpStatusCode}
                showClientAndEndpoint={true}
              />
          </div>

          {/* Right Column - JSON Editors, Validation & Submit */}
          <div className="space-y-6">
              {/* JSON Editors */}
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

              {/* Validation Panel */}
              <ValidationPanel
                errors={errors}
                requestCriteria={request.requestCriteria || []}
                isValid={isValid}
              />

              {/* Submit Button */}
              <button
                type="submit"
                disabled={!isValid || !environment || mutation.isPending || (hasSubmitted && !formHasChanged)}
                className={`w-full px-6 py-4 rounded-lg font-semibold text-lg transition-all transform ${
                  isValid && environment && !mutation.isPending && (!hasSubmitted || formHasChanged)
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
                    Updating...
                  </span>
                ) : (
                  'Update Event'
                )}
              </button>
          </div>
          </div>

          {/* Operation Status Banner */}
          {operationStatus && (
            <div className={`mt-6 p-5 rounded-lg border-l-4 ${
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
              operationName="Update Event"
            />
          )}
          </div>
        </form>
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
    <div className="min-h-screen bg-gradient-to-br from-blue-500 via-blue-400 to-blue-500 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {content}
      </div>
    </div>
  );
};

