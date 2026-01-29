'use client'

import { useState, useEffect } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Briefcase, GraduationCap, Plus, Search, Trash2, Edit, Eye, Tag, ChevronLeft, Scale, Download, Filter, ArrowLeft } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogTrigger, DialogTitle } from '@/components/ui/dialog'
import { ResearchForm } from '@/components/admin/research-form'
import { CaseForm, Case } from '@/components/admin/case-form'
import { CaseLawForm } from '@/components/admin/case-law-form'
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
import { mockCases, Case as CaseItem } from '@/app/casevault/data/mockCases'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import Image from "next/image"
import { cn } from "@/lib/utils"

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
  
  // State for legal cases
  const [legalCaseSearchQuery, setLegalCaseSearchQuery] = useState('')
  const [filterArea, setFilterArea] = useState('')
  const [legalCases, setLegalCases] = useState<CaseItem[]>([])
  const [filteredLegalCases, setFilteredLegalCases] = useState<CaseItem[]>([])
  const [isLoadingLegalCases, setIsLoadingLegalCases] = useState(true)

  // Function to fetch legal cases
  const fetchLegalCases = async () => {
    try {
      setIsLoadingLegalCases(true)
      const response = await fetch('/api/casevault')
      if (!response.ok) {
        throw new Error('Failed to fetch cases')
      }
      const data = await response.json()
      setLegalCases(data)
      setFilteredLegalCases(data)
    } catch (error) {
      console.error('Error fetching cases:', error)
      toast.error('Failed to load legal cases')
    } finally {
      setIsLoadingLegalCases(false)
    }
  }

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
    fetchLegalCases()
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
  
  // Filter legal cases based on search query and area
  useEffect(() => {
    const filtered = mockCases.filter((caseItem: CaseItem) => {
      const matchesSearch = legalCaseSearchQuery === '' || 
        caseItem.title.toLowerCase().includes(legalCaseSearchQuery.toLowerCase()) ||
        caseItem.citation.toLowerCase().includes(legalCaseSearchQuery.toLowerCase());

      const matchesFilter = filterArea === '' || filterArea === 'all' || caseItem.legalArea === filterArea;

      return matchesSearch && matchesFilter;
    });
    
    setFilteredLegalCases(filtered);
  }, [legalCaseSearchQuery, filterArea]);

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
      toast.error('Failed to save research publication')
    }
  }

  // Handle case study save
  const handleCaseSave = async (data: Partial<CaseItem>) => {
    try {
      // For new cases, ensure required fields have default values
      if (!data.id) {
        data = {
          ...data,
          id: crypto.randomUUID(),
          judgmentDate: data.judgmentDate || new Date().toISOString(),
          year: data.year || new Date().getFullYear(),
          tags: data.tags || [],
          legalPrinciples: data.legalPrinciples || [],
          relatedCases: data.relatedCases || [],
          hasDocument: data.hasDocument || false
        };
        
        // For new cases, use POST method directly without checking if case exists
        const response = await fetch('/api/casevault', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data),
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to create case');
        }
        
        const savedCase = await response.json();
        setLegalCases(prev => [savedCase, ...prev]);
        toast.success('Case created successfully');
      } else {
        // For existing cases, use PUT method
        const response = await fetch(`/api/casevault?id=${data.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data),
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to update case');
        }
        
        const savedCase = await response.json();
        setLegalCases(prev => prev.map(c => c.id === savedCase.id ? savedCase : c));
        toast.success('Case updated successfully');
      }
      
      // Refresh the cases list
      fetchLegalCases();
      
    } catch (error) {
      console.error('Error saving case:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to save case');
    }
  };

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

  // Format date helper function
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  // Get legal area color helper function
  const getLegalAreaColor = (area: string) => {
    const colors: { [key: string]: string } = {
      'Criminal': 'bg-red-100 text-red-800',
      'Civil': 'bg-blue-100 text-blue-800',
      'Family': 'bg-purple-100 text-purple-800',
      'Constitutional': 'bg-green-100 text-green-800',
      'Commercial': 'bg-orange-100 text-orange-800',
      'Labor': 'bg-yellow-100 text-yellow-800'
    };
    return colors[area] || 'bg-gray-100 text-gray-800';
  };

  // Handle legal area filter change
  const handleFilterChange = (value: string) => {
    setFilterArea(value === 'all' ? '' : value);
  };

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
          <TabsTrigger value="legal" className="flex items-center gap-2">
            <Scale className="h-4 w-4" />
            Legal Cases
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
        <TabsContent value="legal" className="space-y-6">
          {/* Enhanced Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Cases</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{legalCases.length}</div>
                <p className="text-xs text-muted-foreground">
                  All case records
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Academic Briefs</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {legalCases.filter((c: CaseItem) => !c.isOwnCase).length}
                </div>
                <p className="text-xs text-muted-foreground">
                  Research database
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Litigated Cases</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {legalCases.filter((c: CaseItem) => c.isOwnCase).length}
                </div>
                <p className="text-xs text-muted-foreground">
                  Personal practice
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {(() => {
                    const litigated = legalCases.filter((c: CaseItem) => c.isOwnCase);
                    const won = litigated.filter((c: CaseItem) => c.outcome === 'Won');
                    return litigated.length > 0 ? Math.round((won.length / litigated.length) * 100) : 0;
                  })()}%
                </div>
                <p className="text-xs text-muted-foreground">
                  Won cases ratio
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">This Year</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {legalCases.filter((c: CaseItem) => c.year === new Date().getFullYear()).length}
                </div>
                <p className="text-xs text-muted-foreground">
                  Recent additions
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Enhanced Search and Filters */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Case Management</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search cases by title, citation, or client name..."
                    value={legalCaseSearchQuery}
                    onChange={(e) => setLegalCaseSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={filterArea || 'all'} onValueChange={handleFilterChange}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Filter by area" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Areas</SelectItem>
                    <SelectItem value="Criminal">Criminal</SelectItem>
                    <SelectItem value="Civil">Civil</SelectItem>
                    <SelectItem value="Family">Family</SelectItem>
                    <SelectItem value="Constitutional">Constitutional</SelectItem>
                    <SelectItem value="Commercial">Commercial</SelectItem>
                    <SelectItem value="Labor">Labor</SelectItem>
                  </SelectContent>
                </Select>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Case
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-4xl max-h-[90vh] w-[90vw] overflow-hidden p-0">
                    <DialogTitle className="px-6 pt-6">Add New Legal Case</DialogTitle>
                    <div className="overflow-y-auto px-6 pb-6 max-h-[calc(90vh-100px)]">
                      <CaseLawForm 
                        caseData={null} 
                        onSave={handleCaseSave}
                        onCancel={() => {}} 
                      />
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CardContent>
          </Card>

          {/* Enhanced Cases Table */}
          <Card>
            <CardHeader>
              <CardTitle>Cases ({filteredLegalCases.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoadingLegalCases ? (
                <div className="flex justify-center items-center py-8">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                </div>
              ) : filteredLegalCases.length === 0 ? (
                <div className="text-center py-8">
                  <Scale className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">No cases found</h3>
                  <p className="text-muted-foreground mb-4">
                    {legalCaseSearchQuery || filterArea ? 
                      "Try adjusting your search or filters" : 
                      "Add your first case to get started"}
                  </p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Case Title</TableHead>
                      <TableHead>Citation</TableHead>
                      <TableHead>Court</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Area</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredLegalCases.map((caseItem) => (
                      <TableRow key={caseItem.id}>
                        <TableCell className="font-medium max-w-xs">
                          <div className="truncate">
                            {caseItem.title}
                          </div>
                        </TableCell>
                        <TableCell className="font-mono text-sm">
                          {caseItem.citation}
                        </TableCell>
                        <TableCell>{caseItem.court}</TableCell>
                        <TableCell>{formatDate(caseItem.judgmentDate)}</TableCell>
                        <TableCell>
                          <Badge className={`${getLegalAreaColor(caseItem.legalArea)} text-xs`}>
                            {caseItem.legalArea}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge 
                            variant={caseItem.isOwnCase ? "default" : "secondary"} 
                            className={`text-xs ${caseItem.isOwnCase ? 'bg-amber-600 text-white' : ''}`}
                          >
                            {caseItem.isOwnCase ? 'Litigated' : 'Academic'}
                          </Badge>
                          {caseItem.isOwnCase && caseItem.myRole && (
                            <div className="text-xs text-muted-foreground mt-1 truncate max-w-[120px]">
                              {caseItem.myRole}
                            </div>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-xs">
                            {caseItem.outcome || caseItem.stage}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button variant="ghost" size="sm" asChild>
                              <Link href={`/casevault/${caseItem.id}`}>
                                <Eye className="h-4 w-4" />
                              </Link>
                            </Button>
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  <Edit className="h-4 w-4" />
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-4xl max-h-[90vh] w-[90vw] overflow-hidden p-0">
                                <DialogTitle className="px-6 pt-6">Edit Legal Case</DialogTitle>
                                <div className="overflow-y-auto px-6 pb-6 max-h-[calc(90vh-100px)]">
                                  <CaseLawForm 
                                    caseData={caseItem}
                                    onSave={(data) => {
                                      // Call the API to update the case
                                      fetch(`/api/casevault?id=${caseItem.id}`, {
                                        method: 'PUT',
                                        headers: {
                                          'Content-Type': 'application/json',
                                        },
                                        body: JSON.stringify(data),
                                      })
                                      .then(response => {
                                        if (!response.ok) {
                                          throw new Error('Failed to update case');
                                        }
                                        return response.json();
                                      })
                                      .then(updatedCase => {
                                        // Update the case in the local state
                                        setLegalCases(prev => 
                                          prev.map(c => c.id === updatedCase.id ? updatedCase : c)
                                        );
                                        toast.success('Case updated successfully');
                                      })
                                      .catch(error => {
                                        console.error('Error updating case:', error);
                                        toast.error('Failed to update case');
                                      });
                                    }}
                                    onCancel={() => {}}
                                  />
                                </div>
                              </DialogContent>
                            </Dialog>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="text-red-500 hover:text-red-700"
                              onClick={() => {
                                if (confirm('Are you sure you want to delete this case?')) {
                                  // Call the API to delete the case
                                  fetch(`/api/casevault?id=${caseItem.id}`, {
                                    method: 'DELETE',
                                  })
                                  .then(response => {
                                    if (!response.ok) {
                                      throw new Error('Failed to delete case');
                                    }
                                    return response.json();
                                  })
                                  .then(() => {
                                    // Remove the case from the local state
                                    setLegalCases(prev => 
                                      prev.filter(c => c.id !== caseItem.id)
                                    );
                                    toast.success('Case deleted successfully');
                                  })
                                  .catch(error => {
                                    console.error('Error deleting case:', error);
                                    toast.error('Failed to delete case');
                                  });
                                }
                              }}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
} 