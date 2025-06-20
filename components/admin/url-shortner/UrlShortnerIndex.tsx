"use client";
import { useState, useEffect, createContext, useContext } from 'react';
import { toast } from 'sonner';
import { UrlShortener } from './UrlShortener';
import { LinkManagement } from './LinkManagement';

export interface ShortenedLink {
  id: string;
  originalUrl: string;
  shortCode: string;
  shortUrl: string;
  createdAt: Date;
  expiresAt: Date | null;
  clickCount: number;
  isRevoked: boolean;
}

// Create a context for external refresh triggering
export const RefreshTriggerContext = createContext<() => void>(() => {});

// Custom hook to use the refresh trigger
export const useRefreshTrigger = () => {
  const triggerRefresh = useContext(RefreshTriggerContext);
  return triggerRefresh;
};

export default function UrlShortnerIndex() {
  const [links, setLinks] = useState<ShortenedLink[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Function to fetch all URLs from the API
  const fetchExistingUrls = async () => {
    try {
      setIsLoading(true);
      console.log('Fetching URLs from API...');
      
      // Add cache-busting parameter to prevent caching
      const timestamp = new Date().getTime();
      const response = await fetch(`/api/url-shortner?action=getAll&_=${timestamp}`, {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('Received URL data:', data);
        
        // Convert string dates to Date objects
        const formattedData = data.map((link: any) => ({
          ...link,
          createdAt: new Date(link.createdAt),
          expiresAt: link.expiresAt ? new Date(link.expiresAt) : null
        }));
        
        setLinks(formattedData);
      } else {
        console.error('Failed to fetch URLs');
      }
    } catch (error) {
      console.error('Error fetching URLs:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchExistingUrls();
  }, [refreshTrigger]);

  useEffect(() => {
    localStorage.setItem('shortenedLinks', JSON.stringify(links));
  }, [links]);

  // Create a function that external components can use to trigger a refresh
  const triggerRefresh = () => {
    console.log('External refresh triggered');
    setRefreshTrigger(prev => prev + 1);
  };

  const addLink = (newLink: ShortenedLink) => {
    // Check if this link already exists in our list
    const existingLinkIndex = links.findIndex(link => 
      link.shortCode === newLink.shortCode || link.originalUrl === newLink.originalUrl
    );
    
    if (existingLinkIndex !== -1) {
      // If it exists, update it instead of adding a new one
      const updatedLinks = [...links];
      updatedLinks[existingLinkIndex] = {
        ...updatedLinks[existingLinkIndex],
        ...newLink,
        // Preserve the id to avoid UI flickering
        id: updatedLinks[existingLinkIndex].id
      };
      setLinks(updatedLinks);
      toast.success('Short link updated and copied to clipboard!');
    } else {
      // If it's new, add it to the beginning of the array
      setLinks(prev => [newLink, ...prev]);
      toast.success('Short link created and copied to clipboard!');
    }
    
    // Force refresh from API
    setRefreshTrigger(prev => prev + 1);
  };

  const updateLink = (id: string, updates: Partial<ShortenedLink>) => {
    console.log(`Updating link ${id} with:`, updates);
    
    setLinks(prev => prev.map(link => {
      if (link.id === id) {
        // Create a new link object with the updates
        const updatedLink = { ...link, ...updates };
        // If updating isRevoked status, ensure it's a boolean
        if (updates.isRevoked !== undefined) {
          updatedLink.isRevoked = Boolean(updates.isRevoked);
        }
        console.log('Updated link:', updatedLink);
        return updatedLink;
      }
      return link;
    }));
    
    // Trigger a refresh after a short delay to ensure data consistency
    setTimeout(() => {
      setRefreshTrigger(prev => prev + 1);
    }, 500);
  };

  const deleteLink = (id: string) => {
    setLinks(prev => prev.filter(link => link.id !== id));
    toast.success('Link deleted successfully');
    
    // Trigger a refresh after a short delay
    setTimeout(() => {
      setRefreshTrigger(prev => prev + 1);
    }, 500);
  };

  const incrementClickCount = (shortCode: string) => {
    setLinks(prev => prev.map(link =>
      link.shortCode === shortCode ? { ...link, clickCount: link.clickCount + 1 } : link
    ));
  };

  return (
    <RefreshTriggerContext.Provider value={triggerRefresh}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <UrlShortener onLinkCreated={addLink} existingLinks={links} />
        <LinkManagement
          links={links}
          onUpdateLink={updateLink}
          onDeleteLink={deleteLink}
          onIncrementClick={incrementClickCount}
        />
      </div>
    </RefreshTriggerContext.Provider>
  );
}
