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

function normalizeMoveDirection(direction: string) {
  if (direction === "up" || direction === "down") {
    return direction
  }

  redirectWithError("Direção inválida.")
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

async function getNextServiceSortOrder({
  businessId,
  categoryId,
}: {
  businessId: string
  categoryId: string | null
}) {
  const lastService = await prisma.service.findFirst({
    where: {
      businessId,
      categoryId,
    },
    orderBy: [
      {
        sortOrder: "desc",
      },
      {
        createdAt: "desc",
      },
    ],
  })

  return lastService ? lastService.sortOrder + 1 : 1
}

function validateCategoryName(name: string) {
  if (name.length < 2 || name.length > 60) {
    redirectWithError("O nome da categoria deve ter entre 2 e 60 caracteres.")
  }
}

async function normalizeCategoryOrder(businessId: string) {
  const categories = await prisma.serviceCategory.findMany({
    where: {
      businessId,
    },
    orderBy: [
      {
        sortOrder: "asc",
      },
      {
        createdAt: "asc",
      },
      {
        name: "asc",
      },
    ],
  })

  await prisma.$transaction(
    categories.map((category, index) =>
      prisma.serviceCategory.update({
        where: {
          id: category.id,
        },
        data: {
          sortOrder: index + 1,
        },
      }),
    ),
  )
}

async function normalizeServiceOrder({
  businessId,
  categoryId,
}: {
  businessId: string
  categoryId: string | null
}) {
  const services = await prisma.service.findMany({
    where: {
      businessId,
      categoryId,
    },
    orderBy: [
      {
        sortOrder: "asc",
      },
      {
        createdAt: "asc",
      },
      {
        name: "asc",
      },
    ],
  })

  await prisma.$transaction(
    services.map((service, index) =>
      prisma.service.update({
        where: {
          id: service.id,
        },
        data: {
          sortOrder: index + 1,
        },
      }),
    ),
  )
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
    orderBy: [
      {
        sortOrder: "desc",
      },
      {
        createdAt: "desc",
      },
    ],
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

export async function moveServiceCategoryAction(formData: FormData) {
  const categoryId = normalizeText(formData.get("categoryId"))
  const direction = normalizeMoveDirection(normalizeText(formData.get("direction")))

  if (!categoryId) {
    redirectWithError("Categoria não encontrada.")
  }

  const business = await getCurrentBusiness()

  if (!business) {
    redirectWithError("Negócio não encontrado.")
  }

  await normalizeCategoryOrder(business.id)

  const categories = await prisma.serviceCategory.findMany({
    where: {
      businessId: business.id,
    },
    orderBy: [
      {
        sortOrder: "asc",
      },
      {
        createdAt: "asc",
      },
    ],
  })

  const currentIndex = categories.findIndex((category) => category.id === categoryId)

  if (currentIndex === -1) {
    redirectWithError("Categoria não encontrada neste negócio.")
  }

  const targetIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1

  if (targetIndex < 0 || targetIndex >= categories.length) {
    redirectWithSuccess("Categoria mantida na posição atual.")
  }

  const reorderedCategories = [...categories]
  const [currentCategory] = reorderedCategories.splice(currentIndex, 1)

  reorderedCategories.splice(targetIndex, 0, currentCategory)

  await prisma.$transaction(
    reorderedCategories.map((category, index) =>
      prisma.serviceCategory.update({
        where: {
          id: category.id,
        },
        data: {
          sortOrder: index + 1,
        },
      }),
    ),
  )

  revalidatePath("/dashboard/services")
  revalidatePath(`/book/${business.slug}`)

  redirectWithSuccess("Ordem da categoria atualizada.")
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

  await normalizeCategoryOrder(business.id)
  await normalizeServiceOrder({
    businessId: business.id,
    categoryId: null,
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

  const sortOrder = await getNextServiceSortOrder({
    businessId: business.id,
    categoryId,
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
      sortOrder,
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

  const categoryChanged = service.categoryId !== categoryId

  const sortOrder = categoryChanged
    ? await getNextServiceSortOrder({
        businessId: business.id,
        categoryId,
      })
    : service.sortOrder

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
      sortOrder,
    },
  })

  if (categoryChanged) {
    await normalizeServiceOrder({
      businessId: business.id,
      categoryId: service.categoryId,
    })

    await normalizeServiceOrder({
      businessId: business.id,
      categoryId,
    })
  }

  revalidatePath("/dashboard/services")
  revalidatePath(`/book/${business.slug}`)
  revalidatePath("/dashboard")

  redirectWithSuccess("Serviço atualizado com sucesso.")
}

export async function moveServiceAction(formData: FormData) {
  const serviceId = normalizeText(formData.get("serviceId"))
  const direction = normalizeMoveDirection(normalizeText(formData.get("direction")))

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
  })

  if (!service) {
    redirectWithError("Serviço não encontrado neste negócio.")
  }

  await normalizeServiceOrder({
    businessId: business.id,
    categoryId: service.categoryId,
  })

  const services = await prisma.service.findMany({
    where: {
      businessId: business.id,
      categoryId: service.categoryId,
    },
    orderBy: [
      {
        sortOrder: "asc",
      },
      {
        createdAt: "asc",
      },
    ],
  })

  const currentIndex = services.findIndex((item) => item.id === service.id)

  if (currentIndex === -1) {
    redirectWithError("Serviço não encontrado neste grupo.")
  }

  const targetIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1

  if (targetIndex < 0 || targetIndex >= services.length) {
    redirectWithSuccess("Serviço mantido na posição atual.")
  }

  const reorderedServices = [...services]
  const [currentService] = reorderedServices.splice(currentIndex, 1)

  reorderedServices.splice(targetIndex, 0, currentService)

  await prisma.$transaction(
    reorderedServices.map((item, index) =>
      prisma.service.update({
        where: {
          id: item.id,
        },
        data: {
          sortOrder: index + 1,
        },
      }),
    ),
  )

  revalidatePath("/dashboard/services")
  revalidatePath(`/book/${business.slug}`)

  redirectWithSuccess("Ordem do serviço atualizada.")
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

  await normalizeServiceOrder({
    businessId: business.id,
    categoryId: service.categoryId,
  })

  revalidatePath("/dashboard/services")
  revalidatePath(`/book/${business.slug}`)
  revalidatePath("/dashboard")

  redirectWithSuccess("Serviço apagado definitivamente.")
}