"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { normalizeBusinessTheme } from "@/lib/business-theme"
import { getCurrentBusinessSlug } from "@/lib/current-business"
import { prisma } from "@/lib/prisma"

function redirectWithError(message: string): never {
  redirect(`/dashboard/settings/business?error=${encodeURIComponent(message)}`)
}

function redirectWithSuccess(message: string): never {
  redirect(`/dashboard/settings/business?success=${encodeURIComponent(message)}`)
}

function normalizeText(value: FormDataEntryValue | null) {
  return String(value ?? "").trim()
}

function normalizePhone(phone: string) {
  return phone.replace(/\D/g, "")
}

function isValidPhone(phone: string) {
  if (!phone.trim()) return true

  const normalizedPhone = normalizePhone(phone)

  return /^\d{7,15}$/.test(normalizedPhone)
}

function isValidEmail(email: string) {
  if (!email) return true

  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

export async function updateBusinessSettingsAction(formData: FormData) {
  const name = normalizeText(formData.get("name"))
  const phoneRaw = normalizeText(formData.get("phone"))
  const emailRaw = normalizeText(formData.get("email"))
  const notificationEmailRaw = normalizeText(formData.get("notificationEmail"))
  const address = normalizeText(formData.get("address"))
  const description = normalizeText(formData.get("description"))
  const theme = normalizeBusinessTheme(normalizeText(formData.get("theme")))

  const phone = phoneRaw ? normalizePhone(phoneRaw) : ""
  const email = emailRaw.toLowerCase()
  const notificationEmail = notificationEmailRaw.toLowerCase()

  if (name.length < 2 || name.length > 80) {
    redirectWithError("O nome do negócio deve ter entre 2 e 80 caracteres.")
  }

  if (!isValidPhone(phoneRaw)) {
    redirectWithError("Informe um telefone válido. Exemplo: +351 912 345 678.")
  }

  if (!isValidEmail(email)) {
    redirectWithError("Informe um e-mail público válido.")
  }

  if (!isValidEmail(notificationEmail)) {
    redirectWithError("Informe um e-mail de notificação válido.")
  }

  const business = await prisma.business.findUnique({
    where: {
      slug: await getCurrentBusinessSlug(),
    },
  })

  if (!business) {
    redirectWithError("Negócio não encontrado. Selecione outro negócio.")
  }

  await prisma.business.update({
    where: {
      id: business.id,
    },
    data: {
      name,
      phone: phone || null,
      email: email || null,
      notificationEmail: notificationEmail || null,
      address: address || null,
      description: description || null,
      theme,
    },
  })

  revalidatePath("/dashboard")
  revalidatePath("/dashboard/bookings")
  revalidatePath("/dashboard/customers")
  revalidatePath("/dashboard/services")
  revalidatePath("/dashboard/settings/hours")
  revalidatePath("/dashboard/blocked-days")
  revalidatePath("/dashboard/settings/business")
  revalidatePath("/admin")
  revalidatePath(`/book/${business.slug}`)

  redirectWithSuccess("Configurações do negócio atualizadas com sucesso.")
}