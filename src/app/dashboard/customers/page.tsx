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
      <main className="min-h-screen bg-zinc-950 text-white">
        <section className="mx-auto max-w-5xl px-6 py-16">
          <div className="rounded-[2rem] border border-zinc-800 bg-black p-8">
            <h1 className="text-3xl font-bold">Negócio não encontrado</h1>
            <p className="mt-3 text-zinc-500">
              Selecione um negócio em /dashboard/businesses.
            </p>
          </div>
        </section>
      </main>
    )
  }

  const customers = business.customers

  const customersWithBookings = customers.filter(
    (customer) => customer.bookings.length > 0
  )

  const totalBookings = customers.reduce(
    (total, customer) => total + customer.bookings.length,
    0
  )

  const estimatedRevenue = customers.reduce((total, customer) => {
    const customerTotal = customer.bookings
      .filter((booking) => booking.status !== "CANCELLED")
      .reduce((sum, booking) => sum + booking.totalPriceCents, 0)

    return total + customerTotal
  }, 0)

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
                Clientes
              </h1>

              <p className="mt-4 max-w-2xl text-zinc-400">
                Veja os clientes do negócio selecionado, histórico de marcações
                e contacto rápido por WhatsApp.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Link
                href="/dashboard"
                className="rounded-2xl border border-zinc-700 px-5 py-3 text-center font-semibold text-zinc-300 transition hover:border-white hover:text-white"
              >
                Voltar ao painel
              </Link>

              <Link
                href={`/book/${business.slug}`}
                className="rounded-2xl border border-white bg-white px-5 py-3 text-center font-semibold text-zinc-950 transition hover:bg-zinc-200"
              >
                Abrir página pública
              </Link>
            </div>
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-4">
            <div className="rounded-3xl border border-zinc-800 bg-black/40 p-5">
              <p className="text-sm text-zinc-500">Clientes</p>
              <p className="mt-2 text-3xl font-bold">{customers.length}</p>
            </div>

            <div className="rounded-3xl border border-zinc-800 bg-black/40 p-5">
              <p className="text-sm text-zinc-500">Com marcações</p>
              <p className="mt-2 text-3xl font-bold">
                {customersWithBookings.length}
              </p>
            </div>

            <div className="rounded-3xl border border-zinc-800 bg-black/40 p-5">
              <p className="text-sm text-zinc-500">Total de marcações</p>
              <p className="mt-2 text-3xl font-bold">{totalBookings}</p>
            </div>

            <div className="rounded-3xl border border-zinc-800 bg-black/40 p-5">
              <p className="text-sm text-zinc-500">Valor estimado</p>
              <p className="mt-2 text-3xl font-bold">
                {formatPrice(estimatedRevenue)}
              </p>
            </div>
          </div>
        </div>

        <div className="mt-8 rounded-[2rem] border border-zinc-800 bg-black p-4 shadow-2xl">
          <div className="border-b border-zinc-800 px-2 pb-5">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-zinc-600">
              Base de clientes
            </p>

            <h2 className="mt-3 text-2xl font-bold">
              Clientes de {business.name}
            </h2>

            <p className="mt-2 text-sm text-zinc-500">
              A partir de agora, novas marcações com o mesmo e-mail ficam
              associadas ao mesmo cliente.
            </p>
          </div>

          {customers.length === 0 ? (
            <div className="mt-4 rounded-3xl border border-zinc-800 bg-zinc-950 p-10 text-center text-zinc-500">
              Ainda não existem clientes neste negócio.
            </div>
          ) : (
            <div className="mt-4 grid gap-4">
              {customers.map((customer) => {
                const validBookings = customer.bookings.filter(
                  (booking) => booking.status !== "CANCELLED"
                )

                const totalSpent = validBookings.reduce(
                  (sum, booking) => sum + booking.totalPriceCents,
                  0
                )

                const nextBooking = customer.bookings
                  .filter(
                    (booking) =>
                      booking.startAt >= now && booking.status === "CONFIRMED"
                  )
                  .sort((a, b) => a.startAt.getTime() - b.startAt.getTime())[0]

                const lastBooking = customer.bookings[0]

                const whatsappPhone = getWhatsAppPhone(customer.phone)

                const whatsappUrl = whatsappPhone
                  ? `https://wa.me/${whatsappPhone}?text=${encodeURIComponent(
                      createWhatsAppMessage(customer.name, business.name)
                    )}`
                  : ""

                return (
                  <div
                    key={customer.id}
                    className="rounded-3xl border border-zinc-800 bg-zinc-950 p-5"
                  >
                    <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
                      <div>
                        <div className="flex flex-wrap items-center gap-3">
                          <span className="rounded-full border border-white bg-white px-3 py-1 text-xs font-semibold text-zinc-950">
                            Cliente
                          </span>

                          <span className="text-sm text-zinc-500">
                            {customer.bookings.length} marcação/marcações
                          </span>
                        </div>

                        <h3 className="mt-4 text-2xl font-bold text-white">
                          {customer.name}
                        </h3>

                        <div className="mt-3 grid gap-2 text-sm text-zinc-500">
                          <p>
                            Telefone:{" "}
                            <span className="text-zinc-300">
                              {customer.phone || "Não informado"}
                            </span>
                          </p>

                          <p>
                            E-mail:{" "}
                            <span className="text-zinc-300">
                              {customer.email || "Não informado"}
                            </span>
                          </p>
                        </div>

                        <div className="mt-5 grid gap-3 sm:grid-cols-3">
                          <div className="rounded-2xl border border-zinc-800 bg-black p-4">
                            <p className="text-xs text-zinc-600">Marcações</p>
                            <p className="mt-1 text-xl font-bold">
                              {customer.bookings.length}
                            </p>
                          </div>

                          <div className="rounded-2xl border border-zinc-800 bg-black p-4">
                            <p className="text-xs text-zinc-600">
                              Valor estimado
                            </p>
                            <p className="mt-1 text-xl font-bold">
                              {formatPrice(totalSpent)}
                            </p>
                          </div>

                          <div className="rounded-2xl border border-zinc-800 bg-black p-4">
                            <p className="text-xs text-zinc-600">
                              Próxima marcação
                            </p>
                            <p className="mt-1 text-sm font-semibold">
                              {nextBooking
                                ? `${formatDate(nextBooking.startAt)} · ${formatTime(
                                    nextBooking.startAt
                                  )}`
                                : "Nenhuma"}
                            </p>
                          </div>
                        </div>

                        {lastBooking && (
                          <div className="mt-5 rounded-2xl border border-zinc-800 bg-black p-4">
                            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-zinc-600">
                              Última marcação
                            </p>

                            <p className="mt-3 text-sm text-zinc-400">
                              {formatDate(lastBooking.startAt)} ·{" "}
                              {formatTime(lastBooking.startAt)} -{" "}
                              {formatTime(lastBooking.endAt)} ·{" "}
                              {getStatusLabel(lastBooking.status)}
                            </p>

                            <div className="mt-3 grid gap-1 text-sm text-zinc-500">
                              {lastBooking.services.map((item) => (
                                <p key={item.id}>{item.service.name}</p>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="flex flex-col gap-4">
                        <div className="rounded-2xl border border-zinc-800 bg-black p-4">
                          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-zinc-600">
                            Contacto rápido
                          </p>

                          <p className="mt-3 text-sm text-zinc-500">
                            Abre o WhatsApp com uma mensagem pronta para este
                            cliente.
                          </p>

                          {whatsappUrl ? (
                            <a
                              href={whatsappUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="mt-4 block rounded-2xl border border-white bg-white px-4 py-3 text-center text-sm font-semibold text-zinc-950 transition hover:bg-zinc-200"
                            >
                              Enviar WhatsApp
                            </a>
                          ) : (
                            <div className="mt-4 rounded-2xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-center text-sm font-semibold text-zinc-600">
                              Cliente sem telefone
                            </div>
                          )}
                        </div>

                        <div className="rounded-2xl border border-zinc-800 bg-black p-4">
                          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-zinc-600">
                            Histórico recente
                          </p>

                          {customer.bookings.length === 0 ? (
                            <p className="mt-3 text-sm text-zinc-500">
                              Sem marcações.
                            </p>
                          ) : (
                            <div className="mt-3 grid gap-3">
                              {customer.bookings.slice(0, 3).map((booking) => (
                                <div
                                  key={booking.id}
                                  className="rounded-2xl border border-zinc-800 bg-zinc-950 p-3"
                                >
                                  <p className="text-sm font-semibold text-white">
                                    {formatDate(booking.startAt)} ·{" "}
                                    {formatTime(booking.startAt)}
                                  </p>

                                  <p className="mt-1 text-xs text-zinc-600">
                                    {getStatusLabel(booking.status)} ·{" "}
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