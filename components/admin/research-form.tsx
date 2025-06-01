'use client'

import { useState } from 'react'
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Checkbox } from '@/components/ui/checkbox'
import { ResearchDomain, ResearchStudy } from '@/lib/models/research'
import { ImageUploader } from '@/components/image-uploader'
import { Badge } from '@/components/ui/badge'
import { X, Plus, Image as ImageIcon, Eye } from 'lucide-react'
import Image from 'next/image'

type ResearchFormProps = {
  research?: ResearchStudy
  onSave: (data: Partial<ResearchStudy>) => void
  onCancel: () => void
}

export function ResearchForm({ research, onSave, onCancel }: ResearchFormProps) {
  // Create default/empty state if no research is provided
  const defaultData: Partial<ResearchStudy> = {
    title: '',
    abstract: '',
    year: new Date().getFullYear(),
    domain: ResearchDomain.LAW,
    tags: [],
    fileUrl: '',
    externalUrl: '',
    imageUrl: '',
    publishedIn: '',
    author: 'Vikas Goyanka',
    featured: false,
  }

  // Current form state
  const [formData, setFormData] = useState<Partial<ResearchStudy>>(research || defaultData)
  const [newTag, setNewTag] = useState<string>('')
  const [showImagePreview, setShowImagePreview] = useState<boolean>(false)
  
  // Handle input changes
  const handleChange = (field: string, value: any) => {
    setFormData({ ...formData, [field]: value })
  }
  
  // Handle tag management
  const addTag = () => {
    if (newTag.trim() && !formData.tags?.includes(newTag.trim())) {
      const updatedTags = [...(formData.tags || []), newTag.trim()]
      handleChange('tags', updatedTags)
      setNewTag('')
    }
  }
  
  const removeTag = (tagToRemove: string) => {
    const updatedTags = formData.tags?.filter(tag => tag !== tagToRemove) || []
    handleChange('tags', updatedTags)
  }
  
  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave(formData)
  }

  // Toggle image preview
  const toggleImagePreview = () => {
    setShowImagePreview(!showImagePreview)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div>
          <Label htmlFor="title">Title</Label>
          <Input
            id="title"
            value={formData.title}
            onChange={(e) => handleChange('title', e.target.value)}
            placeholder="Research study title"
            required
          />
        </div>

        <div>
          <Label htmlFor="abstract">Abstract</Label>
          <Textarea
            id="abstract"
            value={formData.abstract}
            onChange={(e) => handleChange('abstract', e.target.value)}
            placeholder="Brief description of the research study"
            rows={4}
            required
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="year">Year</Label>
            <Input
              id="year"
              type="number"
              value={formData.year}
              onChange={(e) => handleChange('year', parseInt(e.target.value, 10))}
              placeholder="2023"
              required
            />
          </div>

          <div>
            <Label htmlFor="domain">Domain</Label>
            <Select 
              value={formData.domain} 
              onValueChange={(value) => handleChange('domain', value)}
            >
              <SelectTrigger id="domain">
                <SelectValue placeholder="Select domain" />
              </SelectTrigger>
              <SelectContent>
                {Object.values(ResearchDomain).map((domain) => (
                  <SelectItem key={domain} value={domain}>
                    {domain}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div>
          <Label htmlFor="publishedIn">Published In</Label>
          <Input
            id="publishedIn"
            value={formData.publishedIn || ''}
            onChange={(e) => handleChange('publishedIn', e.target.value)}
            placeholder="Publication or journal name"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="fileUrl">PDF File URL</Label>
            <Input
              id="fileUrl"
              value={formData.fileUrl || ''}
              onChange={(e) => handleChange('fileUrl', e.target.value)}
              placeholder="URL to PDF file"
            />
          </div>

          <div>
            <Label htmlFor="externalUrl">External URL</Label>
            <Input
              id="externalUrl"
              value={formData.externalUrl || ''}
              onChange={(e) => handleChange('externalUrl', e.target.value)}
              placeholder="External URL to source"
            />
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label>Featured Image</Label>
            {formData.imageUrl && (
              <Button 
                type="button" 
                variant="ghost" 
                size="sm" 
                className="h-8 px-2 text-blue-500"
                onClick={toggleImagePreview}
              >
                <Eye className="h-4 w-4 mr-1" />
                {showImagePreview ? "Hide preview" : "Show preview"}
              </Button>
            )}
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-1">
              <ImageUploader
                currentImageUrl={formData.imageUrl || "/placeholder.svg?height=400&width=600"}
                onImageSelect={(imageUrl) => handleChange('imageUrl', imageUrl)}
                className="w-full aspect-video rounded-md overflow-hidden border border-gray-200"
              />
            </div>
            
            <div className="lg:col-span-2 space-y-2">
              <Input
                id="imageUrl"
                value={formData.imageUrl || ''}
                onChange={(e) => handleChange('imageUrl', e.target.value)}
                placeholder="Image URL"
              />
              <p className="text-xs text-gray-500">
                Use a 16:9 aspect ratio image for best results. Recommended minimum size: 1200x675px.
              </p>
              
              {showImagePreview && formData.imageUrl && (
                <div className="relative mt-2 border rounded-md overflow-hidden bg-gray-100 max-w-full">
                  <div className="relative pt-[56.25%]">
                    <Image 
                      src={formData.imageUrl} 
                      alt="Image preview"
                      fill
                      className="object-cover"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <Label>Tags</Label>
          <div className="flex flex-wrap gap-2 mb-2">
            {formData.tags?.map((tag) => (
              <Badge key={tag} variant="secondary" className="flex items-center gap-1 px-3 py-1">
                {tag}
                <button
                  type="button"
                  onClick={() => removeTag(tag)}
                  className="ml-1 rounded-full hover:bg-gray-200 p-0.5"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
          <div className="flex gap-2">
            <Input
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              placeholder="Add a tag"
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
            />
            <Button type="button" onClick={addTag} variant="outline">
              <Plus className="h-4 w-4 mr-1" />
              Add
            </Button>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox 
            id="featured" 
            checked={formData.featured} 
            onCheckedChange={(checked) => handleChange('featured', Boolean(checked))}
          />
          <Label htmlFor="featured">Featured study (will be highlighted)</Label>
        </div>
      </div>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">
          Save
        </Button>
      </div>
    </form>
  )
} 