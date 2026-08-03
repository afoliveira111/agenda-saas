import Link from "next/link"

const features = [
  {
    title: "Clientes",
    description: "Organize clientes e histórico num só lugar.",
  },
  {
    title: "Agendamento 24h",
    description: "Clientes marcam quando quiserem.",
  },
  {
    title: "E-mails automáticos",
    description: "Menos falhas e esquecimentos.",
  },
  {
    title: "3 temas visuais",
    description: "Branco, nude e premium.",
  },
]

const businessTypes = [
  "Salões de beleza",
  "Clínicas estéticas",
  "Unhas e sobrancelhas",
  "Barbearias",
  "Massagens e terapias",
  "Profissionais independentes",
]

const steps = [
  {
    title: "Configure o negócio",
    description:
      "Adicione nome, morada, telefone, e-mail, serviços, preços e duração.",
  },
  {
    title: "Defina a agenda",
    description:
      "Escolha os dias e horários de atendimento e bloqueie datas quando necessário.",
  },
  {
    title: "Compartilhe o link",
    description:
      "O cliente escolhe serviço, data e horário diretamente pela página pública.",
  },
]

function BrandMark() {
  return (
    <div className="flex items-center gap-3">
      <div className="flex size-9 items-center justify-center rounded-full border border-[#d7b98a]/40 bg-[#d7b98a]/10 text-xs font-black tracking-[-0.08em] text-[#f0dcc1] sm:size-10 sm:text-sm">
        MF
      </div>

      <span className="text-xl font-black tracking-tight text-white sm:text-2xl">
        MarcaFlow
      </span>
    </div>
  )
}

function DashboardPreview() {
  return (
    <div className="relative">
      <div className="absolute -inset-10 rounded-full bg-[#d7b98a]/20 blur-3xl" />

      <div className="relative rounded-[2rem] border border-[#d7b98a]/35 bg-black/55 p-3 shadow-2xl shadow-black/70 backdrop-blur sm:rounded-[2.5rem] sm:p-4">
        <div className="rounded-[1.6rem] border border-white/10 bg-[#101011]/95 p-5 sm:rounded-[2rem] sm:p-7">
          <div className="flex items-start justify-between border-b border-white/10 pb-6">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.35em] text-[#d7b98a]/70">
                Painel
              </p>

              <h2 className="mt-2 text-3xl font-black text-white">
                Visão geral
              </h2>
            </div>

            <span className="rounded-full border border-emerald-400/15 bg-emerald-400/10 px-4 py-2 text-xs font-bold text-emerald-300">
              Online
            </span>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-3 sm:mt-7 sm:gap-4">
            <div className="rounded-[1.2rem] border border-[#d7b98a]/35 bg-gradient-to-br from-[#3b2f20] to-[#181818] p-4 shadow-[0_0_35px_rgba(215,185,138,0.13)] sm:rounded-2xl sm:p-5">
              <p className="text-sm font-semibold text-zinc-300">
                Próximas marcações
              </p>

              <strong className="mt-3 block text-3xl text-white sm:text-4xl">12</strong>
            </div>

            <div className="rounded-[1.2rem] border border-white/10 bg-white/[0.04] p-4 sm:rounded-2xl sm:p-5">
              <p className="text-sm font-semibold text-zinc-400">Clientes</p>

              <strong className="mt-3 block text-3xl text-white sm:text-4xl">48</strong>
            </div>

            <div className="rounded-[1.2rem] border border-white/10 bg-white/[0.04] p-4 sm:rounded-2xl sm:p-5">
              <p className="text-sm font-semibold text-zinc-400">Serviços</p>

              <strong className="mt-3 block text-3xl text-white sm:text-4xl">8</strong>
            </div>

            <div className="rounded-[1.2rem] border border-white/10 bg-white/[0.04] p-4 sm:rounded-2xl sm:p-5">
              <p className="text-sm font-semibold text-zinc-400">Lembretes</p>

              <strong className="mt-3 block text-3xl text-white sm:text-4xl">Auto</strong>
            </div>
          </div>

          <div className="mt-5 rounded-2xl border border-white/10 bg-white/[0.04] p-5">
            <div className="flex items-center justify-between">
              <p className="text-sm font-bold text-white">Próxima marcação</p>

              <span className="text-xs text-zinc-500">Ver todas</span>
            </div>

            <div className="mt-4 grid gap-3 text-sm">
              <div className="flex items-center justify-between gap-4 rounded-xl bg-black/50 px-4 py-3">
                <span className="font-medium text-white">
                  Manicure Verniz Gel
                </span>
                <span className="text-zinc-400">Hoje, 14:30</span>
              </div>

              <div className="flex items-center justify-between gap-4 rounded-xl bg-black/50 px-4 py-3">
                <span className="font-medium text-white">
                  Design de Sobrancelhas
                </span>
                <span className="text-zinc-400">Amanhã, 10:00</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function FeatureCard({
  index,
  title,
  description,
}: {
  index: number
  title: string
  description: string
}) {
  return (
    <div className="group rounded-[1.5rem] border border-[#d7b98a]/20 bg-black/30 p-5 backdrop-blur transition hover:border-[#d7b98a]/50 hover:bg-[#d7b98a]/[0.04] sm:rounded-[1.7rem] sm:p-6">
      <div className="flex items-start justify-between gap-5">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.28em] text-[#d7b98a]/70">
            {String(index).padStart(2, "0")}
          </p>

          <h3 className="mt-4 text-xl font-black text-white">{title}</h3>

          <p className="mt-3 text-sm leading-6 text-zinc-400">
            {description}
          </p>
        </div>

        <div className="mt-1 h-px w-12 bg-[#d7b98a]/40 transition group-hover:w-16" />
      </div>
    </div>
  )
}

export default function Home() {
  const demoSlug = process.env.DASHBOARD_BUSINESS_SLUG || "demo"

  return (
    <main className="min-h-screen bg-[#070707] text-white">
      <section className="relative min-h-screen overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_72%_42%,rgba(215,185,138,0.20),transparent_28%),radial-gradient(circle_at_20%_65%,rgba(215,185,138,0.08),transparent_28%),linear-gradient(180deg,#090909_0%,#070707_100%)]" />

        <div className="absolute left-[-18rem] top-48 h-[45rem] w-[45rem] rounded-full border border-[#d7b98a]/10" />
        <div className="absolute left-[-14rem] top-56 h-[36rem] w-[36rem] rounded-full border border-[#d7b98a]/10" />
        <div className="absolute right-[-12rem] top-40 h-[40rem] w-[40rem] rounded-full border border-[#d7b98a]/10" />

        <div className="relative mx-auto flex min-h-screen max-w-7xl flex-col px-5 py-6 sm:px-6 sm:py-8">
          <header className="flex items-center justify-between border-b border-white/10 pb-6 sm:pb-8">
            <Link href="/" aria-label="MarcaFlow">
              <BrandMark />
            </Link>

            <nav className="hidden items-center gap-10 text-base text-zinc-300 md:flex">
              <Link href="#recursos" className="transition hover:text-white">
                Recursos
              </Link>

              <Link href="#para-quem" className="transition hover:text-white">
                Para quem é
              </Link>

              <Link href={`/book/${demoSlug}`} className="transition hover:text-white">
                Demo real
              </Link>
            </nav>

            <Link
              href="/login"
              className="rounded-full border border-[#d7b98a] px-5 py-2.5 text-sm font-black text-[#f0dcc1] shadow-[0_0_25px_rgba(215,185,138,0.12)] transition hover:bg-[#f0dcc1] hover:text-zinc-950 sm:px-7 sm:py-3 sm:text-base"
            >
              Entrar
            </Link>
          </header>

          <div className="grid flex-1 items-center gap-10 py-10 sm:py-14 lg:grid-cols-[0.9fr_1.1fr] lg:py-16">
            <div>
              <div className="inline-flex items-center gap-3 rounded-full border border-[#d7b98a]/35 bg-black/30 px-4 py-3 text-[10px] font-bold uppercase tracking-[0.26em] text-[#f0dcc1] shadow-[0_0_28px_rgba(215,185,138,0.10)] sm:px-5 sm:text-xs sm:tracking-[0.34em]">
                Sistema de marcações online
                <span className="size-1.5 rounded-full bg-[#f0dcc1]" />
              </div>

              <h1 className="mt-6 max-w-4xl text-[3.15rem] font-black leading-[0.96] tracking-[-0.06em] text-white sm:mt-7 sm:text-6xl lg:text-7xl">
                A experiência que seu cliente merece.
                <span className="block bg-gradient-to-r from-[#f0dcc1] to-[#b98e52] bg-clip-text text-transparent">
                  O controle que seu negócio precisa.
                </span>
              </h1>

              <p className="mt-6 max-w-2xl text-base leading-8 text-zinc-300 sm:mt-7 sm:text-lg">
                O MarcaFlow ajuda salões, clínicas e pequenos negócios a receber marcações online,
                organizar clientes e reduzir o tempo gasto com mensagens manuais.
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:mt-10 sm:flex-row sm:items-center sm:gap-4">
                <Link
                  href={`/book/${demoSlug}`}
                  className="rounded-full bg-gradient-to-r from-[#f5dfbd] to-[#d7b98a] px-7 py-4 text-center font-black text-zinc-950 shadow-[0_0_35px_rgba(215,185,138,0.20)] transition hover:scale-[1.01] sm:px-8"
                >
                  Ver demonstração
                </Link>

                <Link
                  href="/login"
                  className="rounded-full border border-[#d7b98a]/35 px-7 py-4 text-center font-black text-[#f0dcc1] transition hover:border-[#d7b98a] hover:bg-[#d7b98a]/10 sm:px-8"
                >
                  Entrar
                </Link>
              </div>
            </div>

            <DashboardPreview />
          </div>

          <div className="grid gap-3 border-t border-[#d7b98a]/20 pt-6 sm:gap-4 sm:pt-7 md:grid-cols-4">
            {features.map((feature, index) => (
              <FeatureCard
                key={feature.title}
                index={index + 1}
                title={feature.title}
                description={feature.description}
              />
            ))}
          </div>
        </div>
      </section>

      <section
        id="recursos"
        className="border-t border-white/10 bg-[#0d0d0e] px-6 py-20"
      >
        <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[0.85fr_1.15fr] lg:items-center">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.3em] text-[#d7b98a]">
              Recursos
            </p>

            <h2 className="mt-4 text-3xl font-black tracking-tight sm:text-5xl">
              O essencial para transformar mensagens em marcações organizadas.
            </h2>

            <p className="mt-5 text-lg leading-8 text-zinc-400">
              Uma estrutura simples para o negócio vender melhor, atender melhor
              e perder menos tempo com conversas repetidas.
            </p>
          </div>

          <div className="rounded-[2rem] border border-[#d7b98a]/20 bg-black/30 p-6">
            <div className="grid gap-5">
              <div className="border-b border-white/10 pb-5">
                <p className="text-sm font-bold uppercase tracking-[0.25em] text-[#d7b98a]/70">
                  Agenda
                </p>

                <p className="mt-2 text-lg font-semibold text-white">
                  Horários, bloqueios e marcações organizados num painel claro.
                </p>
              </div>

              <div className="border-b border-white/10 pb-5">
                <p className="text-sm font-bold uppercase tracking-[0.25em] text-[#d7b98a]/70">
                  Cliente
                </p>

                <p className="mt-2 text-lg font-semibold text-white">
                  Página pública para escolher serviço, data, horário e confirmar.
                </p>
              </div>

              <div>
                <p className="text-sm font-bold uppercase tracking-[0.25em] text-[#d7b98a]/70">
                  Automação
                </p>

                <p className="mt-2 text-lg font-semibold text-white">
                  Confirmações e avisos por e-mail para reduzir falhas manuais.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section
        id="para-quem"
        className="border-t border-white/10 bg-[#070707] px-6 py-20"
      >
        <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:items-start">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.3em] text-[#d7b98a]">
              Para quem é
            </p>

            <h2 className="mt-4 text-3xl font-black tracking-tight sm:text-5xl">
              Feito para negócios que vivem de agenda.
            </h2>

            <p className="mt-5 text-lg leading-8 text-zinc-400">
              Ideal para quem precisa mostrar serviços, evitar horários
              duplicados e dar uma experiência mais profissional ao cliente.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {businessTypes.map((type) => (
              <div
                key={type}
                className="rounded-[1.5rem] border border-white/10 bg-white/[0.04] p-5"
              >
                <p className="font-bold text-white">{type}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-white/10 bg-[#0d0d0e] px-6 py-20">
        <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[0.8fr_1.2fr]">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.3em] text-[#d7b98a]">
              Como funciona
            </p>

            <h2 className="mt-4 text-3xl font-black tracking-tight sm:text-5xl">
              Do cadastro ao agendamento em poucos passos.
            </h2>

            <p className="mt-5 text-lg leading-8 text-zinc-400">
              O negócio configura a agenda uma vez e compartilha o link público
              com os clientes.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            {steps.map((step, index) => (
              <div
                key={step.title}
                className="rounded-[1.7rem] border border-white/10 bg-white/[0.04] p-6"
              >
                <p className="text-xs font-bold uppercase tracking-[0.28em] text-[#d7b98a]/70">
                  Etapa {index + 1}
                </p>

                <h3 className="mt-5 text-xl font-bold text-white">
                  {step.title}
                </h3>

                <p className="mt-3 text-sm leading-6 text-zinc-400">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-white/10 bg-[#070707] px-6 py-20">
        <div className="mx-auto max-w-5xl rounded-[2.2rem] border border-[#d7b98a]/20 bg-[#d7b98a]/[0.06] p-8 text-center shadow-2xl sm:p-12">
          <p className="text-xs font-bold uppercase tracking-[0.3em] text-[#d7b98a]">
            Demo real
          </p>

          <h2 className="mt-4 text-3xl font-black tracking-tight sm:text-5xl">
            Veja como uma página de marcação pode ficar para um negócio real.
          </h2>

          <p className="mx-auto mt-5 max-w-2xl text-zinc-400">
            Explore os modelos e veja o fluxo de marcação funcionando do lado do
            cliente.
          </p>

          <div className="mt-8 flex flex-col justify-center gap-4 sm:flex-row">
            <Link
              href={`/book/${demoSlug}`}
              className="rounded-full bg-[#f0dcc1] px-7 py-4 font-black text-zinc-950 transition hover:bg-white"
            >
              Ver demonstração
            </Link>

            <Link
              href={`/book/${demoSlug}`}
              className="rounded-full border border-white/15 px-7 py-4 font-bold transition hover:border-[#d7b98a]/60 hover:bg-white/5"
            >
              Abrir demo real
            </Link>

            <Link
              href="/login"
              className="rounded-full border border-[#d7b98a]/50 px-7 py-4 font-bold text-[#f0dcc1] transition hover:bg-[#d7b98a]/10"
            >
              Entrar no painel
            </Link>
          </div>
        </div>
      </section>

      <footer className="border-t border-white/10 bg-[#070707] px-6 py-8 text-center text-sm text-zinc-600">
        <p>MarcaFlow · Sistema de marcações online</p>
      </footer>
    </main>
  )
}
