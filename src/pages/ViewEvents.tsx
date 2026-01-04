import React from 'react';
import { useNavigate } from 'react-router-dom';

export const ViewEvents: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-400 via-blue-300 to-blue-400 py-8">
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
            <h1 className="text-2xl font-bold text-white mb-2">View Complete Event Information</h1>
            <p className="text-white text-lg font-medium">
              Browse and view all event configurations with detailed information
            </p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-2xl border-2 border-primary-400 p-8 opacity-50 relative">
          <div className="absolute top-4 right-4">
            <span className="px-3 py-1 bg-yellow-100 text-yellow-800 text-xs font-semibold rounded-full border border-yellow-300">
              Coming Soon
            </span>
          </div>
          <div className="text-center py-12">
            <div className="text-6xl mb-4 opacity-75">📋</div>
            <h2 className="text-2xl font-bold text-primary-700 mb-4 opacity-75">View Complete Event Information</h2>
            <p className="text-gray-600 mb-6 opacity-75">
              This feature is coming soon. You'll be able to view and browse all configured events with complete information here.
            </p>
            <button
              onClick={() => navigate('/onboard')}
              className="px-6 py-3 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-lg font-semibold hover:from-primary-400 hover:to-primary-500 shadow-lg hover:shadow-xl transition-all opacity-100"
            >
              Create New Event
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

