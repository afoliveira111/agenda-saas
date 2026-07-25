import Link from "next/link"
import { notFound } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { getCurrentBusinessSlug } from "@/lib/current-business"
import { durationOptions, formatDuration } from "@/lib/format-duration"
import {
  createServiceAction,
  deleteServiceAction,
  toggleServiceActiveAction,
  updateServiceAction,
} from "./actions"

type ServicesPageProps = {
  searchParams: Promise<{
    error?: string
    success?: string
  }>
}

function formatPrice(priceCents: number) {
  return new Intl.NumberFormat("pt-PT", {
    style: "currency",
    currency: "EUR",
  }).format(priceCents / 100)
}

function formatPriceInput(priceCents: number) {
  return (priceCents / 100).toFixed(2)
}

type DurationSelectProps = {
  name?: string
  defaultValue?: number
  className?: string
}

function DurationSelect({
  name = "durationMin",
  defaultValue = 60,
  className = "",
}: DurationSelectProps) {
  return (
    <select
      name={name}
      required
      defaultValue={defaultValue}
      className={`appearance-none rounded-2xl border border-zinc-800 bg-zinc-950 px-4 py-4 text-white outline-none transition focus:border-white ${className}`}
    >
      {durationOptions.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  )
}

type ServiceCardProps = {
  service: {
    id: string
    name: string
    description: string | null
    priceCents: number
    durationMin: number
    active: boolean
    _count: {
      bookingServices: number
    }
  }
}

function ServiceCard({ service }: ServiceCardProps) {
  const canDelete = service._count.bookingServices === 0

  return (
    <div
      className={`rounded-3xl border p-5 ${
        service.active
          ? "border-zinc-800 bg-black"
          : "border-zinc-900 bg-black/40 opacity-80"
      }`}
    >
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <span
              className={`rounded-full border px-3 py-1 text-xs font-semibold ${
                service.active
                  ? "border-white bg-white text-zinc-950"
                  : "border-zinc-800 bg-zinc-950 text-zinc-500"
              }`}
            >
              {service.active ? "Ativo" : "Desativado"}
            </span>

            <span className="text-sm text-zinc-500">
              {formatDuration(service.durationMin)} ·{" "}
              {formatPrice(service.priceCents)}
            </span>

            {service._count.bookingServices > 0 && (
              <span className="rounded-full border border-zinc-800 bg-zinc-950 px-3 py-1 text-xs font-semibold text-zinc-500">
                Usado em {service._count.bookingServices} marcação/marcações
              </span>
            )}
          </div>

          <h3 className="mt-3 text-xl font-bold text-white">{service.name}</h3>

          {service.description && (
            <p className="mt-2 text-sm text-zinc-500">{service.description}</p>
          )}
        </div>

        <div className="flex flex-col gap-2 sm:min-w-36">
          <form action={toggleServiceActiveAction}>
            <input type="hidden" name="serviceId" value={service.id} />
            <input type="hidden" name="active" value={String(!service.active)} />

            <button
              type="submit"
              className={`w-full rounded-2xl border px-4 py-3 text-sm font-semibold transition ${
                service.active
                  ? "border-zinc-800 bg-zinc-950 text-zinc-500 hover:border-zinc-600 hover:text-zinc-300"
                  : "border-white bg-white text-zinc-950 hover:bg-zinc-200"
              }`}
            >
              {service.active ? "Desativar" : "Ativar"}
            </button>
          </form>

          {canDelete ? (
            <form action={deleteServiceAction}>
              <input type="hidden" name="serviceId" value={service.id} />

              <button
                type="submit"
                className="w-full rounded-2xl border border-red-900/70 bg-red-950/30 px-4 py-3 text-sm font-semibold text-red-300 transition hover:border-red-500"
              >
                Apagar
              </button>
            </form>
          ) : (
            <div className="rounded-2xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-center text-xs font-medium text-zinc-600">
              Não pode apagar
            </div>
          )}
        </div>
      </div>

      <form action={updateServiceAction} className="grid gap-4">
        <input type="hidden" name="serviceId" value={service.id} />

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="text-sm font-medium text-zinc-400">Nome</label>

            <input
              type="text"
              name="name"
              required
              minLength={2}
              maxLength={80}
              defaultValue={service.name}
              className="mt-2 w-full rounded-2xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-white outline-none transition focus:border-white"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium text-zinc-400">
                Preço
              </label>

              <input
                type="number"
                name="price"
                required
                min="0"
                step="0.01"
                defaultValue={formatPriceInput(service.priceCents)}
                className="mt-2 w-full rounded-2xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-white outline-none transition focus:border-white"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-zinc-400">
                Duração
              </label>

              <DurationSelect
                defaultValue={service.durationMin}
                className="mt-2 w-full py-3"
              />
            </div>
          </div>
        </div>

        <div>
          <label className="text-sm font-medium text-zinc-400">Descrição</label>

          <textarea
            name="description"
            rows={3}
            maxLength={240}
            defaultValue={service.description ?? ""}
            className="mt-2 w-full resize-none rounded-2xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-white outline-none transition focus:border-white"
          />
        </div>

        <button
          type="submit"
          className="rounded-2xl border border-zinc-700 px-5 py-3 font-semibold text-zinc-200 transition hover:border-white hover:text-white"
        >
          Guardar alterações
        </button>
      </form>
    </div>
  )
}

export default async function DashboardServicesPage({
  searchParams,
}: ServicesPageProps) {
  const { error, success } = await searchParams

  const business = await prisma.business.findUnique({
    where: {
      slug: await getCurrentBusinessSlug(),
    },
    include: {
      services: {
        orderBy: [
          {
            active: "desc",
          },
          {
            createdAt: "asc",
          },
        ],
        include: {
          _count: {
            select: {
              bookingServices: true,
            },
          },
        },
      },
    },
  })

  if (!business) {
    notFound()
  }

  const activeServices = business.services.filter((service) => service.active)
  const inactiveServices = business.services.filter((service) => !service.active)
  const removableServices = business.services.filter(
    (service) => service._count.bookingServices === 0,
  )

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
                Serviços
              </h1>

              <p className="mt-4 max-w-2xl text-zinc-400">
                Adicione, edite, desative ou apague serviços que ainda não foram
                usados em marcações.
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
              <p className="text-sm text-zinc-500">Total de serviços</p>
              <p className="mt-2 text-3xl font-bold">
                {business.services.length}
              </p>
            </div>

            <div className="rounded-3xl border border-zinc-800 bg-black/40 p-5">
              <p className="text-sm text-zinc-500">Ativos</p>
              <p className="mt-2 text-3xl font-bold">{activeServices.length}</p>
            </div>

            <div className="rounded-3xl border border-zinc-800 bg-black/40 p-5">
              <p className="text-sm text-zinc-500">Desativados</p>
              <p className="mt-2 text-3xl font-bold">
                {inactiveServices.length}
              </p>
            </div>

            <div className="rounded-3xl border border-zinc-800 bg-black/40 p-5">
              <p className="text-sm text-zinc-500">Podem ser apagados</p>
              <p className="mt-2 text-3xl font-bold">
                {removableServices.length}
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

        <div className="mt-8 grid gap-8 lg:grid-cols-[420px_1fr]">
          <div className="rounded-[2rem] border border-zinc-800 bg-black p-6 shadow-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-zinc-600">
              Novo serviço
            </p>

            <h2 className="mt-3 text-2xl font-bold">Adicionar serviço</h2>

            <p className="mt-3 text-sm text-zinc-500">
              Este serviço ficará imediatamente disponível na página pública.
            </p>

            <form action={createServiceAction} className="mt-6 grid gap-4">
              <div>
                <label className="text-sm font-medium text-zinc-300">
                  Nome do serviço
                </label>

                <input
                  type="text"
                  name="name"
                  required
                  minLength={2}
                  maxLength={80}
                  placeholder="Ex: Manicure Verniz Gel"
                  className="mt-2 w-full rounded-2xl border border-zinc-800 bg-zinc-950 px-4 py-4 text-white outline-none transition placeholder:text-zinc-700 focus:border-white"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-zinc-300">
                  Descrição
                </label>

                <textarea
                  name="description"
                  rows={4}
                  maxLength={240}
                  placeholder="Pequena descrição do serviço"
                  className="mt-2 w-full resize-none rounded-2xl border border-zinc-800 bg-zinc-950 px-4 py-4 text-white outline-none transition placeholder:text-zinc-700 focus:border-white"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="text-sm font-medium text-zinc-300">
                    Preço
                  </label>

                  <input
                    type="number"
                    name="price"
                    required
                    min="0"
                    step="0.01"
                    placeholder="15.00"
                    className="mt-2 w-full rounded-2xl border border-zinc-800 bg-zinc-950 px-4 py-4 text-white outline-none transition placeholder:text-zinc-700 focus:border-white"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-zinc-300">
                    Duração
                  </label>

                  <DurationSelect defaultValue={60} className="mt-2 w-full" />
                </div>
              </div>

              <button
                type="submit"
                className="mt-2 rounded-2xl border border-white bg-white px-5 py-4 font-semibold text-zinc-950 transition hover:bg-zinc-200"
              >
                Criar serviço
              </button>
            </form>

            <div className="mt-6 rounded-3xl border border-zinc-800 bg-zinc-950 p-5">
              <p className="text-sm text-zinc-500">
                Serviços já usados em marcações não podem ser apagados, apenas
                desativados. Isso mantém o histórico correto.
              </p>
            </div>
          </div>

          <div className="grid gap-8">
            <div className="rounded-[2rem] border border-zinc-800 bg-zinc-950 p-4 shadow-2xl">
              <div className="border-b border-zinc-800 px-2 pb-4">
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-zinc-600">
                  Disponíveis ao cliente
                </p>

                <h2 className="mt-3 text-2xl font-bold">Serviços ativos</h2>
              </div>

              {activeServices.length === 0 ? (
                <div className="mt-4 rounded-3xl border border-zinc-800 bg-black p-10 text-center text-zinc-500">
                  Nenhum serviço ativo.
                </div>
              ) : (
                <div className="mt-4 grid gap-4">
                  {activeServices.map((service) => (
                    <ServiceCard key={service.id} service={service} />
                  ))}
                </div>
              )}
            </div>

            <div className="rounded-[2rem] border border-zinc-800 bg-zinc-950 p-4 shadow-2xl">
              <div className="border-b border-zinc-800 px-2 pb-4">
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-zinc-600">
                  Arquivo
                </p>

                <h2 className="mt-3 text-2xl font-bold">
                  Serviços desativados
                </h2>

                <p className="mt-2 text-sm text-zinc-500">
                  Estes serviços não aparecem na página pública, mas podem ser
                  reativados ou apagados se nunca foram usados.
                </p>
              </div>

              {inactiveServices.length === 0 ? (
                <div className="mt-4 rounded-3xl border border-zinc-800 bg-black p-10 text-center text-zinc-500">
                  Nenhum serviço desativado.
                </div>
              ) : (
                <div className="mt-4 grid gap-4">
                  {inactiveServices.map((service) => (
                    <ServiceCard key={service.id} service={service} />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}