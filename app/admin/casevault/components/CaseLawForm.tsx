'use client'

import React, { useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import * as z from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { format } from 'date-fns'
import { CalendarIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Case } from '@/app/casevault/data/mockCases'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent } from '@/components/ui/card'

// Define the form schema with Zod
const caseLawSchema = z.object({
  title: z.string().min(5, { message: 'Title must be at least 5 characters' }),
  citation: z.string().min(3, { message: 'Citation is required' }),
  court: z.string().min(3, { message: 'Court is required' }),
  judgmentDate: z.date({ required_error: 'Judgment date is required' }),
  year: z.number().int().positive(),
  legalArea: z.string().min(1, { message: 'Legal area is required' }),
  stage: z.string().min(1, { message: 'Stage is required' }),
  tags: z.string().optional(),
  shortSummary: z.string().min(10, { message: 'Summary is required' }),
  facts: z.string().min(10, { message: 'Facts are required' }),
  issues: z.string().min(10, { message: 'Issues are required' }),
  held: z.string().min(10, { message: 'Held is required' }),
  legalPrinciples: z.string().optional(),
  relatedCases: z.string().optional(),
  hasDocument: z.boolean().default(false),
  complexity: z.number().int().min(1).max(5),
  isOwnCase: z.boolean().default(false),
  outcome: z.string().optional(),
  myRole: z.string().optional(),
  clientTestimony: z.string().optional(),
  startDate: z.date().optional(),
  completionDate: z.date().optional(),
  isHighImpact: z.boolean().default(false),
})

type CaseLawFormValues = z.infer<typeof caseLawSchema>

interface CaseLawFormProps {
  caseData?: Case
  onSave: (data: any) => void
  onCancel: () => void
}

export function CaseLawForm({ caseData, onSave, onCancel }: CaseLawFormProps) {
  const [activeTab, setActiveTab] = useState('basic')

  // Convert string arrays to comma-separated strings for the form
  const defaultValues: Partial<CaseLawFormValues> = {
    title: caseData?.title || '',
    citation: caseData?.citation || '',
    court: caseData?.court || '',
    judgmentDate: caseData?.judgmentDate ? new Date(caseData.judgmentDate) : new Date(),
    year: caseData?.year || new Date().getFullYear(),
    legalArea: caseData?.legalArea || '',
    stage: caseData?.stage || '',
    tags: caseData?.tags ? caseData.tags.join(', ') : '',
    shortSummary: caseData?.shortSummary || '',
    facts: caseData?.facts || '',
    issues: caseData?.issues || '',
    held: caseData?.held || '',
    legalPrinciples: caseData?.legalPrinciples ? caseData.legalPrinciples.join('\n') : '',
    relatedCases: caseData?.relatedCases ? caseData.relatedCases.join('\n') : '',
    hasDocument: caseData?.hasDocument || false,
    complexity: caseData?.complexity || 1,
    isOwnCase: caseData?.isOwnCase || false,
    outcome: caseData?.outcome || '',
    myRole: caseData?.myRole || '',
    clientTestimony: caseData?.clientTestimony || '',
    startDate: caseData?.startDate ? new Date(caseData.startDate) : undefined,
    completionDate: caseData?.completionDate ? new Date(caseData.completionDate) : undefined,
    isHighImpact: caseData?.isHighImpact || false,
  }

  // Set up the form
  const form = useForm<CaseLawFormValues>({
    resolver: zodResolver(caseLawSchema),
    defaultValues,
  })

  // Watch for isOwnCase changes to show/hide related fields
  const isOwnCase = form.watch('isOwnCase')

  // Handle form submission
  const onSubmit = (data: CaseLawFormValues) => {
    // Process the data before saving
    const processedData = {
      ...data,
      id: caseData?.id, // Keep the existing ID if editing
      tags: data.tags ? data.tags.split(',').map(tag => tag.trim()) : [],
      legalPrinciples: data.legalPrinciples ? data.legalPrinciples.split('\n').filter(Boolean) : [],
      relatedCases: data.relatedCases ? data.relatedCases.split('\n').filter(Boolean) : [],
    }
    
    onSave(processedData)
  }

  // List of legal areas
  const legalAreas = ['Criminal', 'Civil', 'Family', 'Constitutional', 'Commercial', 'Labor']
  
  // List of courts
  const courts = ['Supreme Court', 'High Court', 'District Court', 'Sessions Court']
  
  // List of stages
  const stages = ['Trial', 'Appeal', 'Revision', 'Review', 'Writ']
  
  // List of outcomes (for own cases)
  const outcomes = ['Won', 'Settled', 'Dismissed', 'Pending', 'Appeal']

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-3 mb-4">
            <TabsTrigger value="basic">Basic Information</TabsTrigger>
            <TabsTrigger value="content">Case Content</TabsTrigger>
            <TabsTrigger value="advanced">Advanced Details</TabsTrigger>
          </TabsList>
          
          {/* Basic Information Tab */}
          <TabsContent value="basic">
            <Card>
              <CardContent className="pt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Case Title</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g. Smith vs. Jones" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="citation"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Citation</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g. AIR 2023 SC 123" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="court"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Court</FormLabel>
                        <Select 
                          onValueChange={field.onChange} 
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select court" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {courts.map((court) => (
                              <SelectItem key={court} value={court}>
                                {court}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="judgmentDate"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>Judgment Date</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant={"outline"}
                                className={cn(
                                  "w-full pl-3 text-left font-normal",
                                  !field.value && "text-muted-foreground"
                                )}
                              >
                                {field.value ? (
                                  format(field.value, "PPP")
                                ) : (
                                  <span>Pick a date</span>
                                )}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={field.value}
                              onSelect={field.onChange}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="legalArea"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Legal Area</FormLabel>
                        <Select 
                          onValueChange={field.onChange} 
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select legal area" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {legalAreas.map((area) => (
                              <SelectItem key={area} value={area}>
                                {area}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="stage"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Stage</FormLabel>
                        <Select 
                          onValueChange={field.onChange} 
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select stage" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {stages.map((stage) => (
                              <SelectItem key={stage} value={stage}>
                                {stage}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="tags"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tags</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g. Property, Contract, Damages (comma separated)" {...field} />
                        </FormControl>
                        <FormDescription>
                          Separate tags with commas
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="complexity"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Complexity (1-5)</FormLabel>
                        <Select 
                          onValueChange={(value) => field.onChange(parseInt(value))} 
                          defaultValue={field.value.toString()}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select complexity" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="1">1 - Simple</SelectItem>
                            <SelectItem value="2">2 - Easy</SelectItem>
                            <SelectItem value="3">3 - Moderate</SelectItem>
                            <SelectItem value="4">4 - Complex</SelectItem>
                            <SelectItem value="5">5 - Very Complex</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="flex items-end space-x-4">
                    <FormField
                      control={form.control}
                      name="isOwnCase"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>
                              This is my own litigated case
                            </FormLabel>
                            <FormDescription>
                              Mark if you personally worked on this case
                            </FormDescription>
                          </div>
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="hasDocument"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>
                              Has PDF document
                            </FormLabel>
                            <FormDescription>
                              Case has downloadable PDF
                            </FormDescription>
                          </div>
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Case Content Tab */}
          <TabsContent value="content">
            <Card>
              <CardContent className="pt-6 space-y-6">
                <FormField
                  control={form.control}
                  name="shortSummary"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Short Summary</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Brief overview of the case"
                          className="min-h-24"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="facts"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Facts</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Detailed facts of the case"
                          className="min-h-32"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="issues"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Issues</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Legal issues raised in the case"
                          className="min-h-24"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="held"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Held</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Court's decision and reasoning"
                          className="min-h-24"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="legalPrinciples"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Legal Principles</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Key legal principles (one per line)"
                          className="min-h-24"
                          {...field} 
                        />
                      </FormControl>
                      <FormDescription>
                        Enter one principle per line
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="relatedCases"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Related Cases</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Related cases (one per line)"
                          className="min-h-24"
                          {...field} 
                        />
                      </FormControl>
                      <FormDescription>
                        Enter one case per line
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Advanced Details Tab (for own cases) */}
          <TabsContent value="advanced">
            <Card>
              <CardContent className="pt-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {isOwnCase && (
                    <>
                      <FormField
                        control={form.control}
                        name="outcome"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Outcome</FormLabel>
                            <Select 
                              onValueChange={field.onChange} 
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select outcome" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {outcomes.map((outcome) => (
                                  <SelectItem key={outcome} value={outcome}>
                                    {outcome}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="isHighImpact"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                              <FormLabel>
                                High Impact Case
                              </FormLabel>
                              <FormDescription>
                                Mark if this is a landmark or high impact case
                              </FormDescription>
                            </div>
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="startDate"
                        render={({ field }) => (
                          <FormItem className="flex flex-col">
                            <FormLabel>Start Date</FormLabel>
                            <Popover>
                              <PopoverTrigger asChild>
                                <FormControl>
                                  <Button
                                    variant={"outline"}
                                    className={cn(
                                      "w-full pl-3 text-left font-normal",
                                      !field.value && "text-muted-foreground"
                                    )}
                                  >
                                    {field.value ? (
                                      format(field.value, "PPP")
                                    ) : (
                                      <span>Pick a date</span>
                                    )}
                                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                  </Button>
                                </FormControl>
                              </PopoverTrigger>
                              <PopoverContent className="w-auto p-0" align="start">
                                <Calendar
                                  mode="single"
                                  selected={field.value}
                                  onSelect={field.onChange}
                                  initialFocus
                                />
                              </PopoverContent>
                            </Popover>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="completionDate"
                        render={({ field }) => (
                          <FormItem className="flex flex-col">
                            <FormLabel>Completion Date</FormLabel>
                            <Popover>
                              <PopoverTrigger asChild>
                                <FormControl>
                                  <Button
                                    variant={"outline"}
                                    className={cn(
                                      "w-full pl-3 text-left font-normal",
                                      !field.value && "text-muted-foreground"
                                    )}
                                  >
                                    {field.value ? (
                                      format(field.value, "PPP")
                                    ) : (
                                      <span>Pick a date</span>
                                    )}
                                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                  </Button>
                                </FormControl>
                              </PopoverTrigger>
                              <PopoverContent className="w-auto p-0" align="start">
                                <Calendar
                                  mode="single"
                                  selected={field.value}
                                  onSelect={field.onChange}
                                  initialFocus
                                />
                              </PopoverContent>
                            </Popover>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </>
                  )}
                </div>
                
                {isOwnCase && (
                  <>
                    <FormField
                      control={form.control}
                      name="myRole"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>My Role</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Describe your role in this case"
                              className="min-h-24"
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="clientTestimony"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Client Background/Testimony</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Client background or testimony"
                              className="min-h-24"
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </>
                )}
                
                {!isOwnCase && (
                  <div className="p-6 bg-muted/50 rounded-lg text-center">
                    <p className="text-muted-foreground">
                      Advanced details are only available for your own litigated cases.
                      <br />
                      Check "This is my own litigated case" in the Basic Information tab to access these fields.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
        
        <div className="flex justify-end space-x-4">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit">
            {caseData ? 'Update Case' : 'Add Case'}
          </Button>
        </div>
      </form>
    </Form>
  )
} 