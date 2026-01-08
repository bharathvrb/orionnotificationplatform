import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchMongoDBDetails } from '../services/api';
import { generateSatToken } from '../services/sat';
import { downloadAsExcel, type DownloadData } from '../services/download';
import type { MongoDBDetailsResponse, EventDetail, Environment } from '../types';
import { ProductionWarning } from '../components/ProductionWarning';

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

interface MongoDBDetailsProps {
  hideHeader?: boolean;
}

export const MongoDBDetails: React.FC<MongoDBDetailsProps> = ({ hideHeader = false }) => {
  const navigate = useNavigate();
  const [environment, setEnvironment] = useState<Environment | ''>('');
  const [eventNamesInput, setEventNamesInput] = useState('');
  const [useAll, setUseAll] = useState(false);
  const [authorization, setAuthorization] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [mongoDBDetails, setMongoDBDetails] = useState<MongoDBDetailsResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [expandedEvents, setExpandedEvents] = useState<Set<string>>(new Set());
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
    const hasData = mongoDBDetails || lastRequestData || error;
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
    } else if (mongoDBDetails?.status === 'Failure') {
      responseStatus = 400;
      statusText = 'Bad Request';
    }

    const downloadData: DownloadData = {
      operation: 'MongoDB Details',
      timestamp: new Date().toISOString(),
      request: {
        endpoint: '/api/mongoDBDetails',
        method: 'POST',
        body: lastRequestData || {},
        queryParams: {
          environment: environment || '',
        },
      },
      response: {
        data: mongoDBDetails,
        error: error || lastError || (mongoDBDetails?.status === 'Failure' ? mongoDBDetails.message : undefined),
        status: responseStatus,
        statusText: statusText,
      },
      metadata: {
        eventCount: mongoDBDetails?.eventDetails?.length || 0,
        environment: environment || 'Not specified',
        status: error || mongoDBDetails?.status === 'Failure' ? 'Failed' : (mongoDBDetails?.status || 'Success'),
        hasError: !!error || mongoDBDetails?.status === 'Failure',
        eventsWithMongoDB: mongoDBDetails?.eventDetails?.filter(e => e.mongoDBData).length || 0,
        eventsWithRedis: mongoDBDetails?.eventDetails?.filter(e => e.redisData).length || 0,
        totalDownstreams: mongoDBDetails?.eventDetails?.reduce((sum, e) => sum + (e.downstreamDetails?.length || 0), 0) || 0,
      },
    };

    downloadAsExcel(downloadData);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!useAll && !eventNamesInput.trim()) {
      setError('Please enter event names or select "Fetch All"');
      return;
    }

    setLoading(true);
    setError(null);
    setErrorStatusCode(null);
    setMongoDBDetails(null);
    setExpandedEvents(new Set());
    setHasSubmitted(false);
    setFormHasChanged(false);

    try {
      const eventNames = useAll 
        ? ['ALL'] 
        : eventNamesInput
            .split(',')
            .map(name => name.trim())
            .filter(name => name.length > 0);

      const requestData = { eventNames };
      setLastRequestData(requestData);

      const response = await fetchMongoDBDetails(
        requestData,
        undefined,
        environment || undefined,
        authorization || undefined
      );
      setMongoDBDetails(response);
      setLastError(null);
      setHasSubmitted(true);
      setFormHasChanged(false);
      
      // Check if response indicates failure
      if (response.status === 'Failure') {
        const errorMsg = response.message || 'Failed to fetch MongoDB details';
        setError(errorMsg);
        setLastError(errorMsg);
      } else if (response.eventDetails && response.eventDetails.length === 0) {
        const errorMsg = `No events found. The requested event name(s) may not exist in the ${environment} environment.`;
        setError(errorMsg);
        setLastError(errorMsg);
      }
    } catch (err: any) {
      // Extract status code
      const statusCode = err?.response?.status || err?.status || null;
      setErrorStatusCode(statusCode);
      
      // Check if error contains response data that we can use
      if (err?.response?.data && typeof err.response.data === 'object' && 'eventDetails' in err.response.data) {
        // Backend returned structured error with event details
        const errorResponse = err.response.data as MongoDBDetailsResponse;
        setMongoDBDetails(errorResponse);
        
        // Extract error message
        let errorMsg = errorResponse.message || err.message || 'Failed to fetch MongoDB details';
        
        // If we have event details, provide more context
        if (errorResponse.eventDetails && errorResponse.eventDetails.length === 0) {
          errorMsg = `No events found. The requested event name(s) may not exist in the ${environment} environment.`;
        }
        
        // Add status code to error message
        if (statusCode) {
          errorMsg = `[HTTP ${statusCode}] ${errorMsg}`;
        }
        
        setError(errorMsg);
        setLastError(errorMsg);
      } else {
        // Standard error handling
        let errorMsg = err instanceof Error ? err.message : 'Failed to fetch MongoDB details';
        
        // Add status code to error message
        if (statusCode) {
          errorMsg = `[HTTP ${statusCode}] ${errorMsg}`;
        }
        
        setError(errorMsg);
        setLastError(errorMsg);
        setMongoDBDetails(null);
      }
      setHasSubmitted(true);
      setFormHasChanged(false);
    } finally {
      setLoading(false);
    }
  };

  const toggleExpand = (eventType: string) => {
    const newExpanded = new Set(expandedEvents);
    if (newExpanded.has(eventType)) {
      newExpanded.delete(eventType);
    } else {
      newExpanded.add(eventType);
    }
    setExpandedEvents(newExpanded);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleString();
    } catch {
      return dateString;
    }
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
            <h1 className="text-2xl font-bold text-white mb-2 drop-shadow-lg">View MongoDB and Redis Details</h1>
            <p className="text-white text-lg font-medium">
              View events present in MongoDB and Redis cache with complete event information
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
                setEnvironment(e.target.value as Environment);
                if (hasSubmitted) setFormHasChanged(true);
              }}
              className="w-full px-4 py-3 border-2 border-primary-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-300 focus:border-primary-500 bg-white text-gray-900 text-sm font-medium transition-all"
              disabled={loading}
              required
            >
              <option value="">-- Select Environment --</option>
              {ENVIRONMENT_OPTIONS.map((env) => (
                <option key={env} value={env}>
                  {env}
                </option>
              ))}
            </select>
            <ProductionWarning environment={environment} />
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
                      setEventNamesInput('');
                    }
                    if (hasSubmitted) setFormHasChanged(true);
                  }}
                  className="w-5 h-5 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                  disabled={loading}
                />
                <label htmlFor="useAll" className="ml-3 text-sm font-semibold text-gray-700">
                  Fetch All Events
                </label>
              </div>

              {!useAll && (
                <div>
                  <label htmlFor="eventNames" className="block text-sm font-medium text-gray-700 mb-2">
                    Event Names (comma-separated)
                  </label>
                  <textarea
                    id="eventNames"
                    value={eventNamesInput}
                    onChange={(e) => {
                      setEventNamesInput(e.target.value);
                      if (hasSubmitted) setFormHasChanged(true);
                    }}
                    placeholder="e.g., EVENT1, EVENT2, EVENT3"
                    rows={3}
                    className="w-full px-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    disabled={loading || useAll}
                  />
                </div>
              )}

              <button
                type="submit"
                disabled={loading || !environment || (!useAll && !eventNamesInput.trim()) || (hasSubmitted && !formHasChanged)}
                className="w-full px-6 py-3 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-lg font-semibold hover:from-primary-400 hover:to-primary-500 shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Fetching...' : useAll ? 'Fetch All Events' : 'Fetch Details'}
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
                    <p className={`text-xs mt-2 ${
                      error.toLowerCase().includes('warning') 
                        ? 'text-yellow-600' 
                        : 'text-red-600'
                    }`}>
                      Need to update an event?{' '}
                      <button
                        type="button"
                        onClick={() => navigate('/update')}
                        className={`${
                          error.toLowerCase().includes('warning') 
                            ? 'text-yellow-700 hover:text-yellow-900' 
                            : 'text-red-700 hover:text-red-900'
                        } underline font-normal`}
                      >
                        Go to Update Event page
                      </button>
                    </p>
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

        {mongoDBDetails && mongoDBDetails.eventDetails && mongoDBDetails.eventDetails.length > 0 && (
            <div className="space-y-6">
              <div className="bg-gradient-to-r from-primary-50 to-primary-100 rounded-lg p-6 border border-primary-200">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex-1">
                    <h2 className="text-2xl font-bold text-primary-700 mb-2">Results Summary</h2>
                    <div className="mt-2 space-y-1">
                      <p className="text-primary-600 font-medium">
                        Found {mongoDBDetails.eventDetails.length} event(s)
                        {environment && (
                          <span className="text-primary-500 ml-2">• Environment: {environment}</span>
                        )}
                      </p>
                      {mongoDBDetails.status && (
                        <p className={`text-sm font-semibold ${
                          mongoDBDetails.status === 'Success' 
                            ? 'text-green-700' 
                            : mongoDBDetails.status === 'Failure' 
                            ? 'text-red-700' 
                            : 'text-yellow-700'
                        }`}>
                          Status: {mongoDBDetails.status}
                          {mongoDBDetails.message && ` - ${mongoDBDetails.message}`}
                        </p>
                      )}
                      <p className="text-xs text-gray-500 mt-2">
                        Need to update an event?{' '}
                        <button
                          onClick={() => navigate('/update')}
                          className="text-primary-600 hover:text-primary-800 underline font-normal"
                        >
                          Go to Update Event page
                        </button>
                      </p>
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
                  <div className="text-center px-4 py-2 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="text-2xl font-bold text-blue-600">
                      {mongoDBDetails.eventDetails.filter(e => e.mongoDBData).length}
                    </div>
                    <div className="text-xs text-gray-600 font-medium">With MongoDB Data</div>
                  </div>
                  <div className="text-center px-4 py-2 bg-red-50 rounded-lg border border-red-200">
                    <div className="text-2xl font-bold text-red-600">
                      {mongoDBDetails.eventDetails.filter(e => e.redisData).length}
                    </div>
                    <div className="text-xs text-gray-600 font-medium">With Redis Data</div>
                  </div>
                  <div className="text-center px-4 py-2 bg-green-50 rounded-lg border border-green-200">
                    <div className="text-2xl font-bold text-green-600">
                      {mongoDBDetails.eventDetails.reduce((sum, e) => sum + (e.downstreamDetails?.length || 0), 0)}
                    </div>
                    <div className="text-xs text-gray-600 font-medium">Total Downstreams</div>
                  </div>
                </div>
              </div>

              {mongoDBDetails.eventDetails.map((eventDetail: EventDetail, index: number) => (
                <EventDetailCard
                  key={eventDetail.eventType || index}
                  eventDetail={eventDetail}
                  isExpanded={expandedEvents.has(eventDetail.eventType || '')}
                  onToggle={() => toggleExpand(eventDetail.eventType || '')}
                  formatDate={formatDate}
                />
              ))}
            </div>
          )}

          {mongoDBDetails && mongoDBDetails.eventDetails && mongoDBDetails.eventDetails.length === 0 && (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📭</div>
              <h2 className="text-2xl font-bold text-primary-700 mb-4">No Data Found</h2>
              <p className="text-gray-600">
                No event details found for the provided event names.
              </p>
            </div>
          )}

          {!mongoDBDetails && !loading && !error && (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🍃</div>
              <h2 className="text-2xl font-bold text-primary-700 mb-4">View MongoDB and Redis Details</h2>
              <p className="text-gray-600 mb-6">
                Enter event names above or select "Fetch All" to view events present in MongoDB and Redis cache.
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
    <div className="min-h-screen bg-gradient-to-br from-blue-500 via-blue-400 to-blue-500 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {content}
      </div>
    </div>
  );
};

interface EventDetailCardProps {
  eventDetail: EventDetail;
  isExpanded: boolean;
  onToggle: () => void;
  formatDate: (date?: string) => string;
}

// Helper function to parse schema definition XML and extract Header and Payload
const parseSchemaDefinition = (schemaDefinition: string): { header?: string; payload?: string } | null => {
  if (!schemaDefinition) return null;
  
  try {
    // Try to extract HeaderAttributes JSON - match content between tags (non-greedy, handles whitespace)
    const headerMatch = schemaDefinition.match(/<HeaderAttributes>([\s\S]*?)<\/HeaderAttributes>/);
    // Try to extract Payload Schema JSON - match content between <Schema> tags within <Payload>
    const payloadMatch = schemaDefinition.match(/<Payload>[\s\S]*?<Schema>([\s\S]*?)<\/Schema>[\s\S]*?<\/Payload>/);
    
    let headerJson: string | undefined;
    let payloadJson: string | undefined;
    
    if (headerMatch && headerMatch[1]) {
      try {
        // Trim whitespace and parse the JSON to format it nicely
        const trimmed = headerMatch[1].trim();
        const parsed = JSON.parse(trimmed);
        headerJson = JSON.stringify(parsed, null, 2);
      } catch (e) {
        // If parsing fails, use the raw string (trimmed)
        headerJson = headerMatch[1].trim();
      }
    }
    
    if (payloadMatch && payloadMatch[1]) {
      try {
        // Trim whitespace and parse the JSON to format it nicely
        const trimmed = payloadMatch[1].trim();
        const parsed = JSON.parse(trimmed);
        payloadJson = JSON.stringify(parsed, null, 2);
      } catch (e) {
        // If parsing fails, use the raw string (trimmed)
        payloadJson = payloadMatch[1].trim();
      }
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

const EventDetailCard: React.FC<EventDetailCardProps> = ({ eventDetail, isExpanded, onToggle, formatDate }) => {
  // Parse schema definition if available
  const parsedSchema = eventDetail.mongoDBData?.schemaDefinition 
    ? parseSchemaDefinition(eventDetail.mongoDBData.schemaDefinition)
    : null;
  
  return (
    <div className="bg-white rounded-lg border-2 border-gray-200 shadow-lg overflow-hidden">
      <div
        className="bg-gradient-to-r from-primary-50 to-primary-100 p-4 cursor-pointer hover:from-primary-100 hover:to-primary-200 transition-colors"
        onClick={onToggle}
      >
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold text-primary-700">{eventDetail.eventType || 'Unknown Event'}</h3>
            <p className="text-sm text-primary-600 mt-1">
              {eventDetail.mongoDBData ? 'MongoDB data available' : 'No MongoDB data'}
              {(eventDetail.redisData?.notificationSchema || (eventDetail.redisData?.authorizations && eventDetail.redisData.authorizations.length > 0)) && ' • Redis data available'}
            </p>
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
        <div className="p-6 space-y-6">
          {/* MongoDB Data */}
          {eventDetail.mongoDBData && (
            <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
              <h4 className="text-lg font-bold text-blue-700 mb-4 flex items-center">
                <span className="w-2 h-6 bg-blue-500 rounded-full mr-2"></span>
                MongoDB Data (NotificationSchema)
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <DetailItem label="Schema ID" value={eventDetail.mongoDBData.schemaId} />
                <DetailItem label="Event Type" value={eventDetail.mongoDBData.eventType} />
                <DetailItem label="Schema Type" value={eventDetail.mongoDBData.schemaType} />
                <DetailItem label="Topic" value={eventDetail.mongoDBData.topic} />
                <DetailItem label="Created Date" value={formatDate(eventDetail.mongoDBData.createdDate)} />
                <DetailItem label="Updated Date" value={formatDate(eventDetail.mongoDBData.updatedDate)} />
              </div>
              
              {eventDetail.mongoDBData.schemaDefinition && (
                <div className="mt-4">
                  <label className="block text-sm font-semibold text-blue-700 mb-3">Schema Definition</label>
                  {parsedSchema ? (
                    <div className="space-y-4">
                      {parsedSchema.header && (
                        <div>
                          <label className="block text-xs font-semibold text-blue-600 mb-2 uppercase">Header Schema</label>
                          <pre className="bg-white p-3 rounded border border-blue-200 text-xs overflow-x-auto max-h-64">
                            {parsedSchema.header}
                          </pre>
                        </div>
                      )}
                      {parsedSchema.payload && (
                        <div>
                          <label className="block text-xs font-semibold text-blue-600 mb-2 uppercase">Payload Schema</label>
                          <pre className="bg-white p-3 rounded border border-blue-200 text-xs overflow-x-auto max-h-64">
                            {parsedSchema.payload}
                          </pre>
                        </div>
                      )}
                    </div>
                  ) : (
                    <pre className="bg-white p-3 rounded border border-blue-200 text-xs overflow-x-auto max-h-64">
                      {eventDetail.mongoDBData.schemaDefinition}
                    </pre>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Downstream Details with Authorization */}
          {eventDetail.downstreamDetails && eventDetail.downstreamDetails.length > 0 && (
            <div className="bg-green-50 rounded-lg p-4 border border-green-200">
              <h4 className="text-lg font-bold text-green-700 mb-4 flex items-center">
                <span className="w-2 h-6 bg-green-500 rounded-full mr-2"></span>
                Downstream Details with Authorization ({eventDetail.downstreamDetails.length})
              </h4>
              <div className="space-y-4">
                {eventDetail.downstreamDetails.map((detail, idx) => (
                  <div key={idx} className="bg-white rounded-lg p-4 border border-green-200">
                    <h5 className="font-bold text-green-700 mb-3">
                      {detail.downstream?.downstreamName || `Downstream ${idx + 1}`}
                    </h5>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                      <DetailItem label="Downstream ID" value={detail.downstream?.downstreamId} />
                      <DetailItem label="Credentials ID" value={detail.downstream?.credentialsId} />
                      <DetailItem label="Endpoint" value={detail.downstream?.endpoint} />
                    </div>

                    {detail.authorization && (
                      <div className="mt-4 pt-4 border-t border-green-200">
                        <h6 className="font-semibold text-green-600 mb-2">Linked Authorization</h6>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <DetailItem label="Downstream Name" value={detail.authorization.downstreamName} />
                          <DetailItem label="Downstream ID" value={detail.authorization.downstreamId} />
                          <DetailItem label="Credentials ID" value={detail.authorization.credentialsId} />
                          <DetailItem label="Grant Type" value={detail.authorization.grantType} />
                          <DetailItem label="Client ID" value={detail.authorization.clientId} />
                          <DetailItem label="Scope" value={detail.authorization.scope} />
                          <DetailItem 
                            label="Client Secret" 
                            value={detail.authorization.clientSecret ? '***' + detail.authorization.clientSecret.slice(-4) : 'N/A'} 
                          />
                        </div>
                      </div>
                    )}

                    {!detail.authorization && (
                      <div className="mt-4 pt-4 border-t border-green-200">
                        <p className="text-yellow-600 italic text-sm">
                          ⚠️ No authorization found for credentialsId: {detail.downstream?.credentialsId || 'N/A'}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Redis Data - Always show if MongoDB data exists (since backend always sets redisData) */}
          {eventDetail.mongoDBData && (
            <div className="bg-red-50 rounded-lg p-4 border border-red-200">
              <h4 className="text-lg font-bold text-red-700 mb-4 flex items-center">
                <span className="w-2 h-6 bg-red-500 rounded-full mr-2"></span>
                Redis Cache Data
              </h4>
              
              {eventDetail.redisData?.notificationSchema && (
                <div className="mb-4">
                  <label className="block text-sm font-semibold text-red-700 mb-2">NotificationSchema (from Redis)</label>
                  <pre className="bg-white p-3 rounded border border-red-200 text-xs overflow-x-auto max-h-64">
                    {eventDetail.redisData.notificationSchema}
                  </pre>
                </div>
              )}

              {eventDetail.redisData?.authorizations && eventDetail.redisData.authorizations.length > 0 && (
                <div>
                  <label className="block text-sm font-semibold text-red-700 mb-2">
                    Authorizations (from Redis) - {eventDetail.redisData.authorizations.length} found
                  </label>
                  {eventDetail.redisData.authorizations.map((auth, idx) => (
                    <pre key={idx} className="bg-white p-3 rounded border border-red-200 text-xs overflow-x-auto max-h-48 mb-2">
                      {auth}
                    </pre>
                  ))}
                </div>
              )}

              {(!eventDetail.redisData?.notificationSchema && 
               (!eventDetail.redisData?.authorizations || eventDetail.redisData.authorizations.length === 0)) && (
                <p className="text-red-600 italic">No Redis data available for this event</p>
              )}
            </div>
          )}

          {(!eventDetail.downstreamDetails || eventDetail.downstreamDetails.length === 0) && (
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <p className="text-gray-600 italic">No downstream details available for this event</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

interface DetailItemProps {
  label: string;
  value?: string | null;
}

const DetailItem: React.FC<DetailItemProps> = ({ label, value }) => (
  <div>
    <p className="text-xs font-semibold text-gray-500 uppercase mb-1">{label}</p>
    <p className="text-sm font-medium text-gray-900 break-words">{value || 'N/A'}</p>
  </div>
);
