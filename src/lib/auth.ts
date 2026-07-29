import { createHash, randomBytes, scryptSync, timingSafeEqual } from "crypto"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"

export const SESSION_COOKIE_NAME = "agenda_saas_session"
const OLD_SESSION_COOKIE_NAME = "agenda_saas_dashboard_session"

const SESSION_DAYS = 7

function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex")
}

export function createPasswordHash(password: string) {
  const salt = randomBytes(16).toString("hex")
  const hash = scryptSync(password, salt, 64).toString("hex")

  return `scrypt:${salt}:${hash}`
}

export function verifyPassword(password: string, storedHash: string) {
  const [algorithm, salt, hash] = storedHash.split(":")

  if (algorithm !== "scrypt" || !salt || !hash) {
    return false
  }

  const candidateHash = scryptSync(password, salt, 64)
  const storedBuffer = Buffer.from(hash, "hex")

  if (candidateHash.length !== storedBuffer.length) {
    return false
  }

  return timingSafeEqual(candidateHash, storedBuffer)
}

export async function createUserSession(userId: string) {
  const token = randomBytes(32).toString("hex")
  const tokenHash = hashToken(token)

  const expiresAt = new Date()
  expiresAt.setDate(expiresAt.getDate() + SESSION_DAYS)

  await prisma.session.create({
    data: {
      tokenHash,
      userId,
      expiresAt,
    },
  })

  const cookieStore = await cookies()

  cookieStore.set({
    name: SESSION_COOKIE_NAME,
    value: token,
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * SESSION_DAYS,
    secure: process.env.NODE_ENV === "production",
  })

  cookieStore.set({
    name: OLD_SESSION_COOKIE_NAME,
    value: "",
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 0,
    secure: process.env.NODE_ENV === "production",
  })
}

export async function clearUserSession() {
  const cookieStore = await cookies()
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value

  if (token) {
    await prisma.session
      .delete({
        where: {
          tokenHash: hashToken(token),
        },
      })
      .catch(() => null)
  }

  cookieStore.set({
    name: SESSION_COOKIE_NAME,
    value: "",
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 0,
    secure: process.env.NODE_ENV === "production",
  })

  cookieStore.set({
    name: OLD_SESSION_COOKIE_NAME,
    value: "",
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 0,
    secure: process.env.NODE_ENV === "production",
  })
}

export async function getCurrentSession() {
  const cookieStore = await cookies()
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value

  if (!token) {
    return null
  }

  const session = await prisma.session.findUnique({
    where: {
      tokenHash: hashToken(token),
    },
    include: {
      user: {
        include: {
          business: true,
        },
      },
    },
  })

  if (!session) {
    return null
  }

  if (session.expiresAt < new Date()) {
    await prisma.session
      .delete({
        where: {
          id: session.id,
        },
      })
      .catch(() => null)

    return null
  }

  return session
}

export async function requireSession() {
  const session = await getCurrentSession()

  if (!session) {
    redirect("/login")
  }

  return session
}

export async function requireAdminSession() {
  const session = await requireSession()

  if (session.user.role !== "ADMIN") {
    redirect("/dashboard")
  }

  return session
}

export async function getSessionRedirectPath() {
  const session = await getCurrentSession()

  if (!session) {
    return null
  }

  if (session.user.role === "ADMIN") {
    return "/admin"
  }

  return "/dashboard"
}