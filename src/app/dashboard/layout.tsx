import { requireSession } from "@/lib/auth"

type DashboardLayoutProps = {
  children: React.ReactNode
}

export default async function DashboardLayout({
  children,
}: DashboardLayoutProps) {
  await requireSession()

  return children
}