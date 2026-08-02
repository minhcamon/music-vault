interface RateLimitEntry {
  timestamps: number[];
}

class InMemoryRateLimiter {
  private store = new Map<string, RateLimitEntry>();
  private cleanupIntervalMs = 60000; // Dọn dẹp mỗi 1 phút
  private lastCleanup = Date.now();

  private cleanup(windowMs: number) {
    const now = Date.now();
    if (now - this.lastCleanup < this.cleanupIntervalMs) return;
    this.lastCleanup = now;

    const threshold = now - windowMs;
    for (const [ip, entry] of this.store.entries()) {
      entry.timestamps = entry.timestamps.filter((ts) => ts > threshold);
      if (entry.timestamps.length === 0) {
        this.store.delete(ip);
      }
    }
  }

  public check(
    ip: string,
    limit: number = 60,
    windowMs: number = 60000
  ): { allowed: boolean; limit: number; remaining: number; resetSeconds: number } {
    const now = Date.now();
    this.cleanup(windowMs);

    const windowStart = now - windowMs;
    let entry = this.store.get(ip);
    if (!entry) {
      entry = { timestamps: [] };
      this.store.set(ip, entry);
    }

    // Lọc bỏ các timestamp ngoài window
    entry.timestamps = entry.timestamps.filter((ts) => ts > windowStart);

    if (entry.timestamps.length >= limit) {
      const oldestInWindow = entry.timestamps[0];
      const resetMs = oldestInWindow + windowMs - now;
      return {
        allowed: false,
        limit,
        remaining: 0,
        resetSeconds: Math.ceil(resetMs / 1000),
      };
    }

    entry.timestamps.push(now);
    return {
      allowed: true,
      limit,
      remaining: limit - entry.timestamps.length,
      resetSeconds: Math.ceil(windowMs / 1000),
    };
  }
}

export const rateLimiter = new InMemoryRateLimiter();

export function getClientIp(req: any): string {
  const forwarded = req.headers?.['x-forwarded-for'];
  if (forwarded) {
    const ip = Array.isArray(forwarded) ? forwarded[0] : forwarded.split(',')[0];
    if (ip) return ip.trim();
  }
  return (
    req.headers?.['x-real-ip'] ||
    req.socket?.remoteAddress ||
    req.connection?.remoteAddress ||
    '127.0.0.1'
  );
}
