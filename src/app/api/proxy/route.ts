import { NextRequest } from 'next/server';
import { safeFetch } from '@/lib/ssrf';

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

    const fetchOptions: RequestInit = {
      method: method.toUpperCase(),
      headers: {
        'Content-Type': 'application/json',
        ...extraHeaders,
      },
    };

    const upperMethod = method.toUpperCase();
    if (requestBody !== undefined && upperMethod !== 'GET' && upperMethod !== 'DELETE') {
      fetchOptions.body = JSON.stringify(requestBody);
    }

    let response: Response;
    try {
      response = await safeFetch(url, fetchOptions);
    } catch (err: any) {
      return Response.json(
        { error: err.message || 'Invalid or restricted URL provided.' },
        { status: 400 }
      );
    }
    
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
