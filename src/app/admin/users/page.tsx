import { cookies } from "next/headers"
import Link from "next/link"
import {
  getAdminThemeClasses,
  normalizeAdminTheme,
} from "@/lib/admin-theme"
import { prisma } from "@/lib/prisma"
import {
  createUserAction,
  deleteUserAction,
  updateUserPasswordAction,
  updateUserRoleAction,
} from "./actions"

type AdminUsersPageProps = {
  searchParams: Promise<{
    error?: string
    success?: string
  }>
}

function formatRole(role: string) {
  if (role === "ADMIN") {
    return "Admin"
  }

  if (role === "OWNER") {
    return "Gerente do negócio"
  }

  return role
}

function getRoleBadgeClasses(role: string, theme: ReturnType<typeof getAdminThemeClasses>) {
  if (role === "ADMIN") {
    return theme.actionSelected
  }

  return theme.badge
}

function getFeedbackClasses(type: "error" | "success") {
  if (type === "error") {
    return "border-red-300 bg-red-50 text-red-800"
  }

  return "border-emerald-300 bg-emerald-50 text-emerald-800"
}

const ADMIN_THEME_COOKIE = "agenda_saas_admin_theme"

export default async function AdminUsersPage({
  searchParams,
}: AdminUsersPageProps) {
  const { error, success } = await searchParams
  const cookieStore = await cookies()
  const currentAdminTheme = normalizeAdminTheme(
    cookieStore.get(ADMIN_THEME_COOKIE)?.value,
  )
  const theme = getAdminThemeClasses(currentAdminTheme)

  const [users, businesses] = await Promise.all([
    prisma.user.findMany({
      orderBy: {
        createdAt: "asc",
      },
      include: {
        business: true,
      },
    }),
    prisma.business.findMany({
      orderBy: {
        name: "asc",
      },
    }),
  ])

  const adminUsers = users.filter((user) => user.role === "ADMIN")
  const ownerUsers = users.filter((user) => user.role === "OWNER")
  const usersWithoutBusiness = users.filter(
    (user) => user.role === "OWNER" && !user.business,
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

              <h1 className="mt-3 text-4xl font-bold tracking-tight md:text-5xl">
                Utilizadores
              </h1>

              <p className={`mt-4 max-w-2xl ${theme.muted}`}>
                Crie o acesso dos gerentes dos negócios e defina quem é Admin ou Gerente.
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
              <p className={`text-sm ${theme.muted}`}>Utilizadores</p>

              <p className="mt-2 text-3xl font-bold">{users.length}</p>
            </div>

            <div className={`rounded-[1.7rem] border p-5 ${theme.card}`}>
              <p className={`text-sm ${theme.muted}`}>Admins</p>

              <p className="mt-2 text-3xl font-bold">{adminUsers.length}</p>
            </div>

            <div className={`rounded-[1.7rem] border p-5 ${theme.card}`}>
              <p className={`text-sm ${theme.muted}`}>Gerentes</p>

              <p className="mt-2 text-3xl font-bold">{ownerUsers.length}</p>
            </div>

            <div className={`rounded-[1.7rem] border p-5 ${theme.card}`}>
              <p className={`text-sm ${theme.muted}`}>Sem negócio</p>

              <p className="mt-2 text-3xl font-bold">
                {usersWithoutBusiness.length}
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

        <div className="mt-8 grid gap-8 lg:grid-cols-[430px_1fr]">
          <div className={`rounded-[2.2rem] border p-6 shadow-2xl ${theme.panel}`}>
            <p className={`text-xs font-semibold uppercase tracking-[0.3em] ${theme.subtle}`}>
              Novo acesso
            </p>

            <h2 className="mt-3 text-2xl font-bold">Criar utilizador</h2>

            <p className={`mt-3 text-sm leading-6 ${theme.muted}`}>
              Para um gerente de negócio, escolha o tipo Gerente e selecione o
              negócio correspondente.
            </p>

            <form action={createUserAction} className="mt-6 grid gap-4">
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
                  placeholder="Ex: Gerente Essência"
                  className={`mt-2 w-full rounded-[1.2rem] border px-4 py-4 outline-none transition ${theme.input}`}
                />
              </div>

              <div>
                <label className={`text-sm font-medium ${theme.title}`}>
                  E-mail
                </label>

                <input
                  type="email"
                  name="email"
                  required
                  maxLength={120}
                  placeholder="email@negocio.pt"
                  className={`mt-2 w-full rounded-[1.2rem] border px-4 py-4 outline-none transition ${theme.input}`}
                />
              </div>

              <div>
                <label className={`text-sm font-medium ${theme.title}`}>
                  Senha inicial
                </label>

                <input
                  type="password"
                  name="password"
                  required
                  minLength={6}
                  placeholder="Mínimo 6 caracteres"
                  className={`mt-2 w-full rounded-[1.2rem] border px-4 py-4 outline-none transition ${theme.input}`}
                />
              </div>

              <div>
                <label className={`text-sm font-medium ${theme.title}`}>
                  Tipo
                </label>

                <select
                  name="role"
                  required
                  defaultValue="OWNER"
                  className={`mt-2 w-full rounded-[1.2rem] border px-4 py-4 outline-none transition ${theme.input}`}
                >
                  <option value="OWNER">Gerente do negócio</option>
                  <option value="ADMIN">Admin da plataforma</option>
                </select>
              </div>

              <div>
                <label className={`text-sm font-medium ${theme.title}`}>
                  Negócio
                </label>

                <select
                  name="businessId"
                  defaultValue=""
                  className={`mt-2 w-full rounded-[1.2rem] border px-4 py-4 outline-none transition ${theme.input}`}
                >
                  <option value="">Sem negócio / Admin</option>

                  {businesses.map((business) => (
                    <option key={business.id} value={business.id}>
                      {business.name}
                    </option>
                  ))}
                </select>

                <p className={`mt-2 text-xs ${theme.subtle}`}>
                  Obrigatório para utilizador do tipo Gerente do negócio.
                </p>
              </div>

              <button
                type="submit"
                className={`rounded-full border px-5 py-4 font-bold transition ${theme.primaryButton}`}
              >
                Criar utilizador
              </button>
            </form>
          </div>

          <div className={`rounded-[2.2rem] border p-5 shadow-2xl ${theme.panel}`}>
            <div className={`border-b px-2 pb-5 ${theme.line}`}>
              <p className={`text-xs font-semibold uppercase tracking-[0.3em] ${theme.subtle}`}>
                Lista
              </p>

              <h2 className="mt-3 text-2xl font-bold">
                Acessos cadastrados
              </h2>

              <p className={`mt-2 text-sm ${theme.muted}`}>
                Alterar permissões ou senha remove as sessões ativas desse
                utilizador.
              </p>
            </div>

            {users.length === 0 ? (
              <div className={`mt-4 rounded-[1.7rem] border p-10 text-center ${theme.card}`}>
                Ainda não existem utilizadores.
              </div>
            ) : (
              <div className="mt-4 grid gap-4">
                {users.map((user) => (
                  <div
                    key={user.id}
                    className={`rounded-[1.8rem] border p-5 ${theme.card}`}
                  >
                    <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
                      <div>
                        <div className="flex flex-wrap items-center gap-3">
                          <span
                            className={`rounded-full border px-3 py-1 text-xs font-semibold ${getRoleBadgeClasses(user.role, theme)}`}
                          >
                            {formatRole(user.role)}
                          </span>

                          <span className={`text-sm ${theme.muted}`}>
                            {user.business?.name || "Sem negócio associado"}
                          </span>
                        </div>

                        <h3 className="mt-4 text-2xl font-bold">
                          {user.name}
                        </h3>

                        <p className={`mt-2 text-sm ${theme.muted}`}>
                          {user.email}
                        </p>
                      </div>

                      <form action={deleteUserAction}>
                        <input type="hidden" name="userId" value={user.id} />

                        <button
                          type="submit"
                          className="rounded-full border border-red-300 bg-red-50 px-4 py-3 text-sm font-semibold text-red-800 transition hover:border-red-500"
                        >
                          Apagar
                        </button>
                      </form>
                    </div>

                    <div className="mt-5 grid gap-4 lg:grid-cols-2">
                      <form
                        action={updateUserRoleAction}
                        className={`rounded-[1.5rem] border p-4 ${theme.panelSoft}`}
                      >
                        <input type="hidden" name="userId" value={user.id} />

                        <p className={`text-xs font-semibold uppercase tracking-[0.3em] ${theme.subtle}`}>
                          Permissões
                        </p>

                        <div className="mt-4 grid gap-3">
                          <select
                            name="role"
                            required
                            defaultValue={user.role}
                            className={`rounded-[1.2rem] border px-4 py-3 outline-none transition ${theme.input}`}
                          >
                            <option value="OWNER">Gerente do negócio</option>
                            <option value="ADMIN">Admin da plataforma</option>
                          </select>

                          <select
                            name="businessId"
                            defaultValue={user.businessId ?? ""}
                            className={`rounded-[1.2rem] border px-4 py-3 outline-none transition ${theme.input}`}
                          >
                            <option value="">Sem negócio / Admin</option>

                            {businesses.map((business) => (
                              <option key={business.id} value={business.id}>
                                {business.name}
                              </option>
                            ))}
                          </select>

                          <button
                            type="submit"
                            className={`rounded-full border px-4 py-3 text-sm font-semibold transition ${theme.secondaryButton}`}
                          >
                            Guardar permissões
                          </button>
                        </div>
                      </form>

                      <form
                        action={updateUserPasswordAction}
                        className={`rounded-[1.5rem] border p-4 ${theme.panelSoft}`}
                      >
                        <input type="hidden" name="userId" value={user.id} />

                        <p className={`text-xs font-semibold uppercase tracking-[0.3em] ${theme.subtle}`}>
                          Senha
                        </p>

                        <div className="mt-4 grid gap-3">
                          <input
                            type="password"
                            name="password"
                            required
                            minLength={6}
                            placeholder="Nova senha"
                            className={`rounded-[1.2rem] border px-4 py-3 outline-none transition ${theme.input}`}
                          />

                          <button
                            type="submit"
                            className={`rounded-full border px-4 py-3 text-sm font-semibold transition ${theme.secondaryButton}`}
                          >
                            Atualizar senha
                          </button>
                        </div>
                      </form>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>
    </main>
  )
}