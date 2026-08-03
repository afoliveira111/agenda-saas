"use server"

import { headers } from "next/headers"
import { redirect } from "next/navigation"
import {
  createPasswordHash,
  createUserSession,
  verifyPassword,
} from "@/lib/auth"
import {
  checkLoginRateLimit,
  clearLoginRateLimit,
  recordLoginFailure,
} from "@/lib/login-rate-limit"
import { prisma } from "@/lib/prisma"

function normalizeText(value: FormDataEntryValue | null) {
  return String(value ?? "").trim()
}

function normalizeEmail(value: string) {
  return value.trim().toLowerCase()
}

function getSafeNextUrl(nextUrl: string) {
  if (!nextUrl) {
    return ""
  }

  if (!nextUrl.startsWith("/")) {
    return ""
  }

  if (nextUrl.startsWith("//")) {
    return ""
  }

  return nextUrl
}

function redirectWithError(error: string, nextUrl: string): never {
  const params = new URLSearchParams()
  const safeNextUrl = getSafeNextUrl(nextUrl)

  params.set("error", error)

  if (safeNextUrl) {
    params.set("next", safeNextUrl)
  }

  redirect(`/login?${params.toString()}`)
}

function getRoleHome(role: string) {
  if (role === "ADMIN") {
    return "/admin"
  }

  return "/dashboard"
}

function getRoleRedirect(role: string, nextUrl: string) {
  const safeNextUrl = getSafeNextUrl(nextUrl)

  if (!safeNextUrl || safeNextUrl === "/login") {
    return getRoleHome(role)
  }

  if (safeNextUrl.startsWith("/admin") && role !== "ADMIN") {
    return "/dashboard"
  }

  if (
    safeNextUrl.startsWith("/dashboard/tools") ||
    safeNextUrl.startsWith("/dashboard/businesses")
  ) {
    if (role !== "ADMIN") {
      return "/dashboard"
    }
  }

  return safeNextUrl
}

async function getClientIp() {
  const headerStore = await headers()

  const forwardedFor = headerStore.get("x-forwarded-for")
  const realIp = headerStore.get("x-real-ip")
  const vercelForwardedFor = headerStore.get("x-vercel-forwarded-for")

  return (
    forwardedFor?.split(",")[0]?.trim() ||
    vercelForwardedFor?.split(",")[0]?.trim() ||
    realIp?.trim() ||
    "local"
  )
}

async function getLoginRateLimitKey(email: string) {
  const ip = await getClientIp()
  const safeEmail = email || "empty-email"

  return `${ip}:${safeEmail}`
}

function failLogin(key: string, error: string, nextUrl: string): never {
  recordLoginFailure(key)
  redirectWithError(error, nextUrl)
}

export async function loginAction(formData: FormData) {
  const email = normalizeEmail(normalizeText(formData.get("email")))
  const password = normalizeText(formData.get("password"))
  const nextUrl = normalizeText(formData.get("next"))

  const rateLimitKey = await getLoginRateLimitKey(email)
  const rateLimit = checkLoginRateLimit(rateLimitKey)

  if (!rateLimit.allowed) {
    redirectWithError("rate-limit", nextUrl)
  }

  if (!email || !email.includes("@")) {
    failLogin(rateLimitKey, "email", nextUrl)
  }

  if (password.length < 4) {
    failLogin(rateLimitKey, "invalid", nextUrl)
  }

  const usersCount = await prisma.user.count()

  let user = await prisma.user.findUnique({
    where: {
      email,
    },
  })

  if (!user && usersCount === 0) {
    const bootstrapPassword = process.env.DASHBOARD_ADMIN_PASSWORD

    if (!bootstrapPassword) {
      redirectWithError("config", nextUrl)
    }

    if (password !== bootstrapPassword) {
      failLogin(rateLimitKey, "invalid", nextUrl)
    }

    user = await prisma.user.create({
      data: {
        name: email.split("@")[0] || "Administrador",
        email,
        passwordHash: createPasswordHash(password),
        role: "ADMIN",
      },
    })
  }

  if (!user) {
    failLogin(rateLimitKey, "invalid", nextUrl)
  }

  const passwordIsValid = verifyPassword(password, user.passwordHash)

  if (!passwordIsValid) {
    failLogin(rateLimitKey, "invalid", nextUrl)
  }

  clearLoginRateLimit(rateLimitKey)

  await prisma.session.deleteMany({
    where: {
      userId: user.id,
      expiresAt: {
        lt: new Date(),
      },
    },
  })

  await createUserSession(user.id)

  redirect(getRoleRedirect(user.role, nextUrl))
}
