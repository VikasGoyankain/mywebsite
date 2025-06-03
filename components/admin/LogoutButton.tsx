"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { toast } from 'sonner'

export function LogoutButton() {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  
  const handleLogout = async () => {
    setIsLoading(true)
    
    try {
      const response = await fetch('/api/admin/login', {
        method: 'DELETE',
      })
      
      if (response.ok) {
        toast.success('Logged out successfully')
        router.push('/admin-login')
      } else {
        toast.error('Failed to log out')
      }
    } catch (error) {
      toast.error('An error occurred during logout')
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }
  
  return (
    <Button 
      variant="outline" 
      onClick={handleLogout} 
      disabled={isLoading} 
      size="sm"
    >
      {isLoading ? 'Logging out...' : 'Logout'}
    </Button>
  )
} 