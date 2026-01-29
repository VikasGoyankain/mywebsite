import React from "react"
import { AdminAuthWrapper } from "@/components/admin/AdminAuthWrapper"
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
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
        {children}
        <Toaster />
      </div>
    </AdminAuthWrapper>
  )
} 