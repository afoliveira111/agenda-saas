"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { normalizeBusinessTheme } from "@/lib/business-theme"
import {
  getCurrentBusinessSlug,
  setCurrentBusinessSlug,
} from "@/lib/current-business"
import { prisma } from "@/lib/prisma"

type BusinessFormValues = {
  name: string
  slug: string
  phone: string
  email: string
  notificationEmail: string
  address: string
  description: string
  theme: string
  createExampleService: string
}

function redirectWithFormError(
  message: string,
  values: BusinessFormValues,
): never {
  const params = new URLSearchParams()

  params.set("error", message)

  Object.entries(values).forEach(([key, value]) => {
    if (key === "createExampleService") {
      params.set(key, value)
      return
    }

    if (value) {
      params.set(key, value)
    }
  })

  redirect(`/dashboard/businesses?${params.toString()}`)
}

function redirectWithError(message: string): never {
  redirect(`/dashboard/businesses?error=${encodeURIComponent(message)}`)
}

function redirectWithSuccess(message: string): never {
  redirect(`/dashboard/businesses?success=${encodeURIComponent(message)}`)
}

function normalizeText(value: FormDataEntryValue | null) {
  return String(value ?? "").trim()
}

function normalizePhone(phone: string) {
  return phone.trim().replace(/[\s().-]/g, "")
}

function isValidPhone(phone: string) {
  if (!phone) return true

  const normalizedPhone = normalizePhone(phone)

  return /^\+?\d{7,15}$/.test(normalizedPhone)
}

function isValidEmail(email: string) {
  if (!email) return true

  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

function createSlugFromText(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60)
}

function isValidSlug(slug: string) {
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)
}

function getDefaultWorkHours(businessId: string) {
  return [
    {
      businessId,
      dayOfWeek: 1,
      startTime: "09:00",
      endTime: "18:00",
      active: true,
    },
    {
      businessId,
      dayOfWeek: 2,
      startTime: "09:00",
      endTime: "18:00",
      active: true,
    },
    {
      businessId,
      dayOfWeek: 3,
      startTime: "09:00",
      endTime: "18:00",
      active: true,
    },
    {
      businessId,
      dayOfWeek: 4,
      startTime: "09:00",
      endTime: "18:00",
      active: true,
    },
    {
      businessId,
      dayOfWeek: 5,
      startTime: "09:00",
      endTime: "18:00",
      active: true,
    },
    {
      businessId,
      dayOfWeek: 6,
      startTime: "09:00",
      endTime: "13:00",
      active: true,
    },
    {
      businessId,
      dayOfWeek: 0,
      startTime: "09:00",
      endTime: "13:00",
      active: false,
    },
  ]
}

function validateBusinessBasics({
  name,
  slug,
  phone,
  email,
  notificationEmail,
}: {
  name: string
  slug: string
  phone: string
  email: string
  notificationEmail: string
}) {
  if (name.length < 2 || name.length > 80) {
    return "O nome do negócio deve ter entre 2 e 80 caracteres."
  }

  if (!slug || slug.length < 3 || slug.length > 60 || !isValidSlug(slug)) {
    return "O slug deve ter entre 3 e 60 caracteres, usando letras, números e hífen."
  }

  if (!isValidPhone(phone)) {
    return "Informe um telefone válido. Exemplo: +351 912 345 678."
  }

  if (!isValidEmail(email)) {
    return "Informe um e-mail público válido."
  }

  if (!isValidEmail(notificationEmail)) {
    return "Informe um e-mail de notificação válido."
  }

  return null
}

export async function createBusinessAction(formData: FormData) {
  const formValues: BusinessFormValues = {
    name: normalizeText(formData.get("name")),
    slug: normalizeText(formData.get("slug")),
    phone: normalizeText(formData.get("phone")),
    email: normalizeText(formData.get("email")),
    notificationEmail: normalizeText(formData.get("notificationEmail")),
    address: normalizeText(formData.get("address")),
    description: normalizeText(formData.get("description")),
    theme: normalizeText(formData.get("theme")) || "LUXURY",
    createExampleService:
      formData.get("createExampleService") === "true" ? "true" : "false",
  }

  const name = formValues.name
  const slug = createSlugFromText(formValues.slug || formValues.name)
  const phone = formValues.phone ? normalizePhone(formValues.phone) : ""
  const email = formValues.email.toLowerCase()
  const notificationEmail = formValues.notificationEmail.toLowerCase()
  const theme = normalizeBusinessTheme(formValues.theme)
  const createExampleService = formValues.createExampleService === "true"

  const validationError = validateBusinessBasics({
    name,
    slug,
    phone: formValues.phone,
    email,
    notificationEmail,
  })

  if (validationError) {
    redirectWithFormError(validationError, formValues)
  }

  const existingBusiness = await prisma.business.findUnique({
    where: {
      slug,
    },
  })

  if (existingBusiness) {
    redirectWithFormError("Já existe um negócio com este slug.", formValues)
  }

  const business = await prisma.$transaction(async (tx) => {
    const createdBusiness = await tx.business.create({
      data: {
        name,
        slug,
        phone: phone || null,
        email: email || null,
        notificationEmail: notificationEmail || email || null,
        address: formValues.address || null,
        description: formValues.description || null,
        theme,
      },
    })

    await tx.workHour.createMany({
      data: getDefaultWorkHours(createdBusiness.id),
    })

    if (createExampleService) {
      await tx.service.create({
        data: {
          businessId: createdBusiness.id,
          name: "Consulta inicial",
          description: "Serviço exemplo para testar a página pública.",
          priceCents: 1500,
          durationMin: 60,
          active: true,
          sortOrder: 1,
        },
      })
    }

    return createdBusiness
  })

  await setCurrentBusinessSlug(business.slug)

  revalidatePath("/admin")
  revalidatePath("/dashboard")
  revalidatePath("/dashboard/businesses")
  revalidatePath(`/book/${business.slug}`)

  redirectWithSuccess(
    `Negócio criado com sucesso e selecionado no painel: /book/${business.slug}`,
  )
}

export async function updateBusinessAction(formData: FormData) {
  const businessId = normalizeText(formData.get("businessId"))

  if (!businessId) {
    redirectWithError("Negócio não informado.")
  }

  const name = normalizeText(formData.get("name"))
  const slug = createSlugFromText(
    normalizeText(formData.get("slug")) || name,
  )
  const phoneRaw = normalizeText(formData.get("phone"))
  const phone = phoneRaw ? normalizePhone(phoneRaw) : ""
  const email = normalizeText(formData.get("email")).toLowerCase()
  const notificationEmail = normalizeText(
    formData.get("notificationEmail"),
  ).toLowerCase()
  const address = normalizeText(formData.get("address"))
  const description = normalizeText(formData.get("description"))
  const theme = normalizeBusinessTheme(normalizeText(formData.get("theme")))

  const validationError = validateBusinessBasics({
    name,
    slug,
    phone: phoneRaw,
    email,
    notificationEmail,
  })

  if (validationError) {
    redirectWithError(validationError)
  }

  const business = await prisma.business.findUnique({
    where: {
      id: businessId,
    },
  })

  if (!business) {
    redirectWithError("Negócio não encontrado.")
  }

  const existingBusiness = await prisma.business.findFirst({
    where: {
      slug,
      NOT: {
        id: business.id,
      },
    },
  })

  if (existingBusiness) {
    redirectWithError("Já existe outro negócio com este slug.")
  }

  const previousSlug = business.slug
  const currentBusinessSlug = await getCurrentBusinessSlug()

  const updatedBusiness = await prisma.business.update({
    where: {
      id: business.id,
    },
    data: {
      name,
      slug,
      phone: phone || null,
      email: email || null,
      notificationEmail: notificationEmail || email || null,
      address: address || null,
      description: description || null,
      theme,
    },
  })

  if (currentBusinessSlug === previousSlug) {
    await setCurrentBusinessSlug(updatedBusiness.slug)
  }

  revalidatePath("/admin")
  revalidatePath("/dashboard")
  revalidatePath("/dashboard/businesses")
  revalidatePath("/dashboard/settings/business")
  revalidatePath(`/book/${previousSlug}`)
  revalidatePath(`/book/${updatedBusiness.slug}`)

  redirectWithSuccess(`Negócio atualizado com sucesso: /book/${updatedBusiness.slug}`)
}

export async function selectBusinessAction(formData: FormData) {
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

  revalidatePath("/dashboard")
  revalidatePath("/dashboard/bookings")
  revalidatePath("/dashboard/services")
  revalidatePath("/dashboard/settings/hours")
  revalidatePath("/dashboard/blocked-days")
  revalidatePath("/dashboard/settings/business")
  revalidatePath("/dashboard/businesses")
  revalidatePath("/admin")

  redirectWithSuccess(`Painel alterado para: ${business.name}`)
}