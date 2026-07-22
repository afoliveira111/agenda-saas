import { cookies } from "next/headers"

const DASHBOARD_BUSINESS_COOKIE = "agenda_saas_dashboard_business_slug"

function getDefaultBusinessSlug() {
  return process.env.DASHBOARD_BUSINESS_SLUG?.trim() || "demo"
}

export async function getCurrentBusinessSlug() {
  const cookieStore = await cookies()
  const slugFromCookie = cookieStore
    .get(DASHBOARD_BUSINESS_COOKIE)
    ?.value?.trim()

  return slugFromCookie || getDefaultBusinessSlug()
}

export async function setCurrentBusinessSlug(slug: string) {
  const cookieStore = await cookies()

  cookieStore.set({
    name: DASHBOARD_BUSINESS_COOKIE,
    value: slug,
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
    secure: process.env.NODE_ENV === "production",
  })
}