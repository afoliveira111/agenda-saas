import Link from "next/link"
import { notFound } from "next/navigation"
import { normalizeBusinessTheme } from "@/lib/business-theme"
import { getCurrentBusinessSlug } from "@/lib/current-business"
import { getDashboardThemeClasses } from "@/lib/dashboard-theme"
import { durationOptions, formatDuration } from "@/lib/format-duration"
import { prisma } from "@/lib/prisma"
import {
  createServiceAction,
  createServiceCategoryAction,
  deleteServiceAction,
  deleteServiceCategoryAction,
  moveServiceAction,
  moveServiceCategoryAction,
  toggleServiceActiveAction,
  updateServiceAction,
  updateServiceCategoryAction,
} from "./actions"

type ServicesPageProps = {
  searchParams: Promise<{
    error?: string
    success?: string
  }>
}

type DashboardTheme = ReturnType<typeof getDashboardThemeClasses>

type ServiceCategoryOption = {
  id: string
  name: string
}

type ServiceCardService = {
  id: string
  name: string
  description: string | null
  priceCents: number
  durationMin: number
  active: boolean
  sortOrder: number
  categoryId: string | null
  category: {
    id: string
    name: string
  } | null
  _count: {
    bookingServices: number
  }
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

function getFeedbackClasses(type: "error" | "success") {
  if (type === "error") {
    return "border-red-300 bg-red-50 text-red-800"
  }

  return "border-emerald-300 bg-emerald-50 text-emerald-800"
}

function getInputClasses(theme: string) {
  if (theme === "WHITE") {
    return "mt-2 w-full rounded-[1.2rem] border border-zinc-300 bg-white px-4 py-4 text-zinc-950 outline-none transition placeholder:text-zinc-400 focus:border-zinc-950"
  }

  if (theme === "NUDE") {
    return "mt-2 w-full rounded-[1.2rem] border border-[#d8beb0] bg-white px-4 py-4 text-[#2b211c] outline-none transition placeholder:text-[#9d8576] focus:border-[#2b211c]"
  }

  return "mt-2 w-full rounded-[1.2rem] border border-zinc-800 bg-zinc-950 px-4 py-4 text-white outline-none transition placeholder:text-zinc-700 focus:border-white"
}

function getCompactInputClasses(theme: string) {
  if (theme === "WHITE") {
    return "mt-2 w-full rounded-[1.2rem] border border-zinc-300 bg-white px-4 py-3 text-zinc-950 outline-none transition placeholder:text-zinc-400 focus:border-zinc-950"
  }

  if (theme === "NUDE") {
    return "mt-2 w-full rounded-[1.2rem] border border-[#d8beb0] bg-white px-4 py-3 text-[#2b211c] outline-none transition placeholder:text-[#9d8576] focus:border-[#2b211c]"
  }

  return "mt-2 w-full rounded-[1.2rem] border border-zinc-800 bg-zinc-950 px-4 py-3 text-white outline-none transition placeholder:text-zinc-700 focus:border-white"
}

function getSelectClasses(theme: string) {
  if (theme === "WHITE") {
    return "appearance-none rounded-[1.2rem] border border-zinc-300 bg-white px-4 py-4 text-zinc-950 outline-none transition focus:border-zinc-950"
  }

  if (theme === "NUDE") {
    return "appearance-none rounded-[1.2rem] border border-[#d8beb0] bg-white px-4 py-4 text-[#2b211c] outline-none transition focus:border-[#2b211c]"
  }

  return "appearance-none rounded-[1.2rem] border border-zinc-800 bg-zinc-950 px-4 py-4 text-white outline-none transition focus:border-white"
}

function getCompactSelectClasses(theme: string) {
  if (theme === "WHITE") {
    return "appearance-none rounded-[1.2rem] border border-zinc-300 bg-white px-4 py-3 text-zinc-950 outline-none transition focus:border-zinc-950"
  }

  if (theme === "NUDE") {
    return "appearance-none rounded-[1.2rem] border border-[#d8beb0] bg-white px-4 py-3 text-[#2b211c] outline-none transition focus:border-[#2b211c]"
  }

  return "appearance-none rounded-[1.2rem] border border-zinc-800 bg-zinc-950 px-4 py-3 text-white outline-none transition focus:border-white"
}

function getServiceStatusClasses(active: boolean) {
  if (active) {
    return "border-emerald-300 bg-emerald-50 text-emerald-800"
  }

  return "border-zinc-300 bg-zinc-50 text-zinc-700"
}

type DurationSelectProps = {
  name?: string
  defaultValue?: number
  className: string
}

function DurationSelect({
  name = "durationMin",
  defaultValue = 60,
  className,
}: DurationSelectProps) {
  return (
    <select name={name} required defaultValue={defaultValue} className={className}>
      {durationOptions.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  )
}

type CategorySelectProps = {
  categories: ServiceCategoryOption[]
  defaultValue?: string | null
  className: string
}

function CategorySelect({
  categories,
  defaultValue = "",
  className,
}: CategorySelectProps) {
  return (
    <select name="categoryId" defaultValue={defaultValue ?? ""} className={className}>
      <option value="">Sem categoria</option>

      {categories.map((category) => (
        <option key={category.id} value={category.id}>
          {category.name}
        </option>
      ))}
    </select>
  )
}

type MoveServiceButtonsProps = {
  serviceId: string
  theme: DashboardTheme
}

function MoveServiceButtons({ serviceId, theme }: MoveServiceButtonsProps) {
  return (
    <div className="grid grid-cols-2 gap-2">
      <form action={moveServiceAction}>
        <input type="hidden" name="serviceId" value={serviceId} />
        <input type="hidden" name="direction" value="up" />

        <button
          type="submit"
          className={`w-full rounded-full border px-3 py-3 text-sm font-semibold transition ${theme.secondaryButton}`}
        >
          Subir
        </button>
      </form>

      <form action={moveServiceAction}>
        <input type="hidden" name="serviceId" value={serviceId} />
        <input type="hidden" name="direction" value="down" />

        <button
          type="submit"
          className={`w-full rounded-full border px-3 py-3 text-sm font-semibold transition ${theme.secondaryButton}`}
        >
          Descer
        </button>
      </form>
    </div>
  )
}

type MoveCategoryButtonsProps = {
  categoryId: string
  theme: DashboardTheme
}

function MoveCategoryButtons({ categoryId, theme }: MoveCategoryButtonsProps) {
  return (
    <div className="grid grid-cols-2 gap-2">
      <form action={moveServiceCategoryAction}>
        <input type="hidden" name="categoryId" value={categoryId} />
        <input type="hidden" name="direction" value="up" />

        <button
          type="submit"
          className={`w-full rounded-full border px-3 py-3 text-sm font-semibold transition ${theme.secondaryButton}`}
        >
          Subir
        </button>
      </form>

      <form action={moveServiceCategoryAction}>
        <input type="hidden" name="categoryId" value={categoryId} />
        <input type="hidden" name="direction" value="down" />

        <button
          type="submit"
          className={`w-full rounded-full border px-3 py-3 text-sm font-semibold transition ${theme.secondaryButton}`}
        >
          Descer
        </button>
      </form>
    </div>
  )
}

type ServiceCardProps = {
  service: ServiceCardService
  categories: ServiceCategoryOption[]
  theme: DashboardTheme
  compactInputClasses: string
  compactSelectClasses: string
}

function ServiceCard({
  service,
  categories,
  theme,
  compactInputClasses,
  compactSelectClasses,
}: ServiceCardProps) {
  const canDelete = service._count.bookingServices === 0

  return (
    <div
      className={`rounded-[1.8rem] border p-5 ${
        service.active ? theme.card : `${theme.card} opacity-80`
      }`}
    >
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <span
              className={`rounded-full border px-3 py-1 text-xs font-semibold ${getServiceStatusClasses(
                service.active,
              )}`}
            >
              {service.active ? "Ativo" : "Desativado"}
            </span>

            <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${theme.badge}`}>
              {service.category?.name || "Sem categoria"}
            </span>

            <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${theme.badge}`}>
              Ordem {service.sortOrder || "-"}
            </span>

            <span className={`text-sm ${theme.muted}`}>
              {formatDuration(service.durationMin)} ·{" "}
              {formatPrice(service.priceCents)}
            </span>

            {service._count.bookingServices > 0 && (
              <span
                className={`rounded-full border px-3 py-1 text-xs font-semibold ${theme.badge}`}
              >
                Usado em {service._count.bookingServices} marcação/marcações
              </span>
            )}
          </div>

          <h3 className={`mt-3 text-xl font-bold ${theme.title}`}>
            {service.name}
          </h3>

          {service.description && (
            <p className={`mt-2 text-sm ${theme.muted}`}>
              {service.description}
            </p>
          )}
        </div>

        <div className="flex flex-col gap-2 sm:min-w-40">
          <MoveServiceButtons serviceId={service.id} theme={theme} />

          <form action={toggleServiceActiveAction}>
            <input type="hidden" name="serviceId" value={service.id} />
            <input type="hidden" name="active" value={String(!service.active)} />

            <button
              type="submit"
              className={`w-full rounded-full border px-4 py-3 text-sm font-semibold transition ${
                service.active ? theme.secondaryButton : theme.primaryButton
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
                className="w-full rounded-[1.2rem] border border-red-300 bg-red-50 px-4 py-3 text-sm font-semibold text-red-800 transition hover:border-red-500"
              >
                Apagar
              </button>
            </form>
          ) : (
            <div
              className={`rounded-full border px-4 py-3 text-center text-xs font-medium ${theme.badge}`}
            >
              Não pode apagar
            </div>
          )}
        </div>
      </div>

      <form action={updateServiceAction} className="grid gap-4">
        <input type="hidden" name="serviceId" value={service.id} />

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className={`text-sm font-medium ${theme.title}`}>Nome</label>

            <input
              type="text"
              name="name"
              required
              minLength={2}
              maxLength={80}
              defaultValue={service.name}
              className={compactInputClasses}
            />
          </div>

          <div>
            <label className={`text-sm font-medium ${theme.title}`}>
              Categoria
            </label>

            <CategorySelect
              categories={categories}
              defaultValue={service.categoryId}
              className={`mt-2 w-full ${compactSelectClasses}`}
            />
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className={`text-sm font-medium ${theme.title}`}>
              Preço
            </label>

            <input
              type="number"
              name="price"
              required
              min="0"
              step="0.01"
              defaultValue={formatPriceInput(service.priceCents)}
              className={compactInputClasses}
            />
          </div>

          <div>
            <label className={`text-sm font-medium ${theme.title}`}>
              Duração
            </label>

            <DurationSelect
              defaultValue={service.durationMin}
              className={`mt-2 w-full ${compactSelectClasses}`}
            />
          </div>
        </div>

        <div>
          <label className={`text-sm font-medium ${theme.title}`}>
            Descrição
          </label>

          <textarea
            name="description"
            rows={3}
            maxLength={240}
            defaultValue={service.description ?? ""}
            className={`${compactInputClasses} resize-none`}
          />
        </div>

        <button
          type="submit"
          className={`rounded-full border px-5 py-3 font-semibold transition ${theme.secondaryButton}`}
        >
          Guardar alterações
        </button>
      </form>
    </div>
  )
}

type ServiceGroupProps = {
  title: string
  services: ServiceCardService[]
  categories: ServiceCategoryOption[]
  theme: DashboardTheme
  compactInputClasses: string
  compactSelectClasses: string
}

function ServiceGroup({
  title,
  services,
  categories,
  theme,
  compactInputClasses,
  compactSelectClasses,
}: ServiceGroupProps) {
  if (services.length === 0) {
    return null
  }

  return (
    <div className="grid gap-4">
      <div className={`rounded-[1.7rem] border px-5 py-4 ${theme.cardStrong}`}>
        <p className={`text-xs font-semibold uppercase tracking-[0.3em] ${theme.subtle}`}>
          Categoria
        </p>

        <h3 className={`mt-2 text-xl font-bold ${theme.title}`}>{title}</h3>

        <p className={`mt-1 text-sm ${theme.muted}`}>
          {services.length} serviço{services.length > 1 ? "s" : ""}
        </p>
      </div>

      {services.map((service) => (
        <ServiceCard
          key={service.id}
          service={service}
          categories={categories}
          theme={theme}
          compactInputClasses={compactInputClasses}
          compactSelectClasses={compactSelectClasses}
        />
      ))}
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
        include: {
          _count: {
            select: {
              services: true,
            },
          },
        },
      },
      services: {
        orderBy: [
          {
            active: "desc",
          },
          {
            sortOrder: "asc",
          },
          {
            createdAt: "asc",
          },
        ],
        include: {
          category: true,
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

  const currentTheme = normalizeBusinessTheme(business.theme)
  const theme = getDashboardThemeClasses(business.theme)
  const inputClasses = getInputClasses(currentTheme)
  const compactInputClasses = getCompactInputClasses(currentTheme)
  const selectClasses = getSelectClasses(currentTheme)
  const compactSelectClasses = getCompactSelectClasses(currentTheme)

  const categories = business.serviceCategories.map((category) => ({
    id: category.id,
    name: category.name,
  }))

  const activeServices = business.services.filter((service) => service.active)
  const inactiveServices = business.services.filter((service) => !service.active)
  const removableServices = business.services.filter(
    (service) => service._count.bookingServices === 0,
  )

  const uncategorizedActiveServices = activeServices.filter(
    (service) => !service.categoryId,
  )

  const uncategorizedInactiveServices = inactiveServices.filter(
    (service) => !service.categoryId,
  )

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
                Serviços
              </h1>

              <p className={`mt-4 max-w-2xl ${theme.muted}`}>
                Organize categorias e serviços na ordem em que devem aparecer
                na página pública.
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

          <div className="mt-8 grid gap-4 md:grid-cols-5">
            <div className={`rounded-[1.7rem] border p-5 ${theme.card}`}>
              <p className={`text-sm ${theme.muted}`}>Categorias</p>

              <p className={`mt-2 text-3xl font-bold ${theme.title}`}>
                {business.serviceCategories.length}
              </p>
            </div>

            <div className={`rounded-[1.7rem] border p-5 ${theme.card}`}>
              <p className={`text-sm ${theme.muted}`}>Total de serviços</p>

              <p className={`mt-2 text-3xl font-bold ${theme.title}`}>
                {business.services.length}
              </p>
            </div>

            <div className={`rounded-[1.7rem] border p-5 ${theme.card}`}>
              <p className={`text-sm ${theme.muted}`}>Ativos</p>

              <p className={`mt-2 text-3xl font-bold ${theme.title}`}>
                {activeServices.length}
              </p>
            </div>

            <div className={`rounded-[1.7rem] border p-5 ${theme.card}`}>
              <p className={`text-sm ${theme.muted}`}>Desativados</p>

              <p className={`mt-2 text-3xl font-bold ${theme.title}`}>
                {inactiveServices.length}
              </p>
            </div>

            <div className={`rounded-[1.7rem] border p-5 ${theme.card}`}>
              <p className={`text-sm ${theme.muted}`}>Podem ser apagados</p>

              <p className={`mt-2 text-3xl font-bold ${theme.title}`}>
                {removableServices.length}
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

        <div className="mt-8 grid gap-8 lg:grid-cols-[400px_1fr]">
          <div className="grid gap-8">
            <div className={`rounded-[2.2rem] border p-6 shadow-2xl ${theme.panel}`}>
              <p className={`text-xs font-semibold uppercase tracking-[0.3em] ${theme.subtle}`}>
                Nova categoria
              </p>

              <h2 className={`mt-3 text-2xl font-bold ${theme.title}`}>
                Criar categoria
              </h2>

              <p className={`mt-3 text-sm ${theme.muted}`}>
                Exemplo: Unhas, Pestanas, Cabelo, Maquiagem.
              </p>

              <form action={createServiceCategoryAction} className="mt-6 grid gap-4">
                <div>
                  <label className={`text-sm font-medium ${theme.title}`}>
                    Nome da categoria
                  </label>

                  <input
                    type="text"
                    name="name"
                    required
                    minLength={2}
                    maxLength={60}
                    placeholder="Ex: Unhas"
                    className={inputClasses}
                  />
                </div>

                <button
                  type="submit"
                  className={`rounded-full border px-5 py-4 font-semibold transition ${theme.primaryButton}`}
                >
                  Criar categoria
                </button>
              </form>

              {business.serviceCategories.length > 0 && (
                <div className="mt-6 grid gap-3">
                  {business.serviceCategories.map((category) => (
                    <div
                      key={category.id}
                      className={`rounded-3xl border p-4 ${theme.card}`}
                    >
                      <div className="mb-3 flex items-center justify-between gap-3">
                        <div>
                          <p className={`text-xs font-semibold uppercase tracking-[0.25em] ${theme.subtle}`}>
                            Ordem {category.sortOrder || "-"}
                          </p>

                          <p className={`mt-1 text-sm ${theme.muted}`}>
                            {category._count.services} serviço
                            {category._count.services === 1 ? "" : "s"}
                          </p>
                        </div>

                        <MoveCategoryButtons
                          categoryId={category.id}
                          theme={theme}
                        />
                      </div>

                      <form
                        action={updateServiceCategoryAction}
                        className="grid gap-3"
                      >
                        <input
                          type="hidden"
                          name="categoryId"
                          value={category.id}
                        />

                        <label className={`text-sm font-medium ${theme.title}`}>
                          Categoria
                        </label>

                        <input
                          type="text"
                          name="name"
                          required
                          minLength={2}
                          maxLength={60}
                          defaultValue={category.name}
                          className={compactInputClasses}
                        />

                        <button
                          type="submit"
                          className={`rounded-full border px-4 py-3 text-sm font-semibold transition ${theme.secondaryButton}`}
                        >
                          Guardar nome
                        </button>
                      </form>

                      <form action={deleteServiceCategoryAction} className="mt-2">
                        <input
                          type="hidden"
                          name="categoryId"
                          value={category.id}
                        />

                        <button
                          type="submit"
                          className="w-full rounded-[1.2rem] border border-red-300 bg-red-50 px-4 py-3 text-sm font-semibold text-red-800 transition hover:border-red-500"
                        >
                          Apagar categoria
                        </button>
                      </form>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className={`rounded-[2.2rem] border p-6 shadow-2xl ${theme.panel}`}>
              <p className={`text-xs font-semibold uppercase tracking-[0.3em] ${theme.subtle}`}>
                Novo serviço
              </p>

              <h2 className={`mt-3 text-2xl font-bold ${theme.title}`}>
                Adicionar serviço
              </h2>

              <p className={`mt-3 text-sm ${theme.muted}`}>
                Escolha a categoria onde o serviço ficará organizado.
              </p>

              <form action={createServiceAction} className="mt-6 grid gap-4">
                <div>
                  <label className={`text-sm font-medium ${theme.title}`}>
                    Categoria
                  </label>

                  <CategorySelect
                    categories={categories}
                    defaultValue=""
                    className={`mt-2 w-full ${selectClasses}`}
                  />
                </div>

                <div>
                  <label className={`text-sm font-medium ${theme.title}`}>
                    Nome do serviço
                  </label>

                  <input
                    type="text"
                    name="name"
                    required
                    minLength={2}
                    maxLength={80}
                    placeholder="Ex: Unhas em gel"
                    className={inputClasses}
                  />
                </div>

                <div>
                  <label className={`text-sm font-medium ${theme.title}`}>
                    Descrição
                  </label>

                  <textarea
                    name="description"
                    rows={4}
                    maxLength={240}
                    placeholder="Pequena descrição do serviço"
                    className={`${inputClasses} resize-none`}
                  />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className={`text-sm font-medium ${theme.title}`}>
                      Preço
                    </label>

                    <input
                      type="number"
                      name="price"
                      required
                      min="0"
                      step="0.01"
                      placeholder="15.00"
                      className={inputClasses}
                    />
                  </div>

                  <div>
                    <label className={`text-sm font-medium ${theme.title}`}>
                      Duração
                    </label>

                    <DurationSelect
                      defaultValue={60}
                      className={`mt-2 w-full ${selectClasses}`}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className={`mt-2 rounded-full border px-5 py-4 font-semibold transition ${theme.primaryButton}`}
                >
                  Criar serviço
                </button>
              </form>

              <div className={`mt-6 rounded-3xl border p-5 ${theme.card}`}>
                <p className={`text-sm ${theme.muted}`}>
                  Use Subir e Descer para organizar como os serviços aparecem
                  para o cliente na página pública.
                </p>
              </div>
            </div>
          </div>

          <div className="grid gap-8">
            <div className={`rounded-[2.2rem] border p-5 shadow-2xl ${theme.panel}`}>
              <div className={`border-b px-2 pb-4 ${theme.line}`}>
                <p className={`text-xs font-semibold uppercase tracking-[0.3em] ${theme.subtle}`}>
                  Disponíveis ao cliente
                </p>

                <h2 className={`mt-3 text-2xl font-bold ${theme.title}`}>
                  Serviços ativos
                </h2>

                <p className={`mt-2 text-sm ${theme.muted}`}>
                  A ordem abaixo será usada na página pública.
                </p>
              </div>

              {activeServices.length === 0 ? (
                <div
                  className={`mt-4 rounded-3xl border p-10 text-center ${theme.card}`}
                >
                  <p className={theme.muted}>Nenhum serviço ativo.</p>
                </div>
              ) : (
                <div className="mt-4 grid gap-8">
                  {business.serviceCategories.map((category) => (
                    <ServiceGroup
                      key={category.id}
                      title={category.name}
                      services={activeServices.filter(
                        (service) => service.categoryId === category.id,
                      )}
                      categories={categories}
                      theme={theme}
                      compactInputClasses={compactInputClasses}
                      compactSelectClasses={compactSelectClasses}
                    />
                  ))}

                  <ServiceGroup
                    title="Sem categoria"
                    services={uncategorizedActiveServices}
                    categories={categories}
                    theme={theme}
                    compactInputClasses={compactInputClasses}
                    compactSelectClasses={compactSelectClasses}
                  />
                </div>
              )}
            </div>

            <div className={`rounded-[2.2rem] border p-5 shadow-2xl ${theme.panel}`}>
              <div className={`border-b px-2 pb-4 ${theme.line}`}>
                <p className={`text-xs font-semibold uppercase tracking-[0.3em] ${theme.subtle}`}>
                  Arquivo
                </p>

                <h2 className={`mt-3 text-2xl font-bold ${theme.title}`}>
                  Serviços desativados
                </h2>

                <p className={`mt-2 text-sm ${theme.muted}`}>
                  Estes serviços não aparecem na página pública, mas podem ser
                  reativados ou apagados se nunca foram usados.
                </p>
              </div>

              {inactiveServices.length === 0 ? (
                <div
                  className={`mt-4 rounded-3xl border p-10 text-center ${theme.card}`}
                >
                  <p className={theme.muted}>Nenhum serviço desativado.</p>
                </div>
              ) : (
                <div className="mt-4 grid gap-8">
                  {business.serviceCategories.map((category) => (
                    <ServiceGroup
                      key={category.id}
                      title={category.name}
                      services={inactiveServices.filter(
                        (service) => service.categoryId === category.id,
                      )}
                      categories={categories}
                      theme={theme}
                      compactInputClasses={compactInputClasses}
                      compactSelectClasses={compactSelectClasses}
                    />
                  ))}

                  <ServiceGroup
                    title="Sem categoria"
                    services={uncategorizedInactiveServices}
                    categories={categories}
                    theme={theme}
                    compactInputClasses={compactInputClasses}
                    compactSelectClasses={compactSelectClasses}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}