"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DialogFooter } from "@/components/ui/dialog"

// Define Case type
export interface Case {
  id?: string
  title: string
  court: string
  category: string
  year: string
  outcome: 'In favour of client' | 'Lost' | 'Ongoing' | 'Settlement' | 'Dismissed'
  description: string
  fullDescription?: string
}

interface CaseFormProps {
  caseData: Case | null
  onSave: (data: Partial<Case>) => void
  onCancel: () => void
}

export function CaseForm({ caseData, onSave, onCancel }: CaseFormProps) {
  const [formData, setFormData] = useState<Partial<Case>>(
    caseData || {
      title: "",
      court: "",
      category: "",
      year: new Date().getFullYear().toString(),
      outcome: "Ongoing",
      description: "",
      fullDescription: "",
    }
  )

  const handleChange = (field: keyof Case, value: string) => {
    setFormData({ ...formData, [field]: value })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave(formData)
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
    "Other",
  ]

  // Predefined category options
  const categoryOptions = [
    "Criminal Defense",
    "Civil Litigation",
    "Corporate",
    "Family Law",
    "Constitutional Law",
    "Environmental Law",
    "Intellectual Property",
    "Tax Law",
    "Consumer Protection",
    "Other",
  ]

  // Generate year options (last 20 years)
  const yearOptions = Array.from({ length: 20 }, (_, i) => 
    (new Date().getFullYear() - i).toString()
  )

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="title">Case Title*</Label>
        <Input
          id="title"
          value={formData.title}
          onChange={(e) => handleChange("title", e.target.value)}
          placeholder="e.g. State vs. Sharma"
          required
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
          <Label htmlFor="category">Category*</Label>
          <Select
            value={formData.category}
            onValueChange={(value) => handleChange("category", value)}
            required
          >
            <SelectTrigger>
              <SelectValue placeholder="Select a category" />
            </SelectTrigger>
            <SelectContent>
              {categoryOptions.map((category) => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="year">Year*</Label>
          <Select
            value={formData.year}
            onValueChange={(value) => handleChange("year", value)}
            required
          >
            <SelectTrigger>
              <SelectValue placeholder="Select year" />
            </SelectTrigger>
            <SelectContent>
              {yearOptions.map((year) => (
                <SelectItem key={year} value={year}>
                  {year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="outcome">Outcome*</Label>
          <Select
            value={formData.outcome}
            onValueChange={(value) => 
              handleChange("outcome", value as Case['outcome'])}
            required
          >
            <SelectTrigger>
              <SelectValue placeholder="Select outcome" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="In favour of client">In favour of client</SelectItem>
              <SelectItem value="Lost">Lost</SelectItem>
              <SelectItem value="Ongoing">Ongoing</SelectItem>
              <SelectItem value="Settlement">Settlement</SelectItem>
              <SelectItem value="Dismissed">Dismissed</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Brief Description*</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => handleChange("description", e.target.value)}
          placeholder="Enter a brief description of the case (shown in preview)"
          rows={2}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="fullDescription">Full Description</Label>
        <Textarea
          id="fullDescription"
          value={formData.fullDescription || ""}
          onChange={(e) => handleChange("fullDescription", e.target.value)}
          placeholder="Enter a detailed description of the case (shown when expanded)"
          rows={4}
        />
      </div>

      <DialogFooter className="pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">Save Case</Button>
      </DialogFooter>
    </form>
  )
} 