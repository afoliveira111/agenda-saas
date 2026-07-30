import type { AdminTheme } from "@/lib/admin-theme"
import { AdminThemeQuickSwitcher } from "./AdminThemeQuickSwitcher"

type AdminThemeFrameProps = {
  currentTheme: AdminTheme
  children: React.ReactNode
}

function getLegacyAdminThemeCss(theme: AdminTheme) {
  if (theme === "LIGHT") {
    return `
      [data-admin-theme="LIGHT"] .bg-zinc-950,
      [data-admin-theme="LIGHT"] .bg-zinc-900,
      [data-admin-theme="LIGHT"] .bg-black,
      [data-admin-theme="LIGHT"] .bg-black\\/40,
      [data-admin-theme="LIGHT"] .bg-\\[\\#111113\\],
      [data-admin-theme="LIGHT"] .bg-\\[\\#18181b\\],
      [data-admin-theme="LIGHT"] .bg-\\[\\#202024\\] {
        background-color: #ffffff !important;
      }

      [data-admin-theme="LIGHT"] .bg-gradient-to-br {
        background-image: none !important;
        background-color: #ffffff !important;
      }

      [data-admin-theme="LIGHT"] .text-white,
      [data-admin-theme="LIGHT"] .text-zinc-950 {
        color: #09090b !important;
      }

      [data-admin-theme="LIGHT"] .text-zinc-300 {
        color: #3f3f46 !important;
      }

      [data-admin-theme="LIGHT"] .text-zinc-400,
      [data-admin-theme="LIGHT"] .text-zinc-500 {
        color: #52525b !important;
      }

      [data-admin-theme="LIGHT"] .text-zinc-600 {
        color: #71717a !important;
      }

      [data-admin-theme="LIGHT"] .border-zinc-800,
      [data-admin-theme="LIGHT"] .border-zinc-700,
      [data-admin-theme="LIGHT"] .border-white {
        border-color: #e4e4e7 !important;
      }

      [data-admin-theme="LIGHT"] input,
      [data-admin-theme="LIGHT"] textarea,
      [data-admin-theme="LIGHT"] select {
        background-color: #ffffff !important;
        color: #09090b !important;
        border-color: #d4d4d8 !important;
      }

      [data-admin-theme="LIGHT"] a.bg-white:not([aria-label^="Usar tema"]),
      [data-admin-theme="LIGHT"] button.bg-white:not([aria-label^="Usar tema"]) {
        background-color: #ffffff !important;
        color: #09090b !important;
        border-color: #d4d4d8 !important;
      }

      [data-admin-theme="LIGHT"] a.bg-white:not([aria-label^="Usar tema"]):hover,
      [data-admin-theme="LIGHT"] button.bg-white:not([aria-label^="Usar tema"]):hover {
        background-color: #f8fafc !important;
        color: #09090b !important;
        border-color: #a1a1aa !important;
        box-shadow: 0 8px 20px rgba(24, 24, 27, 0.08) !important;
      }

      [data-admin-theme="LIGHT"] a.bg-zinc-950:not([aria-label^="Usar tema"]),
      [data-admin-theme="LIGHT"] button.bg-zinc-950:not([aria-label^="Usar tema"]) {
        background-color: #27272a !important;
        color: #ffffff !important;
        border-color: #f4f4f5 !important;
        box-shadow:
          0 10px 22px rgba(24, 24, 27, 0.12),
          0 0 0 1px rgba(24, 24, 27, 0.08) !important;
      }

      [data-admin-theme="LIGHT"] a.bg-zinc-950:not([aria-label^="Usar tema"]):hover,
      [data-admin-theme="LIGHT"] button.bg-zinc-950:not([aria-label^="Usar tema"]):hover {
        background-color: #18181b !important;
        color: #ffffff !important;
        border-color: #ffffff !important;
        box-shadow:
          0 12px 26px rgba(24, 24, 27, 0.16),
          0 0 0 2px #ffffff,
          0 0 0 3px #d4d4d8 !important;
      }

      [data-admin-theme="LIGHT"] a.bg-zinc-950:not([aria-label^="Usar tema"]) *,
      [data-admin-theme="LIGHT"] button.bg-zinc-950:not([aria-label^="Usar tema"]) * {
        color: #ffffff !important;
      }
    `
  }

  if (theme === "NUDE") {
    return `
      [data-admin-theme="NUDE"] .bg-zinc-950,
      [data-admin-theme="NUDE"] .bg-zinc-900,
      [data-admin-theme="NUDE"] .bg-black,
      [data-admin-theme="NUDE"] .bg-black\\/40,
      [data-admin-theme="NUDE"] .bg-\\[\\#111113\\],
      [data-admin-theme="NUDE"] .bg-\\[\\#18181b\\],
      [data-admin-theme="NUDE"] .bg-\\[\\#202024\\] {
        background-color: #fff8f2 !important;
      }

      [data-admin-theme="NUDE"] .bg-gradient-to-br {
        background-image: none !important;
        background-color: #fff8f2 !important;
      }

      [data-admin-theme="NUDE"] .text-white,
      [data-admin-theme="NUDE"] .text-zinc-950,
      [data-admin-theme="NUDE"] .text-zinc-300 {
        color: #2b211c !important;
      }

      [data-admin-theme="NUDE"] .text-zinc-400,
      [data-admin-theme="NUDE"] .text-zinc-500 {
        color: #7a6658 !important;
      }

      [data-admin-theme="NUDE"] .text-zinc-600 {
        color: #9d8576 !important;
      }

      [data-admin-theme="NUDE"] .border-zinc-800,
      [data-admin-theme="NUDE"] .border-zinc-700 {
        border-color: #ead8ca !important;
      }

      [data-admin-theme="NUDE"] input,
      [data-admin-theme="NUDE"] textarea,
      [data-admin-theme="NUDE"] select {
        background-color: #ffffff !important;
        color: #2b211c !important;
        border-color: #d8beb0 !important;
      }

      [data-admin-theme="NUDE"] a.bg-\\[\\#2b211c\\],
      [data-admin-theme="NUDE"] button.bg-\\[\\#2b211c\\],
      [data-admin-theme="NUDE"] a.bg-white,
      [data-admin-theme="NUDE"] button.bg-white {
        background-color: #2b211c !important;
        color: #ffffff !important;
        border-color: #2b211c !important;
      }

      [data-admin-theme="NUDE"] a.bg-\\[\\#2b211c\\] *,
      [data-admin-theme="NUDE"] button.bg-\\[\\#2b211c\\] *,
      [data-admin-theme="NUDE"] a.bg-white *,
      [data-admin-theme="NUDE"] button.bg-white * {
        color: #ffffff !important;
      }
    `
  }

  return ""
}

export function AdminThemeFrame({
  currentTheme,
  children,
}: AdminThemeFrameProps) {
  return (
    <>
      <style
        dangerouslySetInnerHTML={{
          __html: getLegacyAdminThemeCss(currentTheme),
        }}
      />

      <div data-admin-theme={currentTheme}>{children}</div>

      <AdminThemeQuickSwitcher currentTheme={currentTheme} />
    </>
  )
}