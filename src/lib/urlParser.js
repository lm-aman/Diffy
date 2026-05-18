const VAR_REGEX = /\{\{(\w+)\}\}/g;

/**
 * @param {string} url
 * @returns {string[]}
 */
export function extractPathVariables(url) {
  const names = new Set();
  let match;
  const re = new RegExp(VAR_REGEX.source, 'g');
  while ((match = re.exec(url)) !== null) {
    names.add(match[1]);
  }
  return [...names];
}

/**
 * @param {string} url
 * @param {{ key: string; value: string }[]} pathVariables
 * @returns {{ url: string; missing: string[] }}
 */
export function substitutePathVariables(url, pathVariables) {
  const missing = [];
  const map = Object.fromEntries(
    pathVariables.map((v) => [v.key, v.value]),
  );

  const result = url.replace(VAR_REGEX, (_, name) => {
    const value = map[name]?.trim();
    if (!value) {
      missing.push(name);
      return `{{${name}}}`;
    }
    return encodeURIComponent(value);
  });

  return { url: result, missing };
}

/**
 * @param {string} baseUrl
 * @param {{ key: string; value: string; enabled: boolean }[]} queryParams
 * @returns {string}
 */
export function buildUrlWithQuery(baseUrl, queryParams) {
  const enabled = queryParams.filter((p) => p.enabled && p.key.trim());
  if (enabled.length === 0) return baseUrl;

  const [path, existingQuery] = baseUrl.split('?');
  const params = new URLSearchParams(existingQuery || '');

  enabled.forEach(({ key, value }) => {
    params.set(key.trim(), value);
  });

  return `${path}?${params.toString()}`;
}

/**
 * @param {string} url
 * @returns {{ key: string; value: string; enabled: boolean }[]}
 */
export function parseQueryFromUrl(url) {
  const qIndex = url.indexOf('?');
  if (qIndex === -1) return [];

  const search = url.slice(qIndex + 1);
  const params = new URLSearchParams(search);
  const rows = [];
  params.forEach((value, key) => {
    rows.push({ key, value, enabled: true });
  });
  return rows;
}

/**
 * @param {string} url
 * @returns {string}
 */
export function stripQueryFromUrl(url) {
  const qIndex = url.indexOf('?');
  return qIndex === -1 ? url : url.slice(0, qIndex);
}

/**
 * @param {string} url
 * @param {{ key: string; value: string; enabled: boolean }[]} queryParams
 * @returns {string}
 */
export function syncUrlQuery(url, queryParams) {
  const base = stripQueryFromUrl(url);
  return buildUrlWithQuery(base, queryParams);
}
