type LoginRateLimitEntry = {
  count: number
  resetAt: number
  blockedUntil: number
}

const LOGIN_RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000
const LOGIN_RATE_LIMIT_BLOCK_MS = 15 * 60 * 1000
const LOGIN_RATE_LIMIT_MAX_ATTEMPTS = 5

const attempts = new Map<string, LoginRateLimitEntry>()

function now() {
  return Date.now()
}

function getFreshEntry(key: string) {
  const currentTime = now()
  const entry = attempts.get(key)

  if (!entry || entry.resetAt <= currentTime) {
    const freshEntry = {
      count: 0,
      resetAt: currentTime + LOGIN_RATE_LIMIT_WINDOW_MS,
      blockedUntil: 0,
    }

    attempts.set(key, freshEntry)

    return freshEntry
  }

  return entry
}

export function checkLoginRateLimit(key: string) {
  const entry = getFreshEntry(key)
  const currentTime = now()

  if (entry.blockedUntil > currentTime) {
    return {
      allowed: false,
      retryAfterSeconds: Math.ceil((entry.blockedUntil - currentTime) / 1000),
    }
  }

  return {
    allowed: true,
    retryAfterSeconds: 0,
  }
}

export function recordLoginFailure(key: string) {
  const entry = getFreshEntry(key)

  entry.count += 1

  if (entry.count >= LOGIN_RATE_LIMIT_MAX_ATTEMPTS) {
    entry.blockedUntil = now() + LOGIN_RATE_LIMIT_BLOCK_MS
  }

  attempts.set(key, entry)
}

export function clearLoginRateLimit(key: string) {
  attempts.delete(key)
}
