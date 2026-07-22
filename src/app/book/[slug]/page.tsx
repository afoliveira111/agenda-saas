import Link from "next/link"
import { notFound } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { BookingCustomerForm } from "./BookingCustomerForm"

type BookingPageProps = {
  params: Promise<{
    slug: string
  }>
  searchParams: Promise<{
    services?: string
    date?: string
    time?: string
  }>
}

function formatPrice(priceCents: number) {
  return new Intl.NumberFormat("pt-PT", {
    style: "currency",
    currency: "EUR",
  }).format(priceCents / 100)
}

function formatDateParam(date: Date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")

  return `${year}-${month}-${day}`
}

function formatDateLabel(date: Date) {
  return new Intl.DateTimeFormat("pt-PT", {
    weekday: "short",
    day: "2-digit",
    month: "short",
  }).format(date)
}

function parseDateParam(dateParam?: string) {
  if (!dateParam) return null

  const [year, month, day] = dateParam.split("-").map(Number)

  if (!year || !month || !day) return null

  return new Date(year, month - 1, day, 0, 0, 0, 0)
}

function addMinutes(date: Date, minutes: number) {
  return new Date(date.getTime() + minutes * 60 * 1000)
}

function timeToMinutes(time: string) {
  const [hours, minutes] = time.split(":").map(Number)
  return hours * 60 + minutes
}

function minutesToTime(totalMinutes: number) {
  const hours = Math.floor(totalMinutes / 60)
  const minutes = totalMinutes % 60

  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`
}

function combineDateAndTime(date: Date, time: string) {
  const [hours, minutes] = time.split(":").map(Number)

  const result = new Date(date)
  result.setHours(hours, minutes, 0, 0)

  return result
}

function hasBookingConflict(
  slotStart: Date,
  slotEnd: Date,
  bookings: Array<{ startAt: Date; endAt: Date }>
) {
  return bookings.some((booking) => {
    return slotStart < booking.endAt && slotEnd > booking.startAt
  })
}

function buildBookingUrl({
  slug,
  serviceIds,
  date,
  time,
  hash,
}: {
  slug: string
  serviceIds: string[]
  date?: string
  time?: string
  hash?: string
}) {
  const params = new URLSearchParams()

  if (serviceIds.length > 0) {
    params.set("services", serviceIds.join(","))
  }

  if (date) {
    params.set("date", date)
  }

  if (time) {
    params.set("time", time)
  }

  const query = params.toString()
  const baseUrl = query ? `/book/${slug}?${query}` : `/book/${slug}`

  return hash ? `${baseUrl}#${hash}` : baseUrl
}

function toggleServiceId(currentIds: string[], serviceId: string) {
  const alreadySelected = currentIds.includes(serviceId)

  if (alreadySelected) {
    return currentIds.filter((id) => id !== serviceId)
  }

  return [...currentIds, serviceId]
}

export default async function BookingPage({
  params,
  searchParams,
}: BookingPageProps) {
  const { slug } = await params
  const { services, date, time } = await searchParams

  const selectedServiceIds = services
    ? services.split(",").filter(Boolean)
    : []

  const business = await prisma.business.findUnique({
    where: {
      slug,
    },
    include: {
      services: {
        where: {
          active: true,
        },
        orderBy: {
          createdAt: "asc",
        },
      },
      workHours: {
        where: {
          active: true,
        },
      },
      blockedDays: true,
    },
  })

  if (!business) {
    notFound()
  }

  const selectedServices = business.services.filter((service) =>
    selectedServiceIds.includes(service.id)
  )

  const totalPriceCents = selectedServices.reduce(
    (total, service) => total + service.priceCents,
    0
  )

  const totalDurationMin = selectedServices.reduce(
    (total, service) => total + service.durationMin,
    0
  )

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const blockedDateParams = business.blockedDays.map((blockedDay) =>
    formatDateParam(blockedDay.date)
  )

  const availableDates = Array.from({ length: 21 }, (_, index) => {
    const currentDate = new Date(today)
    currentDate.setDate(today.getDate() + index)

    const dateParam = formatDateParam(currentDate)
    const dayOfWeek = currentDate.getDay()

    const hasWorkHour = business.workHours.some(
      (workHour) => workHour.dayOfWeek === dayOfWeek
    )

    const isBlocked = blockedDateParams.includes(dateParam)

    return {
      date: currentDate,
      dateParam,
      label: formatDateLabel(currentDate),
      available: hasWorkHour && !isBlocked,
    }
  })

  const selectedDate = parseDateParam(date)
  let availableSlots: string[] = []

  if (selectedDate && totalDurationMin > 0) {
    const selectedDateParam = formatDateParam(selectedDate)
    const selectedDayOfWeek = selectedDate.getDay()

    const isBlocked = blockedDateParams.includes(selectedDateParam)

    const workHour = business.workHours.find(
      (item) => item.dayOfWeek === selectedDayOfWeek
    )

    if (workHour && !isBlocked) {
      const dayStart = new Date(selectedDate)
      dayStart.setHours(0, 0, 0, 0)

      const dayEnd = new Date(selectedDate)
      dayEnd.setHours(23, 59, 59, 999)

      const existingBookings = await prisma.booking.findMany({
        where: {
          businessId: business.id,
          status: {
            not: "CANCELLED",
          },
          startAt: {
            lt: dayEnd,
          },
          endAt: {
            gt: dayStart,
          },
        },
        select: {
          startAt: true,
          endAt: true,
        },
      })

      const startMinutes = timeToMinutes(workHour.startTime)
      const endMinutes = timeToMinutes(workHour.endTime)

      const slots: string[] = []

      for (
        let currentMinutes = startMinutes;
        currentMinutes + totalDurationMin <= endMinutes;
        currentMinutes += 30
      ) {
        const slotTime = minutesToTime(currentMinutes)
        const slotStart = combineDateAndTime(selectedDate, slotTime)
        const slotEnd = addMinutes(slotStart, totalDurationMin)

        const isPast = slotStart <= new Date()
        const hasConflict = hasBookingConflict(
          slotStart,
          slotEnd,
          existingBookings
        )

        if (!isPast && !hasConflict) {
          slots.push(slotTime)
        }
      }

      availableSlots = slots
    }
  }

  return (
    <main className="min-h-screen bg-black text-white">
      <section className="mx-auto max-w-4xl px-5 py-8 sm:px-6 sm:py-12">
        <div className="overflow-hidden rounded-[2rem] border border-zinc-800 bg-gradient-to-br from-zinc-900 via-zinc-950 to-black shadow-2xl">
          <div className="border-b border-zinc-800 px-6 py-8 sm:px-8">
            <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.35em] text-zinc-500">
                  Marcação online
                </p>

                <h1 className="mt-4 text-4xl font-bold tracking-tight text-white sm:text-5xl">
                  {business.name}
                </h1>

                {business.description && (
                  <p className="mt-4 max-w-2xl text-zinc-400">
                    {business.description}
                  </p>
                )}
              </div>

              <div className="rounded-2xl border border-zinc-800 bg-black/40 px-4 py-3 text-sm text-zinc-400">
                <p className="font-medium text-zinc-200">Reserva simples</p>
                <p className="mt-1">Escolha serviços, data e horário.</p>
              </div>
            </div>

            <div className="mt-8 grid gap-3 text-sm text-zinc-500 sm:grid-cols-3">
              {business.address && (
                <div className="rounded-2xl border border-zinc-800 bg-black/30 p-4">
                  <p className="text-xs uppercase tracking-[0.25em] text-zinc-600">
                    Local
                  </p>
                  <p className="mt-2 text-zinc-300">{business.address}</p>
                </div>
              )}

              {business.phone && (
                <div className="rounded-2xl border border-zinc-800 bg-black/30 p-4">
                  <p className="text-xs uppercase tracking-[0.25em] text-zinc-600">
                    Telefone
                  </p>
                  <p className="mt-2 text-zinc-300">+{business.phone}</p>
                </div>
              )}

              {business.email && (
                <div className="rounded-2xl border border-zinc-800 bg-black/30 p-4">
                  <p className="text-xs uppercase tracking-[0.25em] text-zinc-600">
                    E-mail
                  </p>
                  <p className="mt-2 text-zinc-300">{business.email}</p>
                </div>
              )}
            </div>
          </div>

          <div className="px-6 py-8 sm:px-8">
            <div id="servicos" className="scroll-mt-8">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.3em] text-zinc-500">
                    Passo 1
                  </p>

                  <h2 className="mt-3 text-2xl font-semibold tracking-tight text-white">
                    Escolha os serviços
                  </h2>

                  <p className="mt-2 text-zinc-500">
                    Pode escolher um ou mais serviços para a mesma marcação.
                  </p>
                </div>

                {selectedServices.length > 0 && (
                  <Link
                    href={`/book/${business.slug}#servicos`}
                    className="rounded-2xl border border-zinc-700 px-4 py-3 text-center text-sm font-semibold text-zinc-300 transition hover:border-white hover:text-white"
                  >
                    Limpar seleção
                  </Link>
                )}
              </div>

              <div className="mt-6 grid gap-4">
                {business.services.map((service) => {
                  const isSelected = selectedServiceIds.includes(service.id)

                  const nextSelectedServiceIds = toggleServiceId(
                    selectedServiceIds,
                    service.id
                  )

                  return (
                    <Link
                      key={service.id}
                      scroll={false}
                      href={buildBookingUrl({
                        slug: business.slug,
                        serviceIds: nextSelectedServiceIds,
                        date,
                      })}
                      className={`group block rounded-3xl border p-5 transition ${
                        isSelected
                          ? "border-white bg-white text-zinc-950 shadow-xl shadow-white/10"
                          : "border-zinc-800 bg-zinc-950 text-white hover:border-zinc-500"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <div className="flex items-center gap-3">
                            <div
                              className={`flex h-7 w-7 items-center justify-center rounded-full border text-sm font-bold ${
                                isSelected
                                  ? "border-zinc-950 bg-zinc-950 text-white"
                                  : "border-zinc-700 bg-black text-zinc-600 group-hover:border-zinc-400"
                              }`}
                            >
                              {isSelected ? "✓" : ""}
                            </div>

                            <h3 className="text-lg font-semibold">
                              {service.name}
                            </h3>
                          </div>

                          {service.description && (
                            <p
                              className={`mt-3 text-sm ${
                                isSelected ? "text-zinc-700" : "text-zinc-500"
                              }`}
                            >
                              {service.description}
                            </p>
                          )}

                          <p className="mt-3 text-sm text-zinc-600">
                            Duração: {service.durationMin} minutos
                          </p>
                        </div>

                        <div className="text-right">
                          <p
                            className={`text-lg font-bold ${
                              isSelected ? "text-zinc-950" : "text-white"
                            }`}
                          >
                            {formatPrice(service.priceCents)}
                          </p>
                        </div>
                      </div>
                    </Link>
                  )
                })}
              </div>
            </div>

            {selectedServices.length > 0 && (
              <div
                id="resumo"
                className="mt-10 scroll-mt-8 rounded-[2rem] border border-zinc-700 bg-gradient-to-br from-zinc-900 to-black p-6 shadow-xl"
              >
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-zinc-500">
                  Resumo
                </p>

                <h2 className="mt-3 text-2xl font-bold">
                  {selectedServices.length} serviço
                  {selectedServices.length > 1 ? "s" : ""} selecionado
                  {selectedServices.length > 1 ? "s" : ""}
                </h2>

                <div className="mt-5 space-y-3">
                  {selectedServices.map((service) => (
                    <div
                      key={service.id}
                      className="flex justify-between gap-4 border-b border-zinc-800 pb-3 text-sm text-zinc-300 last:border-b-0 last:pb-0"
                    >
                      <span>{service.name}</span>
                      <span className="font-medium text-white">
                        {formatPrice(service.priceCents)}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="mt-6 grid gap-3 sm:grid-cols-2">
                  <div className="rounded-2xl border border-zinc-800 bg-black p-4">
                    <p className="text-xs uppercase tracking-[0.25em] text-zinc-600">
                      Duração total
                    </p>
                    <p className="mt-2 text-xl font-semibold">
                      {totalDurationMin} minutos
                    </p>
                  </div>

                  <div className="rounded-2xl border border-zinc-800 bg-black p-4">
                    <p className="text-xs uppercase tracking-[0.25em] text-zinc-600">
                      Total estimado
                    </p>
                    <p className="mt-2 text-xl font-semibold">
                      {formatPrice(totalPriceCents)}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {selectedServices.length > 0 && (
              <div id="datas" className="mt-10 scroll-mt-8">
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-zinc-500">
                  Passo 2
                </p>

                <h2 className="mt-3 text-2xl font-semibold tracking-tight">
                  Escolha uma data
                </h2>

                <p className="mt-2 text-zinc-500">
                  Apenas os dias com atendimento disponível ficam selecionáveis.
                </p>

                <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {availableDates.map((item) => {
                    const isSelected = item.dateParam === date

                    if (!item.available) {
                      return (
                        <div
                          key={item.dateParam}
                          className="rounded-2xl border border-zinc-900 bg-zinc-950/60 px-4 py-4 text-center text-sm text-zinc-700"
                        >
                          {item.label}
                          <div className="mt-1 text-xs">Indisponível</div>
                        </div>
                      )
                    }

                    return (
                      <Link
                        key={item.dateParam}
                        href={buildBookingUrl({
                          slug: business.slug,
                          serviceIds: selectedServiceIds,
                          date: item.dateParam,
                          hash: "horarios",
                        })}
                        className={`rounded-2xl border px-4 py-4 text-center text-sm font-semibold transition ${
                          isSelected
                            ? "border-white bg-white text-zinc-950 shadow-lg shadow-white/10"
                            : "border-zinc-800 bg-zinc-950 text-zinc-200 hover:border-zinc-500"
                        }`}
                      >
                        {item.label}
                      </Link>
                    )
                  })}
                </div>
              </div>
            )}

            {selectedServices.length > 0 && date && (
              <div id="horarios" className="mt-10 scroll-mt-8">
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-zinc-500">
                  Passo 3
                </p>

                <h2 className="mt-3 text-2xl font-semibold tracking-tight">
                  Escolha um horário
                </h2>

                <p className="mt-2 text-zinc-500">
                  Horários ocupados ou incompatíveis com a duração total não
                  aparecem.
                </p>

                {availableSlots.length > 0 ? (
                  <div className="mt-6 grid grid-cols-3 gap-3 sm:grid-cols-4">
                    {availableSlots.map((slot) => {
                      const isSelected = slot === time

                      return (
                        <Link
                          key={slot}
                          href={buildBookingUrl({
                            slug: business.slug,
                            serviceIds: selectedServiceIds,
                            date,
                            time: slot,
                            hash: "confirmacao",
                          })}
                          className={`rounded-2xl border px-4 py-4 text-center font-semibold transition ${
                            isSelected
                              ? "border-white bg-white text-zinc-950 shadow-lg shadow-white/10"
                              : "border-zinc-800 bg-zinc-950 text-zinc-200 hover:border-zinc-500"
                          }`}
                        >
                          {slot}
                        </Link>
                      )
                    })}
                  </div>
                ) : (
                  <div className="mt-6 rounded-3xl border border-zinc-800 bg-zinc-950 p-6 text-zinc-500">
                    Não existem horários disponíveis para esta data.
                  </div>
                )}
              </div>
            )}

            {selectedServices.length > 0 && date && time && (
              <BookingCustomerForm
                slug={business.slug}
                serviceIds={selectedServiceIds}
                date={date}
                time={time}
              />
            )}
          </div>
        </div>
      </section>
    </main>
  )
}