import Link from "next/link"

const features = [
  {
    title: "Marcações online",
    description:
      "O cliente escolhe serviços, data e horário sem troca infinita de mensagens.",
  },
  {
    title: "Painel do negócio",
    description:
      "A dona acompanha marcações, clientes, serviços, horários e bloqueios num só lugar.",
  },
  {
    title: "Temas por negócio",
    description:
      "Cada negócio pode ter página e painel com visual Branco, Nude ou Premium.",
  },
  {
    title: "E-mails automáticos",
    description:
      "Confirmações, avisos internos, lembretes e reagendamentos enviados por e-mail.",
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
    title: "Crie o negócio",
    description: "Configure nome, telefone, morada, e-mail e tema visual.",
  },
  {
    title: "Adicione serviços",
    description: "Defina preço, duração e quais serviços aparecem ao cliente.",
  },
  {
    title: "Configure horários",
    description:
      "Escolha dias de atendimento e bloqueie datas quando necessário.",
  },
  {
    title: "Compartilhe o link",
    description: "O cliente marca online e o negócio recebe tudo no painel.",
  },
]

function DashboardPreview() {
  return (
    <div className="rounded-[2rem] border border-white/15 bg-white/[0.06] p-4 shadow-2xl shadow-black/40 backdrop-blur">
      <div className="rounded-[1.5rem] border border-white/10 bg-zinc-950 p-5">
        <div className="flex items-center justify-between border-b border-white/10 pb-5">
          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-zinc-500">
              Painel
            </p>

            <h2 className="mt-2 text-xl font-bold">Visão geral</h2>
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
            <p className="text-xs font-semibold text-zinc-400">Clientes</p>

            <strong className="mt-3 block text-3xl">48</strong>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <p className="text-xs font-semibold text-zinc-400">Serviços</p>

            <strong className="mt-3 block text-3xl">8</strong>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <p className="text-xs font-semibold text-zinc-400">Lembretes</p>

            <strong className="mt-3 block text-3xl">Auto</strong>
          </div>
        </div>

        <div className="mt-5 rounded-2xl border border-white/10 bg-white/5 p-4">
          <p className="text-sm font-semibold">Próxima marcação</p>

          <div className="mt-4 grid gap-3 text-sm">
            <div className="flex items-center justify-between rounded-xl bg-zinc-900 px-4 py-3">
              <span>Manicure Verniz Gel</span>
              <span className="text-zinc-400">Hoje, 14:30</span>
            </div>

            <div className="flex items-center justify-between rounded-xl bg-zinc-900 px-4 py-3">
              <span>Design de Sobrancelhas</span>
              <span className="text-zinc-400">Amanhã, 10:00</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function BookingPreview() {
  return (
    <div className="rounded-[2rem] border border-[#ead8ca] bg-[#fff8f2] p-5 text-[#2b211c] shadow-2xl">
      <div className="rounded-[1.5rem] border border-[#ead8ca] bg-[#f6eee7] p-5">
        <div className="flex items-center justify-between gap-4">
          <span className="rounded-full border border-[#d8beb0] bg-white px-3 py-1 text-xs font-semibold text-[#7a6658]">
            Nude
          </span>

          <div className="h-3 w-16 rounded-full bg-[#cdb5a6]" />
        </div>

        <div className="mt-8">
          <div className="h-4 w-28 rounded-full bg-[#cdb5a6]" />
          <div className="mt-4 h-8 w-64 max-w-full rounded-full bg-[#2b211c]" />
          <div className="mt-3 h-3 w-44 rounded-full bg-[#cdb5a6]" />
        </div>

        <div className="mt-8 grid gap-3">
          {["Maquiagem", "Cabelo", "Pestanas"].map((service) => (
            <div
              key={service}
              className="rounded-2xl border border-[#ead8ca] bg-white p-4"
            >
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-bold">{service}</p>
                  <div className="mt-2 h-2 w-24 rounded-full bg-[#cdb5a6]" />
                </div>

                <div className="h-9 w-9 rounded-full bg-[#2b211c]" />
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 h-12 rounded-2xl bg-[#2b211c]" />
      </div>
    </div>
  )
}

export default function Home() {
  const demoSlug = process.env.DASHBOARD_BUSINESS_SLUG || "demo"

  return (
    <main className="min-h-screen bg-[#0f0f11] text-white">
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.14),_transparent_34%),radial-gradient(circle_at_bottom_right,_rgba(161,161,170,0.16),_transparent_32%)]" />

        <div className="relative mx-auto flex min-h-screen max-w-7xl flex-col px-6 py-8">
          <header className="flex items-center justify-between">
            <Link href="/" className="text-xl font-black tracking-tight">
              MarcaFlow
            </Link>

            <nav className="flex items-center gap-3 text-sm">
              <Link
                href="/demos"
                className="hidden rounded-full border border-white/15 px-4 py-2 text-zinc-300 transition hover:border-white/40 hover:text-white sm:block"
              >
                Ver demonstrações
              </Link>

              <Link
                href="#pedido"
                className="rounded-full bg-white px-4 py-2 font-semibold text-zinc-950 transition hover:bg-zinc-200"
              >
                Pedir orçamento
              </Link>
            </nav>
          </header>

          <div className="grid flex-1 items-center gap-12 py-20 lg:grid-cols-[1.05fr_0.95fr]">
            <div>
              <div className="inline-flex rounded-full border border-white/15 bg-white/5 px-4 py-2 text-xs font-semibold uppercase tracking-[0.25em] text-zinc-300">
                Sistema de marcações online
              </div>

              <h1 className="mt-8 max-w-4xl text-5xl font-black tracking-tight text-white sm:text-6xl lg:text-7xl">
                Marcações online com cara profissional.
              </h1>

              <p className="mt-6 max-w-2xl text-lg leading-8 text-zinc-300">
                O MarcaFlow ajuda salões, clínicas, estética, unhas,
                sobrancelhas e pequenos negócios a receber marcações online,
                organizar clientes e reduzir mensagens manuais.
              </p>

              <div className="mt-10 flex flex-col gap-4 sm:flex-row">
                <Link
                  href="/demos"
                  className="rounded-2xl bg-white px-6 py-4 text-center font-bold text-zinc-950 transition hover:bg-zinc-200"
                >
                  Ver demonstrações
                </Link>

                <Link
                  href={`/book/${demoSlug}`}
                  className="rounded-2xl border border-white/15 px-6 py-4 text-center font-bold text-white transition hover:border-white/40 hover:bg-white/5"
                >
                  Abrir demo real
                </Link>

                <Link
                  href="#pedido"
                  className="rounded-2xl border border-white/15 px-6 py-4 text-center font-bold text-white transition hover:border-white/40 hover:bg-white/5"
                >
                  Pedir orçamento
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
                  <strong className="text-2xl">3</strong>

                  <p className="mt-1 text-xs text-zinc-400">temas visuais</p>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <strong className="text-2xl">Auto</strong>

                  <p className="mt-1 text-xs text-zinc-400">e-mails</p>
                </div>
              </div>
            </div>

            <DashboardPreview />
          </div>
        </div>
      </section>

      <section className="border-t border-white/10 bg-[#111113] px-6 py-20">
        <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.3em] text-zinc-500">
              Página pública
            </p>

            <h2 className="mt-4 text-3xl font-black sm:text-5xl">
              Uma página bonita para cada negócio.
            </h2>

            <p className="mt-5 max-w-2xl text-lg leading-8 text-zinc-400">
              Cada negócio recebe um link público próprio para clientes
              escolherem serviços, datas, horários e confirmarem a marcação.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href={`/book/${demoSlug}`}
                className="rounded-2xl border border-white bg-white px-6 py-4 text-center font-bold text-zinc-950 transition hover:bg-zinc-200"
              >
                Ver página pública
              </Link>

              <Link
                href="/demos"
                className="rounded-2xl border border-white/15 px-6 py-4 text-center font-bold text-white transition hover:border-white/40 hover:bg-white/5"
              >
                Ver modelos
              </Link>
            </div>
          </div>

          <BookingPreview />
        </div>
      </section>

      <section className="border-t border-white/10 bg-zinc-950 px-6 py-20">
        <div className="mx-auto max-w-7xl">
          <div className="max-w-2xl">
            <p className="text-xs font-bold uppercase tracking-[0.3em] text-zinc-500">
              Funcionalidades
            </p>

            <h2 className="mt-4 text-3xl font-black sm:text-4xl">
              Tudo que o negócio precisa para começar.
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
              Para quem é
            </p>

            <h2 className="mt-4 text-3xl font-black sm:text-4xl">
              Feito para pequenos negócios que vivem de horários.
            </h2>

            <p className="mt-5 text-zinc-600">
              Ideal para profissionais que precisam mostrar serviços, evitar
              horários duplicados e manter tudo organizado.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {businessTypes.map((type) => (
              <div
                key={type}
                className="rounded-[1.5rem] border border-zinc-200 bg-zinc-50 p-5"
              >
                <p className="font-bold">{type}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-zinc-200 bg-zinc-50 px-6 py-20 text-zinc-950">
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
                key={step.title}
                className="rounded-[1.5rem] border border-zinc-200 bg-white p-6"
              >
                <span className="flex size-10 items-center justify-center rounded-full bg-zinc-950 text-sm font-black text-white">
                  {index + 1}
                </span>

                <h3 className="mt-5 text-xl font-bold">{step.title}</h3>

                <p className="mt-3 text-sm leading-6 text-zinc-600">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section
        id="pedido"
        className="bg-zinc-950 px-6 py-20 text-white"
      >
        <div className="mx-auto max-w-5xl rounded-[2rem] border border-white/10 bg-white/[0.05] p-8 text-center shadow-2xl sm:p-12">
          <p className="text-xs font-bold uppercase tracking-[0.3em] text-zinc-500">
            Pedido de orçamento
          </p>

          <h2 className="mt-4 text-3xl font-black sm:text-5xl">
            Quer uma página de marcação para o teu negócio?
          </h2>

          <p className="mx-auto mt-5 max-w-2xl text-zinc-400">
            Aqui depois vamos ligar ao WhatsApp, formulário ou e-mail para
            receber interessados. Por enquanto, esta área já fica pronta para a
            venda do sistema.
          </p>

          <div className="mt-8 flex flex-col justify-center gap-4 sm:flex-row">
            <Link
              href="/demos"
              className="rounded-2xl bg-white px-6 py-4 font-bold text-zinc-950 transition hover:bg-zinc-200"
            >
              Ver demonstrações
            </Link>

            <Link
              href={`/book/${demoSlug}`}
              className="rounded-2xl border border-white/15 px-6 py-4 font-bold transition hover:border-white/40 hover:bg-white/5"
            >
              Abrir demo real
            </Link>
          </div>
        </div>
      </section>

      <footer className="border-t border-white/10 bg-zinc-950 px-6 py-8 text-center text-sm text-zinc-600">
        <p>MarcaFlow · Sistema de marcações online</p>
      </footer>
    </main>
  )
}