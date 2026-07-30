"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { getCurrentBusinessSlug } from "@/lib/current-business"
import { durationOptions } from "@/lib/format-duration"
import { prisma } from "@/lib/prisma"

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

async function getValidCategoryId({
  businessId,
  categoryId,
}: {
  businessId: string
  categoryId: string
}) {
  if (!categoryId) {
    return null
  }

  const category = await prisma.serviceCategory.findFirst({
    where: {
      id: categoryId,
      businessId,
    },
  })

  if (!category) {
    redirectWithError("Categoria não encontrada neste negócio.")
  }

  return category.id
}

function validateCategoryName(name: string) {
  if (name.length < 2 || name.length > 60) {
    redirectWithError("O nome da categoria deve ter entre 2 e 60 caracteres.")
  }
}

export async function createServiceCategoryAction(formData: FormData) {
  const name = normalizeText(formData.get("name"))

  validateCategoryName(name)

  const business = await getCurrentBusiness()

  if (!business) {
    redirectWithError("Negócio não encontrado.")
  }

  const existingCategory = await prisma.serviceCategory.findFirst({
    where: {
      businessId: business.id,
      name,
    },
  })

  if (existingCategory) {
    redirectWithError("Já existe uma categoria com este nome.")
  }

  const lastCategory = await prisma.serviceCategory.findFirst({
    where: {
      businessId: business.id,
    },
    orderBy: {
      sortOrder: "desc",
    },
  })

  await prisma.serviceCategory.create({
    data: {
      businessId: business.id,
      name,
      sortOrder: lastCategory ? lastCategory.sortOrder + 1 : 1,
    },
  })

  revalidatePath("/dashboard/services")
  revalidatePath(`/book/${business.slug}`)

  redirectWithSuccess("Categoria criada com sucesso.")
}

export async function updateServiceCategoryAction(formData: FormData) {
  const categoryId = normalizeText(formData.get("categoryId"))
  const name = normalizeText(formData.get("name"))

  if (!categoryId) {
    redirectWithError("Categoria não encontrada.")
  }

  validateCategoryName(name)

  const business = await getCurrentBusiness()

  if (!business) {
    redirectWithError("Negócio não encontrado.")
  }

  const category = await prisma.serviceCategory.findFirst({
    where: {
      id: categoryId,
      businessId: business.id,
    },
  })

  if (!category) {
    redirectWithError("Categoria não encontrada neste negócio.")
  }

  const existingCategory = await prisma.serviceCategory.findFirst({
    where: {
      businessId: business.id,
      name,
      NOT: {
        id: category.id,
      },
    },
  })

  if (existingCategory) {
    redirectWithError("Já existe outra categoria com este nome.")
  }

  await prisma.serviceCategory.update({
    where: {
      id: category.id,
    },
    data: {
      name,
    },
  })

  revalidatePath("/dashboard/services")
  revalidatePath(`/book/${business.slug}`)

  redirectWithSuccess("Categoria atualizada com sucesso.")
}

export async function deleteServiceCategoryAction(formData: FormData) {
  const categoryId = normalizeText(formData.get("categoryId"))

  if (!categoryId) {
    redirectWithError("Categoria não encontrada.")
  }

  const business = await getCurrentBusiness()

  if (!business) {
    redirectWithError("Negócio não encontrado.")
  }

  const category = await prisma.serviceCategory.findFirst({
    where: {
      id: categoryId,
      businessId: business.id,
    },
    include: {
      _count: {
        select: {
          services: true,
        },
      },
    },
  })

  if (!category) {
    redirectWithError("Categoria não encontrada neste negócio.")
  }

  await prisma.service.updateMany({
    where: {
      businessId: business.id,
      categoryId: category.id,
    },
    data: {
      categoryId: null,
    },
  })

  await prisma.serviceCategory.delete({
    where: {
      id: category.id,
    },
  })

  revalidatePath("/dashboard/services")
  revalidatePath(`/book/${business.slug}`)
  revalidatePath("/dashboard")

  redirectWithSuccess(
    category._count.services > 0
      ? "Categoria apagada. Os serviços foram movidos para Sem categoria."
      : "Categoria apagada com sucesso.",
  )
}

export async function createServiceAction(formData: FormData) {
  const name = normalizeText(formData.get("name"))
  const description = normalizeText(formData.get("description"))
  const priceRaw = normalizeText(formData.get("price"))
  const durationRaw = normalizeText(formData.get("durationMin"))
  const categoryIdRaw = normalizeText(formData.get("categoryId"))

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

  const categoryId = await getValidCategoryId({
    businessId: business.id,
    categoryId: categoryIdRaw,
  })

  await prisma.service.create({
    data: {
      businessId: business.id,
      categoryId,
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
  const categoryIdRaw = normalizeText(formData.get("categoryId"))

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

  const categoryId = await getValidCategoryId({
    businessId: business.id,
    categoryId: categoryIdRaw,
  })

  await prisma.service.update({
    where: {
      id: service.id,
    },
    data: {
      categoryId,
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
    nextActive
      ? "Serviço ativado com sucesso."
      : "Serviço desativado com sucesso.",
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