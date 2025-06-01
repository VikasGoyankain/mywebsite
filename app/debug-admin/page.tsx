"use client"

import { useEffect } from 'react'

export default function DebugAdminPage() {
  useEffect(() => {
    const checkAdmin = async () => {
      try {
        console.log("Checking admin authentication...")
        const response = await fetch('/api/admin/check-auth', {
          credentials: 'include' // Include cookies in the request
        })
        
        const data = await response.json()
        console.log("Auth check response:", response.status, data)
        
        // Try to fetch some resources
        const skillsResponse = await fetch("/api/skills?apiKey=admin-secret-key-12345")
        const skillsData = await skillsResponse.json()
        console.log("Skills API response:", skillsResponse.status, skillsData)
        
        // Check profile store
        console.log("Checking if profile-store is accessible...")
        const profileStoreModule = await import('@/lib/profile-store')
        console.log("Profile store imported successfully:", !!profileStoreModule)
        
      } catch (error) {
        console.error('Debug check failed:', error)
      }
    }
    
    checkAdmin()
  }, [])
  
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Admin Debug Page</h1>
      <p>Check the browser console for diagnostics</p>
      <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
        <p>This page attempts to diagnose issues with the admin dashboard.</p>
      </div>
    </div>
  )
} 