import * as dns from 'dns/promises';

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

    const hostname = url.hostname;

    // Quick checks for common internal/local hostnames
    if (hostname === 'localhost' || hostname.endsWith('.local') || hostname.endsWith('.internal')) {
      return false;
    }

    // Helper to identify private IP addresses
    const isPrivateIp = (ip: string) => {
      // IPv4
      if (ip.includes('.')) {
        const parts = ip.split('.').map(p => parseInt(p, 10));
        if (parts.length === 4) {
          const [p1, p2] = parts;
          return (
            p1 === 10 || // 10.0.0.0/8
            (p1 === 172 && p2 >= 16 && p2 <= 31) || // 172.16.0.0/12
            (p1 === 192 && p2 === 168) || // 192.168.0.0/16
            p1 === 127 || // 127.0.0.0/8 (Loopback)
            p1 === 0 || // 0.0.0.0/8
            (p1 === 169 && p2 === 254) // 169.254.0.0/16 (Link-local, often AWS metadata)
          );
        }
      }
      // IPv6
      if (ip.includes(':')) {
        const lowerIp = ip.toLowerCase();

        // Handle IPv4-mapped IPv6 addresses (e.g., ::ffff:127.0.0.1)
        if (lowerIp.startsWith('::ffff:')) {
          const ipv4Part = lowerIp.substring(7);
          return isPrivateIp(ipv4Part);
        }

        return (
          lowerIp === '::1' || // Loopback
          lowerIp.startsWith('fc') || // fc00::/7 (Unique local address)
          lowerIp.startsWith('fd') ||
          lowerIp.startsWith('fe8') || // fe80::/10 (Link-local address)
          lowerIp.startsWith('fe9') ||
          lowerIp.startsWith('fea') ||
          lowerIp.startsWith('feb')
        );
      }
      return false;
    };

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
