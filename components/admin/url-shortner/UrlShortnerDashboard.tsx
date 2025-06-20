'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";

interface ShortenedLink {
  id: string;
  originalUrl: string;
  shortCode: string;
  shortUrl: string;
  createdAt: Date;
  expiresAt: Date | null;
  clickCount: number;
  isRevoked: boolean;
}

export function UrlShortnerDashboard() {
  const [url, setUrl] = useState('');
  const [links, setLinks] = useState<ShortenedLink[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadLinks();
  }, []);

  const loadLinks = () => {
    const savedLinks = localStorage.getItem('shortenedLinks');
    if (savedLinks) {
      try {
        const parsedLinks = JSON.parse(savedLinks).map((link: any) => ({
          ...link,
          createdAt: new Date(link.createdAt),
          expiresAt: link.expiresAt ? new Date(link.expiresAt) : null,
        }));
        setLinks(parsedLinks);
      } catch (error) {
        console.error('Error loading links:', error);
        toast.error('Failed to load shortened links');
      }
    }
  };

  const generateShortCode = () => {
    return Math.random().toString(36).substring(2, 8);
  };

  const shortenUrl = async () => {
    if (!url) {
      toast.error('Please enter a URL');
      return;
    }

    try {
      setLoading(true);
      const shortCode = generateShortCode();
      const newLink: ShortenedLink = {
        id: crypto.randomUUID(),
        originalUrl: url,
        shortCode,
        shortUrl: `${window.location.origin}/s/${shortCode}`,
        createdAt: new Date(),
        expiresAt: null,
        clickCount: 0,
        isRevoked: false,
      };

      setLinks(prev => [newLink, ...prev]);
      localStorage.setItem('shortenedLinks', JSON.stringify([newLink, ...links]));
      setUrl('');
      toast.success('URL shortened successfully!');
      await navigator.clipboard.writeText(newLink.shortUrl);
      toast.success('Short URL copied to clipboard!');
    } catch (error) {
      console.error('Error shortening URL:', error);
      toast.error('Failed to shorten URL');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      toast.success('URL copied to clipboard!');
    } catch (error) {
      toast.error('Failed to copy URL');
    }
  };

  const revokeLink = (id: string) => {
    const updatedLinks = links.map(link =>
      link.id === id ? { ...link, isRevoked: true } : link
    );
    setLinks(updatedLinks);
    localStorage.setItem('shortenedLinks', JSON.stringify(updatedLinks));
    toast.success('Link revoked successfully');
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
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Create Short URL</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <Input
              placeholder="Enter long URL"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="flex-1"
            />
            <Button onClick={shortenUrl} disabled={loading}>
              {loading ? 'Shortening...' : 'Shorten URL'}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Shortened URLs</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Original URL</TableHead>
                <TableHead>Short URL</TableHead>
                <TableHead>Created At</TableHead>
                <TableHead>Clicks</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {links.map((link) => (
                <TableRow key={link.id}>
                  <TableCell className="max-w-[200px] truncate">
                    {link.originalUrl}
                  </TableCell>
                  <TableCell>{ensureCorrectBaseUrl(link.shortUrl)}</TableCell>
                  <TableCell>
                    {new Date(link.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell>{link.clickCount}</TableCell>
                  <TableCell>
                    <span className={link.isRevoked ? 'text-red-500' : 'text-green-500'}>
                      {link.isRevoked ? 'Revoked' : 'Active'}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => copyToClipboard(ensureCorrectBaseUrl(link.shortUrl))}
                      >
                        Copy
                      </Button>
                      {!link.isRevoked && (
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => revokeLink(link.id)}
                        >
                          Revoke
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
