"use client"

import { useActionState } from "react"
import { getPublicThemeClasses } from "@/lib/business-theme"
import { createBookingAction } from "./actions"

type BookingCustomerFormProps = {
  slug: string
  serviceIds: string[]
  date: string
  time: string
  theme?: string | null
}

export function BookingCustomerForm({
  slug,
  serviceIds,
  date,
  time,
  theme: businessTheme,
}: BookingCustomerFormProps) {
  const [state, formAction, isPending] = useActionState(createBookingAction, {
    error: "",
  })

  const theme = getPublicThemeClasses(businessTheme)

  function handleNameInput(event: React.FormEvent<HTMLInputElement>) {
    event.currentTarget.value = event.currentTarget.value.replace(/[0-9]/g, "")
  }

  return (
    <form
      id="confirmacao"
      action={formAction}
      noValidate
      className={`mt-10 scroll-mt-8 rounded-[2rem] border p-6 shadow-2xl ${theme.cardStrong}`}
    >
      <input type="hidden" name="slug" value={slug} />
      <input type="hidden" name="serviceIds" value={serviceIds.join(",")} />
      <input type="hidden" name="date" value={date} />
      <input type="hidden" name="time" value={time} />

      <p className={`text-xs font-semibold uppercase tracking-[0.3em] ${theme.muted}`}>
        Passo 4
      </p>

      <h2 className="mt-3 text-2xl font-bold">Confirmar dados do cliente</h2>

      <p className={`mt-3 ${theme.muted}`}>
        Serviços selecionados para {date} às {time}.
      </p>

      {state.error && (
        <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          {state.error}
        </div>
      )}

      <div className="mt-6 grid gap-4">
        <input
          type="text"
          name="customerName"
          placeholder="Nome do cliente"
          minLength={2}
          maxLength={80}
          autoComplete="name"
          onInput={handleNameInput}
          className={`rounded-2xl border px-4 py-4 outline-none transition ${theme.input}`}
        />

        <input
          type="tel"
          name="customerPhone"
          placeholder="Telefone / WhatsApp"
          minLength={7}
          maxLength={20}
          inputMode="tel"
          autoComplete="tel"
          className={`rounded-2xl border px-4 py-4 outline-none transition ${theme.input}`}
        />

        <input
          type="text"
          name="customerEmail"
          placeholder="E-mail"
          maxLength={120}
          inputMode="email"
          autoComplete="email"
          className={`rounded-2xl border px-4 py-4 outline-none transition ${theme.input}`}
        />

        <button
          type="submit"
          disabled={isPending}
          className={`rounded-2xl px-4 py-4 font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 ${theme.primaryButton}`}
        >
          {isPending ? "A confirmar..." : "Confirmar marcação"}
        </button>
      </div>
    </form>
  )
}