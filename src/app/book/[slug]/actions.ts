"use server"

import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { sendBookingCreatedEmails } from "@/lib/email"

export type CreateBookingState = {
  error?: string
}

function parseDateAndTime(dateParam: string, timeParam: string) {
  const [year, month, day] = dateParam.split("-").map(Number)
  const [hours, minutes] = timeParam.split(":").map(Number)

  return new Date(year, month - 1, day, hours, minutes, 0, 0)
}

function addMinutes(date: Date, minutes: number) {
  return new Date(date.getTime() + minutes * 60 * 1000)
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

export async function createBookingAction(
  _previousState: CreateBookingState,
  formData: FormData
): Promise<CreateBookingState> {
  const slug = String(formData.get("slug") ?? "")
  const serviceIdsRaw = String(formData.get("serviceIds") ?? "")
  const date = String(formData.get("date") ?? "")
  const time = String(formData.get("time") ?? "")

  const customerNameRaw = String(formData.get("customerName") ?? "")
  const customerPhoneRaw = String(formData.get("customerPhone") ?? "")
  const customerEmailRaw = String(formData.get("customerEmail") ?? "")

  const customerName = normalizeName(customerNameRaw)
  const customerPhone = normalizePhone(customerPhoneRaw)
  const customerEmail = customerEmailRaw.trim().toLowerCase()

  const serviceIds = serviceIdsRaw.split(",").filter(Boolean)

  if (!slug || serviceIds.length === 0 || !date || !time) {
    return {
      error: "Dados da marcação incompletos. Escolha serviço, data e horário.",
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
      blockedDays: true,
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
        in: serviceIds,
      },
      active: true,
    },
  })

  if (services.length !== serviceIds.length) {
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

  const startAt = parseDateAndTime(date, time)
  const endAt = addMinutes(startAt, totalDurationMin)

  const dayOfWeek = startAt.getDay()

  const workHour = business.workHours.find(
    (item) => item.dayOfWeek === dayOfWeek
  )

  if (!workHour) {
    return {
      error: "O negócio não atende nesta data.",
    }
  }

  const selectedDateStart = new Date(startAt)
  selectedDateStart.setHours(0, 0, 0, 0)

  const selectedDateEnd = new Date(startAt)
  selectedDateEnd.setHours(23, 59, 59, 999)

  const isBlocked = business.blockedDays.some((blockedDay) => {
    return (
      blockedDay.date >= selectedDateStart &&
      blockedDay.date <= selectedDateEnd
    )
  })

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

  const existingBookings = await prisma.booking.findMany({
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
    return {
      error: "Este horário acabou de ficar indisponível. Escolha outro horário.",
    }
  }

  const booking = await prisma.$transaction(async (tx) => {
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
  })

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