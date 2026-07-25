export type BusinessTheme = "WHITE" | "NUDE" | "LUXURY"

export const businessThemes: {
  value: BusinessTheme
  label: string
  description: string
}[] = [
  {
    value: "WHITE",
    label: "Branco",
    description: "Fundo branco com letras pretas. Visual limpo e simples.",
  },
  {
    value: "NUDE",
    label: "Nude",
    description: "Tons suaves de bege e nude. Ideal para estética e beleza.",
  },
  {
    value: "LUXURY",
    label: "Premium",
    description: "Preto, branco e cinza. Visual elegante e moderno.",
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
      page: "bg-white text-zinc-950",
      muted: "text-zinc-600",
      card: "border-zinc-200 bg-zinc-50",
      cardStrong: "border-zinc-200 bg-white",
      primaryButton: "bg-zinc-950 text-white hover:bg-zinc-800",
      secondaryButton:
        "border-zinc-300 bg-white text-zinc-950 hover:border-zinc-950",
      badge: "border-zinc-200 bg-zinc-100 text-zinc-700",
      input:
        "border-zinc-300 bg-white text-zinc-950 placeholder:text-zinc-400 focus:border-zinc-950",
    }
  }

  if (normalizedTheme === "NUDE") {
    return {
      page: "bg-[#f6eee7] text-[#2b211c]",
      muted: "text-[#7a6658]",
      card: "border-[#ead8ca] bg-[#fff8f2]",
      cardStrong: "border-[#ead8ca] bg-white",
      primaryButton: "bg-[#2b211c] text-white hover:bg-[#3b2d25]",
      secondaryButton:
        "border-[#d8beb0] bg-[#fff8f2] text-[#2b211c] hover:border-[#2b211c]",
      badge: "border-[#ead8ca] bg-[#fff8f2] text-[#7a6658]",
      input:
        "border-[#d8beb0] bg-white text-[#2b211c] placeholder:text-[#9d8576] focus:border-[#2b211c]",
    }
  }

  return {
    page: "bg-zinc-950 text-white",
    muted: "text-zinc-400",
    card: "border-white/10 bg-white/[0.04]",
    cardStrong: "border-white/15 bg-white/[0.07]",
    primaryButton: "bg-white text-zinc-950 hover:bg-zinc-200",
    secondaryButton:
      "border-white/15 bg-transparent text-white hover:border-white/40 hover:bg-white/5",
    badge: "border-white/10 bg-white/5 text-zinc-300",
    input:
      "border-zinc-700 bg-zinc-950 text-white placeholder:text-zinc-500 focus:border-white",
  }
}