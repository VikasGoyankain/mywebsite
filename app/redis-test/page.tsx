'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'

export default function RedisTestPage() {
  const [key, setKey] = useState('')
  const [value, setValue] = useState('')
  const [storedData, setStoredData] = useState<Record<string, any>>({})
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const fetchKeys = async () => {
    try {
      setLoading(true)
      setError('')
      const response = await fetch('/api/redis')
      const data = await response.json()
      
      if (data.keys && Array.isArray(data.keys)) {
        const keyValues: Record<string, any> = {}
        
        // Fetch each key's value
        for (const key of data.keys) {
          const valueResponse = await fetch(`/api/redis?key=${encodeURIComponent(key)}`)
          const valueData = await valueResponse.json()
          keyValues[key] = valueData.value
        }
        
        setStoredData(keyValues)
      }
    } catch (err) {
      setError('Failed to fetch keys')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const saveData = async () => {
    if (!key.trim()) {
      setError('Key is required')
      return
    }

    try {
      setLoading(true)
      setError('')
      const response = await fetch('/api/redis', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ key, value }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to save data')
      }

      setKey('')
      setValue('')
      await fetchKeys() // Refresh the data
    } catch (err: any) {
      setError(err.message || 'Failed to save data')
    } finally {
      setLoading(false)
    }
  }

  const deleteData = async (keyToDelete: string) => {
    try {
      setLoading(true)
      setError('')
      const response = await fetch(`/api/redis?key=${encodeURIComponent(keyToDelete)}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to delete data')
      }

      await fetchKeys() // Refresh the data
    } catch (err: any) {
      setError(err.message || 'Failed to delete data')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchKeys()
  }, [])

  return (
    <div className="container py-10">
      <h1 className="text-3xl font-bold mb-8">Redis Test Page</h1>
      
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Add New Key-Value</CardTitle>
            <CardDescription>Store data in your Upstash Redis database</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              <div className="grid gap-2">
                <label htmlFor="key">Key</label>
                <Input 
                  id="key"
                  value={key} 
                  onChange={(e) => setKey(e.target.value)} 
                  placeholder="Enter key" 
                />
              </div>
              <div className="grid gap-2">
                <label htmlFor="value">Value</label>
                <Input 
                  id="value"
                  value={value} 
                  onChange={(e) => setValue(e.target.value)} 
                  placeholder="Enter value" 
                />
              </div>
              {error && <p className="text-red-500 text-sm">{error}</p>}
            </div>
          </CardContent>
          <CardFooter>
            <Button onClick={saveData} disabled={loading}>
              {loading ? 'Saving...' : 'Save to Redis'}
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Stored Data</CardTitle>
            <CardDescription>
              <div className="flex justify-between items-center">
                <span>Data stored in your Redis database</span>
                <Button variant="outline" size="sm" onClick={fetchKeys} disabled={loading}>
                  {loading ? 'Refreshing...' : 'Refresh'}
                </Button>
              </div>
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p>Loading data...</p>
            ) : Object.keys(storedData).length === 0 ? (
              <p className="text-muted-foreground">No data stored yet</p>
            ) : (
              <ul className="space-y-2">
                {Object.entries(storedData).map(([key, value]) => (
                  <li key={key} className="flex items-center justify-between gap-2 p-2 border rounded">
                    <div className="overflow-hidden">
                      <p className="font-medium truncate">{key}</p>
                      <p className="text-sm text-muted-foreground truncate">
                        {typeof value === 'object' 
                          ? JSON.stringify(value) 
                          : String(value)}
                      </p>
                    </div>
                    <Button 
                      variant="destructive" 
                      size="sm"
                      onClick={() => deleteData(key)}
                    >
                      Delete
                    </Button>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 