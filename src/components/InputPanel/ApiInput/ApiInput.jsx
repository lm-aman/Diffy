import { useMemo, useState } from 'react';
import { useAppStore } from '../../../store/useAppStore.js';
import {
  extractPathVariables,
  substitutePathVariables,
  buildUrlWithQuery,
  parseQueryFromUrl,
  stripQueryFromUrl,
  syncUrlQuery,
} from '../../../lib/urlParser.js';
import {
  buildRequestHeaders,
  appendApiKeyToUrl,
  fetchJson,
} from '../../../lib/apiClient.js';
import UrlBar from './UrlBar.jsx';
import ParamsTable from './ParamsTable.jsx';
import AuthConfig from './AuthConfig.jsx';

export default function ApiInput({ side }) {
  const pane = useAppStore((s) => s[side]);
  const setApiConfig = useAppStore((s) => s.setApiConfig);
  const setApiLoading = useAppStore((s) => s.setApiLoading);
  const setApiError = useAppStore((s) => s.setApiError);
  const setPaneParsedJson = useAppStore((s) => s.setPaneParsedJson);
  const [varError, setVarError] = useState(null);

  const config = pane.apiConfig;

  const syncPathVarsFromUrl = (url) => {
    const names = extractPathVariables(url);
    const existing = Object.fromEntries(
      config.pathVariables.map((v) => [v.key, v.value]),
    );
    const pathVariables = names.map((key) => ({
      key,
      value: existing[key] ?? '',
    }));
    setApiConfig(side, { pathVariables });
  };

  const handleUrlChange = (url) => {
    const base = stripQueryFromUrl(url);
    const parsedQuery = parseQueryFromUrl(url);
    const queryParams =
      parsedQuery.length > 0 ? parsedQuery : config.queryParams;
    syncPathVarsFromUrl(base);
    setApiConfig(side, { url: base, queryParams });
    setVarError(null);
  };

  const handleQueryChange = (queryParams) => {
    const url = syncUrlQuery(config.url, queryParams);
    setApiConfig(side, { queryParams, url: stripQueryFromUrl(url) });
  };

  const resolvedHeaders = useMemo(() => {
    const headers = [...config.headers];
    const { authType, authValues } = config;

    if (authType === 'bearer' && authValues.token) {
      const idx = headers.findIndex((h) => h.key.toLowerCase() === 'authorization');
      const row = { key: 'Authorization', value: `Bearer ${authValues.token}`, enabled: true };
      if (idx >= 0) headers[idx] = row;
      else headers.push(row);
    }

    if (authType === 'basic' && authValues.username !== undefined) {
      const encoded = btoa(`${authValues.username}:${authValues.password || ''}`);
      const row = { key: 'Authorization', value: `Basic ${encoded}`, enabled: true };
      const idx = headers.findIndex((h) => h.key.toLowerCase() === 'authorization');
      if (idx >= 0) headers[idx] = row;
      else headers.push(row);
    }

    if (authType === 'apikey' && authValues.placement === 'header' && authValues.keyName) {
      headers.push({
        key: authValues.keyName,
        value: authValues.keyValue || '',
        enabled: true,
      });
    }

    return headers;
  }, [config]);

  const handleSend = async () => {
    const { url: substituted, missing } = substitutePathVariables(
      config.url,
      config.pathVariables,
    );

    if (missing.length > 0) {
      setVarError(`${missing.join(', ')} ${missing.length > 1 ? 'are' : 'is'} required`);
      return;
    }

    setVarError(null);
    setApiError(side, null);
    setApiLoading(side, true);

    try {
      let finalUrl = buildUrlWithQuery(substituted, config.queryParams);
      finalUrl = appendApiKeyToUrl(finalUrl, config);
      const headers = buildRequestHeaders({ ...config, headers: resolvedHeaders });
      const result = await fetchJson(finalUrl, headers);

      if (!result.isJson) {
        setApiError(
          side,
          'Response is not JSON. Raw response stored in paste area.',
        );
        useAppStore.getState().setPaneRawJson(side, result.raw);
        return;
      }

      setPaneParsedJson(side, result.data);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Request failed';
      if (
        msg.includes('Failed to fetch') ||
        msg.includes('NetworkError') ||
        msg.toLowerCase().includes('cors')
      ) {
        setApiError(
          side,
          'Request blocked by CORS. Consider using a proxy or browser extension.',
        );
      } else {
        setApiError(side, msg);
      }
    } finally {
      setApiLoading(side, false);
    }
  };

  return (
    <div className="flex flex-col gap-4 max-h-[400px] overflow-y-auto pr-1">
      <p className="text-xs text-amber-950 bg-amber-50 border border-amber-300 rounded px-3 py-2">
        API requests are proxied through this app&apos;s dev or preview server so browsers do not
        enforce CORS on the remote host. A plain static deploy has no proxy unless you add one.
      </p>

      <UrlBar
        url={config.url}
        pathVariables={config.pathVariables}
        onChange={handleUrlChange}
        validationError={varError}
      />

      <ParamsTable
        title="Path Variables"
        rows={config.pathVariables}
        keyReadOnly
        columns={['key', 'value']}
        onChange={(pathVariables) => {
          setApiConfig(side, { pathVariables });
          setVarError(null);
        }}
      />

      <ParamsTable
        title="Query Params"
        rows={config.queryParams}
        onChange={handleQueryChange}
      />

      <ParamsTable
        title="Headers"
        rows={resolvedHeaders}
        onChange={(headers) => setApiConfig(side, { headers })}
      />

      <AuthConfig
        authType={config.authType}
        authValues={config.authValues}
        onAuthTypeChange={(authType) => setApiConfig(side, { authType })}
        onAuthValueChange={(key, value) =>
          setApiConfig(side, {
            authValues: { ...config.authValues, [key]: value },
          })
        }
      />

      <button
        type="button"
        onClick={handleSend}
        disabled={pane.apiLoading}
        className="w-full py-2.5 text-sm font-medium bg-zinc-900 hover:bg-zinc-800 disabled:opacity-50 text-white rounded-lg transition-colors flex items-center justify-center gap-2"
      >
        {pane.apiLoading && (
          <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
        )}
        Send Request
      </button>

      {pane.apiError && (
        <p className="text-sm text-red-800 bg-red-50 border border-red-200 rounded px-3 py-2">
          {pane.apiError}
        </p>
      )}
    </div>
  );
}
