import { cookies } from "next/headers"
import { normalizeAdminTheme } from "@/lib/admin-theme"
import { requireAdminSession } from "@/lib/auth"
import { AdminThemeFrame } from "./AdminThemeFrame"

type AdminLayoutProps = {
  children: React.ReactNode
}

const ADMIN_THEME_COOKIE = "agenda_saas_admin_theme"

export const dynamic = "force-dynamic"

export default async function AdminLayout({ children }: AdminLayoutProps) {
  await requireAdminSession("/admin")

  const cookieStore = await cookies()
  const currentAdminTheme = normalizeAdminTheme(
    cookieStore.get(ADMIN_THEME_COOKIE)?.value,
  )

  return (
    <AdminThemeFrame currentTheme={currentAdminTheme}>
      {children}
    </AdminThemeFrame>
  )
}