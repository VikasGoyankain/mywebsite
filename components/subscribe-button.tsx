'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { BellRing } from 'lucide-react'
import { SubscriptionModal } from '@/components/subscription-modal'

interface SubscribeButtonProps {
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link'
  size?: 'default' | 'sm' | 'lg' | 'icon'
  className?: string
}

export function SubscribeButton({ 
  variant = 'default', 
  size = 'default',
  className = ''
}: SubscribeButtonProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  
  return (
    <>
      <Button
        variant={variant}
        size={size}
        onClick={() => setIsModalOpen(true)}
        className={`gap-2 ${className}`}
      >
        <BellRing className="h-4 w-4" />
        Subscribe to Updates
      </Button>
      
      <SubscriptionModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  )
} 