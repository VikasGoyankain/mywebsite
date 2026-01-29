'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { 
  Trash2, 
  Edit, 
  Plus, 
  Search, 
  Filter, 
  Scale, 
  AlertCircle,
  Loader2,
  BookOpen,
  Star,
  ExternalLink
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Badge } from '@/components/ui/badge'
import { CaseLawForm } from './components/CaseLawForm'
import { Case } from '@/app/casevault/data/mockCases'

export default function CaseLawAdmin() {
  const router = useRouter()
  const [cases, setCases] = useState<Case[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editingCase, setEditingCase] = useState<Case | null>(null)
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const [caseToDelete, setCaseToDelete] = useState<string | null>(null)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [seedLoading, setSeedLoading] = useState(false)

  // Fetch cases on component mount
  useEffect(() => {
    fetchCases()
  }, [])

  const fetchCases = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/casevault')
      
      if (!response.ok) {
        throw new Error('Failed to fetch cases')
      }
      
      const data = await response.json()
      setCases(data)
    } catch (err) {
      console.error('Error fetching cases:', err)
      setError('Failed to load cases. Please try again later.')
    } finally {
      setLoading(false)
    }
  }

  const handleAddNew = () => {
    setEditingCase(null)
    setShowForm(true)
  }

  const handleEdit = (caseItem: Case) => {
    setEditingCase(caseItem)
    setShowForm(true)
  }

  const handleDelete = (id: string) => {
    setCaseToDelete(id)
    setDeleteConfirmOpen(true)
  }

  const confirmDelete = async () => {
    if (!caseToDelete) return
    
    try {
      setDeleteLoading(true)
      const response = await fetch(`/api/casevault?id=${caseToDelete}`, {
        method: 'DELETE',
      })
      
      if (!response.ok) {
        throw new Error('Failed to delete case')
      }
      
      // Remove from state
      setCases(cases.filter(c => c.id !== caseToDelete))
      alert('Case deleted successfully')
    } catch (err) {
      console.error('Error deleting case:', err)
      alert('Failed to delete case')
    } finally {
      setDeleteLoading(false)
      setDeleteConfirmOpen(false)
      setCaseToDelete(null)
    }
  }

  const handleSaveCase = async (data: any) => {
    try {
      const isEditing = !!data.id
      const url = isEditing ? `/api/casevault?id=${data.id}` : '/api/casevault'
      const method = isEditing ? 'PUT' : 'POST'
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })
      
      if (!response.ok) {
        throw new Error(isEditing ? 'Failed to update case' : 'Failed to create case')
      }
      
      const savedCase = await response.json()
      
      if (isEditing) {
        setCases(cases.map(c => c.id === savedCase.id ? savedCase : c))
        alert('Case updated successfully')
      } else {
        setCases([savedCase, ...cases])
        alert('Case created successfully')
      }
      
      setShowForm(false)
    } catch (err) {
      console.error('Error saving case:', err)
      alert('Failed to save case')
    }
  }

  const handleSeedDatabase = async () => {
    try {
      setSeedLoading(true)
      const response = await fetch('/api/casevault/seed?key=demo-key', {
        method: 'POST',
      })
      
      if (!response.ok) {
        const data = await response.json()
        if (response.status === 409) {
          // Cases already exist
          if (confirm(data.message + ' Do you want to force overwrite?')) {
            handleForceSeed()
          }
          return
        }
        throw new Error('Failed to seed database')
      }
      
      const data = await response.json()
      alert(`Seeded database with ${data.cases.length} cases`)
      fetchCases() // Refresh the list
    } catch (err) {
      console.error('Error seeding database:', err)
      alert('Failed to seed database')
    } finally {
      setSeedLoading(false)
    }
  }

  const handleForceSeed = async () => {
    try {
      setSeedLoading(true)
      const response = await fetch('/api/casevault/seed?key=demo-key&force=true', {
        method: 'POST',
      })
      
      if (!response.ok) {
        throw new Error('Failed to seed database')
      }
      
      const data = await response.json()
      alert(`Seeded database with ${data.cases.length} cases`)
      fetchCases() // Refresh the list
    } catch (err) {
      console.error('Error seeding database:', err)
      alert('Failed to seed database')
    } finally {
      setSeedLoading(false)
    }
  }

  const filteredCases = cases.filter(caseItem => {
    if (!searchQuery) return true
    
    const query = searchQuery.toLowerCase()
    return (
      caseItem.title.toLowerCase().includes(query) ||
      caseItem.citation.toLowerCase().includes(query) ||
      caseItem.court.toLowerCase().includes(query) ||
      caseItem.legalArea.toLowerCase().includes(query) ||
      (caseItem.tags && caseItem.tags.some(tag => tag.toLowerCase().includes(query)))
    )
  })

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Case Law Management</h1>
          <p className="text-muted-foreground">
            Add, edit, and manage legal case records
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Button 
            variant="outline" 
            onClick={handleSeedDatabase}
            disabled={seedLoading}
          >
            {seedLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Seeding...
              </>
            ) : (
              <>
                <BookOpen className="mr-2 h-4 w-4" />
                Seed Database
              </>
            )}
          </Button>
          <Button onClick={handleAddNew}>
            <Plus className="mr-2 h-4 w-4" />
            Add New Case
          </Button>
        </div>
      </div>

      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search cases by title, citation, court, or tags..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon">
                  <Filter className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setSearchQuery('')}>
                  All Cases
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSearchQuery('Criminal')}>
                  Criminal Law
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSearchQuery('Civil')}>
                  Civil Law
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSearchQuery('Constitutional')}>
                  Constitutional Law
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Legal Cases ({filteredCases.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <AlertCircle className="h-10 w-10 text-destructive mb-2" />
              <p className="text-lg font-medium">{error}</p>
              <Button onClick={fetchCases} className="mt-4">
                Try Again
              </Button>
            </div>
          ) : filteredCases.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <Scale className="h-10 w-10 text-muted-foreground mb-2" />
              <p className="text-lg font-medium">No cases found</p>
              <p className="text-muted-foreground mb-4">
                {searchQuery ? 'Try adjusting your search query' : 'Add your first case to get started'}
              </p>
              {!searchQuery && (
                <Button onClick={handleAddNew}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add New Case
                </Button>
              )}
            </div>
          ) : (
            <div className="border rounded-md">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Case Title</TableHead>
                    <TableHead>Citation</TableHead>
                    <TableHead>Legal Area</TableHead>
                    <TableHead>Court</TableHead>
                    <TableHead>Year</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCases.map((caseItem) => (
                    <TableRow key={caseItem.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          {caseItem.title}
                          {caseItem.isHighImpact && (
                            <Star className="h-4 w-4 text-amber-500 fill-amber-500" />
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="font-mono text-xs">{caseItem.citation}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="bg-primary/5">
                          {caseItem.legalArea}
                        </Badge>
                      </TableCell>
                      <TableCell>{caseItem.court}</TableCell>
                      <TableCell>{caseItem.year}</TableCell>
                      <TableCell>
                        {caseItem.isOwnCase ? (
                          <Badge className="bg-amber-100 text-amber-800">Own Case</Badge>
                        ) : (
                          <Badge variant="secondary">Academic</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => router.push(`/casevault/${caseItem.id}`)}
                          >
                            <ExternalLink className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEdit(caseItem)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-destructive hover:text-destructive"
                            onClick={() => handleDelete(caseItem.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Case</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this case? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteConfirmOpen(false)}
              disabled={deleteLoading}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDelete}
              disabled={deleteLoading}
            >
              {deleteLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add/Edit Case Form Dialog */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingCase ? 'Edit Case' : 'Add New Case'}
            </DialogTitle>
          </DialogHeader>
          <CaseLawForm
            caseData={editingCase || undefined}
            onSave={handleSaveCase}
            onCancel={() => setShowForm(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  )
} 