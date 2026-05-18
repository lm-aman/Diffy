export default function AuthConfig({ authType, authValues, onAuthTypeChange, onAuthValueChange }) {
  const types = [
    { id: 'none', label: 'None' },
    { id: 'bearer', label: 'Bearer Token' },
    { id: 'basic', label: 'Basic Auth' },
    { id: 'apikey', label: 'API Key' },
  ];

  return (
    <div className="space-y-3">
      <h4 className="text-xs font-semibold text-zinc-600 uppercase tracking-wide">
        Auth
      </h4>
      <select
        value={authType}
        onChange={(e) => onAuthTypeChange(e.target.value)}
        className="w-full px-3 py-2 text-sm bg-white border border-zinc-300 rounded-lg text-zinc-900"
      >
        {types.map((t) => (
          <option key={t.id} value={t.id}>
            {t.label}
          </option>
        ))}
      </select>

      {authType === 'bearer' && (
        <input
          type="password"
          placeholder="Bearer token"
          value={authValues.token || ''}
          onChange={(e) => onAuthValueChange('token', e.target.value)}
          className="w-full px-3 py-2 text-sm bg-white border border-zinc-300 rounded-lg text-zinc-900"
        />
      )}

      {authType === 'basic' && (
        <div className="grid grid-cols-2 gap-2">
          <input
            placeholder="Username"
            value={authValues.username || ''}
            onChange={(e) => onAuthValueChange('username', e.target.value)}
            className="px-3 py-2 text-sm bg-white border border-zinc-300 rounded-lg text-zinc-900"
          />
          <input
            type="password"
            placeholder="Password"
            value={authValues.password || ''}
            onChange={(e) => onAuthValueChange('password', e.target.value)}
            className="px-3 py-2 text-sm bg-white border border-zinc-300 rounded-lg text-zinc-900"
          />
        </div>
      )}

      {authType === 'apikey' && (
        <div className="space-y-2">
          <input
            placeholder="Key name"
            value={authValues.keyName || ''}
            onChange={(e) => onAuthValueChange('keyName', e.target.value)}
            className="w-full px-3 py-2 text-sm bg-white border border-zinc-300 rounded-lg text-zinc-900"
          />
          <input
            type="password"
            placeholder="Key value"
            value={authValues.keyValue || ''}
            onChange={(e) => onAuthValueChange('keyValue', e.target.value)}
            className="w-full px-3 py-2 text-sm bg-white border border-zinc-300 rounded-lg text-zinc-900"
          />
          <select
            value={authValues.placement || 'header'}
            onChange={(e) => onAuthValueChange('placement', e.target.value)}
            className="w-full px-3 py-2 text-sm bg-white border border-zinc-300 rounded-lg text-zinc-900"
          >
            <option value="header">Header</option>
            <option value="query">Query Param</option>
          </select>
        </div>
      )}
    </div>
  );
}
