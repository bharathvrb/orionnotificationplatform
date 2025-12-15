import React from 'react';
import type { DownstreamDetail } from '../types';

interface DownstreamEditorProps {
  downstreamDetails: DownstreamDetail[];
  onChange: (details: DownstreamDetail[]) => void;
  errors?: Record<string, string>;
  requireHttpStatusCode?: boolean;
  showClientAndEndpoint?: boolean;
}

export const DownstreamEditor: React.FC<DownstreamEditorProps> = ({
  downstreamDetails,
  onChange,
  errors = {},
  requireHttpStatusCode = false,
  showClientAndEndpoint = false,
}) => {
  const updateDetail = (index: number, field: keyof DownstreamDetail, value: string | number | boolean | undefined) => {
    const updated = [...downstreamDetails];
    updated[index] = { ...updated[index], [field]: value };
    onChange(updated);
  };

  const addDetail = () => {
    onChange([
      ...downstreamDetails,
      {
        name: '',
        endpoint: '',
        clientId: '',
        clientSecret: '',
        scope: '',
        httpStatusCode: undefined,
        maintenanceFlag: false,
        maxRetryCount: undefined,
        retryDelay: undefined,
      },
    ]);
  };

  const removeDetail = (index: number) => {
    const updated = downstreamDetails.filter((_, i) => i !== index);
    onChange(updated);
  };

  return (
    <div className="mb-4">
      <div className="flex justify-between items-center mb-3">
        <label className="block text-sm font-semibold text-primary-700">
          Downstream Details
        </label>
        <button
          type="button"
          onClick={addDetail}
          className="px-4 py-2 text-sm font-semibold bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-lg hover:from-primary-400 hover:to-primary-500 shadow-md hover:shadow-lg transition-all transform hover:scale-105 border border-primary-400"
        >
          + Add Row
        </button>
      </div>

      {downstreamDetails.length === 0 ? (
        <p className="text-sm text-primary-600 italic bg-primary-50 p-3 rounded-lg border-2 border-primary-300">No downstream details added</p>
      ) : (
        <div className="space-y-4">
          {downstreamDetails.map((detail, index) => (
            <div
              key={index}
              className="border-2 border-primary-400 rounded-xl p-4 bg-white shadow-md"
            >
              <div className="flex justify-between items-center mb-4">
                <h4 className="text-sm font-bold text-primary-800 flex items-center">
                  <span className="w-2 h-2 bg-primary-500 rounded-full mr-2"></span>
                  Detail #{index + 1}
                </h4>
                <button
                  type="button"
                  onClick={() => removeDetail(index)}
                  className="px-3 py-1.5 text-xs font-semibold bg-red-500 text-white rounded-lg hover:bg-red-600 shadow-sm hover:shadow transition-all border border-red-400"
                >
                  Remove
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-primary-700 mb-1">
                    Name *
                  </label>
                  <input
                    type="text"
                    value={detail.name || ''}
                    onChange={(e) => updateDetail(index, 'name', e.target.value)}
                    className={`w-full px-3 py-2 border-2 rounded-lg focus:outline-none focus:ring-2 transition-all bg-white text-gray-900 placeholder-gray-400 ${
                      errors[`downstreamDetails[${index}].name`]
                        ? 'border-red-500 focus:ring-red-300 focus:border-red-500'
                        : 'border-primary-400 focus:ring-primary-300 focus:border-primary-500'
                    }`}
                    placeholder="Downstream name"
                  />
                  {errors[`downstreamDetails[${index}].name`] && (
                    <p className="mt-1 text-xs text-red-600 font-medium">
                      {errors[`downstreamDetails[${index}].name`]}
                    </p>
                  )}
                </div>

                {showClientAndEndpoint && (
                  <>
                    <div>
                      <label className="block text-xs font-semibold text-primary-700 mb-1">
                        Endpoint *
                      </label>
                      <input
                        type="text"
                        value={detail.endpoint || ''}
                        onChange={(e) => updateDetail(index, 'endpoint', e.target.value)}
                        className={`w-full px-3 py-2 border-2 rounded-lg focus:outline-none focus:ring-2 transition-all ${
                          errors[`downstreamDetails[${index}].endpoint`]
                            ? 'border-red-400 focus:ring-red-300 focus:border-red-500'
                            : 'border-primary-200 focus:ring-primary-300 focus:border-primary-500'
                        }`}
                        placeholder="https://example.com/api"
                      />
                      {errors[`downstreamDetails[${index}].endpoint`] && (
                        <p className="mt-1 text-xs text-red-600 font-medium">
                          {errors[`downstreamDetails[${index}].endpoint`]}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-primary-700 mb-1">
                        Client ID
                      </label>
                      <input
                        type="text"
                        value={detail.clientId || ''}
                        onChange={(e) => updateDetail(index, 'clientId', e.target.value)}
                        className={`w-full px-3 py-2 border-2 rounded-lg focus:outline-none focus:ring-2 transition-all ${
                          errors[`downstreamDetails[${index}].clientId`]
                            ? 'border-red-400 focus:ring-red-300 focus:border-red-500'
                            : 'border-primary-200 focus:ring-primary-300 focus:border-primary-500'
                        }`}
                        placeholder="Client ID"
                      />
                      {errors[`downstreamDetails[${index}].clientId`] && (
                        <p className="mt-1 text-xs text-red-600 font-medium">
                          {errors[`downstreamDetails[${index}].clientId`]}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-primary-700 mb-1">
                        Client Secret
                      </label>
                      <input
                        type="password"
                        value={detail.clientSecret || ''}
                        onChange={(e) => updateDetail(index, 'clientSecret', e.target.value)}
                        className={`w-full px-3 py-2 border-2 rounded-lg focus:outline-none focus:ring-2 transition-all ${
                          errors[`downstreamDetails[${index}].clientSecret`]
                            ? 'border-red-400 focus:ring-red-300 focus:border-red-500'
                            : 'border-primary-200 focus:ring-primary-300 focus:border-primary-500'
                        }`}
                        placeholder="Client Secret"
                      />
                      {errors[`downstreamDetails[${index}].clientSecret`] && (
                        <p className="mt-1 text-xs text-red-600 font-medium">
                          {errors[`downstreamDetails[${index}].clientSecret`]}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-primary-700 mb-1">
                        Scope
                      </label>
                      <input
                        type="text"
                        value={detail.scope || ''}
                        onChange={(e) => updateDetail(index, 'scope', e.target.value)}
                        className={`w-full px-3 py-2 border-2 rounded-lg focus:outline-none focus:ring-2 transition-all ${
                          errors[`downstreamDetails[${index}].scope`]
                            ? 'border-red-400 focus:ring-red-300 focus:border-red-500'
                            : 'border-primary-200 focus:ring-primary-300 focus:border-primary-500'
                        }`}
                        placeholder="Scope"
                      />
                      {errors[`downstreamDetails[${index}].scope`] && (
                        <p className="mt-1 text-xs text-red-600 font-medium">
                          {errors[`downstreamDetails[${index}].scope`]}
                        </p>
                      )}
                    </div>
                  </>
                )}

                {requireHttpStatusCode && (
                  <>
                    <div>
                      <label className="block text-xs font-semibold text-primary-700 mb-1">
                        HTTP Status Code *
                      </label>
                      <input
                        type="number"
                        value={detail.httpStatusCode || ''}
                        onChange={(e) => {
                          const value = e.target.value ? parseInt(e.target.value, 10) : undefined;
                          updateDetail(index, 'httpStatusCode', value);
                        }}
                        className={`w-full px-3 py-2 border-2 rounded-lg focus:outline-none focus:ring-2 transition-all ${
                          errors[`downstreamDetails[${index}].httpStatusCode`]
                            ? 'border-red-500'
                            : 'border-gray-300'
                        }`}
                        placeholder="200"
                      />
                      {errors[`downstreamDetails[${index}].httpStatusCode`] && (
                        <p className="mt-1 text-xs text-red-600 font-medium">
                          {errors[`downstreamDetails[${index}].httpStatusCode`]}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={!!detail.maintenanceFlag}
                        onChange={(e) => updateDetail(index, 'maintenanceFlag', e.target.checked)}
                        className="w-4 h-4 text-primary-600 border-2 border-primary-300 rounded focus:ring-2 focus:ring-primary-500"
                      />
                      <label className="text-xs font-semibold text-primary-700">
                        Maintenance Flag *
                      </label>
                      {errors[`downstreamDetails[${index}].maintenanceFlag`] && (
                        <p className="text-xs text-red-600 font-medium">
                          {errors[`downstreamDetails[${index}].maintenanceFlag`]}
                        </p>
                      )}
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-primary-700 mb-1">
                        Max Retry Count *
                      </label>
                      <input
                        type="number"
                        value={detail.maxRetryCount ?? ''}
                        min={0}
                        onChange={(e) => {
                          const value = e.target.value === '' ? undefined : parseInt(e.target.value, 10);
                          updateDetail(index, 'maxRetryCount', value);
                        }}
                        className={`w-full px-3 py-2 border-2 rounded-lg focus:outline-none focus:ring-2 transition-all ${
                          errors[`downstreamDetails[${index}].maxRetryCount`]
                            ? 'border-red-500'
                            : 'border-gray-300'
                        }`}
                        placeholder="e.g., 3"
                      />
                      {errors[`downstreamDetails[${index}].maxRetryCount`] && (
                        <p className="mt-1 text-xs text-red-600 font-medium">
                          {errors[`downstreamDetails[${index}].maxRetryCount`]}
                        </p>
                      )}
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-primary-700 mb-1">
                        Retry Delay (seconds) *
                      </label>
                      <input
                        type="number"
                        value={detail.retryDelay ?? ''}
                        min={0}
                        onChange={(e) => {
                          const value = e.target.value === '' ? undefined : parseInt(e.target.value, 10);
                          updateDetail(index, 'retryDelay', value);
                        }}
                        className={`w-full px-3 py-2 border-2 rounded-lg focus:outline-none focus:ring-2 transition-all ${
                          errors[`downstreamDetails[${index}].retryDelay`]
                            ? 'border-red-500'
                            : 'border-gray-300'
                        }`}
                        placeholder="e.g., 10"
                      />
                      {errors[`downstreamDetails[${index}].retryDelay`] && (
                        <p className="mt-1 text-xs text-red-600 font-medium">
                          {errors[`downstreamDetails[${index}].retryDelay`]}
                        </p>
                      )}
                    </div>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

