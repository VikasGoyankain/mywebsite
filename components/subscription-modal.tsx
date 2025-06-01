'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { BellRing, Check, X, Loader2, AlertCircle } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface SubscriptionModalProps {
  isOpen: boolean
  onClose: () => void
}

export function SubscriptionModal({ isOpen, onClose }: SubscriptionModalProps) {
  const { toast } = useToast()
  const [fullName, setFullName] = useState('')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [errors, setErrors] = useState<{ fullName?: string; phoneNumber?: string }>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  // Handle phone number input with validation
  const handlePhoneNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    
    // Only allow digits and limit to 10 characters
    const sanitizedValue = value.replace(/\D/g, '').slice(0, 10)
    setPhoneNumber(sanitizedValue)
    
    // Clear error when user types
    if (errors.phoneNumber) {
      setErrors(prev => ({...prev, phoneNumber: undefined}))
    }
  }
  
  const validateForm = () => {
    const newErrors: { fullName?: string; phoneNumber?: string } = {}
    
    // Validate name
    if (!fullName.trim()) {
      newErrors.fullName = 'Name is required'
    }
    
    // Validate phone number
    if (!phoneNumber.trim()) {
      newErrors.phoneNumber = 'Mobile number is required'
    } else if (phoneNumber.length !== 10) {
      newErrors.phoneNumber = 'Mobile number must be exactly 10 digits'
    } else if (!phoneNumber.match(/^[6-9]\d{9}$/)) {
      newErrors.phoneNumber = 'Must be a valid Indian mobile number (without +91/0)'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }
    
    setIsSubmitting(true)
    
    try {
      const response = await fetch('/api/subscribers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fullName,
          phoneNumber,
        }),
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to subscribe')
      }
      
      toast({
        title: "You're subscribed!",
        description: "You'll receive updates soon.",
        variant: "default"
      })
      
      // Reset form and close modal
      setFullName('')
      setPhoneNumber('')
      onClose()
      
    } catch (error: any) {
      toast({
        title: "Subscription failed",
        description: error.message || "Something went wrong. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsSubmitting(false)
    }
  }
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <BellRing className="h-5 w-5 text-blue-500" />
            Subscribe to Updates
          </DialogTitle>
          <DialogDescription>
            Stay informed with latest research, legal insights, and announcements from Vikas Goyanka.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="fullName" className="flex items-center gap-1">
              Full Name
            </Label>
            <Input 
              id="fullName" 
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Enter your full name"
              className={errors.fullName ? 'border-red-500' : ''}
              disabled={isSubmitting}
            />
            {errors.fullName && (
              <p className="text-xs text-red-500 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" /> {errors.fullName}
              </p>
            )}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="phoneNumber" className="flex items-center gap-1">
              Mobile Number <span className="text-xs text-gray-500">(10 digits)</span>
            </Label>
            <Input 
              id="phoneNumber" 
              value={phoneNumber}
              onChange={handlePhoneNumberChange}
              placeholder="e.g., 9876543210"
              className={errors.phoneNumber ? 'border-red-500' : ''}
              disabled={isSubmitting}
              inputMode="numeric"
              maxLength={10}
            />
            {errors.phoneNumber ? (
              <p className="text-xs text-red-500 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" /> {errors.phoneNumber}
              </p>
            ) : (
              <p className="text-xs text-gray-500">
                Enter 10 digit mobile number without country code or leading zero
              </p>
            )}
          </div>
          
          <div className="bg-blue-50 p-2 rounded-md text-xs text-gray-600 flex items-start gap-2">
            <Check className="h-4 w-4 text-green-500 mt-0.5" /> 
            <div>
              Your number will never be shared publicly. It will be used only for sending important updates related to our services.
            </div>
          </div>
          
          <DialogFooter className="mt-6 gap-2 sm:gap-0">
            <Button 
              type="button"
              variant="outline" 
              onClick={onClose}
              disabled={isSubmitting}
              className="flex items-center gap-1"
            >
              <X className="h-4 w-4" /> Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isSubmitting}
              className="flex items-center gap-1"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Submitting...
                </>
              ) : (
                <>
                  <Check className="h-4 w-4" /> Submit
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
} 