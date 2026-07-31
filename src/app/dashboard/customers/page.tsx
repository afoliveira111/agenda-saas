import Link from "next/link"
import { getCurrentBusinessSlug } from "@/lib/current-business"
import { getDashboardThemeClasses } from "@/lib/dashboard-theme"
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

function getWhatsAppPhone(phone: string | null) {
  if (!phone) {
    return ""
  }

  return phone.replace(/\D/g, "")
}

function createWhatsAppMessage(customerName: string, businessName: string) {
  return [
    `Olá ${customerName}, tudo bem?`,
    "",
    `É do ${businessName}.`,
    "",
    "Estamos entrando em contacto sobre a sua marcação.",
  ].join("\n")
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

function getStatusClasses(status: string) {
  const statusMap: Record<string, string> = {
    PENDING: "border-yellow-300 bg-yellow-50 text-yellow-800",
    CONFIRMED: "border-emerald-300 bg-emerald-50 text-emerald-800",
    CANCELLED: "border-red-300 bg-red-50 text-red-800",
    COMPLETED: "border-blue-300 bg-blue-50 text-blue-800",
    NO_SHOW: "border-orange-300 bg-orange-50 text-orange-800",
  }

  return statusMap[status] ?? "border-zinc-300 bg-zinc-50 text-zinc-700"
}

export default async function DashboardCustomersPage() {
  const currentBusinessSlug = await getCurrentBusinessSlug()
  const now = new Date()

  const business = await prisma.business.findUnique({
    where: {
      slug: currentBusinessSlug,
    },
    include: {
      customers: {
        orderBy: {
          updatedAt: "desc",
        },
        include: {
          bookings: {
            orderBy: {
              startAt: "desc",
            },
            include: {
              services: {
                include: {
                  service: true,
                },
              },
            },
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
              href="/dashboard"
              className="mt-6 inline-block rounded-2xl border border-white bg-white px-5 py-3 font-semibold text-zinc-950 transition hover:bg-zinc-200"
            >
              Voltar ao painel
            </Link>
          </div>
        </section>
      </main>
    )
  }

  const theme = getDashboardThemeClasses(business.theme)
  const customers = business.customers

  const customersWithBookings = customers.filter(
    (customer) => customer.bookings.length > 0,
  )

  const totalBookings = customers.reduce(
    (total, customer) => total + customer.bookings.length,
    0,
  )

  const estimatedRevenue = customers.reduce((total, customer) => {
    const customerTotal = customer.bookings
      .filter((booking) => booking.status !== "CANCELLED")
      .reduce((sum, booking) => sum + booking.totalPriceCents, 0)

    return total + customerTotal
  }, 0)

  return (
    <main className={`min-h-screen ${theme.page}`}>
      <section className="mx-auto max-w-[88rem] px-5 py-8 sm:px-6 lg:py-10">
        <div className={`rounded-[2.3rem] border p-8 shadow-2xl lg:p-10 ${theme.hero}`}>
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className={`text-sm uppercase tracking-[0.3em] ${theme.subtle}`}>
                Área do negócio
              </p>

              <h1
                className={`mt-3 text-4xl font-bold tracking-tight md:text-5xl ${theme.title}`}
              >
                Clientes
              </h1>

              <p className={`mt-4 max-w-2xl ${theme.muted}`}>
                Veja os clientes do negócio selecionado, histórico de marcações
                e contacto rápido por WhatsApp.
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
                href={`/book/${business.slug}`}
                className={`rounded-full border px-5 py-3 text-center font-semibold transition ${theme.primaryButton}`}
              >
                Abrir página pública
              </Link>
            </div>
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-4">
            <div className={`rounded-[1.7rem] border p-5 ${theme.card}`}>
              <p className={`text-sm ${theme.muted}`}>Clientes</p>

              <p className={`mt-2 text-3xl font-bold ${theme.title}`}>
                {customers.length}
              </p>
            </div>

            <div className={`rounded-[1.7rem] border p-5 ${theme.card}`}>
              <p className={`text-sm ${theme.muted}`}>Com marcações</p>

              <p className={`mt-2 text-3xl font-bold ${theme.title}`}>
                {customersWithBookings.length}
              </p>
            </div>

            <div className={`rounded-[1.7rem] border p-5 ${theme.card}`}>
              <p className={`text-sm ${theme.muted}`}>Total de marcações</p>

              <p className={`mt-2 text-3xl font-bold ${theme.title}`}>
                {totalBookings}
              </p>
            </div>

            <div className={`rounded-[1.7rem] border p-5 ${theme.card}`}>
              <p className={`text-sm ${theme.muted}`}>Valor estimado</p>

              <p className={`mt-2 text-3xl font-bold ${theme.title}`}>
                {formatPrice(estimatedRevenue)}
              </p>
            </div>
          </div>
        </div>

        <div className={`mt-8 rounded-[2.2rem] border p-5 shadow-2xl ${theme.panel}`}>
          <div className={`border-b px-2 pb-5 ${theme.line}`}>
            <p className={`text-xs font-semibold uppercase tracking-[0.3em] ${theme.subtle}`}>
              Base de clientes
            </p>

            <h2 className={`mt-3 text-2xl font-bold ${theme.title}`}>
              Clientes de {business.name}
            </h2>

            <p className={`mt-2 text-sm ${theme.muted}`}>
              As novas marcações com o mesmo e-mail ficam associadas ao mesmo
              cliente.
            </p>
          </div>

          {customers.length === 0 ? (
            <div
              className={`mt-4 rounded-3xl border p-10 text-center ${theme.card}`}
            >
              <p className={theme.muted}>
                Ainda não existem clientes neste negócio.
              </p>
            </div>
          ) : (
            <div className="mt-4 grid gap-4">
              {customers.map((customer) => {
                const validBookings = customer.bookings.filter(
                  (booking) => booking.status !== "CANCELLED",
                )

                const totalSpent = validBookings.reduce(
                  (sum, booking) => sum + booking.totalPriceCents,
                  0,
                )

                const nextBooking = customer.bookings
                  .filter(
                    (booking) =>
                      booking.startAt >= now && booking.status === "CONFIRMED",
                  )
                  .sort((a, b) => a.startAt.getTime() - b.startAt.getTime())[0]

                const lastBooking = customer.bookings[0]
                const whatsappPhone = getWhatsAppPhone(customer.phone)

                const whatsappUrl = whatsappPhone
                  ? `https://wa.me/${whatsappPhone}?text=${encodeURIComponent(
                      createWhatsAppMessage(customer.name, business.name),
                    )}`
                  : ""

                return (
                  <div
                    key={customer.id}
                    className={`rounded-[1.7rem] border p-5 ${theme.card}`}
                  >
                    <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
                      <div>
                        <div className="flex flex-wrap items-center gap-3">
                          <span
                            className={`rounded-full border px-3 py-1 text-xs font-semibold ${theme.badge}`}
                          >
                            Cliente
                          </span>

                          <span className={`text-sm ${theme.muted}`}>
                            {customer.bookings.length} marcação/marcações
                          </span>
                        </div>

                        <h3 className={`mt-4 text-2xl font-bold ${theme.title}`}>
                          {customer.name}
                        </h3>

                        <div className={`mt-3 grid gap-2 text-sm ${theme.muted}`}>
                          <p>
                            Telefone:{" "}
                            <span className={`font-medium ${theme.title}`}>
                              {customer.phone || "Não informado"}
                            </span>
                          </p>

                          <p>
                            E-mail:{" "}
                            <span className={`font-medium ${theme.title}`}>
                              {customer.email || "Não informado"}
                            </span>
                          </p>
                        </div>

                        <div className="mt-5 grid gap-3 sm:grid-cols-3">
                          <div className={`rounded-[1.5rem] border p-4 ${theme.panelSoft}`}>
                            <p className={`text-xs ${theme.subtle}`}>
                              Marcações
                            </p>

                            <p className={`mt-1 text-xl font-bold ${theme.title}`}>
                              {customer.bookings.length}
                            </p>
                          </div>

                          <div className={`rounded-[1.5rem] border p-4 ${theme.panelSoft}`}>
                            <p className={`text-xs ${theme.subtle}`}>
                              Valor estimado
                            </p>

                            <p className={`mt-1 text-xl font-bold ${theme.title}`}>
                              {formatPrice(totalSpent)}
                            </p>
                          </div>

                          <div className={`rounded-[1.5rem] border p-4 ${theme.panelSoft}`}>
                            <p className={`text-xs ${theme.subtle}`}>
                              Próxima marcação
                            </p>

                            <p className={`mt-1 text-sm font-semibold ${theme.title}`}>
                              {nextBooking
                                ? `${formatDate(nextBooking.startAt)} · ${formatTime(
                                    nextBooking.startAt,
                                  )}`
                                : "Nenhuma"}
                            </p>
                          </div>
                        </div>

                        {lastBooking && (
                          <div className={`mt-5 rounded-[1.5rem] border p-4 ${theme.panelSoft}`}>
                            <div className="flex flex-wrap items-center justify-between gap-3">
                              <p className={`text-xs font-semibold uppercase tracking-[0.3em] ${theme.subtle}`}>
                                Última marcação
                              </p>

                              <span
                                className={`rounded-full border px-3 py-1 text-xs font-semibold ${getStatusClasses(
                                  lastBooking.status,
                                )}`}
                              >
                                {getStatusLabel(lastBooking.status)}
                              </span>
                            </div>

                            <p className={`mt-3 text-sm ${theme.muted}`}>
                              {formatDate(lastBooking.startAt)} ·{" "}
                              {formatTime(lastBooking.startAt)} -{" "}
                              {formatTime(lastBooking.endAt)}
                            </p>

                            <div className={`mt-3 grid gap-1 text-sm ${theme.muted}`}>
                              {lastBooking.services.map((item) => (
                                <p key={item.id}>{item.service.name}</p>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="flex flex-col gap-4">
                        <div className={`rounded-[1.5rem] border p-4 ${theme.panelSoft}`}>
                          <p className={`text-xs font-semibold uppercase tracking-[0.3em] ${theme.subtle}`}>
                            Contacto rápido
                          </p>

                          <p className={`mt-3 text-sm ${theme.muted}`}>
                            Abre o WhatsApp com uma mensagem pronta para este
                            cliente.
                          </p>

                          {whatsappUrl ? (
                            <a
                              href={whatsappUrl}
                              target="_blank"
                              rel="noreferrer"
                              className={`mt-4 block rounded-full border px-4 py-3 text-center text-sm font-semibold transition ${theme.primaryButton}`}
                            >
                              Enviar WhatsApp
                            </a>
                          ) : (
                            <div
                              className={`mt-4 rounded-full border px-4 py-3 text-center text-sm font-semibold ${theme.badge}`}
                            >
                              Cliente sem telefone
                            </div>
                          )}
                        </div>

                        <div className={`rounded-[1.5rem] border p-4 ${theme.panelSoft}`}>
                          <p className={`text-xs font-semibold uppercase tracking-[0.3em] ${theme.subtle}`}>
                            Histórico recente
                          </p>

                          {customer.bookings.length === 0 ? (
                            <p className={`mt-3 text-sm ${theme.muted}`}>
                              Sem marcações.
                            </p>
                          ) : (
                            <div className="mt-3 grid gap-3">
                              {customer.bookings.slice(0, 3).map((booking) => (
                                <div
                                  key={booking.id}
                                  className={`rounded-[1.2rem] border p-3 ${theme.cardStrong}`}
                                >
                                  <div className="flex flex-wrap items-center justify-between gap-2">
                                    <p
                                      className={`text-sm font-semibold ${theme.title}`}
                                    >
                                      {formatDate(booking.startAt)} ·{" "}
                                      {formatTime(booking.startAt)}
                                    </p>

                                    <span
                                      className={`rounded-full border px-2 py-1 text-[11px] font-semibold ${getStatusClasses(
                                        booking.status,
                                      )}`}
                                    >
                                      {getStatusLabel(booking.status)}
                                    </span>
                                  </div>

                                  <p className={`mt-2 text-xs ${theme.muted}`}>
                                    {formatPrice(booking.totalPriceCents)}
                                  </p>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </section>
    </main>
  )
}