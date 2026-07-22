"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { getCurrentBusinessSlug } from "@/lib/current-business"

const weekDays = [
  {
    value: 1,
    defaultStart: "09:00",
    defaultEnd: "18:00",
  },
  {
    value: 2,
    defaultStart: "09:00",
    defaultEnd: "18:00",
  },
  {
    value: 3,
    defaultStart: "09:00",
    defaultEnd: "18:00",
  },
  {
    value: 4,
    defaultStart: "09:00",
    defaultEnd: "18:00",
  },
  {
    value: 5,
    defaultStart: "09:00",
    defaultEnd: "18:00",
  },
  {
    value: 6,
    defaultStart: "09:00",
    defaultEnd: "13:00",
  },
  {
    value: 0,
    defaultStart: "09:00",
    defaultEnd: "13:00",
  },
]

function redirectWithError(message: string): never {
  redirect(`/dashboard/settings/hours?error=${encodeURIComponent(message)}`)
}

function redirectWithSuccess(message: string): never {
  redirect(`/dashboard/settings/hours?success=${encodeURIComponent(message)}`)
}

function normalizeText(value: FormDataEntryValue | null) {
  return String(value ?? "").trim()
}

function isValidTime(time: string) {
  return /^([01]\d|2[0-3]):([0-5]\d)$/.test(time)
}

function timeToMinutes(time: string) {
  const [hours, minutes] = time.split(":").map(Number)
  return hours * 60 + minutes
}

function getTodayStart() {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return today
}

function getTomorrowStart() {
  const tomorrow = getTodayStart()
  tomorrow.setDate(tomorrow.getDate() + 1)
  return tomorrow
}

async function getDemoBusiness() {
  return prisma.business.findUnique({
    where: {
      slug: (await getCurrentBusinessSlug()),
    },
  })
}

export async function updateWorkHoursAction(formData: FormData) {
  const business = await getDemoBusiness()

  if (!business) {
    redirectWithError("Negócio demo não encontrado. Rode o seed novamente.")
  }

  const newWorkHours = weekDays.map((day) => {
    const active = formData.get(`active_${day.value}`) === "true"

    const startTime =
      normalizeText(formData.get(`start_${day.value}`)) || day.defaultStart

    const endTime =
      normalizeText(formData.get(`end_${day.value}`)) || day.defaultEnd

    if (active) {
      if (!isValidTime(startTime) || !isValidTime(endTime)) {
        redirectWithError("Informe horários válidos no formato HH:MM.")
      }

      if (timeToMinutes(startTime) >= timeToMinutes(endTime)) {
        redirectWithError(
          "O horário de início precisa ser menor que o horário de fim."
        )
      }
    }

    return {
      businessId: business.id,
      dayOfWeek: day.value,
      startTime,
      endTime,
      active,
    }
  })

  await prisma.$transaction(async (tx) => {
    await tx.workHour.deleteMany({
      where: {
        businessId: business.id,
      },
    })

    await tx.workHour.createMany({
      data: newWorkHours,
    })
  })

  revalidatePath("/dashboard/settings/hours")
  revalidatePath(`/book/${business.slug}`)

  redirectWithSuccess("Horários atualizados com sucesso.")
}

export async function blockTodayAction() {
  const business = await getDemoBusiness()

  if (!business) {
    redirectWithError("Negócio demo não encontrado.")
  }

  const todayStart = getTodayStart()
  const tomorrowStart = getTomorrowStart()

  const existingBlock = await prisma.blockedDay.findFirst({
    where: {
      businessId: business.id,
      date: {
        gte: todayStart,
        lt: tomorrowStart,
      },
    },
  })

  if (!existingBlock) {
    await prisma.blockedDay.create({
      data: {
        businessId: business.id,
        date: todayStart,
        reason: "Bloqueio rápido: agenda pausada para hoje.",
      },
    })
  }

  revalidatePath("/dashboard/settings/hours")
  revalidatePath(`/book/${business.slug}`)

  redirectWithSuccess(
    "Agenda de hoje bloqueada. Novas marcações para hoje não aparecerão."
  )
}

export async function unblockTodayAction() {
  const business = await getDemoBusiness()

  if (!business) {
    redirectWithError("Negócio demo não encontrado.")
  }

  const todayStart = getTodayStart()
  const tomorrowStart = getTomorrowStart()

  await prisma.blockedDay.deleteMany({
    where: {
      businessId: business.id,
      date: {
        gte: todayStart,
        lt: tomorrowStart,
      },
    },
  })

  revalidatePath("/dashboard/settings/hours")
  revalidatePath(`/book/${business.slug}`)

  redirectWithSuccess("Agenda de hoje reaberta.")
}