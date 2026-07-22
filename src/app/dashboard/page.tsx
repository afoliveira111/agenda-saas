import Link from "next/link"
import { prisma } from "@/lib/prisma"
import { getCurrentBusinessSlug } from "@/lib/current-business"

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
      <main className="min-h-screen bg-zinc-950 text-white">
        <section className="mx-auto max-w-5xl px-6 py-16">
          <div className="rounded-[2rem] border border-zinc-800 bg-black p-8">
            <h1 className="text-3xl font-bold">Negócio não encontrado</h1>

            <p className="mt-3 text-zinc-500">
              O negócio selecionado não existe. Selecione outro negócio.
            </p>

            <Link
              href="/dashboard/businesses"
              className="mt-6 inline-block rounded-2xl border border-white bg-white px-5 py-3 font-semibold text-zinc-950 transition hover:bg-zinc-200"
            >
              Ir para negócios
            </Link>
          </div>
        </section>
      </main>
    )
  }

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
    (booking) => booking.status === "CONFIRMED"
  )

  const completedBookings = bookings.filter(
    (booking) => booking.status === "COMPLETED"
  )

  const activeServices = business.services.filter((service) => service.active)

  const estimatedRevenue = bookings
    .filter((booking) => booking.status !== "CANCELLED")
    .reduce((total, booking) => total + booking.totalPriceCents, 0)

  const nextBookings = upcomingBookings.slice(0, 5)

  const quickActions = [
  {
    title: "Marcações",
    description: "Ver agenda, clientes, serviços e estado das reservas.",
    href: "/dashboard/bookings",
    label: "Abrir marcações",
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
    description: "Editar nome, telefone, e-mail, morada e descrição pública.",
    href: "/dashboard/settings/business",
    label: "Editar dados",
  },
  {
    title: "Negócios",
    description:
      "Cadastrar e visualizar clínicas, salões e espaços da plataforma.",
    href: "/dashboard/businesses",
    label: "Gerir negócios",
  },
  {
    title: "Ferramentas",
    description:
      "Limpar dados de teste, resetar lembretes e organizar o ambiente.",
    href: "/dashboard/tools",
    label: "Abrir ferramentas",
  },
]
  return (
    <main className="min-h-screen bg-zinc-950 text-white">
      <section className="mx-auto max-w-7xl px-6 py-10">
        <div className="rounded-[2rem] border border-zinc-800 bg-gradient-to-br from-zinc-900 via-zinc-950 to-black p-8 shadow-2xl">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-zinc-500">
                Painel profissional
              </p>

              <h1 className="mt-3 text-4xl font-bold tracking-tight text-white md:text-5xl">
                {business.name}
              </h1>

              <p className="mt-4 max-w-2xl text-zinc-400">
                Resumo rápido da agenda, serviços e próximos atendimentos.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Link
                href={`/book/${business.slug}`}
                className="rounded-2xl border border-white bg-white px-5 py-3 text-center font-semibold text-zinc-950 transition hover:bg-zinc-200"
              >
                Abrir página pública
              </Link>

              <Link
                href="/logout"
                className="rounded-2xl border border-zinc-700 px-5 py-3 text-center font-semibold text-zinc-300 transition hover:border-white hover:text-white"
              >
                Sair
              </Link>
            </div>
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-4">
            <div className="rounded-3xl border border-zinc-800 bg-black/40 p-5">
              <p className="text-sm text-zinc-500">Marcações hoje</p>
              <p className="mt-2 text-3xl font-bold">{todayBookings.length}</p>
            </div>

            <div className="rounded-3xl border border-zinc-800 bg-black/40 p-5">
              <p className="text-sm text-zinc-500">Próximas marcações</p>
              <p className="mt-2 text-3xl font-bold">
                {upcomingBookings.length}
              </p>
            </div>

            <div className="rounded-3xl border border-zinc-800 bg-black/40 p-5">
              <p className="text-sm text-zinc-500">Serviços ativos</p>
              <p className="mt-2 text-3xl font-bold">{activeServices.length}</p>
            </div>

            <div className="rounded-3xl border border-zinc-800 bg-black/40 p-5">
              <p className="text-sm text-zinc-500">Valor estimado</p>
              <p className="mt-2 text-3xl font-bold">
                {formatPrice(estimatedRevenue)}
              </p>
            </div>
          </div>
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-[2rem] border border-zinc-800 bg-black p-6 shadow-2xl">
            <div className="flex flex-col gap-4 border-b border-zinc-800 pb-6 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-zinc-600">
                  Próximos atendimentos
                </p>

                <h2 className="mt-3 text-2xl font-bold">Agenda</h2>
              </div>

              <Link
                href="/dashboard/bookings"
                className="rounded-2xl border border-zinc-700 px-4 py-3 text-center text-sm font-semibold text-zinc-300 transition hover:border-white hover:text-white"
              >
                Ver tudo
              </Link>
            </div>

            {nextBookings.length === 0 ? (
              <div className="mt-6 rounded-3xl border border-zinc-800 bg-zinc-950 p-8 text-center text-zinc-500">
                Nenhuma marcação futura.
              </div>
            ) : (
              <div className="mt-6 grid gap-4">
                {nextBookings.map((booking) => (
                  <div
                    key={booking.id}
                    className="rounded-3xl border border-zinc-800 bg-zinc-950 p-5"
                  >
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <p className="font-semibold text-white">
                          {booking.customer.name}
                        </p>

                        <p className="mt-1 text-sm text-zinc-500">
                          {formatDate(booking.startAt)} ·{" "}
                          {formatTime(booking.startAt)} -{" "}
                          {formatTime(booking.endAt)}
                        </p>

                        <div className="mt-3 space-y-1 text-sm text-zinc-400">
                          {booking.services.map((item) => (
                            <p key={item.id}>{item.service.name}</p>
                          ))}
                        </div>
                      </div>

                      <div className="text-left sm:text-right">
                        <span className="rounded-full border border-zinc-700 px-3 py-1 text-xs font-semibold text-zinc-300">
                          {formatStatus(booking.status)}
                        </span>

                        <p className="mt-3 font-semibold text-white">
                          {formatPrice(booking.totalPriceCents)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="grid gap-6">
            <div className="rounded-[2rem] border border-zinc-800 bg-black p-6 shadow-2xl">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-zinc-600">
                Resumo
              </p>

              <h2 className="mt-3 text-2xl font-bold">Estado do negócio</h2>

              <div className="mt-6 grid gap-3">
                <div className="flex justify-between rounded-2xl border border-zinc-800 bg-zinc-950 p-4">
                  <span className="text-zinc-500">Confirmadas</span>
                  <span className="font-semibold">
                    {confirmedBookings.length}
                  </span>
                </div>

                <div className="flex justify-between rounded-2xl border border-zinc-800 bg-zinc-950 p-4">
                  <span className="text-zinc-500">Concluídas</span>
                  <span className="font-semibold">
                    {completedBookings.length}
                  </span>
                </div>

                <div className="flex justify-between rounded-2xl border border-zinc-800 bg-zinc-950 p-4">
                  <span className="text-zinc-500">Bloqueios futuros</span>
                  <span className="font-semibold">
                    {business.blockedDays.length}
                  </span>
                </div>

                <div className="flex justify-between rounded-2xl border border-zinc-800 bg-zinc-950 p-4">
                  <span className="text-zinc-500">Dias semanais ativos</span>
                  <span className="font-semibold">
                    {business.workHours.filter((hour) => hour.active).length}
                  </span>
                </div>
              </div>
            </div>

            <div className="rounded-[2rem] border border-zinc-800 bg-black p-6 shadow-2xl">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-zinc-600">
                Atalhos
              </p>

              <h2 className="mt-3 text-2xl font-bold">Gerir sistema</h2>

              <div className="mt-6 grid gap-3">
                {quickActions.map((action) => (
                  <Link
                    key={action.href}
                    href={action.href}
                    className="rounded-3xl border border-zinc-800 bg-zinc-950 p-5 transition hover:border-white"
                  >
                    <p className="font-semibold text-white">{action.title}</p>

                    <p className="mt-2 text-sm text-zinc-500">
                      {action.description}
                    </p>

                    <p className="mt-4 text-sm font-semibold text-zinc-300">
                      {action.label} →
                    </p>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}