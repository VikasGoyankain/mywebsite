'use client'

import { useState, useEffect } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Briefcase, GraduationCap, Plus, Search, Trash2, Edit, Eye, Tag, ChevronLeft } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogTrigger, DialogTitle } from '@/components/ui/dialog'
import { ResearchForm } from '@/components/admin/research-form'
import { CaseForm, Case } from '@/components/admin/case-form'
import { DomainForm } from '@/components/admin/domain-form'
import { ResearchStudy, ResearchDomainItem } from '@/lib/models/research'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import Link from 'next/link'

export default function WorksManagementPage() {
  // State for research publications
  const [researchStudies, setResearchStudies] = useState<ResearchStudy[]>([])
  const [filteredResearch, setFilteredResearch] = useState<ResearchStudy[]>([])
  const [researchSearchQuery, setResearchSearchQuery] = useState('')
  const [selectedResearch, setSelectedResearch] = useState<ResearchStudy | null>(null)
  const [isResearchDialogOpen, setIsResearchDialogOpen] = useState(false)
  const [isLoadingResearch, setIsLoadingResearch] = useState(true)

  // State for case studies
  const [cases, setCases] = useState<Case[]>([])
  const [filteredCases, setFilteredCases] = useState<Case[]>([])
  const [caseSearchQuery, setCaseSearchQuery] = useState('')
  const [selectedCase, setSelectedCase] = useState<Case | null>(null)
  const [isCaseDialogOpen, setIsCaseDialogOpen] = useState(false)
  const [isLoadingCases, setIsLoadingCases] = useState(true)

  // State for domains
  const [domains, setDomains] = useState<ResearchDomainItem[]>([])
  const [filteredDomains, setFilteredDomains] = useState<ResearchDomainItem[]>([])
  const [domainSearchQuery, setDomainSearchQuery] = useState('')
  const [selectedDomain, setSelectedDomain] = useState<ResearchDomainItem | null>(null)
  const [isDomainDialogOpen, setIsDomainDialogOpen] = useState(false)
  const [isLoadingDomains, setIsLoadingDomains] = useState(true)
  const [showDomainForm, setShowDomainForm] = useState(false)

  // Fetch research publications
  useEffect(() => {
    const fetchResearch = async () => {
      try {
        setIsLoadingResearch(true)
        const response = await fetch('/api/research')
        if (!response.ok) {
          throw new Error('Failed to fetch research studies')
        }
        const data = await response.json()
        setResearchStudies(data)
        setFilteredResearch(data)
      } catch (error) {
        console.error('Error fetching research:', error)
        toast.error('Failed to load research publications')
      } finally {
        setIsLoadingResearch(false)
      }
    }

    fetchResearch()
  }, [])

  // Fetch case studies
  useEffect(() => {
    const fetchCases = async () => {
      try {
        setIsLoadingCases(true)
        const response = await fetch('/api/cases')
        if (!response.ok) {
          throw new Error('Failed to fetch cases')
        }
        const data = await response.json()
        setCases(data)
        setFilteredCases(data)
      } catch (error) {
        console.error('Error fetching cases:', error)
        toast.error('Failed to load case studies')
      } finally {
        setIsLoadingCases(false)
      }
    }

    fetchCases()
  }, [])

  // Fetch domains
  useEffect(() => {
    const fetchDomains = async () => {
      try {
        setIsLoadingDomains(true)
        const response = await fetch('/api/research/domains')
        if (!response.ok) {
          throw new Error('Failed to fetch domains')
        }
        const data = await response.json()
        setDomains(data)
        setFilteredDomains(data)
      } catch (error) {
        console.error('Error fetching domains:', error)
        toast.error('Failed to load research domains')
      } finally {
        setIsLoadingDomains(false)
      }
    }

    fetchDomains()
  }, [])

  // Filter research based on search query
  useEffect(() => {
    if (researchSearchQuery.trim() === '') {
      setFilteredResearch(researchStudies)
    } else {
      const query = researchSearchQuery.toLowerCase()
      const filtered = researchStudies.filter(
        study => 
          study.title.toLowerCase().includes(query) || 
          study.abstract.toLowerCase().includes(query) ||
          study.domain.toLowerCase().includes(query)
      )
      setFilteredResearch(filtered)
    }
  }, [researchStudies, researchSearchQuery])

  // Filter cases based on search query
  useEffect(() => {
    if (caseSearchQuery.trim() === '') {
      setFilteredCases(cases)
    } else {
      const query = caseSearchQuery.toLowerCase()
      const filtered = cases.filter(
        item => 
          item.title.toLowerCase().includes(query) || 
          item.description.toLowerCase().includes(query) ||
          item.court.toLowerCase().includes(query) ||
          item.category.toLowerCase().includes(query)
      )
      setFilteredCases(filtered)
    }
  }, [cases, caseSearchQuery])

  // Filter domains based on search query
  useEffect(() => {
    if (domainSearchQuery.trim() === '') {
      setFilteredDomains(domains)
    } else {
      const query = domainSearchQuery.toLowerCase()
      const filtered = domains.filter(
        domain => 
          domain.name.toLowerCase().includes(query) || 
          (domain.description && domain.description.toLowerCase().includes(query))
      )
      setFilteredDomains(filtered)
    }
  }, [domains, domainSearchQuery])

  // Handle research publication save
  const handleResearchSave = async (data: Partial<ResearchStudy>) => {
    try {
      const isEditing = Boolean(data.id)
      const method = isEditing ? 'PUT' : 'POST'
      const url = isEditing ? `/api/research?id=${data.id}` : '/api/research'
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })
      
      const responseData = await response.json()
      
      if (!response.ok) {
        throw new Error(responseData.message || `Failed to ${isEditing ? 'update' : 'create'} research study`)
      }
      
      if (isEditing) {
        setResearchStudies(prev => 
          prev.map(item => item.id === responseData.id ? responseData : item)
        )
      } else {
        setResearchStudies(prev => [...prev, responseData])
      }
      
      setIsResearchDialogOpen(false)
      setSelectedResearch(null)
      toast.success(`Research publication ${isEditing ? 'updated' : 'created'} successfully`)
    } catch (error) {
      console.error('Error saving research:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to save research publication')
    }
  }

  // Handle case study save
  const handleCaseSave = async (data: Partial<Case>) => {
    try {
      const isEditing = Boolean(data.id)
      const method = isEditing ? 'PUT' : 'POST'
      const url = isEditing ? `/api/cases?id=${data.id}` : '/api/cases'
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })
      
      // Check if the response is JSON
      const contentType = response.headers.get('content-type')
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text()
        console.error('Non-JSON response:', text)
        throw new Error(`Server returned non-JSON response: ${response.status} ${response.statusText}`)
      }
      
      const responseData = await response.json()
      
      if (!response.ok) {
        throw new Error(responseData.message || `Failed to ${isEditing ? 'update' : 'create'} case study`)
      }
      
      if (isEditing) {
        setCases(prev => 
          prev.map(item => item.id === responseData.id ? responseData : item)
        )
      } else {
        setCases(prev => [...prev, responseData])
      }
      
      setIsCaseDialogOpen(false)
      setSelectedCase(null)
      toast.success(`Case study ${isEditing ? 'updated' : 'created'} successfully`)
    } catch (error) {
      console.error('Error saving case:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to save case study')
    }
  }

  // Handle research publication delete
  const handleResearchDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this research publication?')) {
      return
    }

    try {
      const response = await fetch(`/api/research?id=${id}`, {
        method: 'DELETE'
      })
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete research study')
      }
      
      setResearchStudies(prev => prev.filter(item => item.id !== id))
      toast.success('Research publication deleted successfully')
    } catch (error) {
      console.error('Error deleting research:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to delete research publication')
    }
  }

  // Handle case study delete
  const handleCaseDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this case study?')) {
      return
    }

    try {
      const response = await fetch(`/api/cases?id=${id}`, {
        method: 'DELETE'
      })
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete case study')
      }
      
      setCases(prev => prev.filter(item => item.id !== id))
      toast.success('Case study deleted successfully')
    } catch (error) {
      console.error('Error deleting case:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to delete case study')
    }
  }

  // Handle domain save
  const handleDomainSave = async (data: Partial<ResearchDomainItem>) => {
    try {
      const isEditing = Boolean(data.id)
      const method = isEditing ? 'PUT' : 'POST'
      const url = isEditing ? `/api/research/domains?id=${data.id}` : '/api/research/domains'
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })
      
      const responseData = await response.json()
      
      if (!response.ok) {
        throw new Error(responseData.message || `Failed to ${isEditing ? 'update' : 'create'} domain`)
      }
      
      if (isEditing) {
        setDomains(prev => 
          prev.map(item => item.id === responseData.id ? responseData : item)
        )
        
        // If editing a domain, refresh research publications to update domain references
        const refreshResearch = async () => {
          try {
            const response = await fetch('/api/research')
            if (response.ok) {
              const data = await response.json()
              setResearchStudies(data)
              setFilteredResearch(data)
            }
          } catch (error) {
            console.error('Error refreshing research:', error)
          }
        }
        
        refreshResearch()
      } else {
        setDomains(prev => [...prev, responseData])
      }
      
      setIsDomainDialogOpen(false)
      setSelectedDomain(null)
      setShowDomainForm(false)
      toast.success(`Domain ${isEditing ? 'updated' : 'created'} successfully`)
    } catch (error) {
      console.error('Error saving domain:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to save domain')
    }
  }

  // Handle domain delete
  const handleDomainDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this domain?')) {
      return
    }

    try {
      const response = await fetch(`/api/research/domains?id=${id}`, {
        method: 'DELETE'
      })
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete domain')
      }
      
      setDomains(prev => prev.filter(item => item.id !== id))
      toast.success('Domain deleted successfully')
    } catch (error) {
      console.error('Error deleting domain:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to delete domain')
    }
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-7xl">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold tracking-tight">My Works Management</h1>
        <Link href="/admin">
          <Button variant="outline" className="gap-2">
            <ChevronLeft className="h-4 w-4" />
            Back to Admin
          </Button>
        </Link>
      </div>
      
      <Tabs defaultValue="research" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 mb-4">
          <TabsTrigger value="research" className="flex items-center gap-2">
            <GraduationCap className="h-4 w-4" />
            Research Publications
          </TabsTrigger>
          <TabsTrigger value="cases" className="flex items-center gap-2">
            <Briefcase className="h-4 w-4" />
            Legal Case Studies
          </TabsTrigger>
        </TabsList>
        
        {/* Research Publications Tab */}
        <TabsContent value="research" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex justify-between items-center">
                <span>Research Publications</span>
                <div className="flex gap-2">
                  <Dialog open={isDomainDialogOpen} onOpenChange={(open) => {
                    setIsDomainDialogOpen(open)
                    if (!open) {
                      setShowDomainForm(false)
                      setSelectedDomain(null)
                    }
                  }}>
                    <DialogTrigger asChild>
                      <Button 
                        onClick={() => setSelectedDomain(null)}
                        variant="outline"
                        className="flex items-center gap-2"
                      >
                        <Tag className="h-4 w-4" />
                        Manage Domains
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                      <DialogTitle>Manage Research Domains</DialogTitle>
                      {!showDomainForm && (
                        <div className="flex justify-between items-center mb-4">
                          <Input
                            placeholder="Search domains..."
                            value={domainSearchQuery}
                            onChange={(e) => setDomainSearchQuery(e.target.value)}
                            className="max-w-sm"
                          />
                          <Button 
                            onClick={() => {
                              setShowDomainForm(true)
                              setSelectedDomain(null)
                            }}
                            className="flex items-center gap-2"
                          >
                            <Plus className="h-4 w-4" />
                            Add Domain
                          </Button>
                        </div>
                      )}
                      
                      {showDomainForm || selectedDomain !== null ? (
                        <div className="mt-4">
                          <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-medium">{selectedDomain ? 'Edit Domain' : 'Add New Domain'}</h3>
                            <Button 
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setShowDomainForm(false)
                                setSelectedDomain(null)
                              }}
                            >
                              Back to List
                            </Button>
                          </div>
                          <DomainForm
                            domain={selectedDomain || undefined}
                            onSave={(data) => {
                              handleDomainSave(data)
                              setSelectedDomain(null)
                              setShowDomainForm(false)
                            }}
                            onCancel={() => {
                              setSelectedDomain(null)
                              setShowDomainForm(false)
                            }}
                          />
                        </div>
                      ) : (
                        <div className="rounded-md border mt-4">
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Name</TableHead>
                                <TableHead>Description</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {isLoadingDomains ? (
                                <TableRow>
                                  <TableCell colSpan={3} className="text-center py-8">
                                    Loading domains...
                                  </TableCell>
                                </TableRow>
                              ) : filteredDomains.length === 0 ? (
                                <TableRow>
                                  <TableCell colSpan={3} className="text-center py-8">
                                    No domains found.
                                  </TableCell>
                                </TableRow>
                              ) : (
                                filteredDomains.map((domain) => (
                                  <TableRow key={domain.id}>
                                    <TableCell className="font-medium">{domain.name}</TableCell>
                                    <TableCell className="max-w-xs truncate">{domain.description || '-'}</TableCell>
                                    <TableCell className="text-right">
                                      <div className="flex justify-end gap-2">
                                        <Button
                                          variant="ghost"
                                          size="icon"
                                          onClick={() => handleDomainDelete(domain.id)}
                                        >
                                          <Trash2 className="h-4 w-4" />
                                          <span className="sr-only">Delete</span>
                                        </Button>
                                      </div>
                                    </TableCell>
                                  </TableRow>
                                ))
                              )}
                            </TableBody>
                          </Table>
                        </div>
                      )}
                    </DialogContent>
                  </Dialog>
                  <Dialog open={isResearchDialogOpen} onOpenChange={setIsResearchDialogOpen}>
                    <DialogTrigger asChild>
                      <Button 
                        onClick={() => setSelectedResearch(null)}
                        className="flex items-center gap-2"
                      >
                        <Plus className="h-4 w-4" />
                        Add Publication
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                      <DialogTitle>{selectedResearch ? 'Edit Publication' : 'Add Publication'}</DialogTitle>
                      <ResearchForm 
                        research={selectedResearch || undefined}
                        onSave={handleResearchSave}
                        onCancel={() => {
                          setIsResearchDialogOpen(false)
                          setSelectedResearch(null)
                        }}
                      />
                    </DialogContent>
                  </Dialog>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <Input
                  placeholder="Search publications..."
                  value={researchSearchQuery}
                  onChange={(e) => setResearchSearchQuery(e.target.value)}
                  className="max-w-sm"
                />
              </div>
              
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Title</TableHead>
                      <TableHead>Domain</TableHead>
                      <TableHead>Year</TableHead>
                      <TableHead>Featured</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoadingResearch ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-8">
                          Loading research publications...
                        </TableCell>
                      </TableRow>
                    ) : filteredResearch.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-8">
                          No research publications found.
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredResearch.map((study) => (
                        <TableRow key={study.id}>
                          <TableCell className="font-medium">{study.title}</TableCell>
                          <TableCell>{study.domain}</TableCell>
                          <TableCell>{study.year}</TableCell>
                          <TableCell>
                            {study.featured ? (
                              <Badge variant="default">Featured</Badge>
                            ) : (
                              <Badge variant="outline">No</Badge>
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => {
                                  setSelectedResearch(study)
                                  setIsResearchDialogOpen(true)
                                }}
                              >
                                <Edit className="h-4 w-4" />
                                <span className="sr-only">Edit</span>
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleResearchDelete(study.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                                <span className="sr-only">Delete</span>
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                asChild
                              >
                                <a href={`/research?preview=${study.id}`} target="_blank" rel="noopener noreferrer">
                                  <Eye className="h-4 w-4" />
                                  <span className="sr-only">View</span>
                                </a>
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Legal Case Studies Tab */}
        <TabsContent value="cases" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex justify-between items-center">
                <span>Legal Case Studies</span>
                <Dialog open={isCaseDialogOpen} onOpenChange={setIsCaseDialogOpen}>
                  <DialogTrigger asChild>
                    <Button 
                      onClick={() => setSelectedCase(null)}
                      className="flex items-center gap-2"
                    >
                      <Plus className="h-4 w-4" />
                      Add Case Study
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                    <DialogTitle>{selectedCase ? 'Edit Case Study' : 'Add Case Study'}</DialogTitle>
                    <CaseForm 
                      caseData={selectedCase || undefined}
                      onSave={handleCaseSave}
                      onCancel={() => {
                        setIsCaseDialogOpen(false)
                        setSelectedCase(null)
                      }}
                    />
                  </DialogContent>
                </Dialog>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <Input
                  placeholder="Search case studies..."
                  value={caseSearchQuery}
                  onChange={(e) => setCaseSearchQuery(e.target.value)}
                  className="max-w-sm"
                />
              </div>
              
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Title</TableHead>
                      <TableHead>Court</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Year</TableHead>
                      <TableHead>Outcome</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoadingCases ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8">
                          Loading case studies...
                        </TableCell>
                      </TableRow>
                    ) : filteredCases.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8">
                          No case studies found.
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredCases.map((caseItem) => (
                        <TableRow key={caseItem.id}>
                          <TableCell className="font-medium">{caseItem.title}</TableCell>
                          <TableCell>{caseItem.court}</TableCell>
                          <TableCell>{caseItem.category}</TableCell>
                          <TableCell>{caseItem.year}</TableCell>
                          <TableCell>
                            <Badge 
                              variant={
                                caseItem.outcome === 'In favour of client' ? 'default' :
                                caseItem.outcome === 'Lost' ? 'destructive' :
                                caseItem.outcome === 'Ongoing' ? 'default' :
                                caseItem.outcome === 'Settlement' ? 'secondary' : 'outline'
                              }
                            >
                              {caseItem.outcome}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => {
                                  setSelectedCase(caseItem)
                                  setIsCaseDialogOpen(true)
                                }}
                              >
                                <Edit className="h-4 w-4" />
                                <span className="sr-only">Edit</span>
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleCaseDelete(caseItem.id || '')}
                              >
                                <Trash2 className="h-4 w-4" />
                                <span className="sr-only">Delete</span>
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                asChild
                              >
                                <a href={`/courtroom?preview=${caseItem.id}`} target="_blank" rel="noopener noreferrer">
                                  <Eye className="h-4 w-4" />
                                  <span className="sr-only">View</span>
                                </a>
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
} 