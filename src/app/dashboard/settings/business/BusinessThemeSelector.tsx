"use client"

import { useState } from "react"
import {
  businessThemes,
  type BusinessTheme,
} from "@/lib/business-theme"

type BusinessThemeSelectorProps = {
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
  const base = "cursor-pointer rounded-3xl border p-5 transition hover:scale-[1.01]"

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

export function BusinessThemeSelector({
  currentTheme,
}: BusinessThemeSelectorProps) {
  const [selectedTheme, setSelectedTheme] =
    useState<BusinessTheme>(currentTheme)

  return (
    <div className="mt-5 grid gap-4 md:grid-cols-3">
      {businessThemes.map((businessTheme) => {
        const selected = selectedTheme === businessTheme.value
        const isSavedTheme = currentTheme === businessTheme.value

        return (
          <label
            key={businessTheme.value}
            className={getThemeCardClasses(businessTheme.value, selected)}
          >
            <input
              type="radio"
              name="theme"
              value={businessTheme.value}
              checked={selected}
              onChange={() => setSelectedTheme(businessTheme.value)}
              className="sr-only"
            />

            <div
              className={`mb-5 h-24 rounded-2xl border ${getThemePreviewClasses(
                businessTheme.value,
              )}`}
            >
              <div className="p-4">
                <div className="h-3 w-20 rounded-full bg-current opacity-30" />
                <div className="mt-4 h-4 w-28 rounded-full bg-current opacity-80" />
                <div className="mt-3 h-3 w-16 rounded-full bg-current opacity-40" />
              </div>
            </div>

            <div className="flex items-center justify-between gap-4">
              <span className="text-lg font-bold">{businessTheme.label}</span>

              <span className="rounded-full border border-current px-3 py-1 text-xs font-semibold">
                {selected ? (isSavedTheme ? "Atual" : "Escolhido") : "Escolher"}
              </span>
            </div>

            <p className="mt-3 text-sm opacity-70">
              {businessTheme.description}
            </p>
          </label>
        )
      })}
    </div>
  )
}