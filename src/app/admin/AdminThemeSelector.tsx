"use client"

import { useState } from "react"
import { adminThemes, type AdminTheme } from "../../lib/admin-theme"

type AdminThemeSelectorProps = {
  currentTheme: AdminTheme
}

function getDotClasses(theme: AdminTheme) {
  if (theme === "LIGHT") {
    return "border-zinc-300 bg-white"
  }

  if (theme === "NUDE") {
    return "border-[#d8beb0] bg-[#f6eee7]"
  }

  return "border-zinc-600 bg-zinc-950"
}

function getCardClasses({
  pageTheme,
  selected,
}: {
  pageTheme: AdminTheme
  selected: boolean
}) {
  const base = "cursor-pointer rounded-2xl border p-4 transition"

  if (pageTheme === "LIGHT") {
    return selected
      ? `${base} border-zinc-950 bg-zinc-50 text-zinc-950 ring-2 ring-zinc-950`
      : `${base} border-zinc-200 bg-white text-zinc-950 hover:border-zinc-950`
  }

  if (pageTheme === "NUDE") {
    return selected
      ? `${base} border-[#2b211c] bg-white text-[#2b211c] ring-2 ring-[#2b211c]`
      : `${base} border-[#ead8ca] bg-[#fff8f2] text-[#2b211c] hover:border-[#2b211c]`
  }

  return selected
    ? `${base} border-white bg-[#202024] text-white ring-2 ring-white`
    : `${base} border-zinc-800 bg-[#202024] text-white hover:border-white`
}

function getBadgeClasses({
  pageTheme,
  selected,
}: {
  pageTheme: AdminTheme
  selected: boolean
}) {
  const base = "shrink-0 rounded-full border px-3 py-1 text-xs font-semibold"

  if (pageTheme === "LIGHT") {
    return selected
      ? `${base} border-zinc-950 bg-zinc-950 text-white`
      : `${base} border-zinc-300 text-zinc-700`
  }

  if (pageTheme === "NUDE") {
    return selected
      ? `${base} border-[#2b211c] bg-[#2b211c] text-white`
      : `${base} border-[#d8beb0] text-[#2b211c]`
  }

  return selected
    ? `${base} border-white bg-white text-zinc-950`
    : `${base} border-zinc-600 text-zinc-300`
}

export function AdminThemeSelector({
  currentTheme,
}: AdminThemeSelectorProps) {
  const [selectedTheme, setSelectedTheme] = useState<AdminTheme>(currentTheme)

  return (
    <div className="grid gap-3">
      {adminThemes.map((adminTheme) => {
        const themeValue: AdminTheme = adminTheme.value
        const selected = selectedTheme === themeValue
        const isSavedTheme = currentTheme === themeValue

        return (
          <label
            key={themeValue}
            className={getCardClasses({
              pageTheme: currentTheme,
              selected,
            })}
          >
            <input
              type="radio"
              name="adminTheme"
              value={themeValue}
              checked={selected}
              onChange={() => setSelectedTheme(themeValue)}
              className="sr-only"
            />

            <div className="flex items-center justify-between gap-4">
              <div className="flex min-w-0 items-center gap-3">
                <span
                  className={`h-10 w-10 shrink-0 rounded-full border ${getDotClasses(
                    themeValue,
                  )}`}
                />

                <div className="min-w-0">
                  <p className="font-bold">{adminTheme.label}</p>

                  <p className="mt-1 text-sm opacity-70">
                    {adminTheme.description}
                  </p>
                </div>
              </div>

              <span
                className={getBadgeClasses({
                  pageTheme: currentTheme,
                  selected,
                })}
              >
                {selected ? (isSavedTheme ? "Atual" : "Escolhido") : "Escolher"}
              </span>
            </div>
          </label>
        )
      })}
    </div>
  )
}