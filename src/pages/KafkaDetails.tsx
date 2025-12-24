import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchKafkaDetails } from '../services/api';
import type { KafkaDetailsResponse, KafkaDetailsListResponse, Environment } from '../types';

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

export const KafkaDetails: React.FC = () => {
  const navigate = useNavigate();
  const [environment, setEnvironment] = useState<Environment | ''>('');
  const [topicNamesInput, setTopicNamesInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [kafkaDetails, setKafkaDetails] = useState<KafkaDetailsListResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [expandedTopics, setExpandedTopics] = useState<Set<string>>(new Set());
  const [searchTerm, setSearchTerm] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topicNamesInput.trim()) {
      setError('Please enter at least one topic name');
      return;
    }

    setLoading(true);
    setError(null);
    setKafkaDetails(null);
    setExpandedTopics(new Set());
    setSearchTerm('');

    try {
      const topicNames = topicNamesInput
        .split(',')
        .map(name => name.trim())
        .filter(name => name.length > 0);

      const response = await fetchKafkaDetails({ topicNames }, undefined, environment || undefined);
      setKafkaDetails(response);
      if (response.status === 'Failure') {
        setError(response.message || 'Failed to fetch Kafka details');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch Kafka details');
      setKafkaDetails(null);
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
            <h1 className="text-4xl font-bold text-white mb-2">Kafka Details</h1>
            <p className="text-white text-lg font-medium">
              Monitor Kafka topics and consumer groups with detailed insights
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
              <div>
                <label htmlFor="topicNames" className="block text-sm font-medium text-gray-700 mb-2">
                  Kafka Topic Names (comma-separated) *
                </label>
                <textarea
                  id="topicNames"
                  value={topicNamesInput}
                  onChange={(e) => setTopicNamesInput(e.target.value)}
                  placeholder="e.g., onp-cbgupdate-topic, onp-order-topic, onp-payment-topic"
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  disabled={loading}
                />
                <p className="mt-1 text-sm text-gray-500">
                  Enter topic names separated by commas
                </p>
              </div>

              <button
                type="submit"
                disabled={loading || !environment || !topicNamesInput.trim()}
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
                  'Fetch Details'
                )}
              </button>
            </div>
          </form>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-400 rounded-lg">
              <div className="flex items-center">
                <svg className="w-5 h-5 text-red-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <p className="text-red-800 font-medium">{error}</p>
              </div>
            </div>
          )}

          {kafkaDetails && kafkaDetails.topicDetails && kafkaDetails.topicDetails.length > 0 && (
            <div className="space-y-6">
              {/* Summary Stats */}
              <div className="bg-gradient-to-r from-primary-50 to-primary-100 rounded-lg p-6 border border-primary-200">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-2xl font-bold text-primary-700">Results Summary</h2>
                    <p className="text-primary-600 mt-1">
                      Found {kafkaDetails.topicDetails.length} topic(s)
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    {kafkaDetails.topicDetails.filter(t => t.health?.toLowerCase() === 'healthy').length > 0 && (
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">
                          {kafkaDetails.topicDetails.filter(t => t.health?.toLowerCase() === 'healthy').length}
                        </div>
                        <div className="text-xs text-gray-600">Healthy</div>
                      </div>
                    )}
                    {kafkaDetails.topicDetails.filter(t => t.health?.toLowerCase() === 'unhealthy').length > 0 && (
                      <div className="text-center">
                        <div className="text-2xl font-bold text-red-600">
                          {kafkaDetails.topicDetails.filter(t => t.health?.toLowerCase() === 'unhealthy').length}
                        </div>
                        <div className="text-xs text-gray-600">Unhealthy</div>
                      </div>
                    )}
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
              <h2 className="text-2xl font-bold text-primary-700 mb-4">Kafka Topic Details</h2>
              <p className="text-gray-600 mb-6">
                Enter Kafka topic names above (comma-separated) to view their details, health status, configuration, and consumer groups.
              </p>
            </div>
          )}
        </div>
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
