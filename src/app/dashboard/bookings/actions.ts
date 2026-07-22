"use server"

import { revalidatePath } from "next/cache"
import { prisma } from "@/lib/prisma"

const allowedStatuses = ["CONFIRMED", "CANCELLED", "COMPLETED", "NO_SHOW"] as const

type BookingStatusValue = (typeof allowedStatuses)[number]

export async function updateBookingStatusAction(formData: FormData) {
  const bookingId = String(formData.get("bookingId") ?? "")
  const status = String(formData.get("status") ?? "") as BookingStatusValue

  if (!bookingId) {
    throw new Error("ID da marcação em falta.")
  }

  if (!allowedStatuses.includes(status)) {
    throw new Error("Estado inválido.")
  }

  await prisma.booking.update({
    where: {
      id: bookingId,
    },
    data: {
      status,
    },
  })

  revalidatePath("/dashboard/bookings")
}