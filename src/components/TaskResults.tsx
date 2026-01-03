import React, { useState } from 'react';
import type { TaskResult } from '../types';
import { downloadAsExcel, type DownloadData } from '../services/download';

interface TaskResultsProps {
  results: TaskResult[];
  isLoading?: boolean;
  requestData?: any;
  responseData?: any;
  operationName?: string;
}

export const TaskResults: React.FC<TaskResultsProps> = ({
  results,
  isLoading = false,
  requestData,
  responseData,
  operationName = 'ONP Event Onboard',
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

  const handleDownload = (e?: React.MouseEvent) => {
    // Prevent any form submission or event propagation
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    // Allow download even if there are errors or failures
    const hasData = requestData || responseData || results.length > 0;
    if (!hasData) {
      return;
    }

    // Check if there are any errors in the results
    const hasErrors = results.some(r => r.status === 'Failure');
    const errorMessages = results
      .filter(r => r.status === 'Failure')
      .map(r => r.message);

    // Determine response status
    let responseStatus = 200;
    let statusText = 'OK';
    if (hasErrors) {
      // If all tasks failed, it's likely a 400 or 500
      if (failureCount === total) {
        responseStatus = 400;
        statusText = 'Bad Request';
      } else {
        // Partial failure
        responseStatus = 207; // Multi-Status
        statusText = 'Partial Success';
      }
    } else if (partialCount > 0) {
      responseStatus = 207;
      statusText = 'Partial Success';
    }

    const downloadData: DownloadData = {
      operation: operationName,
      timestamp: new Date().toISOString(),
      request: {
        endpoint: '/api/onboardonp',
        method: 'POST',
        body: requestData || {},
      },
      response: {
        data: responseData || { tasks: results },
        error: hasErrors ? errorMessages.join('; ') : undefined,
        status: responseStatus,
        statusText: statusText,
      },
      metadata: {
        totalTasks: results.length,
        successCount,
        failureCount,
        partialCount,
        hasErrors,
        status: hasErrors ? (failureCount === total ? 'Failed' : 'Partial') : 'Success',
        successRate: total > 0 ? `${Math.round((successCount / total) * 100)}%` : '0%',
      },
    };

    downloadAsExcel(downloadData);
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
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-primary-700 flex items-center">
          <span className="w-1 h-6 bg-gradient-to-b from-primary-500 to-primary-600 rounded-full mr-3"></span>
          Task Results
        </h3>
        {(results.length > 0 || requestData || responseData) && (
          <button
            type="button"
            onClick={handleDownload}
            className="px-4 py-2 text-sm font-semibold bg-primary-500 hover:bg-primary-600 text-white rounded-lg transition-all shadow-sm hover:shadow border border-primary-400 flex items-center gap-2"
            title="Download as Excel (includes errors)"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Download Excel
          </button>
        )}
      </div>

      {/* Enhanced Summary Section */}
      <div className="mb-6 bg-gradient-to-r from-primary-50 to-primary-100 rounded-lg p-4 border border-primary-200">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-lg font-bold text-primary-700">Operation Summary</h4>
          <div className={`px-3 py-1 rounded-full text-sm font-semibold ${
            failureCount === 0 && partialCount === 0
              ? 'bg-green-100 text-green-800 border border-green-300'
              : failureCount > 0
              ? 'bg-red-100 text-red-800 border border-red-300'
              : 'bg-yellow-100 text-yellow-800 border border-yellow-300'
          }`}>
            {failureCount === 0 && partialCount === 0 ? 'All Tasks Successful' : 
             failureCount > 0 ? 'Some Tasks Failed' : 'Partial Success'}
          </div>
        </div>
        <div className="flex flex-wrap gap-3">
          <div className="text-center px-4 py-2 bg-white rounded-lg border border-primary-200 shadow-sm">
            <div className="text-2xl font-bold text-primary-600">{total}</div>
            <div className="text-xs text-gray-600 font-medium">Total Tasks</div>
          </div>
          <div className="text-center px-4 py-2 bg-green-50 rounded-lg border border-green-200 shadow-sm">
            <div className="text-2xl font-bold text-green-600">{successCount}</div>
            <div className="text-xs text-gray-600 font-medium">Successful</div>
          </div>
          {failureCount > 0 && (
            <div className="text-center px-4 py-2 bg-red-50 rounded-lg border border-red-200 shadow-sm">
              <div className="text-2xl font-bold text-red-600">{failureCount}</div>
              <div className="text-xs text-gray-600 font-medium">Failed</div>
            </div>
          )}
          {partialCount > 0 && (
            <div className="text-center px-4 py-2 bg-yellow-50 rounded-lg border border-yellow-200 shadow-sm">
              <div className="text-2xl font-bold text-yellow-600">{partialCount}</div>
              <div className="text-xs text-gray-600 font-medium">Partial</div>
            </div>
          )}
        </div>
        {failureCount > 0 && (
          <div className="mt-3 pt-3 border-t border-primary-200">
            <p className="text-sm text-red-700 font-medium">
              ⚠️ {failureCount} task(s) failed. Please review the error messages below and take appropriate action.
            </p>
          </div>
        )}
        {partialCount > 0 && failureCount === 0 && (
          <div className="mt-3 pt-3 border-t border-primary-200">
            <p className="text-sm text-yellow-700 font-medium">
              ⚠️ {partialCount} task(s) completed with partial success. Please review the details below.
            </p>
          </div>
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

