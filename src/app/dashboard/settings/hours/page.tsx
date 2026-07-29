import Link from "next/link"
import { notFound } from "next/navigation"
import { normalizeBusinessTheme } from "@/lib/business-theme"
import { getCurrentBusinessSlug } from "@/lib/current-business"
import { getDashboardThemeClasses } from "@/lib/dashboard-theme"
import { prisma } from "@/lib/prisma"
import { timeOptions } from "@/lib/time-options"
import {
  blockTodayAction,
  unblockTodayAction,
  updateWorkHoursAction,
} from "./actions"

type HoursPageProps = {
  searchParams: Promise<{
    error?: string
    success?: string
  }>
}

const weekDays = [
  {
    value: 1,
    label: "Segunda-feira",
    shortLabel: "Seg",
    defaultStart: "09:00",
    defaultEnd: "18:00",
  },
  {
    value: 2,
    label: "Terça-feira",
    shortLabel: "Ter",
    defaultStart: "09:00",
    defaultEnd: "18:00",
  },
  {
    value: 3,
    label: "Quarta-feira",
    shortLabel: "Qua",
    defaultStart: "09:00",
    defaultEnd: "18:00",
  },
  {
    value: 4,
    label: "Quinta-feira",
    shortLabel: "Qui",
    defaultStart: "09:00",
    defaultEnd: "18:00",
  },
  {
    value: 5,
    label: "Sexta-feira",
    shortLabel: "Sex",
    defaultStart: "09:00",
    defaultEnd: "18:00",
  },
  {
    value: 6,
    label: "Sábado",
    shortLabel: "Sáb",
    defaultStart: "09:00",
    defaultEnd: "13:00",
  },
  {
    value: 0,
    label: "Domingo",
    shortLabel: "Dom",
    defaultStart: "09:00",
    defaultEnd: "13:00",
  },
]

function getWorkHourForDay(
  workHours: Array<{
    dayOfWeek: number
    startTime: string
    endTime: string
    active: boolean
  }>,
  dayOfWeek: number,
) {
  return workHours.find((workHour) => workHour.dayOfWeek === dayOfWeek)
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

function getFeedbackClasses(type: "error" | "success") {
  if (type === "error") {
    return "border-red-300 bg-red-50 text-red-800"
  }

  return "border-emerald-300 bg-emerald-50 text-emerald-800"
}

function getSelectClasses(theme: string) {
  if (theme === "WHITE") {
    return "mt-2 w-full rounded-2xl border border-zinc-300 bg-white px-4 py-3 text-zinc-950 outline-none transition focus:border-zinc-950"
  }

  if (theme === "NUDE") {
    return "mt-2 w-full rounded-2xl border border-[#d8beb0] bg-white px-4 py-3 text-[#2b211c] outline-none transition focus:border-[#2b211c]"
  }

  return "mt-2 w-full rounded-2xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-white outline-none transition focus:border-white"
}

function getTimeOptionsWithCurrentValue(currentValue: string) {
  if (timeOptions.includes(currentValue)) {
    return timeOptions
  }

  return [currentValue, ...timeOptions]
}

type TimeSelectProps = {
  name: string
  defaultValue: string
  className: string
}

function TimeSelect({ name, defaultValue, className }: TimeSelectProps) {
  const options = getTimeOptionsWithCurrentValue(defaultValue)

  return (
    <select name={name} required defaultValue={defaultValue} className={className}>
      {options.map((option) => (
        <option key={option} value={option}>
          {option}
        </option>
      ))}
    </select>
  )
}

export default async function DashboardHoursPage({
  searchParams,
}: HoursPageProps) {
  const { error, success } = await searchParams

  const business = await prisma.business.findUnique({
    where: {
      slug: await getCurrentBusinessSlug(),
    },
    include: {
      workHours: {
        orderBy: {
          dayOfWeek: "asc",
        },
      },
      blockedDays: true,
    },
  })

  if (!business) {
    notFound()
  }

  const currentTheme = normalizeBusinessTheme(business.theme)
  const theme = getDashboardThemeClasses(business.theme)
  const selectClasses = getSelectClasses(currentTheme)

  const hasSavedWorkHours = business.workHours.length > 0
  const activeDays = business.workHours.filter((workHour) => workHour.active)

  const todayStart = getTodayStart()
  const tomorrowStart = getTomorrowStart()

  const isTodayBlocked = business.blockedDays.some((blockedDay) => {
    return blockedDay.date >= todayStart && blockedDay.date < tomorrowStart
  })

  return (
    <main className={`min-h-screen ${theme.page}`}>
      <section className="mx-auto max-w-6xl px-6 py-10">
        <div className={`rounded-[2rem] border p-8 shadow-2xl ${theme.hero}`}>
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className={`text-sm uppercase tracking-[0.3em] ${theme.subtle}`}>
                Configurações
              </p>

              <h1
                className={`mt-3 text-4xl font-bold tracking-tight md:text-5xl ${theme.title}`}
              >
                Horários de atendimento
              </h1>

              <p className={`mt-4 max-w-2xl ${theme.muted}`}>
                Defina os dias e horários em que o negócio aceita marcações. A
                página pública mostra apenas datas com atendimento disponível.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Link
                href="/dashboard/services"
                className={`rounded-2xl border px-5 py-3 text-center font-semibold transition ${theme.secondaryButton}`}
              >
                Ver serviços
              </Link>

              <Link
                href={`/book/${business.slug}`}
                className={`rounded-2xl border px-5 py-3 text-center font-semibold transition ${theme.primaryButton}`}
              >
                Abrir página pública
              </Link>
            </div>
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-3">
            <div className={`rounded-3xl border p-5 ${theme.card}`}>
              <p className={`text-sm ${theme.muted}`}>Dias ativos</p>

              <p className={`mt-2 text-3xl font-bold ${theme.title}`}>
                {activeDays.length}
              </p>
            </div>

            <div className={`rounded-3xl border p-5 ${theme.card}`}>
              <p className={`text-sm ${theme.muted}`}>Agenda de hoje</p>

              <p className={`mt-2 text-lg font-semibold ${theme.title}`}>
                {isTodayBlocked ? "Bloqueada" : "Aberta"}
              </p>
            </div>

            <div className={`rounded-3xl border p-5 ${theme.card}`}>
              <p className={`text-sm ${theme.muted}`}>Negócio</p>

              <p className={`mt-2 truncate text-lg font-semibold ${theme.title}`}>
                {business.name}
              </p>
            </div>
          </div>
        </div>

        {(error || success) && (
          <div
            className={`mt-6 rounded-3xl border px-5 py-4 text-sm font-semibold ${
              error
                ? getFeedbackClasses("error")
                : getFeedbackClasses("success")
            }`}
          >
            {error || success}
          </div>
        )}

        <div className={`mt-8 rounded-[2rem] border p-6 shadow-2xl ${theme.panel}`}>
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className={`text-xs font-semibold uppercase tracking-[0.3em] ${theme.subtle}`}>
                Pausa rápida
              </p>

              <h2 className={`mt-3 text-2xl font-bold ${theme.title}`}>
                {isTodayBlocked
                  ? "Agenda de hoje bloqueada"
                  : "Bloquear agenda de hoje"}
              </h2>

              <p className={`mt-3 max-w-2xl text-sm ${theme.muted}`}>
                Use isto quando o profissional atendeu pela manhã, precisou sair
                ou não vai voltar ao espaço. Isso impede novas marcações para
                hoje, sem alterar a rotina semanal.
              </p>

              <p className={`mt-2 text-xs ${theme.subtle}`}>
                Observação: marcações já confirmadas não são canceladas
                automaticamente.
              </p>
            </div>

            {isTodayBlocked ? (
              <form action={unblockTodayAction}>
                <button
                  type="submit"
                  className={`w-full rounded-2xl border px-5 py-4 font-semibold transition lg:w-auto ${theme.primaryButton}`}
                >
                  Reabrir agenda de hoje
                </button>
              </form>
            ) : (
              <form action={blockTodayAction}>
                <button
                  type="submit"
                  className={`w-full rounded-2xl border px-5 py-4 font-semibold transition lg:w-auto ${theme.secondaryButton}`}
                >
                  Bloquear agenda de hoje
                </button>
              </form>
            )}
          </div>
        </div>

        <form
          action={updateWorkHoursAction}
          className={`mt-8 rounded-[2rem] border p-6 shadow-2xl ${theme.panel}`}
        >
          <div
            className={`flex flex-col gap-4 border-b pb-6 sm:flex-row sm:items-end sm:justify-between ${theme.line}`}
          >
            <div>
              <p className={`text-xs font-semibold uppercase tracking-[0.3em] ${theme.subtle}`}>
                Semana
              </p>

              <h2 className={`mt-3 text-2xl font-bold ${theme.title}`}>
                Configurar horários
              </h2>

              <p className={`mt-3 max-w-2xl text-sm ${theme.muted}`}>
                Marque os dias em que o negócio atende e defina o horário de
                início e fim. Dias desmarcados aparecem como indisponíveis.
              </p>
            </div>

            <button
              type="submit"
              className={`rounded-2xl border px-5 py-4 font-semibold transition ${theme.primaryButton}`}
            >
              Guardar horários
            </button>
          </div>

          <div className="mt-6 grid gap-4">
            {weekDays.map((day) => {
              const workHour = getWorkHourForDay(
                business.workHours,
                day.value,
              )

              const isActive = hasSavedWorkHours
                ? workHour?.active ?? false
                : day.value !== 0

              const startTime = workHour?.startTime ?? day.defaultStart
              const endTime = workHour?.endTime ?? day.defaultEnd

              return (
                <div
                  key={day.value}
                  className={`grid gap-4 rounded-3xl border p-5 md:grid-cols-[1fr_180px_180px] ${theme.card}`}
                >
                  <label className="flex cursor-pointer items-center gap-4">
                    <input
                      type="checkbox"
                      name={`active_${day.value}`}
                      value="true"
                      defaultChecked={isActive}
                      className="h-5 w-5 accent-current"
                    />

                    <div>
                      <p className={`font-semibold ${theme.title}`}>
                        {day.label}
                      </p>

                      <p className={`mt-1 text-sm ${theme.subtle}`}>
                        Ative ou desative este dia de atendimento.
                      </p>
                    </div>
                  </label>

                  <div>
                    <label className={`text-sm font-medium ${theme.title}`}>
                      Início
                    </label>

                    <TimeSelect
                      name={`start_${day.value}`}
                      defaultValue={startTime}
                      className={selectClasses}
                    />
                  </div>

                  <div>
                    <label className={`text-sm font-medium ${theme.title}`}>
                      Fim
                    </label>

                    <TimeSelect
                      name={`end_${day.value}`}
                      defaultValue={endTime}
                      className={selectClasses}
                    />
                  </div>
                </div>
              )
            })}
          </div>

          <div className={`mt-6 rounded-3xl border p-5 ${theme.card}`}>
            <p className={`text-sm ${theme.muted}`}>
              Nota: por enquanto cada dia tem apenas um intervalo de
              atendimento. Depois podemos adicionar pausa de almoço, múltiplos
              turnos ou horários diferentes por profissional.
            </p>
          </div>
        </form>
      </section>
    </main>
  )
}