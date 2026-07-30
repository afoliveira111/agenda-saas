import Link from "next/link"
import { normalizeBusinessTheme } from "@/lib/business-theme"
import { getCurrentBusinessSlug } from "@/lib/current-business"
import { prisma } from "@/lib/prisma"
import {
  createBusinessAction,
  selectBusinessAction,
  updateBusinessAction,
} from "./actions"

type BusinessesPageProps = {
  searchParams: Promise<{
    error?: string
    success?: string
    name?: string
    slug?: string
    phone?: string
    email?: string
    notificationEmail?: string
    address?: string
    description?: string
    theme?: string
    createExampleService?: string
  }>
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("pt-PT", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date)
}

function formatBusinessTheme(theme: string | null | undefined) {
  const normalizedTheme = normalizeBusinessTheme(theme)

  const themeMap = {
    WHITE: "Branco",
    NUDE: "Nude",
    LUXURY: "Premium",
  }

  return themeMap[normalizedTheme]
}

function inputClasses() {
  return "mt-2 w-full rounded-2xl border border-zinc-800 bg-zinc-950 px-4 py-4 text-white outline-none transition placeholder:text-zinc-700 focus:border-white"
}

function compactInputClasses() {
  return "mt-2 w-full rounded-2xl border border-zinc-800 bg-black px-4 py-3 text-white outline-none transition placeholder:text-zinc-700 focus:border-white"
}

function selectClasses() {
  return "mt-2 w-full rounded-2xl border border-zinc-800 bg-zinc-950 px-4 py-4 text-white outline-none transition focus:border-white"
}

function compactSelectClasses() {
  return "mt-2 w-full rounded-2xl border border-zinc-800 bg-black px-4 py-3 text-white outline-none transition focus:border-white"
}

function getFeedbackClasses(type: "error" | "success") {
  if (type === "error") {
    return "border-red-900/70 bg-red-950/30 text-red-300"
  }

  return "border-emerald-900/70 bg-emerald-950/30 text-emerald-300"
}

function ThemeSelect({
  name = "theme",
  defaultValue = "LUXURY",
  compact = false,
}: {
  name?: string
  defaultValue?: string
  compact?: boolean
}) {
  return (
    <select
      name={name}
      required
      defaultValue={normalizeBusinessTheme(defaultValue)}
      className={compact ? compactSelectClasses() : selectClasses()}
    >
      <option value="LUXURY">Premium</option>
      <option value="WHITE">Branco</option>
      <option value="NUDE">Nude</option>
    </select>
  )
}

export default async function DashboardBusinessesPage({
  searchParams,
}: BusinessesPageProps) {
  const search = await searchParams
  const { error, success } = search

  const formValues = {
    name: search.name ?? "",
    slug: search.slug ?? "",
    phone: search.phone ?? "",
    email: search.email ?? "",
    notificationEmail: search.notificationEmail ?? "",
    address: search.address ?? "",
    description: search.description ?? "",
    theme: normalizeBusinessTheme(search.theme ?? "LUXURY"),
    createExampleService: search.createExampleService ?? "true",
  }

  const currentDashboardSlug = await getCurrentBusinessSlug()

  const businesses = await prisma.business.findMany({
    orderBy: {
      createdAt: "asc",
    },
    include: {
      users: {
        where: {
          role: "OWNER",
        },
        orderBy: {
          name: "asc",
        },
      },
      workHours: {
        where: {
          active: true,
        },
      },
      _count: {
        select: {
          services: true,
          bookings: true,
          customers: true,
          blockedDays: true,
        },
      },
    },
  })

  const currentBusiness = businesses.find(
    (business) => business.slug === currentDashboardSlug,
  )

  return (
    <main className="min-h-screen bg-zinc-950 text-white">
      <section className="mx-auto max-w-7xl px-6 py-10">
        <div className="rounded-[2rem] border border-zinc-800 bg-gradient-to-br from-zinc-900 via-zinc-950 to-black p-8 shadow-2xl">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-zinc-500">
                Admin
              </p>

              <h1 className="mt-3 text-4xl font-bold tracking-tight text-white md:text-5xl">
                Gerir negócios
              </h1>

              <p className="mt-4 max-w-2xl text-zinc-400">
                Crie, edite e selecione os negócios da plataforma. Cada negócio
                tem o próprio link público, tema, serviços, horários, clientes e
                marcações.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Link
                href="/admin"
                className="rounded-2xl border border-zinc-700 px-5 py-3 text-center font-semibold text-zinc-300 transition hover:border-white hover:text-white"
              >
                Voltar ao admin
              </Link>

              <Link
                href="/dashboard"
                className="rounded-2xl border border-white bg-white px-5 py-3 text-center font-semibold text-zinc-950 transition hover:bg-zinc-200"
              >
                Abrir painel
              </Link>
            </div>
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-4">
            <div className="rounded-3xl border border-zinc-800 bg-black/40 p-5">
              <p className="text-sm text-zinc-500">Total de negócios</p>

              <p className="mt-2 text-3xl font-bold">{businesses.length}</p>
            </div>

            <div className="rounded-3xl border border-zinc-800 bg-black/40 p-5">
              <p className="text-sm text-zinc-500">Painel atual</p>

              <p className="mt-2 truncate text-lg font-semibold">
                {currentBusiness?.name ?? currentDashboardSlug}
              </p>
            </div>

            <div className="rounded-3xl border border-zinc-800 bg-black/40 p-5">
              <p className="text-sm text-zinc-500">Link atual</p>

              <p className="mt-2 truncate text-lg font-semibold">
                /book/{currentBusiness?.slug ?? currentDashboardSlug}
              </p>
            </div>

            <div className="rounded-3xl border border-zinc-800 bg-black/40 p-5">
              <p className="text-sm text-zinc-500">Modo</p>

              <p className="mt-2 text-lg font-semibold">Multi-negócio ativo</p>
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

        <div className="mt-8 grid gap-8 lg:grid-cols-[420px_1fr]">
          <div className="rounded-[2rem] border border-zinc-800 bg-black p-6 shadow-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-zinc-600">
              Novo negócio
            </p>

            <h2 className="mt-3 text-2xl font-bold">Cadastrar negócio</h2>

            <p className="mt-3 text-sm text-zinc-500">
              Crie um novo cliente da plataforma. Depois, em Utilizadores, pode
              criar a dona e associar ao negócio.
            </p>

            <form
              action={createBusinessAction}
              noValidate
              className="mt-6 grid gap-4"
            >
              <div>
                <label className="text-sm font-medium text-zinc-300">
                  Nome do negócio
                </label>

                <input
                  type="text"
                  name="name"
                  required
                  minLength={2}
                  maxLength={80}
                  defaultValue={formValues.name}
                  placeholder="Ex: Clínica Teste"
                  className={inputClasses()}
                />
              </div>

              <div>
                <label className="text-sm font-medium text-zinc-300">
                  Slug público
                </label>

                <input
                  type="text"
                  name="slug"
                  maxLength={60}
                  defaultValue={formValues.slug}
                  placeholder="clinica-teste"
                  className={inputClasses()}
                />

                <p className="mt-2 text-xs text-zinc-600">
                  Se deixar vazio, o sistema gera automaticamente a partir do
                  nome.
                </p>
              </div>

              <div>
                <label className="text-sm font-medium text-zinc-300">
                  Tema da página pública
                </label>

                <ThemeSelect defaultValue={formValues.theme} />

                <p className="mt-2 text-xs text-zinc-600">
                  Pode alterar depois em qualquer momento.
                </p>
              </div>

              <div>
                <label className="text-sm font-medium text-zinc-300">
                  Telefone / WhatsApp
                </label>

                <input
                  type="tel"
                  name="phone"
                  minLength={7}
                  maxLength={20}
                  defaultValue={formValues.phone}
                  placeholder="+351 912 345 678"
                  className={inputClasses()}
                />
              </div>

              <div>
                <label className="text-sm font-medium text-zinc-300">
                  E-mail público
                </label>

                <input
                  type="text"
                  name="email"
                  inputMode="email"
                  maxLength={120}
                  defaultValue={formValues.email}
                  placeholder="contacto@clinica.pt"
                  className={inputClasses()}
                />
              </div>

              <div>
                <label className="text-sm font-medium text-zinc-300">
                  E-mail de notificação
                </label>

                <input
                  type="text"
                  name="notificationEmail"
                  inputMode="email"
                  maxLength={120}
                  defaultValue={formValues.notificationEmail}
                  placeholder="recepcao@clinica.pt"
                  className={inputClasses()}
                />

                <p className="mt-2 text-xs text-zinc-600">
                  Este e-mail recebe os avisos internos de novas marcações.
                </p>
              </div>

              <div>
                <label className="text-sm font-medium text-zinc-300">
                  Morada
                </label>

                <input
                  type="text"
                  name="address"
                  maxLength={160}
                  defaultValue={formValues.address}
                  placeholder="Rua, cidade, país"
                  className={inputClasses()}
                />
              </div>

              <div>
                <label className="text-sm font-medium text-zinc-300">
                  Descrição
                </label>

                <textarea
                  name="description"
                  rows={4}
                  maxLength={300}
                  defaultValue={formValues.description}
                  placeholder="Breve descrição do negócio."
                  className={`${inputClasses()} resize-none`}
                />
              </div>

              <label className="flex cursor-pointer items-start gap-3 rounded-3xl border border-zinc-800 bg-zinc-950 p-4">
                <input
                  type="checkbox"
                  name="createExampleService"
                  value="true"
                  defaultChecked={formValues.createExampleService === "true"}
                  className="mt-1 h-5 w-5 accent-white"
                />

                <span>
                  <span className="block text-sm font-semibold text-zinc-300">
                    Criar serviço exemplo
                  </span>

                  <span className="mt-1 block text-xs text-zinc-600">
                    Cria “Consulta inicial” para testar a página pública
                    imediatamente.
                  </span>
                </span>
              </label>

              <button
                type="submit"
                className="mt-2 rounded-2xl border border-white bg-white px-5 py-4 font-semibold text-zinc-950 transition hover:bg-zinc-200"
              >
                Criar negócio
              </button>
            </form>
          </div>

          <div className="rounded-[2rem] border border-zinc-800 bg-zinc-950 p-4 shadow-2xl">
            <div className="border-b border-zinc-800 px-2 pb-4">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-zinc-600">
                Cadastrados
              </p>

              <h2 className="mt-3 text-2xl font-bold">
                Negócios da plataforma
              </h2>

              <p className="mt-2 text-sm text-zinc-500">
                Edite os dados principais e escolha qual negócio fica ativo no
                painel.
              </p>
            </div>

            {businesses.length === 0 ? (
              <div className="mt-4 rounded-3xl border border-zinc-800 bg-black p-10 text-center text-zinc-500">
                Nenhum negócio cadastrado.
              </div>
            ) : (
              <div className="mt-4 grid gap-5">
                {businesses.map((business) => {
                  const isCurrentDashboardBusiness =
                    business.slug === currentDashboardSlug

                  return (
                    <div
                      key={business.id}
                      className="rounded-3xl border border-zinc-800 bg-black p-5"
                    >
                      <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
                        <div>
                          <div className="flex flex-wrap items-center gap-3">
                            {isCurrentDashboardBusiness && (
                              <span className="rounded-full border border-white bg-white px-3 py-1 text-xs font-semibold text-zinc-950">
                                Painel atual
                              </span>
                            )}

                            <span className="rounded-full border border-zinc-800 bg-zinc-950 px-3 py-1 text-xs font-semibold text-zinc-500">
                              /book/{business.slug}
                            </span>

                            <span className="rounded-full border border-zinc-800 bg-zinc-950 px-3 py-1 text-xs font-semibold text-zinc-500">
                              Tema: {formatBusinessTheme(business.theme)}
                            </span>
                          </div>

                          <h3 className="mt-4 text-2xl font-bold text-white">
                            {business.name}
                          </h3>

                          <div className="mt-3 grid gap-2 text-sm text-zinc-500">
                            <p>
                              Criado em:{" "}
                              <span className="text-zinc-300">
                                {formatDate(business.createdAt)}
                              </span>
                            </p>

                            <p>
                              Donas associadas:{" "}
                              <span className="text-zinc-300">
                                {business.users.length > 0
                                  ? business.users
                                      .map((user) => user.name)
                                      .join(", ")
                                  : "Nenhuma"}
                              </span>
                            </p>

                            <p>
                              E-mail público:{" "}
                              <span className="text-zinc-300">
                                {business.email || "Não definido"}
                              </span>
                            </p>

                            <p>
                              E-mail de notificação:{" "}
                              <span className="text-zinc-300">
                                {business.notificationEmail || "Não definido"}
                              </span>
                            </p>

                            <p>
                              Telefone:{" "}
                              <span className="text-zinc-300">
                                {business.phone || "Não definido"}
                              </span>
                            </p>

                            {business.address && (
                              <p>
                                Morada:{" "}
                                <span className="text-zinc-300">
                                  {business.address}
                                </span>
                              </p>
                            )}
                          </div>

                          <div className="mt-5 grid gap-3 sm:grid-cols-5">
                            <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4">
                              <p className="text-xs text-zinc-600">Serviços</p>

                              <p className="mt-1 text-xl font-bold">
                                {business._count.services}
                              </p>
                            </div>

                            <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4">
                              <p className="text-xs text-zinc-600">
                                Marcações
                              </p>

                              <p className="mt-1 text-xl font-bold">
                                {business._count.bookings}
                              </p>
                            </div>

                            <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4">
                              <p className="text-xs text-zinc-600">Clientes</p>

                              <p className="mt-1 text-xl font-bold">
                                {business._count.customers}
                              </p>
                            </div>

                            <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4">
                              <p className="text-xs text-zinc-600">
                                Dias ativos
                              </p>

                              <p className="mt-1 text-xl font-bold">
                                {business.workHours.length}
                              </p>
                            </div>

                            <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4">
                              <p className="text-xs text-zinc-600">Donas</p>

                              <p className="mt-1 text-xl font-bold">
                                {business.users.length}
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-col gap-3 xl:min-w-60">
                          <Link
                            href={`/book/${business.slug}`}
                            className="rounded-2xl border border-white bg-white px-5 py-3 text-center text-sm font-semibold text-zinc-950 transition hover:bg-zinc-200"
                          >
                            Abrir página pública
                          </Link>

                          {isCurrentDashboardBusiness ? (
                            <Link
                              href="/dashboard"
                              className="rounded-2xl border border-zinc-700 px-5 py-3 text-center text-sm font-semibold text-zinc-300 transition hover:border-white hover:text-white"
                            >
                              Gerir no painel
                            </Link>
                          ) : (
                            <form action={selectBusinessAction}>
                              <input
                                type="hidden"
                                name="slug"
                                value={business.slug}
                              />

                              <button
                                type="submit"
                                className="w-full rounded-2xl border border-zinc-700 px-5 py-3 text-center text-sm font-semibold text-zinc-300 transition hover:border-white hover:text-white"
                              >
                                Usar no painel
                              </button>
                            </form>
                          )}

                          <Link
                            href="/admin/users"
                            className="rounded-2xl border border-zinc-700 px-5 py-3 text-center text-sm font-semibold text-zinc-300 transition hover:border-white hover:text-white"
                          >
                            Gerir dona
                          </Link>
                        </div>
                      </div>

                      <form
                        action={updateBusinessAction}
                        noValidate
                        className="mt-6 rounded-3xl border border-zinc-800 bg-zinc-950 p-5"
                      >
                        <input
                          type="hidden"
                          name="businessId"
                          value={business.id}
                        />

                        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-zinc-600">
                          Editar negócio
                        </p>

                        <div className="mt-4 grid gap-4 lg:grid-cols-2">
                          <div>
                            <label className="text-sm font-medium text-zinc-300">
                              Nome
                            </label>

                            <input
                              type="text"
                              name="name"
                              required
                              minLength={2}
                              maxLength={80}
                              defaultValue={business.name}
                              className={compactInputClasses()}
                            />
                          </div>

                          <div>
                            <label className="text-sm font-medium text-zinc-300">
                              Slug público
                            </label>

                            <input
                              type="text"
                              name="slug"
                              required
                              maxLength={60}
                              defaultValue={business.slug}
                              className={compactInputClasses()}
                            />
                          </div>

                          <div>
                            <label className="text-sm font-medium text-zinc-300">
                              Tema
                            </label>

                            <ThemeSelect
                              defaultValue={business.theme}
                              compact
                            />
                          </div>

                          <div>
                            <label className="text-sm font-medium text-zinc-300">
                              Telefone / WhatsApp
                            </label>

                            <input
                              type="tel"
                              name="phone"
                              minLength={7}
                              maxLength={20}
                              defaultValue={business.phone ?? ""}
                              className={compactInputClasses()}
                            />
                          </div>

                          <div>
                            <label className="text-sm font-medium text-zinc-300">
                              E-mail público
                            </label>

                            <input
                              type="text"
                              name="email"
                              inputMode="email"
                              maxLength={120}
                              defaultValue={business.email ?? ""}
                              className={compactInputClasses()}
                            />
                          </div>

                          <div>
                            <label className="text-sm font-medium text-zinc-300">
                              E-mail de notificação
                            </label>

                            <input
                              type="text"
                              name="notificationEmail"
                              inputMode="email"
                              maxLength={120}
                              defaultValue={business.notificationEmail ?? ""}
                              className={compactInputClasses()}
                            />
                          </div>

                          <div className="lg:col-span-2">
                            <label className="text-sm font-medium text-zinc-300">
                              Morada
                            </label>

                            <input
                              type="text"
                              name="address"
                              maxLength={160}
                              defaultValue={business.address ?? ""}
                              className={compactInputClasses()}
                            />
                          </div>

                          <div className="lg:col-span-2">
                            <label className="text-sm font-medium text-zinc-300">
                              Descrição
                            </label>

                            <textarea
                              name="description"
                              rows={3}
                              maxLength={300}
                              defaultValue={business.description ?? ""}
                              className={`${compactInputClasses()} resize-none`}
                            />
                          </div>
                        </div>

                        <button
                          type="submit"
                          className="mt-5 rounded-2xl border border-zinc-700 px-5 py-3 font-semibold text-zinc-300 transition hover:border-white hover:text-white"
                        >
                          Guardar alterações do negócio
                        </button>
                      </form>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </section>
    </main>
  )
}