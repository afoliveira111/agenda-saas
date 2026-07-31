export type AdminTheme = "DARK" | "LIGHT" | "NUDE"

export const adminThemes: {
  value: AdminTheme
  label: string
  description: string
}[] = [
  {
    value: "DARK",
    label: "Premium",
    description: "Visual escuro elegante para gestão da plataforma.",
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
    DARK: "Premium",
    LIGHT: "Claro",
    NUDE: "Nude",
  }

  return themeMap[normalizedTheme]
}

export function getAdminThemeClasses(theme?: string | null) {
  const normalizedTheme = normalizeAdminTheme(theme)

  if (normalizedTheme === "LIGHT") {
    return {
      page: "bg-[#fbfaf8] text-[#111111]",
      hero: "border-[#eadfce] bg-white/95 shadow-black/5",
      panel: "border-[#eadfce] bg-white/95 shadow-black/5",
      panelSoft: "border-[#eadfce] bg-[#fbfaf8]",
      card: "border-[#eadfce] bg-[#fbfaf8]",
      cardStrong: "border-[#eadfce] bg-white",
      title: "text-[#111111]",
      muted: "text-[#5f625f]",
      subtle: "text-[#a16f2d]",
      line: "border-[#eadfce]",
      badge: "border-[#eadfce] bg-[#f7efe3] text-[#5f3f19]",
      primaryButton:
        "border-[#a16f2d] bg-[#f7efe3] text-[#111111] hover:bg-white",
      secondaryButton:
        "border-[#d8c7ad] bg-white text-[#111111] hover:border-[#a16f2d] hover:bg-[#fbfaf8]",
      action:
        "border-[#eadfce] bg-white text-[#111111] hover:border-[#a16f2d] hover:bg-[#fbfaf8]",
      actionSelected:
        "border-[#a16f2d] bg-[#f7efe3] text-[#111111]",
      input:
        "border-[#d8c7ad] bg-white text-[#111111] placeholder:text-[#9a8d7c] focus:border-[#a16f2d]",
    }
  }

  if (normalizedTheme === "NUDE") {
    return {
      page: "bg-[#f6eee7] text-[#2b211c]",
      hero: "border-[#ead8ca] bg-[#fff8f2]/95 shadow-[#7a6658]/10",
      panel: "border-[#ead8ca] bg-[#fff8f2]/95 shadow-[#7a6658]/10",
      panelSoft: "border-[#ead8ca] bg-[#f1dfcd]",
      card: "border-[#ead8ca] bg-white",
      cardStrong: "border-[#ead8ca] bg-[#fff8f2]",
      title: "text-[#2b211c]",
      muted: "text-[#7a6658]",
      subtle: "text-[#a96f3b]",
      line: "border-[#ead8ca]",
      badge: "border-[#ead8ca] bg-white text-[#7a6658]",
      primaryButton:
        "border-[#2b211c] bg-[#2b211c] text-white hover:bg-[#3b2d25]",
      secondaryButton:
        "border-[#d8beb0] bg-[#fff8f2] text-[#2b211c] hover:border-[#2b211c]",
      action:
        "border-[#ead8ca] bg-white text-[#2b211c] hover:border-[#a96f3b]",
      actionSelected:
        "border-[#a96f3b] bg-[#f1dfcd] text-[#2b211c]",
      input:
        "border-[#d8beb0] bg-white text-[#2b211c] placeholder:text-[#9d8576] focus:border-[#2b211c]",
    }
  }

  return {
    page: "bg-[#0f0f10] text-white",
    hero: "border-[#d7b98a]/25 bg-[#151515] shadow-black/60",
    panel: "border-[#d7b98a]/20 bg-[#151515] shadow-black/50",
    panelSoft: "border-[#2c2924] bg-[#0f0f10]",
    card: "border-[#2c2924] bg-[#101011]",
    cardStrong: "border-[#2c2924] bg-[#0b0b0c]",
    title: "text-white",
    muted: "text-zinc-400",
    subtle: "text-[#a8895c]",
    line: "border-[#2c2924]",
    badge: "border-[#2c2924] bg-[#101011] text-zinc-300",
    primaryButton:
      "border-white bg-white text-zinc-950 hover:bg-[#f0dcc1]",
    secondaryButton:
      "border-[#3a3328] bg-transparent text-zinc-300 hover:border-[#f0dcc1] hover:text-white",
    action:
      "border-[#2c2924] bg-[#101011] text-white hover:border-[#f0dcc1]",
    actionSelected:
      "border-[#f0dcc1] bg-[#f0dcc1] text-zinc-950",
    input:
      "border-[#2c2924] bg-[#0b0b0c] text-white placeholder:text-zinc-700 focus:border-[#f0dcc1]",
  }
}
