import Link from "next/link"
import { normalizeBusinessTheme } from "@/lib/business-theme"
import { getCurrentBusinessSlug } from "@/lib/current-business"
import { getDashboardThemeClasses } from "@/lib/dashboard-theme"
import { formatDuration } from "@/lib/format-duration"
import { prisma } from "@/lib/prisma"
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

type DashboardTheme = ReturnType<typeof getDashboardThemeClasses>

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
    PENDING: "border-yellow-300 bg-yellow-50 text-yellow-800",
    CONFIRMED: "border-emerald-300 bg-emerald-50 text-emerald-800",
    CANCELLED: "border-red-300 bg-red-50 text-red-800",
    COMPLETED: "border-blue-300 bg-blue-50 text-blue-800",
    NO_SHOW: "border-orange-300 bg-orange-50 text-orange-800",
  }

  return statusMap[status] ?? "border-zinc-300 bg-zinc-50 text-zinc-700"
}

function getFeedbackClasses(type: "error" | "success") {
  if (type === "error") {
    return "border-red-300 bg-red-50 text-red-800"
  }

  return "border-emerald-300 bg-emerald-50 text-emerald-800"
}

function getSelectClasses(theme: string) {
  if (theme === "WHITE") {
    return "mt-2 h-14 w-full rounded-2xl border border-zinc-300 bg-white px-4 text-sm font-semibold text-zinc-950 outline-none transition hover:border-zinc-950 focus:border-zinc-950"
  }

  if (theme === "NUDE") {
    return "mt-2 h-14 w-full rounded-2xl border border-[#d8beb0] bg-white px-4 text-sm font-semibold text-[#2b211c] outline-none transition hover:border-[#2b211c] focus:border-[#2b211c]"
  }

  return "mt-2 h-14 w-full rounded-2xl border border-zinc-700 bg-zinc-950 px-4 text-sm font-semibold text-white outline-none transition hover:border-zinc-500 focus:border-white"
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

function getFilterClasses({
  active,
  theme,
}: {
  active: boolean
  theme: DashboardTheme
}) {
  return active ? theme.actionHighlight : theme.action
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

  const currentTheme = normalizeBusinessTheme(business.theme)
  const theme = getDashboardThemeClasses(business.theme)
  const selectClasses = getSelectClasses(currentTheme)

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
                Marcações
              </h1>

              <p className={`mt-4 max-w-2xl ${theme.muted}`}>
                Acompanhe clientes, serviços, horários, estados e
                reagendamentos das marcações recebidas.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Link
                href="/dashboard"
                className={`rounded-2xl border px-5 py-3 text-center font-semibold transition ${theme.secondaryButton}`}
              >
                Voltar ao painel
              </Link>

              <Link
                href={`/book/${business.slug}`}
                className={`rounded-2xl border px-5 py-3 text-center font-semibold transition ${theme.primaryButton}`}
              >
                Abrir página pública
              </Link>
            </div>
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-4">
            <div className={`rounded-3xl border p-5 ${theme.card}`}>
              <p className={`text-sm ${theme.muted}`}>Hoje</p>
              <p className={`mt-2 text-3xl font-bold ${theme.title}`}>
                {todayBookings.length}
              </p>
            </div>

            <div className={`rounded-3xl border p-5 ${theme.card}`}>
              <p className={`text-sm ${theme.muted}`}>Próximas</p>
              <p className={`mt-2 text-3xl font-bold ${theme.title}`}>
                {upcomingBookings.length}
              </p>
            </div>

            <div className={`rounded-3xl border p-5 ${theme.card}`}>
              <p className={`text-sm ${theme.muted}`}>Confirmadas</p>
              <p className={`mt-2 text-3xl font-bold ${theme.title}`}>
                {confirmedBookings.length}
              </p>
            </div>

            <div className={`rounded-3xl border p-5 ${theme.card}`}>
              <p className={`text-sm ${theme.muted}`}>Concluídas</p>
              <p className={`mt-2 text-3xl font-bold ${theme.title}`}>
                {completedBookings.length}
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

        <div className={`mt-8 rounded-[2rem] border p-4 shadow-2xl ${theme.panel}`}>
          <div className={`border-b px-2 pb-5 ${theme.line}`}>
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <p className={`text-xs font-semibold uppercase tracking-[0.3em] ${theme.subtle}`}>
                  Filtro atual
                </p>

                <h2 className={`mt-3 text-2xl font-bold ${theme.title}`}>
                  {getViewTitle(view)}
                </h2>

                <p className={`mt-2 text-sm ${theme.muted}`}>
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
                      className={`rounded-2xl border px-4 py-3 text-sm font-semibold transition ${getFilterClasses(
                        {
                          active: isActive,
                          theme,
                        },
                      )}`}
                    >
                      {filter.label}{" "}
                      <span className="opacity-70">({filter.count})</span>
                    </Link>
                  )
                })}
              </div>
            </div>
          </div>

          {displayedBookings.length === 0 ? (
            <div
              className={`mt-4 rounded-3xl border p-10 text-center ${theme.card}`}
            >
              <p className={theme.muted}>{getEmptyMessage(view)}</p>
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

                const statusDefaultValue =
                  booking.status === "PENDING" ? "CONFIRMED" : booking.status

                return (
                  <div
                    key={booking.id}
                    className={`rounded-3xl border p-5 ${theme.card}`}
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

                          <span className={`text-sm ${theme.muted}`}>
                            {formatShortDate(booking.startAt)} ·{" "}
                            {formatTime(booking.startAt)} -{" "}
                            {formatTime(booking.endAt)}
                          </span>
                        </div>

                        <h2 className={`mt-4 text-2xl font-bold ${theme.title}`}>
                          {booking.customer.name}
                        </h2>

                        <div className={`mt-3 grid gap-2 text-sm ${theme.muted}`}>
                          {booking.customer.phone && (
                            <p>
                              Telefone:{" "}
                              <span className={`font-medium ${theme.title}`}>
                                {booking.customer.phone}
                              </span>
                            </p>
                          )}

                          {booking.customer.email && (
                            <p>
                              E-mail:{" "}
                              <span className={`font-medium ${theme.title}`}>
                                {booking.customer.email}
                              </span>
                            </p>
                          )}
                        </div>

                        <div className={`mt-5 rounded-2xl border p-4 ${theme.panelSoft}`}>
                          <p className={`text-xs font-semibold uppercase tracking-[0.3em] ${theme.subtle}`}>
                            Serviços
                          </p>

                          <div className="mt-3 grid gap-2">
                            {booking.services.map((item) => (
                              <div
                                key={item.id}
                                className="flex justify-between gap-4 text-sm"
                              >
                                <div>
                                  <p className={`font-medium ${theme.title}`}>
                                    {item.service.name}
                                  </p>

                                  <p className={`mt-1 text-xs ${theme.subtle}`}>
                                    {formatDuration(item.durationMin)}
                                  </p>
                                </div>

                                <span className={`font-semibold ${theme.title}`}>
                                  {formatPrice(item.priceCents)}
                                </span>
                              </div>
                            ))}
                          </div>

                          <div
                            className={`mt-4 grid gap-2 border-t pt-4 text-sm ${theme.line}`}
                          >
                            <div className="flex justify-between">
                              <span className={theme.muted}>Duração total</span>

                              <span className={`font-semibold ${theme.title}`}>
                                {formatDuration(booking.totalDurationMin)}
                              </span>
                            </div>

                            <div className="flex justify-between">
                              <span className={theme.muted}>Total</span>

                              <span className={`font-bold ${theme.title}`}>
                                {formatPrice(booking.totalPriceCents)}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className={`mt-5 rounded-[1.7rem] border p-5 shadow-inner ${theme.panelSoft}`}>
                          <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                            <div>
                              <p className={`text-xs font-semibold uppercase tracking-[0.35em] ${theme.subtle}`}>
                                Reagendar
                              </p>

                              <h3 className={`mt-2 text-xl font-bold ${theme.title}`}>
                                Alterar data e horário
                              </h3>

                              <p className={`mt-2 max-w-2xl text-sm leading-6 ${theme.muted}`}>
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
                              <label className={`text-xs font-semibold uppercase tracking-[0.18em] ${theme.subtle}`}>
                                Nova data
                              </label>

                              <select
                                name="date"
                                required
                                defaultValue={currentDate}
                                className={selectClasses}
                              >
                                {dateSelectOptions.map((option) => (
                                  <option
                                    key={option.value}
                                    value={option.value}
                                  >
                                    {option.label}
                                  </option>
                                ))}
                              </select>
                            </div>

                            <div>
                              <label className={`text-xs font-semibold uppercase tracking-[0.18em] ${theme.subtle}`}>
                                Novo horário
                              </label>

                              <select
                                name="time"
                                required
                                defaultValue={currentTime}
                                className={selectClasses}
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
                                className={`h-14 w-full rounded-2xl border px-5 text-sm font-bold transition ${theme.primaryButton}`}
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
                              className={`mt-4 flex min-h-12 items-center justify-center rounded-2xl border px-4 py-3 text-center text-sm font-semibold transition ${theme.secondaryButton}`}
                            >
                              Avisar cliente no WhatsApp após reagendar
                            </a>
                          )}
                        </div>
                      </div>

                      <div className="flex flex-col justify-between gap-5">
                        <div className={`rounded-2xl border p-4 ${theme.panelSoft}`}>
                          <p className={`text-xs font-semibold uppercase tracking-[0.3em] ${theme.subtle}`}>
                            Contacto rápido
                          </p>

                          <p className={`mt-3 text-sm ${theme.muted}`}>
                            Abre o WhatsApp com uma mensagem pronta para o
                            cliente.
                          </p>

                          {whatsappUrl ? (
                            <a
                              href={whatsappUrl}
                              target="_blank"
                              rel="noreferrer"
                              className={`mt-4 flex min-h-12 items-center justify-center rounded-2xl border px-4 py-3 text-center text-sm font-semibold transition ${theme.primaryButton}`}
                            >
                              Enviar WhatsApp
                            </a>
                          ) : (
                            <p className={`mt-4 rounded-2xl border px-4 py-3 text-center text-sm ${theme.badge}`}>
                              Cliente sem telefone.
                            </p>
                          )}
                        </div>

                        <div className={`rounded-2xl border p-4 ${theme.panelSoft}`}>
                          <p className={`text-xs font-semibold uppercase tracking-[0.3em] ${theme.subtle}`}>
                            Estado
                          </p>

                          <p className={`mt-3 text-sm ${theme.muted}`}>
                            Atualize o estado da marcação conforme o
                            atendimento.
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
                              required
                              defaultValue={statusDefaultValue}
                              className={selectClasses}
                            >
                              <option value="CONFIRMED">Confirmada</option>
                              <option value="CANCELLED">Cancelada</option>
                              <option value="COMPLETED">Concluída</option>
                              <option value="NO_SHOW">Faltou</option>
                            </select>

                            <button
                              type="submit"
                              className={`rounded-2xl border px-4 py-3 text-sm font-semibold transition ${theme.secondaryButton}`}
                            >
                              Atualizar estado
                            </button>
                          </form>
                        </div>

                        <div className={`rounded-2xl border p-4 ${theme.panelSoft}`}>
                          <p className={`text-xs font-semibold uppercase tracking-[0.3em] ${theme.subtle}`}>
                            Detalhes
                          </p>

                          <div className={`mt-4 grid gap-3 text-sm ${theme.muted}`}>
                            <div className="flex justify-between gap-4">
                              <span>Criada em</span>

                              <span className={`text-right font-medium ${theme.title}`}>
                                {formatShortDate(booking.createdAt)}
                              </span>
                            </div>

                            <div className="flex justify-between gap-4">
                              <span>ID</span>

                              <span className={`text-right font-mono text-xs ${theme.subtle}`}>
                                {booking.id.slice(0, 8)}
                              </span>
                            </div>

                            {booking.notes && (
                              <div>
                                <span>Notas</span>

                                <p className={`mt-2 rounded-2xl border p-3 ${theme.badge}`}>
                                  {booking.notes}
                                </p>
                              </div>
                            )}
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