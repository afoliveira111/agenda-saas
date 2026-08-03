"use server"

import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { sendBookingCreatedEmails } from "@/lib/email"
import {
  checkPublicBookingRateLimit,
  recordPublicBookingAttempt,
} from "@/lib/public-booking-rate-limit"
import { prisma } from "@/lib/prisma"

export type CreateBookingState = {
  error?: string
}

const PUBLIC_BOOKING_DAYS_LIMIT = 21

function addDays(date: Date, days: number) {
  const result = new Date(date)
  result.setDate(result.getDate() + days)
  return result
}

function addMinutes(date: Date, minutes: number) {
  return new Date(date.getTime() + minutes * 60 * 1000)
}

function getDayStart(date: Date) {
  const result = new Date(date)
  result.setHours(0, 0, 0, 0)
  return result
}

function getDayEnd(date: Date) {
  const result = new Date(date)
  result.setHours(23, 59, 59, 999)
  return result
}

function isSameLocalDay(firstDate: Date, secondDate: Date) {
  return (
    firstDate.getFullYear() === secondDate.getFullYear() &&
    firstDate.getMonth() === secondDate.getMonth() &&
    firstDate.getDate() === secondDate.getDate()
  )
}

function parseDateAndTime(dateParam: string, timeParam: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateParam)) {
    return null
  }

  if (!/^\d{2}:\d{2}$/.test(timeParam)) {
    return null
  }

  const [year, month, day] = dateParam.split("-").map(Number)
  const [hours, minutes] = timeParam.split(":").map(Number)

  if (
    !Number.isInteger(year) ||
    !Number.isInteger(month) ||
    !Number.isInteger(day) ||
    !Number.isInteger(hours) ||
    !Number.isInteger(minutes)
  ) {
    return null
  }

  if (month < 1 || month > 12) {
    return null
  }

  if (day < 1 || day > 31) {
    return null
  }

  if (hours < 0 || hours > 23) {
    return null
  }

  if (minutes !== 0 && minutes !== 30) {
    return null
  }

  const parsedDate = new Date(year, month - 1, day, hours, minutes, 0, 0)

  if (
    parsedDate.getFullYear() !== year ||
    parsedDate.getMonth() !== month - 1 ||
    parsedDate.getDate() !== day ||
    parsedDate.getHours() !== hours ||
    parsedDate.getMinutes() !== minutes
  ) {
    return null
  }

  return parsedDate
}

function timeToMinutes(time: string) {
  const [hours, minutes] = time.split(":").map(Number)
  return hours * 60 + minutes
}

function hasBookingConflict(
  slotStart: Date,
  slotEnd: Date,
  bookings: Array<{ startAt: Date; endAt: Date }>
) {
  return bookings.some((booking) => {
    return slotStart < booking.endAt && slotEnd > booking.startAt
  })
}

function getBookingLockKey(businessId: string, dateParam: string) {
  return `booking:${businessId}:${dateParam}`
}

function normalizeName(name: string) {
  return name.trim().replace(/\s+/g, " ")
}

function isValidCustomerName(name: string) {
  const normalizedName = normalizeName(name)

  if (normalizedName.length < 2 || normalizedName.length > 80) {
    return false
  }

  if (/\d/.test(normalizedName)) {
    return false
  }

  return /^[A-Za-zÀ-ÖØ-öø-ÿ\s.'-]+$/u.test(normalizedName)
}

function normalizePhone(phone: string) {
  return phone.trim().replace(/[\s().-]/g, "")
}

function isValidPhone(phone: string) {
  const normalizedPhone = normalizePhone(phone)

  return /^\+?\d{7,15}$/.test(normalizedPhone)
}

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
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

async function getPublicBookingRateLimitKey(slug: string) {
  const ip = await getClientIp()
  const safeSlug = slug || "empty-slug"

  return `${ip}:${safeSlug}`
}

export async function createBookingAction(
  _previousState: CreateBookingState,
  formData: FormData
): Promise<CreateBookingState> {
  const slug = String(formData.get("slug") ?? "").trim()
  const serviceIdsRaw = String(formData.get("serviceIds") ?? "")
  const date = String(formData.get("date") ?? "").trim()
  const time = String(formData.get("time") ?? "").trim()

  const customerNameRaw = String(formData.get("customerName") ?? "")
  const customerPhoneRaw = String(formData.get("customerPhone") ?? "")
  const customerEmailRaw = String(formData.get("customerEmail") ?? "")

  const customerName = normalizeName(customerNameRaw)
  const customerPhone = normalizePhone(customerPhoneRaw)
  const customerEmail = customerEmailRaw.trim().toLowerCase()

  const serviceIds = serviceIdsRaw
    .split(",")
    .map((serviceId) => serviceId.trim())
    .filter(Boolean)

  const uniqueServiceIds = Array.from(new Set(serviceIds))

  if (!slug || serviceIds.length === 0 || !date || !time) {
    return {
      error: "Dados da marcação incompletos. Escolha serviço, data e horário.",
    }
  }

  const rateLimitKey = await getPublicBookingRateLimitKey(slug)
  const rateLimit = checkPublicBookingRateLimit(rateLimitKey)

  if (!rateLimit.allowed) {
    return {
      error:
        "Foram feitas muitas tentativas de marcação. Aguarde alguns minutos e tente novamente.",
    }
  }

  recordPublicBookingAttempt(rateLimitKey)

  if (uniqueServiceIds.length !== serviceIds.length) {
    return {
      error: "A seleção de serviços não é válida.",
    }
  }

  if (!isValidCustomerName(customerName)) {
    return {
      error:
        "O nome deve ter apenas letras, espaços, acentos, hífen ou apóstrofo.",
    }
  }

  if (!isValidPhone(customerPhoneRaw)) {
    return {
      error: "O telefone deve ter entre 7 e 15 dígitos.",
    }
  }

  if (!customerEmail) {
    return {
      error: "Informe o e-mail para receber a confirmação da marcação.",
    }
  }

  if (!isValidEmail(customerEmail)) {
    return {
      error: "O e-mail informado não é válido.",
    }
  }

  const startAt = parseDateAndTime(date, time)

  if (!startAt) {
    return {
      error: "A data ou o horário escolhido não é válido.",
    }
  }

  const todayStart = getDayStart(new Date())
  const maxBookingDate = getDayStart(addDays(todayStart, PUBLIC_BOOKING_DAYS_LIMIT - 1))
  const selectedDateStart = getDayStart(startAt)
  const selectedDateEnd = getDayEnd(startAt)

  if (selectedDateStart < todayStart) {
    return {
      error: "Não é possível marcar para uma data passada.",
    }
  }

  if (selectedDateStart > maxBookingDate) {
    return {
      error: "Escolha uma data dentro dos próximos 21 dias.",
    }
  }

  const business = await prisma.business.findUnique({
    where: {
      slug,
    },
    include: {
      workHours: {
        where: {
          active: true,
        },
      },
      blockedDays: {
        where: {
          date: {
            gte: selectedDateStart,
            lte: selectedDateEnd,
          },
        },
      },
    },
  })

  if (!business) {
    return {
      error: "Negócio não encontrado.",
    }
  }

  const services = await prisma.service.findMany({
    where: {
      businessId: business.id,
      id: {
        in: uniqueServiceIds,
      },
      active: true,
    },
  })

  if (services.length !== uniqueServiceIds.length) {
    return {
      error: "Um ou mais serviços selecionados não são válidos.",
    }
  }

  const totalPriceCents = services.reduce(
    (total, service) => total + service.priceCents,
    0
  )

  const totalDurationMin = services.reduce(
    (total, service) => total + service.durationMin,
    0
  )

  if (totalDurationMin <= 0) {
    return {
      error: "A duração dos serviços selecionados não é válida.",
    }
  }

  const endAt = addMinutes(startAt, totalDurationMin)

  if (!isSameLocalDay(startAt, endAt)) {
    return {
      error: "A marcação precisa terminar no mesmo dia.",
    }
  }

  const dayOfWeek = startAt.getDay()

  const workHour = business.workHours.find(
    (item) => item.dayOfWeek === dayOfWeek
  )

  if (!workHour) {
    return {
      error: "O negócio não atende nesta data.",
    }
  }

  const isBlocked = business.blockedDays.length > 0

  if (isBlocked) {
    return {
      error: "Esta data está bloqueada.",
    }
  }

  const startMinutes = startAt.getHours() * 60 + startAt.getMinutes()
  const endMinutes = endAt.getHours() * 60 + endAt.getMinutes()

  const businessStartMinutes = timeToMinutes(workHour.startTime)
  const businessEndMinutes = timeToMinutes(workHour.endTime)

  if (startMinutes < businessStartMinutes || endMinutes > businessEndMinutes) {
    return {
      error: "O horário escolhido está fora do horário de atendimento.",
    }
  }

  const booking = await prisma.$transaction(async (tx) => {
    await tx.$executeRaw`
      SELECT pg_advisory_xact_lock(hashtextextended(${getBookingLockKey(
        business.id,
        date
      )}, 0))
    `

    const existingBookings = await tx.booking.findMany({
      where: {
        businessId: business.id,
        status: {
          not: "CANCELLED",
        },
        startAt: {
          lt: selectedDateEnd,
        },
        endAt: {
          gt: selectedDateStart,
        },
      },
      select: {
        startAt: true,
        endAt: true,
      },
    })

    const hasConflict = hasBookingConflict(startAt, endAt, existingBookings)

    if (hasConflict) {
      throw new Error("BOOKING_CONFLICT")
    }

    const existingCustomer = await tx.customer.findFirst({
      where: {
        businessId: business.id,
        email: customerEmail,
      },
    })

    const customer = existingCustomer
      ? await tx.customer.update({
          where: {
            id: existingCustomer.id,
          },
          data: {
            name: customerName,
            phone: customerPhone,
            email: customerEmail,
          },
        })
      : await tx.customer.create({
          data: {
            businessId: business.id,
            name: customerName,
            phone: customerPhone,
            email: customerEmail,
          },
        })

    return tx.booking.create({
      data: {
        businessId: business.id,
        customerId: customer.id,
        startAt,
        endAt,
        status: "CONFIRMED",
        totalPriceCents,
        totalDurationMin,
        services: {
          create: services.map((service) => ({
            serviceId: service.id,
            priceCents: service.priceCents,
            durationMin: service.durationMin,
          })),
        },
      },
    })
  }).catch((error) => {
    if (error instanceof Error && error.message === "BOOKING_CONFLICT") {
      return null
    }

    throw error
  })

  if (!booking) {
    return {
      error: "Este horário acabou de ficar indisponível. Escolha outro horário.",
    }
  }

  await sendBookingCreatedEmails({
    business: {
      name: business.name,
      email: business.email,
      notificationEmail: business.notificationEmail,
      phone: business.phone,
      address: business.address,
      slug: business.slug,
    },
    customer: {
      name: customerName,
      phone: customerPhone,
      email: customerEmail,
    },
    booking: {
      id: booking.id,
      startAt,
      endAt,
      totalPriceCents,
      totalDurationMin,
    },
    services: services.map((service) => ({
      name: service.name,
      priceCents: service.priceCents,
      durationMin: service.durationMin,
    })),
  })

  redirect(`/book/${slug}/success?bookingId=${booking.id}`)
}
