'use client'

import { useState, useEffect, useRef } from 'react'
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
import { ResearchDomain, ResearchStudy, ResearchDomainItem } from '@/lib/models/research'
import { Badge } from '@/components/ui/badge'
import { X, Plus, Image as ImageIcon, Eye, Upload, Loader2 } from 'lucide-react'
import Image from 'next/image'
import { toast } from 'sonner'
import { uploadToImageKit } from '@/lib/imagekit'

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
    domain: 'default-domain', // Will be replaced with actual domain from API
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
  const [domains, setDomains] = useState<ResearchDomainItem[]>([])
  const [isLoadingDomains, setIsLoadingDomains] = useState(true)
  const initialDomainRef = useRef(formData.domain)
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Handle input changes
  const handleChange = (field: string, value: any) => {
    setFormData({ ...formData, [field]: value })
  }
  
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
        
        // Set default domain if not already set and domains are available
        if ((!initialDomainRef.current || initialDomainRef.current === '') && data.length > 0) {
          handleChange('domain', data[0].name)
        }
        
        // If the domain from the research doesn't exist in the domains list, add it temporarily
        // This prevents errors when a domain was edited or deleted
        if (initialDomainRef.current && initialDomainRef.current !== '' && data.length > 0 && 
            !data.some((d: ResearchDomainItem) => d.name === initialDomainRef.current)) {
          const tempDomain: ResearchDomainItem = {
            id: 'temp-domain',
            name: initialDomainRef.current,
            description: 'Previously used domain',
            createdAt: new Date().toISOString()
          }
          setDomains(prev => [...prev, tempDomain])
        }
      } catch (error) {
        console.error('Error fetching domains:', error)
        toast.error('Failed to load research domains')
      } finally {
        setIsLoadingDomains(false)
      }
    }

    fetchDomains()
  }, [])
  
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

  // Function to handle file to base64 conversion
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  };

  // Handle image upload via ImageKit
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setIsUploading(true);
    try {
      // Convert file to base64
      const base64Data = await fileToBase64(file);
      
      // Upload to ImageKit
      const imageUrl = await uploadToImageKit(
        base64Data,
        file.name,
        "research"
      );
      
      // Update form with the new image URL
      handleChange('imageUrl', imageUrl);
      
      toast.success("Image uploaded successfully");
    } catch (error) {
      console.error("Error uploading image:", error);
      toast.error("Failed to upload image");
    } finally {
      setIsUploading(false);
      // Clear the file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };
  
  // Replace the ImageUploader component with this custom implementation
  const renderImageUploader = () => (
    <div className="lg:col-span-1">
      <div className="w-full aspect-video rounded-md overflow-hidden border border-gray-200">
        {formData.imageUrl ? (
          <div className="relative w-full h-full">
            <img 
              src={formData.imageUrl} 
              alt="Featured image"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/50 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
              <div className="flex gap-2">
                <Button 
                  type="button"
                  size="sm"
                  className="bg-white text-gray-800 hover:bg-gray-100"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                >
                  <Upload className="w-4 h-4 mr-1" />
                  Change
                </Button>
                <Button 
                  type="button"
                  size="sm" 
                  variant="destructive"
                  onClick={() => handleChange('imageUrl', '')}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div 
            className="w-full h-full flex flex-col items-center justify-center p-4 cursor-pointer bg-gray-50 hover:bg-gray-100"
            onClick={() => fileInputRef.current?.click()}
          >
            {isUploading ? (
              <div className="flex flex-col items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-gray-400 mb-2" />
                <p className="text-sm text-gray-500">Uploading...</p>
              </div>
            ) : (
              <>
                <ImageIcon className="w-12 h-12 text-gray-400 mb-2" />
                <p className="text-gray-500 text-sm text-center">Click to upload featured image</p>
              </>
            )}
          </div>
        )}
      </div>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleImageUpload}
      />
      <p className="text-xs text-gray-500 mt-2">
        Upload a featured image for this research study. Images will be optimized and stored on ImageKit.
      </p>
    </div>
  );

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
              value={formData.domain || 'default-domain'} 
              onValueChange={(value) => handleChange('domain', value)}
              disabled={isLoadingDomains}
            >
              <SelectTrigger id="domain">
                <SelectValue placeholder={isLoadingDomains ? "Loading domains..." : "Select domain"} />
              </SelectTrigger>
              <SelectContent>
                {isLoadingDomains ? (
                  <SelectItem value="loading" disabled>
                    Loading domains...
                  </SelectItem>
                ) : domains.length > 0 ? (
                  domains.map((domain) => (
                    domain.name ? (
                      <SelectItem key={domain.id} value={domain.name}>
                        {domain.name}
                      </SelectItem>
                    ) : null
                  ))
                ) : (
                  <SelectItem value="no-domains" disabled>
                    No domains available
                  </SelectItem>
                )}
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
            {renderImageUploader()}
            
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