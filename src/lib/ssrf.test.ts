import { isSafeUrl } from './ssrf';
import * as dns from 'dns/promises';

// Mock dns.lookup to avoid real network calls during tests
jest.mock('dns/promises', () => ({
  lookup: jest.fn(),
}));

describe('isSafeUrl', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('allows safe public URLs', async () => {
    (dns.lookup as jest.Mock).mockResolvedValue([{ address: '8.8.8.8', family: 4 }]);
    const result = await isSafeUrl('https://google.com');
    expect(result).toBe(true);
  });

  it('allows safe public HTTP URLs', async () => {
    (dns.lookup as jest.Mock).mockResolvedValue([{ address: '93.184.216.34', family: 4 }]);
    const result = await isSafeUrl('http://example.com');
    expect(result).toBe(true);
  });

  it('rejects URLs with disallowed protocols', async () => {
    expect(await isSafeUrl('file:///etc/passwd')).toBe(false);
    expect(await isSafeUrl('ftp://example.com')).toBe(false);
    expect(await isSafeUrl('javascript:alert(1)')).toBe(false);
    expect(await isSafeUrl('data:text/plain;base64,SGVsbG8=')).toBe(false);
  });

  it('rejects known local hostnames', async () => {
    expect(await isSafeUrl('http://localhost')).toBe(false);
    expect(await isSafeUrl('http://localhost:3000')).toBe(false);
    expect(await isSafeUrl('http://my-service.local')).toBe(false);
    expect(await isSafeUrl('http://internal.app.internal')).toBe(false);
  });

  it('rejects explicit private/internal IPs', async () => {
    expect(await isSafeUrl('http://127.0.0.1')).toBe(false);
    expect(await isSafeUrl('http://10.0.0.1')).toBe(false);
    expect(await isSafeUrl('http://172.16.0.1')).toBe(false);
    expect(await isSafeUrl('http://192.168.1.1')).toBe(false);
    expect(await isSafeUrl('http://169.254.169.254')).toBe(false); // AWS Metadata
    expect(await isSafeUrl('http://[::1]')).toBe(false);
    expect(await isSafeUrl('http://[fc00::1]')).toBe(false);
    expect(await isSafeUrl('http://[::ffff:127.0.0.1]')).toBe(false); // IPv4-mapped IPv6 loopback
    expect(await isSafeUrl('http://[::ffff:169.254.169.254]')).toBe(false); // IPv4-mapped IPv6 AWS Metadata
  });

  it('rejects hostnames that resolve to private IPs (DNS Rebinding/Masking)', async () => {
    (dns.lookup as jest.Mock).mockResolvedValue([{ address: '127.0.0.1', family: 4 }]);
    expect(await isSafeUrl('http://localtest.me')).toBe(false);

    (dns.lookup as jest.Mock).mockResolvedValue([{ address: '169.254.169.254', family: 4 }]);
    expect(await isSafeUrl('http://metadata.aws.internal.com')).toBe(false);

    (dns.lookup as jest.Mock).mockResolvedValue([{ address: '192.168.0.5', family: 4 }]);
    expect(await isSafeUrl('http://my-home-router.com')).toBe(false);
  });

  it('rejects invalid URLs', async () => {
    expect(await isSafeUrl('not a url')).toBe(false);
    expect(await isSafeUrl('')).toBe(false);
  });
});
