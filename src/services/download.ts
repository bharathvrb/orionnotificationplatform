/**
 * Download utility service for exporting request and response data
 */

export interface DownloadData {
  operation: string;
  timestamp: string;
  request: {
    endpoint: string;
    method: string;
    headers?: Record<string, string>;
    body?: any;
    queryParams?: Record<string, string>;
  };
  response: {
    status?: number;
    statusText?: string;
    data?: any;
    error?: string;
  };
  metadata?: Record<string, any>;
}

/**
 * Downloads data as an Excel file (CSV format that Excel can open)
 */
export const downloadAsExcel = (data: DownloadData, filename?: string): void => {
  const rows: string[][] = [];
  
  // Header section
  rows.push([data.operation.toUpperCase() + ' - OPERATION REPORT']);
  rows.push([]);
  rows.push(['Timestamp', data.timestamp]);
  rows.push(['Operation', data.operation]);
  rows.push([]);
  
  // Request Details section
  rows.push(['REQUEST DETAILS']);
  rows.push(['Endpoint', `${data.request.method} ${data.request.endpoint}`]);
  
  if (data.request.queryParams && Object.keys(data.request.queryParams).length > 0) {
    rows.push([]);
    rows.push(['Query Parameters']);
    Object.entries(data.request.queryParams).forEach(([key, value]) => {
      rows.push([key, String(value)]);
    });
  }
  
  if (data.request.headers && Object.keys(data.request.headers).length > 0) {
    rows.push([]);
    rows.push(['Headers']);
    Object.entries(data.request.headers).forEach(([key, value]) => {
      const maskedValue = (key.toLowerCase().includes('authorization') || 
                          key.toLowerCase().includes('token') || 
                          key.toLowerCase().includes('secret')) 
        ? '***MASKED***' 
        : value;
      rows.push([key, maskedValue]);
    });
  }
  
  if (data.request.body) {
    rows.push([]);
    rows.push(['Request Body']);
    // Flatten request body for Excel
    if (typeof data.request.body === 'object') {
      const flattenObject = (obj: any, prefix = ''): void => {
        Object.keys(obj).forEach(key => {
          const newKey = prefix ? `${prefix}.${key}` : key;
          const value = obj[key];
          if (value && typeof value === 'object' && !Array.isArray(value)) {
            flattenObject(value, newKey);
          } else if (Array.isArray(value)) {
            value.forEach((item, index) => {
              if (typeof item === 'object') {
                flattenObject(item, `${newKey}[${index}]`);
              } else {
                rows.push([`${newKey}[${index}]`, String(item)]);
              }
            });
          } else {
            rows.push([newKey, String(value || '')]);
          }
        });
      };
      flattenObject(data.request.body);
    } else {
      rows.push(['Body', String(data.request.body)]);
    }
  }
  
  // Response Details section
  rows.push([]);
  rows.push(['RESPONSE DETAILS']);
  
  if (data.response.status) {
    rows.push(['Status', `${data.response.status} ${data.response.statusText || ''}`]);
  }
  
  if (data.response.error) {
    rows.push(['Error', data.response.error]);
  }
  
  if (data.response.data) {
    rows.push([]);
    rows.push(['Response Data']);
    // Flatten response data for Excel
    if (typeof data.response.data === 'object') {
      const flattenObject = (obj: any, prefix = ''): void => {
        Object.keys(obj).forEach(key => {
          const newKey = prefix ? `${prefix}.${key}` : key;
          const value = obj[key];
          if (value && typeof value === 'object' && !Array.isArray(value)) {
            flattenObject(value, newKey);
          } else if (Array.isArray(value)) {
            value.forEach((item, index) => {
              if (typeof item === 'object') {
                flattenObject(item, `${newKey}[${index}]`);
              } else {
                rows.push([`${newKey}[${index}]`, String(item)]);
              }
            });
          } else {
            rows.push([newKey, String(value || '')]);
          }
        });
      };
      flattenObject(data.response.data);
    } else {
      rows.push(['Data', String(data.response.data)]);
    }
  }
  
  // Metadata section
  if (data.metadata && Object.keys(data.metadata).length > 0) {
    rows.push([]);
    rows.push(['METADATA']);
    Object.entries(data.metadata).forEach(([key, value]) => {
      rows.push([key, String(value)]);
    });
  }
  
  // Convert to CSV format
  const csvContent = rows.map(row => {
    return row.map(cell => {
      // Escape quotes and wrap in quotes if contains comma, quote, or newline
      const cellStr = String(cell || '');
      if (cellStr.includes(',') || cellStr.includes('"') || cellStr.includes('\n')) {
        return `"${cellStr.replace(/"/g, '""')}"`;
      }
      return cellStr;
    }).join(',');
  }).join('\n');
  
  // Add BOM for Excel UTF-8 support
  const BOM = '\uFEFF';
  const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
  const operationName = data.operation.toLowerCase().replace(/\s+/g, '-');
  link.download = filename || `${operationName}-${timestamp}.csv`;
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};


