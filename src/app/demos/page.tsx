import Link from "next/link"

const demoModels = [
  {
    title: "Beleza e estética",
    subtitle: "Ideal para salões, maquilhadoras, unhas, pestanas e sobrancelhas.",
    description:
      "Página elegante para apresentar serviços, preços, horários disponíveis e permitir marcações online em poucos passos.",
    themeLabel: "Tema Nude",
    href: "/book/demo",
    status: "Demo real",
    services: ["Maquiagem", "Cabelo", "Pestanas", "Unhas"],
    visual: "nude",
  },
  {
    title: "Clínicas e saúde",
    subtitle: "Para clínicas, fisioterapia, massagens, consultas e tratamentos.",
    description:
      "Organize agenda, bloqueios, horários de atendimento e confirmações automáticas para clientes.",
    themeLabel: "Tema Branco",
    href: "/book/clinica-teste",
    status: "Demo real",
    services: ["Avaliação", "Consulta", "Tratamento", "Retorno"],
    visual: "white",
  },
  {
    title: "Barbearia e atendimento rápido",
    subtitle: "Para barbearias, studios e negócios com horários curtos.",
    description:
      "Modelo simples, direto e rápido para clientes escolherem serviço, data e horário sem precisar enviar mensagem.",
    themeLabel: "Tema Premium",
    href: "#pedido",
    status: "Modelo",
    services: ["Corte", "Barba", "Combo", "Acabamento"],
    visual: "dark",
  },
]

function getVisualClasses(visual: string) {
  if (visual === "white") {
    return {
      box: "border-zinc-200 bg-white text-zinc-950",
      soft: "border-zinc-200 bg-zinc-50",
      line: "bg-zinc-300",
      strong: "bg-zinc-950",
      badge: "border-zinc-200 bg-zinc-100 text-zinc-700",
    }
  }

  if (visual === "nude") {
    return {
      box: "border-[#ead8ca] bg-[#fff8f2] text-[#2b211c]",
      soft: "border-[#ead8ca] bg-[#f6eee7]",
      line: "bg-[#cdb5a6]",
      strong: "bg-[#2b211c]",
      badge: "border-[#ead8ca] bg-white text-[#7a6658]",
    }
  }

  return {
    box: "border-zinc-800 bg-zinc-950 text-white",
    soft: "border-zinc-800 bg-black",
    line: "bg-zinc-700",
    strong: "bg-white",
    badge: "border-zinc-700 bg-zinc-900 text-zinc-300",
  }
}

function ModelPreview({
  visual,
  services,
}: {
  visual: string
  services: string[]
}) {
  const classes = getVisualClasses(visual)

  return (
    <div className={`rounded-[2rem] border p-5 ${classes.box}`}>
      <div className={`rounded-[1.5rem] border p-5 ${classes.soft}`}>
        <div className="flex items-center justify-between gap-4">
          <div className={`h-3 w-24 rounded-full ${classes.line}`} />
          <div className={`h-8 w-8 rounded-full ${classes.strong}`} />
        </div>

        <div className="mt-10">
          <div className={`h-4 w-32 rounded-full ${classes.line}`} />
          <div className={`mt-4 h-8 w-64 max-w-full rounded-full ${classes.strong}`} />
          <div className={`mt-4 h-3 w-44 rounded-full ${classes.line}`} />
        </div>

        <div className="mt-10 grid gap-3">
          {services.slice(0, 3).map((service) => (
            <div
              key={service}
              className={`rounded-2xl border p-4 ${classes.box}`}
            >
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-bold">{service}</p>
                  <div className={`mt-2 h-2 w-20 rounded-full ${classes.line}`} />
                </div>

                <div className={`h-9 w-9 rounded-full ${classes.strong}`} />
              </div>
            </div>
          ))}
        </div>

        <div className={`mt-6 h-12 rounded-2xl ${classes.strong}`} />
      </div>
    </div>
  )
}

export default function DemosPage() {
  return (
    <main className="min-h-screen bg-[#0f0f11] text-white">
      <section className="mx-auto max-w-7xl px-6 py-10">
        <div className="rounded-[2rem] border border-zinc-800 bg-[#18181b] p-8 shadow-2xl">
          <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
            <div>
              <p className="text-sm uppercase tracking-[0.35em] text-zinc-500">
                Demonstrações
              </p>

              <h1 className="mt-5 max-w-4xl text-4xl font-bold tracking-tight md:text-6xl">
                Mostra simples para vender o sistema de agendamento.
              </h1>

              <p className="mt-6 max-w-2xl text-lg leading-8 text-zinc-400">
                Esta página serve para apresentar modelos de página pública para
                salões, clínicas, barbearias e profissionais independentes.
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link
                  href="#modelos"
                  className="rounded-2xl border border-white bg-white px-5 py-4 text-center font-semibold text-zinc-950 transition hover:bg-zinc-200"
                >
                  Ver modelos
                </Link>

                <Link
                  href="#pedido"
                  className="rounded-2xl border border-zinc-700 px-5 py-4 text-center font-semibold text-zinc-300 transition hover:border-white hover:text-white"
                >
                  Pedir orçamento
                </Link>

                <Link
                  href="/"
                  className="rounded-2xl border border-zinc-700 px-5 py-4 text-center font-semibold text-zinc-300 transition hover:border-white hover:text-white"
                >
                  Voltar ao início
                </Link>
              </div>
            </div>

            <div className="rounded-[2rem] border border-zinc-800 bg-black p-5">
              <div className="rounded-[1.5rem] border border-zinc-800 bg-zinc-950 p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-zinc-600">
                  Exemplo visual
                </p>

                <div className="mt-6 grid gap-4">
                  <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-4">
                    <p className="font-bold">Página pública</p>
                    <p className="mt-2 text-sm text-zinc-500">
                      Serviços, datas, horários e confirmação.
                    </p>
                  </div>

                  <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-4">
                    <p className="font-bold">Painel do negócio</p>
                    <p className="mt-2 text-sm text-zinc-500">
                      Marcações, clientes, serviços e bloqueios.
                    </p>
                  </div>

                  <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-4">
                    <p className="font-bold">Admin da plataforma</p>
                    <p className="mt-2 text-sm text-zinc-500">
                      Gestão dos negócios e temas.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-3">
            <div className="rounded-3xl border border-zinc-800 bg-[#202024] p-5">
              <p className="text-sm text-zinc-500">Modelos principais</p>
              <p className="mt-2 text-3xl font-bold">3</p>
            </div>

            <div className="rounded-3xl border border-zinc-800 bg-[#202024] p-5">
              <p className="text-sm text-zinc-500">Temas</p>
              <p className="mt-2 text-3xl font-bold">Branco · Nude · Premium</p>
            </div>

            <div className="rounded-3xl border border-zinc-800 bg-[#202024] p-5">
              <p className="text-sm text-zinc-500">Fluxo</p>
              <p className="mt-2 text-3xl font-bold">Online</p>
            </div>
          </div>
        </div>

        <div id="modelos" className="mt-10 scroll-mt-8">
          <div className="mb-6">
            <p className="text-sm uppercase tracking-[0.35em] text-zinc-500">
              Modelos
            </p>

            <h2 className="mt-3 text-3xl font-bold tracking-tight md:text-5xl">
              Escolhe um estilo para apresentar ao cliente.
            </h2>
          </div>

          <div className="grid gap-8">
            {demoModels.map((model) => (
              <div
                key={model.title}
                className="grid gap-6 rounded-[2rem] border border-zinc-800 bg-[#18181b] p-5 shadow-2xl lg:grid-cols-[0.9fr_1.1fr] lg:p-6"
              >
                <ModelPreview visual={model.visual} services={model.services} />

                <div className="flex flex-col justify-between gap-8 p-2 lg:p-4">
                  <div>
                    <div className="flex flex-wrap gap-3">
                      <span className="rounded-full border border-zinc-700 bg-zinc-900 px-3 py-1 text-xs font-semibold text-zinc-300">
                        {model.status}
                      </span>

                      <span className="rounded-full border border-zinc-700 bg-zinc-900 px-3 py-1 text-xs font-semibold text-zinc-300">
                        {model.themeLabel}
                      </span>
                    </div>

                    <h3 className="mt-5 text-3xl font-bold tracking-tight">
                      {model.title}
                    </h3>

                    <p className="mt-3 text-lg text-zinc-300">
                      {model.subtitle}
                    </p>

                    <p className="mt-5 max-w-2xl text-base leading-7 text-zinc-500">
                      {model.description}
                    </p>

                    <div className="mt-6 flex flex-wrap gap-2">
                      {model.services.map((service) => (
                        <span
                          key={service}
                          className="rounded-full border border-zinc-800 px-3 py-2 text-sm text-zinc-400"
                        >
                          {service}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="flex flex-col gap-3 sm:flex-row">
                    <Link
                      href={model.href}
                      className="rounded-2xl border border-white bg-white px-5 py-4 text-center font-semibold text-zinc-950 transition hover:bg-zinc-200"
                    >
                      {model.status === "Demo real"
                        ? "Abrir demonstração"
                        : "Quero este modelo"}
                    </Link>

                    <Link
                      href="#pedido"
                      className="rounded-2xl border border-zinc-700 px-5 py-4 text-center font-semibold text-zinc-300 transition hover:border-white hover:text-white"
                    >
                      Pedir orçamento
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div
          id="pedido"
          className="mt-10 scroll-mt-8 rounded-[2rem] border border-zinc-800 bg-[#18181b] p-8 shadow-2xl"
        >
          <div className="grid gap-8 lg:grid-cols-[1fr_360px] lg:items-center">
            <div>
              <p className="text-sm uppercase tracking-[0.35em] text-zinc-500">
                Pedido
              </p>

              <h2 className="mt-4 text-3xl font-bold tracking-tight md:text-5xl">
                Esta área depois vira captação de clientes.
              </h2>

              <p className="mt-5 max-w-2xl text-lg leading-8 text-zinc-400">
                Podemos ligar isto a um botão de WhatsApp, formulário de pedido,
                e-mail ou página de planos. Por agora fica como estrutura visual
                para mostrar a ideia.
              </p>
            </div>

            <div className="rounded-[1.7rem] border border-zinc-800 bg-[#202024] p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-zinc-600">
                Próximo ajuste
              </p>

              <h3 className="mt-3 text-2xl font-bold">
                Ligar ao WhatsApp
              </h3>

              <p className="mt-3 text-sm leading-6 text-zinc-500">
                Depois colocamos aqui o teu contacto ou um formulário para
                receber interessados.
              </p>

              <Link
                href="/admin"
                className="mt-5 block rounded-2xl border border-white bg-white px-5 py-4 text-center font-semibold text-zinc-950 transition hover:bg-zinc-200"
              >
                Ir para admin
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}