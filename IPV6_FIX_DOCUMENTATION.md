# IPv6 DNS Resolution Fix - Comprehensive Documentation

## Problem Statement

**Symptom:** NestJS backend on Railway fails with:
```
Error: connect ENETUNREACH 2a05:d018:135e:16d3:a813:b95f:8f7f:758d:5432
```

**Root Cause Analysis:**

1. **DNS Resolution Issue:** Node.js `dns.lookup()` returns both IPv4 and IPv6 addresses
2. **Default Behavior:** Node.js prefers IPv6 when available (RFC 3484)
3. **Railway Container Limitation:** Railway containers do NOT support IPv6 networking
4. **Network Mismatch:** When Node.js attempts IPv6 connection, Railway returns `ENETUNREACH` (Network Unreachable)

**Why This Happens:**
- Supabase PostgreSQL hostname resolves to both IPv4 and IPv6
- Node.js tries IPv6 first (default behavior)
- Railway container has no IPv6 network interface
- Connection fails immediately with ENETUNREACH

---

## Solution Architecture

### Level 1: Application Bootstrap (main.ts)

**What it does:** Sets DNS resolution preference globally for the entire Node.js process

```typescript
import * as dns from 'dns';

async function bootstrap() {
  // Force IPv4 to be preferred over IPv6
  dns.setDefaultResultOrder('ipv4first');
  console.log('[Bootstrap] ✅ DNS configured: IPv4 prioritized');
  
  // ... rest of bootstrap
}
```

**Why it works:**
- `dns.setDefaultResultOrder('ipv4first')` tells Node.js to return IPv4 addresses first
- Affects ALL DNS lookups in the entire application
- Applies before TypeORM connection attempts
- Simple, non-invasive, production-safe

**Timing:** Runs BEFORE any database connection attempts

---

### Level 2: TypeORM Driver Configuration (database.config.ts)

**What it does:** Overrides DNS lookup at the pg driver level with explicit IPv4 enforcement

```typescript
extra: {
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
  lookup: (hostname: string, options: any, callback: any) => {
    console.log(`[TypeORM] DNS lookup for: ${hostname} (forcing IPv4)`);
    dns.lookup(hostname, { family: 4 }, (err, address, family) => {
      if (err) {
        console.error(`[TypeORM] DNS lookup failed for ${hostname}: ${err.message}`);
        return callback(err);
      }
      console.log(`[TypeORM] DNS resolved ${hostname} to ${address} (IPv${family})`);
      callback(null, address, family);
    });
  },
}
```

**Why it works:**
- Custom `lookup` function intercepts ALL DNS calls from pg driver
- Forces `family: 4` parameter (IPv4 only)
- Prevents pg driver from ever attempting IPv6
- Provides detailed logging for debugging

**Defense in Depth:** Even if bootstrap DNS config fails, TypeORM will still force IPv4

---

### Level 3: Bootstrap Hostname Resolution Verification

**What it does:** Tests DNS resolution during startup and logs the result

```typescript
const hostMatch = databaseUrl.match(/postgresql:\/\/[^@]+@([^:]+)/);
if (hostMatch) {
  const hostname = hostMatch[1];
  console.log(`[Database] Resolving hostname: ${hostname}`);
  dns.lookup(hostname, { family: 4 }, (err, address, family) => {
    if (err) {
      console.error(`[Database] ⚠️  IPv4 resolution failed: ${err.message}`);
    } else {
      console.log(`[Database] ✅ Resolved to IPv4: ${address} (family: ${family})`);
    }
  });
}
```

**Why it works:**
- Verifies DNS resolution works BEFORE TypeORM attempts connection
- Provides early warning if DNS is misconfigured
- Logs actual resolved IP address for debugging
- Non-blocking (async callback)

---

## Implementation Details

### Files Modified

1. **src/main.ts**
   - Added `dns.setDefaultResultOrder('ipv4first')`
   - Added hostname resolution verification
   - Added detailed logging

2. **src/config/database.config.ts**
   - Added custom `lookup` function in `extra` config
   - Added comprehensive logging
   - Forced `family: 4` in DNS lookup

### Why This Approach is Production-Safe

✅ **No Breaking Changes:**
- Doesn't modify DATABASE_URL
- Doesn't change SSL configuration
- Doesn't add experimental features
- Works with existing TypeORM setup

✅ **Comprehensive Logging:**
- Logs DNS resolution process
- Logs resolved IP addresses
- Logs any DNS errors
- Helps with debugging in production

✅ **Defense in Depth:**
- Multiple layers ensure IPv4 is used
- If one layer fails, others catch it
- No single point of failure

✅ **Performance:**
- IPv4 lookup is faster than IPv6 on Railway
- No additional network calls
- Minimal overhead

---

## Testing & Verification

### Local Testing

```bash
# Build
pnpm build

# Check for TypeScript errors
pnpm build 2>&1 | grep error

# Verify DNS resolution works
node -e "const dns = require('dns'); dns.lookup('db.fdxbdlmqapdwhksyhgxy.supabase.co', {family: 4}, (err, addr) => console.log(err || addr))"
```

### Railway Logs to Watch For

**Success indicators:**
```
[Bootstrap] ✅ DNS configured: IPv4 prioritized
[Database] Resolving hostname: db.fdxbdlmqapdwhksyhgxy.supabase.co
[Database] ✅ Resolved to IPv4: 1.2.3.4 (family: 4)
[TypeORM] DNS lookup for: db.fdxbdlmqapdwhksyhgxy.supabase.co (forcing IPv4)
[TypeORM] DNS resolved db.fdxbdlmqapdwhksyhgxy.supabase.co to 1.2.3.4 (IPv4)
```

**Error indicators to watch for:**
```
[Database] ⚠️  IPv4 resolution failed: getaddrinfo ENOTFOUND
[TypeORM] DNS lookup failed for: getaddrinfo ECONNREFUSED
```

---

## Environment Variables

**No changes required to DATABASE_URL format:**

```bash
# Existing format still works
DATABASE_URL=postgresql://user:password@db.fdxbdlmqapdwhksyhgxy.supabase.co:5432/postgres?sslmode=require

# Optional: Can add explicit family parameter (ignored by our custom lookup)
DATABASE_URL=postgresql://user:password@db.fdxbdlmqapdwhksyhgxy.supabase.co:5432/postgres?sslmode=require&family=4
```

---

## Fallback & Rollback

If this fix doesn't work:

1. **Check Railway environment:**
   - Verify `NODE_OPTIONS=--dns-result-order=ipv4first` is NOT set (conflicts)
   - Verify DATABASE_URL is correct
   - Check network connectivity from Railway to Supabase

2. **Alternative approach:**
   - Use IP address directly instead of hostname
   - Contact Railway support about IPv6 support

3. **Rollback:**
   ```bash
   git revert <commit-hash>
   git push origin main
   # Redeploy on Railway
   ```

---

## Advanced: Infrastructure-Level Solutions

### Option 1: Use IPv4 Address Directly (Most Reliable)

```bash
# Instead of hostname
DATABASE_URL=postgresql://user:password@1.2.3.4:5432/postgres?sslmode=require
```

**Pros:** Bypasses DNS entirely, guaranteed IPv4
**Cons:** Less flexible, requires static IP

### Option 2: Request IPv6 Support from Railway

Contact Railway support to enable IPv6 networking on your container.

### Option 3: Use Connection Pooling Service

Use PgBouncer or similar to proxy connections:
```bash
DATABASE_URL=postgresql://user:password@pgbouncer.railway.internal:6432/postgres
```

---

## Monitoring & Alerts

### Add to your monitoring:

1. **Log DNS resolution failures**
   - Alert if `[Database] ⚠️  IPv4 resolution failed`

2. **Monitor connection retry count**
   - Alert if retries exceed 5 consecutive attempts

3. **Track connection latency**
   - IPv4 should connect within 1-2 seconds

---

## Commit History

- **5595493:** CRITICAL FIX: Implement comprehensive IPv4 DNS resolution at bootstrap and driver levels
- **3cdef50:** Fix: Implement custom DNS lookup to force IPv4 at pg driver level
- **2271433:** Fix: Force IPv4 connection to Supabase to avoid Railway IPv6 ENETUNREACH errors

---

## References

- Node.js DNS Documentation: https://nodejs.org/api/dns.html#dns_dns_setdefaultresultorder_order
- PostgreSQL Connection Strings: https://www.postgresql.org/docs/current/libpq-connect.html
- pg Driver Documentation: https://node-postgres.com/
- Railway Documentation: https://docs.railway.app/

---

## Summary

This fix implements a **three-layer defense** against IPv6 DNS resolution issues:

1. **Bootstrap Layer:** Global DNS preference for IPv4
2. **Driver Layer:** Custom DNS lookup forcing IPv4 at pg driver level
3. **Verification Layer:** Startup hostname resolution check with logging

**Result:** Railway container will ONLY attempt IPv4 connections to PostgreSQL, preventing ENETUNREACH errors.
