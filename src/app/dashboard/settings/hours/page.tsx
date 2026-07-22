import Link from "next/link"
import { notFound } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { getCurrentBusinessSlug } from "@/lib/current-business"
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
  dayOfWeek: number
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

export default async function DashboardHoursPage({
  searchParams,
}: HoursPageProps) {
  const { error, success } = await searchParams

  const business = await prisma.business.findUnique({
    where: {
      slug: (await getCurrentBusinessSlug()),
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

  const hasSavedWorkHours = business.workHours.length > 0

  const activeDays = business.workHours.filter((workHour) => workHour.active)

  const todayStart = getTodayStart()
  const tomorrowStart = getTomorrowStart()

  const isTodayBlocked = business.blockedDays.some((blockedDay) => {
    return blockedDay.date >= todayStart && blockedDay.date < tomorrowStart
  })

  return (
    <main className="min-h-screen bg-zinc-950 text-white">
      <section className="mx-auto max-w-6xl px-6 py-10">
        <div className="rounded-[2rem] border border-zinc-800 bg-gradient-to-br from-zinc-900 via-zinc-950 to-black p-8 shadow-2xl">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-zinc-500">
                Configurações
              </p>

              <h1 className="mt-3 text-4xl font-bold tracking-tight text-white md:text-5xl">
                Horários de atendimento
              </h1>

              <p className="mt-4 max-w-2xl text-zinc-400">
                Defina os dias e horários em que o negócio aceita marcações.
                A página pública mostra apenas datas com atendimento disponível.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Link
                href="/dashboard/services"
                className="rounded-2xl border border-zinc-700 px-5 py-3 text-center font-semibold text-zinc-300 transition hover:border-white hover:text-white"
              >
                Ver serviços
              </Link>

              <Link
                href={`/book/${business.slug}`}
                className="rounded-2xl border border-white bg-white px-5 py-3 text-center font-semibold text-zinc-950 transition hover:bg-zinc-200"
              >
                Abrir página pública
              </Link>
            </div>
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-3">
            <div className="rounded-3xl border border-zinc-800 bg-black/40 p-5">
              <p className="text-sm text-zinc-500">Dias ativos</p>
              <p className="mt-2 text-3xl font-bold">{activeDays.length}</p>
            </div>

            <div className="rounded-3xl border border-zinc-800 bg-black/40 p-5">
              <p className="text-sm text-zinc-500">Agenda de hoje</p>
              <p className="mt-2 text-lg font-semibold">
                {isTodayBlocked ? "Bloqueada" : "Aberta"}
              </p>
            </div>

            <div className="rounded-3xl border border-zinc-800 bg-black/40 p-5">
              <p className="text-sm text-zinc-500">Negócio</p>
              <p className="mt-2 truncate text-lg font-semibold">
                {business.name}
              </p>
            </div>
          </div>
        </div>

        {(error || success) && (
          <div
            className={`mt-6 rounded-3xl border px-5 py-4 text-sm font-medium ${
              error
                ? "border-red-900/70 bg-red-950/30 text-red-300"
                : "border-zinc-700 bg-zinc-900 text-zinc-200"
            }`}
          >
            {error || success}
          </div>
        )}

        <div className="mt-8 rounded-[2rem] border border-zinc-800 bg-black p-6 shadow-2xl">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-zinc-600">
                Pausa rápida
              </p>

              <h2 className="mt-3 text-2xl font-bold">
                {isTodayBlocked
                  ? "Agenda de hoje bloqueada"
                  : "Bloquear agenda de hoje"}
              </h2>

              <p className="mt-3 max-w-2xl text-sm text-zinc-500">
                Use isto quando o profissional atendeu pela manhã, precisou sair
                ou não vai voltar ao espaço. Isso impede novas marcações para
                hoje, sem alterar a rotina semanal.
              </p>

              <p className="mt-2 text-xs text-zinc-600">
                Observação: marcações já confirmadas não são canceladas
                automaticamente.
              </p>
            </div>

            {isTodayBlocked ? (
              <form action={unblockTodayAction}>
                <button
                  type="submit"
                  className="w-full rounded-2xl border border-white bg-white px-5 py-4 font-semibold text-zinc-950 transition hover:bg-zinc-200 lg:w-auto"
                >
                  Reabrir agenda de hoje
                </button>
              </form>
            ) : (
              <form action={blockTodayAction}>
                <button
                  type="submit"
                  className="w-full rounded-2xl border border-zinc-700 bg-zinc-950 px-5 py-4 font-semibold text-zinc-200 transition hover:border-white hover:text-white lg:w-auto"
                >
                  Bloquear agenda de hoje
                </button>
              </form>
            )}
          </div>
        </div>

        <form
          action={updateWorkHoursAction}
          className="mt-8 rounded-[2rem] border border-zinc-800 bg-black p-6 shadow-2xl"
        >
          <div className="flex flex-col gap-4 border-b border-zinc-800 pb-6 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-zinc-600">
                Semana
              </p>

              <h2 className="mt-3 text-2xl font-bold">Configurar horários</h2>

              <p className="mt-3 max-w-2xl text-sm text-zinc-500">
                Marque os dias em que o negócio atende e defina o horário de
                início e fim. Dias desmarcados aparecem como indisponíveis.
              </p>
            </div>

            <button
              type="submit"
              className="rounded-2xl border border-white bg-white px-5 py-4 font-semibold text-zinc-950 transition hover:bg-zinc-200"
            >
              Guardar horários
            </button>
          </div>

          <div className="mt-6 grid gap-4">
            {weekDays.map((day) => {
              const workHour = getWorkHourForDay(
                business.workHours,
                day.value
              )

              const isActive = hasSavedWorkHours
                ? workHour?.active ?? false
                : day.value !== 0

              const startTime = workHour?.startTime ?? day.defaultStart
              const endTime = workHour?.endTime ?? day.defaultEnd

              return (
                <div
                  key={day.value}
                  className="grid gap-4 rounded-3xl border border-zinc-800 bg-zinc-950 p-5 md:grid-cols-[1fr_180px_180px]"
                >
                  <label className="flex cursor-pointer items-center gap-4">
                    <input
                      type="checkbox"
                      name={`active_${day.value}`}
                      value="true"
                      defaultChecked={isActive}
                      className="h-5 w-5 accent-white"
                    />

                    <div>
                      <p className="font-semibold text-white">{day.label}</p>
                      <p className="mt-1 text-sm text-zinc-600">
                        Ative ou desative este dia de atendimento.
                      </p>
                    </div>
                  </label>

                  <div>
                    <label className="text-sm font-medium text-zinc-400">
                      Início
                    </label>

                    <input
                      type="time"
                      name={`start_${day.value}`}
                      defaultValue={startTime}
                      className="mt-2 w-full rounded-2xl border border-zinc-800 bg-black px-4 py-3 text-white outline-none transition focus:border-white"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium text-zinc-400">
                      Fim
                    </label>

                    <input
                      type="time"
                      name={`end_${day.value}`}
                      defaultValue={endTime}
                      className="mt-2 w-full rounded-2xl border border-zinc-800 bg-black px-4 py-3 text-white outline-none transition focus:border-white"
                    />
                  </div>
                </div>
              )
            })}
          </div>

          <div className="mt-6 rounded-3xl border border-zinc-800 bg-zinc-950 p-5">
            <p className="text-sm text-zinc-500">
              Nota: por enquanto cada dia tem apenas um intervalo de atendimento.
              Depois podemos adicionar pausa de almoço, múltiplos turnos ou
              horários diferentes por profissional.
            </p>
          </div>
        </form>
      </section>
    </main>
  )
}