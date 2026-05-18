/**
 * Reads POST body from Node IncomingMessage.
 * @param {import('node:http').IncomingMessage} req
 */
function readBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on('data', (chunk) => chunks.push(chunk));
    req.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
    req.on('error', reject);
  });
}

/**
 * Same-origin proxy so browser API calls avoid CORS (dev / vite preview only).
 */
function install(middlewares) {
  middlewares.use(async (req, res, next) => {
    const urlPath = req.url?.split('?')[0] ?? '';
    if (urlPath !== '/__diffy-proxy' || req.method !== 'POST') {
      next();
      return;
    }

    res.setHeader('Access-Control-Allow-Origin', '*');

    let body;
    try {
      body = await readBody(req);
    } catch {
      res.statusCode = 400;
      res.setHeader('Content-Type', 'text/plain; charset=utf-8');
      res.end('Invalid request body');
      return;
    }

    let payload;
    try {
      payload = JSON.parse(body || '{}');
    } catch {
      res.statusCode = 400;
      res.setHeader('Content-Type', 'text/plain; charset=utf-8');
      res.end('Expected JSON body');
      return;
    }

    const target = payload.url;
    const headers =
      payload.headers && typeof payload.headers === 'object' ? payload.headers : {};

    if (typeof target !== 'string' || !target.trim()) {
      res.statusCode = 400;
      res.setHeader('Content-Type', 'text/plain; charset=utf-8');
      res.end('Missing "url" in JSON body');
      return;
    }

    let targetUrl;
    try {
      targetUrl = new URL(target);
    } catch {
      res.statusCode = 400;
      res.setHeader('Content-Type', 'text/plain; charset=utf-8');
      res.end('Invalid URL');
      return;
    }

    if (targetUrl.protocol !== 'http:' && targetUrl.protocol !== 'https:') {
      res.statusCode = 400;
      res.setHeader('Content-Type', 'text/plain; charset=utf-8');
      res.end('Only http(s) URLs are allowed');
      return;
    }

    const forwardHeaders = { ...headers };
    delete forwardHeaders.host;
    delete forwardHeaders.connection;

    try {
      const upstream = await fetch(target, {
        method: 'GET',
        headers: forwardHeaders,
        redirect: 'follow',
      });

      const buf = Buffer.from(await upstream.arrayBuffer());
      const ct = upstream.headers.get('content-type');
      if (ct) res.setHeader('Content-Type', ct);
      res.statusCode = upstream.status;
      res.end(buf);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Upstream fetch failed';
      res.statusCode = 502;
      res.setHeader('Content-Type', 'text/plain; charset=utf-8');
      res.end(msg);
    }
  });
}

export default function corsProxyPlugin() {
  return {
    name: 'diffy-cors-proxy',
    configureServer(server) {
      install(server.middlewares);
    },
    configurePreviewServer(server) {
      install(server.middlewares);
    },
  };
}
