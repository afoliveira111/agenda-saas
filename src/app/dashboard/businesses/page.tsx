import { cookies } from "next/headers"
import Link from "next/link"
import {
  getAdminThemeClasses,
  normalizeAdminTheme,
} from "@/lib/admin-theme"
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

function inputClasses(theme: ReturnType<typeof getAdminThemeClasses>) {
  return `mt-2 w-full rounded-[1.2rem] border px-4 py-4 outline-none transition ${theme.input}`
}

function compactInputClasses(theme: ReturnType<typeof getAdminThemeClasses>) {
  return `mt-2 w-full rounded-[1.2rem] border px-4 py-3 outline-none transition ${theme.input}`
}

function selectClasses(theme: ReturnType<typeof getAdminThemeClasses>) {
  return `mt-2 w-full rounded-[1.2rem] border px-4 py-4 outline-none transition ${theme.input}`
}

function compactSelectClasses(theme: ReturnType<typeof getAdminThemeClasses>) {
  return `mt-2 w-full rounded-[1.2rem] border px-4 py-3 outline-none transition ${theme.input}`
}

function getFeedbackClasses(type: "error" | "success") {
  if (type === "error") {
    return "border-red-900/70 bg-red-950/30 text-red-300"
  }

  return "border-emerald-900/70 bg-emerald-950/30 text-emerald-300"
}

function ThemeSelect({
  theme,
  name = "theme",
  defaultValue = "LUXURY",
  compact = false,
}: {
  theme: ReturnType<typeof getAdminThemeClasses>
  name?: string
  defaultValue?: string
  compact?: boolean
}) {
  return (
    <select
      name={name}
      required
      defaultValue={normalizeBusinessTheme(defaultValue)}
      className={compact ? compactSelectClasses(theme) : selectClasses(theme)}
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

  const cookieStore = await cookies()
  const currentAdminTheme = normalizeAdminTheme(
    cookieStore.get("agenda_saas_admin_theme")?.value,
  )
  const theme = getAdminThemeClasses(currentAdminTheme)

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
    <main className={`min-h-screen ${theme.page}`}>
      <section className="mx-auto max-w-[88rem] px-5 py-8 sm:px-6 lg:py-10">
        <div className={`rounded-[2.3rem] border p-8 shadow-2xl lg:p-10 ${theme.hero}`}>
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className={`text-sm uppercase tracking-[0.3em] ${theme.subtle}`}>
                Admin
              </p>

              <h1 className={`mt-3 text-4xl font-bold tracking-tight md:text-5xl ${theme.title}`}>
                Gerir negócios
              </h1>

              <p className={`mt-4 max-w-2xl ${theme.muted}`}>
                Crie, edite e selecione os negócios da plataforma. Cada negócio
                tem o próprio link público, tema, serviços, horários, clientes e
                marcações.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Link
                href="/admin"
                className={`rounded-full border px-5 py-3 text-center font-semibold transition ${theme.secondaryButton}`}
              >
                Voltar ao admin
              </Link>

              <Link
                href="/dashboard"
                className={`rounded-full border px-5 py-3 text-center font-semibold transition ${theme.primaryButton}`}
              >
                Abrir painel
              </Link>
            </div>
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-4">
            <div className={`rounded-[1.7rem] border p-5 ${theme.card}`}>
              <p className={`text-sm ${theme.muted}`}>Total de negócios</p>

              <p className="mt-2 text-3xl font-bold">{businesses.length}</p>
            </div>

            <div className={`rounded-[1.7rem] border p-5 ${theme.card}`}>
              <p className={`text-sm ${theme.muted}`}>Painel atual</p>

              <p className="mt-2 truncate text-lg font-semibold">
                {currentBusiness?.name ?? currentDashboardSlug}
              </p>
            </div>

            <div className={`rounded-[1.7rem] border p-5 ${theme.card}`}>
              <p className={`text-sm ${theme.muted}`}>Link atual</p>

              <p className="mt-2 truncate text-lg font-semibold">
                /book/{currentBusiness?.slug ?? currentDashboardSlug}
              </p>
            </div>

            <div className={`rounded-[1.7rem] border p-5 ${theme.card}`}>
              <p className={`text-sm ${theme.muted}`}>Modo</p>

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
          <div className={`rounded-[2.2rem] border p-6 shadow-2xl ${theme.panel}`}>
            <p className={`text-xs font-semibold uppercase tracking-[0.3em] ${theme.subtle}`}>
              Novo negócio
            </p>

            <h2 className="mt-3 text-2xl font-bold">Cadastrar negócio</h2>

            <p className={`mt-3 text-sm ${theme.muted}`}>
              Crie um novo cliente da plataforma. Depois, em Utilizadores, pode
              criar o gerente e associar ao negócio.
            </p>

            <form
              action={createBusinessAction}
              noValidate
              className="mt-6 grid gap-4"
            >
              <div>
                <label className={`text-sm font-medium ${theme.title}`}>
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
                  className={inputClasses(theme)}
                />
              </div>

              <div>
                <label className={`text-sm font-medium ${theme.title}`}>
                  Slug público
                </label>

                <input
                  type="text"
                  name="slug"
                  maxLength={60}
                  defaultValue={formValues.slug}
                  placeholder="clinica-teste"
                  className={inputClasses(theme)}
                />

                <p className={`mt-2 text-xs ${theme.subtle}`}>
                  Se deixar vazio, o sistema gera automaticamente a partir do
                  nome.
                </p>
              </div>

              <div>
                <label className={`text-sm font-medium ${theme.title}`}>
                  Tema da página pública
                </label>

                <ThemeSelect theme={theme} defaultValue={formValues.theme} />

                <p className={`mt-2 text-xs ${theme.subtle}`}>
                  Pode alterar depois em qualquer momento.
                </p>
              </div>

              <div>
                <label className={`text-sm font-medium ${theme.title}`}>
                  Telefone / WhatsApp
                </label>

                <input
                  type="tel"
                  name="phone"
                  minLength={7}
                  maxLength={20}
                  defaultValue={formValues.phone}
                  placeholder="+351 912 345 678"
                  className={inputClasses(theme)}
                />
              </div>

              <div>
                <label className={`text-sm font-medium ${theme.title}`}>
                  E-mail público
                </label>

                <input
                  type="text"
                  name="email"
                  inputMode="email"
                  maxLength={120}
                  defaultValue={formValues.email}
                  placeholder="contacto@clinica.pt"
                  className={inputClasses(theme)}
                />
              </div>

              <div>
                <label className={`text-sm font-medium ${theme.title}`}>
                  E-mail de notificação
                </label>

                <input
                  type="text"
                  name="notificationEmail"
                  inputMode="email"
                  maxLength={120}
                  defaultValue={formValues.notificationEmail}
                  placeholder="recepcao@clinica.pt"
                  className={inputClasses(theme)}
                />

                <p className={`mt-2 text-xs ${theme.subtle}`}>
                  Este e-mail recebe os avisos internos de novas marcações.
                </p>
              </div>

              <div>
                <label className={`text-sm font-medium ${theme.title}`}>
                  Morada
                </label>

                <input
                  type="text"
                  name="address"
                  maxLength={160}
                  defaultValue={formValues.address}
                  placeholder="Rua, cidade, país"
                  className={inputClasses(theme)}
                />
              </div>

              <div>
                <label className={`text-sm font-medium ${theme.title}`}>
                  Descrição
                </label>

                <textarea
                  name="description"
                  rows={4}
                  maxLength={300}
                  defaultValue={formValues.description}
                  placeholder="Breve descrição do negócio."
                  className={`${inputClasses(theme)} resize-none`}
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
                className={`mt-2 rounded-full border px-5 py-4 font-semibold transition ${theme.primaryButton}`}
              >
                Criar negócio
              </button>
            </form>
          </div>

          <div className={`rounded-[2.2rem] border p-5 shadow-2xl ${theme.panel}`}>
            <div className={`border-b px-2 pb-4 ${theme.line}`}>
              <p className={`text-xs font-semibold uppercase tracking-[0.3em] ${theme.subtle}`}>
                Cadastrados
              </p>

              <h2 className="mt-3 text-2xl font-bold">
                Negócios da plataforma
              </h2>

              <p className={`mt-2 text-sm ${theme.muted}`}>
                Edite os dados principais e escolha qual negócio fica ativo no
                painel.
              </p>
            </div>

            {businesses.length === 0 ? (
              <div className={`mt-4 rounded-[1.7rem] border p-10 text-center ${theme.card}`}>
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
                      className={`rounded-[1.8rem] border p-5 ${theme.card}`}
                    >
                      <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
                        <div>
                          <div className="flex flex-wrap items-center gap-3">
                            {isCurrentDashboardBusiness && (
                              <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${theme.actionSelected}`}>
                                Painel atual
                              </span>
                            )}

                            <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${theme.badge}`}>
                              /book/{business.slug}
                            </span>

                            <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${theme.badge}`}>
                              Tema: {formatBusinessTheme(business.theme)}
                            </span>
                          </div>

                          <h3 className={`mt-4 text-2xl font-bold ${theme.title}`}>
                            {business.name}
                          </h3>

                          <div className={`mt-3 grid gap-2 text-sm ${theme.muted}`}>
                            <p>
                              Criado em:{" "}
                              <span className={theme.title}>
                                {formatDate(business.createdAt)}
                              </span>
                            </p>

                            <p>
                              Gerentes associados:{" "}
                              <span className={theme.title}>
                                {business.users.length > 0
                                  ? business.users
                                      .map((user) => user.name)
                                      .join(", ")
                                  : "Nenhuma"}
                              </span>
                            </p>

                            <p>
                              E-mail público:{" "}
                              <span className={theme.title}>
                                {business.email || "Não definido"}
                              </span>
                            </p>

                            <p>
                              E-mail de notificação:{" "}
                              <span className={theme.title}>
                                {business.notificationEmail || "Não definido"}
                              </span>
                            </p>

                            <p>
                              Telefone:{" "}
                              <span className={theme.title}>
                                {business.phone || "Não definido"}
                              </span>
                            </p>

                            {business.address && (
                              <p>
                                Morada:{" "}
                                <span className={theme.title}>
                                  {business.address}
                                </span>
                              </p>
                            )}
                          </div>

                          <div className="mt-5 grid gap-3 sm:grid-cols-5">
                            <div className={`rounded-[1.2rem] border p-4 ${theme.panelSoft}`}>
                              <p className="text-xs text-zinc-600">Serviços</p>

                              <p className="mt-1 text-xl font-bold">
                                {business._count.services}
                              </p>
                            </div>

                            <div className={`rounded-[1.2rem] border p-4 ${theme.panelSoft}`}>
                              <p className="text-xs text-zinc-600">
                                Marcações
                              </p>

                              <p className="mt-1 text-xl font-bold">
                                {business._count.bookings}
                              </p>
                            </div>

                            <div className={`rounded-[1.2rem] border p-4 ${theme.panelSoft}`}>
                              <p className="text-xs text-zinc-600">Clientes</p>

                              <p className="mt-1 text-xl font-bold">
                                {business._count.customers}
                              </p>
                            </div>

                            <div className={`rounded-[1.2rem] border p-4 ${theme.panelSoft}`}>
                              <p className="text-xs text-zinc-600">
                                Dias ativos
                              </p>

                              <p className="mt-1 text-xl font-bold">
                                {business.workHours.length}
                              </p>
                            </div>

                            <div className={`rounded-[1.2rem] border p-4 ${theme.panelSoft}`}>
                              <p className="text-xs text-zinc-600">Gerentes</p>

                              <p className="mt-1 text-xl font-bold">
                                {business.users.length}
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-col gap-3 xl:min-w-60">
                          <Link
                            href={`/book/${business.slug}`}
                            className={`rounded-full border px-5 py-3 text-center text-sm font-semibold transition ${theme.primaryButton}`}
                          >
                            Abrir página pública
                          </Link>

                          {isCurrentDashboardBusiness ? (
                            <Link
                              href="/dashboard"
                              className={`rounded-full border px-5 py-3 text-center text-sm font-semibold transition ${theme.secondaryButton}`}
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
                                className={`w-full rounded-full border px-5 py-3 text-center text-sm font-semibold transition ${theme.secondaryButton}`}
                              >
                                Usar no painel
                              </button>
                            </form>
                          )}

                          <Link
                            href="/admin/users"
                            className={`rounded-full border px-5 py-3 text-center text-sm font-semibold transition ${theme.secondaryButton}`}
                          >
                            Gerir gerente
                          </Link>
                        </div>
                      </div>

                      <form
                        action={updateBusinessAction}
                        noValidate
                        className={`mt-6 rounded-[1.7rem] border p-5 ${theme.panelSoft}`}
                      >
                        <input
                          type="hidden"
                          name="businessId"
                          value={business.id}
                        />

                        <p className={`text-xs font-semibold uppercase tracking-[0.3em] ${theme.subtle}`}>
                          Editar negócio
                        </p>

                        <div className="mt-4 grid gap-4 lg:grid-cols-2">
                          <div>
                            <label className={`text-sm font-medium ${theme.title}`}>
                              Nome
                            </label>

                            <input
                              type="text"
                              name="name"
                              required
                              minLength={2}
                              maxLength={80}
                              defaultValue={business.name}
                              className={compactInputClasses(theme)}
                            />
                          </div>

                          <div>
                            <label className={`text-sm font-medium ${theme.title}`}>
                              Slug público
                            </label>

                            <input
                              type="text"
                              name="slug"
                              required
                              maxLength={60}
                              defaultValue={business.slug}
                              className={compactInputClasses(theme)}
                            />
                          </div>

                          <div>
                            <label className={`text-sm font-medium ${theme.title}`}>
                              Tema
                            </label>

                            <ThemeSelect
                              theme={theme}
                              defaultValue={business.theme}
                              compact
                            />
                          </div>

                          <div>
                            <label className={`text-sm font-medium ${theme.title}`}>
                              Telefone / WhatsApp
                            </label>

                            <input
                              type="tel"
                              name="phone"
                              minLength={7}
                              maxLength={20}
                              defaultValue={business.phone ?? ""}
                              className={compactInputClasses(theme)}
                            />
                          </div>

                          <div>
                            <label className={`text-sm font-medium ${theme.title}`}>
                              E-mail público
                            </label>

                            <input
                              type="text"
                              name="email"
                              inputMode="email"
                              maxLength={120}
                              defaultValue={business.email ?? ""}
                              className={compactInputClasses(theme)}
                            />
                          </div>

                          <div>
                            <label className={`text-sm font-medium ${theme.title}`}>
                              E-mail de notificação
                            </label>

                            <input
                              type="text"
                              name="notificationEmail"
                              inputMode="email"
                              maxLength={120}
                              defaultValue={business.notificationEmail ?? ""}
                              className={compactInputClasses(theme)}
                            />
                          </div>

                          <div className="lg:col-span-2">
                            <label className={`text-sm font-medium ${theme.title}`}>
                              Morada
                            </label>

                            <input
                              type="text"
                              name="address"
                              maxLength={160}
                              defaultValue={business.address ?? ""}
                              className={compactInputClasses(theme)}
                            />
                          </div>

                          <div className="lg:col-span-2">
                            <label className={`text-sm font-medium ${theme.title}`}>
                              Descrição
                            </label>

                            <textarea
                              name="description"
                              rows={3}
                              maxLength={300}
                              defaultValue={business.description ?? ""}
                              className={`${compactInputClasses(theme)} resize-none`}
                            />
                          </div>
                        </div>

                        <button
                          type="submit"
                          className={`mt-5 rounded-full border px-5 py-3 font-semibold transition ${theme.secondaryButton}`}
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