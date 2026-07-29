import Link from "next/link"
import {
  formatBusinessTheme,
  getDashboardThemeClasses,
} from "@/lib/dashboard-theme"
import { getCurrentBusinessSlug } from "@/lib/current-business"
import { prisma } from "@/lib/prisma"

function formatPrice(priceCents: number) {
  return new Intl.NumberFormat("pt-PT", {
    style: "currency",
    currency: "EUR",
  }).format(priceCents / 100)
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("pt-PT", {
    weekday: "short",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date)
}

function formatTime(date: Date) {
  return new Intl.DateTimeFormat("pt-PT", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(date)
}

function formatStatus(status: string) {
  const statusMap: Record<string, string> = {
    PENDING: "Pendente",
    CONFIRMED: "Confirmada",
    CANCELLED: "Cancelada",
    COMPLETED: "Concluída",
    NO_SHOW: "Faltou",
  }

  return statusMap[status] ?? status
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

type DashboardTheme = ReturnType<typeof getDashboardThemeClasses>

type ActionCardProps = {
  title: string
  description: string
  href: string
  label: string
  theme: DashboardTheme
  highlight?: boolean
}

function ActionCard({
  title,
  description,
  href,
  label,
  theme,
  highlight = false,
}: ActionCardProps) {
  return (
    <Link
      href={href}
      className={`rounded-3xl border p-5 transition ${
        highlight ? theme.actionHighlight : theme.action
      }`}
    >
      <p className="font-semibold">{title}</p>

      <p
        className={`mt-2 text-sm ${
          highlight ? theme.actionHighlightMuted : theme.actionMuted
        }`}
      >
        {description}
      </p>

      <p className="mt-4 text-sm font-semibold">{label} →</p>
    </Link>
  )
}

export default async function DashboardPage() {
  const currentBusinessSlug = await getCurrentBusinessSlug()

  const todayStart = getTodayStart()
  const tomorrowStart = getTomorrowStart()

  const business = await prisma.business.findUnique({
    where: {
      slug: currentBusinessSlug,
    },
    include: {
      services: true,
      workHours: true,
      blockedDays: {
        where: {
          date: {
            gte: todayStart,
          },
        },
      },
    },
  })

  if (!business) {
    return (
      <main className="min-h-screen bg-[#111113] text-white">
        <section className="mx-auto max-w-5xl px-6 py-16">
          <div className="rounded-[2rem] border border-zinc-800 bg-[#18181b] p-8">
            <h1 className="text-3xl font-bold">Negócio não encontrado</h1>

            <p className="mt-3 text-zinc-500">
              O negócio selecionado não existe.
            </p>

            <Link
              href="/admin"
              className="mt-6 inline-block rounded-2xl border border-white bg-white px-5 py-3 font-semibold text-zinc-950 transition hover:bg-zinc-200"
            >
              Ir para admin
            </Link>
          </div>
        </section>
      </main>
    )
  }

  const theme = getDashboardThemeClasses(business.theme)

  const bookings = await prisma.booking.findMany({
    where: {
      businessId: business.id,
    },
    orderBy: {
      startAt: "asc",
    },
    include: {
      customer: true,
      services: {
        include: {
          service: true,
        },
      },
    },
  })

  const todayBookings = bookings.filter((booking) => {
    return (
      booking.startAt >= todayStart &&
      booking.startAt < tomorrowStart &&
      booking.status !== "CANCELLED"
    )
  })

  const upcomingBookings = bookings.filter((booking) => {
    return booking.startAt >= new Date() && booking.status !== "CANCELLED"
  })

  const confirmedBookings = bookings.filter(
    (booking) => booking.status === "CONFIRMED",
  )

  const completedBookings = bookings.filter(
    (booking) => booking.status === "COMPLETED",
  )

  const activeServices = business.services.filter((service) => service.active)

  const estimatedRevenue = bookings
    .filter((booking) => booking.status !== "CANCELLED")
    .reduce((total, booking) => total + booking.totalPriceCents, 0)

  const nextBookings = upcomingBookings.slice(0, 5)

  const businessActions = [
    {
      title: "Marcações",
      description:
        "Ver agenda, reagendar, alterar estado e contactar clientes.",
      href: "/dashboard/bookings",
      label: "Abrir marcações",
      highlight: true,
    },
    {
      title: "Clientes",
      description: "Ver clientes, histórico de marcações e contacto rápido.",
      href: "/dashboard/customers",
      label: "Ver clientes",
    },
    {
      title: "Serviços",
      description: "Criar, editar, ativar ou desativar serviços.",
      href: "/dashboard/services",
      label: "Gerir serviços",
    },
    {
      title: "Horários",
      description: "Configurar os dias e horas de atendimento semanal.",
      href: "/dashboard/settings/hours",
      label: "Editar horários",
    },
    {
      title: "Bloqueios",
      description: "Bloquear férias, feriados ou ausências específicas.",
      href: "/dashboard/blocked-days",
      label: "Gerir bloqueios",
    },
    {
      title: "Dados do negócio",
      description:
        "Editar nome, telefone, e-mail, morada, descrição e tema público.",
      href: "/dashboard/settings/business",
      label: "Editar dados",
    },
    {
      title: "Página pública",
      description: "Abrir a página que os clientes usam para marcar.",
      href: `/book/${business.slug}`,
      label: "Abrir página",
    },
  ]

  return (
    <main className={`min-h-screen ${theme.page}`}>
      <section className="mx-auto max-w-7xl px-6 py-10">
        <div className={`rounded-[2rem] border p-8 shadow-2xl ${theme.hero}`}>
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className={`text-sm uppercase tracking-[0.3em] ${theme.subtle}`}>
                Área do negócio
              </p>

              <h1
                className={`mt-3 text-4xl font-bold tracking-tight md:text-5xl ${theme.title}`}
              >
                {business.name}
              </h1>

              <p className={`mt-4 max-w-2xl ${theme.muted}`}>
                Resumo rápido da agenda, serviços, clientes e próximos
                atendimentos.
              </p>

              <div className="mt-5 flex flex-wrap gap-3">
                <span
                  className={`rounded-full border px-4 py-2 text-sm font-medium ${theme.badge}`}
                >
                  Tema: {formatBusinessTheme(business.theme)}
                </span>

                <span
                  className={`rounded-full border px-4 py-2 text-sm font-medium ${theme.badge}`}
                >
                  /book/{business.slug}
                </span>
              </div>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Link
                href={`/book/${business.slug}`}
                className={`rounded-2xl border px-5 py-3 text-center font-semibold transition ${theme.primaryButton}`}
              >
                Abrir página pública
              </Link>

              <Link
                href="/logout"
                className={`rounded-2xl border px-5 py-3 text-center font-semibold transition ${theme.secondaryButton}`}
              >
                Sair
              </Link>
            </div>
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-4">
            <div className={`rounded-3xl border p-5 ${theme.card}`}>
              <p className={`text-sm ${theme.muted}`}>Marcações hoje</p>
              <p className={`mt-2 text-3xl font-bold ${theme.title}`}>
                {todayBookings.length}
              </p>
            </div>

            <div className={`rounded-3xl border p-5 ${theme.card}`}>
              <p className={`text-sm ${theme.muted}`}>Próximas marcações</p>
              <p className={`mt-2 text-3xl font-bold ${theme.title}`}>
                {upcomingBookings.length}
              </p>
            </div>

            <div className={`rounded-3xl border p-5 ${theme.card}`}>
              <p className={`text-sm ${theme.muted}`}>Serviços ativos</p>
              <p className={`mt-2 text-3xl font-bold ${theme.title}`}>
                {activeServices.length}
              </p>
            </div>

            <div className={`rounded-3xl border p-5 ${theme.card}`}>
              <p className={`text-sm ${theme.muted}`}>Valor estimado</p>
              <p className={`mt-2 text-3xl font-bold ${theme.title}`}>
                {formatPrice(estimatedRevenue)}
              </p>
            </div>
          </div>
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
          <div className={`rounded-[2rem] border p-6 shadow-2xl ${theme.panel}`}>
            <div
              className={`flex flex-col gap-4 border-b pb-6 sm:flex-row sm:items-end sm:justify-between ${theme.line}`}
            >
              <div>
                <p className={`text-xs font-semibold uppercase tracking-[0.3em] ${theme.subtle}`}>
                  Próximos atendimentos
                </p>

                <h2 className={`mt-3 text-2xl font-bold ${theme.title}`}>
                  Agenda rápida
                </h2>

                <p className={`mt-2 text-sm ${theme.muted}`}>
                  As próximas marcações deste negócio aparecem aqui.
                </p>
              </div>

              <Link
                href="/dashboard/bookings"
                className={`rounded-2xl border px-4 py-3 text-center text-sm font-semibold transition ${theme.secondaryButton}`}
              >
                Ver tudo
              </Link>
            </div>

            {nextBookings.length === 0 ? (
              <div
                className={`mt-6 rounded-3xl border p-8 text-center ${theme.card}`}
              >
                <p className={theme.muted}>Nenhuma marcação futura.</p>
              </div>
            ) : (
              <div className="mt-6 grid gap-4">
                {nextBookings.map((booking) => (
                  <div
                    key={booking.id}
                    className={`rounded-3xl border p-5 ${theme.card}`}
                  >
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <p className={`font-semibold ${theme.title}`}>
                          {booking.customer.name}
                        </p>

                        <p className={`mt-1 text-sm ${theme.muted}`}>
                          {formatDate(booking.startAt)} ·{" "}
                          {formatTime(booking.startAt)} -{" "}
                          {formatTime(booking.endAt)}
                        </p>

                        <div className={`mt-3 space-y-1 text-sm ${theme.muted}`}>
                          {booking.services.map((item) => (
                            <p key={item.id}>{item.service.name}</p>
                          ))}
                        </div>
                      </div>

                      <div className="text-left sm:text-right">
                        <span
                          className={`rounded-full border px-3 py-1 text-xs font-semibold ${theme.badge}`}
                        >
                          {formatStatus(booking.status)}
                        </span>

                        <p className={`mt-3 font-semibold ${theme.title}`}>
                          {formatPrice(booking.totalPriceCents)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className={`rounded-[2rem] border p-6 shadow-2xl ${theme.panel}`}>
            <p className={`text-xs font-semibold uppercase tracking-[0.3em] ${theme.subtle}`}>
              Resumo
            </p>

            <h2 className={`mt-3 text-2xl font-bold ${theme.title}`}>
              Estado do negócio
            </h2>

            <div className="mt-6 grid gap-3">
              <div
                className={`flex justify-between rounded-2xl border p-4 ${theme.card}`}
              >
                <span className={theme.muted}>Confirmadas</span>
                <span className={`font-semibold ${theme.title}`}>
                  {confirmedBookings.length}
                </span>
              </div>

              <div
                className={`flex justify-between rounded-2xl border p-4 ${theme.card}`}
              >
                <span className={theme.muted}>Concluídas</span>
                <span className={`font-semibold ${theme.title}`}>
                  {completedBookings.length}
                </span>
              </div>

              <div
                className={`flex justify-between rounded-2xl border p-4 ${theme.card}`}
              >
                <span className={theme.muted}>Bloqueios futuros</span>
                <span className={`font-semibold ${theme.title}`}>
                  {business.blockedDays.length}
                </span>
              </div>

              <div
                className={`flex justify-between rounded-2xl border p-4 ${theme.card}`}
              >
                <span className={theme.muted}>Dias semanais ativos</span>
                <span className={`font-semibold ${theme.title}`}>
                  {business.workHours.filter((hour) => hour.active).length}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className={`mt-8 rounded-[2rem] border p-6 shadow-2xl ${theme.panel}`}>
          <div className={`flex flex-col gap-3 border-b pb-6 ${theme.line}`}>
            <p className={`text-xs font-semibold uppercase tracking-[0.3em] ${theme.subtle}`}>
              Acessos do negócio
            </p>

            <h2 className={`text-2xl font-bold ${theme.title}`}>
              Gerir {business.name}
            </h2>

            <p className={`max-w-3xl text-sm ${theme.muted}`}>
              Acesso rápido às áreas usadas no dia a dia do negócio.
            </p>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {businessActions.map((action) => (
              <ActionCard
                key={action.href}
                title={action.title}
                description={action.description}
                href={action.href}
                label={action.label}
                theme={theme}
                highlight={action.highlight}
              />
            ))}
          </div>
        </div>
      </section>
    </main>
  )
}