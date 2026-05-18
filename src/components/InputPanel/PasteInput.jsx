import { useAppStore } from '../../store/useAppStore.js';
import { countTextStats } from '../shared/JsonValidator.js';

export default function PasteInput({ side }) {
  const pane = useAppStore((s) => s[side]);
  const setPaneRawJson = useAppStore((s) => s.setPaneRawJson);
  const validatePaneJson = useAppStore((s) => s.validatePaneJson);

  const stats = countTextStats(pane.rawJson);

  return (
    <div className="flex flex-col gap-2 h-full">
      <textarea
        value={pane.rawJson}
        onChange={(e) => setPaneRawJson(side, e.target.value)}
        onBlur={() => {
          if (pane.rawJson.trim()) validatePaneJson(side);
        }}
        placeholder='{"key": "value"}'
        spellCheck={false}
        className="flex-1 min-h-[160px] w-full p-3 font-mono text-sm bg-white border border-zinc-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:ring-offset-2 text-zinc-900 placeholder:text-zinc-400"
      />
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => validatePaneJson(side)}
          className="px-4 py-1.5 text-sm font-medium bg-zinc-900 hover:bg-zinc-800 text-white rounded-md transition-colors"
        >
          Validate JSON
        </button>
        <span className="text-xs text-zinc-600">
          {stats.lines} lines · {stats.chars} chars
        </span>
      </div>
      {pane.parseError && (
        <p className="text-sm text-red-700 font-medium">
          {pane.parseErrorLine ? `Line ${pane.parseErrorLine}: ` : ''}
          {pane.parseError}
        </p>
      )}
      {pane.parsedJson && !pane.parseError && (
        <p className="text-sm text-green-800 font-medium">Valid JSON</p>
      )}
    </div>
  );
}
