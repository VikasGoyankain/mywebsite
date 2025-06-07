import { AdminAuthWrapper } from "@/components/admin/AdminAuthWrapper"

export default function WorksLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <AdminAuthWrapper>{children}</AdminAuthWrapper>
} 