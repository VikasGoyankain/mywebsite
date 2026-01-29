import { NextRequest, NextResponse } from 'next/server'
import { v4 as uuidv4 } from 'uuid'
import { kv } from '@vercel/kv'
import { ResearchDomainItem, DEFAULT_RESEARCH_DOMAINS } from '@/lib/models/research'

// Initialize domains in KV store if they don't exist
async function initializeDomains() {
  const domainsExist = await kv.exists('research:domains')
  if (!domainsExist) {
    await kv.set('research:domains', DEFAULT_RESEARCH_DOMAINS)
  }
}

// GET /api/research/domains - Get all domains
export async function GET() {
  try {
    await initializeDomains()
    const domains = await kv.get<ResearchDomainItem[]>('research:domains') || []
    return NextResponse.json(domains)
  } catch (error) {
    console.error('Error fetching domains:', error)
    return NextResponse.json(
      { message: 'Failed to fetch domains' },
      { status: 500 }
    )
  }
}

// POST /api/research/domains - Create a new domain
export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    
    if (!data.name) {
      return NextResponse.json(
        { message: 'Domain name is required' },
        { status: 400 }
      )
    }
    
    await initializeDomains()
    const domains = await kv.get<ResearchDomainItem[]>('research:domains') || []
    
    // Check if domain with same name already exists
    const domainExists = domains.some(domain => 
      domain.name.toLowerCase() === data.name.toLowerCase()
    )
    
    if (domainExists) {
      return NextResponse.json(
        { message: 'Domain with this name already exists' },
        { status: 400 }
      )
    }
    
    const newDomain: ResearchDomainItem = {
      id: uuidv4(),
      name: data.name,
      description: data.description || '',
      createdAt: new Date().toISOString()
    }
    
    const updatedDomains = [...domains, newDomain]
    await kv.set('research:domains', updatedDomains)
    
    return NextResponse.json(newDomain, { status: 201 })
  } catch (error) {
    console.error('Error creating domain:', error)
    return NextResponse.json(
      { message: 'Failed to create domain' },
      { status: 500 }
    )
  }
}

// PUT /api/research/domains - Update a domain
export async function PUT(request: NextRequest) {
  try {
    const data = await request.json()
    const { id } = Object.fromEntries(request.nextUrl.searchParams)
    
    if (!id) {
      return NextResponse.json(
        { message: 'Domain ID is required' },
        { status: 400 }
      )
    }
    
    if (!data.name) {
      return NextResponse.json(
        { message: 'Domain name is required' },
        { status: 400 }
      )
    }
    
    await initializeDomains()
    const domains = await kv.get<ResearchDomainItem[]>('research:domains') || []
    
    // Check if domain exists
    const domainIndex = domains.findIndex(domain => domain.id === id)
    
    if (domainIndex === -1) {
      return NextResponse.json(
        { message: 'Domain not found' },
        { status: 404 }
      )
    }
    
    // Check if another domain with the same name exists
    const nameExists = domains.some(domain => 
      domain.id !== id && domain.name.toLowerCase() === data.name.toLowerCase()
    )
    
    if (nameExists) {
      return NextResponse.json(
        { message: 'Another domain with this name already exists' },
        { status: 400 }
      )
    }
    
    // Update domain
    const updatedDomain = {
      ...domains[domainIndex],
      name: data.name,
      description: data.description || domains[domainIndex].description
    }
    
    const updatedDomains = [
      ...domains.slice(0, domainIndex),
      updatedDomain,
      ...domains.slice(domainIndex + 1)
    ]
    
    await kv.set('research:domains', updatedDomains)
    
    return NextResponse.json(updatedDomain)
  } catch (error) {
    console.error('Error updating domain:', error)
    return NextResponse.json(
      { message: 'Failed to update domain' },
      { status: 500 }
    )
  }
}

// DELETE /api/research/domains - Delete a domain
export async function DELETE(request: NextRequest) {
  try {
    const { id } = Object.fromEntries(request.nextUrl.searchParams)
    
    if (!id) {
      return NextResponse.json(
        { message: 'Domain ID is required' },
        { status: 400 }
      )
    }
    
    await initializeDomains()
    const domains = await kv.get<ResearchDomainItem[]>('research:domains') || []
    
    // Check if domain exists
    const domainIndex = domains.findIndex(domain => domain.id === id)
    
    if (domainIndex === -1) {
      return NextResponse.json(
        { message: 'Domain not found' },
        { status: 404 }
      )
    }
    
    // Get all research studies to check if domain is in use
    const studies = await kv.get('research:studies') || []
    const isDomainInUse = Array.isArray(studies) && studies.some((study: any) => study.domain === domains[domainIndex].name)
    
    if (isDomainInUse) {
      return NextResponse.json(
        { message: 'Cannot delete domain that is in use by research publications' },
        { status: 400 }
      )
    }
    
    // Delete domain
    const updatedDomains = [
      ...domains.slice(0, domainIndex),
      ...domains.slice(domainIndex + 1)
    ]
    
    await kv.set('research:domains', updatedDomains)
    
    return NextResponse.json({ message: 'Domain deleted successfully' })
  } catch (error) {
    console.error('Error deleting domain:', error)
    return NextResponse.json(
      { message: 'Failed to delete domain' },
      { status: 500 }
    )
  }
} 