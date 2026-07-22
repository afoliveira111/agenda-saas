"use server"

import { cookies } from "next/headers"
import { redirect } from "next/navigation"

const COOKIE_NAME = "agenda_saas_dashboard_session"

function getSafeNextUrl(nextUrl: string) {
  if (!nextUrl.startsWith("/")) {
    return "/dashboard"
  }

  if (nextUrl.startsWith("//")) {
    return "/dashboard"
  }

  return nextUrl
}

export async function loginAction(formData: FormData) {
  const password = String(formData.get("password") ?? "")
  const nextUrl = String(formData.get("next") ?? "/dashboard")

  const expectedPassword = process.env.DASHBOARD_ADMIN_PASSWORD
  const sessionToken = process.env.DASHBOARD_SESSION_TOKEN

  if (!expectedPassword || !sessionToken) {
    redirect("/login?error=config")
  }

  if (password !== expectedPassword) {
    const params = new URLSearchParams()
    params.set("error", "invalid")
    params.set("next", getSafeNextUrl(nextUrl))

    redirect(`/login?${params.toString()}`)
  }

  const cookieStore = await cookies()

  cookieStore.set({
    name: COOKIE_NAME,
    value: sessionToken,
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
    secure: process.env.NODE_ENV === "production",
  })

  redirect(getSafeNextUrl(nextUrl))
}

export async function logoutAction() {
  const cookieStore = await cookies()

  cookieStore.set({
    name: COOKIE_NAME,
    value: "",
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 0,
    secure: process.env.NODE_ENV === "production",
  })

  redirect("/login")
}