"use client"

import { useState, useEffect } from "react"
import { useProfileStore } from "@/lib/profile-store"

export default function SimpleAdminDashboard() {
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const { 
    profileData,
    isLoading,
    updateProfileData
  } = useProfileStore()

  useEffect(() => {
    try {
      console.log("Simple admin dashboard loading")
      setLoading(false)
    } catch (err: any) {
      console.error("Error loading simple admin:", err)
      setError(err.message || "Unknown error")
      setLoading(false)
    }
  }, [])

  if (loading) {
    return <div className="p-8">Loading...</div>
  }

  if (error) {
    return <div className="p-8 text-red-500">Error: {error}</div>
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Simple Admin Dashboard</h1>
      
      <div className="bg-white p-4 rounded-lg shadow mb-4">
        <h2 className="text-xl font-medium mb-2">Profile Data</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Name</label>
            <input 
              type="text"
              className="border rounded p-2 w-full"
              value={profileData.name}
              onChange={e => updateProfileData({ name: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Title</label>
            <input 
              type="text"
              className="border rounded p-2 w-full"
              value={profileData.title}
              onChange={e => updateProfileData({ title: e.target.value })}
            />
          </div>
        </div>
      </div>

      <pre className="bg-gray-100 p-4 rounded text-xs">
        {JSON.stringify(profileData, null, 2)}
      </pre>
    </div>
  )
} 