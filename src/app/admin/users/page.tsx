import Link from "next/link"
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

function getRoleBadgeClasses(role: string) {
  if (role === "ADMIN") {
    return "border-white bg-white text-zinc-950"
  }

  return "border-zinc-700 bg-zinc-900 text-zinc-300"
}

function getFeedbackClasses(type: "error" | "success") {
  if (type === "error") {
    return "border-red-300 bg-red-50 text-red-800"
  }

  return "border-emerald-300 bg-emerald-50 text-emerald-800"
}

export default async function AdminUsersPage({
  searchParams,
}: AdminUsersPageProps) {
  const { error, success } = await searchParams

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
    <main className="min-h-screen bg-[#111113] text-white">
      <section className="mx-auto max-w-7xl px-6 py-10">
        <div className="rounded-[2rem] border border-zinc-800 bg-[#18181b] p-8 shadow-2xl">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-zinc-500">
                Admin
              </p>

              <h1 className="mt-3 text-4xl font-bold tracking-tight md:text-5xl">
                Utilizadores
              </h1>

              <p className="mt-4 max-w-2xl text-zinc-400">
                Crie o acesso dos gerentes dos negócios e defina quem é Admin ou Gerente.
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
            <div className="rounded-3xl border border-zinc-800 bg-[#202024] p-5">
              <p className="text-sm text-zinc-500">Utilizadores</p>

              <p className="mt-2 text-3xl font-bold">{users.length}</p>
            </div>

            <div className="rounded-3xl border border-zinc-800 bg-[#202024] p-5">
              <p className="text-sm text-zinc-500">Admins</p>

              <p className="mt-2 text-3xl font-bold">{adminUsers.length}</p>
            </div>

            <div className="rounded-3xl border border-zinc-800 bg-[#202024] p-5">
              <p className="text-sm text-zinc-500">Gerentes</p>

              <p className="mt-2 text-3xl font-bold">{ownerUsers.length}</p>
            </div>

            <div className="rounded-3xl border border-zinc-800 bg-[#202024] p-5">
              <p className="text-sm text-zinc-500">Sem negócio</p>

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
          <div className="rounded-[2rem] border border-zinc-800 bg-[#18181b] p-6 shadow-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-zinc-600">
              Novo acesso
            </p>

            <h2 className="mt-3 text-2xl font-bold">Criar utilizador</h2>

            <p className="mt-3 text-sm leading-6 text-zinc-500">
              Para um gerente de negócio, escolha o tipo Gerente e selecione o
              negócio correspondente.
            </p>

            <form action={createUserAction} className="mt-6 grid gap-4">
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
                  placeholder="Ex: Gerente Essência"
                  className="mt-2 w-full rounded-2xl border border-zinc-800 bg-zinc-950 px-4 py-4 text-white outline-none transition placeholder:text-zinc-700 focus:border-white"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-zinc-300">
                  E-mail
                </label>

                <input
                  type="email"
                  name="email"
                  required
                  maxLength={120}
                  placeholder="email@negocio.pt"
                  className="mt-2 w-full rounded-2xl border border-zinc-800 bg-zinc-950 px-4 py-4 text-white outline-none transition placeholder:text-zinc-700 focus:border-white"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-zinc-300">
                  Senha inicial
                </label>

                <input
                  type="password"
                  name="password"
                  required
                  minLength={6}
                  placeholder="Mínimo 6 caracteres"
                  className="mt-2 w-full rounded-2xl border border-zinc-800 bg-zinc-950 px-4 py-4 text-white outline-none transition placeholder:text-zinc-700 focus:border-white"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-zinc-300">
                  Tipo
                </label>

                <select
                  name="role"
                  required
                  defaultValue="OWNER"
                  className="mt-2 w-full rounded-2xl border border-zinc-800 bg-zinc-950 px-4 py-4 text-white outline-none transition focus:border-white"
                >
                  <option value="OWNER">Gerente do negócio</option>
                  <option value="ADMIN">Admin da plataforma</option>
                </select>
              </div>

              <div>
                <label className="text-sm font-medium text-zinc-300">
                  Negócio
                </label>

                <select
                  name="businessId"
                  defaultValue=""
                  className="mt-2 w-full rounded-2xl border border-zinc-800 bg-zinc-950 px-4 py-4 text-white outline-none transition focus:border-white"
                >
                  <option value="">Sem negócio / Admin</option>

                  {businesses.map((business) => (
                    <option key={business.id} value={business.id}>
                      {business.name}
                    </option>
                  ))}
                </select>

                <p className="mt-2 text-xs text-zinc-600">
                  Obrigatório para utilizador do tipo Gerente do negócio.
                </p>
              </div>

              <button
                type="submit"
                className="rounded-2xl border border-white bg-white px-5 py-4 font-bold text-zinc-950 transition hover:bg-zinc-200"
              >
                Criar utilizador
              </button>
            </form>
          </div>

          <div className="rounded-[2rem] border border-zinc-800 bg-[#18181b] p-4 shadow-2xl">
            <div className="border-b border-zinc-800 px-2 pb-5">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-zinc-600">
                Lista
              </p>

              <h2 className="mt-3 text-2xl font-bold">
                Acessos cadastrados
              </h2>

              <p className="mt-2 text-sm text-zinc-500">
                Alterar permissões ou senha remove as sessões ativas desse
                utilizador.
              </p>
            </div>

            {users.length === 0 ? (
              <div className="mt-4 rounded-3xl border border-zinc-800 bg-black p-10 text-center text-zinc-500">
                Ainda não existem utilizadores.
              </div>
            ) : (
              <div className="mt-4 grid gap-4">
                {users.map((user) => (
                  <div
                    key={user.id}
                    className="rounded-3xl border border-zinc-800 bg-black p-5"
                  >
                    <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
                      <div>
                        <div className="flex flex-wrap items-center gap-3">
                          <span
                            className={`rounded-full border px-3 py-1 text-xs font-semibold ${getRoleBadgeClasses(
                              user.role,
                            )}`}
                          >
                            {formatRole(user.role)}
                          </span>

                          <span className="text-sm text-zinc-500">
                            {user.business?.name || "Sem negócio associado"}
                          </span>
                        </div>

                        <h3 className="mt-4 text-2xl font-bold">
                          {user.name}
                        </h3>

                        <p className="mt-2 text-sm text-zinc-500">
                          {user.email}
                        </p>
                      </div>

                      <form action={deleteUserAction}>
                        <input type="hidden" name="userId" value={user.id} />

                        <button
                          type="submit"
                          className="rounded-2xl border border-red-300 bg-red-50 px-4 py-3 text-sm font-semibold text-red-800 transition hover:border-red-500"
                        >
                          Apagar
                        </button>
                      </form>
                    </div>

                    <div className="mt-5 grid gap-4 lg:grid-cols-2">
                      <form
                        action={updateUserRoleAction}
                        className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4"
                      >
                        <input type="hidden" name="userId" value={user.id} />

                        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-zinc-600">
                          Permissões
                        </p>

                        <div className="mt-4 grid gap-3">
                          <select
                            name="role"
                            required
                            defaultValue={user.role}
                            className="rounded-2xl border border-zinc-800 bg-black px-4 py-3 text-white outline-none transition focus:border-white"
                          >
                            <option value="OWNER">Gerente do negócio</option>
                            <option value="ADMIN">Admin da plataforma</option>
                          </select>

                          <select
                            name="businessId"
                            defaultValue={user.businessId ?? ""}
                            className="rounded-2xl border border-zinc-800 bg-black px-4 py-3 text-white outline-none transition focus:border-white"
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
                            className="rounded-2xl border border-zinc-700 px-4 py-3 text-sm font-semibold text-zinc-300 transition hover:border-white hover:text-white"
                          >
                            Guardar permissões
                          </button>
                        </div>
                      </form>

                      <form
                        action={updateUserPasswordAction}
                        className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4"
                      >
                        <input type="hidden" name="userId" value={user.id} />

                        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-zinc-600">
                          Senha
                        </p>

                        <div className="mt-4 grid gap-3">
                          <input
                            type="password"
                            name="password"
                            required
                            minLength={6}
                            placeholder="Nova senha"
                            className="rounded-2xl border border-zinc-800 bg-black px-4 py-3 text-white outline-none transition placeholder:text-zinc-700 focus:border-white"
                          />

                          <button
                            type="submit"
                            className="rounded-2xl border border-zinc-700 px-4 py-3 text-sm font-semibold text-zinc-300 transition hover:border-white hover:text-white"
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