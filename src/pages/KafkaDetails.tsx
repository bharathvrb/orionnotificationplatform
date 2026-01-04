import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchKafkaDetails } from '../services/api';
import { generateSatToken } from '../services/sat';
import { downloadAsExcel, type DownloadData } from '../services/download';
import type { KafkaDetailsResponse, KafkaDetailsListResponse, Environment } from '../types';

// Simplified display names for dropdown
const ENVIRONMENT_DISPLAY_OPTIONS = [
  'DEV',
  'QA',
  'INT',
  'FLX',
  'TRN',
  'STG CH2-G2',
  'STG HO-G4',
  'PROD',
  'BUS',
];

// Mapping from simplified display name to full backend environment name
const ENVIRONMENT_MAPPING: Record<string, Environment> = {
  'DEV': 'DEV AS-G8',
  'QA': 'QA AS-G8',
  'INT': 'INT AS-G8',
  'FLX': 'FLX AS-G8',
  'TRN': 'TRN AS-G8',
  'STG CH2-G2': 'STG CH2-G2',
  'STG HO-G4': 'STG HO-G4',
  'PROD': 'PROD G1',
  'BUS': 'BUS AS-G8',
};

// Helper function to convert display name to backend environment
const getBackendEnvironment = (displayName: string): Environment | undefined => {
  return ENVIRONMENT_MAPPING[displayName];
};

interface KafkaDetailsProps {
  hideHeader?: boolean;
}

export const KafkaDetails: React.FC<KafkaDetailsProps> = ({ hideHeader = false }) => {
  const navigate = useNavigate();
  const [environment, setEnvironment] = useState<string>(''); // Store simplified display name
  const [topicNamesInput, setTopicNamesInput] = useState('');
  const [useAll, setUseAll] = useState(false);
  const [authorization, setAuthorization] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [kafkaDetails, setKafkaDetails] = useState<KafkaDetailsListResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [expandedTopics, setExpandedTopics] = useState<Set<string>>(new Set());
  const [searchTerm, setSearchTerm] = useState('');
  const [showTokenModal, setShowTokenModal] = useState(false);
  const [tokenCredentials, setTokenCredentials] = useState({
    clientId: '',
    clientSecret: '',
    scope: '',
  });
  const [isGeneratingToken, setIsGeneratingToken] = useState(false);
  const [tokenError, setTokenError] = useState<string | null>(null);
  const [lastRequestData, setLastRequestData] = useState<any>(null);
  const [lastError, setLastError] = useState<string | null>(null);
  const [errorStatusCode, setErrorStatusCode] = useState<number | null>(null);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [formHasChanged, setFormHasChanged] = useState(false);

  const handleDownload = (e?: React.MouseEvent) => {
    // Prevent any form submission or event propagation
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    // Allow download even if there are errors
    const hasData = kafkaDetails || lastRequestData || error;
    if (!hasData) {
      return;
    }

    // Determine response status
    let responseStatus = 200;
    let statusText = 'OK';
    if (errorStatusCode) {
      // Use the actual status code from the error
      responseStatus = errorStatusCode;
      switch (errorStatusCode) {
        case 400:
          statusText = 'Bad Request';
          break;
        case 401:
          statusText = 'Unauthorized';
          break;
        case 403:
          statusText = 'Forbidden';
          break;
        case 404:
          statusText = 'Not Found';
          break;
        case 500:
          statusText = 'Internal Server Error';
          break;
        default:
          statusText = 'Error';
      }
    } else if (error) {
      // Try to infer status from error message if status code not available
      if (error.includes('[HTTP 400]') || error.includes('Invalid request') || error.includes('not exist')) {
        responseStatus = 400;
        statusText = 'Bad Request';
      } else if (error.includes('[HTTP 401]') || error.includes('Authentication')) {
        responseStatus = 401;
        statusText = 'Unauthorized';
      } else if (error.includes('[HTTP 403]') || error.includes('forbidden')) {
        responseStatus = 403;
        statusText = 'Forbidden';
      } else if (error.includes('[HTTP 404]')) {
        responseStatus = 404;
        statusText = 'Not Found';
      } else if (error.includes('[HTTP 500]') || error.includes('Server error')) {
        responseStatus = 500;
        statusText = 'Internal Server Error';
      } else {
        responseStatus = 500;
        statusText = 'Error';
      }
    } else if (kafkaDetails?.status === 'Failure') {
      responseStatus = 400;
      statusText = 'Bad Request';
    }

    const downloadData: DownloadData = {
      operation: 'Kafka Details',
      timestamp: new Date().toISOString(),
      request: {
        endpoint: '/api/kafkaDetails',
        method: 'POST',
        body: lastRequestData || {},
        queryParams: {
          environment: environment ? getBackendEnvironment(environment) || '' : '',
        },
      },
      response: {
        data: kafkaDetails,
        error: error || lastError || (kafkaDetails?.status === 'Failure' ? kafkaDetails.message : undefined),
        status: responseStatus,
        statusText: statusText,
      },
      metadata: {
        topicCount: kafkaDetails?.topicDetails?.length || 0,
        environment: environment ? (getBackendEnvironment(environment) || environment) : 'Not specified',
        status: error || kafkaDetails?.status === 'Failure' ? 'Failed' : (kafkaDetails?.status || 'Success'),
        hasError: !!error || kafkaDetails?.status === 'Failure',
        healthyTopics: kafkaDetails?.topicDetails?.filter(t => t.health?.toLowerCase() === 'healthy').length || 0,
        unhealthyTopics: kafkaDetails?.topicDetails?.filter(t => t.health?.toLowerCase() === 'unhealthy').length || 0,
        notFoundTopics: kafkaDetails?.topicDetails?.filter(t => t.health?.toLowerCase() === 'not found').length || 0,
      },
    };

    downloadAsExcel(downloadData);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!useAll && !topicNamesInput.trim()) {
      setError('Please enter at least one topic name or select "Fetch All Topics"');
      return;
    }

    setLoading(true);
    setError(null);
    setErrorStatusCode(null);
    setKafkaDetails(null);
    setExpandedTopics(new Set());
    setSearchTerm('');
    setHasSubmitted(false);
    setFormHasChanged(false);

    try {
      const topicNames = useAll 
        ? ['ALL'] 
        : topicNamesInput
            .split(',')
            .map(name => name.trim())
            .filter(name => name.length > 0);

      const requestData = { topicNames };
      setLastRequestData(requestData);

      // Convert display environment to backend environment
      const backendEnvironment = environment ? getBackendEnvironment(environment) : undefined;
      
      const response = await fetchKafkaDetails(
        requestData,
        undefined,
        backendEnvironment,
        authorization || undefined
      );
      setKafkaDetails(response);
      setLastError(null);
      setHasSubmitted(true);
      setFormHasChanged(false);
      
      // Check if response indicates failure
      if (response.status === 'Failure') {
        const errorMsg = response.message || 'Failed to fetch Kafka details';
        setError(errorMsg);
        setLastError(errorMsg);
      } else if (response.topicDetails && response.topicDetails.length > 0) {
        // Check if all topics failed
        const allFailed = response.topicDetails.every(topic => 
          topic.status === 'Failure' || topic.health?.toLowerCase() === 'not found' || !topic.topicName
        );
        if (allFailed) {
          const failedTopics = response.topicDetails
            .map(topic => topic.topicName || 'Unknown')
            .join(', ');
          const errorMsg = `Unable to fetch details for the following topic(s): ${failedTopics}. These topics may not exist in the ${environment} environment.`;
          setError(errorMsg);
          setLastError(errorMsg);
        } else {
          // Some topics succeeded, some may have failed - show partial success
          const failedTopics = response.topicDetails
            .filter(topic => topic.status === 'Failure' || topic.health?.toLowerCase() === 'not found')
            .map(topic => topic.topicName || 'Unknown');
          if (failedTopics.length > 0) {
            const warningMsg = `Warning: Some topics could not be fetched: ${failedTopics.join(', ')}. These topics may not exist in the ${environment} environment.`;
            setError(warningMsg);
            setLastError(warningMsg);
          }
        }
      } else if (response.topicDetails && response.topicDetails.length === 0) {
        const errorMsg = `No topics found. The requested topic(s) may not exist in the ${environment} environment.`;
        setError(errorMsg);
        setLastError(errorMsg);
      }
    } catch (err: any) {
      // Extract status code
      const statusCode = err?.response?.status || err?.status || null;
      setErrorStatusCode(statusCode);
      
      // Check if error contains response data that we can use
      if (err?.response?.data && typeof err.response.data === 'object' && 'topicDetails' in err.response.data) {
        // Backend returned structured error with topic details
        const errorResponse = err.response.data as KafkaDetailsListResponse;
        setKafkaDetails(errorResponse);
        
        // Extract error message
        let errorMsg = errorResponse.message || err.message || 'Failed to fetch Kafka details';
        
        // If we have topic details, provide more context
        if (errorResponse.topicDetails && errorResponse.topicDetails.length > 0) {
          const failedTopics = errorResponse.topicDetails
            .filter(topic => topic.status === 'Failure' || topic.health?.toLowerCase() === 'not found')
            .map(topic => topic.topicName || 'Unknown');
          if (failedTopics.length > 0) {
            errorMsg = `Unable to fetch details for topic(s): ${failedTopics.join(', ')}. These topics may not exist in the ${environment} environment.`;
          }
        }
        
        // Add status code to error message
        if (statusCode) {
          errorMsg = `[HTTP ${statusCode}] ${errorMsg}`;
        }
        
        setError(errorMsg);
        setLastError(errorMsg);
      } else {
        // Standard error handling
        let errorMsg = err instanceof Error ? err.message : 'Failed to fetch Kafka details';
        
        // Add status code to error message
        if (statusCode) {
          errorMsg = `[HTTP ${statusCode}] ${errorMsg}`;
        }
        
        setError(errorMsg);
        setLastError(errorMsg);
        setKafkaDetails(null);
      }
      setHasSubmitted(true);
      setFormHasChanged(false);
    } finally {
      setLoading(false);
    }
  };

  const toggleExpand = (topicName: string) => {
    const newExpanded = new Set(expandedTopics);
    if (newExpanded.has(topicName)) {
      newExpanded.delete(topicName);
    } else {
      newExpanded.add(topicName);
    }
    setExpandedTopics(newExpanded);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

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
      // Convert display environment to backend environment for token generation
      const backendEnvironment = getBackendEnvironment(environment);
      if (!backendEnvironment) {
        setTokenError('Invalid environment selected');
        return;
      }
      
      const token = await generateSatToken(backendEnvironment, {
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

  const getHealthBadgeColor = (health?: string) => {
    if (!health) return 'bg-gray-100 text-gray-800';
    switch (health.toLowerCase()) {
      case 'healthy':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'unhealthy':
        return 'bg-red-100 text-red-800 border-red-300';
      case 'not found':
        return 'bg-orange-100 text-orange-800 border-orange-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getHealthIcon = (health?: string) => {
    if (!health) return '❓';
    switch (health.toLowerCase()) {
      case 'healthy':
        return '✅';
      case 'unhealthy':
        return '❌';
      case 'not found':
        return '⚠️';
      default:
        return '❓';
    }
  };

  const filteredTopics = kafkaDetails?.topicDetails?.filter(topic => 
    topic.topicName?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

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
            <h1 className="text-2xl font-bold text-white mb-2 drop-shadow-lg">View Kafka Details</h1>
            <p className="text-white text-lg font-medium">
              View event configuration present in Kafka including topics, consumer groups, and related settings
            </p>
          </div>
        </div>
      )}

        {/* Environment Selection Box - Show first */}
        <div className="bg-white rounded-xl shadow-2xl border-2 border-primary-400 p-8 mb-6">
          <h2 className="text-lg font-semibold text-primary-700 mb-6 flex items-center">
            <span className="w-1 h-6 bg-gradient-to-b from-primary-500 to-primary-600 rounded-full mr-3"></span>
            Select Environment
          </h2>
          <div>
            <label htmlFor="environment" className="block text-sm font-semibold text-primary-700 mb-3">
              Environment *
            </label>
            <select
              id="environment"
              value={environment}
              onChange={(e) => {
                setEnvironment(e.target.value);
                if (hasSubmitted) setFormHasChanged(true);
              }}
              className="w-full px-4 py-3 border-2 border-primary-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-300 focus:border-primary-500 bg-white text-gray-900 text-sm font-medium transition-all"
              disabled={loading}
              required
            >
              <option value="">-- Select Environment --</option>
              {ENVIRONMENT_DISPLAY_OPTIONS.map((env) => (
                <option key={env} value={env}>
                  {env}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Authorization Token Box - Show after environment is selected */}
        {environment && (
          <div className="bg-white rounded-xl shadow-2xl border-2 border-primary-400 p-8 mb-6">
            <h2 className="text-lg font-semibold text-primary-700 mb-6 flex items-center">
              <span className="w-1 h-6 bg-gradient-to-b from-primary-500 to-primary-600 rounded-full mr-3"></span>
              Authorization Token
            </h2>
            <div>
              <label htmlFor="authorization" className="block text-sm font-medium text-gray-700 mb-2">
                Authorization Token
              </label>
              <div className="flex gap-2">
                <input
                  id="authorization"
                  type="password"
                  value={authorization}
                  onChange={(e) => {
                    setAuthorization(e.target.value);
                    if (hasSubmitted) setFormHasChanged(true);
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="Enter authorization token or generate one"
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => {
                    setAuthorization(''); // Clear manual token when opening Generate Token modal
                    setShowTokenModal(true);
                  }}
                  disabled={!environment || loading || !!(authorization && authorization.trim().length > 0)}
                  className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all ${
                    !!(environment && !loading && (!authorization || !authorization.trim()))
                      ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white hover:from-primary-400 hover:to-primary-500 shadow-lg hover:shadow-xl'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                  title={!environment ? 'Please select an environment first' : (authorization && authorization.trim()) ? 'Clear the token field to generate a new token' : 'Generate token'}
                >
                  Generate Token
                </button>
              </div>
              <p className="mt-1 text-sm text-gray-500">
                Optional: Generate a token using SAT service or enter a custom token
              </p>
            </div>
          </div>
        )}

        {/* Form Fields - Show after environment is selected */}
        {environment && (
        <div className="bg-white rounded-xl shadow-2xl border-2 border-primary-400 p-8">
          <form onSubmit={handleSubmit} className="mb-8">
            <div className="space-y-4">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="useAll"
                  checked={useAll}
                  onChange={(e) => {
                    setUseAll(e.target.checked);
                    if (e.target.checked) {
                      setTopicNamesInput('');
                    }
                    if (hasSubmitted) setFormHasChanged(true);
                  }}
                  className="w-5 h-5 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                  disabled={loading}
                />
                <label htmlFor="useAll" className="ml-3 text-sm font-semibold text-gray-700">
                  Fetch All Topics
                </label>
              </div>

              {!useAll && (
                <div>
                  <label htmlFor="topicNames" className="block text-sm font-medium text-gray-700 mb-2">
                    Kafka Topic Names (comma-separated)
                  </label>
                  <textarea
                    id="topicNames"
                    value={topicNamesInput}
                    onChange={(e) => {
                      setTopicNamesInput(e.target.value);
                      if (hasSubmitted) setFormHasChanged(true);
                    }}
                    placeholder="e.g., onp-cbgupdate-topic, onp-order-topic, onp-payment-topic"
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    disabled={loading || useAll}
                  />
                </div>
              )}

              <button
                type="submit"
                disabled={loading || !environment || (!useAll && !topicNamesInput.trim()) || (hasSubmitted && !formHasChanged)}
                className="w-full px-6 py-3 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-lg font-semibold hover:from-primary-400 hover:to-primary-500 shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Fetching...
                  </>
                ) : (
                  useAll ? 'Fetch All Topics' : 'Fetch Details'
                )}
              </button>
            </div>
          </form>
        </div>
        )}

        {error && (
            <div className={`mb-6 p-5 rounded-lg border-l-4 ${
              error.toLowerCase().includes('warning') 
                ? 'bg-yellow-50 border-yellow-400' 
                : 'bg-red-50 border-red-400'
            }`}>
              <div className="flex items-start justify-between">
                <div className="flex items-start flex-1">
                  {error.toLowerCase().includes('warning') ? (
                    <svg className="w-5 h-5 text-yellow-500 mr-3 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5 text-red-400 mr-3 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  )}
                  <div className="flex-1">
                    <p className={`font-semibold mb-1 ${
                      error.toLowerCase().includes('warning') 
                        ? 'text-yellow-800' 
                        : 'text-red-800'
                    }`}>
                      {error.toLowerCase().includes('warning') ? 'Warning' : 'Error'}
                    </p>
                    <p className={`text-sm ${
                      error.toLowerCase().includes('warning') 
                        ? 'text-yellow-700' 
                        : 'text-red-700'
                    }`}>
                      {error}
                    </p>
                    <div className={`flex items-center gap-3 mt-2 text-xs ${
                      error.toLowerCase().includes('warning') 
                        ? 'text-yellow-600' 
                        : 'text-red-600'
                    }`}>
                      {environment && (
                        <span>
                          Environment: <span className="font-semibold">{environment}</span>
                        </span>
                      )}
                      {errorStatusCode && (
                        <span className="px-2 py-1 bg-white bg-opacity-50 rounded border border-current font-mono font-semibold">
                          Status: {errorStatusCode}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                {(error || lastRequestData) && (
                  <div className="flex gap-2 ml-4">
                    <button
                      type="button"
                      onClick={handleDownload}
                      className="px-4 py-2 text-sm font-semibold bg-primary-500 hover:bg-primary-600 text-white rounded-lg transition-all shadow-sm hover:shadow border border-primary-400 flex items-center gap-2"
                      title="Download error details as Excel"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      Download Excel
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

        {kafkaDetails && kafkaDetails.topicDetails && kafkaDetails.topicDetails.length > 0 && (
            <div className="space-y-6">
              {/* Summary Stats */}
              <div className="bg-gradient-to-r from-primary-50 to-primary-100 rounded-lg p-6 border border-primary-200">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex-1">
                    <h2 className="text-2xl font-bold text-primary-700">Results Summary</h2>
                    <div className="mt-2 space-y-1">
                      <p className="text-primary-600 font-medium">
                        Found {kafkaDetails.topicDetails.length} topic(s)
                        {environment && (
                          <span className="text-primary-500 ml-2">• Environment: {environment}</span>
                        )}
                      </p>
                      {kafkaDetails.status && (
                        <p className={`text-sm font-semibold ${
                          kafkaDetails.status === 'Success' 
                            ? 'text-green-700' 
                            : kafkaDetails.status === 'Failure' 
                            ? 'text-red-700' 
                            : 'text-yellow-700'
                        }`}>
                          Status: {kafkaDetails.status}
                          {kafkaDetails.message && ` - ${kafkaDetails.message}`}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-4 ml-4">
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={handleDownload}
                        className="px-4 py-2 text-sm font-semibold bg-primary-500 hover:bg-primary-600 text-white rounded-lg transition-all shadow-sm hover:shadow border border-primary-400 flex items-center gap-2"
                        title="Download as Excel"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        Download Excel
                      </button>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-6 mt-4 pt-4 border-t border-primary-300">
                  {kafkaDetails.topicDetails.filter(t => t.health?.toLowerCase() === 'healthy').length > 0 && (
                    <div className="text-center px-4 py-2 bg-green-50 rounded-lg border border-green-200">
                      <div className="text-2xl font-bold text-green-600">
                        {kafkaDetails.topicDetails.filter(t => t.health?.toLowerCase() === 'healthy').length}
                      </div>
                      <div className="text-xs text-gray-600 font-medium">Healthy</div>
                    </div>
                  )}
                  {kafkaDetails.topicDetails.filter(t => t.health?.toLowerCase() === 'unhealthy').length > 0 && (
                    <div className="text-center px-4 py-2 bg-red-50 rounded-lg border border-red-200">
                      <div className="text-2xl font-bold text-red-600">
                        {kafkaDetails.topicDetails.filter(t => t.health?.toLowerCase() === 'unhealthy').length}
                      </div>
                      <div className="text-xs text-gray-600 font-medium">Unhealthy</div>
                    </div>
                  )}
                  {kafkaDetails.topicDetails.filter(t => t.health?.toLowerCase() === 'not found').length > 0 && (
                    <div className="text-center px-4 py-2 bg-orange-50 rounded-lg border border-orange-200">
                      <div className="text-2xl font-bold text-orange-600">
                        {kafkaDetails.topicDetails.filter(t => t.health?.toLowerCase() === 'not found').length}
                      </div>
                      <div className="text-xs text-gray-600 font-medium">Not Found</div>
                    </div>
                  )}
                  <div className="text-center px-4 py-2 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="text-2xl font-bold text-blue-600">
                      {kafkaDetails.topicDetails.reduce((sum, t) => sum + (t.consumerGroups?.length || 0), 0)}
                    </div>
                    <div className="text-xs text-gray-600 font-medium">Total Consumer Groups</div>
                  </div>
                </div>

                {/* Search Filter */}
                <div className="mt-4">
                  <input
                    type="text"
                    placeholder="Search topics..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
              </div>

              {filteredTopics.length === 0 && searchTerm && (
                <div className="text-center py-8 bg-gray-50 rounded-lg">
                  <p className="text-gray-600">No topics match your search: "{searchTerm}"</p>
                </div>
              )}

              {filteredTopics.map((topicDetail: KafkaDetailsResponse, index: number) => (
                <TopicDetailCard
                  key={topicDetail.topicName || index}
                  topicDetail={topicDetail}
                  isExpanded={expandedTopics.has(topicDetail.topicName || '')}
                  onToggle={() => toggleExpand(topicDetail.topicName || '')}
                  getHealthBadgeColor={getHealthBadgeColor}
                  getHealthIcon={getHealthIcon}
                  copyToClipboard={copyToClipboard}
                />
              ))}
            </div>
          )}

        {kafkaDetails && kafkaDetails.topicDetails && kafkaDetails.topicDetails.length === 0 && (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📭</div>
              <h2 className="text-2xl font-bold text-primary-700 mb-4">No Data Found</h2>
              <p className="text-gray-600">
                No topic details found for the provided topic names.
              </p>
            </div>
          )}

          {!kafkaDetails && !loading && !error && (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">⚡</div>
              <h2 className="text-2xl font-bold text-primary-700 mb-4">View Kafka Details</h2>
              <p className="text-gray-600 mb-6">
                Enter Kafka topic names above (comma-separated) to view event configuration present in Kafka including topics, consumer groups, and related settings.
              </p>
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
                    <div className="bg-red-50 border-2 border-red-300 rounded-lg p-3">
                      <p className="text-sm text-red-600 font-medium">{tokenError}</p>
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
    <div className="min-h-screen bg-gradient-to-br from-blue-400 via-blue-300 to-blue-400 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {content}
      </div>
    </div>
  );
};

interface TopicDetailCardProps {
  topicDetail: KafkaDetailsResponse;
  isExpanded: boolean;
  onToggle: () => void;
  getHealthBadgeColor: (health?: string) => string;
  getHealthIcon: (health?: string) => string;
  copyToClipboard: (text: string) => void;
}

const TopicDetailCard: React.FC<TopicDetailCardProps> = ({ 
  topicDetail, 
  isExpanded, 
  onToggle, 
  getHealthBadgeColor,
  getHealthIcon,
  copyToClipboard
}) => {
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const handleCopy = (text: string, field: string) => {
    copyToClipboard(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const formatConfigValue = (value: string) => {
    // Try to format as number with commas if it's a large number
    if (/^\d+$/.test(value) && parseInt(value) > 1000) {
      return parseInt(value).toLocaleString();
    }
    return value;
  };

  return (
    <div className="bg-white rounded-lg border-2 border-gray-200 shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
      <div
        className="bg-gradient-to-r from-primary-50 to-primary-100 p-5 cursor-pointer hover:from-primary-100 hover:to-primary-200 transition-colors"
        onClick={onToggle}
      >
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-2xl">{getHealthIcon(topicDetail.health)}</span>
              <h3 className="text-xl font-bold text-primary-700">{topicDetail.topicName || 'Unknown Topic'}</h3>
              <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold border ${getHealthBadgeColor(topicDetail.health)}`}>
                {topicDetail.health || 'Unknown'}
              </span>
            </div>
            <div className="flex items-center gap-6 mt-3">
              {topicDetail.partitions !== null && topicDetail.partitions !== undefined && (
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
                  </svg>
                  <span className="text-sm font-medium text-primary-600">
                    {topicDetail.partitions} Partition{topicDetail.partitions !== 1 ? 's' : ''}
                  </span>
                </div>
              )}
              {topicDetail.replicationFactor !== null && topicDetail.replicationFactor !== undefined && (
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                  </svg>
                  <span className="text-sm font-medium text-primary-600">
                    RF: {topicDetail.replicationFactor}
                  </span>
                </div>
              )}
              {topicDetail.consumerGroups && topicDetail.consumerGroups.length > 0 && (
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  <span className="text-sm font-medium text-primary-600">
                    {topicDetail.consumerGroups.length} Consumer Group{topicDetail.consumerGroups.length !== 1 ? 's' : ''}
                  </span>
                </div>
              )}
            </div>
          </div>
          <svg
            className={`w-6 h-6 text-primary-600 transform transition-transform ${isExpanded ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>

      {isExpanded && (
        <div className="p-6 space-y-6 bg-gray-50">
          {/* Topic Overview - Enhanced Stats */}
          <div className="bg-white rounded-lg p-6 border border-primary-200 shadow-sm">
            <h4 className="text-lg font-bold text-primary-700 mb-4 flex items-center">
              <svg className="w-5 h-5 mr-2 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              Topic Overview
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard 
                label="Topic Name" 
                value={topicDetail.topicName} 
                icon="📋"
                onCopy={() => topicDetail.topicName && handleCopy(topicDetail.topicName, 'topicName')}
                copied={copiedField === 'topicName'}
              />
              <StatCard 
                label="Health Status" 
                value={topicDetail.health} 
                icon={getHealthIcon(topicDetail.health)}
                badgeColor={getHealthBadgeColor(topicDetail.health)}
              />
              <StatCard 
                label="Partitions" 
                value={topicDetail.partitions?.toString()} 
                icon="📊"
              />
              <StatCard 
                label="Replication Factor" 
                value={topicDetail.replicationFactor?.toString()} 
                icon="🔄"
              />
            </div>
          </div>

          {/* Configuration - Enhanced */}
          {topicDetail.config && Object.keys(topicDetail.config).length > 0 && (
            <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-lg font-bold text-primary-700 flex items-center">
                  <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  Topic Configuration ({Object.keys(topicDetail.config).length} settings)
                </h4>
                <button
                  onClick={() => handleCopy(JSON.stringify(topicDetail.config, null, 2), 'config')}
                  className="text-sm text-primary-600 hover:text-primary-800 flex items-center gap-1"
                >
                  {copiedField === 'config' ? (
                    <>
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      Copied!
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                      Copy All
                    </>
                  )}
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Configuration Key
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Value
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-20">
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {Object.entries(topicDetail.config).map(([key, value]) => (
                      <tr key={key} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{key}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-500 break-words max-w-md">
                            {formatConfigValue(value)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <button
                            onClick={() => handleCopy(value, `config-${key}`)}
                            className="text-primary-600 hover:text-primary-800"
                            title="Copy value"
                          >
                            {copiedField === `config-${key}` ? (
                              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                            ) : (
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                              </svg>
                            )}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Consumer Groups - Enhanced */}
          {topicDetail.consumerGroups && topicDetail.consumerGroups.length > 0 && (
            <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-lg font-bold text-primary-700 flex items-center">
                  <svg className="w-5 h-5 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  Consumer Groups ({topicDetail.consumerGroups.length})
                </h4>
                <button
                  onClick={() => handleCopy(topicDetail.consumerGroups?.join(', ') || '', 'consumerGroups')}
                  className="text-sm text-primary-600 hover:text-primary-800 flex items-center gap-1"
                >
                  {copiedField === 'consumerGroups' ? (
                    <>
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      Copied!
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                      Copy All
                    </>
                  )}
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {topicDetail.consumerGroups.map((group, index) => (
                  <div
                    key={index}
                    className="p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-lg border border-green-200 hover:shadow-md transition-shadow flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2 flex-1">
                      <svg className="w-5 h-5 text-green-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <p className="text-sm font-medium text-gray-900 break-words">{group}</p>
                    </div>
                    <button
                      onClick={() => handleCopy(group, `cg-${index}`)}
                      className="ml-2 text-green-600 hover:text-green-800 flex-shrink-0"
                      title="Copy group name"
                    >
                      {copiedField === `cg-${index}` ? (
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      ) : (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                      )}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {(!topicDetail.consumerGroups || topicDetail.consumerGroups.length === 0) && (
            <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
              <h4 className="text-lg font-bold text-primary-700 mb-2 flex items-center">
                <svg className="w-5 h-5 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                Consumer Groups
              </h4>
              <p className="text-gray-600">No consumer groups found for this topic.</p>
            </div>
          )}

          {/* Status Message */}
          {topicDetail.message && (
            <div className={`p-4 rounded-lg border-l-4 ${
              topicDetail.status === 'Success' 
                ? 'bg-green-50 border-green-400' 
                : 'bg-yellow-50 border-yellow-400'
            }`}>
              <div className="flex items-start">
                {topicDetail.status === 'Success' ? (
                  <svg className="w-5 h-5 text-green-400 mr-2 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5 text-yellow-400 mr-2 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                )}
                <p className={`text-sm font-medium ${
                  topicDetail.status === 'Success' 
                    ? 'text-green-800' 
                    : 'text-yellow-800'
                }`}>
                  {topicDetail.message}
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

interface StatCardProps {
  label: string;
  value?: string | null;
  icon?: string;
  badgeColor?: string;
  onCopy?: () => void;
  copied?: boolean;
}

const StatCard: React.FC<StatCardProps> = ({ label, value, icon, badgeColor, onCopy, copied }) => (
  <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg p-4 border border-gray-200">
    <div className="flex items-center justify-between">
      <div className="flex-1">
        <p className="text-xs font-semibold text-gray-500 uppercase mb-1">{label}</p>
        <div className="flex items-center gap-2">
          {icon && <span className="text-lg">{icon}</span>}
          {badgeColor ? (
            <span className={`inline-block px-2 py-1 rounded text-xs font-semibold border ${badgeColor}`}>
              {value || 'N/A'}
            </span>
          ) : (
            <p className="text-sm font-bold text-gray-900">{value || 'N/A'}</p>
          )}
        </div>
      </div>
      {onCopy && (
        <button
          onClick={onCopy}
          className="text-gray-400 hover:text-gray-600"
          title="Copy to clipboard"
        >
          {copied ? (
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          ) : (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          )}
        </button>
      )}
    </div>
  </div>
);
