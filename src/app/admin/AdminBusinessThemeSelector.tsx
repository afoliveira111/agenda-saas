"use client"

import { useState } from "react"
import {
  businessThemes,
  type BusinessTheme,
} from "@/lib/business-theme"

type AdminBusinessThemeSelectorProps = {
  currentTheme: BusinessTheme
}

function getThemePreviewClasses(theme: BusinessTheme) {
  if (theme === "WHITE") {
    return "border-zinc-300 bg-white text-zinc-950"
  }

  if (theme === "NUDE") {
    return "border-[#d8beb0] bg-[#f6eee7] text-[#2b211c]"
  }

  return "border-zinc-700 bg-zinc-950 text-white"
}

function getThemeCardClasses(theme: BusinessTheme, selected: boolean) {
  const base = "cursor-pointer rounded-3xl border p-4 transition hover:scale-[1.01]"

  if (theme === "WHITE") {
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

export function AdminBusinessThemeSelector({
  currentTheme,
}: AdminBusinessThemeSelectorProps) {
  const [selectedTheme, setSelectedTheme] =
    useState<BusinessTheme>(currentTheme)

  return (
    <div className="mt-4 grid gap-3 md:grid-cols-3">
      {businessThemes.map((theme) => {
        const selected = selectedTheme === theme.value
        const isSavedTheme = currentTheme === theme.value

        return (
          <label
            key={theme.value}
            className={getThemeCardClasses(theme.value, selected)}
          >
            <input
              type="radio"
              name="theme"
              value={theme.value}
              checked={selected}
              onChange={() => setSelectedTheme(theme.value)}
              className="sr-only"
            />

            <div
              className={`mb-4 h-20 rounded-2xl border ${getThemePreviewClasses(
                theme.value,
              )}`}
            >
              <div className="p-3">
                <div className="h-3 w-16 rounded-full bg-current opacity-30" />
                <div className="mt-3 h-4 w-24 rounded-full bg-current opacity-80" />
                <div className="mt-2 h-3 w-14 rounded-full bg-current opacity-40" />
              </div>
            </div>

            <div className="flex items-center justify-between gap-3">
              <span className="font-bold">{theme.label}</span>

              <span className="rounded-full border border-current px-2 py-1 text-[11px] font-semibold">
                {selected ? (isSavedTheme ? "Atual" : "Escolhido") : "Escolher"}
              </span>
            </div>
          </label>
        )
      })}
    </div>
  )
}