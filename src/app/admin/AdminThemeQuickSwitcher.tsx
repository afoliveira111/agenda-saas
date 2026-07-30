"use client"

import { usePathname } from "next/navigation"
import { adminThemes, type AdminTheme } from "@/lib/admin-theme"
import { updateAdminThemeAction } from "./actions"

type AdminThemeQuickSwitcherProps = {
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

function getShellClasses(currentTheme: AdminTheme) {
  if (currentTheme === "LIGHT") {
    return "border-zinc-200 bg-white/90 text-zinc-950 shadow-xl shadow-zinc-200/60"
  }

  if (currentTheme === "NUDE") {
    return "border-[#ead8ca] bg-[#fff8f2]/90 text-[#2b211c] shadow-xl shadow-[#d8beb0]/40"
  }

  return "border-zinc-800 bg-[#18181b]/90 text-white shadow-xl shadow-black/40"
}

function getButtonClasses({
  currentTheme,
  selected,
}: {
  currentTheme: AdminTheme
  selected: boolean
}) {
  const base =
    "flex h-9 w-9 items-center justify-center rounded-full border transition hover:scale-105"

  if (currentTheme === "LIGHT") {
    return selected
      ? `${base} border-zinc-950 bg-zinc-950`
      : `${base} border-zinc-300 bg-white hover:border-zinc-950`
  }

  if (currentTheme === "NUDE") {
    return selected
      ? `${base} border-[#2b211c] bg-[#2b211c]`
      : `${base} border-[#d8beb0] bg-white hover:border-[#2b211c]`
  }

  return selected
    ? `${base} border-white bg-white`
    : `${base} border-zinc-700 bg-zinc-950 hover:border-white`
}

export function AdminThemeQuickSwitcher({
  currentTheme,
}: AdminThemeQuickSwitcherProps) {
  const pathname = usePathname()

  return (
    <div
      className={`fixed bottom-5 right-5 z-50 rounded-full border px-3 py-2 backdrop-blur ${getShellClasses(
        currentTheme,
      )}`}
    >
      <div className="flex items-center gap-2">
        <span className="hidden pl-1 text-xs font-semibold uppercase tracking-[0.25em] opacity-60 sm:inline">
          Tema
        </span>

        <div className="flex items-center gap-1.5">
          {adminThemes.map((adminTheme) => {
            const selected = currentTheme === adminTheme.value

            return (
              <form key={adminTheme.value} action={updateAdminThemeAction}>
                <input
                  type="hidden"
                  name="adminTheme"
                  value={adminTheme.value}
                />

                <input type="hidden" name="redirectTo" value={pathname} />

                <button
                  type="submit"
                  title={adminTheme.label}
                  aria-label={`Usar tema ${adminTheme.label}`}
                  className={getButtonClasses({
                    currentTheme,
                    selected,
                  })}
                >
                  <span
                    className={`h-5 w-5 rounded-full border ${getDotClasses(
                      adminTheme.value,
                    )}`}
                  />
                </button>
              </form>
            )
          })}
        </div>
      </div>
    </div>
  )
}