'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { format } from 'date-fns'
import { CalendarIcon, Plus, Trash } from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Case } from '@/app/casevault/data/mockCases'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { DialogFooter } from '@/components/ui/dialog'

interface CaseLawFormProps {
  caseData: Partial<Case> | null
  onSave: (data: Partial<Case>) => void
  onCancel: () => void
}

export function CaseLawForm({ caseData, onSave, onCancel }: CaseLawFormProps) {
  const [activeTab, setActiveTab] = useState('basic')
  const [tags, setTags] = useState<string[]>(caseData?.tags || [])
  const [newTag, setNewTag] = useState("")
  const [legalPrinciples, setLegalPrinciples] = useState<string[]>(caseData?.legalPrinciples || [])
  const [newPrinciple, setNewPrinciple] = useState("")
  const [relatedCases, setRelatedCases] = useState<string[]>(caseData?.relatedCases || [])
  const [newRelatedCase, setNewRelatedCase] = useState("")
  const [courtProgression, setCourtProgression] = useState<
    { court: string; date: string; outcome: string; orderSummary: string }[]
  >(caseData?.courtProgression || [])

  const [formData, setFormData] = useState<Partial<Case>>(
    caseData || {
      title: "",
      citation: "",
      court: "",
      judgmentDate: new Date().toISOString(),
      year: new Date().getFullYear(),
      legalArea: "",
      stage: "",
      shortSummary: "",
      facts: "",
      issues: "",
      held: "",
      hasDocument: false,
      isOwnCase: false,
      outcome: "Pending",
      myRole: "",
      clientTestimony: "",
      personalCommentary: {
        challenges: "",
        learnings: "",
        turningPoint: ""
      },
      isHighImpact: false
    }
  )

  const handleChange = (field: keyof Case, value: any) => {
    setFormData({ ...formData, [field]: value })
  }

  const handlePersonalCommentaryChange = (field: string, value: string) => {
    setFormData({
      ...formData,
      personalCommentary: {
        ...(formData.personalCommentary || {}),
        [field]: value
      }
    })
  }

  const handleAddTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()])
      setNewTag("")
    }
  }

  const handleRemoveTag = (tag: string) => {
    setTags(tags.filter(t => t !== tag))
  }

  const handleAddPrinciple = () => {
    if (newPrinciple.trim() && !legalPrinciples.includes(newPrinciple.trim())) {
      setLegalPrinciples([...legalPrinciples, newPrinciple.trim()])
      setNewPrinciple("")
    }
  }

  const handleRemovePrinciple = (principle: string) => {
    setLegalPrinciples(legalPrinciples.filter(p => p !== principle))
  }

  const handleAddRelatedCase = () => {
    if (newRelatedCase.trim() && !relatedCases.includes(newRelatedCase.trim())) {
      setRelatedCases([...relatedCases, newRelatedCase.trim()])
      setNewRelatedCase("")
    }
  }

  const handleRemoveRelatedCase = (relatedCase: string) => {
    setRelatedCases(relatedCases.filter(rc => rc !== relatedCase))
  }

  const handleAddCourtProgression = () => {
    setCourtProgression([
      ...courtProgression,
      { court: "", date: new Date().toISOString(), outcome: "", orderSummary: "" }
    ])
  }

  const handleUpdateCourtProgression = (index: number, field: string, value: string) => {
    const updatedProgression = [...courtProgression]
    updatedProgression[index] = { ...updatedProgression[index], [field]: value }
    setCourtProgression(updatedProgression)
  }

  const handleRemoveCourtProgression = (index: number) => {
    setCourtProgression(courtProgression.filter((_, i) => i !== index))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave({
      ...formData,
      tags,
      legalPrinciples,
      relatedCases,
      courtProgression
    })
  }

  // Predefined court options
  const courtOptions = [
    "Supreme Court",
    "High Court",
    "District Court",
    "National Company Law Tribunal",
    "Consumer Court",
    "Family Court",
    "Civil Court",
    "Criminal Court",
    "Sessions Court",
    "Other"
  ]

  // Predefined legal area options
  const legalAreaOptions = [
    "Criminal",
    "Civil",
    "Family",
    "Constitutional",
    "Commercial",
    "Labor",
    "Intellectual Property",
    "Tax",
    "Environmental",
    "Administrative",
    "Other"
  ]

  // Predefined stage options
  const stageOptions = [
    "Trial",
    "Appeal",
    "Revision",
    "Review",
    "Writ",
    "Supreme Court",
    "High Court"
  ]

  // Predefined outcome options
  const outcomeOptions = [
    "Won",
    "Settled",
    "Dismissed",
    "Pending",
    "Appeal"
  ]

  return (
    <div>
      <form onSubmit={handleSubmit} className="space-y-6 max-h-[65vh] overflow-y-auto pr-2">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-3 mb-6 sticky top-0 z-10 bg-background shadow-sm rounded-lg">
            <TabsTrigger value="basic" className="data-[state=active]:bg-primary/10 transition-all duration-200 hover:bg-muted">
              Basic Information
            </TabsTrigger>
            <TabsTrigger value="content" className="data-[state=active]:bg-primary/10 transition-all duration-200 hover:bg-muted">
              Case Content
            </TabsTrigger>
            <TabsTrigger value="advanced" className="data-[state=active]:bg-primary/10 transition-all duration-200 hover:bg-muted">
              Advanced Details
            </TabsTrigger>
          </TabsList>
          
          {/* Basic Information Tab */}
          <TabsContent value="basic" className="space-y-4 animate-in fade-in-50 duration-300">
            <Card className="border-primary/10 shadow-sm hover:shadow-md transition-all duration-200">
              <CardContent className="pt-6 space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Case Title*</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => handleChange("title", e.target.value)}
                      placeholder="e.g. Smith vs. Jones"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="citation">Citation*</Label>
                    <Input
                      id="citation"
                      value={formData.citation}
                      onChange={(e) => handleChange("citation", e.target.value)}
                      placeholder="e.g. AIR 2023 SC 123"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="court">Court*</Label>
                    <Select
                      value={formData.court}
                      onValueChange={(value) => handleChange("court", value)}
                      required
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a court" />
                      </SelectTrigger>
                      <SelectContent>
                        {courtOptions.map((court) => (
                          <SelectItem key={court} value={court}>
                            {court}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="legalArea">Legal Area*</Label>
                    <Select
                      value={formData.legalArea}
                      onValueChange={(value) => handleChange("legalArea", value)}
                      required
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select legal area" />
                      </SelectTrigger>
                      <SelectContent>
                        {legalAreaOptions.map((area) => (
                          <SelectItem key={area} value={area}>
                            {area}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="judgmentDate">Judgment Date*</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !formData.judgmentDate && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {formData.judgmentDate ? (
                            format(new Date(formData.judgmentDate), "PPP")
                          ) : (
                            <span>Pick a date</span>
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={formData.judgmentDate ? new Date(formData.judgmentDate) : undefined}
                          onSelect={(date) => handleChange("judgmentDate", date?.toISOString() || new Date().toISOString())}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="stage">Stage*</Label>
                    <Select
                      value={formData.stage}
                      onValueChange={(value) => handleChange("stage", value)}
                      required
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select stage" />
                      </SelectTrigger>
                      <SelectContent>
                        {stageOptions.map((stage) => (
                          <SelectItem key={stage} value={stage}>
                            {stage}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Tags</Label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                        {tag}
                        <button
                          type="button"
                          onClick={() => handleRemoveTag(tag)}
                          className="text-xs ml-1 hover:text-destructive"
                        >
                          ×
                        </button>
                      </Badge>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <Input
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      placeholder="Add a tag"
                      className="flex-1"
                    />
                    <Button type="button" onClick={handleAddTag} size="sm">
                      Add
                    </Button>
                  </div>
                </div>

                <div className="flex items-center space-x-2 hover:bg-muted/40 p-2 rounded-md transition-colors duration-200">
                  <Checkbox
                    id="isOwnCase"
                    checked={formData.isOwnCase}
                    onCheckedChange={(checked) => handleChange("isOwnCase", checked)}
                    className="data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground"
                  />
                  <Label htmlFor="isOwnCase" className="cursor-pointer">This is my own litigated case</Label>
                </div>

                <div className="flex items-center space-x-2 hover:bg-muted/40 p-2 rounded-md transition-colors duration-200">
                  <Checkbox
                    id="hasDocument"
                    checked={formData.hasDocument}
                    onCheckedChange={(checked) => handleChange("hasDocument", checked)}
                    className="data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground"
                  />
                  <Label htmlFor="hasDocument" className="cursor-pointer">Has associated document/PDF</Label>
                </div>

                {formData.isOwnCase && (
                  <div className="flex items-center space-x-2 hover:bg-muted/40 p-2 rounded-md transition-colors duration-200">
                    <Checkbox
                      id="isHighImpact"
                      checked={formData.isHighImpact}
                      onCheckedChange={(checked) => handleChange("isHighImpact", checked)}
                      className="data-[state=checked]:bg-amber-500 data-[state=checked]:text-white"
                    />
                    <Label htmlFor="isHighImpact" className="cursor-pointer">Mark as high impact case</Label>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Case Content Tab */}
          <TabsContent value="content" className="space-y-4 animate-in fade-in-50 duration-300">
            <Card className="border-primary/10 shadow-sm hover:shadow-md transition-all duration-200">
              <CardContent className="pt-6 space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="shortSummary">Short Summary*</Label>
                  <Textarea
                    id="shortSummary"
                    value={formData.shortSummary}
                    onChange={(e) => handleChange("shortSummary", e.target.value)}
                    placeholder="Provide a brief summary of the case"
                    rows={2}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="facts">Facts*</Label>
                  <Textarea
                    id="facts"
                    value={formData.facts}
                    onChange={(e) => handleChange("facts", e.target.value)}
                    placeholder="Describe the facts of the case"
                    rows={4}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="issues">Issues*</Label>
                  <Textarea
                    id="issues"
                    value={formData.issues}
                    onChange={(e) => handleChange("issues", e.target.value)}
                    placeholder="What were the legal issues in this case?"
                    rows={3}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="held">Held*</Label>
                  <Textarea
                    id="held"
                    value={formData.held}
                    onChange={(e) => handleChange("held", e.target.value)}
                    placeholder="What did the court decide?"
                    rows={3}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label>Legal Principles</Label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {legalPrinciples.map((principle) => (
                      <Badge key={principle} variant="outline" className="flex items-center gap-1">
                        {principle}
                        <button
                          type="button"
                          onClick={() => handleRemovePrinciple(principle)}
                          className="text-xs ml-1 hover:text-destructive"
                        >
                          ×
                        </button>
                      </Badge>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <Input
                      value={newPrinciple}
                      onChange={(e) => setNewPrinciple(e.target.value)}
                      placeholder="Add a legal principle"
                      className="flex-1"
                    />
                    <Button type="button" onClick={handleAddPrinciple} size="sm">
                      Add
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Related Cases</Label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {relatedCases.map((relCase) => (
                      <Badge key={relCase} variant="outline" className="flex items-center gap-1">
                        {relCase}
                        <button
                          type="button"
                          onClick={() => handleRemoveRelatedCase(relCase)}
                          className="text-xs ml-1 hover:text-destructive"
                        >
                          ×
                        </button>
                      </Badge>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <Input
                      value={newRelatedCase}
                      onChange={(e) => setNewRelatedCase(e.target.value)}
                      placeholder="Add a related case"
                      className="flex-1"
                    />
                    <Button type="button" onClick={handleAddRelatedCase} size="sm">
                      Add
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Advanced Details Tab (Only for Own Cases) */}
          <TabsContent value="advanced" className="space-y-4 animate-in fade-in-50 duration-300">
            <Card className="border-primary/10 shadow-sm hover:shadow-md transition-all duration-200">
              <CardContent className="pt-6 space-y-4">
                {formData.isOwnCase ? (
                  <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="startDate">Start Date</Label>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant={"outline"}
                              className={cn(
                                "w-full justify-start text-left font-normal",
                                !formData.startDate && "text-muted-foreground"
                              )}
                            >
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {formData.startDate ? (
                                format(new Date(formData.startDate), "PPP")
                              ) : (
                                <span>Pick a date</span>
                              )}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={formData.startDate ? new Date(formData.startDate) : undefined}
                              onSelect={(date) => handleChange("startDate", date?.toISOString())}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="completionDate">Completion Date</Label>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant={"outline"}
                              className={cn(
                                "w-full justify-start text-left font-normal",
                                !formData.completionDate && "text-muted-foreground"
                              )}
                            >
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {formData.completionDate ? (
                                format(new Date(formData.completionDate), "PPP")
                              ) : (
                                <span>Pick a date</span>
                              )}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={formData.completionDate ? new Date(formData.completionDate) : undefined}
                              onSelect={(date) => handleChange("completionDate", date?.toISOString())}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="outcome">Outcome</Label>
                        <Select
                          value={formData.outcome || ""}
                          onValueChange={(value) => handleChange("outcome", value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select outcome" />
                          </SelectTrigger>
                          <SelectContent>
                            {outcomeOptions.map((outcome) => (
                              <SelectItem key={outcome} value={outcome}>
                                {outcome}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="myRole">My Role</Label>
                        <Input
                          id="myRole"
                          value={formData.myRole || ""}
                          onChange={(e) => handleChange("myRole", e.target.value)}
                          placeholder="e.g. Lead Counsel, Junior Advocate"
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="clientTestimony">Client Background</Label>
                      <Textarea
                        id="clientTestimony"
                        value={formData.clientTestimony || ""}
                        onChange={(e) => handleChange("clientTestimony", e.target.value)}
                        placeholder="Describe the client's situation and needs"
                        rows={3}
                      />
                    </div>
                    
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <Label>Court Progression</Label>
                        <Button type="button" onClick={handleAddCourtProgression} size="sm" variant="outline">
                          <Plus className="h-4 w-4 mr-1" /> Add Stage
                        </Button>
                      </div>
                      
                      {courtProgression.map((stage, index) => (
                        <div key={index} className="border p-4 rounded-md space-y-3">
                          <div className="flex justify-between items-center">
                            <h4 className="font-medium">Stage {index + 1}</h4>
                            <Button
                              type="button"
                              onClick={() => handleRemoveCourtProgression(index)}
                              size="sm"
                              variant="ghost"
                              className="h-8 w-8 p-0 text-destructive"
                            >
                              <Trash className="h-4 w-4" />
                            </Button>
                          </div>
                          
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div className="space-y-2">
                              <Label>Court</Label>
                              <Input
                                value={stage.court}
                                onChange={(e) => handleUpdateCourtProgression(index, "court", e.target.value)}
                                placeholder="e.g. District Court"
                              />
                            </div>
                            
                            <div className="space-y-2">
                              <Label>Date</Label>
                              <Popover>
                                <PopoverTrigger asChild>
                                  <Button
                                    variant={"outline"}
                                    className={cn(
                                      "w-full justify-start text-left font-normal",
                                      !stage.date && "text-muted-foreground"
                                    )}
                                  >
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {stage.date ? (
                                      format(new Date(stage.date), "PPP")
                                    ) : (
                                      <span>Pick a date</span>
                                    )}
                                  </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="start">
                                  <Calendar
                                    mode="single"
                                    selected={stage.date ? new Date(stage.date) : undefined}
                                    onSelect={(date) => handleUpdateCourtProgression(index, "date", date?.toISOString() || new Date().toISOString())}
                                    initialFocus
                                  />
                                </PopoverContent>
                              </Popover>
                            </div>
                            
                            <div className="space-y-2">
                              <Label>Outcome</Label>
                              <Input
                                value={stage.outcome}
                                onChange={(e) => handleUpdateCourtProgression(index, "outcome", e.target.value)}
                                placeholder="e.g. Dismissed, Allowed"
                              />
                            </div>
                            
                            <div className="space-y-2">
                              <Label>Order Summary</Label>
                              <Input
                                value={stage.orderSummary}
                                onChange={(e) => handleUpdateCourtProgression(index, "orderSummary", e.target.value)}
                                placeholder="Brief summary of the order"
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Personal Commentary</Label>
                      <div className="space-y-3">
                        <div className="space-y-2">
                          <Label htmlFor="challenges" className="text-sm">Challenges</Label>
                          <Textarea
                            id="challenges"
                            value={formData.personalCommentary?.challenges || ""}
                            onChange={(e) => handlePersonalCommentaryChange("challenges", e.target.value)}
                            placeholder="What challenges did you face in this case?"
                            rows={2}
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="learnings" className="text-sm">Key Learnings</Label>
                          <Textarea
                            id="learnings"
                            value={formData.personalCommentary?.learnings || ""}
                            onChange={(e) => handlePersonalCommentaryChange("learnings", e.target.value)}
                            placeholder="What did you learn from this case?"
                            rows={2}
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="turningPoint" className="text-sm">Turning Point</Label>
                          <Textarea
                            id="turningPoint"
                            value={formData.personalCommentary?.turningPoint || ""}
                            onChange={(e) => handlePersonalCommentaryChange("turningPoint", e.target.value)}
                            placeholder="What was the turning point in this case?"
                            rows={2}
                          />
                        </div>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">
                      Advanced details are only available for your own litigated cases.
                      <br />
                      Please check "This is my own litigated case" in the Basic Information tab.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <DialogFooter className="pt-6 flex flex-col sm:flex-row gap-2 sm:gap-0">
          <Button type="button" variant="outline" onClick={onCancel} className="w-full sm:w-auto order-2 sm:order-1 hover:bg-muted transition-colors duration-200">
            Cancel
          </Button>
          <Button type="submit" className="w-full sm:w-auto order-1 sm:order-2 bg-primary hover:bg-primary/90 transition-colors duration-200">
            Save Case
          </Button>
        </DialogFooter>
      </form>
    </div>
  )
} 