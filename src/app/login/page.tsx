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
    <main className="min-h-screen overflow-hidden bg-[#0f0f10] text-white">
      <section className="relative mx-auto flex min-h-screen max-w-[82rem] items-center px-5 py-10 sm:px-6">
        <div className="pointer-events-none absolute left-[-10rem] top-[-12rem] h-96 w-96 rounded-full bg-[#d7b98a]/10 blur-3xl" />
        <div className="pointer-events-none absolute bottom-[-12rem] right-[-10rem] h-96 w-96 rounded-full bg-white/5 blur-3xl" />

        <div className="relative grid w-full gap-10 lg:grid-cols-[1fr_430px] lg:items-center">
          <div>
            <Link href="/" className="text-xl font-black tracking-tight">
              MarcaFlow
            </Link>

            <p className="mt-12 text-sm uppercase tracking-[0.35em] text-[#a8895c]">
              Acesso privado
            </p>

            <h1 className="mt-4 max-w-3xl text-4xl font-black tracking-tight md:text-6xl">
              Entrar no painel de gestão.
            </h1>

            <p className="mt-5 max-w-2xl text-lg leading-8 text-zinc-400">
              Administradores entram no painel da plataforma. Gerentes de negócio
              entram apenas no painel do próprio negócio.
            </p>

            <div className="mt-8 grid max-w-2xl gap-3 sm:grid-cols-3">
              <div className="rounded-[1.4rem] border border-[#2c2924] bg-[#151515] p-4">
                <p className="text-xs uppercase tracking-[0.25em] text-[#a8895c]">
                  Admin
                </p>
                <p className="mt-2 text-sm text-zinc-400">
                  Plataforma
                </p>
              </div>

              <div className="rounded-[1.4rem] border border-[#2c2924] bg-[#151515] p-4">
                <p className="text-xs uppercase tracking-[0.25em] text-[#a8895c]">
                  Gerente
                </p>
                <p className="mt-2 text-sm text-zinc-400">
                  Negócio
                </p>
              </div>

              <div className="rounded-[1.4rem] border border-[#2c2924] bg-[#151515] p-4">
                <p className="text-xs uppercase tracking-[0.25em] text-[#a8895c]">
                  Agenda
                </p>
                <p className="mt-2 text-sm text-zinc-400">
                  Online
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-[2.2rem] border border-[#d7b98a]/20 bg-[#151515] p-6 shadow-2xl shadow-black/60">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#a8895c]">
              Login
            </p>

            <h2 className="mt-3 text-2xl font-bold">Acessar conta</h2>

            <p className="mt-2 text-sm text-zinc-500">
              Use o e-mail e a senha cadastrados para entrar.
            </p>

            {errorMessage && (
              <div className="mt-5 rounded-[1.2rem] border border-red-300 bg-red-50 px-4 py-3 text-sm font-semibold text-red-800">
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
                  className="mt-2 w-full rounded-[1.2rem] border border-[#2c2924] bg-[#0b0b0c] px-4 py-4 text-white outline-none transition placeholder:text-zinc-700 focus:border-[#f0dcc1]"
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
                  className="mt-2 w-full rounded-[1.2rem] border border-[#2c2924] bg-[#0b0b0c] px-4 py-4 text-white outline-none transition placeholder:text-zinc-700 focus:border-[#f0dcc1]"
                />
              </div>

              <button
                type="submit"
                className="rounded-full border border-white bg-white px-5 py-4 font-bold text-zinc-950 transition hover:bg-[#f0dcc1]"
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
