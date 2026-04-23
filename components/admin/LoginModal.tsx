"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog"
import { toast } from 'sonner'
import { AlertCircle, Loader2, ShieldAlert, Eye, EyeOff, Lock } from 'lucide-react'
import { Alert, AlertDescription } from "@/components/ui/alert"

interface LoginModalProps {
  isOpen: boolean
  setIsOpen: (isOpen: boolean) => void
  onLoginSuccess?: () => void
}

export function LoginModal({ isOpen, setIsOpen, onLoginSuccess }: LoginModalProps) {
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isRateLimited, setIsRateLimited] = useState(false)
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)
    setIsRateLimited(false)

    try {
      const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
        credentials: 'include',
      })

      const data = await response.json()

      if (response.status === 429) {
        // Rate limited
        setIsRateLimited(true)
        setError(data.message || 'Too many attempts. Please wait before trying again.')
        toast.error('Account temporarily locked')
        return
      }

      if (response.ok) {
        toast.success('Welcome back!')
        setPassword('')
        setIsOpen(false)
        onLoginSuccess?.()
        router.push('/admin')
      } else {
        setError(data.message || 'Invalid password')
        setPassword('')
        toast.error('Login failed')
      }
    } catch {
      setError('Connection error. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (!open && !isLoading) setIsOpen(open)
    }}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader className="space-y-3">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800">
            <Lock className="h-6 w-6 text-slate-600 dark:text-slate-300" />
          </div>
          <DialogTitle className="text-center text-xl">Admin Access</DialogTitle>
          <DialogDescription className="text-center">
            Enter your password to access the dashboard
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleLogin} className="space-y-4 py-2">
          {error && (
            <Alert variant="destructive" className="py-2">
              {isRateLimited
                ? <ShieldAlert className="h-4 w-4" />
                : <AlertCircle className="h-4 w-4" />
              }
              <AlertDescription className="text-sm">{error}</AlertDescription>
            </Alert>
          )}

          <div className="relative">
            <Input
              id="admin-password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              required
              autoComplete="current-password"
              className="pr-10"
              disabled={isRateLimited || isLoading}
            />
            <button
              type="button"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
              onClick={() => setShowPassword(!showPassword)}
              tabIndex={-1}
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>

          <DialogFooter>
            <Button
              type="submit"
              className="w-full"
              disabled={isLoading || isRateLimited || !password}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Verifying...
                </>
              ) : isRateLimited ? (
                <>
                  <ShieldAlert className="mr-2 h-4 w-4" />
                  Temporarily Locked
                </>
              ) : 'Sign In'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}