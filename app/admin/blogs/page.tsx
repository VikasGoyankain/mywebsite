"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import {
  ArrowLeft,
  Plus,
  Search,
  Filter,
  Pencil,
  Trash2,
  Eye,
  EyeIcon,
  Archive,
  FileText,
  Send,
  MoreVertical,
  Clock,
  Tag,
  ExternalLink,
  BarChart3,
  Bell,
  BellRing,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { Blog, BlogStatus } from '@/lib/types/Blog';
import { cn } from '@/lib/utils';
import { SendNotificationDialog } from '@/components/admin/SendNotificationDialog';

export default function AdminBlogsPage() {
  const router = useRouter();
  const { toast } = useToast();
  
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<BlogStatus | 'all'>('all');
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; blog: Blog | null }>({
    open: false,
    blog: null,
  });
  const [deleting, setDeleting] = useState(false);
  const [notificationDialog, setNotificationDialog] = useState<{ open: boolean; blog: Blog | null }>({
    open: false,
    blog: null,
  });

  // Fetch blogs
  useEffect(() => {
    fetchBlogs();
  }, []);

  const fetchBlogs = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/blogs?all=true');
      if (!response.ok) throw new Error('Failed to fetch blogs');
      const data = await response.json();
      setBlogs(data);
    } catch (error) {
      console.error('Error fetching blogs:', error);
      toast({
        title: 'Error',
        description: 'Failed to load blogs',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // Filter blogs
  const filteredBlogs = blogs.filter((blog) => {
    const matchesSearch =
      blog.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      blog.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
      blog.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesStatus = statusFilter === 'all' || blog.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Status counts
  const statusCounts = {
    all: blogs.length,
    draft: blogs.filter((b) => b.status === 'draft').length,
    published: blogs.filter((b) => b.status === 'published').length,
    archived: blogs.filter((b) => b.status === 'archived').length,
    totalViews: blogs.reduce((sum, b) => sum + (b.views || 0), 0),
  };

  // Change blog status
  const handleStatusChange = async (blog: Blog, newStatus: BlogStatus) => {
    try {
      const response = await fetch(`/api/blogs/${blog.slug}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) throw new Error('Failed to update status');

      toast({
        title: 'Status updated',
        description: `"${blog.title}" is now ${newStatus}`,
      });

      fetchBlogs();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update blog status',
        variant: 'destructive',
      });
    }
  };

  // Delete blog
  const handleDelete = async () => {
    if (!deleteDialog.blog) return;

    setDeleting(true);
    try {
      const response = await fetch(`/api/blogs/${deleteDialog.blog.slug}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete blog');

      toast({
        title: 'Blog deleted',
        description: `"${deleteDialog.blog.title}" has been deleted`,
      });

      setDeleteDialog({ open: false, blog: null });
      fetchBlogs();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete blog',
        variant: 'destructive',
      });
    } finally {
      setDeleting(false);
    }
  };

  // Status badge colors
  const getStatusBadge = (status: BlogStatus) => {
    switch (status) {
      case 'published':
        return (
          <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-0">
            Published
          </Badge>
        );
      case 'draft':
        return (
          <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100 border-0">
            Draft
          </Badge>
        );
      case 'archived':
        return (
          <Badge className="bg-gray-100 text-gray-600 hover:bg-gray-100 border-0">
            Archived
          </Badge>
        );
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-border/60 bg-background/95 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push('/admin')}
                className="text-muted-foreground hover:text-foreground -ml-3"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Admin
              </Button>
              <span className="text-muted-foreground/40">|</span>
              <h1 className="text-lg font-semibold">Blog Management</h1>
            </div>

            <Button onClick={() => router.push('/admin/blogs/new')}>
              <Plus className="w-4 h-4 mr-2" />
              New Post
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold">{statusCounts.all}</div>
              <p className="text-sm text-muted-foreground">Total Posts</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-emerald-600">
                {statusCounts.published}
              </div>
              <p className="text-sm text-muted-foreground">Published</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-amber-600">
                {statusCounts.draft}
              </div>
              <p className="text-sm text-muted-foreground">Drafts</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-gray-500">
                {statusCounts.archived}
              </div>
              <p className="text-sm text-muted-foreground">Archived</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-blue-600">
                {statusCounts.totalViews.toLocaleString()}
              </div>
              <p className="text-sm text-muted-foreground">Total Views</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          {/* Search */}
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search posts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Status tabs */}
          <Tabs
            value={statusFilter}
            onValueChange={(v) => setStatusFilter(v as BlogStatus | 'all')}
          >
            <TabsList>
              <TabsTrigger value="all">All ({statusCounts.all})</TabsTrigger>
              <TabsTrigger value="published">
                Published ({statusCounts.published})
              </TabsTrigger>
              <TabsTrigger value="draft">Drafts ({statusCounts.draft})</TabsTrigger>
              <TabsTrigger value="archived">
                Archived ({statusCounts.archived})
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Blog List */}
        {loading ? (
          <div className="py-20 text-center">
            <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-muted-foreground/30 border-t-primary" />
          </div>
        ) : filteredBlogs.length > 0 ? (
          <div className="space-y-3">
            {filteredBlogs.map((blog) => (
              <Card key={blog.id} className="hover:shadow-sm transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    {/* Icon */}
                    <div className="hidden sm:flex w-10 h-10 rounded-lg bg-muted items-center justify-center flex-shrink-0">
                      <FileText className="w-5 h-5 text-muted-foreground" />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-medium truncate">{blog.title}</h3>
                            {getStatusBadge(blog.status)}
                          </div>
                          <p className="text-sm text-muted-foreground line-clamp-1 mb-2">
                            {blog.summary}
                          </p>
                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {format(new Date(blog.date), 'MMM d, yyyy')}
                            </span>
                            {blog.reading_time && (
                              <span>{blog.reading_time}</span>
                            )}
                            <span className="flex items-center gap-1">
                              <EyeIcon className="w-3 h-3" />
                              {(blog.views || 0).toLocaleString()} views
                            </span>
                            {blog.tags.length > 0 && (
                              <span className="flex items-center gap-1">
                                <Tag className="w-3 h-3" />
                                {blog.tags.slice(0, 2).join(', ')}
                                {blog.tags.length > 2 && ` +${blog.tags.length - 2}`}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Actions */}
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="flex-shrink-0">
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => router.push(`/admin/blogs/${blog.slug}`)}
                            >
                              <Pencil className="w-4 h-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => window.open(`/blog/${blog.slug}`, '_blank')}
                            >
                              <Eye className="w-4 h-4 mr-2" />
                              Preview
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            {blog.status === 'published' && (
                              <DropdownMenuItem
                                onClick={() => setNotificationDialog({ open: true, blog })}
                                className="text-blue-600 focus:text-blue-600"
                              >
                                <BellRing className="w-4 h-4 mr-2" />
                                Send Notification
                              </DropdownMenuItem>
                            )}
                            {blog.status !== 'published' && (
                              <DropdownMenuItem
                                onClick={() => handleStatusChange(blog, 'published')}
                              >
                                <Send className="w-4 h-4 mr-2" />
                                Publish
                              </DropdownMenuItem>
                            )}
                            {blog.status !== 'draft' && (
                              <DropdownMenuItem
                                onClick={() => handleStatusChange(blog, 'draft')}
                              >
                                <FileText className="w-4 h-4 mr-2" />
                                Move to Draft
                              </DropdownMenuItem>
                            )}
                            {blog.status !== 'archived' && (
                              <DropdownMenuItem
                                onClick={() => handleStatusChange(blog, 'archived')}
                              >
                                <Archive className="w-4 h-4 mr-2" />
                                Archive
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-destructive focus:text-destructive"
                              onClick={() => setDeleteDialog({ open: true, blog })}
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="py-20 text-center">
            <FileText className="w-12 h-12 mx-auto text-muted-foreground/30 mb-4" />
            <h3 className="text-lg font-medium mb-2">No posts found</h3>
            <p className="text-muted-foreground mb-6">
              {searchQuery || statusFilter !== 'all'
                ? 'Try adjusting your search or filters'
                : 'Create your first blog post to get started'}
            </p>
            {!searchQuery && statusFilter === 'all' && (
              <Button onClick={() => router.push('/admin/blogs/new')}>
                <Plus className="w-4 h-4 mr-2" />
                Create Post
              </Button>
            )}
          </div>
        )}
      </main>

      {/* Delete Dialog */}
      <Dialog
        open={deleteDialog.open}
        onOpenChange={(open) => setDeleteDialog({ open, blog: open ? deleteDialog.blog : null })}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Blog Post</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{deleteDialog.blog?.title}"? This action cannot be
              undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialog({ open: false, blog: null })}
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={deleting}>
              {deleting ? 'Deleting...' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Send Notification Dialog */}
      <SendNotificationDialog
        isOpen={notificationDialog.open}
        onClose={() => setNotificationDialog({ open: false, blog: null })}
        blog={notificationDialog.blog}
      />
    </div>
  );
}
