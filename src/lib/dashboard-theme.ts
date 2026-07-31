import { normalizeBusinessTheme } from "@/lib/business-theme"

export function formatBusinessTheme(theme?: string | null) {
  const normalizedTheme = normalizeBusinessTheme(theme)

  const themeMap = {
    WHITE: "Branco",
    NUDE: "Nude",
    LUXURY: "Premium",
  }

  return themeMap[normalizedTheme]
}

export function getDashboardThemeClasses(theme?: string | null) {
  const normalizedTheme = normalizeBusinessTheme(theme)

  if (normalizedTheme === "WHITE") {
    return {
      page: "bg-[#fbfaf8] text-[#111111]",
      hero:
        "border-[#eadfce] bg-white/90 shadow-[0_24px_80px_rgba(161,111,45,0.10)]",
      panel:
        "border-[#eadfce] bg-white/90 shadow-[0_20px_70px_rgba(161,111,45,0.08)]",
      panelSoft: "border-[#eadfce] bg-[#fbfaf8]",
      card: "border-[#eadfce] bg-[#fbfaf8]",
      cardStrong: "border-[#eadfce] bg-white",
      title: "text-[#111111]",
      muted: "text-[#5f625f]",
      subtle: "text-[#a16f2d]",
      line: "border-[#eadfce]",
      badge: "border-[#eadfce] bg-[#f7efe3] text-[#8a5a1f]",
      primaryButton:
        "border-[#111111] bg-[#111111] text-white hover:bg-[#2b2b2b]",
      secondaryButton:
        "border-[#d8c8b4] bg-white text-[#111111] hover:border-[#a16f2d] hover:bg-[#f7efe3]",
      action:
        "border-[#eadfce] bg-[#fbfaf8] text-[#111111] hover:border-[#a16f2d] hover:bg-[#f7efe3]",
      actionHighlight:
        "border-[#a16f2d] bg-[#f7efe3] text-[#111111] hover:bg-white",
      actionMuted: "text-[#5f625f]",
      actionHighlightMuted: "text-[#5f625f]",
    }
  }

  if (normalizedTheme === "NUDE") {
    return {
      page: "bg-[#f7efe7] text-[#2b211c]",
      hero:
        "border-[#e6d2bf] bg-[#fffaf5]/90 shadow-[0_24px_80px_rgba(169,111,59,0.14)]",
      panel:
        "border-[#e6d2bf] bg-[#fffaf5]/90 shadow-[0_20px_70px_rgba(169,111,59,0.10)]",
      panelSoft: "border-[#e6d2bf] bg-[#f1dfcd]",
      card: "border-[#e6d2bf] bg-[#fffaf5]",
      cardStrong: "border-[#e6d2bf] bg-white",
      title: "text-[#2b211c]",
      muted: "text-[#7a6658]",
      subtle: "text-[#a96f3b]",
      line: "border-[#e6d2bf]",
      badge: "border-[#e6d2bf] bg-[#f1dfcd] text-[#8a5a38]",
      primaryButton:
        "border-[#2b211c] bg-[#2b211c] text-white hover:bg-[#3b2d25]",
      secondaryButton:
        "border-[#d8beb0] bg-[#fffaf5] text-[#2b211c] hover:border-[#a96f3b] hover:bg-[#f1dfcd]",
      action:
        "border-[#e6d2bf] bg-[#fffaf5] text-[#2b211c] hover:border-[#a96f3b] hover:bg-[#f1dfcd]",
      actionHighlight:
        "border-[#a96f3b] bg-[#f1dfcd] text-[#2b211c] hover:bg-[#fffaf5]",
      actionMuted: "text-[#7a6658]",
      actionHighlightMuted: "text-[#7a6658]",
    }
  }

  return {
    page: "bg-[#070707] text-[#f7efe4]",
    hero:
      "border-[#d7b98a]/35 bg-black/45 shadow-[0_24px_90px_rgba(215,185,138,0.14)] backdrop-blur",
    panel:
      "border-[#d7b98a]/25 bg-[#101011]/90 shadow-[0_20px_80px_rgba(215,185,138,0.10)]",
    panelSoft: "border-[#d7b98a]/20 bg-black/35",
    card: "border-[#d7b98a]/20 bg-black/35",
    cardStrong: "border-[#d7b98a]/25 bg-[#101011]/90",
    title: "text-[#f7efe4]",
    muted: "text-zinc-400",
    subtle: "text-[#d7b98a]",
    line: "border-[#d7b98a]/20",
    badge: "border-[#d7b98a]/25 bg-[#d7b98a]/10 text-[#f0dcc1]",
    primaryButton:
      "border-[#f0dcc1] bg-[#f0dcc1] text-zinc-950 hover:bg-white",
    secondaryButton:
      "border-[#d7b98a]/40 bg-transparent text-[#f0dcc1] hover:border-[#d7b98a] hover:bg-[#d7b98a]/10",
    action:
      "border-[#d7b98a]/20 bg-black/35 text-[#f7efe4] hover:border-[#d7b98a]/60 hover:bg-[#d7b98a]/10",
    actionHighlight:
      "border-[#f0dcc1] bg-[#f0dcc1] text-zinc-950 hover:bg-white",
    actionMuted: "text-zinc-400",
    actionHighlightMuted: "text-zinc-700",
  }
}
