import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.REDIS_URL,
  token: process.env.REDIS_TOKEN,
});

// ── Limiter instances ─────────────────────────────────────────────────────────
// Auth routes — very strict: 10 attempts per 15 min
const authRatelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(10, '15 m'),
  prefix: 'cv_genie:auth',
});

// Write mutations (POST / PUT / PATCH / DELETE) — moderate: 30 per minute
const writeRatelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(30, '1 m'),
  prefix: 'cv_genie:write',
});

// Read endpoints (GET) — lenient: 200 per minute
const readRatelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(200, '1 m'),
  prefix: 'cv_genie:read',
});

// ── Shared helper ─────────────────────────────────────────────────────────────
const applyLimit = async (limiter, identifier, res, next) => {
  try {
    const { success, limit, remaining, reset } = await limiter.limit(identifier);
    res.setHeader('X-RateLimit-Limit', limit);
    res.setHeader('X-RateLimit-Remaining', remaining);
    res.setHeader('X-RateLimit-Reset', new Date(reset).toISOString());

    if (!success) {
      return res.status(429).json({
        error: 'Too many requests. Please wait a moment and try again.',
      });
    }
    next();
  } catch (err) {
    // If Redis is unavailable, fail open so the app keeps running
    console.error('[RateLimiter] Redis error — failing open:', err.message);
    next();
  }
};

// ── Build the identifier: ip + HTTP method + path ─────────────────────────────
// This means /api/projects GET and /api/projects POST each have their own bucket
// per client IP, giving fine-grained per-endpoint control.
const buildIdentifier = (req) => {
  const ip = req.ip
    || (req.headers['x-forwarded-for'] || '').split(',')[0].trim()
    || 'unknown';
  return `${ip}:${req.method}:${req.path}`;
};

// ── Exported middleware ───────────────────────────────────────────────────────

/** Strict limiter for /auth/login and /auth/signup (10 attempts / 15 min / endpoint / IP) */
export const authLimiter = (req, res, next) =>
  applyLimit(authRatelimit, buildIdentifier(req), res, next);

/**
 * Smart general limiter for all /api/* routes.
 * GETs get 200 req/min; writes (POST/PUT/PATCH/DELETE) get 30 req/min.
 * Both are keyed per IP + method + path so each endpoint has its own bucket.
 */
export const apiLimiter = (req, res, next) => {
  const isWrite = ['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method);
  const limiter = isWrite ? writeRatelimit : readRatelimit;
  return applyLimit(limiter, buildIdentifier(req), res, next);
};
