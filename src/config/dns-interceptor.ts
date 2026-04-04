/**
 * DNS Interceptor Module
 * 
 * Intercepts ALL DNS lookups at the Node.js module level to force IPv4.
 * This is the ONLY reliable way to prevent pg driver from attempting IPv6 on Railway.
 * 
 * Must be imported FIRST in main.ts before any other modules.
 */

import * as dns from 'dns';

const originalLookup = dns.lookup;
const originalLookupService = dns.lookupService;

/**
 * Override dns.lookup to force IPv4
 * This intercepts ALL DNS lookups in the entire application
 */
(dns as any).lookup = function(
  hostname: string,
  options: any,
  callback: any
): any {
  // Handle both callback and promise-based usage
  if (typeof options === 'function') {
    callback = options;
    options = {};
  }

  // Force IPv4 by setting family: 4
  const modifiedOptions = {
    ...options,
    family: 4,
  };

  console.log(`[DNS-Interceptor] Intercepted lookup for: ${hostname} (forcing IPv4)`);

  // Call original with forced IPv4
  return originalLookup.call(dns, hostname, modifiedOptions, (err: any, address: string, family: number) => {
    if (err) {
      console.error(`[DNS-Interceptor] Lookup failed for ${hostname}: ${err.code}`);
      return callback(err);
    }
    console.log(`[DNS-Interceptor] ✅ Resolved ${hostname} → ${address} (IPv${family})`);
    callback(null, address, family);
  });
};

/**
 * Override dns.lookupService to maintain consistency
 */
(dns as any).lookupService = function(
  address: string,
  port: number,
  callback: any
): any {
  console.log(`[DNS-Interceptor] Intercepted lookupService for: ${address}:${port}`);
  return originalLookupService.call(dns, address, port, callback);
};

console.log('[DNS-Interceptor] ✅ Loaded: All DNS lookups will be forced to IPv4');
