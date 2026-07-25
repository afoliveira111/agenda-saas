import Link from "next/link"
import { notFound } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { getPublicThemeClasses } from "@/lib/business-theme"
import { formatDuration } from "@/lib/format-duration"

type SuccessPageProps = {
  params: Promise<{
    slug: string
  }>
  searchParams: Promise<{
    bookingId?: string
  }>
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

function formatTime(date: Date) {
  return new Intl.DateTimeFormat("pt-PT", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(date)
}

export default async function BookingSuccessPage({
  params,
  searchParams,
}: SuccessPageProps) {
  const { slug } = await params
  const { bookingId } = await searchParams

  if (!bookingId) {
    notFound()
  }

  const booking = await prisma.booking.findUnique({
    where: {
      id: bookingId,
    },
    include: {
      business: true,
      customer: true,
      services: {
        include: {
          service: true,
        },
      },
    },
  })

  if (!booking || booking.business.slug !== slug) {
    notFound()
  }

  const theme = getPublicThemeClasses(booking.business.theme)

  return (
    <main className={`min-h-screen ${theme.page}`}>
      <section className="mx-auto max-w-4xl px-5 py-10 sm:px-6 sm:py-16">
        <div className={`overflow-hidden rounded-[2rem] border shadow-2xl ${theme.cardStrong}`}>
          <div className="border-b border-current/10 px-6 py-8 sm:px-8">
            <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <div className={`flex h-16 w-16 items-center justify-center rounded-full border text-3xl font-black ${theme.primaryButton}`}>
                  ✓
                </div>

                <p className={`mt-8 text-xs font-semibold uppercase tracking-[0.35em] ${theme.muted}`}>
                  Marcação recebida
                </p>

                <h1 className="mt-4 text-4xl font-bold tracking-tight sm:text-5xl">
                  Marcação recebida com sucesso
                </h1>

                <p className={`mt-5 max-w-2xl text-lg leading-8 ${theme.muted}`}>
                  Olá,{" "}
                  <span className="font-semibold">
                    {booking.customer.name}
                  </span>
                  . A equipa{" "}
                  <span className="font-semibold">
                    {booking.business.name}
                  </span>{" "}
                  agradece a sua preferência.
                </p>

                <p className={`mt-4 max-w-2xl ${theme.muted}`}>
                  Recebemos o seu pedido de marcação e enviámos os detalhes para
                  o seu e-mail. Caso seja necessário confirmar alguma informação,
                  entraremos em contacto.
                </p>
              </div>

              <div className={`rounded-2xl border p-4 text-sm ${theme.card}`}>
                <p className="font-semibold">Estado da marcação</p>
                <p className={`mt-1 ${theme.muted}`}>
                  Confirmada no sistema
                </p>
              </div>
            </div>
          </div>

          <div className="px-6 py-8 sm:px-8">
            <div className={`rounded-[2rem] border p-6 ${theme.card}`}>
              <p className={`text-xs font-semibold uppercase tracking-[0.3em] ${theme.muted}`}>
                Resumo da marcação
              </p>

              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <div className={`rounded-2xl border p-4 ${theme.cardStrong}`}>
                  <p className={`text-xs uppercase tracking-[0.25em] ${theme.muted}`}>
                    Data
                  </p>

                  <p className="mt-2 font-semibold">
                    {formatDate(booking.startAt)}
                  </p>
                </div>

                <div className={`rounded-2xl border p-4 ${theme.cardStrong}`}>
                  <p className={`text-xs uppercase tracking-[0.25em] ${theme.muted}`}>
                    Horário
                  </p>

                  <p className="mt-2 font-semibold">
                    {formatTime(booking.startAt)} - {formatTime(booking.endAt)}
                  </p>
                </div>

                <div className={`rounded-2xl border p-4 ${theme.cardStrong}`}>
                  <p className={`text-xs uppercase tracking-[0.25em] ${theme.muted}`}>
                    Duração total
                  </p>

                  <p className="mt-2 font-semibold">
                    {formatDuration(booking.totalDurationMin)}
                  </p>
                </div>

                <div className={`rounded-2xl border p-4 ${theme.cardStrong}`}>
                  <p className={`text-xs uppercase tracking-[0.25em] ${theme.muted}`}>
                    Total estimado
                  </p>

                  <p className="mt-2 font-semibold">
                    {formatPrice(booking.totalPriceCents)}
                  </p>
                </div>
              </div>

              <div className="mt-6 border-t border-current/10 pt-6">
                <p className={`text-xs font-semibold uppercase tracking-[0.3em] ${theme.muted}`}>
                  Serviços escolhidos
                </p>

                <div className="mt-4 space-y-3">
                  {booking.services.map((item) => (
                    <div
                      key={item.id}
                      className="flex justify-between gap-4 border-b border-current/10 pb-3 text-sm last:border-b-0 last:pb-0"
                    >
                      <div>
                        <p className="font-semibold">
                          {item.service.name}
                        </p>

                        <p className={`mt-1 ${theme.muted}`}>
                          {formatDuration(item.durationMin)}
                        </p>
                      </div>

                      <p className="font-semibold">
                        {formatPrice(item.priceCents)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-6 grid gap-6 lg:grid-cols-2">
              <div className={`rounded-[2rem] border p-6 ${theme.card}`}>
                <p className={`text-xs font-semibold uppercase tracking-[0.3em] ${theme.muted}`}>
                  Cliente
                </p>

                <div className="mt-4 space-y-3 text-sm">
                  <p>
                    <span className={theme.muted}>Nome:</span>{" "}
                    <span className="font-semibold">
                      {booking.customer.name}
                    </span>
                  </p>

                  <p>
                    <span className={theme.muted}>Telefone:</span>{" "}
                    <span className="font-semibold">
                      {booking.customer.phone}
                    </span>
                  </p>

                  {booking.customer.email && (
                    <p>
                      <span className={theme.muted}>E-mail:</span>{" "}
                      <span className="font-semibold">
                        {booking.customer.email}
                      </span>
                    </p>
                  )}
                </div>
              </div>

              <div className={`rounded-[2rem] border p-6 ${theme.card}`}>
                <p className={`text-xs font-semibold uppercase tracking-[0.3em] ${theme.muted}`}>
                  Local
                </p>

                <div className="mt-4 space-y-3 text-sm">
                  <p className="font-semibold">{booking.business.name}</p>

                  {booking.business.address && (
                    <p className={theme.muted}>{booking.business.address}</p>
                  )}

                  {booking.business.phone && (
                    <p>
                      <span className={theme.muted}>Telefone:</span>{" "}
                      <span className="font-semibold">
                        +{booking.business.phone}
                      </span>
                    </p>
                  )}

                  {booking.business.email && (
                    <p>
                      <span className={theme.muted}>E-mail:</span>{" "}
                      <span className="font-semibold">
                        {booking.business.email}
                      </span>
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className={`mt-6 rounded-[2rem] border p-6 ${theme.card}`}>
              <p className={`text-sm leading-7 ${theme.muted}`}>
                Guarde esta informação. Caso precise alterar ou cancelar a
                marcação, entre em contacto diretamente com o estabelecimento.
                A equipa {booking.business.name} agradece a sua marcação.
              </p>
            </div>

            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              <Link
                href={`/book/${slug}`}
                className={`rounded-2xl px-5 py-4 text-center font-semibold transition ${theme.primaryButton}`}
              >
                Fazer nova marcação
              </Link>

             
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}