"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { getCurrentBusinessSlug } from "@/lib/current-business"
import { sendBookingRescheduledEmails } from "@/lib/email"
import { prisma } from "@/lib/prisma"
import { isAllowedTimeOption } from "@/lib/time-options"

const allowedStatuses = ["CONFIRMED", "CANCELLED", "COMPLETED", "NO_SHOW"] as const

type BookingStatusValue = (typeof allowedStatuses)[number]

function normalizeText(value: FormDataEntryValue | null) {
  return String(value ?? "").trim()
}

function normalizeView(value: string) {
  if (
    value === "today" ||
    value === "upcoming" ||
    value === "history" ||
    value === "cancelled" ||
    value === "all"
  ) {
    return value
  }

  return "upcoming"
}

function redirectWithMessage({
  view,
  success,
  error,
}: {
  view?: string
  success?: string
  error?: string
}): never {
  const params = new URLSearchParams()

  params.set("view", normalizeView(view ?? "upcoming"))

  if (success) {
    params.set("success", success)
  }

  if (error) {
    params.set("error", error)
  }

  redirect(`/dashboard/bookings?${params.toString()}`)
}

function isValidDate(value: string) {
  return /^\d{4}-\d{2}-\d{2}$/.test(value)
}

function isValidTime(value: string) {
  return /^([01]\d|2[0-3]):([0-5]\d)$/.test(value)
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
  bookings: Array<{ startAt: Date; endAt: Date }>,
) {
  return bookings.some((booking) => {
    return slotStart < booking.endAt && slotEnd > booking.startAt
  })
}

function getBookingLockKey(businessId: string, dateParam: string) {
  return `booking:${businessId}:${dateParam}`
}

async function getCurrentBusiness() {
  return prisma.business.findUnique({
    where: {
      slug: await getCurrentBusinessSlug(),
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
}

export async function updateBookingStatusAction(formData: FormData) {
  const bookingId = normalizeText(formData.get("bookingId"))
  const status = normalizeText(formData.get("status")) as BookingStatusValue
  const view = normalizeText(formData.get("view"))

  if (!bookingId) {
    redirectWithMessage({
      view,
      error: "Marcação não encontrada.",
    })
  }

  if (!allowedStatuses.includes(status)) {
    redirectWithMessage({
      view,
      error: "Estado inválido.",
    })
  }

  const business = await getCurrentBusiness()

  if (!business) {
    redirectWithMessage({
      view,
      error: "Negócio não encontrado. Selecione outro negócio.",
    })
  }

  const booking = await prisma.booking.findFirst({
    where: {
      id: bookingId,
      businessId: business.id,
    },
  })

  if (!booking) {
    redirectWithMessage({
      view,
      error: "Marcação não encontrada neste negócio.",
    })
  }

  await prisma.booking.update({
    where: {
      id: booking.id,
    },
    data: {
      status,
    },
  })

  revalidatePath("/dashboard/bookings")
  revalidatePath("/dashboard")

  redirectWithMessage({
    view,
    success: "Estado da marcação atualizado com sucesso.",
  })
}

export async function rescheduleBookingAction(formData: FormData) {
  const bookingId = normalizeText(formData.get("bookingId"))
  const date = normalizeText(formData.get("date"))
  const time = normalizeText(formData.get("time"))
  const view = normalizeText(formData.get("view"))

  if (!bookingId) {
    redirectWithMessage({
      view,
      error: "Marcação não encontrada.",
    })
  }

  if (!isValidDate(date)) {
    redirectWithMessage({
      view,
      error: "Selecione uma data válida para reagendar.",
    })
  }

  if (!isValidTime(time) || !isAllowedTimeOption(time)) {
    redirectWithMessage({
      view,
      error: "Selecione um horário válido para reagendar.",
    })
  }

  const business = await getCurrentBusiness()

  if (!business) {
    redirectWithMessage({
      view,
      error: "Negócio não encontrado. Selecione outro negócio.",
    })
  }

  const booking = await prisma.booking.findFirst({
    where: {
      id: bookingId,
      businessId: business.id,
    },
  })

  if (!booking) {
    redirectWithMessage({
      view,
      error: "Marcação não encontrada neste negócio.",
    })
  }

  const startAt = parseDateAndTime(date, time)
  const endAt = addMinutes(startAt, booking.totalDurationMin)

  const now = new Date()

  if (startAt < now) {
    redirectWithMessage({
      view,
      error: "A nova data e horário precisam ser no futuro.",
    })
  }

  const dayOfWeek = startAt.getDay()

  const workHour = business.workHours.find(
    (item) => item.dayOfWeek === dayOfWeek,
  )

  if (!workHour) {
    redirectWithMessage({
      view,
      error: "O negócio não atende nesta data.",
    })
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
    redirectWithMessage({
      view,
      error: "Esta data está bloqueada.",
    })
  }

  const startMinutes = startAt.getHours() * 60 + startAt.getMinutes()
  const endMinutes = endAt.getHours() * 60 + endAt.getMinutes()

  const businessStartMinutes = timeToMinutes(workHour.startTime)
  const businessEndMinutes = timeToMinutes(workHour.endTime)

  if (startMinutes < businessStartMinutes || endMinutes > businessEndMinutes) {
    redirectWithMessage({
      view,
      error: "O novo horário está fora do horário de atendimento.",
    })
  }

  const previousBooking = {
    startAt: booking.startAt,
    endAt: booking.endAt,
  }

  const updatedBooking = await prisma.$transaction(async (tx) => {
    await tx.$executeRaw`
      SELECT pg_advisory_xact_lock(hashtextextended(${getBookingLockKey(
        business.id,
        date,
      )}, 0))
    `

    const existingBookings = await tx.booking.findMany({
      where: {
        businessId: business.id,
        id: {
          not: booking.id,
        },
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

    return tx.booking.update({
      where: {
        id: booking.id,
      },
      data: {
        startAt,
        endAt,
        status: "CONFIRMED",
      },
      include: {
        customer: true,
        services: {
          include: {
            service: true,
          },
        },
      },
    })
  }).catch((error) => {
    if (error instanceof Error && error.message === "BOOKING_CONFLICT") {
      return null
    }

    throw error
  })

  if (!updatedBooking) {
    redirectWithMessage({
      view,
      error: "Este horário já tem outra marcação. Escolha outro horário.",
    })
  }

  await sendBookingRescheduledEmails({
    business: {
      name: business.name,
      email: business.email,
      notificationEmail: business.notificationEmail,
      phone: business.phone,
      address: business.address,
      slug: business.slug,
    },
    customer: {
      name: updatedBooking.customer.name,
      phone: updatedBooking.customer.phone,
      email: updatedBooking.customer.email,
    },
    booking: {
      id: updatedBooking.id,
      startAt: updatedBooking.startAt,
      endAt: updatedBooking.endAt,
      totalPriceCents: updatedBooking.totalPriceCents,
      totalDurationMin: updatedBooking.totalDurationMin,
    },
    previousBooking,
    services: updatedBooking.services.map((item) => ({
      name: item.service.name,
      priceCents: item.priceCents,
      durationMin: item.durationMin,
    })),
  })

  revalidatePath("/dashboard/bookings")
  revalidatePath("/dashboard")
  revalidatePath(`/book/${business.slug}`)

  redirectWithMessage({
    view,
    success:
      "Marcação reagendada com sucesso. O cliente e o negócio foram notificados por e-mail.",
  })
}