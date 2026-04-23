import React from "react"
import { AdminAuthWrapper } from "@/components/admin/AdminAuthWrapper"
import { AdminSidebar } from "@/components/admin/AdminSidebar"
import { Toaster } from "@/components/ui/toaster"

export const metadata = {
  title: "Admin Dashboard | Website Management",
  description: "Secure administration dashboard for website management",
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AdminAuthWrapper>
      <AdminSidebar>
        {children}
        <Toaster />
      </AdminSidebar>
    </AdminAuthWrapper>
  )
}