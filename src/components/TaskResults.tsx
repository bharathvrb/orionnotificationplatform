import React, { useState } from 'react';
import type { TaskResult } from '../types';

interface TaskResultsProps {
  results: TaskResult[];
  isLoading?: boolean;
}

export const TaskResults: React.FC<TaskResultsProps> = ({
  results,
  isLoading = false,
}) => {
  const [expandedTasks, setExpandedTasks] = useState<Set<string>>(new Set());
  const total = results.length;
  const successCount = results.filter((r) => r.status === 'Success').length;
  const failureCount = results.filter((r) => r.status === 'Failure').length;
  const partialCount = results.filter((r) => r.status === 'Partial').length;

  const toggleExpand = (task: string) => {
    const next = new Set(expandedTasks);
    next.has(task) ? next.delete(task) : next.add(task);
    setExpandedTasks(next);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Success':
        return 'bg-green-50 text-green-800 border-green-200';
      case 'Failure':
        return 'bg-red-50 text-red-800 border-red-200';
      case 'Partial':
        return 'bg-yellow-50 text-yellow-800 border-yellow-200';
      default:
        return 'bg-primary-50 text-primary-800 border-primary-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Success':
        return (
          <svg
            className="w-5 h-5 text-green-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        );
      case 'Failure':
        return (
          <svg
            className="w-5 h-5 text-red-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        );
      case 'Partial':
        return (
          <svg
            className="w-5 h-5 text-yellow-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        );
      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white border-2 border-primary-400 rounded-xl shadow-2xl p-6">
        <h3 className="text-lg font-semibold text-primary-700 mb-4 flex items-center">
          <span className="w-1 h-6 bg-gradient-to-b from-primary-500 to-primary-600 rounded-full mr-3"></span>
          Task Results
        </h3>
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
          <span className="ml-3 text-primary-700 font-medium">Processing tasks...</span>
        </div>
      </div>
    );
  }

  if (results.length === 0) {
    return (
      <div className="bg-white border-2 border-primary-400 rounded-xl shadow-2xl p-6">
        <h3 className="text-lg font-semibold text-primary-700 mb-4 flex items-center">
          <span className="w-1 h-6 bg-gradient-to-b from-primary-500 to-primary-600 rounded-full mr-3"></span>
          Task Results
        </h3>
        <p className="text-primary-600 italic bg-primary-50 p-3 rounded-lg border-2 border-primary-300">
          No results yet. Submit the form to see task results.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white border-2 border-primary-400 rounded-xl shadow-2xl p-6">
      <h3 className="text-lg font-semibold text-primary-700 mb-4 flex items-center">
        <span className="w-1 h-6 bg-gradient-to-b from-primary-500 to-primary-600 rounded-full mr-3"></span>
        Task Results
      </h3>

      <div className="mb-6 flex flex-wrap gap-2">
        <span className="px-3 py-1 bg-primary-100 text-primary-800 rounded-full text-sm font-semibold border border-primary-300">
          Total: {total}
        </span>
        <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-semibold border border-green-300">
          Success: {successCount}
        </span>
        <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm font-semibold border border-red-300">
          Failure: {failureCount}
        </span>
        {partialCount > 0 && (
          <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-semibold border border-yellow-300">
            Partial: {partialCount}
          </span>
        )}
      </div>

      <div className="mb-4 text-sm text-gray-600 bg-gray-50 p-3 rounded-lg border border-gray-200">
        <strong>Note:</strong> Each task shows its status, message, and optional raw data. Use "View Raw" to inspect payloads.
      </div>

      <div className="space-y-4">
        {results.map((result, index) => (
          <div
            key={index}
            className={`border-2 rounded-xl p-4 shadow-md ${getStatusColor(result.status)}`}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-3 flex-1">
                <div className="mt-0.5">{getStatusIcon(result.status)}</div>
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <h4 className="font-bold text-lg">{result.task}</h4>
                    <span className="px-3 py-1 text-xs font-bold rounded-full shadow-sm bg-white bg-opacity-70 border border-current">
                      {result.status}
                    </span>
                  </div>
                  <p className="text-sm font-medium opacity-90 mt-1">{result.message}</p>
                </div>
              </div>
              {result.rawData && (
                <button
                  onClick={() => toggleExpand(result.task)}
                  className="px-4 py-2 text-xs font-semibold bg-primary-500 hover:bg-primary-600 text-white rounded-lg transition-all shadow-sm hover:shadow border border-primary-400"
                >
                  {expandedTasks.has(result.task) ? 'Hide Raw' : 'View Raw'}
                </button>
              )}
            </div>
            {expandedTasks.has(result.task) && result.rawData && (
              <div className="mt-4 pt-4 border-t-2 border-current border-opacity-30">
                <pre className="text-xs bg-gray-50 p-4 rounded-lg overflow-auto max-h-64 shadow-inner border-2 border-gray-200 text-gray-800">
                  {JSON.stringify(result.rawData, null, 2)}
                </pre>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

