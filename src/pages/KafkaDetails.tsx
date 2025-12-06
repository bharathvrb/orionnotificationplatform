import React from 'react';
import { useNavigate } from 'react-router-dom';

export const KafkaDetails: React.FC = () => {
  const navigate = useNavigate();

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
              Monitor Kafka topics and consumer groups
            </p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-2xl border-2 border-primary-400 p-8">
          <div className="text-center py-12">
            <div className="text-6xl mb-4">⚡</div>
            <h2 className="text-2xl font-bold text-primary-700 mb-4">Kafka Topic Details</h2>
            <p className="text-gray-600 mb-6">
              This feature is coming soon. You'll be able to view Kafka topics, consumer groups, and message details here.
            </p>
            <button
              onClick={() => navigate('/')}
              className="px-6 py-3 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-lg font-semibold hover:from-primary-400 hover:to-primary-500 shadow-lg hover:shadow-xl transition-all"
            >
              Back to Home
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

