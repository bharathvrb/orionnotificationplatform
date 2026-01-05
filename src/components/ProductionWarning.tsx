import React from 'react';
import { isProductionEnvironment } from '../utils/environment';
import type { Environment } from '../types';

interface ProductionWarningProps {
  environment: string | Environment | '';
}

export const ProductionWarning: React.FC<ProductionWarningProps> = ({ environment }) => {
  if (!isProductionEnvironment(environment)) {
    return null;
  }

  return (
    <div className="mt-4 relative overflow-hidden rounded-xl border-l-4 border-amber-500 bg-gradient-to-r from-amber-50 to-orange-50 p-5 shadow-sm">
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0 mt-0.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-100">
            <svg
              className="h-5 w-5 text-amber-600"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2.5}
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
              />
            </svg>
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-base font-semibold text-amber-900 mb-2">
            Production Environment
          </h3>
          <p className="text-sm text-amber-800 leading-relaxed">
            You are working with a <span className="font-semibold">PRODUCTION</span> environment. 
            Please verify all configurations and ensure proper authorization before proceeding.
          </p>
        </div>
      </div>
    </div>
  );
};

