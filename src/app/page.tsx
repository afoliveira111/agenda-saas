import Link from "next/link"

const features = [
  {
    title: "Agendamento online",
    description:
      "Clientes escolhem serviços, data e horário disponível sem precisar trocar mensagens.",
  },
  {
    title: "Painel administrativo",
    description:
      "Controle marcações, clientes, serviços, horários, bloqueios e dados do negócio.",
  },
  {
    title: "E-mails automáticos",
    description:
      "O cliente recebe confirmação e o negócio recebe aviso de nova marcação.",
  },
  {
    title: "Lembretes programados",
    description:
      "Cron automático para enviar lembretes antes das marcações confirmadas.",
  },
]

const steps = [
  "Cadastre o negócio",
  "Configure serviços e horários",
  "Compartilhe o link público",
  "Receba marcações no painel",
]

export default function Home() {
  const demoSlug = process.env.DASHBOARD_BUSINESS_SLUG || "demo"

  return (
    <main className="min-h-screen bg-zinc-950 text-white">
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.16),_transparent_35%),radial-gradient(circle_at_bottom_right,_rgba(161,161,170,0.18),_transparent_30%)]" />

        <div className="relative mx-auto flex min-h-screen max-w-7xl flex-col px-6 py-8">
          <header className="flex items-center justify-between">
            <Link href="/" className="text-lg font-bold tracking-tight">
              Agenda SaaS
            </Link>

            <nav className="flex items-center gap-3 text-sm">
              <Link
                href={`/book/${demoSlug}`}
                className="hidden rounded-full border border-white/15 px-4 py-2 text-zinc-300 transition hover:border-white/40 hover:text-white sm:block"
              >
                Ver demonstração
              </Link>

              <Link
                href="/login"
                className="rounded-full bg-white px-4 py-2 font-semibold text-zinc-950 transition hover:bg-zinc-200"
              >
                Entrar no painel
              </Link>
            </nav>
          </header>

          <div className="grid flex-1 items-center gap-12 py-20 lg:grid-cols-[1.05fr_0.95fr]">
            <div>
              <div className="inline-flex rounded-full border border-white/15 bg-white/5 px-4 py-2 text-xs font-semibold uppercase tracking-[0.25em] text-zinc-300">
                Sistema de marcações online
              </div>

              <h1 className="mt-8 max-w-4xl text-5xl font-black tracking-tight text-white sm:text-6xl lg:text-7xl">
                Agendamentos simples para pequenos negócios.
              </h1>

              <p className="mt-6 max-w-2xl text-lg leading-8 text-zinc-300">
                Uma plataforma para salões, clínicas, estética, unhas,
                sobrancelhas e prestadores de serviço gerirem marcações,
                clientes, horários e lembretes num único lugar.
              </p>

              <div className="mt-10 flex flex-col gap-4 sm:flex-row">
                <Link
                  href={`/book/${demoSlug}`}
                  className="rounded-2xl bg-white px-6 py-4 text-center font-bold text-zinc-950 transition hover:bg-zinc-200"
                >
                  Ver página de agendamento
                </Link>

                <Link
                  href="/dashboard"
                  className="rounded-2xl border border-white/15 px-6 py-4 text-center font-bold text-white transition hover:border-white/40 hover:bg-white/5"
                >
                  Abrir painel
                </Link>
              </div>

              <div className="mt-12 grid max-w-2xl grid-cols-3 gap-3">
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <strong className="text-2xl">24h</strong>
                  <p className="mt-1 text-xs text-zinc-400">
                    marcações online
                  </p>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <strong className="text-2xl">100%</strong>
                  <p className="mt-1 text-xs text-zinc-400">
                    responsivo
                  </p>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <strong className="text-2xl">Auto</strong>
                  <p className="mt-1 text-xs text-zinc-400">
                    lembretes
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-[2rem] border border-white/15 bg-white/[0.06] p-4 shadow-2xl shadow-black/40 backdrop-blur">
              <div className="rounded-[1.5rem] border border-white/10 bg-zinc-950 p-5">
                <div className="flex items-center justify-between border-b border-white/10 pb-5">
                  <div>
                    <p className="text-xs uppercase tracking-[0.25em] text-zinc-500">
                      Painel
                    </p>
                    <h2 className="mt-2 text-xl font-bold">
                      Visão geral
                    </h2>
                  </div>

                  <span className="rounded-full bg-emerald-400/10 px-3 py-1 text-xs font-semibold text-emerald-300">
                    Online
                  </span>
                </div>

                <div className="mt-5 grid grid-cols-2 gap-3">
                  <div className="rounded-2xl bg-white p-4 text-zinc-950">
                    <p className="text-xs font-semibold text-zinc-500">
                      Próximas marcações
                    </p>
                    <strong className="mt-3 block text-3xl">12</strong>
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <p className="text-xs font-semibold text-zinc-400">
                      Clientes
                    </p>
                    <strong className="mt-3 block text-3xl">48</strong>
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <p className="text-xs font-semibold text-zinc-400">
                      Serviços
                    </p>
                    <strong className="mt-3 block text-3xl">8</strong>
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <p className="text-xs font-semibold text-zinc-400">
                      Lembretes
                    </p>
                    <strong className="mt-3 block text-3xl">Auto</strong>
                  </div>
                </div>

                <div className="mt-5 rounded-2xl border border-white/10 bg-white/5 p-4">
                  <p className="text-sm font-semibold">
                    Próxima marcação
                  </p>
                  <div className="mt-4 flex items-center justify-between rounded-xl bg-zinc-900 px-4 py-3 text-sm">
                    <span>Manicure Verniz Gel</span>
                    <span className="text-zinc-400">Hoje, 14:30</span>
                  </div>
                  <div className="mt-3 flex items-center justify-between rounded-xl bg-zinc-900 px-4 py-3 text-sm">
                    <span>Design de Sobrancelhas</span>
                    <span className="text-zinc-400">Amanhã, 10:00</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-t border-white/10 bg-zinc-950 px-6 py-20">
        <div className="mx-auto max-w-7xl">
          <div className="max-w-2xl">
            <p className="text-xs font-bold uppercase tracking-[0.3em] text-zinc-500">
              Funcionalidades
            </p>
            <h2 className="mt-4 text-3xl font-black sm:text-4xl">
              Tudo que um pequeno negócio precisa para começar.
            </h2>
          </div>

          <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="rounded-[1.5rem] border border-white/10 bg-white/[0.04] p-6"
              >
                <h3 className="text-lg font-bold">{feature.title}</h3>
                <p className="mt-3 text-sm leading-6 text-zinc-400">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-white/10 bg-white px-6 py-20 text-zinc-950">
        <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[0.8fr_1.2fr]">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.3em] text-zinc-500">
              Como funciona
            </p>
            <h2 className="mt-4 text-3xl font-black sm:text-4xl">
              Do cadastro ao agendamento em poucos passos.
            </h2>
            <p className="mt-5 text-zinc-600">
              O negócio configura a agenda uma vez e depois compartilha o link
              público com os clientes.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {steps.map((step, index) => (
              <div
                key={step}
                className="rounded-[1.5rem] border border-zinc-200 bg-zinc-50 p-6"
              >
                <span className="flex size-10 items-center justify-center rounded-full bg-zinc-950 text-sm font-black text-white">
                  {index + 1}
                </span>
                <h3 className="mt-5 text-xl font-bold">{step}</h3>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-zinc-950 px-6 py-20 text-white">
        <div className="mx-auto max-w-4xl rounded-[2rem] border border-white/10 bg-white/[0.05] p-8 text-center sm:p-12">
          <p className="text-xs font-bold uppercase tracking-[0.3em] text-zinc-500">
            Demonstração
          </p>
          <h2 className="mt-4 text-3xl font-black sm:text-4xl">
            Teste agora a experiência de marcação.
          </h2>
          <p className="mx-auto mt-5 max-w-2xl text-zinc-400">
            A página pública simula a visão do cliente. O painel mostra a visão
            do negócio.
          </p>

          <div className="mt-8 flex flex-col justify-center gap-4 sm:flex-row">
            <Link
              href={`/book/${demoSlug}`}
              className="rounded-2xl bg-white px-6 py-4 font-bold text-zinc-950 transition hover:bg-zinc-200"
            >
              Abrir demonstração
            </Link>

            <Link
              href="/login"
              className="rounded-2xl border border-white/15 px-6 py-4 font-bold transition hover:border-white/40 hover:bg-white/5"
            >
              Entrar no painel
            </Link>
          </div>
        </div>
      </section>
    </main>
  )
}