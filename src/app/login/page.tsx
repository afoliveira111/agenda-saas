import { loginAction } from "./actions"

type LoginPageProps = {
  searchParams: Promise<{
    error?: string
    next?: string
  }>
}

function getErrorMessage(error?: string) {
  if (error === "invalid") {
    return "Senha inválida. Tente novamente."
  }

  if (error === "config") {
    return "Configuração de login em falta no .env."
  }

  return ""
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const search = await searchParams

  const errorMessage = getErrorMessage(search.error)
  const nextUrl = search.next || "/dashboard"

  return (
    <main className="min-h-screen bg-zinc-950 text-white">
      <section className="mx-auto flex min-h-screen max-w-md items-center px-6 py-10">
        <div className="w-full rounded-[2rem] border border-zinc-800 bg-gradient-to-br from-zinc-900 via-zinc-950 to-black p-8 shadow-2xl">
          <p className="text-sm uppercase tracking-[0.3em] text-zinc-500">
            Acesso restrito
          </p>

          <h1 className="mt-4 text-4xl font-bold tracking-tight">
            Entrar no painel
          </h1>

          <p className="mt-4 text-sm text-zinc-400">
            Informe a senha administrativa para aceder ao painel profissional.
          </p>

          {errorMessage && (
            <div className="mt-6 rounded-2xl border border-red-900/70 bg-red-950/30 px-4 py-3 text-sm font-medium text-red-300">
              {errorMessage}
            </div>
          )}

          <form action={loginAction} className="mt-8 grid gap-4">
            <input type="hidden" name="next" value={nextUrl} />

            <div>
              <label className="text-sm font-medium text-zinc-300">
                Senha do painel
              </label>

              <input
                type="password"
                name="password"
                required
                autoFocus
                placeholder="Digite a senha"
                className="mt-2 w-full rounded-2xl border border-zinc-800 bg-zinc-950 px-4 py-4 text-white outline-none transition placeholder:text-zinc-700 focus:border-white"
              />
            </div>

            <button
              type="submit"
              className="rounded-2xl border border-white bg-white px-5 py-4 font-semibold text-zinc-950 transition hover:bg-zinc-200"
            >
              Entrar
            </button>
          </form>

          <div className="mt-6 rounded-3xl border border-zinc-800 bg-black p-5">
            <p className="text-xs text-zinc-600">
              Este login é temporário para proteger o painel enquanto ainda não
              existe sistema completo de utilizadores.
            </p>
          </div>
        </div>
      </section>
    </main>
  )
}