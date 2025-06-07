'use client'

import { useState } from 'react'
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { ResearchDomainItem } from '@/lib/models/research'

type DomainFormProps = {
  domain?: ResearchDomainItem
  onSave: (data: Partial<ResearchDomainItem>) => void
  onCancel: () => void
}

export function DomainForm({ domain, onSave, onCancel }: DomainFormProps) {
  // Create default/empty state if no domain is provided
  const defaultData: Partial<ResearchDomainItem> = {
    name: '',
    description: '',
  }

  // Current form state
  const [formData, setFormData] = useState<Partial<ResearchDomainItem>>(domain || defaultData)
  
  // Handle input changes
  const handleChange = (field: string, value: any) => {
    setFormData({ ...formData, [field]: value })
  }
  
  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave(formData)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div>
          <Label htmlFor="name">Domain Name</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => handleChange('name', e.target.value)}
            placeholder="Enter domain name"
            required
          />
        </div>

        <div>
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            value={formData.description || ''}
            onChange={(e) => handleChange('description', e.target.value)}
            placeholder="Brief description of the research domain"
            rows={3}
          />
        </div>
      </div>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">
          {domain ? 'Update' : 'Create'} Domain
        </Button>
      </div>
    </form>
  )
} 