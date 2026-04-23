"use client"

import React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  FileText,
  User,
  Star,
  Award,
  Users,
  Link as LinkIcon,
  Settings,
  LogOut,
  Menu,
  X
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { LogoutButton } from "@/components/admin/LogoutButton"

const navItems = [
  {
    category: "Dashboard",
    items: [
      { name: "Overview", href: "/admin", icon: LayoutDashboard },
    ]
  },
  {
    category: "Content Management",
    items: [
      { name: "Posts", href: "/admin/posts", icon: FileText },
      { name: "Works / Portfolio", href: "/admin/works", icon: Award },
      { name: "Expertise", href: "/admin/expertise", icon: Star },
    ]
  },
  {
    category: "Site Management",
    items: [
      { name: "Subscribers", href: "/admin/subscribers", icon: Users },
      { name: "URL Shortener", href: "/admin/url-shortner", icon: LinkIcon },
    ]
  },
  {
    category: "Settings",
    items: [
      { name: "Profile Details", href: "/admin/profile", icon: User },
      { name: "System Settings", href: "/admin/settings", icon: Settings },
    ]
  }
]

export function AdminSidebar({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false)

  const SidebarContent = () => (
    <div className="flex h-full flex-col gap-2">
      <div className="flex h-14 items-center border-b px-6 lg:h-[60px]">
        <Link href="/admin" className="flex items-center gap-2 font-semibold">
          <span className="text-xl tracking-tight text-primary">Admin Portal</span>
        </Link>
      </div>
      <div className="flex-1 overflow-auto py-2">
        <nav className="grid items-start px-4 text-sm font-medium">
          {navItems.map((group, i) => (
            <div key={i} className="mb-6">
              <h4 className="mb-2 px-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                {group.category}
              </h4>
              <div className="space-y-1">
                {group.items.map((item) => {
                  const isActive = pathname === item.href
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center gap-3 rounded-lg px-3 py-2 transition-all ${
                        isActive
                          ? "bg-primary text-primary-foreground hover:bg-primary/90"
                          : "text-muted-foreground hover:bg-muted hover:text-primary"
                      }`}
                    >
                      <item.icon className="h-4 w-4" />
                      {item.name}
                    </Link>
                  )
                })}
              </div>
            </div>
          ))}
        </nav>
      </div>
      <div className="mt-auto border-t p-4">
        <LogoutButton />
      </div>
    </div>
  )

  return (
    <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
      {/* Desktop Sidebar */}
      <div className="hidden border-r bg-muted/40 md:block">
        <SidebarContent />
      </div>

      {/* Mobile Navigation */}
      <div className="flex flex-col">
        <header className="flex h-14 items-center gap-4 border-b bg-muted/40 px-4 lg:h-[60px] md:hidden">
          <Button
            variant="ghost"
            size="icon"
            className="shrink-0"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            <span className="sr-only">Toggle navigation menu</span>
          </Button>
          <span className="text-lg font-semibold tracking-tight text-primary">Admin Portal</span>
        </header>

        {/* Mobile menu overlay */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 top-14 z-50 grid h-[calc(100vh-3.5rem)] grid-flow-row auto-rows-max overflow-auto bg-background pb-32 shadow-md md:hidden">
            <SidebarContent />
          </div>
        )}

        {/* Main Content Area */}
        <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-8 lg:p-8 overflow-x-hidden bg-slate-50 dark:bg-slate-900">
          {children}
        </main>
      </div>
    </div>
  )
}
