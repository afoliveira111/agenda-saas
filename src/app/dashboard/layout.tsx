import { requireSession } from "@/lib/auth"

type DashboardLayoutProps = {
  children: React.ReactNode
}

export const dynamic = "force-dynamic"

export default async function DashboardLayout({
  children,
}: DashboardLayoutProps) {
  await requireSession("/dashboard")

  return children
}