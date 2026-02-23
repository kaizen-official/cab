const ApiError = require("../utils/ApiError");

class RateLimiter {
  constructor() {
    this._buckets = new Map();
    this._cleanupInterval = setInterval(() => this._cleanup(), 60 * 1000);
  }

  middleware(windowMs = 15 * 60 * 1000, maxRequests = 100) {
    return (req, _res, next) => {
      const key = req.ip || req.connection.remoteAddress;
      const now = Date.now();

      let bucket = this._buckets.get(key);
      if (!bucket || now - bucket.windowStart > windowMs) {
        bucket = { windowStart: now, count: 0 };
        this._buckets.set(key, bucket);
      }

      bucket.count++;

      if (bucket.count > maxRequests) {
        throw ApiError.tooMany("Rate limit exceeded. Try again later.");
      }

      next();
    };
  }

  strict(windowMs = 60 * 1000, maxRequests = 5) {
    return this.middleware(windowMs, maxRequests);
  }

  _cleanup() {
    const now = Date.now();
    for (const [key, bucket] of this._buckets) {
      if (now - bucket.windowStart > 30 * 60 * 1000) {
        this._buckets.delete(key);
      }
    }
  }

  destroy() {
    clearInterval(this._cleanupInterval);
    this._buckets.clear();
  }
}

const rateLimiter = new RateLimiter();

module.exports = rateLimiter;
