'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { Eye, BookOpen, ExternalLink, FileText, Clock } from 'lucide-react'
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
    views,
    featured
  } = study
  
  return (
    <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 h-full flex flex-col group border-slate-200">
      <div className="relative w-full pt-[56.25%]"> {/* 16:9 aspect ratio container */}
        <div className="absolute inset-0">
          <Image
            src={imageUrl || '/placeholder.svg?height=400&width=600'}
            alt={title}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
          {featured && (
            <div className="absolute top-0 left-0 bg-gradient-to-r from-yellow-500 to-amber-500 text-white text-xs py-1 px-3 rounded-br font-medium">
              Featured
            </div>
          )}
          <div className="absolute top-0 right-0 p-2">
            <Badge 
              variant="secondary" 
              className="bg-white/90 backdrop-blur-sm text-xs font-semibold shadow-sm"
            >
              {year}
            </Badge>
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </div>
      </div>
      
      <CardHeader className="p-4 pb-2 relative">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Badge className="bg-blue-100 text-blue-800 font-medium">{domain}</Badge>
            <div className="flex items-center text-gray-500 text-xs gap-1">
              <Eye className="w-3.5 h-3.5" />
              <span>{views}</span>
            </div>
          </div>
          <Link href={`/research/${id}`} className="group-hover:text-blue-600 transition-colors">
            <h3 className="font-bold text-lg text-gray-900 line-clamp-2">{title}</h3>
          </Link>
        </div>
      </CardHeader>
      
      <CardContent className="p-4 pt-0 flex-grow">
        <p className="text-gray-600 text-sm line-clamp-3 mb-3">{abstract}</p>
        
        <div className="flex flex-wrap gap-1.5 mt-auto">
          {tags.slice(0, 3).map((tag) => (
            <Badge key={tag} variant="outline" className="text-xs bg-gray-50">
              {tag}
            </Badge>
          ))}
          {tags.length > 3 && (
            <Badge variant="outline" className="text-xs bg-gray-50">
              +{tags.length - 3}
            </Badge>
          )}
        </div>
      </CardContent>
      
      <CardFooter className="p-4 pt-0 border-t mt-2">
        <div className="flex justify-between items-center w-full text-sm">
          {publishedIn ? (
            <div className="text-gray-600 text-xs flex items-center">
              <Clock className="w-3.5 h-3.5 mr-1" />
              <span className="font-medium truncate max-w-[120px]">{publishedIn}</span>
            </div>
          ) : (
            <div></div>
          )}
          
          <div className="flex gap-2">
            <Link href={`/research/${id}`}>
              <Button size="sm" variant="secondary" className="shadow-sm">
                <BookOpen className="w-3.5 h-3.5 mr-1" />
                Details
              </Button>
            </Link>
            
            {fileUrl && (
              <Link href={fileUrl} target="_blank" rel="noopener noreferrer">
                <Button size="sm" variant="outline" className="shadow-sm">
                  <FileText className="w-3.5 h-3.5" />
                </Button>
              </Link>
            )}
            
            {externalUrl && (
              <Link href={externalUrl} target="_blank" rel="noopener noreferrer">
                <Button size="sm" variant="outline" className="shadow-sm">
                  <ExternalLink className="w-3.5 h-3.5" />
                </Button>
              </Link>
            )}
          </div>
        </div>
      </CardFooter>
    </Card>
  )
} 