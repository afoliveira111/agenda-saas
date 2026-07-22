import Link from "next/link"
import { notFound } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { getCurrentBusinessSlug } from "@/lib/current-business"
import { updateBusinessSettingsAction } from "./actions"

type BusinessSettingsPageProps = {
  searchParams: Promise<{
    error?: string
    success?: string
  }>
}

export default async function BusinessSettingsPage({
  searchParams,
}: BusinessSettingsPageProps) {
  const { error, success } = await searchParams

  const business = await prisma.business.findUnique({
    where: {
      slug: (await getCurrentBusinessSlug()),
    },
  })

  if (!business) {
    notFound()
  }

  return (
    <main className="min-h-screen bg-zinc-950 text-white">
      <section className="mx-auto max-w-6xl px-6 py-10">
        <div className="rounded-[2rem] border border-zinc-800 bg-gradient-to-br from-zinc-900 via-zinc-950 to-black p-8 shadow-2xl">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-zinc-500">
                Configurações
              </p>

              <h1 className="mt-3 text-4xl font-bold tracking-tight text-white md:text-5xl">
                Dados do negócio
              </h1>

              <p className="mt-4 max-w-2xl text-zinc-400">
                Edite as informações públicas e o e-mail interno que recebe
                avisos de novas marcações.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Link
                href="/dashboard"
                className="rounded-2xl border border-zinc-700 px-5 py-3 text-center font-semibold text-zinc-300 transition hover:border-white hover:text-white"
              >
                Voltar ao painel
              </Link>

              <Link
                href={`/book/${business.slug}`}
                className="rounded-2xl border border-white bg-white px-5 py-3 text-center font-semibold text-zinc-950 transition hover:bg-zinc-200"
              >
                Abrir página pública
              </Link>
            </div>
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-3">
            <div className="rounded-3xl border border-zinc-800 bg-black/40 p-5">
              <p className="text-sm text-zinc-500">Nome atual</p>
              <p className="mt-2 truncate text-lg font-semibold">
                {business.name}
              </p>
            </div>

            <div className="rounded-3xl border border-zinc-800 bg-black/40 p-5">
              <p className="text-sm text-zinc-500">Link público</p>
              <p className="mt-2 truncate text-lg font-semibold">
                /book/{business.slug}
              </p>
            </div>

            <div className="rounded-3xl border border-zinc-800 bg-black/40 p-5">
              <p className="text-sm text-zinc-500">E-mail de notificação</p>
              <p className="mt-2 truncate text-lg font-semibold">
                {business.notificationEmail || "Não definido"}
              </p>
            </div>
          </div>
        </div>

        {(error || success) && (
          <div
            className={`mt-6 rounded-3xl border px-5 py-4 text-sm font-medium ${
              error
                ? "border-red-900/70 bg-red-950/30 text-red-300"
                : "border-zinc-700 bg-zinc-900 text-zinc-200"
            }`}
          >
            {error || success}
          </div>
        )}

        <div className="mt-8 rounded-[2rem] border border-zinc-800 bg-black p-6 shadow-2xl">
          <div className="border-b border-zinc-800 pb-6">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-zinc-600">
              Identidade
            </p>

            <h2 className="mt-3 text-2xl font-bold">
              Informações públicas e internas
            </h2>

            <p className="mt-3 max-w-2xl text-sm text-zinc-500">
              O e-mail público aparece como contacto do negócio. O e-mail de
              notificação recebe os avisos internos de novas marcações.
            </p>
          </div>

          <form
            action={updateBusinessSettingsAction}
            className="mt-6 grid gap-5"
          >
            <div>
              <label className="text-sm font-medium text-zinc-300">
                Nome do negócio
              </label>

              <input
                type="text"
                name="name"
                required
                minLength={2}
                maxLength={80}
                defaultValue={business.name}
                placeholder="Ex: Espaço Bella"
                className="mt-2 w-full rounded-2xl border border-zinc-800 bg-zinc-950 px-4 py-4 text-white outline-none transition placeholder:text-zinc-700 focus:border-white"
              />
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <div>
                <label className="text-sm font-medium text-zinc-300">
                  Telefone / WhatsApp
                </label>

                <input
                  type="tel"
                  name="phone"
                  minLength={7}
                  maxLength={20}
                  pattern="[\+0-9\s().-]{7,20}"
                  title="Informe um telefone válido. Exemplo: +351 912 345 678"
                  defaultValue={business.phone ? `+${business.phone}` : ""}
                  placeholder="+351 912 345 678"
                  className="mt-2 w-full rounded-2xl border border-zinc-800 bg-zinc-950 px-4 py-4 text-white outline-none transition placeholder:text-zinc-700 focus:border-white"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-zinc-300">
                  E-mail público
                </label>

                <input
                  type="email"
                  name="email"
                  maxLength={120}
                  defaultValue={business.email ?? ""}
                  placeholder="contacto@negocio.pt"
                  className="mt-2 w-full rounded-2xl border border-zinc-800 bg-zinc-950 px-4 py-4 text-white outline-none transition placeholder:text-zinc-700 focus:border-white"
                />

                <p className="mt-2 text-xs text-zinc-600">
                  Pode aparecer como contacto público do negócio.
                </p>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-zinc-300">
                E-mail de notificação
              </label>

              <input
                type="email"
                name="notificationEmail"
                maxLength={120}
                defaultValue={business.notificationEmail ?? ""}
                placeholder="agenda@negocio.pt"
                className="mt-2 w-full rounded-2xl border border-zinc-800 bg-zinc-950 px-4 py-4 text-white outline-none transition placeholder:text-zinc-700 focus:border-white"
              />

              <p className="mt-2 text-xs text-zinc-600">
                Este e-mail recebe avisos internos quando um cliente faz uma nova
                marcação.
              </p>
            </div>

            <div>
              <label className="text-sm font-medium text-zinc-300">
                Morada
              </label>

              <input
                type="text"
                name="address"
                maxLength={160}
                defaultValue={business.address ?? ""}
                placeholder="Rua, cidade, país"
                className="mt-2 w-full rounded-2xl border border-zinc-800 bg-zinc-950 px-4 py-4 text-white outline-none transition placeholder:text-zinc-700 focus:border-white"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-zinc-300">
                Descrição
              </label>

              <textarea
                name="description"
                rows={5}
                maxLength={300}
                defaultValue={business.description ?? ""}
                placeholder="Descreva brevemente o negócio e os serviços oferecidos."
                className="mt-2 w-full resize-none rounded-2xl border border-zinc-800 bg-zinc-950 px-4 py-4 text-white outline-none transition placeholder:text-zinc-700 focus:border-white"
              />
            </div>

            <div className="rounded-3xl border border-zinc-800 bg-zinc-950 p-5">
              <p className="text-sm text-zinc-500">
                Por enquanto o link público permanece fixo como{" "}
                <span className="font-semibold text-white">
                  /book/{business.slug}
                </span>
                . Quando adicionarmos multi-negócio, cada clínica terá o seu
                próprio link.
              </p>
            </div>

            <button
              type="submit"
              className="rounded-2xl border border-white bg-white px-5 py-4 font-semibold text-zinc-950 transition hover:bg-zinc-200"
            >
              Guardar alterações
            </button>
          </form>
        </div>
      </section>
    </main>
  )
}