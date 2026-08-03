"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { getCurrentBusinessSlug } from "@/lib/current-business"
import { prisma } from "@/lib/prisma"

function redirectWithError(message: string): never {
  redirect(`/dashboard/blocked-days?error=${encodeURIComponent(message)}`)
}

function redirectWithSuccess(message: string): never {
  redirect(`/dashboard/blocked-days?success=${encodeURIComponent(message)}`)
}

function normalizeText(value: FormDataEntryValue | null) {
  return String(value ?? "").trim()
}

function parseDate(dateParam: string) {
  const [year, month, day] = dateParam.split("-").map(Number)

  if (!year || !month || !day) {
    return null
  }

  const parsedDate = new Date(year, month - 1, day, 0, 0, 0, 0)

  if (
    parsedDate.getFullYear() !== year ||
    parsedDate.getMonth() !== month - 1 ||
    parsedDate.getDate() !== day
  ) {
    return null
  }

  return parsedDate
}

function addDays(date: Date, days: number) {
  const result = new Date(date)
  result.setDate(result.getDate() + days)
  return result
}

function getTodayStart() {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return today
}

function getDaysBetween(startDate: Date, endDate: Date) {
  const days: Date[] = []

  const currentDate = new Date(startDate)

  while (currentDate <= endDate) {
    days.push(new Date(currentDate))
    currentDate.setDate(currentDate.getDate() + 1)
  }

  return days
}

async function getCurrentBusiness() {
  return prisma.business.findUnique({
    where: {
      slug: await getCurrentBusinessSlug(),
    },
  })
}

export async function createBlockedDaysAction(formData: FormData) {
  const dateFromRaw = normalizeText(formData.get("dateFrom"))
  const dateToRaw = normalizeText(formData.get("dateTo"))
  const reason = normalizeText(formData.get("reason"))

  if (!dateFromRaw) {
    redirectWithError("Informe a data inicial.")
  }

  const dateFrom = parseDate(dateFromRaw)
  const dateTo = parseDate(dateToRaw || dateFromRaw)

  if (!dateFrom || !dateTo) {
    redirectWithError("Informe uma data válida.")
  }

  const today = getTodayStart()

  if (dateFrom < today) {
    redirectWithError("A data inicial não pode ser anterior a hoje.")
  }

  if (dateTo < today) {
    redirectWithError("A data final não pode ser anterior a hoje.")
  }

  if (dateTo < dateFrom) {
    redirectWithError("A data final não pode ser anterior à data inicial.")
  }

  const days = getDaysBetween(dateFrom, dateTo)

  if (days.length > 90) {
    redirectWithError("O bloqueio não pode ter mais de 90 dias de uma vez.")
  }

  const business = await getCurrentBusiness()

  if (!business) {
    redirectWithError("Negócio não encontrado.")
  }

  await prisma.$transaction(async (tx) => {
    for (const day of days) {
      const nextDay = addDays(day, 1)

      await tx.blockedDay.deleteMany({
        where: {
          businessId: business.id,
          date: {
            gte: day,
            lt: nextDay,
          },
        },
      })

      await tx.blockedDay.create({
        data: {
          businessId: business.id,
          date: day,
          reason: reason || null,
        },
      })
    }
  })

  revalidatePath("/dashboard/blocked-days")
  revalidatePath(`/book/${business.slug}`)
  revalidatePath("/dashboard/settings/hours")

  const message =
    days.length === 1
      ? "Dia bloqueado com sucesso."
      : `${days.length} dias bloqueados com sucesso.`

  redirectWithSuccess(message)
}

export async function deleteBlockedDayAction(formData: FormData) {
  const blockedDayId = normalizeText(formData.get("blockedDayId"))

  if (!blockedDayId) {
    redirectWithError("Bloqueio não encontrado.")
  }

  const business = await getCurrentBusiness()

  if (!business) {
    redirectWithError("Negócio não encontrado.")
  }

  const deleteResult = await prisma.blockedDay.deleteMany({
    where: {
      id: blockedDayId,
      businessId: business.id,
    },
  })

  if (deleteResult.count === 0) {
    redirectWithError("Bloqueio não encontrado para este negócio.")
  }

  revalidatePath("/dashboard/blocked-days")
  revalidatePath(`/book/${business.slug}`)
  revalidatePath("/dashboard/settings/hours")

  redirectWithSuccess("Bloqueio removido com sucesso.")
}
