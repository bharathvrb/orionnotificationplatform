import React from 'react';
import type { ValidationError } from '../types';
import { getTasksForCriteria } from '../services/validation';

interface ValidationPanelProps {
  errors: ValidationError[];
  requestCriteria: string[];
  isValid: boolean;
}

export const ValidationPanel: React.FC<ValidationPanelProps> = ({
  requestCriteria,
  isValid,
}) => {
  const tasks = getTasksForCriteria(requestCriteria as any);

  return (
    <div className="bg-white border-2 border-primary-400 rounded-xl shadow-2xl p-6 mb-4">
      <h3 className="text-lg font-semibold text-primary-700 mb-4 flex items-center">
        <span className="w-1 h-6 bg-gradient-to-b from-primary-500 to-primary-600 rounded-full mr-3"></span>
        Validation & Task Preview
      </h3>

      {requestCriteria.length > 0 ? (
        <div className="mb-4 bg-primary-50 rounded-lg p-4 border-2 border-primary-300">
          <h4 className="text-sm font-semibold text-primary-700 mb-3">
            Tasks that will run:
          </h4>
          <ul className="space-y-2">
            {tasks.map((task, index) => (
              <li key={index} className="flex items-center text-sm text-primary-800">
                <span className="w-2 h-2 bg-primary-500 rounded-full mr-3"></span>
                <span className="font-medium">{task}</span>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <p className="text-sm text-primary-600 italic mb-4 bg-primary-50 p-3 rounded-lg border-2 border-primary-300">
          No criteria selected. Please select at least one criteria.
        </p>
      )}

      <div className="border-t-2 border-primary-300 pt-4 mt-4">
        {requestCriteria.length === 0 ? (
          <div className="flex items-center bg-blue-50 text-blue-700 p-3 rounded-lg border-2 border-blue-300">
            <svg
              className="w-6 h-6 mr-3 text-blue-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span className="font-semibold">Please select at least one request criteria to continue</span>
          </div>
        ) : isValid ? (
          <div className="flex items-center bg-green-50 text-green-700 p-3 rounded-lg border-2 border-green-300">
            <svg
              className="w-6 h-6 mr-3 text-green-600"
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
            <span className="font-semibold">All validations passed</span>
          </div>
        ) : (
          <div className="flex items-center bg-yellow-50 text-yellow-700 p-3 rounded-lg border-2 border-yellow-300">
            <svg
              className="w-6 h-6 mr-3 text-yellow-600"
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
            <span className="font-semibold">Please fill in all required fields marked with *</span>
          </div>
        )}
      </div>
    </div>
  );
};

