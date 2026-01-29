"use client"

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from 'sonner'
import { AlertCircle, Check, Loader2, Eye, EyeOff } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from "@/components/ui/alert"
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog"

export function PasswordChangeForm() {
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [showPassword, setShowPassword] = useState(true)
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false)
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    
    // Validate input
    if (!currentPassword || !newPassword) {
      setError('Both current and new password are required')
      return
    }
    
    // Show confirmation dialog instead of submitting immediately
    setConfirmDialogOpen(true)
  }
  
  const handleConfirmChange = async () => {
    setIsLoading(true)
    setError('')
    
    try {
      const response = await fetch('/api/admin/password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ currentPassword, newPassword }),
      })
      
      const data = await response.json()
      
      if (response.ok) {
        setSuccess('Password updated successfully')
        toast.success('Password has been changed')
        // Clear form
        setCurrentPassword('')
        setNewPassword('')
        // Close confirmation dialog
        setConfirmDialogOpen(false)
      } else {
        setError(data.message || 'Failed to update password')
      }
    } catch (error) {
      setError('An error occurred while updating password')
    } finally {
      setIsLoading(false)
    }
  }
  
  return (
    <Card className="border-t-4 border-amber-400">
      <CardHeader className="space-y-1">
        <CardTitle className="text-xl">Security Settings</CardTitle>
        <CardDescription>
          Change your admin dashboard password
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          {success && (
            <Alert className="mb-4 bg-green-50 text-green-800 border-green-200">
              <Check className="h-4 w-4 text-green-600" />
              <AlertDescription>{success}</AlertDescription>
            </Alert>
          )}
          
          <div className="space-y-2">
            <Label htmlFor="currentPassword">Current Password</Label>
            <div className="relative">
              <Input
                id="currentPassword"
                type={showPassword ? "text" : "password"}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
                className="pr-10"
              />
              <button 
                type="button"
                className="absolute right-2 top-2 text-gray-500 hover:text-gray-700"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="newPassword">New Password</Label>
            <div className="relative">
              <Input
                id="newPassword"
                type={showPassword ? "text" : "password"}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                className="pr-10"
              />
              <button 
                type="button"
                className="absolute right-2 top-2 text-gray-500 hover:text-gray-700"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>
          
          <Button type="submit" variant="outline" className="w-full border-amber-500 text-amber-700 hover:bg-amber-50 hover:text-amber-800">
            Change Password
          </Button>
        </form>
        
        {/* Confirmation Dialog */}
        <Dialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Confirm Password Change</DialogTitle>
              <DialogDescription>
                Please review your new password before confirming the change.
              </DialogDescription>
            </DialogHeader>
            
            <div className="py-4">
              <p className="mb-2 text-sm text-gray-500">Your new password will be:</p>
              <code className="block p-3 bg-gray-100 rounded border font-mono">{newPassword}</code>
            </div>
            
            <DialogFooter className="flex gap-2 sm:justify-end">
              <Button 
                variant="outline" 
                onClick={() => setConfirmDialogOpen(false)}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button 
                onClick={handleConfirmChange} 
                disabled={isLoading}
                className="bg-amber-500 hover:bg-amber-600"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Updating...
                  </>
                ) : 'Confirm Change'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  )
} 