import { cookies } from "next/headers"
import {
  formatAdminTheme,
  getAdminThemeClasses,
  normalizeAdminTheme,
} from "@/lib/admin-theme"
import { normalizeBusinessTheme } from "@/lib/business-theme"
import { getCurrentBusinessSlug } from "@/lib/current-business"
import { prisma } from "@/lib/prisma"
import { AdminBusinessThemeSelector } from "./AdminBusinessThemeSelector"
import { AdminThemeSelector } from "./AdminThemeSelector"
import {
  selectAdminBusinessAction,
  updateAdminBusinessThemeAction,
  updateAdminThemeAction,
} from "./actions"

type AdminPageProps = {
  searchParams: Promise<{
    error?: string
    success?: string
  }>
}

const ADMIN_THEME_COOKIE = "agenda_saas_admin_theme"

function formatBusinessTheme(theme: string | null | undefined) {
  const normalizedTheme = normalizeBusinessTheme(theme)

  const themeMap = {
    WHITE: "Branco",
    NUDE: "Nude",
    LUXURY: "Premium",
  }

  return themeMap[normalizedTheme]
}

function getFeedbackClasses(type: "error" | "success") {
  if (type === "error") {
    return "border-red-300 bg-red-50 text-red-800"
  }

  return "border-emerald-300 bg-emerald-50 text-emerald-800"
}

export const dynamic = "force-dynamic"

export default async function AdminPage({ searchParams }: AdminPageProps) {
  const { error, success } = await searchParams
  const cookieStore = await cookies()

  const currentAdminTheme = normalizeAdminTheme(
    cookieStore.get(ADMIN_THEME_COOKIE)?.value,
  )

  const theme = getAdminThemeClasses(currentAdminTheme)
  const currentBusinessSlug = await getCurrentBusinessSlug()

  const [
    businesses,
    bookingCount,
    customerCount,
    serviceCount,
    userCount,
    adminCount,
    ownerCount,
  ] = await Promise.all([
    prisma.business.findMany({
      orderBy: {
        createdAt: "asc",
      },
      include: {
        _count: {
          select: {
            bookings: true,
            customers: true,
            services: true,
          },
        },
      },
    }),
    prisma.booking.count(),
    prisma.customer.count(),
    prisma.service.count(),
    prisma.user.count(),
    prisma.user.count({
      where: {
        role: "ADMIN",
      },
    }),
    prisma.user.count({
      where: {
        role: "OWNER",
      },
    }),
  ])

  const selectedBusiness =
    businesses.find((business) => business.slug === currentBusinessSlug) ??
    businesses[0] ??
    null

  return (
    <main className={`min-h-screen ${theme.page}`}>
      <section className="mx-auto max-w-7xl px-6 py-10">
        <div className={`rounded-[2rem] border p-8 shadow-2xl ${theme.hero}`}>
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className={`text-sm uppercase tracking-[0.3em] ${theme.subtle}`}>
                Admin
              </p>

              <h1
                className={`mt-3 text-4xl font-bold tracking-tight md:text-5xl ${theme.title}`}
              >
                Administração da plataforma
              </h1>

              <p className={`mt-4 max-w-2xl ${theme.muted}`}>
                Controle negócios, utilizadores, permissões, temas e áreas
                técnicas da plataforma.
              </p>

              <div className="mt-5 flex flex-wrap gap-3">
                <span
                  className={`rounded-full border px-4 py-2 text-sm font-medium ${theme.badge}`}
                >
                  Tema admin: {formatAdminTheme(currentAdminTheme)}
                </span>

                {selectedBusiness && (
                  <span
                    className={`rounded-full border px-4 py-2 text-sm font-medium ${theme.badge}`}
                  >
                    Negócio atual: {selectedBusiness.name}
                  </span>
                )}
              </div>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <a
                href="/admin/users"
                className={`rounded-2xl border px-5 py-3 text-center font-semibold transition ${theme.primaryButton}`}
              >
                Utilizadores
              </a>

              <a
                href="/dashboard"
                className={`rounded-2xl border px-5 py-3 text-center font-semibold transition ${theme.secondaryButton}`}
              >
                Abrir painel
              </a>

              <a
                href="/logout"
                className={`rounded-2xl border px-5 py-3 text-center font-semibold transition ${theme.secondaryButton}`}
              >
                Sair
              </a>
            </div>
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-4">
            <div className={`rounded-3xl border p-5 ${theme.card}`}>
              <p className={`text-sm ${theme.muted}`}>Negócios</p>

              <p className={`mt-2 text-3xl font-bold ${theme.title}`}>
                {businesses.length}
              </p>
            </div>

            <div className={`rounded-3xl border p-5 ${theme.card}`}>
              <p className={`text-sm ${theme.muted}`}>Utilizadores</p>

              <p className={`mt-2 text-3xl font-bold ${theme.title}`}>
                {userCount}
              </p>
            </div>

            <div className={`rounded-3xl border p-5 ${theme.card}`}>
              <p className={`text-sm ${theme.muted}`}>Admins</p>

              <p className={`mt-2 text-3xl font-bold ${theme.title}`}>
                {adminCount}
              </p>
            </div>

            <div className={`rounded-3xl border p-5 ${theme.card}`}>
              <p className={`text-sm ${theme.muted}`}>Donas</p>

              <p className={`mt-2 text-3xl font-bold ${theme.title}`}>
                {ownerCount}
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

        <div className="mt-8 grid gap-8 lg:grid-cols-[420px_1fr]">
          <div className="grid gap-6">
            <div className={`rounded-[2rem] border p-6 shadow-2xl ${theme.panel}`}>
              <p className={`text-xs font-semibold uppercase tracking-[0.3em] ${theme.subtle}`}>
                Acessos principais
              </p>

              <h2 className={`mt-3 text-2xl font-bold ${theme.title}`}>
                Gestão da plataforma
              </h2>

              <p className={`mt-3 text-sm ${theme.muted}`}>
                Área rápida para gerir utilizadores, negócios, ferramentas e
                painéis.
              </p>

              <div className="mt-5 grid gap-3">
                <a
                  href="/admin/users"
                  className={`rounded-2xl border px-5 py-4 text-center font-semibold transition ${theme.primaryButton}`}
                >
                  Gerir utilizadores
                </a>

                <a
                  href="/dashboard/businesses"
                  className={`rounded-2xl border px-5 py-4 text-center font-semibold transition ${theme.secondaryButton}`}
                >
                  Gerir negócios
                </a>

                <a
                  href="/dashboard/tools"
                  className={`rounded-2xl border px-5 py-4 text-center font-semibold transition ${theme.secondaryButton}`}
                >
                  Ferramentas
                </a>

                {selectedBusiness && (
                  <>
                    <a
                      href="/dashboard"
                      className={`rounded-2xl border px-5 py-4 text-center font-semibold transition ${theme.secondaryButton}`}
                    >
                      Painel do negócio atual
                    </a>

                    <a
                      href={`/book/${selectedBusiness.slug}`}
                      className={`rounded-2xl border px-5 py-4 text-center font-semibold transition ${theme.secondaryButton}`}
                    >
                      Página pública atual
                    </a>
                  </>
                )}
              </div>
            </div>

            <div className={`rounded-[2rem] border p-6 shadow-2xl ${theme.panel}`}>
              <p className={`text-xs font-semibold uppercase tracking-[0.3em] ${theme.subtle}`}>
                Tema do admin
              </p>

              <h2 className={`mt-3 text-2xl font-bold ${theme.title}`}>
                Aparência desta página
              </h2>

              <p className={`mt-3 text-sm ${theme.muted}`}>
                Escolha a cor da área administrativa.
              </p>

              <form action={updateAdminThemeAction} className="mt-5">
                <input type="hidden" name="redirectTo" value="/admin" />

                <AdminThemeSelector currentTheme={currentAdminTheme} />

                <button
                  type="submit"
                  className={`mt-5 w-full rounded-2xl border px-5 py-4 font-semibold transition ${theme.primaryButton}`}
                >
                  Guardar tema do admin
                </button>
              </form>
            </div>

            <div className={`rounded-[2rem] border p-6 shadow-2xl ${theme.panel}`}>
              <p className={`text-xs font-semibold uppercase tracking-[0.3em] ${theme.subtle}`}>
                Resumo geral
              </p>

              <h2 className={`mt-3 text-2xl font-bold ${theme.title}`}>
                Dados da plataforma
              </h2>

              <div className="mt-5 grid gap-3">
                <div className={`rounded-2xl border p-4 ${theme.card}`}>
                  <p className={`text-sm ${theme.muted}`}>Marcações</p>

                  <p className={`mt-1 text-2xl font-bold ${theme.title}`}>
                    {bookingCount}
                  </p>
                </div>

                <div className={`rounded-2xl border p-4 ${theme.card}`}>
                  <p className={`text-sm ${theme.muted}`}>Clientes</p>

                  <p className={`mt-1 text-2xl font-bold ${theme.title}`}>
                    {customerCount}
                  </p>
                </div>

                <div className={`rounded-2xl border p-4 ${theme.card}`}>
                  <p className={`text-sm ${theme.muted}`}>Serviços</p>

                  <p className={`mt-1 text-2xl font-bold ${theme.title}`}>
                    {serviceCount}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className={`rounded-[2rem] border p-6 shadow-2xl ${theme.panel}`}>
            <div className={`border-b pb-6 ${theme.line}`}>
              <p className={`text-xs font-semibold uppercase tracking-[0.3em] ${theme.subtle}`}>
                Negócios
              </p>

              <h2 className={`mt-3 text-2xl font-bold ${theme.title}`}>
                Selecionar e alterar tema
              </h2>

              <p className={`mt-3 max-w-2xl text-sm ${theme.muted}`}>
                Escolha qual negócio será aberto no painel e defina o tema usado
                nas páginas desse negócio.
              </p>
            </div>

            {businesses.length === 0 ? (
              <div
                className={`mt-6 rounded-3xl border p-8 text-center ${theme.card}`}
              >
                <p className={theme.muted}>Nenhum negócio cadastrado.</p>
              </div>
            ) : (
              <div className="mt-6 grid gap-5">
                {businesses.map((business) => {
                  const currentBusinessTheme = normalizeBusinessTheme(
                    business.theme,
                  )

                  const isSelected = business.slug === selectedBusiness?.slug

                  return (
                    <div
                      key={business.id}
                      className={`rounded-3xl border p-5 ${
                        isSelected ? theme.card : theme.cardStrong
                      }`}
                    >
                      <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                        <div>
                          <div className="flex flex-wrap items-center gap-3">
                            <span
                              className={`rounded-full border px-3 py-1 text-xs font-semibold ${
                                isSelected
                                  ? theme.actionSelected
                                  : theme.badge
                              }`}
                            >
                              {isSelected ? "Selecionado" : "Negócio"}
                            </span>

                            <span className={`text-sm ${theme.muted}`}>
                              /book/{business.slug}
                            </span>
                          </div>

                          <h3 className={`mt-4 text-2xl font-bold ${theme.title}`}>
                            {business.name}
                          </h3>

                          <div
                            className={`mt-3 grid gap-2 text-sm sm:grid-cols-3 ${theme.muted}`}
                          >
                            <p>
                              Marcações:{" "}
                              <span className={`font-semibold ${theme.title}`}>
                                {business._count.bookings}
                              </span>
                            </p>

                            <p>
                              Clientes:{" "}
                              <span className={`font-semibold ${theme.title}`}>
                                {business._count.customers}
                              </span>
                            </p>

                            <p>
                              Serviços:{" "}
                              <span className={`font-semibold ${theme.title}`}>
                                {business._count.services}
                              </span>
                            </p>
                          </div>
                        </div>

                        <div className="flex flex-col gap-3 sm:flex-row xl:flex-col">
                          <form action={selectAdminBusinessAction}>
                            <input
                              type="hidden"
                              name="slug"
                              value={business.slug}
                            />

                            <button
                              type="submit"
                              className={`w-full rounded-2xl border px-4 py-3 text-sm font-semibold transition ${
                                isSelected
                                  ? theme.primaryButton
                                  : theme.secondaryButton
                              }`}
                            >
                              {isSelected ? "Atual" : "Selecionar"}
                            </button>
                          </form>

                          <a
                            href={`/book/${business.slug}`}
                            className={`w-full rounded-2xl border px-4 py-3 text-center text-sm font-semibold transition ${theme.secondaryButton}`}
                          >
                            Página pública
                          </a>
                        </div>
                      </div>

                      <form
                        action={updateAdminBusinessThemeAction}
                        className={`mt-5 rounded-3xl border p-4 ${theme.cardStrong}`}
                      >
                        <input
                          type="hidden"
                          name="businessId"
                          value={business.id}
                        />

                        <p className={`text-xs font-semibold uppercase tracking-[0.3em] ${theme.subtle}`}>
                          Tema do negócio
                        </p>

                        <AdminBusinessThemeSelector
                          currentTheme={currentBusinessTheme}
                        />

                        <button
                          type="submit"
                          className={`mt-4 rounded-2xl border px-5 py-3 font-semibold transition ${theme.primaryButton}`}
                        >
                          Guardar tema do negócio
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