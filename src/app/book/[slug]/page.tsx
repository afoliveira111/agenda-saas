import Image from "next/image"
import Link from "next/link"
import { notFound } from "next/navigation"
import { getPublicThemeClasses } from "@/lib/business-theme"
import { formatDuration } from "@/lib/format-duration"
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
  bookings: Array<{ startAt: Date; endAt: Date }>,
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

function formatPhoneDisplay(phone: string | null) {
  if (!phone) {
    return ""
  }

  const digitsOnly = phone.replace(/\D/g, "")

  if (!digitsOnly) {
    return ""
  }

  return `+${digitsOnly}`
}

function getBusinessLogo({
  slug,
  name,
}: {
  slug: string
  name: string
}) {
  const normalizedText = `${slug} ${name}`
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()

  if (
    normalizedText.includes("essencia") ||
    normalizedText.includes("beauty lounge") ||
    slug === "demo"
  ) {
    return "/logos/essencia-beauty-lounge.png"
  }

  return null
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

  const theme = getPublicThemeClasses(business.theme)

  const selectedServices = business.services.filter((service) =>
    selectedServiceIds.includes(service.id),
  )

  const totalPriceCents = selectedServices.reduce(
    (total, service) => total + service.priceCents,
    0,
  )

  const totalDurationMin = selectedServices.reduce(
    (total, service) => total + service.durationMin,
    0,
  )

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const blockedDateParams = business.blockedDays.map((blockedDay) =>
    formatDateParam(blockedDay.date),
  )

  const availableDates = Array.from({ length: 21 }, (_, index) => {
    const currentDate = new Date(today)
    currentDate.setDate(today.getDate() + index)

    const dateParam = formatDateParam(currentDate)
    const dayOfWeek = currentDate.getDay()

    const hasWorkHour = business.workHours.some(
      (workHour) => workHour.dayOfWeek === dayOfWeek,
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
      (item) => item.dayOfWeek === selectedDayOfWeek,
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
          existingBookings,
        )

        if (!isPast && !hasConflict) {
          slots.push(slotTime)
        }
      }

      availableSlots = slots
    }
  }

  const phoneDisplay = formatPhoneDisplay(business.phone)
  const businessLogo = getBusinessLogo({
    slug: business.slug,
    name: business.name,
  })

  const hasContactInfo = Boolean(
    business.address || phoneDisplay || business.email,
  )

  return (
    <main className={`min-h-screen ${theme.page}`}>
      <section className="mx-auto max-w-6xl px-5 py-8 sm:px-6 sm:py-12">
        <div
          className={`overflow-hidden rounded-[2rem] border shadow-2xl ${theme.cardStrong}`}
        >
          <div className="grid lg:grid-cols-[1.15fr_0.85fr]">
            <div className="flex flex-col justify-between gap-8 border-b border-current/10 px-6 py-8 sm:px-8 lg:border-b-0 lg:border-r lg:px-10 lg:py-10">
              <div>
                <p
                  className={`text-xs font-semibold uppercase tracking-[0.35em] ${theme.muted}`}
                >
                  Marcação online
                </p>

                <h1 className="mt-4 max-w-2xl text-4xl font-bold tracking-tight sm:text-6xl">
                  {business.name}
                </h1>

                {business.description ? (
                  <p
                    className={`mt-5 max-w-2xl text-lg leading-8 ${theme.muted}`}
                  >
                    {business.description}
                  </p>
                ) : (
                  <p
                    className={`mt-5 max-w-2xl text-lg leading-8 ${theme.muted}`}
                  >
                    Escolha o serviço, selecione uma data disponível e confirme
                    a sua marcação online em poucos passos.
                  </p>
                )}

                {hasContactInfo && (
                  <div
                    className={`mt-8 grid gap-3 text-sm sm:grid-cols-3 ${theme.muted}`}
                  >
                    {business.address && (
                      <div className={`rounded-2xl border p-4 ${theme.card}`}>
                        <p className="text-xs uppercase tracking-[0.25em] opacity-60">
                          Local
                        </p>

                        <p className="mt-2 font-medium">{business.address}</p>
                      </div>
                    )}

                    {phoneDisplay && (
                      <div className={`rounded-2xl border p-4 ${theme.card}`}>
                        <p className="text-xs uppercase tracking-[0.25em] opacity-60">
                          Telefone
                        </p>

                        <p className="mt-2 font-medium">{phoneDisplay}</p>
                      </div>
                    )}

                    {business.email && (
                      <div className={`rounded-2xl border p-4 ${theme.card}`}>
                        <p className="text-xs uppercase tracking-[0.25em] opacity-60">
                          E-mail
                        </p>

                        <p className="mt-2 truncate font-medium">
                          {business.email}
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className={`rounded-[2rem] border p-5 ${theme.card}`}>
                <p
                  className={`text-xs font-semibold uppercase tracking-[0.3em] ${theme.muted}`}
                >
                  Como funciona
                </p>

                <div className="mt-5 grid gap-4 md:grid-cols-3">
                  <div>
                    <p className="text-lg font-bold">1. Escolha</p>

                    <p className={`mt-2 text-sm leading-6 ${theme.muted}`}>
                      Selecione um ou mais serviços.
                    </p>
                  </div>

                  <div>
                    <p className="text-lg font-bold">2. Agende</p>

                    <p className={`mt-2 text-sm leading-6 ${theme.muted}`}>
                      Escolha uma data e horário disponível.
                    </p>
                  </div>

                  <div>
                    <p className="text-lg font-bold">3. Confirme</p>

                    <p className={`mt-2 text-sm leading-6 ${theme.muted}`}>
                      Preencha os dados e receba a confirmação.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center px-6 py-8 sm:px-8 lg:px-10 lg:py-10">
              <div className={`w-full rounded-[2rem] border p-4 ${theme.card}`}>
                <div
                  className={`rounded-[1.7rem] border p-5 ${theme.cardStrong}`}
                >
                  <p
                    className={`text-xs font-semibold uppercase tracking-[0.3em] ${theme.muted}`}
                  >
                    Identidade do espaço
                  </p>

                  {businessLogo ? (
                    <div className="mt-5 flex min-h-[320px] items-center justify-center rounded-[1.5rem] border border-current/10 bg-black p-8">
                      <Image
                        src={businessLogo}
                        alt={`Logo ${business.name}`}
                        width={420}
                        height={420}
                        priority
                        className="h-auto max-h-72 w-auto max-w-full object-contain"
                      />
                    </div>
                  ) : (
                    <div className="mt-5 grid gap-3">
                      <div className="h-36 rounded-[1.5rem] border border-current/10 bg-current/10" />

                      <div className="grid grid-cols-3 gap-3">
                        <div className="h-24 rounded-2xl border border-current/10 bg-current/10" />
                        <div className="h-24 rounded-2xl border border-current/10 bg-current/10" />
                        <div className="h-24 rounded-2xl border border-current/10 bg-current/10" />
                      </div>
                    </div>
                  )}

                  <p className={`mt-5 text-sm leading-6 ${theme.muted}`}>
                    {businessLogo
                      ? "Página oficial para marcações online do espaço."
                      : "Em breve esta área pode receber fotos reais do espaço, trabalhos realizados, antes/depois ou portfólio."}
                  </p>
                </div>

                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <div
                    className={`rounded-2xl border p-4 ${theme.cardStrong}`}
                  >
                    <p
                      className={`text-xs uppercase tracking-[0.25em] ${theme.muted}`}
                    >
                      Reserva
                    </p>

                    <p className="mt-2 text-lg font-bold">Simples</p>
                  </div>

                  <div
                    className={`rounded-2xl border p-4 ${theme.cardStrong}`}
                  >
                    <p
                      className={`text-xs uppercase tracking-[0.25em] ${theme.muted}`}
                    >
                      Confirmação
                    </p>

                    <p className="mt-2 text-lg font-bold">Por e-mail</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-current/10 px-6 py-8 sm:px-8 lg:px-10">
            <div id="servicos" className="scroll-mt-8">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p
                    className={`text-xs font-semibold uppercase tracking-[0.3em] ${theme.muted}`}
                  >
                    Passo 1
                  </p>

                  <h2 className="mt-3 text-2xl font-semibold tracking-tight">
                    Escolha os serviços
                  </h2>

                  <p className={`mt-2 ${theme.muted}`}>
                    Pode escolher um ou mais serviços para a mesma marcação.
                  </p>
                </div>

                {selectedServices.length > 0 && (
                  <Link
                    href={`/book/${business.slug}#servicos`}
                    className={`rounded-2xl border px-4 py-3 text-center text-sm font-semibold transition ${theme.secondaryButton}`}
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
                    service.id,
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
                          ? `${theme.primaryButton} shadow-xl`
                          : `${theme.card} hover:scale-[1.01]`
                      }`}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <div className="flex items-center gap-3">
                            <div className="flex h-7 w-7 items-center justify-center rounded-full border border-current text-sm font-bold">
                              {isSelected ? "✓" : ""}
                            </div>

                            <h3 className="text-lg font-semibold">
                              {service.name}
                            </h3>
                          </div>

                          {service.description && (
                            <p className="mt-3 text-sm opacity-75">
                              {service.description}
                            </p>
                          )}

                          <p className="mt-3 text-sm opacity-70">
                            Duração: {formatDuration(service.durationMin)}
                          </p>
                        </div>

                        <div className="text-right">
                          <p className="text-lg font-bold">
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
                className={`mt-10 scroll-mt-8 rounded-[2rem] border p-6 shadow-xl ${theme.card}`}
              >
                <p
                  className={`text-xs font-semibold uppercase tracking-[0.3em] ${theme.muted}`}
                >
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
                      className="flex justify-between gap-4 border-b border-current/10 pb-3 text-sm last:border-b-0 last:pb-0"
                    >
                      <span>{service.name}</span>

                      <span className="font-semibold">
                        {formatPrice(service.priceCents)}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="mt-6 grid gap-3 sm:grid-cols-2">
                  <div
                    className={`rounded-2xl border p-4 ${theme.cardStrong}`}
                  >
                    <p
                      className={`text-xs uppercase tracking-[0.25em] ${theme.muted}`}
                    >
                      Duração total
                    </p>

                    <p className="mt-2 text-xl font-semibold">
                      {formatDuration(totalDurationMin)}
                    </p>
                  </div>

                  <div
                    className={`rounded-2xl border p-4 ${theme.cardStrong}`}
                  >
                    <p
                      className={`text-xs uppercase tracking-[0.25em] ${theme.muted}`}
                    >
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
                <p
                  className={`text-xs font-semibold uppercase tracking-[0.3em] ${theme.muted}`}
                >
                  Passo 2
                </p>

                <h2 className="mt-3 text-2xl font-semibold tracking-tight">
                  Escolha uma data
                </h2>

                <p className={`mt-2 ${theme.muted}`}>
                  Apenas os dias com atendimento disponível ficam selecionáveis.
                </p>

                <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {availableDates.map((item) => {
                    const isSelected = item.dateParam === date

                    if (!item.available) {
                      return (
                        <div
                          key={item.dateParam}
                          className={`rounded-2xl border px-4 py-4 text-center text-sm opacity-40 ${theme.card}`}
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
                            ? `${theme.primaryButton} shadow-lg`
                            : `${theme.card} hover:scale-[1.01]`
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
                <p
                  className={`text-xs font-semibold uppercase tracking-[0.3em] ${theme.muted}`}
                >
                  Passo 3
                </p>

                <h2 className="mt-3 text-2xl font-semibold tracking-tight">
                  Escolha um horário
                </h2>

                <p className={`mt-2 ${theme.muted}`}>
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
                              ? `${theme.primaryButton} shadow-lg`
                              : `${theme.card} hover:scale-[1.01]`
                          }`}
                        >
                          {slot}
                        </Link>
                      )
                    })}
                  </div>
                ) : (
                  <div className={`mt-6 rounded-3xl border p-6 ${theme.card}`}>
                    <p className={theme.muted}>
                      Não existem horários disponíveis para esta data.
                    </p>
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
                theme={business.theme}
              />
            )}
          </div>
        </div>
      </section>
    </main>
  )
}