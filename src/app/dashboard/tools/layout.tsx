import { requireAdminSession } from "@/lib/auth"

type DashboardToolsLayoutProps = {
  children: React.ReactNode
}

export default async function DashboardToolsLayout({
  children,
}: DashboardToolsLayoutProps) {
  await requireAdminSession()

  return children
}