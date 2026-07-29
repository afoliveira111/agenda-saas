import { requireAdminSession } from "@/lib/auth"

type DashboardBusinessesLayoutProps = {
  children: React.ReactNode
}

export default async function DashboardBusinessesLayout({
  children,
}: DashboardBusinessesLayoutProps) {
  await requireAdminSession()

  return children
}