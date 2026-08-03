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

type PublicService = {
  id: string
  name: string
  description: string | null
  priceCents: number
  durationMin: number
  categoryId: string | null
  sortOrder: number
}

type PublicServiceGroup = {
  id: string
  name: string
  services: PublicService[]
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

function buildPublicServiceGroups({
  categories,
  services,
}: {
  categories: Array<{ id: string; name: string }>
  services: PublicService[]
}) {
  const groups: PublicServiceGroup[] = categories
    .map((category) => ({
      id: category.id,
      name: category.name,
      services: services.filter((service) => service.categoryId === category.id),
    }))
    .filter((group) => group.services.length > 0)

  const uncategorizedServices = services.filter((service) => !service.categoryId)

  if (uncategorizedServices.length > 0) {
    groups.push({
      id: "uncategorized",
      name: categories.length > 0 ? "Outros serviços" : "Serviços",
      services: uncategorizedServices,
    })
  }

  return groups
}

function getCategoryIcon(index: number) {
  const icons = ["◠", "⌒", "◌", "◇", "✦", "•"]

  return icons[index % icons.length]
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
      serviceCategories: {
        orderBy: [
          {
            sortOrder: "asc",
          },
          {
            createdAt: "asc",
          },
          {
            name: "asc",
          },
        ],
      },
      services: {
        where: {
          active: true,
        },
        orderBy: [
          {
            sortOrder: "asc",
          },
          {
            createdAt: "asc",
          },
          {
            name: "asc",
          },
        ],
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

  const publicServiceGroups = buildPublicServiceGroups({
    categories: business.serviceCategories,
    services: business.services,
  })

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
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_15%,rgba(215,185,138,0.10),transparent_28%),radial-gradient(circle_at_80%_12%,rgba(215,185,138,0.12),transparent_24%)]" />

        <div className="relative mx-auto max-w-[88rem] px-2.5 py-3 sm:px-6 sm:py-8 lg:py-12">
          <div
            className={`overflow-hidden rounded-[2.5rem] border backdrop-blur ${theme.heroPanel}`}
          >
            <div className="grid gap-0 lg:grid-cols-[1.25fr_0.75fr]">
              <div className="px-4 py-6 sm:px-10 sm:py-10 lg:px-14 lg:py-14">
                <p
                  className={`inline-flex rounded-full border px-5 py-2 text-xs font-bold uppercase tracking-[0.35em] ${theme.badge}`}
                >
                  Marcação online
                </p>

                <h1 className="mt-5 max-w-3xl font-serif text-[2.55rem] leading-[0.96] tracking-[-0.055em] sm:mt-7 sm:text-6xl lg:text-7xl">
                  {business.name}
                </h1>

                <div className={`mt-6 h-px w-12 ${theme.accentBg}`} />

                {business.description ? (
                  <p
                    className={`mt-5 max-w-2xl text-[0.98rem] leading-7 sm:mt-6 sm:text-lg sm:leading-8 ${theme.muted}`}
                  >
                    {business.description}
                  </p>
                ) : (
                  <p
                    className={`mt-5 max-w-2xl text-[0.98rem] leading-7 sm:mt-6 sm:text-lg sm:leading-8 ${theme.muted}`}
                  >
                    Escolha o serviço, selecione uma data disponível e confirme
                    a sua marcação online em poucos passos.
                  </p>
                )}

                {hasContactInfo && (
                  <div className="mt-7 grid gap-3 sm:grid-cols-2 md:grid-cols-[1fr_1fr_1.45fr]">
                    {business.address && (
                      <div className={`rounded-[1.1rem] border p-3.5 sm:rounded-2xl sm:p-4 ${theme.card}`}>
                        <p className={`text-xs font-bold uppercase tracking-[0.28em] ${theme.softMuted}`}>
                          Local
                        </p>

                        <p className="mt-2 break-words text-[0.95rem] font-medium leading-6 sm:text-base">
                          {business.address}
                        </p>
                      </div>
                    )}

                    {phoneDisplay && (
                      <div className={`rounded-[1.1rem] border p-3.5 sm:rounded-2xl sm:p-4 ${theme.card}`}>
                        <p className={`text-xs font-bold uppercase tracking-[0.28em] ${theme.softMuted}`}>
                          Telefone
                        </p>

                        <p className="mt-2 break-words text-[0.95rem] font-medium leading-6 sm:text-base">
                          {phoneDisplay}
                        </p>
                      </div>
                    )}

                    {business.email && (
                      <div className={`rounded-[1.1rem] border p-3.5 sm:rounded-2xl sm:p-4 ${theme.card}`}>
                        <p className={`text-xs font-bold uppercase tracking-[0.28em] ${theme.softMuted}`}>
                          E-mail
                        </p>

                        <p className="mt-2 break-all text-[0.95rem] font-medium leading-6 sm:text-base">
                          {business.email}
                        </p>
                      </div>
                    )}
                  </div>
                )}

                <div className="mt-8 sm:mt-9">
                  <p
                    className={`text-xs font-bold uppercase tracking-[0.35em] ${theme.softMuted}`}
                  >
                    Como funciona
                  </p>

                  <div className="mt-4 grid gap-3 sm:grid-cols-3 sm:gap-5">
                    {[
                      ["1", "Escolha", "Selecione um ou mais serviços."],
                      ["2", "Agende", "Escolha uma data e horário disponível."],
                      ["3", "Confirme", "Preencha os dados e receba a confirmação."],
                    ].map(([number, title, description], index) => (
                      <div key={title} className="flex gap-3 sm:gap-4">
                        <div
                          className={`flex size-9 shrink-0 items-center justify-center rounded-full border text-base font-semibold sm:size-10 sm:text-lg ${theme.badge}`}
                        >
                          {number}
                        </div>

                        <div className="min-w-0">
                          <p className="font-serif text-lg font-semibold sm:text-xl">
                            {title}
                          </p>

                          <p className={`mt-1 text-sm leading-6 ${theme.muted}`}>
                            {description}
                          </p>
                        </div>

                        {index < 2 && (
                          <span
                            className={`hidden self-center text-xl sm:block ${theme.softMuted}`}
                          >
                            ›
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="border-t border-current/10 px-4 py-6 sm:px-10 sm:py-8 lg:border-l lg:border-t-0 lg:px-8 lg:py-12">
                <div className={`rounded-[1.5rem] border p-4 sm:rounded-[2.2rem] sm:p-5 ${theme.logoPanel}`}>
                  <p
                    className={`text-center text-xs font-bold uppercase tracking-[0.35em] ${theme.softMuted}`}
                  >
                    Identidade do espaço
                  </p>

                  {businessLogo ? (
                    <div className="mt-7 flex items-center justify-center">
                      <div className="mx-auto flex size-44 items-center justify-center overflow-hidden rounded-full border border-[#eadfce] bg-white p-0 shadow-2xl shadow-black/10 sm:size-64">
                        <Image
                          src={businessLogo}
                          alt={`Logo ${business.name}`}
                          width={420}
                          height={420}
                          priority
                          className="h-auto max-h-56 w-auto max-w-[135%] rotate-[2deg] scale-125 object-contain invert sm:max-h-80"
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="mt-7 flex items-center justify-center">
                      <div
                        className={`flex size-64 items-center justify-center rounded-full border text-6xl font-black ${theme.logoBox}`}
                      >
                        {business.name.slice(0, 1)}
                      </div>
                    </div>
                  )}

                  <p className={`mt-7 text-center text-sm leading-6 ${theme.muted}`}>
                    Página oficial para marcações online do espaço.
                  </p>

                  <div className="mt-7 grid gap-3 sm:grid-cols-2">
                    <div className={`rounded-[1.1rem] border p-3.5 sm:rounded-2xl sm:p-4 ${theme.card}`}>
                      <p
                        className={`text-xs font-bold uppercase tracking-[0.25em] ${theme.softMuted}`}
                      >
                        Reserva
                      </p>

                      <p className="mt-2 font-serif text-xl font-semibold">
                        Simples
                      </p>
                    </div>

                    <div className={`rounded-[1.1rem] border p-3.5 sm:rounded-2xl sm:p-4 ${theme.card}`}>
                      <p
                        className={`text-xs font-bold uppercase tracking-[0.25em] ${theme.softMuted}`}
                      >
                        Confirmação
                      </p>

                      <p className="mt-2 font-serif text-xl font-semibold">
                        Por e-mail
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="border-t border-current/10 px-4 py-6 sm:px-10 sm:py-10 lg:px-12">
              <div id="servicos" className="scroll-mt-8">
                <div className="text-center">
                  <p
                    className={`text-xs font-bold uppercase tracking-[0.35em] ${theme.softMuted}`}
                  >
                    Passo 1
                  </p>

                  <h2 className="mt-3 font-serif text-[2.15rem] leading-tight tracking-[-0.03em] sm:text-5xl">
                    Escolha os serviços
                  </h2>

                  <p className={`mt-3 ${theme.muted}`}>
                    Os serviços estão organizados por categoria.
                  </p>
                </div>

                {selectedServices.length > 0 && (
                  <div className="mt-6 flex justify-center">
                    <Link
                      href={`/book/${business.slug}#servicos`}
                      className={`rounded-full border px-5 py-3 text-center text-sm font-bold transition ${theme.secondaryButton}`}
                    >
                      Limpar seleção
                    </Link>
                  </div>
                )}

                {publicServiceGroups.length === 0 ? (
                  <div className={`mt-8 rounded-[2rem] border p-8 ${theme.card}`}>
                    <p className={theme.muted}>
                      Ainda não existem serviços disponíveis para marcação.
                    </p>
                  </div>
                ) : (
                  <div className="mt-8 grid gap-5 sm:mt-10 sm:gap-6 lg:grid-cols-[250px_1fr]">
                    <aside className={`hidden rounded-[2rem] border p-4 lg:block ${theme.card}`}>
                      <p
                        className={`px-2 py-2 text-xs font-bold uppercase tracking-[0.3em] ${theme.muted}`}
                      >
                        Categorias
                      </p>

                      <div className="mt-3 grid gap-2">
                        {publicServiceGroups.map((group, index) => (
                          <a
                            key={group.id}
                            href={`#categoria-${group.id}`}
                            className={`flex items-center justify-between gap-3 rounded-2xl border px-4 py-3 text-sm font-semibold transition hover:scale-[1.01] ${theme.secondaryButton}`}
                          >
                            <span className="flex min-w-0 items-center gap-3">
                              <span className={theme.softMuted}>
                                {getCategoryIcon(index)}
                              </span>

                              <span className="truncate">{group.name}</span>
                            </span>

                            <span
                              className={`flex size-7 shrink-0 items-center justify-center rounded-full border text-xs ${theme.badge}`}
                            >
                              {group.services.length}
                            </span>
                          </a>
                        ))}
                      </div>
                    </aside>

                    <div className="grid gap-6">
                      {publicServiceGroups.map((group, groupIndex) => (
                        <section
                          id={`categoria-${group.id}`}
                          key={group.id}
                          className={`scroll-mt-8 overflow-hidden rounded-[1.4rem] border sm:rounded-[2rem] ${theme.servicePanel}`}
                        >
                          <div className="flex flex-col gap-3 border-b border-current/10 px-4 py-3.5 sm:flex-row sm:items-center sm:justify-between sm:px-5 sm:py-5">
                            <div className="flex items-center gap-3">
                              <span className={`text-xl ${theme.softMuted}`}>
                                {getCategoryIcon(groupIndex)}
                              </span>

                              <p
                                className={`text-xs font-bold uppercase tracking-[0.26em] sm:text-sm sm:tracking-[0.35em] ${theme.softMuted}`}
                              >
                                {group.name}
                              </p>
                            </div>

                            <span
                              className={`w-fit rounded-full border px-3 py-1 text-xs font-semibold ${theme.badge}`}
                            >
                              {group.services.length} serviço
                              {group.services.length > 1 ? "s" : ""}
                            </span>
                          </div>

                          <div className="divide-y divide-current/10">
                            {group.services.map((service) => {
                              const isSelected = selectedServiceIds.includes(
                                service.id,
                              )

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
                                    hash: "servicos",
                                  })}
                                  className={`block px-4 py-4 transition sm:px-5 sm:py-5 ${
                                    isSelected
                                      ? theme.serviceSelected
                                      : "hover:bg-current/5"
                                  }`}
                                >
                                  <div className="grid gap-4 sm:grid-cols-[1fr_auto] sm:items-center">
                                    <div className="flex gap-3 sm:gap-4">
                                      <div
                                        className={`mt-1 flex size-7 shrink-0 items-center justify-center rounded-full border text-xs font-bold ${
                                          isSelected ? theme.badge : ""
                                        }`}
                                      >
                                        {isSelected ? "✓" : ""}
                                      </div>

                                      <div className="min-w-0">
                                        <h4 className="font-serif text-[1.65rem] font-semibold leading-tight sm:text-2xl">
                                          {service.name}
                                        </h4>

                                        {service.description && (
                                          <p className={`mt-2 text-[0.95rem] leading-6 ${theme.muted}`}>
                                            {service.description}
                                          </p>
                                        )}

                                        <p className={`mt-2 text-sm ${theme.muted}`}>
                                          {formatDuration(service.durationMin)}
                                        </p>
                                      </div>
                                    </div>

                                    <div className="flex items-center justify-between gap-4 sm:block sm:text-right">
                                      <p className="text-xl font-black sm:text-xl">
                                        {formatPrice(service.priceCents)}
                                      </p>

                                      <span
                                        className={`flex size-11 items-center justify-center rounded-[1rem] border text-2xl sm:ml-auto sm:mt-4 sm:size-11 sm:text-2xl ${theme.secondaryButton}`}
                                      >
                                        {isSelected ? "✓" : "+"}
                                      </span>
                                    </div>
                                  </div>
                                </Link>
                              )
                            })}
                          </div>
                        </section>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {selectedServices.length > 0 && (
                <div
                  id="resumo"
                  className={`mt-8 scroll-mt-8 rounded-[1.7rem] border p-5 shadow-xl sm:mt-10 sm:rounded-[2rem] sm:p-6 ${theme.card}`}
                >
                  <p
                    className={`text-xs font-bold uppercase tracking-[0.3em] ${theme.softMuted}`}
                  >
                    Resumo
                  </p>

                  <h2 className="mt-3 font-serif text-3xl font-semibold">
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

                  <div className="mt-5 grid gap-3 sm:mt-6 sm:grid-cols-2">
                    <div
                      className={`rounded-2xl border p-4 ${theme.cardStrong}`}
                    >
                      <p
                        className={`text-xs font-bold uppercase tracking-[0.25em] ${theme.softMuted}`}
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
                        className={`text-xs font-bold uppercase tracking-[0.25em] ${theme.softMuted}`}
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
                <div id="datas" className="mt-8 scroll-mt-8 sm:mt-10">
                  <p
                    className={`text-xs font-bold uppercase tracking-[0.3em] ${theme.softMuted}`}
                  >
                    Passo 2
                  </p>

                  <h2 className="mt-3 font-serif text-2xl font-semibold tracking-tight sm:text-3xl">
                    Escolha uma data
                  </h2>

                  <p className={`mt-2 ${theme.muted}`}>
                    Apenas os dias com atendimento disponível ficam selecionáveis.
                  </p>

                  <div className="mt-5 grid grid-cols-2 gap-2 sm:mt-6 sm:grid-cols-3 sm:gap-3">
                    {availableDates.map((item) => {
                      const isSelected = item.dateParam === date

                      if (!item.available) {
                        return (
                          <div
                            key={item.dateParam}
                            className={`rounded-[1rem] border px-2.5 py-3 text-center text-xs opacity-40 sm:rounded-2xl sm:px-4 sm:py-4 sm:text-sm ${theme.card}`}
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
                          className={`rounded-[1rem] border px-2.5 py-3 text-center text-xs font-semibold transition sm:rounded-2xl sm:px-4 sm:py-4 sm:text-sm ${
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
                <div id="horarios" className="mt-8 scroll-mt-8 sm:mt-10">
                  <p
                    className={`text-xs font-bold uppercase tracking-[0.3em] ${theme.softMuted}`}
                  >
                    Passo 3
                  </p>

                  <h2 className="mt-3 font-serif text-2xl font-semibold tracking-tight sm:text-3xl">
                    Escolha um horário
                  </h2>

                  <p className={`mt-2 ${theme.muted}`}>
                    Horários ocupados ou incompatíveis com a duração total não
                    aparecem.
                  </p>

                  {availableSlots.length > 0 ? (
                    <div className="mt-5 grid grid-cols-3 gap-2.5 sm:mt-6 sm:grid-cols-4 sm:gap-3">
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
                            className={`rounded-[1.1rem] border px-3 py-3 text-center text-sm font-semibold transition sm:rounded-2xl sm:px-4 sm:py-4 ${
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
        </div>
      </section>
    </main>
  )
}
