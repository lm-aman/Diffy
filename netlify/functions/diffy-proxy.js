/**
 * Netlify Function — CORS proxy for the Diffy API tab.
 * Mirrors the Vite dev-server proxy so production deploys work identically.
 */
exports.handler = async (event) => {
  const cors = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers: cors, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers: cors, body: 'Method Not Allowed' };
  }

  let payload;
  try {
    payload = JSON.parse(event.body || '{}');
  } catch {
    return { statusCode: 400, headers: cors, body: 'Expected JSON body' };
  }

  const { url, headers: forwardHeaders = {} } = payload;

  if (!url || typeof url !== 'string' || !url.trim()) {
    return { statusCode: 400, headers: cors, body: 'Missing "url" in JSON body' };
  }

  let targetUrl;
  try {
    targetUrl = new URL(url);
  } catch {
    return { statusCode: 400, headers: cors, body: 'Invalid URL' };
  }

  if (targetUrl.protocol !== 'http:' && targetUrl.protocol !== 'https:') {
    return { statusCode: 400, headers: cors, body: 'Only http(s) URLs are allowed' };
  }

  const cleanHeaders = { ...forwardHeaders };
  delete cleanHeaders.host;
  delete cleanHeaders.connection;

  try {
    const upstream = await fetch(url, {
      method: 'GET',
      headers: cleanHeaders,
      redirect: 'follow',
    });

    const body = await upstream.text();
    const ct = upstream.headers.get('content-type') || 'application/json';

    return {
      statusCode: upstream.status,
      headers: { ...cors, 'Content-Type': ct },
      body,
    };
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Upstream fetch failed';
    return { statusCode: 502, headers: cors, body: msg };
  }
};
