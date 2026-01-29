"use client";
import { useState, useMemo, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import {
  Search,
  ExternalLink,
  Copy,
  Trash2,
  Ban,
  Clock,
  BarChart3,
  Calendar,
  Filter,
  CheckCircle
} from 'lucide-react';
import { toast } from 'sonner';
import { ShortenedLink } from './UrlShortnerIndex';
import { formatDate, isLinkExpired } from './urlUtils';

interface LinkManagementProps {
  links: ShortenedLink[];
  onUpdateLink: (id: string, updates: Partial<ShortenedLink>) => void;
  onDeleteLink: (id: string) => void;
  onIncrementClick: (shortCode: string) => void;
}

export const LinkManagement = ({
  links,
  onUpdateLink,
  onDeleteLink,
  onIncrementClick
}: LinkManagementProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [filterStatus, setFilterStatus] = useState('all');

  const filteredAndSortedLinks = useMemo(() => {
    console.time('filter-sort-links');
    let filtered = links.filter(link => {
      const matchesSearch = searchTerm === '' ||
        link.originalUrl.toLowerCase().includes(searchTerm.toLowerCase()) ||
        link.shortUrl.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesFilter = filterStatus === 'all' ||
        (filterStatus === 'active' && !link.isRevoked && !isLinkExpired(link)) ||
        (filterStatus === 'expired' && (link.isRevoked || isLinkExpired(link)));
      return matchesSearch && matchesFilter;
    });
    
    const sorted = filtered.sort((a, b) => {
      let aValue: any = a[sortBy as keyof ShortenedLink];
      let bValue: any = b[sortBy as keyof ShortenedLink];
      if (sortBy === 'createdAt' || sortBy === 'expiresAt') {
        aValue = aValue ? new Date(aValue).getTime() : 0;
        bValue = bValue ? new Date(bValue).getTime() : 0;
      }
      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });
    console.timeEnd('filter-sort-links');
    return sorted;
  }, [links, searchTerm, sortBy, sortOrder, filterStatus]);

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success('Copied to clipboard!');
    } catch (error) {
      toast.error('Failed to copy to clipboard');
    }
  };

  const handleRevokeLink = async (link: ShortenedLink) => {
    try {
      const action = 'revoke'; // Always use 'revoke' action, the API will toggle based on current state
      console.log(`Revoking link ${link.shortCode}, current status: ${link.isRevoked}`);
      
      // Optimistically update UI before API call
      const newRevokedStatus = !link.isRevoked;
      onUpdateLink(link.id, { isRevoked: newRevokedStatus });
      
      // Add cache-busting parameter
      const timestamp = new Date().getTime();
      const response = await fetch(`/api/url-shortner?code=${link.shortCode}&action=${action}&_=${timestamp}`, {
        method: 'DELETE',
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      });
      
      if (!response.ok) {
        // Revert the optimistic update if API call fails
        onUpdateLink(link.id, { isRevoked: link.isRevoked });
        throw new Error('Failed to update link status');
      }
      
      const result = await response.json();
      console.log('API response for revoke:', result);
      
      // Update the link with the actual status from the API (should match our optimistic update)
      onUpdateLink(link.id, { isRevoked: result.isRevoked });
      
      toast.success(newRevokedStatus ? 'Link revoked successfully' : 'Link reactivated successfully');
    } catch (error) {
      console.error('Error updating link status:', error);
      toast.error('Failed to update link status');
    }
  };

  const handleDeleteLink = async (id: string, shortCode: string) => {
    try {
      const response = await fetch(`/api/url-shortner?code=${shortCode}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete link');
      }
      
      onDeleteLink(id);
      toast.success('Link deleted successfully');
    } catch (error) {
      console.error('Error deleting link:', error);
      toast.error('Failed to delete link');
    }
  };

  const handleLinkClick = (link: ShortenedLink) => {
    if (link.isRevoked || isLinkExpired(link)) {
      toast.error('This link has expired or been revoked');
      return;
    }
    onIncrementClick(link.shortCode);
    window.open(link.originalUrl, '_blank');
  };

  const getStatusBadge = (link: ShortenedLink) => {
    if (link.isRevoked) {
      return <Badge variant="destructive" className="text-xs">Revoked</Badge>;
    }
    if (isLinkExpired(link)) {
      return <Badge variant="secondary" className="text-xs">Expired</Badge>;
    }
    return <Badge variant="default" className="text-xs bg-green-100 text-green-800">Active</Badge>;
  };

  const ensureCorrectBaseUrl = (shortUrl: string): string => {
    if (typeof window !== 'undefined' && 
        window.location.hostname !== 'localhost' && 
        shortUrl.includes('localhost')) {
      return shortUrl.replace(
        /http:\/\/localhost:\d+/,
        window.location.origin
      );
    }
    return shortUrl;
  };

  return (
    <Card className="shadow-xl border-0 bg-white/95 backdrop-blur">
      <CardHeader className="pb-4 sm:pb-6 sticky top-0 bg-white/95 backdrop-blur z-10 border-b">
        <CardTitle className="text-xl sm:text-2xl font-bold text-slate-800 flex flex-col sm:flex-row items-start sm:items-center gap-2">
          <div className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
            <span>Link Management</span>
          </div>
          <Badge variant="secondary" className="text-xs sm:ml-auto">
            {filteredAndSortedLinks.length} of {links.length} total
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 sm:space-y-6 p-4 sm:p-6">
        <div className="flex flex-col gap-3 sm:gap-4 sticky top-[72px] bg-white/95 backdrop-blur z-10 pb-4 border-b">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
            <Input
              placeholder="Search by URL..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-white"
            />
          </div>
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-full sm:w-[180px] bg-white">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Links</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="expired">Expired/Revoked</SelectItem>
              </SelectContent>
            </Select>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-full sm:w-[180px] bg-white">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="createdAt">Creation Date</SelectItem>
                <SelectItem value="clickCount">Click Count</SelectItem>
                <SelectItem value="expiresAt">Expiry Date</SelectItem>
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
              className="w-full sm:w-auto bg-white"
            >
              {sortOrder === 'asc' ? '↑ Ascending' : '↓ Descending'}
            </Button>
          </div>
        </div>

        <div className="space-y-4 overflow-y-auto max-h-[calc(100vh-300px)] min-h-[300px] pr-2">
          {filteredAndSortedLinks.length === 0 ? (
            <div className="text-center py-8 text-slate-500">
              No links found. {searchTerm || filterStatus !== 'all' ? 'Try adjusting your filters.' : ''}
            </div>
          ) : (
            filteredAndSortedLinks.map((link) => (
              <div key={link.id} className="bg-white rounded-lg border border-slate-200 p-4 hover:shadow-md transition-shadow">
                <div className="flex flex-col gap-3">
                  {/* Original URL */}
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                    <div className="flex-grow">
                      <div className="text-sm font-medium text-slate-500 mb-1">Original URL</div>
                      <div className="text-sm text-slate-900 break-all">
                        <a 
                          href={link.originalUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="hover:text-blue-600 flex items-center gap-1"
                          onClick={(e) => {
                            e.preventDefault();
                            handleLinkClick(link);
                          }}
                        >
                          {link.originalUrl}
                          <ExternalLink className="h-3 w-3 inline-block" />
                        </a>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 sm:gap-3">
                      <Badge variant="outline" className="whitespace-nowrap">
                        {link.clickCount} clicks
                      </Badge>
                      {getStatusBadge(link)}
                    </div>
                  </div>

                  {/* Short URL and Actions */}
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 pt-2 border-t">
                    <div className="flex-grow">
                      <div className="text-sm font-medium text-slate-500 mb-1">Short URL</div>
                      <div className="text-sm text-slate-900 break-all">
                        <div className="flex items-center gap-2">
                          <a 
                            href={ensureCorrectBaseUrl(link.shortUrl)} 
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:text-blue-600"
                          >
                            {ensureCorrectBaseUrl(link.shortUrl)}
                          </a>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => copyToClipboard(ensureCorrectBaseUrl(link.shortUrl))}
                            className="h-6 w-6"
                          >
                            <Copy className="h-3 w-3" />
                            <span className="sr-only">Copy URL</span>
                          </Button>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center justify-end gap-2 sm:gap-3">
                      <div className="text-xs text-slate-500 whitespace-nowrap">
                        Created {formatDate(link.createdAt)}
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRevokeLink(link)}
                        className="text-slate-700 hover:text-red-600"
                      >
                        <Ban className="h-4 w-4 mr-1" />
                        <span className="sr-only sm:not-sr-only sm:inline">
                          {link.isRevoked ? 'Reactivate' : 'Revoke'}
                        </span>
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteLink(link.id, link.shortCode)}
                        className="text-slate-700 hover:text-red-600"
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        <span className="sr-only sm:not-sr-only sm:inline">Delete</span>
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};
