type PublicBookingRateLimitEntry = {
  count: number
  resetAt: number
  blockedUntil: number
}

const PUBLIC_BOOKING_RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000
const PUBLIC_BOOKING_RATE_LIMIT_BLOCK_MS = 15 * 60 * 1000
const PUBLIC_BOOKING_RATE_LIMIT_MAX_ATTEMPTS = 8

const attempts = new Map<string, PublicBookingRateLimitEntry>()

function now() {
  return Date.now()
}

function getFreshEntry(key: string) {
  const currentTime = now()
  const entry = attempts.get(key)

  if (!entry || entry.resetAt <= currentTime) {
    const freshEntry = {
      count: 0,
      resetAt: currentTime + PUBLIC_BOOKING_RATE_LIMIT_WINDOW_MS,
      blockedUntil: 0,
    }

    attempts.set(key, freshEntry)

    return freshEntry
  }

  return entry
}

export function checkPublicBookingRateLimit(key: string) {
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

export function recordPublicBookingAttempt(key: string) {
  const entry = getFreshEntry(key)

  entry.count += 1

  if (entry.count >= PUBLIC_BOOKING_RATE_LIMIT_MAX_ATTEMPTS) {
    entry.blockedUntil = now() + PUBLIC_BOOKING_RATE_LIMIT_BLOCK_MS
  }

  attempts.set(key, entry)
}
