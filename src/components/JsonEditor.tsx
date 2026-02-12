import React from 'react';
import AceEditor from 'react-ace';
import 'ace-builds/src-noconflict/mode-json';
import 'ace-builds/src-noconflict/theme-github';
import 'ace-builds/src-noconflict/ext-language_tools';

interface JsonEditorProps {
  value: string;
  onChange: (value: string) => void;
  label: string;
  height?: string;
  error?: string;
}

export const JsonEditor: React.FC<JsonEditorProps> = ({
  value,
  onChange,
  label,
  height = '200px',
  error,
}) => {
  const [isValid, setIsValid] = React.useState(true);
  const [parseError, setParseError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (value.trim() === '') {
      setIsValid(true);
      setParseError(null);
      return;
    }

    try {
      JSON.parse(value);
      setIsValid(true);
      setParseError(null);
    } catch (e) {
      setIsValid(false);
      setParseError(e instanceof Error ? e.message : 'Invalid JSON');
    }
  }, [value]);

  const handleBeautify = () => {
    if (value.trim() === '') return;
    try {
      const parsed = JSON.parse(value);
      const beautified = JSON.stringify(parsed, null, 2);
      onChange(beautified);
    } catch {
      // Invalid JSON - button is disabled, no-op
    }
  };

  const canBeautify = value.trim() !== '' && isValid && !error;

  return (
    <div className="mb-4">
      <label className="block text-sm font-semibold text-primary-700 mb-2">
        {label}
      </label>
      <div className={`border-2 rounded-xl overflow-hidden shadow-md ${error || !isValid ? 'border-red-500' : 'border-primary-400'}`}>
        <AceEditor
          mode="json"
          theme="github"
          value={value}
          onChange={onChange}
          name={`${label}-editor`}
          editorProps={{ $blockScrolling: true }}
          height={height}
          width="100%"
          fontSize={14}
          showPrintMargin={false}
          setOptions={{
            enableBasicAutocompletion: true,
            enableLiveAutocompletion: true,
            enableSnippets: true,
            showLineNumbers: true,
            tabSize: 2,
          }}
        />
      </div>
      <div className="mt-2 flex justify-end">
        <button
          type="button"
          onClick={handleBeautify}
          disabled={!canBeautify}
          className={`text-sm font-semibold px-3 py-1.5 rounded-lg transition-all ${
            canBeautify
              ? 'bg-gray-200 text-gray-800 hover:bg-gray-300 shadow-sm border border-gray-300'
              : 'bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200'
          }`}
          title={canBeautify ? 'Format JSON with indentation' : 'Enter valid JSON to beautify'}
        >
          Beautify JSON
        </button>
      </div>
      {(error || parseError) && (
        <p className="mt-2 text-sm text-red-600 font-medium bg-red-50 p-2 rounded-lg border-2 border-red-300">{error || parseError}</p>
      )}
      {isValid && !error && value.trim() !== '' && (
        <p className="mt-2 text-sm text-green-700 font-medium bg-green-50 p-2 rounded-lg border-2 border-green-300 flex items-center">
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          Valid JSON
        </p>
      )}
    </div>
  );
};

