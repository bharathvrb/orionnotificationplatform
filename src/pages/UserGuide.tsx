import React from 'react';
import { useNavigate } from 'react-router-dom';

export const UserGuide: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-400 via-primary-300 to-primary-400 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
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
            <h1 className="text-4xl font-bold text-white mb-2">User Guide</h1>
            <p className="text-white text-lg font-medium">
              Comprehensive guide to using the ONP Platform
            </p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-2xl border-2 border-primary-400 p-8">
          <div className="space-y-6">
            <div className="text-center py-8">
              <div className="text-6xl mb-4">📚</div>
              <h2 className="text-2xl font-bold text-primary-700 mb-4">ONP Platform User Guide</h2>
              <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
                Comprehensive documentation covering all features of the ONP Platform, including event onboarding, 
                MongoDB details, Kafka monitoring, and more. This guide will help you navigate and utilize all 
                platform features effectively.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <a
                  href="/USER_GUIDE.md"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-6 py-3 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-lg font-semibold hover:from-primary-400 hover:to-primary-500 shadow-lg hover:shadow-xl transition-all flex items-center gap-2"
                >
                  <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  View User Guide
                </a>
                <a
                  href="/USER_GUIDE.md"
                  download="ONP_User_Guide.md"
                  className="px-6 py-3 bg-white text-primary-600 border-2 border-primary-500 rounded-lg font-semibold hover:bg-primary-50 shadow-md hover:shadow-lg transition-all flex items-center gap-2"
                >
                  <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Download Guide
                </a>
              </div>
            </div>

            <div className="border-t border-gray-200 pt-6">
              <h3 className="text-xl font-bold text-primary-700 mb-4">Quick Links</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-primary-50 rounded-lg border border-primary-200">
                  <h4 className="font-semibold text-primary-800 mb-2">📋 Table of Contents</h4>
                  <ul className="text-sm text-gray-700 space-y-1">
                    <li>• Introduction</li>
                    <li>• Getting Started</li>
                    <li>• Home Page</li>
                    <li>• ONP Event Onboarding</li>
                    <li>• MongoDB Details</li>
                    <li>• Kafka Details</li>
                    <li>• Download Functionality</li>
                    <li>• Troubleshooting</li>
                  </ul>
                </div>
                <div className="p-4 bg-primary-50 rounded-lg border border-primary-200">
                  <h4 className="font-semibold text-primary-800 mb-2">🔍 Key Topics</h4>
                  <ul className="text-sm text-gray-700 space-y-1">
                    <li>• Authentication & Tokens</li>
                    <li>• Form Validation</li>
                    <li>• Environment Selection</li>
                    <li>• JSON Schema Configuration</li>
                    <li>• Downstream Integration</li>
                    <li>• Best Practices</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="text-center pt-6">
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
    </div>
  );
};

