import { useCallback, useRef, useState } from 'react';
import { useAppStore } from '../../store/useAppStore.js';
import { validateJson } from '../shared/JsonValidator.js';

export default function UploadInput({ side }) {
  const pane = useAppStore((s) => s[side]);
  const setPaneParsedJson = useAppStore((s) => s.setPaneParsedJson);
  const setUploadMeta = useAppStore((s) => s.setUploadMeta);
  const setPaneRawJson = useAppStore((s) => s.setPaneRawJson);
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState(null);
  const inputRef = useRef(null);

  const processFile = useCallback(
    (file) => {
      if (!file.name.endsWith('.json') && file.type !== 'application/json') {
        setError('Only .json files are accepted');
        return;
      }
      setError(null);
      setUploadMeta(side, file.name, file.size);
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result;
        if (typeof text !== 'string') return;
        const result = validateJson(text);
        if (!result.valid) {
          setError(result.error);
          setPaneRawJson(side, text);
          return;
        }
        setPaneParsedJson(side, result.data, text);
      };
      reader.onerror = () => setError('Failed to read file');
      reader.readAsText(file);
    },
    [side, setPaneParsedJson, setUploadMeta, setPaneRawJson],
  );

  const onDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) processFile(file);
  };

  return (
    <div className="flex flex-col gap-3 h-full">
      <div
        role="button"
        tabIndex={0}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={onDrop}
        onClick={() => inputRef.current?.click()}
        onKeyDown={(e) => e.key === 'Enter' && inputRef.current?.click()}
        className={`flex-1 min-h-[160px] flex flex-col items-center justify-center border-2 border-dashed rounded-lg cursor-pointer transition-colors ${
          dragOver
            ? 'border-zinc-900 bg-zinc-100'
            : 'border-zinc-400 hover:border-zinc-600 bg-zinc-50'
        }`}
      >
        <p className="text-zinc-700 text-sm font-medium">Drag & drop a .json file here</p>
        <p className="text-zinc-500 text-xs mt-1">or click to browse</p>
        <input
          ref={inputRef}
          type="file"
          accept=".json,application/json"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) processFile(file);
          }}
        />
      </div>
      {pane.uploadFileName && (
        <p className="text-sm text-zinc-700">
          {pane.uploadFileName}
          {pane.uploadFileSize != null &&
            ` (${(pane.uploadFileSize / 1024).toFixed(1)} KB)`}
        </p>
      )}
      {error && <p className="text-sm text-red-700 font-medium">{error}</p>}
    </div>
  );
}
