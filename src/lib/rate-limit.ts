/**
 * Simple in-memory rate limiter for API routes.
 * Not suitable for distributed deployments — use Redis-based solutions for production.
 */

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

const store = new Map<string, RateLimitEntry>();

// Cleanup stale entries periodically
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of store) {
    if (now > entry.resetTime) {
      store.delete(key);
    }
  }
}, 60000);

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetInMs: number;
}

/**
 * Check rate limit for a given identifier.
 * @param identifier - Unique key (e.g., IP address or "global")
 * @param maxRequests - Max requests allowed in the window
 * @param windowMs - Time window in milliseconds
 */
export function checkRateLimit(
  identifier: string,
  maxRequests: number = 30,
  windowMs: number = 60000
): RateLimitResult {
  const now = Date.now();
  const entry = store.get(identifier);

  if (!entry || now > entry.resetTime) {
    store.set(identifier, { count: 1, resetTime: now + windowMs });
    return { allowed: true, remaining: maxRequests - 1, resetInMs: windowMs };
  }

  entry.count++;
  const remaining = Math.max(0, maxRequests - entry.count);
  const resetInMs = entry.resetTime - now;

  if (entry.count > maxRequests) {
    return { allowed: false, remaining: 0, resetInMs };
  }

  return { allowed: true, remaining, resetInMs };
}
