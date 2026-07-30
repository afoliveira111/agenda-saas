"use server"

import { revalidatePath } from "next/cache"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { normalizeAdminTheme } from "@/lib/admin-theme"
import { normalizeBusinessTheme } from "@/lib/business-theme"
import { setCurrentBusinessSlug } from "@/lib/current-business"
import { prisma } from "@/lib/prisma"

const ADMIN_THEME_COOKIE = "agenda_saas_admin_theme"

function normalizeText(value: FormDataEntryValue | null) {
  return String(value ?? "").trim()
}

function getSafeRedirectPath(value: FormDataEntryValue | null) {
  const redirectTo = normalizeText(value)

  if (
    redirectTo === "/admin" ||
    redirectTo.startsWith("/admin/") ||
    redirectTo === "/dashboard/businesses" ||
    redirectTo.startsWith("/dashboard/businesses/") ||
    redirectTo === "/dashboard/tools" ||
    redirectTo.startsWith("/dashboard/tools/")
  ) {
    return redirectTo
  }

  return "/admin"
}

function redirectWithSuccess(message: string): never {
  redirect(`/admin?success=${encodeURIComponent(message)}`)
}

function redirectWithError(message: string): never {
  redirect(`/admin?error=${encodeURIComponent(message)}`)
}

function redirectBackWithSuccess({
  redirectTo,
  message,
}: {
  redirectTo: string
  message: string
}): never {
  const separator = redirectTo.includes("?") ? "&" : "?"

  redirect(`${redirectTo}${separator}success=${encodeURIComponent(message)}`)
}

export async function selectAdminBusinessAction(formData: FormData) {
  const slug = normalizeText(formData.get("slug"))

  if (!slug) {
    redirectWithError("Negócio não informado.")
  }

  const business = await prisma.business.findUnique({
    where: {
      slug,
    },
  })

  if (!business) {
    redirectWithError("Negócio não encontrado.")
  }

  await setCurrentBusinessSlug(business.slug)

  revalidatePath("/admin")
  revalidatePath("/dashboard")
  revalidatePath("/dashboard/bookings")
  revalidatePath("/dashboard/customers")
  revalidatePath("/dashboard/services")
  revalidatePath("/dashboard/settings/hours")
  revalidatePath("/dashboard/blocked-days")
  revalidatePath("/dashboard/settings/business")

  redirectWithSuccess(`Negócio selecionado: ${business.name}.`)
}

export async function updateAdminBusinessThemeAction(formData: FormData) {
  const businessId = normalizeText(formData.get("businessId"))
  const theme = normalizeBusinessTheme(normalizeText(formData.get("theme")))

  if (!businessId) {
    redirectWithError("Negócio não informado.")
  }

  const business = await prisma.business.findUnique({
    where: {
      id: businessId,
    },
  })

  if (!business) {
    redirectWithError("Negócio não encontrado.")
  }

  await prisma.business.update({
    where: {
      id: business.id,
    },
    data: {
      theme,
    },
  })

  revalidatePath("/admin")
  revalidatePath("/dashboard")
  revalidatePath("/dashboard/bookings")
  revalidatePath("/dashboard/customers")
  revalidatePath("/dashboard/services")
  revalidatePath("/dashboard/settings/hours")
  revalidatePath("/dashboard/blocked-days")
  revalidatePath("/dashboard/settings/business")
  revalidatePath(`/book/${business.slug}`)
  revalidatePath(`/book/${business.slug}/success`)

  redirectWithSuccess(`Tema atualizado para ${business.name}.`)
}

export async function updateAdminThemeAction(formData: FormData) {
  const adminTheme = normalizeAdminTheme(normalizeText(formData.get("adminTheme")))
  const redirectTo = getSafeRedirectPath(formData.get("redirectTo"))

  const cookieStore = await cookies()

  cookieStore.set({
    name: ADMIN_THEME_COOKIE,
    value: adminTheme,
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
    secure: process.env.NODE_ENV === "production",
  })

  revalidatePath("/admin")
  revalidatePath("/admin/users")
  revalidatePath("/dashboard/businesses")
  revalidatePath("/dashboard/tools")

  redirectBackWithSuccess({
    redirectTo,
    message: "Tema do admin atualizado com sucesso.",
  })
}