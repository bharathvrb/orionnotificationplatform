import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchMongoDBDetails } from '../services/api';
import { generateSatToken } from '../services/sat';
import type { MongoDBDetailsResponse, EventDetail, Environment } from '../types';

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

export const MongoDBDetails: React.FC = () => {
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!useAll && !eventNamesInput.trim()) {
      setError('Please enter event names or select "Fetch All"');
      return;
    }

    setLoading(true);
    setError(null);
    setMongoDBDetails(null);
    setExpandedEvents(new Set());

    try {
      const eventNames = useAll 
        ? ['ALL'] 
        : eventNamesInput
            .split(',')
            .map(name => name.trim())
            .filter(name => name.length > 0);

      const response = await fetchMongoDBDetails(
        { eventNames },
        undefined,
        environment || undefined,
        authorization || undefined
      );
      setMongoDBDetails(response);
      if (response.status === 'Failure') {
        setError(response.message || 'Failed to fetch MongoDB details');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch MongoDB details');
      setMongoDBDetails(null);
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-400 via-primary-300 to-primary-400 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
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
            <h1 className="text-2xl font-bold text-white mb-2 drop-shadow-lg">MongoDB & Redis Details</h1>
            <p className="text-white text-lg font-medium">
              View MongoDB and Redis data for event types with linked authorization details
            </p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-2xl border-2 border-primary-400 p-8">
          <form onSubmit={handleSubmit} className="mb-8">
            <div className="space-y-4">
              <div>
                <label htmlFor="environment" className="block text-sm font-medium text-gray-700 mb-2">
                  Environment *
                </label>
                <select
                  id="environment"
                  value={environment}
                  onChange={(e) => setEnvironment(e.target.value as Environment)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
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
              </div>

              {/* Authorization Token */}
              <div>
                <label htmlFor="authorization" className="block text-sm font-medium text-gray-700 mb-2">
                  Authorization Token
                </label>
                <div className="flex gap-2">
                  <input
                    id="authorization"
                    type="password"
                    value={authorization}
                    onChange={(e) => setAuthorization(e.target.value)}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    placeholder="Enter authorization token or generate one"
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowTokenModal(true)}
                    disabled={!environment || loading}
                    className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all ${
                      environment && !loading
                        ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white hover:from-primary-400 hover:to-primary-500 shadow-lg hover:shadow-xl'
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                    title={!environment ? 'Please select an environment first' : 'Generate token'}
                  >
                    Generate Token
                  </button>
                </div>
                <p className="mt-1 text-sm text-gray-500">
                  Optional: Generate a token using SAT service or enter a custom token
                </p>
              </div>

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
                  }}
                  className="w-5 h-5 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                  disabled={loading}
                />
                <label htmlFor="useAll" className="ml-3 text-lg font-semibold text-gray-700">
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
                    onChange={(e) => setEventNamesInput(e.target.value)}
                    placeholder="e.g., EVENT1, EVENT2, EVENT3"
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    disabled={loading || useAll}
                  />
                  <p className="mt-1 text-sm text-gray-500">
                    Enter event names separated by commas, or use "ALL" to fetch all events
                  </p>
                </div>
              )}

              <button
                type="submit"
                disabled={loading || !environment || (!useAll && !eventNamesInput.trim())}
                className="w-full px-6 py-3 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-lg font-semibold hover:from-primary-400 hover:to-primary-500 shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Fetching...' : useAll ? 'Fetch All Events' : 'Fetch Details'}
              </button>
            </div>
          </form>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-800">{error}</p>
            </div>
          )}

          {mongoDBDetails && mongoDBDetails.eventDetails && mongoDBDetails.eventDetails.length > 0 && (
            <div className="space-y-6">
              <div className="bg-gradient-to-r from-primary-50 to-primary-100 rounded-lg p-4 border border-primary-200">
                <h2 className="text-2xl font-bold text-primary-700 mb-2">Results</h2>
                <p className="text-primary-600">
                  Found {mongoDBDetails.eventDetails.length} event(s)
                </p>
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
              <h2 className="text-2xl font-bold text-primary-700 mb-4">MongoDB & Redis Details</h2>
              <p className="text-gray-600 mb-6">
                Enter event names above or select "Fetch All" to view MongoDB and Redis data with linked authorization details.
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
        </div>
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

const EventDetailCard: React.FC<EventDetailCardProps> = ({ eventDetail, isExpanded, onToggle, formatDate }) => {
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
              {eventDetail.redisData?.notificationSchema && ' • Redis data available'}
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
                  <label className="block text-sm font-semibold text-blue-700 mb-2">Schema Definition</label>
                  <pre className="bg-white p-3 rounded border border-blue-200 text-xs overflow-x-auto max-h-64">
                    {eventDetail.mongoDBData.schemaDefinition}
                  </pre>
                </div>
              )}
            </div>
          )}

          {/* Redis Data */}
          {eventDetail.redisData && (
            <div className="bg-red-50 rounded-lg p-4 border border-red-200">
              <h4 className="text-lg font-bold text-red-700 mb-4 flex items-center">
                <span className="w-2 h-6 bg-red-500 rounded-full mr-2"></span>
                Redis Cache Data
              </h4>
              
              {eventDetail.redisData.notificationSchema && (
                <div className="mb-4">
                  <label className="block text-sm font-semibold text-red-700 mb-2">NotificationSchema (from Redis)</label>
                  <pre className="bg-white p-3 rounded border border-red-200 text-xs overflow-x-auto max-h-64">
                    {eventDetail.redisData.notificationSchema}
                  </pre>
                </div>
              )}

              {eventDetail.redisData.authorizations && eventDetail.redisData.authorizations.length > 0 && (
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

              {!eventDetail.redisData.notificationSchema && 
               (!eventDetail.redisData.authorizations || eventDetail.redisData.authorizations.length === 0) && (
                <p className="text-red-600 italic">No Redis data available for this event</p>
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
                      <DetailItem label="Authentication Type" value={detail.downstream?.authenticationType} />
                      <DetailItem label="Created" value={formatDate(detail.downstream?.createdTimestamp)} />
                      <DetailItem label="Updated" value={formatDate(detail.downstream?.updateTimestamp)} />
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
