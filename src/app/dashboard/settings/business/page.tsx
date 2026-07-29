import Link from "next/link"
import { notFound } from "next/navigation"
import {
  normalizeBusinessTheme,
} from "@/lib/business-theme"
import {
  formatBusinessTheme,
  getDashboardThemeClasses,
} from "@/lib/dashboard-theme"
import { getCurrentBusinessSlug } from "@/lib/current-business"
import { prisma } from "@/lib/prisma"
import { updateBusinessSettingsAction } from "./actions"
import { BusinessThemeSelector } from "./BusinessThemeSelector"

type BusinessSettingsPageProps = {
  searchParams: Promise<{
    error?: string
    success?: string
  }>
}

function formatPhoneForInput(phone: string | null) {
  if (!phone) {
    return ""
  }

  const digitsOnly = phone.replace(/\D/g, "")

  if (!digitsOnly) {
    return ""
  }

  return `+${digitsOnly}`
}

function getInputClasses(theme: string) {
  if (theme === "WHITE") {
    return "mt-2 w-full rounded-2xl border border-zinc-300 bg-white px-4 py-4 text-zinc-950 outline-none transition placeholder:text-zinc-400 focus:border-zinc-950"
  }

  if (theme === "NUDE") {
    return "mt-2 w-full rounded-2xl border border-[#d8beb0] bg-white px-4 py-4 text-[#2b211c] outline-none transition placeholder:text-[#9d8576] focus:border-[#2b211c]"
  }

  return "mt-2 w-full rounded-2xl border border-zinc-800 bg-zinc-950 px-4 py-4 text-white outline-none transition placeholder:text-zinc-700 focus:border-white"
}

function getFeedbackClasses(type: "error" | "success") {
  if (type === "error") {
    return "border-red-300 bg-red-50 text-red-800"
  }

  return "border-emerald-300 bg-emerald-50 text-emerald-800"
}

export default async function BusinessSettingsPage({
  searchParams,
}: BusinessSettingsPageProps) {
  const { error, success } = await searchParams

  const business = await prisma.business.findUnique({
    where: {
      slug: await getCurrentBusinessSlug(),
    },
  })

  if (!business) {
    notFound()
  }

  const currentTheme = normalizeBusinessTheme(business.theme)
  const theme = getDashboardThemeClasses(business.theme)
  const inputClasses = getInputClasses(currentTheme)

  return (
    <main className={`min-h-screen ${theme.page}`}>
      <section className="mx-auto max-w-6xl px-6 py-10">
        <div className={`rounded-[2rem] border p-8 shadow-2xl ${theme.hero}`}>
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className={`text-sm uppercase tracking-[0.3em] ${theme.subtle}`}>
                Configurações
              </p>

              <h1
                className={`mt-3 text-4xl font-bold tracking-tight md:text-5xl ${theme.title}`}
              >
                Dados do negócio
              </h1>

              <p className={`mt-4 max-w-2xl ${theme.muted}`}>
                Edite as informações públicas, escolha o tema visual e defina o
                e-mail interno que recebe avisos de novas marcações.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Link
                href="/dashboard"
                className={`rounded-2xl border px-5 py-3 text-center font-semibold transition ${theme.secondaryButton}`}
              >
                Voltar ao painel
              </Link>

              <Link
                href={`/book/${business.slug}`}
                className={`rounded-2xl border px-5 py-3 text-center font-semibold transition ${theme.primaryButton}`}
              >
                Abrir página pública
              </Link>
            </div>
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-4">
            <div className={`rounded-3xl border p-5 ${theme.card}`}>
              <p className={`text-sm ${theme.muted}`}>Nome atual</p>
              <p className={`mt-2 truncate text-lg font-semibold ${theme.title}`}>
                {business.name}
              </p>
            </div>

            <div className={`rounded-3xl border p-5 ${theme.card}`}>
              <p className={`text-sm ${theme.muted}`}>Link público</p>
              <p className={`mt-2 truncate text-lg font-semibold ${theme.title}`}>
                /book/{business.slug}
              </p>
            </div>

            <div className={`rounded-3xl border p-5 ${theme.card}`}>
              <p className={`text-sm ${theme.muted}`}>Tema atual</p>
              <p className={`mt-2 truncate text-lg font-semibold ${theme.title}`}>
                {formatBusinessTheme(business.theme)}
              </p>
            </div>

            <div className={`rounded-3xl border p-5 ${theme.card}`}>
              <p className={`text-sm ${theme.muted}`}>E-mail de notificação</p>
              <p className={`mt-2 truncate text-lg font-semibold ${theme.title}`}>
                {business.notificationEmail || "Não definido"}
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

        <div className={`mt-8 rounded-[2rem] border p-6 shadow-2xl ${theme.panel}`}>
          <div className={`border-b pb-6 ${theme.line}`}>
            <p className={`text-xs font-semibold uppercase tracking-[0.3em] ${theme.subtle}`}>
              Identidade
            </p>

            <h2 className={`mt-3 text-2xl font-bold ${theme.title}`}>
              Informações públicas e internas
            </h2>

            <p className={`mt-3 max-w-2xl text-sm ${theme.muted}`}>
              O e-mail público aparece como contacto do negócio. O e-mail de
              notificação recebe os avisos internos de novas marcações.
            </p>
          </div>

          <form
            action={updateBusinessSettingsAction}
            className="mt-6 grid gap-5"
          >
            <div>
              <label className={`text-sm font-medium ${theme.title}`}>
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
                className={inputClasses}
              />
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <div>
                <label className={`text-sm font-medium ${theme.title}`}>
                  Telefone / WhatsApp
                </label>

                <input
                  type="tel"
                  name="phone"
                  minLength={7}
                  maxLength={20}
                  pattern="[\+0-9\s().-]{7,20}"
                  title="Informe um telefone válido. Exemplo: +351 912 345 678"
                  defaultValue={formatPhoneForInput(business.phone)}
                  placeholder="+351 912 345 678"
                  className={inputClasses}
                />

                <p className={`mt-2 text-xs ${theme.subtle}`}>
                  Pode escrever com ou sem +. O sistema guarda corretamente.
                </p>
              </div>

              <div>
                <label className={`text-sm font-medium ${theme.title}`}>
                  E-mail público
                </label>

                <input
                  type="email"
                  name="email"
                  maxLength={120}
                  defaultValue={business.email ?? ""}
                  placeholder="contacto@negocio.pt"
                  className={inputClasses}
                />

                <p className={`mt-2 text-xs ${theme.subtle}`}>
                  Pode aparecer como contacto público do negócio.
                </p>
              </div>
            </div>

            <div>
              <label className={`text-sm font-medium ${theme.title}`}>
                E-mail de notificação
              </label>

              <input
                type="email"
                name="notificationEmail"
                maxLength={120}
                defaultValue={business.notificationEmail ?? ""}
                placeholder="agenda@negocio.pt"
                className={inputClasses}
              />

              <p className={`mt-2 text-xs ${theme.subtle}`}>
                Este e-mail recebe avisos internos quando um cliente faz uma nova
                marcação, reagendamento ou lembrete.
              </p>
            </div>

            <div>
              <label className={`text-sm font-medium ${theme.title}`}>
                Morada
              </label>

              <input
                type="text"
                name="address"
                maxLength={160}
                defaultValue={business.address ?? ""}
                placeholder="Rua, cidade, país"
                className={inputClasses}
              />
            </div>

            <div>
              <label className={`text-sm font-medium ${theme.title}`}>
                Descrição
              </label>

              <textarea
                name="description"
                rows={5}
                maxLength={300}
                defaultValue={business.description ?? ""}
                placeholder="Descreva brevemente o negócio e os serviços oferecidos."
                className={`${inputClasses} resize-none`}
              />
            </div>

            <div className={`rounded-3xl border p-5 ${theme.card}`}>
              <div>
                <p className={`text-sm font-semibold ${theme.title}`}>
                  Tema do negócio
                </p>

                <p className={`mt-2 text-sm ${theme.muted}`}>
                  Este tema será usado na página pública, na página de sucesso e
                  no painel deste negócio.
                </p>
              </div>

              <BusinessThemeSelector currentTheme={currentTheme} />
            </div>

            <div className={`rounded-3xl border p-5 ${theme.card}`}>
              <p className={`text-sm ${theme.muted}`}>
                O link público deste negócio é{" "}
                <span className={`font-semibold ${theme.title}`}>
                  /book/{business.slug}
                </span>
                . Compartilhe este link com os clientes para receber marcações
                online.
              </p>
            </div>

            <button
              type="submit"
              className={`rounded-2xl border px-5 py-4 font-semibold transition ${theme.primaryButton}`}
            >
              Guardar alterações
            </button>
          </form>
        </div>
      </section>
    </main>
  )
}