"use client"

import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { AdminConfigManager } from "@/components/admin/AdminConfigManager"

export default function AdminSettingsPage() {
  return (
    <div className="container mx-auto py-8 px-4 max-w-7xl">
      <header className="mb-8">
        <div className="flex items-center gap-4 mb-2">
          <Button variant="outline" size="icon" asChild>
            <Link href="/admin">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard Settings</h1>
        </div>
        <p className="text-muted-foreground mt-1 ml-12">
          Manage admin dashboard categories and navigation sections
        </p>
      </header>

      <AdminConfigManager />
    </div>
  )
}
