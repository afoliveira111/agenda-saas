import Link from "next/link"
import { notFound } from "next/navigation"
import { prisma } from "@/lib/prisma"

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

function formatDateTime(date: Date) {
  return new Intl.DateTimeFormat("pt-PT", {
    dateStyle: "full",
    timeStyle: "short",
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

  return (
    <main className="min-h-screen bg-black text-white">
      <section className="mx-auto max-w-3xl px-5 py-10 sm:px-6 sm:py-16">
        <div className="overflow-hidden rounded-[2rem] border border-zinc-800 bg-gradient-to-br from-zinc-900 via-zinc-950 to-black shadow-2xl">
          <div className="border-b border-zinc-800 px-6 py-8 sm:px-8">
            <div className="flex h-16 w-16 items-center justify-center rounded-full border border-white bg-white text-3xl font-bold text-zinc-950 shadow-lg shadow-white/10">
              ✓
            </div>

            <p className="mt-8 text-xs font-semibold uppercase tracking-[0.35em] text-zinc-500">
              Marcação confirmada
            </p>

            <h1 className="mt-4 text-4xl font-bold tracking-tight text-white sm:text-5xl">
              Obrigado, {booking.customer.name}
            </h1>

            <p className="mt-4 max-w-2xl text-zinc-400">
              A sua marcação foi registada com sucesso em{" "}
              <span className="font-medium text-white">
                {booking.business.name}
              </span>
              .
            </p>
          </div>

          <div className="px-6 py-8 sm:px-8">
            <div className="rounded-[2rem] border border-zinc-800 bg-black p-6">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-zinc-600">
                Detalhes da reserva
              </p>

              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4">
                  <p className="text-xs uppercase tracking-[0.25em] text-zinc-600">
                    Data
                  </p>

                  <p className="mt-2 font-semibold text-white">
                    {formatDateTime(booking.startAt)}
                  </p>
                </div>

                <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4">
                  <p className="text-xs uppercase tracking-[0.25em] text-zinc-600">
                    Horário
                  </p>

                  <p className="mt-2 font-semibold text-white">
                    {formatTime(booking.startAt)} - {formatTime(booking.endAt)}
                  </p>
                </div>
              </div>

              <div className="mt-6">
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-zinc-600">
                  Serviços
                </p>

                <div className="mt-4 space-y-3">
                  {booking.services.map((item) => (
                    <div
                      key={item.id}
                      className="flex justify-between gap-4 border-b border-zinc-800 pb-3 text-sm last:border-b-0 last:pb-0"
                    >
                      <div>
                        <p className="font-medium text-white">
                          {item.service.name}
                        </p>

                        <p className="mt-1 text-zinc-600">
                          {item.durationMin} minutos
                        </p>
                      </div>

                      <p className="font-semibold text-white">
                        {formatPrice(item.priceCents)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-6 grid gap-4 border-t border-zinc-800 pt-6 sm:grid-cols-2">
                <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4">
                  <p className="text-xs uppercase tracking-[0.25em] text-zinc-600">
                    Duração total
                  </p>

                  <p className="mt-2 text-xl font-semibold text-white">
                    {booking.totalDurationMin} minutos
                  </p>
                </div>

                <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4">
                  <p className="text-xs uppercase tracking-[0.25em] text-zinc-600">
                    Total estimado
                  </p>

                  <p className="mt-2 text-xl font-semibold text-white">
                    {formatPrice(booking.totalPriceCents)}
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-6 rounded-[2rem] border border-zinc-800 bg-zinc-950 p-6">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-zinc-600">
                Cliente
              </p>

              <div className="mt-4 space-y-2 text-sm text-zinc-400">
                <p>
                  <span className="text-zinc-600">Nome:</span>{" "}
                  <span className="text-white">{booking.customer.name}</span>
                </p>

                <p>
                  <span className="text-zinc-600">Telefone:</span>{" "}
                  <span className="text-white">{booking.customer.phone}</span>
                </p>

                {booking.customer.email && (
                  <p>
                    <span className="text-zinc-600">E-mail:</span>{" "}
                    <span className="text-white">{booking.customer.email}</span>
                  </p>
                )}
              </div>
            </div>

            <div className="mt-6 rounded-[2rem] border border-zinc-800 bg-black p-6">
              <p className="text-sm text-zinc-400">
                Guarde esta informação. Caso precise alterar ou cancelar a
                marcação, entre em contacto diretamente com o estabelecimento.
              </p>
            </div>

            <Link
              href={`/book/${slug}`}
              className="mt-8 block rounded-2xl border border-white bg-white px-5 py-4 text-center font-semibold text-zinc-950 transition hover:bg-zinc-200"
            >
              Fazer nova marcação
            </Link>
          </div>
        </div>
      </section>
    </main>
  )
}