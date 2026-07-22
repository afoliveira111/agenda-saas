"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { getCurrentBusinessSlug } from "@/lib/current-business"

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

  return new Date(year, month - 1, day, 0, 0, 0, 0)
}

function addDays(date: Date, days: number) {
  const result = new Date(date)
  result.setDate(result.getDate() + days)
  return result
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

async function getDemoBusiness() {
  return prisma.business.findUnique({
    where: {
      slug: (await getCurrentBusinessSlug()),
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

  if (dateTo < dateFrom) {
    redirectWithError("A data final não pode ser anterior à data inicial.")
  }

  const days = getDaysBetween(dateFrom, dateTo)

  if (days.length > 90) {
    redirectWithError("O bloqueio não pode ter mais de 90 dias de uma vez.")
  }

  const business = await getDemoBusiness()

  if (!business) {
    redirectWithError("Negócio demo não encontrado.")
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

  const business = await getDemoBusiness()

  if (!business) {
    redirectWithError("Negócio demo não encontrado.")
  }

  await prisma.blockedDay.delete({
    where: {
      id: blockedDayId,
    },
  })

  revalidatePath("/dashboard/blocked-days")
  revalidatePath(`/book/${business.slug}`)
  revalidatePath("/dashboard/settings/hours")

  redirectWithSuccess("Bloqueio removido com sucesso.")
}