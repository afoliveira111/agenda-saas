import Link from "next/link"
import { notFound } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { getCurrentBusinessSlug } from "@/lib/current-business"
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

export default async function DashboardBlockedDaysPage({
  searchParams,
}: BlockedDaysPageProps) {
  const { error, success } = await searchParams

  const today = getTodayStart()

  const business = await prisma.business.findUnique({
    where: {
      slug: (await getCurrentBusinessSlug()),
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

  const todayInput = formatDateInput(today)

  return (
    <main className="min-h-screen bg-zinc-950 text-white">
      <section className="mx-auto max-w-7xl px-6 py-10">
        <div className="rounded-[2rem] border border-zinc-800 bg-gradient-to-br from-zinc-900 via-zinc-950 to-black p-8 shadow-2xl">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-zinc-500">
                Configurações
              </p>

              <h1 className="mt-3 text-4xl font-bold tracking-tight text-white md:text-5xl">
                Bloqueios de agenda
              </h1>

              <p className="mt-4 max-w-2xl text-zinc-400">
                Bloqueie dias específicos para férias, feriados, ausências ou
                qualquer situação em que não deseja receber novas marcações.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Link
                href="/dashboard/settings/hours"
                className="rounded-2xl border border-zinc-700 px-5 py-3 text-center font-semibold text-zinc-300 transition hover:border-white hover:text-white"
              >
                Ver horários
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
              <p className="text-sm text-zinc-500">Bloqueios futuros</p>
              <p className="mt-2 text-3xl font-bold">
                {business.blockedDays.length}
              </p>
            </div>

            <div className="rounded-3xl border border-zinc-800 bg-black/40 p-5">
              <p className="text-sm text-zinc-500">Link público</p>
              <p className="mt-2 truncate text-lg font-semibold">
                /book/{business.slug}
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

        <div className="mt-8 grid gap-8 lg:grid-cols-[420px_1fr]">
          <div className="rounded-[2rem] border border-zinc-800 bg-black p-6 shadow-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-zinc-600">
              Novo bloqueio
            </p>

            <h2 className="mt-3 text-2xl font-bold">Bloquear data</h2>

            <p className="mt-3 text-sm text-zinc-500">
              Pode bloquear apenas um dia ou um período inteiro. Esses dias não
              aparecerão como disponíveis para o cliente.
            </p>

            <form action={createBlockedDaysAction} className="mt-6 grid gap-4">
              <div>
                <label className="text-sm font-medium text-zinc-300">
                  Data inicial
                </label>

                <input
                  type="date"
                  name="dateFrom"
                  required
                  min={todayInput}
                  defaultValue={todayInput}
                  className="mt-2 w-full rounded-2xl border border-zinc-800 bg-zinc-950 px-4 py-4 text-white outline-none transition focus:border-white"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-zinc-300">
                  Data final
                </label>

                <input
                  type="date"
                  name="dateTo"
                  min={todayInput}
                  className="mt-2 w-full rounded-2xl border border-zinc-800 bg-zinc-950 px-4 py-4 text-white outline-none transition focus:border-white"
                />

                <p className="mt-2 text-xs text-zinc-600">
                  Deixe vazio para bloquear apenas a data inicial.
                </p>
              </div>

              <div>
                <label className="text-sm font-medium text-zinc-300">
                  Motivo
                </label>

                <textarea
                  name="reason"
                  rows={4}
                  maxLength={180}
                  placeholder="Ex: Férias, feriado, formação, ausência pessoal..."
                  className="mt-2 w-full resize-none rounded-2xl border border-zinc-800 bg-zinc-950 px-4 py-4 text-white outline-none transition placeholder:text-zinc-700 focus:border-white"
                />
              </div>

              <button
                type="submit"
                className="mt-2 rounded-2xl border border-white bg-white px-5 py-4 font-semibold text-zinc-950 transition hover:bg-zinc-200"
              >
                Criar bloqueio
              </button>
            </form>
          </div>

          <div className="rounded-[2rem] border border-zinc-800 bg-zinc-950 p-4 shadow-2xl">
            {business.blockedDays.length === 0 ? (
              <div className="rounded-3xl border border-zinc-800 bg-black p-10 text-center text-zinc-500">
                Ainda não existem bloqueios futuros.
              </div>
            ) : (
              <div className="grid gap-4">
                {business.blockedDays.map((blockedDay) => (
                  <div
                    key={blockedDay.id}
                    className="rounded-3xl border border-zinc-800 bg-black p-5"
                  >
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-zinc-600">
                          Dia bloqueado
                        </p>

                        <h3 className="mt-3 text-xl font-bold text-white">
                          {formatDate(blockedDay.date)}
                        </h3>

                        <p className="mt-2 text-sm text-zinc-500">
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
                          className="rounded-2xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-sm font-semibold text-zinc-500 transition hover:border-zinc-600 hover:text-zinc-300"
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