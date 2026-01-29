import { ReactNode } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Scale, ChevronLeft } from 'lucide-react'

interface CasevaultAdminLayoutProps {
  children: ReactNode
}

export default function CasevaultAdminLayout({ children }: CasevaultAdminLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2">
                <Scale className="h-8 w-8 text-primary" />
                <div>
                  <h1 className="text-2xl font-bold text-foreground">CaseVault Admin</h1>
                  <p className="text-sm text-muted-foreground">Manage your legal case database</p>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/admin/works">
                <Button variant="ghost" size="sm">
                  <ChevronLeft className="h-4 w-4 mr-2" />
                  Back to Admin
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto py-6">
        {children}
      </main>
    </div>
  )
} 