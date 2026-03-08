import { NextRequest } from 'next/server';

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
