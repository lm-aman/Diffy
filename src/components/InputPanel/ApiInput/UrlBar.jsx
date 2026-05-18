import { extractPathVariables } from '../../../lib/urlParser.js';

const VAR_REGEX = /\{\{(\w+)\}\}/g;

function highlightUrl(url, pathVariables) {
  const parts = [];
  let lastIndex = 0;
  const re = new RegExp(VAR_REGEX.source, 'g');
  let match;

  const valueMap = Object.fromEntries(
    pathVariables.map((v) => [v.key, v.value]),
  );

  while ((match = re.exec(url)) !== null) {
    if (match.index > lastIndex) {
      parts.push({ text: url.slice(lastIndex, match.index), type: 'plain' });
    }
    const name = match[1];
    const filled = valueMap[name]?.trim();
    parts.push({
      text: match[0],
      type: filled ? 'filled' : 'empty',
      name,
    });
    lastIndex = match.index + match[0].length;
  }
  if (lastIndex < url.length) {
    parts.push({ text: url.slice(lastIndex), type: 'plain' });
  }

  return parts;
}

export default function UrlBar({ url, pathVariables, onChange, validationError }) {
  const parts = highlightUrl(url, pathVariables);

  return (
    <div className="space-y-1">
      <label className="text-xs font-semibold text-zinc-600 uppercase tracking-wide">
        URL
      </label>
      <div className="flex gap-2">
        <span className="shrink-0 inline-flex items-center px-3 py-2 text-xs font-bold tracking-wide text-blue-700 bg-blue-50 border border-blue-200 rounded-lg select-none">
          GET
        </span>
        <div className="relative flex-1">
          <div
            aria-hidden
            className="absolute inset-0 px-3 py-2 font-mono text-sm pointer-events-none whitespace-pre overflow-hidden text-transparent"
          >
            {parts.map((p, i) =>
              p.type === 'plain' ? (
                <span key={i}>{p.text}</span>
              ) : (
                <span
                  key={i}
                  className={
                    p.type === 'filled'
                      ? 'text-green-700'
                      : 'text-orange-700'
                  }
                >
                  {p.text}
                </span>
              ),
            )}
          </div>
          <input
            value={url}
            onChange={(e) => onChange(e.target.value)}
            placeholder="https://api.example.com/{{id}}"
            className={`w-full px-3 py-2 font-mono text-sm bg-white border rounded-lg text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:ring-offset-2 ${
              validationError ? 'border-red-600' : 'border-zinc-300'
            }`}
          />
        </div>
      </div>
      {validationError && (
        <p className="text-xs text-red-700 font-medium">{validationError}</p>
      )}
    </div>
  );
}

export { extractPathVariables };
