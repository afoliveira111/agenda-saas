export type BusinessTheme = "WHITE" | "NUDE" | "LUXURY"

export const businessThemes: {
  value: BusinessTheme
  label: string
  description: string
}[] = [
  {
    value: "WHITE",
    label: "Branco",
    description: "Fundo branco com detalhes dourados. Visual limpo e sofisticado.",
  },
  {
    value: "NUDE",
    label: "Nude",
    description: "Tons suaves de bege e nude. Ideal para estética e beleza.",
  },
  {
    value: "LUXURY",
    label: "Premium",
    description: "Preto com detalhes dourados. Visual elegante e premium.",
  },
]

export function normalizeBusinessTheme(theme?: string | null): BusinessTheme {
  if (theme === "WHITE" || theme === "NUDE" || theme === "LUXURY") {
    return theme
  }

  return "LUXURY"
}

export function getPublicThemeClasses(theme?: string | null) {
  const normalizedTheme = normalizeBusinessTheme(theme)

  if (normalizedTheme === "WHITE") {
    return {
      page: "bg-[#fbfaf8] text-[#111111]",
      muted: "text-[#5f625f]",
      softMuted: "text-[#8a7b68]",
      border: "border-[#eadfce]",
      accent: "text-[#a16f2d]",
      accentBg: "bg-[#a16f2d]",
      accentSoft: "bg-[#f7efe3]",
      card: "border-[#eadfce] bg-white/80",
      cardStrong: "border-[#eadfce] bg-white",
      heroPanel: "border-[#eadfce] bg-white/80 shadow-[0_24px_80px_rgba(161,111,45,0.10)]",
      logoPanel: "border-[#eadfce] bg-white",
      logoBox: "border-[#eadfce] bg-[#111111]",
      servicePanel: "border-[#eadfce] bg-white/85",
      serviceSelected: "border-[#a16f2d] bg-[#f7efe3]",
      primaryButton: "bg-[#111111] text-white hover:bg-[#2b2b2b]",
      secondaryButton:
        "border-[#d8c8b4] bg-white text-[#111111] hover:border-[#a16f2d]",
      badge: "border-[#eadfce] bg-[#f7efe3] text-[#8a5a1f]",
      input:
        "border-[#d8c8b4] bg-white text-[#111111] placeholder:text-[#9b948b] focus:border-[#a16f2d]",
    }
  }

  if (normalizedTheme === "NUDE") {
    return {
      page: "bg-[#f7efe7] text-[#2b211c]",
      muted: "text-[#7a6658]",
      softMuted: "text-[#a06f49]",
      border: "border-[#e6d2bf]",
      accent: "text-[#a96f3b]",
      accentBg: "bg-[#a96f3b]",
      accentSoft: "bg-[#f1dfcd]",
      card: "border-[#e6d2bf] bg-[#fffaf5]/80",
      cardStrong: "border-[#e6d2bf] bg-[#fffaf5]",
      heroPanel: "border-[#e6d2bf] bg-[#fffaf5]/85 shadow-[0_24px_80px_rgba(169,111,59,0.14)]",
      logoPanel: "border-[#e6d2bf] bg-[#fffaf5]",
      logoBox: "border-[#e6d2bf] bg-[#2b211c]",
      servicePanel: "border-[#e6d2bf] bg-[#fffaf5]/90",
      serviceSelected: "border-[#a96f3b] bg-[#f1dfcd]",
      primaryButton: "bg-[#2b211c] text-white hover:bg-[#3b2d25]",
      secondaryButton:
        "border-[#d8beb0] bg-[#fffaf5] text-[#2b211c] hover:border-[#a96f3b]",
      badge: "border-[#e6d2bf] bg-[#f1dfcd] text-[#8a5a38]",
      input:
        "border-[#d8beb0] bg-white text-[#2b211c] placeholder:text-[#9d8576] focus:border-[#a96f3b]",
    }
  }

  return {
    page: "bg-[#070707] text-[#f7efe4]",
    muted: "text-zinc-400",
    softMuted: "text-[#d7b98a]",
    border: "border-[#d7b98a]/25",
    accent: "text-[#f0dcc1]",
    accentBg: "bg-[#d7b98a]",
    accentSoft: "bg-[#d7b98a]/10",
    card: "border-[#d7b98a]/20 bg-black/35",
    cardStrong: "border-[#d7b98a]/25 bg-[#101011]/90",
    heroPanel: "border-[#d7b98a]/35 bg-black/45 shadow-[0_24px_90px_rgba(215,185,138,0.14)]",
    logoPanel: "border-[#d7b98a]/30 bg-[#101011]/90 shadow-[0_0_45px_rgba(215,185,138,0.10)]",
    logoBox: "border-[#d7b98a]/25 bg-black",
    servicePanel: "border-[#d7b98a]/20 bg-[#101011]/75",
    serviceSelected: "border-[#d7b98a]/70 bg-[#d7b98a]/10",
    primaryButton: "bg-[#f0dcc1] text-zinc-950 hover:bg-white",
    secondaryButton:
      "border-[#d7b98a]/40 bg-transparent text-[#f0dcc1] hover:border-[#d7b98a] hover:bg-[#d7b98a]/10",
    badge: "border-[#d7b98a]/25 bg-[#d7b98a]/10 text-[#f0dcc1]",
    input:
      "border-[#d7b98a]/25 bg-black/40 text-white placeholder:text-zinc-600 focus:border-[#d7b98a]",
  }
}
