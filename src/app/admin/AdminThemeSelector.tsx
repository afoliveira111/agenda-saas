"use client"

import { useState } from "react"
import {
  adminThemes,
  type AdminTheme,
} from "@/lib/admin-theme"

type AdminThemeSelectorProps = {
  currentTheme: AdminTheme
}

function getPreviewClasses(theme: AdminTheme) {
  if (theme === "LIGHT") {
    return "border-zinc-300 bg-white text-zinc-950"
  }

  if (theme === "NUDE") {
    return "border-[#d8beb0] bg-[#f6eee7] text-[#2b211c]"
  }

  return "border-zinc-700 bg-zinc-950 text-white"
}

function getCardClasses(theme: AdminTheme, selected: boolean) {
  const base = "cursor-pointer rounded-3xl border p-5 transition hover:scale-[1.01]"

  if (theme === "LIGHT") {
    return `${base} border-zinc-300 bg-white text-zinc-950 hover:border-zinc-950 ${
      selected ? "ring-2 ring-zinc-950" : ""
    }`
  }

  if (theme === "NUDE") {
    return `${base} border-[#d8beb0] bg-[#f6eee7] text-[#2b211c] hover:border-[#2b211c] ${
      selected ? "ring-2 ring-[#2b211c]" : ""
    }`
  }

  return `${base} border-zinc-700 bg-zinc-950 text-white hover:border-white ${
    selected ? "ring-2 ring-white" : ""
  }`
}

export function AdminThemeSelector({
  currentTheme,
}: AdminThemeSelectorProps) {
  const [selectedTheme, setSelectedTheme] = useState<AdminTheme>(currentTheme)

  return (
    <div className="grid gap-4 md:grid-cols-3">
      {adminThemes.map((theme) => {
        const selected = selectedTheme === theme.value
        const isSavedTheme = currentTheme === theme.value

        return (
          <label
            key={theme.value}
            className={getCardClasses(theme.value, selected)}
          >
            <input
              type="radio"
              name="adminTheme"
              value={theme.value}
              checked={selected}
              onChange={() => setSelectedTheme(theme.value)}
              className="sr-only"
            />

            <div
              className={`mb-5 h-24 rounded-2xl border ${getPreviewClasses(
                theme.value,
              )}`}
            >
              <div className="p-4">
                <div className="h-3 w-20 rounded-full bg-current opacity-30" />
                <div className="mt-4 h-4 w-28 rounded-full bg-current opacity-80" />
                <div className="mt-3 h-3 w-16 rounded-full bg-current opacity-40" />
              </div>
            </div>

            <div className="flex items-center justify-between gap-4">
              <span className="text-lg font-bold">{theme.label}</span>

              <span className="rounded-full border border-current px-3 py-1 text-xs font-semibold">
                {selected ? (isSavedTheme ? "Atual" : "Escolhido") : "Escolher"}
              </span>
            </div>

            <p className="mt-3 text-sm opacity-70">{theme.description}</p>
          </label>
        )
      })}
    </div>
  )
}