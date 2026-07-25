"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { getCurrentBusinessSlug } from "@/lib/current-business"
import { durationOptions } from "@/lib/format-duration"

function redirectWithError(message: string): never {
  redirect(`/dashboard/services?error=${encodeURIComponent(message)}`)
}

function redirectWithSuccess(message: string): never {
  redirect(`/dashboard/services?success=${encodeURIComponent(message)}`)
}

function normalizeText(value: FormDataEntryValue | null) {
  return String(value ?? "").trim()
}

function parsePriceToCents(value: string) {
  const normalized = value.replace(",", ".").trim()
  const numberValue = Number(normalized)

  if (Number.isNaN(numberValue)) {
    return null
  }

  if (numberValue < 0) {
    return null
  }

  return Math.round(numberValue * 100)
}

function parseDuration(value: string) {
  const duration = Number(value)
  const allowedDurations = durationOptions.map((option) => option.value)

  if (!Number.isInteger(duration)) {
    return null
  }

  if (!allowedDurations.includes(duration)) {
    return null
  }

  return duration
}

async function getCurrentBusiness() {
  return prisma.business.findUnique({
    where: {
      slug: await getCurrentBusinessSlug(),
    },
  })
}

export async function createServiceAction(formData: FormData) {
  const name = normalizeText(formData.get("name"))
  const description = normalizeText(formData.get("description"))
  const priceRaw = normalizeText(formData.get("price"))
  const durationRaw = normalizeText(formData.get("durationMin"))

  if (name.length < 2 || name.length > 80) {
    redirectWithError("O nome do serviço deve ter entre 2 e 80 caracteres.")
  }

  const priceCents = parsePriceToCents(priceRaw)

  if (priceCents === null) {
    redirectWithError("Informe um preço válido.")
  }

  const durationMin = parseDuration(durationRaw)

  if (durationMin === null) {
    redirectWithError("Selecione uma duração válida para o serviço.")
  }

  const business = await getCurrentBusiness()

  if (!business) {
    redirectWithError("Negócio não encontrado. Selecione outro negócio.")
  }

  await prisma.service.create({
    data: {
      businessId: business.id,
      name,
      description: description || null,
      priceCents,
      durationMin,
      active: true,
    },
  })

  revalidatePath("/dashboard/services")
  revalidatePath(`/book/${business.slug}`)
  revalidatePath("/dashboard")

  redirectWithSuccess("Serviço criado com sucesso.")
}

export async function updateServiceAction(formData: FormData) {
  const serviceId = normalizeText(formData.get("serviceId"))
  const name = normalizeText(formData.get("name"))
  const description = normalizeText(formData.get("description"))
  const priceRaw = normalizeText(formData.get("price"))
  const durationRaw = normalizeText(formData.get("durationMin"))

  if (!serviceId) {
    redirectWithError("Serviço não encontrado.")
  }

  if (name.length < 2 || name.length > 80) {
    redirectWithError("O nome do serviço deve ter entre 2 e 80 caracteres.")
  }

  const priceCents = parsePriceToCents(priceRaw)

  if (priceCents === null) {
    redirectWithError("Informe um preço válido.")
  }

  const durationMin = parseDuration(durationRaw)

  if (durationMin === null) {
    redirectWithError("Selecione uma duração válida para o serviço.")
  }

  const business = await getCurrentBusiness()

  if (!business) {
    redirectWithError("Negócio não encontrado.")
  }

  const service = await prisma.service.findFirst({
    where: {
      id: serviceId,
      businessId: business.id,
    },
  })

  if (!service) {
    redirectWithError("Serviço não encontrado neste negócio.")
  }

  await prisma.service.update({
    where: {
      id: service.id,
    },
    data: {
      name,
      description: description || null,
      priceCents,
      durationMin,
    },
  })

  revalidatePath("/dashboard/services")
  revalidatePath(`/book/${business.slug}`)
  revalidatePath("/dashboard")

  redirectWithSuccess("Serviço atualizado com sucesso.")
}

export async function toggleServiceActiveAction(formData: FormData) {
  const serviceId = normalizeText(formData.get("serviceId"))
  const activeRaw = normalizeText(formData.get("active"))

  if (!serviceId) {
    redirectWithError("Serviço não encontrado.")
  }

  const nextActive = activeRaw === "true"

  const business = await getCurrentBusiness()

  if (!business) {
    redirectWithError("Negócio não encontrado.")
  }

  const service = await prisma.service.findFirst({
    where: {
      id: serviceId,
      businessId: business.id,
    },
  })

  if (!service) {
    redirectWithError("Serviço não encontrado neste negócio.")
  }

  await prisma.service.update({
    where: {
      id: service.id,
    },
    data: {
      active: nextActive,
    },
  })

  revalidatePath("/dashboard/services")
  revalidatePath(`/book/${business.slug}`)
  revalidatePath("/dashboard")

  redirectWithSuccess(
    nextActive ? "Serviço ativado com sucesso." : "Serviço desativado com sucesso.",
  )
}

export async function deleteServiceAction(formData: FormData) {
  const serviceId = normalizeText(formData.get("serviceId"))

  if (!serviceId) {
    redirectWithError("Serviço não encontrado.")
  }

  const business = await getCurrentBusiness()

  if (!business) {
    redirectWithError("Negócio não encontrado.")
  }

  const service = await prisma.service.findFirst({
    where: {
      id: serviceId,
      businessId: business.id,
    },
    include: {
      _count: {
        select: {
          bookingServices: true,
        },
      },
    },
  })

  if (!service) {
    redirectWithError("Serviço não encontrado neste negócio.")
  }

  if (service._count.bookingServices > 0) {
    redirectWithError(
      "Este serviço já foi usado em marcações. Para manter o histórico, apenas desative o serviço.",
    )
  }

  await prisma.service.delete({
    where: {
      id: service.id,
    },
  })

  revalidatePath("/dashboard/services")
  revalidatePath(`/book/${business.slug}`)
  revalidatePath("/dashboard")

  redirectWithSuccess("Serviço apagado definitivamente.")
}