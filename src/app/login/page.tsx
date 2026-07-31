import Link from "next/link"
import { redirect } from "next/navigation"
import { getSessionRedirectPath } from "@/lib/auth"
import { loginAction } from "./actions"

type LoginPageProps = {
  searchParams: Promise<{
    error?: string
    next?: string
  }>
}

function getErrorMessage(error?: string) {
  if (error === "email") {
    return "Informe um e-mail válido."
  }

  if (error === "config") {
    return "Configuração inicial em falta. Verifique a senha admin no ambiente."
  }

  if (error === "invalid") {
    return "E-mail ou senha incorretos."
  }

  return ""
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const { error, next } = await searchParams

  const sessionRedirectPath = await getSessionRedirectPath(next || "")

  if (sessionRedirectPath) {
    redirect(sessionRedirectPath)
  }

  const errorMessage = getErrorMessage(error)

  return (
    <main className="min-h-screen bg-[#111113] text-white">
      <section className="mx-auto flex min-h-screen max-w-6xl items-center px-6 py-10">
        <div className="grid w-full gap-8 lg:grid-cols-[1fr_430px] lg:items-center">
          <div>
            <Link href="/" className="text-xl font-black tracking-tight">
              MarcaFlow
            </Link>

            <p className="mt-10 text-sm uppercase tracking-[0.35em] text-zinc-500">
              Acesso privado
            </p>

            <h1 className="mt-4 max-w-3xl text-4xl font-black tracking-tight md:text-6xl">
              Entrar no painel de gestão.
            </h1>

            <p className="mt-5 max-w-2xl text-lg leading-8 text-zinc-400">
              Administradores entram no painel da plataforma. Gerentes de negócio
              entram apenas no painel do próprio negócio.
            </p>
          </div>

          <div className="rounded-[2rem] border border-zinc-800 bg-[#18181b] p-6 shadow-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-zinc-600">
              Login
            </p>

            <h2 className="mt-3 text-2xl font-bold">Acessar conta</h2>

            {errorMessage && (
              <div className="mt-5 rounded-2xl border border-red-300 bg-red-50 px-4 py-3 text-sm font-semibold text-red-800">
                {errorMessage}
              </div>
            )}

            <form action={loginAction} className="mt-6 grid gap-4">
              <input type="hidden" name="next" value={next || ""} />

              <div>
                <label className="text-sm font-medium text-zinc-300">
                  E-mail
                </label>

                <input
                  type="email"
                  name="email"
                  required
                  autoComplete="email"
                  placeholder="teu@email.com"
                  className="mt-2 w-full rounded-2xl border border-zinc-800 bg-zinc-950 px-4 py-4 text-white outline-none transition placeholder:text-zinc-700 focus:border-white"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-zinc-300">
                  Senha
                </label>

                <input
                  type="password"
                  name="password"
                  required
                  autoComplete="current-password"
                  placeholder="Digite a senha"
                  className="mt-2 w-full rounded-2xl border border-zinc-800 bg-zinc-950 px-4 py-4 text-white outline-none transition placeholder:text-zinc-700 focus:border-white"
                />
              </div>

              <button
                type="submit"
                className="rounded-2xl border border-white bg-white px-5 py-4 font-bold text-zinc-950 transition hover:bg-zinc-200"
              >
                Entrar
              </button>
            </form>
          </div>
        </div>
      </section>
    </main>
  )
}