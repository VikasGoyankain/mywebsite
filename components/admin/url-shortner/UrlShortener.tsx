"use client";
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Copy, Link as LinkIcon } from 'lucide-react';
import { toast } from 'sonner';
import { ShortenedLink } from './UrlShortnerIndex';
import { generateShortCode, isValidUrl, addHttpsPrefix } from './urlUtils';

interface UrlShortenerProps {
  onLinkCreated: (link: ShortenedLink) => void;
  existingLinks: ShortenedLink[];
}

export const UrlShortener = ({ onLinkCreated, existingLinks }: UrlShortenerProps) => {
  const [originalUrl, setOriginalUrl] = useState('');
  const [expirationTime, setExpirationTime] = useState('permanent');
  const [isLoading, setIsLoading] = useState(false);
  const [lastCreatedUrl, setLastCreatedUrl] = useState('');

  const getExpirationDate = (timeValue: string): Date | null => {
    if (timeValue === 'permanent') return null;
    const now = new Date();
    switch (timeValue) {
      case '1day':
        return new Date(now.getTime() + 24 * 60 * 60 * 1000);
      case '1week':
        return new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
      case '1month':
        return new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
      default:
        return null;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!originalUrl.trim()) {
      toast.error('Please enter a URL');
      return;
    }
    setIsLoading(true);
    try {
      const processedUrl = addHttpsPrefix(originalUrl.trim());
      if (!isValidUrl(processedUrl)) {
        toast.error('Please enter a valid URL');
        setIsLoading(false);
        return;
      }
      
      // Get expiration date if set
      const expiresAt = getExpirationDate(expirationTime);
      
      // Call API to create short link in Redis
      const res = await fetch('/api/url-shortner', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          url: processedUrl,
          expiresAt: expiresAt ? expiresAt.toISOString() : null
        })
      });
      if (!res.ok) {
        toast.error('Failed to create short link');
        setIsLoading(false);
        return;
      }
      const { shortCode, shortUrl } = await res.json();
      
      // Ensure the shortUrl uses the correct base URL
      const correctedShortUrl = ensureCorrectBaseUrl(shortUrl);
      
      const newLink: ShortenedLink = {
        id: Date.now().toString(),
        originalUrl: processedUrl,
        shortCode,
        shortUrl: correctedShortUrl,
        createdAt: new Date(),
        expiresAt,
        clickCount: 0,
        isRevoked: false,
      };
      
      await navigator.clipboard.writeText(correctedShortUrl);
      onLinkCreated(newLink);
      setLastCreatedUrl(correctedShortUrl);
      setOriginalUrl('');
    } catch (error) {
      console.error('Error creating short link:', error);
      toast.error('Failed to create short link');
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      toast.success('Copied to clipboard!');
    } catch (error) {
      toast.error('Failed to copy to clipboard');
    }
  };

  // Add this function to ensure URLs use the correct base URL
  const ensureCorrectBaseUrl = (shortUrl: string): string => {
    // If we're in production and URL contains localhost, replace it
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
    <Card className="shadow-xl border-0 bg-white/95 backdrop-blur h-fit">
      <CardHeader className="text-center pb-4 sm:pb-6">
        <CardTitle className="text-xl sm:text-2xl font-bold text-slate-800 flex items-center justify-center gap-2">
          <LinkIcon className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
          <span className="text-center">Create Short Link</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 sm:space-y-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="url" className="text-sm font-medium text-slate-700">
              Enter your long URL
            </Label>
            <Input
              id="url"
              type="text"
              placeholder="https://example.com/very-long-url"
              value={originalUrl}
              onChange={(e) => setOriginalUrl(e.target.value)}
              className="h-11 sm:h-12 text-sm sm:text-base border-slate-200 focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="expiration" className="text-sm font-medium text-slate-700">
              Link expiration
            </Label>
            <Select value={expirationTime} onValueChange={setExpirationTime}>
              <SelectTrigger className="h-11 sm:h-12 border-slate-200 focus:border-blue-500 focus:ring-blue-500">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-white border border-slate-200 shadow-lg z-50">
                <SelectItem value="permanent">Permanent</SelectItem>
                <SelectItem value="1day">1 Day</SelectItem>
                <SelectItem value="1week">1 Week</SelectItem>
                <SelectItem value="1month">1 Month</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button
            type="submit"
            className="w-full h-11 sm:h-12 text-sm sm:text-base font-medium bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg hover:shadow-xl transition-all duration-200"
            disabled={isLoading}
          >
            {isLoading ? 'Creating...' : 'Create Short Link'}
          </Button>
        </form>
        {lastCreatedUrl && (
          <div className="mt-4 sm:mt-6 p-3 sm:p-4 bg-green-50 border border-green-200 rounded-lg">
            <Label className="text-sm font-medium text-green-800 mb-2 block">
              Your short link is ready!
            </Label>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
              <Input
                value={ensureCorrectBaseUrl(lastCreatedUrl)}
                readOnly
                className="flex-1 bg-white border-green-300 text-green-700 font-mono text-xs sm:text-sm h-10 sm:h-auto"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => copyToClipboard(ensureCorrectBaseUrl(lastCreatedUrl))}
                className="border-green-300 text-green-700 hover:bg-green-100 h-10 px-3 sm:px-4 whitespace-nowrap"
              >
                <Copy className="h-4 w-4 sm:mr-1" />
                <span className="hidden sm:inline">Copy</span>
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
