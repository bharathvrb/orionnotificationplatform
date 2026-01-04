import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { KafkaDetails } from './KafkaDetails';
import { KafkaTopicForm } from '../components/KafkaTopicForm';

type ViewMode = 'view' | 'create' | null;

export const KafkaAndTopicDetails: React.FC = () => {
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState<ViewMode>(null);

  // If a mode is selected, show the content
  if (viewMode !== null) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-400 via-blue-300 to-blue-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header with Back Button */}
          <div className="mb-6">
            <button
              onClick={() => setViewMode(null)}
              className="mb-4 flex items-center text-white hover:text-primary-100 transition-colors group"
            >
              <svg className="w-5 h-5 mr-2 transform group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              <span>Back to Options</span>
            </button>
            <div className="bg-gradient-to-r from-primary-500 via-primary-400 to-primary-500 rounded-xl shadow-2xl p-5 border-2 border-primary-600">
              <h1 className="text-xl font-bold text-white mb-1 drop-shadow-lg">
                {viewMode === 'view' ? 'View Kafka Details' : 'Create New Kafka Topic'}
              </h1>
              <p className="text-white text-base font-medium">
                {viewMode === 'view' 
                  ? 'View event configuration present in Kafka including topics, consumer groups, and related settings'
                  : 'Create a new Kafka topic with specified partitions and replication factor'}
              </p>
            </div>
          </div>

          {/* Content Area */}
          <div>
            {viewMode === 'view' ? <KafkaDetails hideHeader={true} /> : <KafkaTopicForm hideHeader={true} />}
          </div>
        </div>
      </div>
    );
  }

  // Show option selection cards
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 via-blue-400 to-blue-500">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/')}
            className="mb-4 flex items-center text-white hover:text-primary-100 transition-colors group"
          >
            <svg className="w-5 h-5 mr-2 transform group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Home
          </button>
          <div className="text-center mb-10">
            <div className="flex items-center justify-center gap-3 mb-5">
              <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/30 to-white/30"></div>
              <h1 className="text-2xl font-extrabold text-white drop-shadow-lg px-4">
                Kafka Details
              </h1>
              <div className="h-px flex-1 bg-gradient-to-l from-transparent via-white/30 to-white/30"></div>
            </div>
            <p className="text-base text-white/90 font-medium max-w-2xl mx-auto leading-relaxed">
              Choose an option to view existing Kafka topics or create a new Kafka topic with specified configuration
            </p>
          </div>
        </div>

        {/* Option Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 max-w-4xl mx-auto">
          {/* View Kafka Details Card */}
          <div
            className="group relative bg-white rounded-2xl shadow-2xl overflow-hidden transform transition-all duration-300 hover:scale-105 hover:shadow-3xl border-2 border-transparent hover:border-primary-400"
          >
            {/* Gradient Background Overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-orange-50 via-amber-100 to-yellow-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            
            {/* Content */}
            <div className="relative p-8 flex flex-col h-full min-h-[380px]">
              {/* Icon Container */}
              <div className="mb-6 flex justify-center">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center shadow-lg transform group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                </div>
              </div>

              {/* Title */}
              <h2 className="text-xl font-bold text-gray-800 mb-3 text-center group-hover:text-orange-700 transition-colors">
                View Kafka Details
              </h2>

              {/* Description */}
              <p className="text-sm text-gray-600 text-center mb-6 leading-relaxed flex-grow">
                View event configuration present in Kafka including topics, consumer groups, partition information, and related settings.
              </p>

              {/* Action Button */}
              <div className="flex justify-center mt-auto pt-4 border-t border-gray-100">
                <div 
                  onClick={(e) => {
                    e.stopPropagation();
                    setViewMode('view');
                  }}
                  className="px-6 py-2.5 bg-orange-50 text-orange-700 rounded-full text-sm font-medium transition-all duration-300 hover:bg-orange-200 hover:text-orange-900 hover:scale-105 hover:shadow-md hover:shadow-orange-300/50 flex items-center gap-2 cursor-pointer border border-transparent hover:border-orange-300"
                >
                  <span>View Topics</span>
                  <svg className="w-4 h-4 transform hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Decorative Corner */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-orange-400/20 to-transparent rounded-bl-full"></div>
          </div>

          {/* Create New Kafka Topic Card */}
          <div
            className="group relative bg-white rounded-2xl shadow-2xl overflow-hidden transform transition-all duration-300 hover:scale-105 hover:shadow-3xl border-2 border-transparent hover:border-primary-400"
          >
            {/* Gradient Background Overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-purple-50 via-indigo-100 to-blue-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            
            {/* Content */}
            <div className="relative p-8 flex flex-col h-full min-h-[380px]">
              {/* Icon Container */}
              <div className="mb-6 flex justify-center">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center shadow-lg transform group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                  </svg>
                </div>
              </div>

              {/* Title */}
              <h2 className="text-xl font-bold text-gray-800 mb-3 text-center group-hover:text-purple-700 transition-colors">
                Create New Kafka Topic
              </h2>

              {/* Description */}
              <p className="text-sm text-gray-600 text-center mb-6 leading-relaxed flex-grow">
                Create a new Kafka topic with specified partitions and replication factor. Configure event name, subscriber, and topic settings.
              </p>

              {/* Action Button */}
              <div className="flex justify-center mt-auto pt-4 border-t border-gray-100">
                <div 
                  onClick={(e) => {
                    e.stopPropagation();
                    setViewMode('create');
                  }}
                  className="px-6 py-2.5 bg-purple-50 text-purple-700 rounded-full text-sm font-medium transition-all duration-300 hover:bg-purple-200 hover:text-purple-900 hover:scale-105 hover:shadow-md hover:shadow-purple-300/50 flex items-center gap-2 cursor-pointer border border-transparent hover:border-purple-300"
                >
                  <span>Create Topic</span>
                  <svg className="w-4 h-4 transform hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Decorative Corner */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-400/20 to-transparent rounded-bl-full"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

