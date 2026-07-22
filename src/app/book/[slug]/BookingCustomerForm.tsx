"use client"

import { useActionState } from "react"
import { createBookingAction } from "./actions"

type BookingCustomerFormProps = {
  slug: string
  serviceIds: string[]
  date: string
  time: string
}

export function BookingCustomerForm({
  slug,
  serviceIds,
  date,
  time,
}: BookingCustomerFormProps) {
  const [state, formAction, isPending] = useActionState(createBookingAction, {
    error: "",
  })

  function handleNameInput(event: React.FormEvent<HTMLInputElement>) {
    event.currentTarget.value = event.currentTarget.value.replace(/[0-9]/g, "")
  }

  return (
    <form
      id="confirmacao"
      action={formAction}
      noValidate
      className="mt-10 scroll-mt-8 rounded-[2rem] border border-white/20 bg-white p-6 text-zinc-950 shadow-2xl shadow-white/10"
    >
      <input type="hidden" name="slug" value={slug} />
      <input type="hidden" name="serviceIds" value={serviceIds.join(",")} />
      <input type="hidden" name="date" value={date} />
      <input type="hidden" name="time" value={time} />

      <p className="text-xs font-semibold uppercase tracking-[0.3em] text-zinc-500">
        Passo 4
      </p>

      <h2 className="mt-3 text-2xl font-bold">Confirmar dados do cliente</h2>

      <p className="mt-3 text-zinc-600">
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
          className="rounded-2xl border border-zinc-300 bg-white px-4 py-4 text-zinc-950 outline-none transition placeholder:text-zinc-400 focus:border-zinc-950"
        />

        <input
          type="tel"
          name="customerPhone"
          placeholder="Telefone / WhatsApp"
          minLength={7}
          maxLength={20}
          inputMode="tel"
          autoComplete="tel"
          className="rounded-2xl border border-zinc-300 bg-white px-4 py-4 text-zinc-950 outline-none transition placeholder:text-zinc-400 focus:border-zinc-950"
        />

        <input
          type="text"
          name="customerEmail"
          placeholder="E-mail"
          maxLength={120}
          inputMode="email"
          autoComplete="email"
          className="rounded-2xl border border-zinc-300 bg-white px-4 py-4 text-zinc-950 outline-none transition placeholder:text-zinc-400 focus:border-zinc-950"
        />

        <button
          type="submit"
          disabled={isPending}
          className="rounded-2xl bg-zinc-950 px-4 py-4 font-semibold text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:bg-zinc-400"
        >
          {isPending ? "A confirmar..." : "Confirmar marcação"}
        </button>
      </div>
    </form>
  )
}