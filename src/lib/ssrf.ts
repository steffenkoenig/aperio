import * as dns from 'dns/promises';

function isPrivateIPv4(ip: string): boolean {
  const parts = ip.split('.').map(p => parseInt(p, 10));
  if (parts.length !== 4) return false;

  const [p1, p2, p3, p4] = parts;
  if (Number.isNaN(p1) || Number.isNaN(p2) || Number.isNaN(p3) || Number.isNaN(p4)) {
    return true; // Invalid parts are considered unsafe
  }

  return (
    p1 === 127 || // Loopback
    p1 === 10 || // Private network 10.0.0.0/8
    (p1 === 172 && p2 >= 16 && p2 <= 31) || // Private network 172.16.0.0/12
    (p1 === 192 && p2 === 168) || // Private network 192.168.0.0/16
    p1 === 0 || // Local network 0.0.0.0/8
    (p1 === 169 && p2 === 254) || // Link-local 169.254.0.0/16
    (p1 === 100 && p2 >= 64 && p2 <= 127) || // Carrier-Grade NAT 100.64.0.0/10
    (p1 === 198 && (p2 === 18 || p2 === 19)) || // Benchmark Testing 198.18.0.0/15
    (p1 >= 224 && p1 <= 239) || // Multicast 224.0.0.0/4
    p1 >= 240 // Reserved/Experimental (240.0.0.0/4)
  );
}

function isPrivateIPv6(ip: string): boolean {
  const lowerIp = ip.toLowerCase().trim();
  let cleanIp = lowerIp;

  // Strip enclosing square brackets if present
  if (cleanIp.startsWith('[') && cleanIp.endsWith(']')) {
    cleanIp = cleanIp.slice(1, -1);
  }

  // Handle IPv4-mapped IPv6 addresses (e.g., ::ffff:127.0.0.1)
  if (cleanIp.startsWith('::ffff:')) {
    const ipv4Part = cleanIp.substring(7);
    return isPrivateIp(ipv4Part);
  }

  return (
    cleanIp === '::1' || // Loopback
    cleanIp === '::' || // Unspecified
    cleanIp.startsWith('fc') || // Unique local address fc00::/7
    cleanIp.startsWith('fd') ||
    cleanIp.startsWith('fe8') || // Link-local address fe80::/10
    cleanIp.startsWith('fe9') ||
    cleanIp.startsWith('fea') ||
    cleanIp.startsWith('feb') ||
    cleanIp.startsWith('ff') || // Multicast ff00::/8
    cleanIp.startsWith('0100::') // Discard-only prefix 100::/64
  );
}

// Helper to identify private/reserved IP addresses
const isPrivateIp = (ip: string): boolean => {
  if (ip.includes('.')) {
    return isPrivateIPv4(ip);
  }
  if (ip.includes(':')) {
    return isPrivateIPv6(ip);
  }
  return false;
};

/**
 * Validates a given URL string to prevent Server-Side Request Forgery (SSRF) attacks.
 * It checks the protocol, known unsafe hostnames, and resolves DNS to ensure the
 * target IP is not a private, internal, or loopback address.
 */
export async function isSafeUrl(urlString: string): Promise<boolean> {
  try {
    const url = new URL(urlString);

    // Only allow HTTP and HTTPS
    if (url.protocol !== 'http:' && url.protocol !== 'https:') {
      return false;
    }

    let hostname = url.hostname.toLowerCase();

    // Strip trailing dot to prevent hostname trailing-dot bypasses (e.g. localhost.)
    if (hostname.endsWith('.')) {
      hostname = hostname.slice(0, -1);
    }

    // Quick checks for common internal/local hostnames
    if (hostname === 'localhost' || hostname.endsWith('.local') || hostname.endsWith('.internal')) {
      return false;
    }


    // If the hostname itself is an IP, check it
    if (isPrivateIp(hostname)) {
      return false;
    }

    // Resolve DNS to check the actual IP address
    const addresses = await dns.lookup(hostname, { all: true });
    for (const record of addresses) {
      if (isPrivateIp(record.address)) {
        return false;
      }
    }

    return true;
  } catch {
    // If URL parsing or DNS resolution fails, consider it unsafe
    return false;
  }
}

/**
 * A wrapper around native fetch that prevents SSRF by disabling automatic redirects
 * and manually validating each hop before making the request.
 */
export async function safeFetch(
  urlString: string,
  options: RequestInit = {},
  redirectCount = 0
): Promise<Response> {
  const maxRedirects = 5;
  if (redirectCount > maxRedirects) {
    throw new Error('Too many redirects');
  }

  // Validate the URL before fetching
  const isSafe = await isSafeUrl(urlString);
  if (!isSafe) {
    throw new Error('SSRF Blocked: URL is not safe.');
  }

  // Merge options and enforce manual redirect handling
  const fetchOptions: RequestInit = {
    ...options,
    redirect: 'manual',
  };

  const response = await fetch(urlString, fetchOptions);

  // If redirect (300-399) and location header is present
  if (
    response.status >= 300 &&
    response.status < 400 &&
    response.headers.has('location')
  ) {
    const location = response.headers.get('location')!;
    const originUrl = new URL(urlString);
    const redirectUrl = new URL(location, originUrl).toString();

    // Recursively safeFetch the redirect URL, checking safety at each hop
    return safeFetch(redirectUrl, options, redirectCount + 1);
  }

  return response;
}
