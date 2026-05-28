import { NextRequest } from 'next/server';
import dns from 'node:dns';

function isPrivateIP(ip: string): boolean {
  const parts = ip.split('.');
  if (parts.length === 4) {
    const [a, b] = parts.map(Number);
    if (a === 10 || a === 127 || a === 0 || a === 169) return true;
    if (a === 172 && b >= 16 && b <= 31) return true;
    if (a === 192 && b === 168) return true;
  }
  // IPv6
  if (ip === '::1' || ip === '::' || ip === '0:0:0:0:0:0:0:0') return true;
  if (/^f[cd][0-9a-f]{2}:/i.test(ip)) return true;
  if (/^fe[89ab][0-9a-f]:/i.test(ip)) return true;
  if (ip.toLowerCase().startsWith('::ffff:')) return isPrivateIP(ip.substring(7));
  return false;
}

/**
 * Internal API Proxy
 *
 * This Next.js API route acts as a proxy for all requests sent from the Aperio dashboard
 * to target OpenAPI endpoints. We need a proxy for the following reasons:
 *
 * 1. **CORS bypass**: Browsers restrict cross-origin requests. By forwarding through our
 *    server, we bypass browser CORS limitations, allowing users to query any API.
 * 2. **Auth injection**: We can securely inject headers (e.g. Bearer, Basic, API keys)
 *    based on the configured environment without exposing them directly in client requests
 *    (though they are managed client-side in the dashboard).
 *
 * The client sends a POST request to this proxy containing:
 * - `url`: The target API URL.
 * - `method`: The HTTP method to use (GET, POST, etc.).
 * - `headers`: Additional headers to forward (e.g., Auth tokens).
 * - `body`: (Optional) The JSON payload to forward to the target API.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as {
      url: string;
      method: string;
      headers?: Record<string, string>;
      body?: unknown;
    };

    const { url, method, headers: extraHeaders, body: requestBody } = body;

    if (!url || !method) {
      return Response.json({ error: 'url and method are required' }, { status: 400 });
    }

    let parsedUrl: URL;
    try {
      parsedUrl = new URL(url);
    } catch {
      return Response.json({ error: 'Invalid URL' }, { status: 400 });
    }

    if (parsedUrl.protocol !== 'http:' && parsedUrl.protocol !== 'https:') {
      return Response.json({ error: 'Invalid protocol' }, { status: 400 });
    }

    try {
      // hostname may have brackets for IPv6 literals. Strip them.
      const lookupHostname = parsedUrl.hostname.replace(/^\[(.*)\]$/, '$1');
      const addresses = await dns.promises.lookup(lookupHostname, { all: true });
      for (const { address } of addresses) {
        if (isPrivateIP(address)) {
          return Response.json({ error: 'Access to local or private networks is blocked' }, { status: 403 });
        }
      }
    } catch {
      return Response.json({ error: 'Failed to resolve hostname' }, { status: 400 });
    }

    const fetchOptions: RequestInit = {
      method: method.toUpperCase(),
      redirect: 'manual',
      headers: {
        'Content-Type': 'application/json',
        ...extraHeaders,
      },
    };

    const upperMethod = method.toUpperCase();
    if (requestBody !== undefined && upperMethod !== 'GET' && upperMethod !== 'DELETE') {
      fetchOptions.body = JSON.stringify(requestBody);
    }

    const response = await fetch(url, fetchOptions);
    
    const contentType = response.headers.get('content-type') ?? '';
    
    if (contentType.includes('application/json')) {
      const data = await response.json();
      return Response.json(data, { status: response.status });
    } else {
      const text = await response.text();
      return new Response(text, {
        status: response.status,
        headers: { 'Content-Type': contentType || 'text/plain' },
      });
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return Response.json({ error: message }, { status: 500 });
  }
}
