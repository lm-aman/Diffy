/**
 * Build final headers including auth
 * @param {import('../store/useAppStore.js').ApiConfig} apiConfig
 */
export function buildRequestHeaders(apiConfig) {
  const headers = {};
  apiConfig.headers
    .filter((h) => h.enabled && h.key.trim())
    .forEach((h) => {
      headers[h.key.trim()] = h.value;
    });

  const { authType, authValues } = apiConfig;

  if (authType === 'bearer' && authValues.token) {
    headers['Authorization'] = `Bearer ${authValues.token}`;
  }

  if (authType === 'basic' && authValues.username !== undefined) {
    const encoded = btoa(`${authValues.username}:${authValues.password || ''}`);
    headers['Authorization'] = `Basic ${encoded}`;
  }

  if (authType === 'apikey' && authValues.keyName && authValues.keyValue) {
    if (authValues.placement === 'header') {
      headers[authValues.keyName] = authValues.keyValue;
    }
  }

  return headers;
}

/**
 * @param {string} url
 * @param {import('../store/useAppStore.js').ApiConfig} apiConfig
 */
export function appendApiKeyToUrl(url, apiConfig) {
  if (
    apiConfig.authType !== 'apikey' ||
    apiConfig.authValues.placement !== 'query' ||
    !apiConfig.authValues.keyName ||
    !apiConfig.authValues.keyValue
  ) {
    return url;
  }
  const sep = url.includes('?') ? '&' : '?';
  return `${url}${sep}${encodeURIComponent(apiConfig.authValues.keyName)}=${encodeURIComponent(apiConfig.authValues.keyValue)}`;
}

const useCorsProxy =
  import.meta.env.DEV || import.meta.env.VITE_USE_CORS_PROXY === 'true';

/**
 * @param {string} url
 * @param {Record<string, string>} headers
 */
export async function fetchJson(url, headers) {
  const response = useCorsProxy
    ? await fetch('/__diffy-proxy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url, headers }),
      })
    : await fetch(url, {
        method: 'GET',
        headers,
        mode: 'cors',
      });

  const text = await response.text();

  if (!response.ok) {
    throw new Error(`${response.status} ${response.statusText}${text ? `: ${text.slice(0, 200)}` : ''}`);
  }

  try {
    return { data: JSON.parse(text), raw: text, isJson: true };
  } catch {
    return { data: null, raw: text, isJson: false };
  }
}
