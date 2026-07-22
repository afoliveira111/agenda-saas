"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { getCurrentBusinessSlug } from "@/lib/current-business"

function redirectWithError(message: string): never {
  redirect(`/dashboard/tools?error=${encodeURIComponent(message)}`)
}

function redirectWithSuccess(message: string): never {
  redirect(`/dashboard/tools?success=${encodeURIComponent(message)}`)
}

function normalizeText(value: FormDataEntryValue | null) {
  return String(value ?? "").trim()
}

async function getCurrentBusinessOrRedirect() {
  const currentBusinessSlug = await getCurrentBusinessSlug()

  const business = await prisma.business.findUnique({
    where: {
      slug: currentBusinessSlug,
    },
  })

  if (!business) {
    redirectWithError("Negócio selecionado não encontrado.")
  }

  return business
}

function validateDangerConfirmation(formData: FormData) {
  const confirmText = normalizeText(formData.get("confirmText"))

  if (confirmText !== "LIMPAR") {
    redirectWithError('Para confirmar, escreva exatamente "LIMPAR".')
  }
}

function revalidateDashboardPaths(businessSlug: string) {
  revalidatePath("/dashboard")
  revalidatePath("/dashboard/bookings")
  revalidatePath("/dashboard/customers")
  revalidatePath("/dashboard/services")
  revalidatePath("/dashboard/tools")
  revalidatePath(`/book/${businessSlug}`)
}

export async function clearAllBookingsAndCustomersAction(formData: FormData) {
  validateDangerConfirmation(formData)

  const business = await getCurrentBusinessOrRedirect()

  const result = await prisma.$transaction(async (tx) => {
    const bookings = await tx.booking.findMany({
      where: {
        businessId: business.id,
      },
      select: {
        id: true,
      },
    })

    const bookingIds = bookings.map((booking) => booking.id)

    if (bookingIds.length > 0) {
      await tx.bookingService.deleteMany({
        where: {
          bookingId: {
            in: bookingIds,
          },
        },
      })

      await tx.booking.deleteMany({
        where: {
          id: {
            in: bookingIds,
          },
        },
      })
    }

    const deletedCustomers = await tx.customer.deleteMany({
      where: {
        businessId: business.id,
      },
    })

    return {
      bookingsDeleted: bookingIds.length,
      customersDeleted: deletedCustomers.count,
    }
  })

  revalidateDashboardPaths(business.slug)

  redirectWithSuccess(
    `Limpeza concluída. Marcações apagadas: ${result.bookingsDeleted}. Clientes apagados: ${result.customersDeleted}.`
  )
}

export async function clearCancelledBookingsAction() {
  const business = await getCurrentBusinessOrRedirect()

  const result = await prisma.$transaction(async (tx) => {
    const bookings = await tx.booking.findMany({
      where: {
        businessId: business.id,
        status: "CANCELLED",
      },
      select: {
        id: true,
      },
    })

    const bookingIds = bookings.map((booking) => booking.id)

    if (bookingIds.length === 0) {
      return {
        deleted: 0,
      }
    }

    await tx.bookingService.deleteMany({
      where: {
        bookingId: {
          in: bookingIds,
        },
      },
    })

    const deletedBookings = await tx.booking.deleteMany({
      where: {
        id: {
          in: bookingIds,
        },
      },
    })

    return {
      deleted: deletedBookings.count,
    }
  })

  revalidateDashboardPaths(business.slug)

  redirectWithSuccess(
    result.deleted === 0
      ? "Não havia marcações canceladas para apagar."
      : `Marcações canceladas apagadas: ${result.deleted}.`
  )
}

export async function clearCustomersWithoutBookingsAction() {
  const business = await getCurrentBusinessOrRedirect()

  const deletedCustomers = await prisma.customer.deleteMany({
    where: {
      businessId: business.id,
      bookings: {
        none: {},
      },
    },
  })

  revalidateDashboardPaths(business.slug)

  redirectWithSuccess(
    deletedCustomers.count === 0
      ? "Não havia clientes sem marcações para apagar."
      : `Clientes sem marcações apagados: ${deletedCustomers.count}.`
  )
}

export async function resetReminderEmailsAction() {
  const business = await getCurrentBusinessOrRedirect()

  const updatedBookings = await prisma.booking.updateMany({
    where: {
      businessId: business.id,
      reminderEmailSentAt: {
        not: null,
      },
    },
    data: {
      reminderEmailSentAt: null,
    },
  })

  revalidateDashboardPaths(business.slug)

  redirectWithSuccess(
    updatedBookings.count === 0
      ? "Não havia lembretes para resetar."
      : `Lembretes resetados: ${updatedBookings.count}.`
  )
}