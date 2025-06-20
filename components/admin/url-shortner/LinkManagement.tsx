"use client";
import { useState, useMemo } from 'react';
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
    let filtered = links.filter(link => {
      const matchesSearch = searchTerm === '' ||
        link.originalUrl.toLowerCase().includes(searchTerm.toLowerCase()) ||
        link.shortUrl.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesFilter = filterStatus === 'all' ||
        (filterStatus === 'active' && !link.isRevoked && !isLinkExpired(link)) ||
        (filterStatus === 'expired' && (link.isRevoked || isLinkExpired(link)));
      return matchesSearch && matchesFilter;
    });
    return filtered.sort((a, b) => {
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
      <CardHeader className="pb-4 sm:pb-6">
        <CardTitle className="text-xl sm:text-2xl font-bold text-slate-800 flex flex-col sm:flex-row items-start sm:items-center gap-2">
          <div className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
            <span>Link Management</span>
          </div>
          <Badge variant="secondary" className="text-xs sm:ml-auto">
            {links.length} total
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 sm:space-y-6">
        {/* Filters and Search - Stack on mobile */}
        <div className="flex flex-col gap-3 sm:gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
            <Input
              placeholder="Search by URL..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 border-slate-200 focus:border-blue-500 h-10 sm:h-auto"
            />
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-full sm:w-32 h-10 sm:h-auto">
                <Filter className="h-4 w-4 mr-1" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-white border border-slate-200 shadow-lg z-50">
                <SelectItem value="all">All Links</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="expired">Expired</SelectItem>
              </SelectContent>
            </Select>
            <Select value={`${sortBy}-${sortOrder}`} onValueChange={(value) => {
              const [field, order] = value.split('-');
              setSortBy(field);
              setSortOrder(order as 'asc' | 'desc');
            }}>
              <SelectTrigger className="w-full sm:w-40 h-10 sm:h-auto">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-white border border-slate-200 shadow-lg z-50">
                <SelectItem value="createdAt-desc">Newest First</SelectItem>
                <SelectItem value="createdAt-asc">Oldest First</SelectItem>
                <SelectItem value="clickCount-desc">Most Clicks</SelectItem>
                <SelectItem value="clickCount-asc">Least Clicks</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        {/* Links List - Optimized for mobile */}
        <div className="space-y-3 max-h-[70vh] sm:max-h-[600px] overflow-y-auto">
          {filteredAndSortedLinks.length === 0 ? (
            <div className="text-center py-8 sm:py-12 text-slate-500">
              <BarChart3 className="h-10 w-10 sm:h-12 sm:w-12 mx-auto mb-3 sm:mb-4 text-slate-300" />
              <p className="text-base sm:text-lg font-medium">No links found</p>
              <p className="text-xs sm:text-sm">Create your first short link to get started</p>
            </div>
          ) : (
            filteredAndSortedLinks.map((link) => (
              <div
                key={link.id}
                className="p-3 sm:p-4 border border-slate-200 rounded-lg hover:shadow-md transition-shadow bg-white"
              >
                <div className="flex flex-col gap-3 sm:gap-4">
                  {/* Header with status and dates */}
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
                    {getStatusBadge(link)}
                    <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs text-slate-500">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        <span className="text-xs">{formatDate(link.createdAt)}</span>
                      </div>
                      {link.expiresAt && (
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          <span className="text-xs">Expires {formatDate(link.expiresAt)}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-1">
                        <BarChart3 className="h-3 w-3" />
                        <span className="text-xs">{link.clickCount} clicks</span>
                      </div>
                    </div>
                  </div>
                  {/* URLs */}
                  <div className="space-y-2">
                    <div>
                      <p className="text-xs text-slate-500 mb-1">Original URL</p>
                      <p className="text-xs sm:text-sm text-slate-800 break-all font-mono bg-slate-50 px-2 py-1.5 rounded">
                        {link.originalUrl}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 mb-1">Short URL</p>
                      <p className="text-xs sm:text-sm text-blue-600 font-mono bg-blue-50 px-2 py-1.5 rounded break-all">
                        {ensureCorrectBaseUrl(link.shortUrl)}
                      </p>
                    </div>
                  </div>
                  {/* Action buttons - Stack on mobile */}
                  <div className="flex flex-wrap gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleLinkClick(link)}
                      disabled={link.isRevoked || isLinkExpired(link)}
                      className="text-xs h-8 px-3 flex-1 sm:flex-none"
                    >
                      <ExternalLink className="h-3 w-3 mr-1" />
                      Visit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard(ensureCorrectBaseUrl(link.shortUrl))}
                      className="text-xs h-8 px-3 flex-1 sm:flex-none"
                    >
                      <Copy className="h-3 w-3 mr-1" />
                      Copy
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleRevokeLink(link)}
                      className={`text-xs h-8 px-3 flex-1 sm:flex-none ${
                        link.isRevoked 
                          ? "text-green-600 hover:text-green-700 hover:bg-green-50" 
                          : "text-orange-600 hover:text-orange-700 hover:bg-orange-50"
                      }`}
                    >
                      {link.isRevoked ? (
                        <>
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Reactivate
                        </>
                      ) : (
                        <>
                          <Ban className="h-3 w-3 mr-1" />
                          Revoke
                        </>
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteLink(link.id, link.shortCode)}
                      className="text-xs h-8 px-3 text-red-600 hover:text-red-700 hover:bg-red-50 flex-1 sm:flex-none"
                    >
                      <Trash2 className="h-3 w-3 mr-1" />
                      Delete
                    </Button>
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
