'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { ResearchStudy } from '@/lib/models/research'
import Image from 'next/image'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { 
  ArrowLeft, 
  Calendar, 
  Eye, 
  FileText, 
  Download, 
  ExternalLink, 
  Share2, 
  BookOpen,
  Award,
  User
} from 'lucide-react'

export default function ResearchDetail() {
  const { id } = useParams()
  const [study, setStudy] = useState<ResearchStudy | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  
  useEffect(() => {
    const fetchStudy = async () => {
      try {
        setLoading(true)
        const response = await fetch(`/api/research?id=${id}`)
        
        if (!response.ok) {
          throw new Error('Failed to fetch research study')
        }
        
        const data = await response.json()
        setStudy(data)
      } catch (err: any) {
        setError(err.message || 'Failed to load research study')
      } finally {
        setLoading(false)
      }
    }
    
    if (id) {
      fetchStudy()
    }
  }, [id])
  
  // Handle share functionality
  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: study?.title,
          text: study?.abstract,
          url: window.location.href,
        })
      } catch (err) {
        console.error('Error sharing:', err)
      }
    } else {
      // Fallback for browsers that don't support the Web Share API
      navigator.clipboard.writeText(window.location.href)
      alert('Link copied to clipboard!')
    }
  }
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 py-12 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto">
          <div className="mb-6">
            <Skeleton className="h-10 w-32" />
          </div>
          <div className="mb-8">
            <Skeleton className="h-16 w-full" />
          </div>
          <div className="flex flex-wrap gap-2 mb-6">
            <Skeleton className="h-6 w-24" />
            <Skeleton className="h-6 w-24" />
          </div>
          <Skeleton className="h-[400px] w-full rounded-xl mb-8" />
          <div className="space-y-4">
            <Skeleton className="h-8 w-40" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        </div>
      </div>
    )
  }
  
  if (error || !study) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 py-12 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto">
          <div className="bg-red-50 border border-red-200 text-red-800 rounded-md p-4 mb-6">
            <p>{error || 'Research study not found'}</p>
          </div>
          <Link href="/research">
            <Button variant="outline" className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to all research studies
            </Button>
          </Link>
        </div>
      </div>
    )
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      {/* Hero section with image background */}
      <div className="relative bg-gradient-to-b from-blue-900/90 to-slate-900/90 text-white">
        {study.imageUrl && (
          <div className="absolute inset-0 z-0">
            <div className="absolute inset-0 bg-gradient-to-b from-blue-900/80 to-slate-900/90 z-10" />
            <Image 
              src={study.imageUrl}
              alt={study.title}
              fill
              className="object-cover opacity-40"
              priority
            />
          </div>
        )}
        
        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 pt-16 pb-20">
          <Link href="/research">
            <Button variant="outline" size="sm" className="mb-6 bg-white/10 backdrop-blur-sm border-white/20 hover:bg-white/20 text-white">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to all research
            </Button>
          </Link>
          
          {study.featured && (
            <div className="mb-4">
              <Badge className="bg-amber-500 text-white px-3 py-1 gap-1.5">
                <Award className="h-3.5 w-3.5" />
                Featured Research
              </Badge>
            </div>
          )}
          
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6 tracking-tight">{study.title}</h1>
          
          <div className="flex flex-wrap items-center gap-4 text-sm text-blue-100 mb-6">
            <div className="flex items-center gap-1.5">
              <Calendar className="h-4 w-4" />
              <span>{study.year}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Eye className="h-4 w-4" />
              <span>{study.views} views</span>
            </div>
            <div className="flex items-center gap-1.5">
              <User className="h-4 w-4" />
              <span>{study.author}</span>
            </div>
            {study.publishedIn && (
              <div className="flex items-center gap-1.5">
                <BookOpen className="h-4 w-4" />
                <span>{study.publishedIn}</span>
              </div>
            )}
          </div>
          
          <div className="flex flex-wrap gap-2 mb-6">
            <Badge className="bg-blue-600 text-white px-3 py-1 border-none">{study.domain}</Badge>
            {study.tags.map((tag) => (
              <Badge key={tag} variant="secondary" className="px-3 py-1 bg-white/15 text-white border-none">
                {tag}
              </Badge>
            ))}
          </div>
        </div>
      </div>
      
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12">
        {/* Abstract */}
        <div className="prose prose-slate lg:prose-lg max-w-none mb-12 bg-white p-8 rounded-xl shadow-sm">
          <h2 className="text-2xl font-bold mb-4 text-slate-900 flex items-center gap-2">
            <FileText className="h-5 w-5 text-blue-600" />
            Abstract
          </h2>
          <p className="text-slate-700 leading-relaxed">{study.abstract}</p>
        </div>
        
        {/* Action buttons */}
        <div className="flex flex-wrap gap-3 mb-16">
          {study.fileUrl && (
            <Link href={study.fileUrl} target="_blank" rel="noopener noreferrer">
              <Button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700">
                <Download className="h-4 w-4" />
                Download PDF
              </Button>
            </Link>
          )}
          
          {study.externalUrl && (
            <Link href={study.externalUrl} target="_blank" rel="noopener noreferrer">
              <Button variant="outline" className="flex items-center gap-2">
                <ExternalLink className="h-4 w-4" />
                View Original Source
              </Button>
            </Link>
          )}
          
          <Button variant="outline" onClick={handleShare} className="flex items-center gap-2 ml-auto">
            <Share2 className="h-4 w-4" />
            Share
          </Button>
        </div>
        
        {/* Citation info */}
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-6">
          <h3 className="font-semibold text-lg mb-2 text-slate-800">Citation</h3>
          <p className="text-sm text-slate-700 font-mono bg-white p-3 border border-slate-200 rounded">
            {study.author} ({study.year}). <em>{study.title}</em>. 
            {study.publishedIn ? ` ${study.publishedIn}.` : ''}
          </p>
        </div>
      </div>
    </div>
  )
} 