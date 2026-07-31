import { cookies } from "next/headers"
import Link from "next/link"
import {
  getAdminThemeClasses,
  normalizeAdminTheme,
} from "@/lib/admin-theme"
import { prisma } from "@/lib/prisma"
import { getCurrentBusinessSlug } from "@/lib/current-business"
import {
  clearAllBookingsAndCustomersAction,
  clearCancelledBookingsAction,
  clearCustomersWithoutBookingsAction,
  resetReminderEmailsAction,
} from "./actions"

type ToolsPageProps = {
  searchParams: Promise<{
    error?: string
    success?: string
  }>
}

const ADMIN_THEME_COOKIE = "agenda_saas_admin_theme"

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("pt-PT", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date)
}

function getStatusLabel(status: string) {
  const statusMap: Record<string, string> = {
    PENDING: "Pendente",
    CONFIRMED: "Confirmada",
    CANCELLED: "Cancelada",
    COMPLETED: "Concluída",
    NO_SHOW: "Faltou",
  }

  return statusMap[status] ?? status
}

function getFeedbackClasses(type: "error" | "success") {
  if (type === "error") {
    return "border-red-300 bg-red-50 text-red-800"
  }

  return "border-emerald-300 bg-emerald-50 text-emerald-800"
}

export default async function DashboardToolsPage({
  searchParams,
}: ToolsPageProps) {
  const search = await searchParams
  const { error, success } = search

  const cookieStore = await cookies()
  const currentAdminTheme = normalizeAdminTheme(
    cookieStore.get(ADMIN_THEME_COOKIE)?.value,
  )
  const theme = getAdminThemeClasses(currentAdminTheme)

  const currentBusinessSlug = await getCurrentBusinessSlug()

  const business = await prisma.business.findUnique({
    where: {
      slug: currentBusinessSlug,
    },
    include: {
      _count: {
        select: {
          services: true,
          customers: true,
          bookings: true,
          blockedDays: true,
        },
      },
    },
  })

  if (!business) {
    return (
      <main className={`min-h-screen ${theme.page}`}>
        <section className="mx-auto max-w-5xl px-6 py-16">
          <div className={`rounded-[2.2rem] border p-8 shadow-2xl ${theme.panel}`}>
            <h1 className={`text-3xl font-bold ${theme.title}`}>
              Negócio não encontrado
            </h1>

            <p className={`mt-3 ${theme.muted}`}>
              Selecione um negócio em /dashboard/businesses.
            </p>

            <Link
              href="/dashboard/businesses"
              className={`mt-6 inline-block rounded-full border px-5 py-3 font-semibold transition ${theme.primaryButton}`}
            >
              Ir para negócios
            </Link>
          </div>
        </section>
      </main>
    )
  }

  const bookingStatusCounts = await prisma.booking.groupBy({
    by: ["status"],
    where: {
      businessId: business.id,
    },
    _count: {
      _all: true,
    },
  })

  const cancelledBookingsCount =
    bookingStatusCounts.find((item) => item.status === "CANCELLED")?._count
      ._all ?? 0

  const customersWithoutBookingsCount = await prisma.customer.count({
    where: {
      businessId: business.id,
      bookings: {
        none: {},
      },
    },
  })

  const remindersSentCount = await prisma.booking.count({
    where: {
      businessId: business.id,
      reminderEmailSentAt: {
        not: null,
      },
    },
  })

  const latestBookings = await prisma.booking.findMany({
    where: {
      businessId: business.id,
    },
    orderBy: {
      createdAt: "desc",
    },
    take: 5,
    include: {
      customer: true,
    },
  })

  return (
    <main className={`min-h-screen ${theme.page}`}>
      <section className="mx-auto max-w-[88rem] px-5 py-8 sm:px-6 lg:py-10">
        <div className={`rounded-[2.3rem] border p-8 shadow-2xl lg:p-10 ${theme.hero}`}>
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className={`text-sm uppercase tracking-[0.3em] ${theme.subtle}`}>
                Desenvolvimento
              </p>

              <h1
                className={`mt-3 text-4xl font-bold tracking-tight md:text-5xl ${theme.title}`}
              >
                Ferramentas
              </h1>

              <p className={`mt-4 max-w-2xl ${theme.muted}`}>
                Limpe dados de teste do negócio selecionado sem apagar serviços,
                horários ou dados principais do negócio.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Link
                href="/dashboard"
                className={`rounded-full border px-5 py-3 text-center font-semibold transition ${theme.secondaryButton}`}
              >
                Voltar ao painel
              </Link>

              <Link
                href="/dashboard/businesses"
                className={`rounded-full border px-5 py-3 text-center font-semibold transition ${theme.primaryButton}`}
              >
                Ver negócios
              </Link>
            </div>
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-4">
            <div className={`rounded-[1.7rem] border p-5 ${theme.card}`}>
              <p className={`text-sm ${theme.muted}`}>Negócio selecionado</p>
              <p className={`mt-2 truncate text-lg font-semibold ${theme.title}`}>
                {business.name}
              </p>
            </div>

            <div className={`rounded-[1.7rem] border p-5 ${theme.card}`}>
              <p className={`text-sm ${theme.muted}`}>Marcações</p>
              <p className={`mt-2 text-3xl font-bold ${theme.title}`}>
                {business._count.bookings}
              </p>
            </div>

            <div className={`rounded-[1.7rem] border p-5 ${theme.card}`}>
              <p className={`text-sm ${theme.muted}`}>Clientes</p>
              <p className={`mt-2 text-3xl font-bold ${theme.title}`}>
                {business._count.customers}
              </p>
            </div>

            <div className={`rounded-[1.7rem] border p-5 ${theme.card}`}>
              <p className={`text-sm ${theme.muted}`}>Serviços preservados</p>
              <p className={`mt-2 text-3xl font-bold ${theme.title}`}>
                {business._count.services}
              </p>
            </div>
          </div>
        </div>

        {(error || success) && (
          <div
            className={`mt-6 rounded-[1.7rem] border px-5 py-4 text-sm font-semibold ${
              error
                ? getFeedbackClasses("error")
                : getFeedbackClasses("success")
            }`}
          >
            {error || success}
          </div>
        )}

        <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_420px]">
          <div className="grid gap-6">
            <div className="rounded-[2.2rem] border border-red-300 bg-red-50 p-6 shadow-2xl">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-red-700">
                Limpeza forte
              </p>

              <h2 className="mt-3 text-2xl font-bold text-red-950">
                Apagar marcações e clientes
              </h2>

              <p className="mt-3 text-sm text-red-800">
                Esta ação apaga todas as marcações e todos os clientes do
                negócio selecionado. Serviços, horários, bloqueios e dados do
                negócio serão mantidos.
              </p>

              <form
                action={clearAllBookingsAndCustomersAction}
                className="mt-6 grid gap-4"
              >
                <div>
                  <label className="text-sm font-medium text-red-950">
                    Confirmação
                  </label>

                  <input
                    type="text"
                    name="confirmText"
                    placeholder='Escreva "LIMPAR"'
                    className="mt-2 w-full rounded-[1.2rem] border border-red-300 bg-white px-4 py-4 text-red-950 outline-none transition placeholder:text-red-300 focus:border-red-700"
                  />

                  <p className="mt-2 text-xs text-red-700">
                    Para evitar erros, escreva exatamente LIMPAR.
                  </p>
                </div>

                <button
                  type="submit"
                  className="rounded-full border border-red-700 bg-red-700 px-5 py-4 font-semibold text-white transition hover:bg-red-800"
                >
                  Apagar marcações e clientes
                </button>
              </form>
            </div>

            <div className={`rounded-[2.2rem] border p-6 shadow-2xl ${theme.panel}`}>
              <p className={`text-xs font-semibold uppercase tracking-[0.3em] ${theme.subtle}`}>
                Limpezas rápidas
              </p>

              <h2 className={`mt-3 text-2xl font-bold ${theme.title}`}>
                Ações seguras
              </h2>

              <p className={`mt-3 text-sm ${theme.muted}`}>
                Estas ações ajudam a manter o ambiente de testes organizado sem
                apagar serviços ou configurações.
              </p>

              <div className="mt-6 grid gap-4 md:grid-cols-3">
                <form
                  action={clearCancelledBookingsAction}
                  className={`rounded-[1.7rem] border p-5 ${theme.card}`}
                >
                  <p className={`text-sm font-semibold ${theme.title}`}>
                    Marcações canceladas
                  </p>

                  <p className={`mt-2 text-sm ${theme.muted}`}>
                    Atualmente: {cancelledBookingsCount}
                  </p>

                  <button
                    type="submit"
                    className={`mt-5 w-full rounded-full border px-4 py-3 text-sm font-semibold transition ${theme.secondaryButton}`}
                  >
                    Apagar canceladas
                  </button>
                </form>

                <form
                  action={clearCustomersWithoutBookingsAction}
                  className={`rounded-[1.7rem] border p-5 ${theme.card}`}
                >
                  <p className={`text-sm font-semibold ${theme.title}`}>
                    Clientes sem marcação
                  </p>

                  <p className={`mt-2 text-sm ${theme.muted}`}>
                    Atualmente: {customersWithoutBookingsCount}
                  </p>

                  <button
                    type="submit"
                    className={`mt-5 w-full rounded-full border px-4 py-3 text-sm font-semibold transition ${theme.secondaryButton}`}
                  >
                    Apagar clientes vazios
                  </button>
                </form>

                <form
                  action={resetReminderEmailsAction}
                  className={`rounded-[1.7rem] border p-5 ${theme.card}`}
                >
                  <p className={`text-sm font-semibold ${theme.title}`}>
                    Resetar lembretes
                  </p>

                  <p className={`mt-2 text-sm ${theme.muted}`}>
                    Enviados: {remindersSentCount}
                  </p>

                  <button
                    type="submit"
                    className={`mt-5 w-full rounded-full border px-4 py-3 text-sm font-semibold transition ${theme.secondaryButton}`}
                  >
                    Permitir reenviar
                  </button>
                </form>
              </div>
            </div>

            <div className={`rounded-[2.2rem] border p-6 shadow-2xl ${theme.panel}`}>
              <p className={`text-xs font-semibold uppercase tracking-[0.3em] ${theme.subtle}`}>
                Estados
              </p>

              <h2 className={`mt-3 text-2xl font-bold ${theme.title}`}>
                Marcações por estado
              </h2>

              {bookingStatusCounts.length === 0 ? (
                <div
                  className={`mt-6 rounded-[1.7rem] border p-8 text-center ${theme.card}`}
                >
                  <p className={theme.muted}>Ainda não existem marcações.</p>
                </div>
              ) : (
                <div className="mt-6 grid gap-3 md:grid-cols-5">
                  {bookingStatusCounts.map((item) => (
                    <div
                      key={item.status}
                      className={`rounded-[1.2rem] border p-4 ${theme.card}`}
                    >
                      <p className={`text-xs ${theme.subtle}`}>
                        {getStatusLabel(item.status)}
                      </p>

                      <p className={`mt-1 text-2xl font-bold ${theme.title}`}>
                        {item._count._all}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className={`rounded-[2.2rem] border p-6 shadow-2xl ${theme.panel}`}>
            <p className={`text-xs font-semibold uppercase tracking-[0.3em] ${theme.subtle}`}>
              Últimos testes
            </p>

            <h2 className={`mt-3 text-2xl font-bold ${theme.title}`}>
              Marcações recentes
            </h2>

            {latestBookings.length === 0 ? (
              <div
                className={`mt-6 rounded-[1.7rem] border p-8 text-center ${theme.card}`}
              >
                <p className={theme.muted}>Nenhuma marcação recente.</p>
              </div>
            ) : (
              <div className="mt-6 grid gap-3">
                {latestBookings.map((booking) => (
                  <div
                    key={booking.id}
                    className={`rounded-[1.2rem] border p-4 ${theme.card}`}
                  >
                    <p className={`font-semibold ${theme.title}`}>
                      {booking.customer.name}
                    </p>

                    <p className={`mt-1 text-sm ${theme.muted}`}>
                      {formatDate(booking.startAt)} ·{" "}
                      {getStatusLabel(booking.status)}
                    </p>
                  </div>
                ))}
              </div>
            )}

            <div className={`mt-6 rounded-[1.7rem] border p-5 ${theme.card}`}>
              <p className={`text-sm ${theme.muted}`}>
                Esta tela é pensada para desenvolvimento. Antes de vender ou
                publicar, podemos esconder estas ferramentas ou limitar só ao
                administrador da plataforma.
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
