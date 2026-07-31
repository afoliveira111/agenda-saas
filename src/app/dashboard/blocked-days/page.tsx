import Link from "next/link"
import { notFound } from "next/navigation"
import { normalizeBusinessTheme } from "@/lib/business-theme"
import { getCurrentBusinessSlug } from "@/lib/current-business"
import { getDashboardThemeClasses } from "@/lib/dashboard-theme"
import { prisma } from "@/lib/prisma"
import {
  createBlockedDaysAction,
  deleteBlockedDayAction,
} from "./actions"

type BlockedDaysPageProps = {
  searchParams: Promise<{
    error?: string
    success?: string
  }>
}

function getTodayStart() {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return today
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("pt-PT", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(date)
}

function formatDateInput(date: Date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")

  return `${year}-${month}-${day}`
}

function getFeedbackClasses(type: "error" | "success") {
  if (type === "error") {
    return "border-red-300 bg-red-50 text-red-800"
  }

  return "border-emerald-300 bg-emerald-50 text-emerald-800"
}

function getInputClasses(theme: string) {
  if (theme === "WHITE") {
    return "mt-2 w-full rounded-[1.2rem] border border-zinc-300 bg-white px-4 py-4 text-zinc-950 outline-none transition placeholder:text-zinc-400 focus:border-zinc-950"
  }

  if (theme === "NUDE") {
    return "mt-2 w-full rounded-[1.2rem] border border-[#d8beb0] bg-white px-4 py-4 text-[#2b211c] outline-none transition placeholder:text-[#9d8576] focus:border-[#2b211c]"
  }

  return "mt-2 w-full rounded-[1.2rem] border border-zinc-800 bg-zinc-950 px-4 py-4 text-white outline-none transition placeholder:text-zinc-700 focus:border-white"
}

export default async function DashboardBlockedDaysPage({
  searchParams,
}: BlockedDaysPageProps) {
  const { error, success } = await searchParams

  const today = getTodayStart()

  const business = await prisma.business.findUnique({
    where: {
      slug: await getCurrentBusinessSlug(),
    },
    include: {
      blockedDays: {
        where: {
          date: {
            gte: today,
          },
        },
        orderBy: {
          date: "asc",
        },
      },
    },
  })

  if (!business) {
    notFound()
  }

  const currentTheme = normalizeBusinessTheme(business.theme)
  const theme = getDashboardThemeClasses(business.theme)
  const inputClasses = getInputClasses(currentTheme)
  const todayInput = formatDateInput(today)

  return (
    <main className={`min-h-screen ${theme.page}`}>
      <section className="mx-auto max-w-[88rem] px-5 py-8 sm:px-6 lg:py-10">
        <div className={`rounded-[2.3rem] border p-8 shadow-2xl lg:p-10 ${theme.hero}`}>
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className={`text-sm uppercase tracking-[0.3em] ${theme.subtle}`}>
                Configurações
              </p>

              <h1
                className={`mt-3 text-4xl font-bold tracking-tight md:text-5xl ${theme.title}`}
              >
                Bloqueios de agenda
              </h1>

              <p className={`mt-4 max-w-2xl ${theme.muted}`}>
                Bloqueie dias específicos para férias, feriados, ausências ou
                qualquer situação em que não deseja receber novas marcações.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Link
                href="/dashboard/settings/hours"
                className={`rounded-full border px-5 py-3 text-center font-semibold transition ${theme.secondaryButton}`}
              >
                Ver horários
              </Link>

              <Link
                href={`/book/${business.slug}`}
                className={`rounded-full border px-5 py-3 text-center font-semibold transition ${theme.primaryButton}`}
              >
                Abrir página pública
              </Link>
            </div>
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-3">
            <div className={`rounded-[1.7rem] border p-5 ${theme.card}`}>
              <p className={`text-sm ${theme.muted}`}>Bloqueios futuros</p>

              <p className={`mt-2 text-3xl font-bold ${theme.title}`}>
                {business.blockedDays.length}
              </p>
            </div>

            <div className={`rounded-[1.7rem] border p-5 ${theme.card}`}>
              <p className={`text-sm ${theme.muted}`}>Link público</p>

              <p className={`mt-2 truncate text-lg font-semibold ${theme.title}`}>
                /book/{business.slug}
              </p>
            </div>

            <div className={`rounded-[1.7rem] border p-5 ${theme.card}`}>
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

        <div className="mt-8 grid gap-8 lg:grid-cols-[420px_1fr]">
          <div className={`rounded-[2.2rem] border p-6 shadow-2xl ${theme.panel}`}>
            <p className={`text-xs font-semibold uppercase tracking-[0.3em] ${theme.subtle}`}>
              Novo bloqueio
            </p>

            <h2 className={`mt-3 text-2xl font-bold ${theme.title}`}>
              Bloquear data
            </h2>

            <p className={`mt-3 text-sm ${theme.muted}`}>
              Pode bloquear apenas um dia ou um período inteiro. Esses dias não
              aparecerão como disponíveis para o cliente.
            </p>

            <form action={createBlockedDaysAction} className="mt-6 grid gap-4">
              <div>
                <label className={`text-sm font-medium ${theme.title}`}>
                  Data inicial
                </label>

                <input
                  type="date"
                  name="dateFrom"
                  required
                  min={todayInput}
                  defaultValue={todayInput}
                  className={inputClasses}
                />
              </div>

              <div>
                <label className={`text-sm font-medium ${theme.title}`}>
                  Data final
                </label>

                <input
                  type="date"
                  name="dateTo"
                  min={todayInput}
                  className={inputClasses}
                />

                <p className={`mt-2 text-xs ${theme.subtle}`}>
                  Deixe vazio para bloquear apenas a data inicial.
                </p>
              </div>

              <div>
                <label className={`text-sm font-medium ${theme.title}`}>
                  Motivo
                </label>

                <textarea
                  name="reason"
                  rows={4}
                  maxLength={180}
                  placeholder="Ex: Férias, feriado, formação, ausência pessoal..."
                  className={`${inputClasses} resize-none`}
                />
              </div>

              <button
                type="submit"
                className={`mt-2 rounded-full border px-5 py-4 font-semibold transition ${theme.primaryButton}`}
              >
                Criar bloqueio
              </button>
            </form>
          </div>

          <div className={`rounded-[2.2rem] border p-5 shadow-2xl ${theme.panel}`}>
            <div className={`border-b px-2 pb-4 ${theme.line}`}>
              <p className={`text-xs font-semibold uppercase tracking-[0.3em] ${theme.subtle}`}>
                Datas indisponíveis
              </p>

              <h2 className={`mt-3 text-2xl font-bold ${theme.title}`}>
                Bloqueios futuros
              </h2>

              <p className={`mt-2 text-sm ${theme.muted}`}>
                As datas abaixo ficam escondidas da página pública para novas
                marcações.
              </p>
            </div>

            {business.blockedDays.length === 0 ? (
              <div
                className={`mt-4 rounded-3xl border p-10 text-center ${theme.card}`}
              >
                <p className={theme.muted}>
                  Ainda não existem bloqueios futuros.
                </p>
              </div>
            ) : (
              <div className="mt-4 grid gap-4">
                {business.blockedDays.map((blockedDay) => (
                  <div
                    key={blockedDay.id}
                    className={`rounded-[1.7rem] border p-5 ${theme.card}`}
                  >
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <p className={`text-xs font-semibold uppercase tracking-[0.3em] ${theme.subtle}`}>
                          Dia bloqueado
                        </p>

                        <h3 className={`mt-3 text-xl font-bold ${theme.title}`}>
                          {formatDate(blockedDay.date)}
                        </h3>

                        <p className={`mt-2 text-sm ${theme.muted}`}>
                          {blockedDay.reason || "Sem motivo informado."}
                        </p>
                      </div>

                      <form action={deleteBlockedDayAction}>
                        <input
                          type="hidden"
                          name="blockedDayId"
                          value={blockedDay.id}
                        />

                        <button
                          type="submit"
                          className={`rounded-full border px-4 py-3 text-sm font-semibold transition ${theme.secondaryButton}`}
                        >
                          Remover bloqueio
                        </button>
                      </form>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>
    </main>
  )
}