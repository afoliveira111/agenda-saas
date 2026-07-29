export type AdminTheme = "DARK" | "LIGHT" | "NUDE"

export const adminThemes: {
  value: AdminTheme
  label: string
  description: string
}[] = [
  {
    value: "DARK",
    label: "Escuro",
    description: "Visual técnico escuro, mais leve que preto puro.",
  },
  {
    value: "LIGHT",
    label: "Claro",
    description: "Fundo branco, limpo e fácil de ler.",
  },
  {
    value: "NUDE",
    label: "Nude",
    description: "Tons suaves de bege e nude para uma área admin mais leve.",
  },
]

export function normalizeAdminTheme(theme?: string | null): AdminTheme {
  if (theme === "DARK" || theme === "LIGHT" || theme === "NUDE") {
    return theme
  }

  return "DARK"
}

export function formatAdminTheme(theme?: string | null) {
  const normalizedTheme = normalizeAdminTheme(theme)

  const themeMap = {
    DARK: "Escuro",
    LIGHT: "Claro",
    NUDE: "Nude",
  }

  return themeMap[normalizedTheme]
}

export function getAdminThemeClasses(theme?: string | null) {
  const normalizedTheme = normalizeAdminTheme(theme)

  if (normalizedTheme === "LIGHT") {
    return {
      page: "bg-white text-zinc-950",
      hero: "border-zinc-200 bg-white",
      panel: "border-zinc-200 bg-white",
      card: "border-zinc-200 bg-zinc-50",
      cardStrong: "border-zinc-200 bg-white",
      title: "text-zinc-950",
      muted: "text-zinc-600",
      subtle: "text-zinc-400",
      line: "border-zinc-200",
      badge: "border-zinc-200 bg-zinc-50 text-zinc-700",
      primaryButton: "border-zinc-950 bg-zinc-950 text-white hover:bg-zinc-800",
      secondaryButton:
        "border-zinc-300 bg-white text-zinc-950 hover:border-zinc-950",
      action: "border-zinc-200 bg-zinc-50 text-zinc-950 hover:border-zinc-950",
      actionSelected: "border-zinc-950 bg-zinc-950 text-white",
    }
  }

  if (normalizedTheme === "NUDE") {
    return {
      page: "bg-[#f6eee7] text-[#2b211c]",
      hero: "border-[#ead8ca] bg-[#fff8f2]",
      panel: "border-[#ead8ca] bg-[#fff8f2]",
      card: "border-[#ead8ca] bg-white",
      cardStrong: "border-[#ead8ca] bg-[#fff8f2]",
      title: "text-[#2b211c]",
      muted: "text-[#7a6658]",
      subtle: "text-[#9d8576]",
      line: "border-[#ead8ca]",
      badge: "border-[#ead8ca] bg-white text-[#7a6658]",
      primaryButton: "border-[#2b211c] bg-[#2b211c] text-white hover:bg-[#3b2d25]",
      secondaryButton:
        "border-[#d8beb0] bg-[#fff8f2] text-[#2b211c] hover:border-[#2b211c]",
      action: "border-[#ead8ca] bg-white text-[#2b211c] hover:border-[#2b211c]",
      actionSelected: "border-[#2b211c] bg-[#2b211c] text-white",
    }
  }

  return {
    page: "bg-[#111113] text-white",
    hero: "border-zinc-800 bg-[#18181b]",
    panel: "border-zinc-800 bg-[#18181b]",
    card: "border-zinc-800 bg-[#202024]",
    cardStrong: "border-zinc-800 bg-[#111113]",
    title: "text-white",
    muted: "text-zinc-400",
    subtle: "text-zinc-600",
    line: "border-zinc-800",
    badge: "border-zinc-700 bg-[#202024] text-zinc-300",
    primaryButton: "border-white bg-white text-zinc-950 hover:bg-zinc-200",
    secondaryButton:
      "border-zinc-700 bg-transparent text-zinc-300 hover:border-white hover:text-white",
    action: "border-zinc-800 bg-[#202024] text-white hover:border-white",
    actionSelected: "border-white bg-white text-zinc-950",
  }
}