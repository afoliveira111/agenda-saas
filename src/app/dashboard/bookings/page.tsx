import Link from "next/link"
import { prisma } from "@/lib/prisma"
import { getCurrentBusinessSlug } from "@/lib/current-business"
import { formatDuration } from "@/lib/format-duration"
import { timeOptions } from "@/lib/time-options"
import {
  rescheduleBookingAction,
  updateBookingStatusAction,
} from "./actions"

type BookingsPageProps = {
  searchParams: Promise<{
    view?: string
    error?: string
    success?: string
  }>
}

type BookingView = "today" | "upcoming" | "history" | "cancelled" | "all"

function normalizeView(view?: string): BookingView {
  if (
    view === "today" ||
    view === "upcoming" ||
    view === "history" ||
    view === "cancelled" ||
    view === "all"
  ) {
    return view
  }

  return "upcoming"
}

function formatPrice(priceCents: number) {
  return new Intl.NumberFormat("pt-PT", {
    style: "currency",
    currency: "EUR",
  }).format(priceCents / 100)
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("pt-PT", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(date)
}

function formatShortDate(date: Date) {
  return new Intl.DateTimeFormat("pt-PT", {
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

function formatDateInput(date: Date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")

  return `${year}-${month}-${day}`
}

function formatTimeInput(date: Date) {
  const hours = String(date.getHours()).padStart(2, "0")
  const minutes = String(date.getMinutes()).padStart(2, "0")

  return `${hours}:${minutes}`
}

function formatDateSelectLabel(date: Date) {
  return new Intl.DateTimeFormat("pt-PT", {
    weekday: "long",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date)
}

function getDateFromInputValue(value: string) {
  const [year, month, day] = value.split("-").map(Number)

  return new Date(year, month - 1, day, 0, 0, 0, 0)
}

function getRescheduleDateOptions(currentDateValue: string) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const options = Array.from({ length: 91 }, (_, index) => {
    const date = new Date(today)
    date.setDate(today.getDate() + index)

    const value = formatDateInput(date)

    return {
      value,
      label:
        index === 0
          ? `Hoje — ${formatDateSelectLabel(date)}`
          : formatDateSelectLabel(date),
    }
  })

  const currentDateAlreadyExists = options.some(
    (option) => option.value === currentDateValue,
  )

  if (!currentDateAlreadyExists && currentDateValue) {
    const currentDate = getDateFromInputValue(currentDateValue)

    options.unshift({
      value: currentDateValue,
      label: `Data atual — ${formatDateSelectLabel(currentDate)}`,
    })
  }

  return options
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

function getStatusClasses(status: string) {
  const statusMap: Record<string, string> = {
    PENDING: "border-yellow-900/70 bg-yellow-950/40 text-yellow-300",
    CONFIRMED: "border-white bg-white text-zinc-950",
    CANCELLED: "border-red-900/70 bg-red-950/40 text-red-300",
    COMPLETED: "border-emerald-900/70 bg-emerald-950/40 text-emerald-300",
    NO_SHOW: "border-orange-900/70 bg-orange-950/40 text-orange-300",
  }

  return statusMap[status] ?? "border-zinc-700 bg-zinc-900 text-zinc-300"
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

function getWhatsAppPhone(phone: string | null) {
  if (!phone) {
    return ""
  }

  return phone.replace(/\D/g, "")
}

function createWhatsAppMessage({
  customerName,
  businessName,
  date,
  startTime,
  endTime,
  services,
}: {
  customerName: string
  businessName: string
  date: string
  startTime: string
  endTime: string
  services: string[]
}) {
  return [
    `Olá ${customerName}, tudo bem?`,
    "",
    `Lembramos da sua marcação no ${businessName}.`,
    "",
    `Data: ${date}`,
    `Horário: ${startTime} - ${endTime}`,
    `Serviço(s): ${services.join(", ")}`,
    "",
    "Caso precise alterar ou cancelar, responda esta mensagem.",
  ].join("\n")
}

function createRescheduleWhatsAppMessage({
  customerName,
  businessName,
  date,
  startTime,
  endTime,
  services,
}: {
  customerName: string
  businessName: string
  date: string
  startTime: string
  endTime: string
  services: string[]
}) {
  return [
    `Olá ${customerName}, tudo bem?`,
    "",
    `A sua marcação no ${businessName} foi reagendada.`,
    "",
    `Nova data: ${date}`,
    `Novo horário: ${startTime} - ${endTime}`,
    `Serviço(s): ${services.join(", ")}`,
    "",
    "Qualquer dúvida, responda esta mensagem.",
  ].join("\n")
}

function getViewTitle(view: BookingView) {
  const titles: Record<BookingView, string> = {
    today: "Marcações de hoje",
    upcoming: "Próximas marcações",
    history: "Histórico",
    cancelled: "Marcações canceladas",
    all: "Todas as marcações",
  }

  return titles[view]
}

function getEmptyMessage(view: BookingView) {
  const messages: Record<BookingView, string> = {
    today: "Nenhuma marcação para hoje.",
    upcoming: "Nenhuma marcação futura confirmada.",
    history: "Nenhuma marcação no histórico.",
    cancelled: "Nenhuma marcação cancelada.",
    all: "Ainda não existem marcações.",
  }

  return messages[view]
}

export default async function DashboardBookingsPage({
  searchParams,
}: BookingsPageProps) {
  const { view: viewParam, error, success } = await searchParams
  const view = normalizeView(viewParam)

  const now = new Date()
  const todayStart = getTodayStart()
  const tomorrowStart = getTomorrowStart()

  const business = await prisma.business.findUnique({
    where: {
      slug: await getCurrentBusinessSlug(),
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
    return booking.startAt >= now && booking.status === "CONFIRMED"
  })

  const historyBookings = bookings.filter((booking) => {
    return (
      booking.status === "COMPLETED" ||
      booking.status === "NO_SHOW" ||
      (booking.startAt < now && booking.status !== "CANCELLED")
    )
  })

  const cancelledBookings = bookings.filter(
    (booking) => booking.status === "CANCELLED",
  )

  const confirmedBookings = bookings.filter(
    (booking) => booking.status === "CONFIRMED",
  )

  const completedBookings = bookings.filter(
    (booking) => booking.status === "COMPLETED",
  )

  const displayedBookings =
    view === "today"
      ? todayBookings
      : view === "upcoming"
        ? upcomingBookings
        : view === "history"
          ? historyBookings
          : view === "cancelled"
            ? cancelledBookings
            : bookings

  const filterLinks = [
    {
      label: "Hoje",
      view: "today" as BookingView,
      href: "/dashboard/bookings?view=today",
      count: todayBookings.length,
    },
    {
      label: "Próximas",
      view: "upcoming" as BookingView,
      href: "/dashboard/bookings",
      count: upcomingBookings.length,
    },
    {
      label: "Histórico",
      view: "history" as BookingView,
      href: "/dashboard/bookings?view=history",
      count: historyBookings.length,
    },
    {
      label: "Canceladas",
      view: "cancelled" as BookingView,
      href: "/dashboard/bookings?view=cancelled",
      count: cancelledBookings.length,
    },
    {
      label: "Todas",
      view: "all" as BookingView,
      href: "/dashboard/bookings?view=all",
      count: bookings.length,
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
                Marcações
              </h1>

              <p className="mt-4 max-w-2xl text-zinc-400">
                Acompanhe os clientes, serviços, horários, estados e
                reagendamentos das marcações recebidas.
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
              <p className="text-sm text-zinc-500">Hoje</p>
              <p className="mt-2 text-3xl font-bold">{todayBookings.length}</p>
            </div>

            <div className="rounded-3xl border border-zinc-800 bg-black/40 p-5">
              <p className="text-sm text-zinc-500">Próximas</p>
              <p className="mt-2 text-3xl font-bold">
                {upcomingBookings.length}
              </p>
            </div>

            <div className="rounded-3xl border border-zinc-800 bg-black/40 p-5">
              <p className="text-sm text-zinc-500">Confirmadas</p>
              <p className="mt-2 text-3xl font-bold">
                {confirmedBookings.length}
              </p>
            </div>

            <div className="rounded-3xl border border-zinc-800 bg-black/40 p-5">
              <p className="text-sm text-zinc-500">Concluídas</p>
              <p className="mt-2 text-3xl font-bold">
                {completedBookings.length}
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

        <div className="mt-8 rounded-[2rem] border border-zinc-800 bg-black p-4 shadow-2xl">
          <div className="border-b border-zinc-800 px-2 pb-5">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-zinc-600">
                  Filtro atual
                </p>

                <h2 className="mt-3 text-2xl font-bold">
                  {getViewTitle(view)}
                </h2>

                <p className="mt-2 text-sm text-zinc-500">
                  A lista principal mostra por padrão apenas as próximas
                  marcações confirmadas. O histórico continua guardado.
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                {filterLinks.map((filter) => {
                  const isActive = filter.view === view

                  return (
                    <Link
                      key={filter.view}
                      href={filter.href}
                      className={`rounded-2xl border px-4 py-3 text-sm font-semibold transition ${
                        isActive
                          ? "border-white bg-white text-zinc-950"
                          : "border-zinc-800 bg-zinc-950 text-zinc-400 hover:border-white hover:text-white"
                      }`}
                    >
                      {filter.label}{" "}
                      <span className="text-zinc-600">({filter.count})</span>
                    </Link>
                  )
                })}
              </div>
            </div>
          </div>

          {displayedBookings.length === 0 ? (
            <div className="mt-4 rounded-3xl border border-zinc-800 bg-zinc-950 p-10 text-center text-zinc-500">
              {getEmptyMessage(view)}
            </div>
          ) : (
            <div className="mt-4 grid gap-4">
              {displayedBookings.map((booking) => {
                const services = booking.services.map(
                  (item) => item.service.name,
                )

                const whatsappPhone = getWhatsAppPhone(booking.customer.phone)

                const whatsappMessage = createWhatsAppMessage({
                  customerName: booking.customer.name,
                  businessName: business.name,
                  date: formatDate(booking.startAt),
                  startTime: formatTime(booking.startAt),
                  endTime: formatTime(booking.endAt),
                  services,
                })

                const rescheduleWhatsAppMessage =
                  createRescheduleWhatsAppMessage({
                    customerName: booking.customer.name,
                    businessName: business.name,
                    date: formatDate(booking.startAt),
                    startTime: formatTime(booking.startAt),
                    endTime: formatTime(booking.endAt),
                    services,
                  })

                const whatsappUrl = whatsappPhone
                  ? `https://wa.me/${whatsappPhone}?text=${encodeURIComponent(
                      whatsappMessage,
                    )}`
                  : ""

                const rescheduleWhatsappUrl = whatsappPhone
                  ? `https://wa.me/${whatsappPhone}?text=${encodeURIComponent(
                      rescheduleWhatsAppMessage,
                    )}`
                  : ""

                const currentDate = formatDateInput(booking.startAt)
                const currentTime = formatTimeInput(booking.startAt)
                const dateSelectOptions = getRescheduleDateOptions(currentDate)

                const timeSelectOptions = timeOptions.includes(currentTime)
                  ? timeOptions
                  : [currentTime, ...timeOptions]

                return (
                  <div
                    key={booking.id}
                    className="rounded-3xl border border-zinc-800 bg-zinc-950 p-5"
                  >
                    <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
                      <div>
                        <div className="flex flex-wrap items-center gap-3">
                          <span
                            className={`rounded-full border px-3 py-1 text-xs font-semibold ${getStatusClasses(
                              booking.status,
                            )}`}
                          >
                            {formatStatus(booking.status)}
                          </span>

                          <span className="text-sm text-zinc-500">
                            {formatShortDate(booking.startAt)} ·{" "}
                            {formatTime(booking.startAt)} -{" "}
                            {formatTime(booking.endAt)}
                          </span>
                        </div>

                        <h2 className="mt-4 text-2xl font-bold text-white">
                          {booking.customer.name}
                        </h2>

                        <div className="mt-3 grid gap-2 text-sm text-zinc-500">
                          {booking.customer.phone && (
                            <p>
                              Telefone:{" "}
                              <span className="text-zinc-300">
                                {booking.customer.phone}
                              </span>
                            </p>
                          )}

                          {booking.customer.email && (
                            <p>
                              E-mail:{" "}
                              <span className="text-zinc-300">
                                {booking.customer.email}
                              </span>
                            </p>
                          )}
                        </div>

                        <div className="mt-5 rounded-2xl border border-zinc-800 bg-black p-4">
                          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-zinc-600">
                            Serviços
                          </p>

                          <div className="mt-3 grid gap-2">
                            {booking.services.map((item) => (
                              <div
                                key={item.id}
                                className="flex justify-between gap-4 text-sm"
                              >
                                <div>
                                  <p className="text-zinc-300">
                                    {item.service.name}
                                  </p>

                                  <p className="mt-1 text-xs text-zinc-600">
                                    {formatDuration(item.durationMin)}
                                  </p>
                                </div>

                                <span className="font-semibold text-white">
                                  {formatPrice(item.priceCents)}
                                </span>
                              </div>
                            ))}
                          </div>

                          <div className="mt-4 grid gap-2 border-t border-zinc-800 pt-4 text-sm">
                            <div className="flex justify-between">
                              <span className="text-zinc-500">
                                Duração total
                              </span>

                              <span className="font-semibold text-white">
                                {formatDuration(booking.totalDurationMin)}
                              </span>
                            </div>

                            <div className="flex justify-between">
                              <span className="text-zinc-500">Total</span>

                              <span className="font-bold text-white">
                                {formatPrice(booking.totalPriceCents)}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="mt-5 rounded-[1.7rem] border border-zinc-800 bg-gradient-to-br from-black via-zinc-950 to-black p-5 shadow-inner">
                          <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                            <div>
                              <p className="text-xs font-semibold uppercase tracking-[0.35em] text-zinc-600">
                                Reagendar
                              </p>

                              <h3 className="mt-2 text-xl font-bold text-white">
                                Alterar data e horário
                              </h3>

                              <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-500">
                                Escolha a nova data e o novo horário. O sistema
                                valida conflitos e o horário de atendimento.
                              </p>
                            </div>
                          </div>

                          <form
                            action={rescheduleBookingAction}
                            className="mt-5 grid gap-4 xl:grid-cols-[minmax(260px,1.4fr)_170px_150px]"
                          >
                            <input
                              type="hidden"
                              name="bookingId"
                              value={booking.id}
                            />

                            <input type="hidden" name="view" value={view} />

                            <div>
                              <label className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-600">
                                Nova data
                              </label>

                              <select
                                name="date"
                                required
                                defaultValue={currentDate}
                                className="mt-2 h-14 w-full rounded-2xl border border-zinc-700 bg-zinc-950 px-4 text-sm font-semibold text-white outline-none transition hover:border-zinc-500 focus:border-white"
                              >
                                {dateSelectOptions.map((option) => (
                                  <option key={option.value} value={option.value}>
                                    {option.label}
                                  </option>
                                ))}
                              </select>
                            </div>

                            <div>
                              <label className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-600">
                                Novo horário
                              </label>

                              <select
                                name="time"
                                required
                                defaultValue={currentTime}
                                className="mt-2 h-14 w-full rounded-2xl border border-zinc-700 bg-zinc-950 px-4 text-sm font-semibold text-white outline-none transition hover:border-zinc-500 focus:border-white"
                              >
                                {timeSelectOptions.map((option) => (
                                  <option key={option} value={option}>
                                    {option}
                                  </option>
                                ))}
                              </select>
                            </div>

                            <div className="flex items-end">
                              <button
                                type="submit"
                                className="h-14 w-full rounded-2xl border border-white bg-white px-5 text-sm font-bold text-zinc-950 shadow-lg shadow-white/5 transition hover:bg-zinc-200"
                              >
                                Reagendar
                              </button>
                            </div>
                          </form>

                          {rescheduleWhatsappUrl && (
                            <a
                              href={rescheduleWhatsappUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="mt-4 flex min-h-12 items-center justify-center rounded-2xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-center text-sm font-semibold text-zinc-300 transition hover:border-white hover:bg-black hover:text-white"
                            >
                              Avisar cliente no WhatsApp após reagendar
                            </a>
                          )}
                        </div>
                      </div>

                      <div className="flex flex-col justify-between gap-5">
                        <div className="rounded-2xl border border-zinc-800 bg-black p-4">
                          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-zinc-600">
                            Contacto rápido
                          </p>

                          <p className="mt-3 text-sm text-zinc-500">
                            Abre o WhatsApp com uma mensagem pronta para o
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
                            <div className="mt-4 rounded-2xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-center text-sm font-medium text-zinc-600">
                              Sem telefone
                            </div>
                          )}
                        </div>

                        <div className="rounded-2xl border border-zinc-800 bg-black p-4">
                          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-zinc-600">
                            Estado
                          </p>

                          <form
                            action={updateBookingStatusAction}
                            className="mt-4 grid gap-3"
                          >
                            <input
                              type="hidden"
                              name="bookingId"
                              value={booking.id}
                            />

                            <input type="hidden" name="view" value={view} />

                            <select
                              name="status"
                              defaultValue={booking.status}
                              className="w-full rounded-2xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-white outline-none transition focus:border-white"
                            >
                              <option value="CONFIRMED">Confirmada</option>
                              <option value="COMPLETED">Concluída</option>
                              <option value="NO_SHOW">Faltou</option>
                              <option value="CANCELLED">Cancelada</option>
                            </select>

                            <button
                              type="submit"
                              className="rounded-2xl border border-zinc-700 px-4 py-3 text-sm font-semibold text-zinc-300 transition hover:border-white hover:text-white"
                            >
                              Guardar estado
                            </button>
                          </form>
                        </div>

                        <div className="rounded-2xl border border-zinc-800 bg-black p-4">
                          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-zinc-600">
                            Detalhes
                          </p>

                          <div className="mt-4 grid gap-3 text-sm">
                            <div>
                              <p className="text-zinc-600">Data</p>
                              <p className="mt-1 font-semibold text-white">
                                {formatDate(booking.startAt)}
                              </p>
                            </div>

                            <div>
                              <p className="text-zinc-600">Horário</p>
                              <p className="mt-1 font-semibold text-white">
                                {formatTime(booking.startAt)} -{" "}
                                {formatTime(booking.endAt)}
                              </p>
                            </div>

                            <div>
                              <p className="text-zinc-600">Criada em</p>
                              <p className="mt-1 font-semibold text-white">
                                {formatShortDate(booking.createdAt)} ·{" "}
                                {formatTime(booking.createdAt)}
                              </p>
                            </div>
                          </div>
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