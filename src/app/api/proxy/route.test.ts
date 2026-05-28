import { NextRequest } from 'next/server';
import { POST } from './route';
import dns from 'node:dns';

// Mock fetch
global.fetch = jest.fn();
const mockFetch = global.fetch as jest.Mock;

// Mock Response.json for Next.js 13+
if (typeof Response === 'undefined') {
  global.Response = class {
    status: number;
    headers: Headers;
    body: string;

    constructor(body: string, init?: ResponseInit) {
      this.body = body;
      this.status = init?.status || 200;
      this.headers = new Headers(init?.headers);
    }

    async json() {
      return JSON.parse(this.body);
    }

    async text() {
      return this.body;
    }

    static json(data: unknown, init?: ResponseInit) {
      return new Response(JSON.stringify(data), {
        status: init?.status || 200,
        headers: { 'Content-Type': 'application/json', ...init?.headers },
      });
    }
  } as unknown as typeof Response;
}

const originalResponseJson = Response.json;
beforeAll(() => {
  Response.json = jest.fn().mockImplementation((data, init) => {
    return new Response(JSON.stringify(data), {
      status: init?.status || 200,
      headers: { 'Content-Type': 'application/json', ...init?.headers },
    });
  });
});

afterAll(() => {
  Response.json = originalResponseJson;
});

// Mock dns
jest.mock('node:dns', () => ({
  promises: {
    lookup: jest.fn(),
  },
}));
const mockLookup = dns.promises.lookup as jest.Mock;

function createMockRequest(body: unknown): NextRequest {
  return {
    json: async () => body,
  } as unknown as NextRequest;
}

describe('Proxy API Route', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockFetch.mockResolvedValue(
      new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: new Headers({ 'content-type': 'application/json' }),
      })
    );
  });

  it('should block local/private IP addresses (127.0.0.1)', async () => {
    mockLookup.mockResolvedValue([{ address: '127.0.0.1', family: 4 }]);

    const req = createMockRequest({ url: 'http://127.0.0.1:3000/api', method: 'GET' });
    const response = await POST(req);

    expect(response.status).toBe(403);
    const data = await response.json();
    expect(data.error).toBe('Access to local or private networks is blocked');
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it('should block local/private IP addresses (169.254.169.254)', async () => {
    mockLookup.mockResolvedValue([{ address: '169.254.169.254', family: 4 }]);

    const req = createMockRequest({ url: 'http://169.254.169.254/latest/meta-data', method: 'GET' });
    const response = await POST(req);

    expect(response.status).toBe(403);
    const data = await response.json();
    expect(data.error).toBe('Access to local or private networks is blocked');
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it('should block non-http/https protocols', async () => {
    const req = createMockRequest({ url: 'file:///etc/passwd', method: 'GET' });
    const response = await POST(req);

    expect(response.status).toBe(400);
    const data = await response.json();
    expect(data.error).toBe('Invalid protocol');
    expect(mockFetch).not.toHaveBeenCalled();
    expect(mockLookup).not.toHaveBeenCalled();
  });

  it('should allow external URLs', async () => {
    mockLookup.mockResolvedValue([{ address: '93.184.216.34', family: 4 }]);

    const req = createMockRequest({ url: 'https://example.com/api', method: 'GET' });
    const response = await POST(req);

    expect(response.status).toBe(200);
    expect(mockFetch).toHaveBeenCalledWith(
      'https://example.com/api',
      expect.objectContaining({ method: 'GET' })
    );
  });
});
