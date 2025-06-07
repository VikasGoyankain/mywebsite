'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { BookOpen, ExternalLink, FileText, ArrowUpRight, Calendar, Tag } from 'lucide-react'
import type { ResearchStudy } from '@/lib/models/research'
import { Button } from '@/components/ui/button'

interface ResearchCardProps {
  study: ResearchStudy
}

export function ResearchCard({ study }: ResearchCardProps) {
  const {
    id,
    title,
    abstract,
    year,
    domain,
    tags,
    fileUrl,
    externalUrl,
    imageUrl,
    publishedIn,
    featured
  } = study
  
  return (
    <Card className="overflow-hidden border-0 shadow-md hover:shadow-xl transition-all duration-300 h-full flex flex-col group">
      <div className="relative w-full pt-[56.25%]"> {/* 16:9 aspect ratio container */}
        <div className="absolute inset-0">
          <Image
            src={imageUrl || '/placeholder.svg?height=400&width=600'}
            alt={title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-110"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          
          {featured && (
            <div className="absolute top-3 left-3">
              <Badge className="bg-gradient-to-r from-amber-500 to-yellow-500 text-white border-0 px-2.5 py-1">
                Featured
              </Badge>
            </div>
          )}
          
          <div className="absolute top-3 right-3 flex gap-2">
            <Badge 
              variant="secondary" 
              className="bg-white/90 backdrop-blur-sm text-xs font-medium shadow-sm flex items-center gap-1"
            >
              <Calendar className="w-3 h-3" />
              {year}
            </Badge>
            
            <Badge 
              className="bg-blue-600 text-white border-0 px-2"
            >
              {domain}
            </Badge>
          </div>
          
          <div className="absolute bottom-0 left-0 w-full p-4 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <Link href={`/research/${id}`} className="text-white hover:underline">
              <h3 className="font-bold text-lg line-clamp-1">{title}</h3>
            </Link>
          </div>
        </div>
      </div>
      
      <CardHeader className="p-5 pb-2">
        <Link href={`/research/${id}`} className="group-hover:text-blue-600 transition-colors">
          <h3 className="font-bold text-xl text-gray-900 line-clamp-2 mb-2">{title}</h3>
        </Link>
        
        {publishedIn && (
          <div className="text-gray-600 text-sm flex items-center mb-2">
            <BookOpen className="w-4 h-4 mr-1.5 text-blue-600" />
            <span className="font-medium">{publishedIn}</span>
          </div>
        )}
      </CardHeader>
      
      <CardContent className="px-5 pt-0 flex-grow">
        <p className="text-gray-600 text-sm line-clamp-3 mb-4">{abstract}</p>
        
        <div className="flex flex-wrap gap-1.5 mt-auto">
          {tags.length > 0 && (
            <div className="flex items-center gap-2 text-gray-500 text-xs mb-1 w-full">
              <Tag className="w-3.5 h-3.5" />
              <span>Tags:</span>
            </div>
          )}
          
          {tags.slice(0, 3).map((tag) => (
            <Badge key={tag} variant="outline" className="text-xs bg-gray-50 hover:bg-gray-100">
              {tag}
            </Badge>
          ))}
          {tags.length > 3 && (
            <Badge variant="outline" className="text-xs bg-gray-50 hover:bg-gray-100">
              +{tags.length - 3}
            </Badge>
          )}
        </div>
      </CardContent>
      
      <CardFooter className="p-5 pt-3 border-t mt-2 bg-gray-50">
        <div className="flex justify-between items-center w-full">
          <Link href={`/research/${id}`} className="text-blue-600 text-sm font-medium hover:underline flex items-center">
            Read More
            <ArrowUpRight className="ml-1 h-3.5 w-3.5" />
          </Link>
          
          <div className="flex gap-2">
            {fileUrl && (
              <Link href={fileUrl} target="_blank" rel="noopener noreferrer">
                <Button size="sm" variant="outline" className="h-8 w-8 p-0 rounded-full">
                  <FileText className="h-3.5 w-3.5" />
                </Button>
              </Link>
            )}
            
            {externalUrl && (
              <Link href={externalUrl} target="_blank" rel="noopener noreferrer">
                <Button size="sm" variant="outline" className="h-8 w-8 p-0 rounded-full">
                  <ExternalLink className="h-3.5 w-3.5" />
                </Button>
              </Link>
            )}
          </div>
        </div>
      </CardFooter>
    </Card>
  )
} 