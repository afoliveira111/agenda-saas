import { requireAdminSession } from "@/lib/auth"

type AdminLayoutProps = {
  children: React.ReactNode
}

export default async function AdminLayout({ children }: AdminLayoutProps) {
  await requireAdminSession()

  return children
}