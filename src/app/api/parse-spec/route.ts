import { NextRequest } from 'next/server';
import { parseOpenApiSpec } from '@/lib/openapi-parser';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as { url?: string; content?: string };
    
    let input: string | object;
    
    if (body.url) {
      const response = await fetch(body.url);
      if (!response.ok) {
        return Response.json(
          { error: `Failed to fetch spec: ${response.statusText}` },
          { status: 400 }
        );
      }
      input = await response.text();
    } else if (body.content) {
      input = body.content;
    } else {
      return Response.json({ error: 'Either url or content is required' }, { status: 400 });
    }
    
    const parsed = await parseOpenApiSpec(input);
    return Response.json(parsed);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return Response.json({ error: message }, { status: 500 });
  }
}
