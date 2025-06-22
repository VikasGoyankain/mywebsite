"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { LoginModal } from './LoginModal'

interface AdminAuthWrapperProps {
  children: React.ReactNode
}

export function AdminAuthWrapper({ children }: AdminAuthWrapperProps) {
  
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null)
  const [showLoginModal, setShowLoginModal] = useState(false)
  const router = useRouter()
  
  // Check authentication on mount
  useEffect(() => {
    // Check if we have a cookie by making a simple authentication check API call
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/admin/check-auth', {
          credentials: 'include' // Include cookies in the request
        })
        
        if (response.ok) {
          setIsAuthenticated(true)
        } else {
          setIsAuthenticated(false)
          setShowLoginModal(true)
        }
      } catch (error) {
        console.error('Auth check failed:', error)
        setIsAuthenticated(false)
        setShowLoginModal(true)
      }
    }
    
    checkAuth()
  }, [])
  
  // Component is still checking auth status
  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading...
      </div>
    )
  }
  
  return (
    <>
      <LoginModal 
        isOpen={showLoginModal} 
        setIsOpen={(isOpen) => {
          setShowLoginModal(isOpen)
          // If the modal was closed and we're still not authenticated, redirect to home
          if (!isOpen && !isAuthenticated) {
            router.push('/')
          }
        }}
        onLoginSuccess={() => {
          setIsAuthenticated(true)
          setShowLoginModal(false)
        }}
      />
      
      {isAuthenticated && children}
    </>
  )
} 