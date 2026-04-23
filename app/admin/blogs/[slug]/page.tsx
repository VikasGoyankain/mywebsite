"use client";

import { useState, useEffect, useMemo } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Save,
  Send,
  Eye,
  FileText,
  X,
  Plus,
  Link as LinkIcon,
  Video,
  FolderOpen,
  Calendar,
  Tag,
  Loader2,
  Bell,
  BellRing,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { SendNotificationDialog } from '@/components/admin/SendNotificationDialog';
import {
  Blog,
  BlogStatus,
  BlogVisibility,
  BlogAudience,
  BlogType,
  CreateBlogInput,
  UpdateBlogInput,
  generateSlug,
  calculateReadingTime,
} from '@/lib/types/Blog';

interface BlogEditorPageProps {
  params: { slug: string };
}

export default function BlogEditorPage({ params }: BlogEditorPageProps) {
  const router = useRouter();
  const { toast } = useToast();
  const isNew = params.slug === 'new';

  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('content');
  const [notificationDialogOpen, setNotificationDialogOpen] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState<Partial<Blog>>({
    title: '',
    slug: '',
    date: new Date().toISOString().split('T')[0],
    type: 'blog',
    status: 'draft',
    summary: '',
    tags: [],
    linked_project: null,
    linked_publication: null,
    linked_video: null,
    content: '',
    version: 'v1.0',
    canonical: true,
    visibility: 'public',
    audience: 'general',
  });

  const [newTag, setNewTag] = useState('');
  const [autoSlug, setAutoSlug] = useState(true);

  // Fetch blog if editing
  useEffect(() => {
    if (!isNew) {
      fetchBlog();
    }
  }, [isNew, params.slug]);

  const fetchBlog = async () => {
    try {
      const response = await fetch(`/api/blogs/${params.slug}`);
      if (!response.ok) {
        if (response.status === 404) {
          toast({
            title: 'Not found',
            description: 'Blog post not found',
            variant: 'destructive',
          });
          router.push('/admin/blogs');
          return;
        }
        throw new Error('Failed to fetch blog');
      }
      const blog = await response.json();
      setFormData({
        ...blog,
        date: blog.date?.split('T')[0] || new Date().toISOString().split('T')[0],
      });
      setAutoSlug(false);
    } catch (error) {
      console.error('Error fetching blog:', error);
      toast({
        title: 'Error',
        description: 'Failed to load blog',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // Update slug when title changes (if auto-slug is enabled)
  useEffect(() => {
    if (autoSlug && formData.title) {
      setFormData((prev) => ({
        ...prev,
        slug: generateSlug(formData.title!),
      }));
    }
  }, [formData.title, autoSlug]);

  // Calculate reading time
  const readingTime = useMemo(() => {
    return calculateReadingTime(formData.content || '');
  }, [formData.content]);

  // Word count
  const wordCount = useMemo(() => {
    return formData.content?.trim().split(/\s+/).filter(Boolean).length || 0;
  }, [formData.content]);

  // Handle field changes
  const handleChange = (field: keyof Blog, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // Add tag
  const handleAddTag = () => {
    const tag = newTag.trim();
    if (tag && !formData.tags?.includes(tag)) {
      handleChange('tags', [...(formData.tags || []), tag]);
      setNewTag('');
    }
  };

  // Remove tag
  const handleRemoveTag = (tagToRemove: string) => {
    handleChange(
      'tags',
      formData.tags?.filter((t) => t !== tagToRemove) || []
    );
  };

  // Save blog
  const handleSave = async (publish = false) => {
    // Validation
    if (!formData.title?.trim()) {
      toast({
        title: 'Validation error',
        description: 'Title is required',
        variant: 'destructive',
      });
      return;
    }

    if (!formData.summary?.trim()) {
      toast({
        title: 'Validation error',
        description: 'Summary is required',
        variant: 'destructive',
      });
      return;
    }

    setSaving(true);
    try {
      const payload: CreateBlogInput | UpdateBlogInput = {
        title: formData.title.trim(),
        slug: formData.slug || generateSlug(formData.title),
        date: formData.date || new Date().toISOString(),
        type: formData.type || 'blog',
        status: publish ? 'published' : (formData.status || 'draft'),
        summary: formData.summary.trim(),
        tags: formData.tags || [],
        linked_project: formData.linked_project || null,
        linked_publication: formData.linked_publication || null,
        linked_video: formData.linked_video || null,
        content: formData.content || '',
        version: formData.version || 'v1.0',
        canonical: formData.canonical ?? true,
        visibility: formData.visibility || 'public',
        audience: formData.audience || 'general',
      };

      const url = isNew ? '/api/blogs' : `/api/blogs/${params.slug}`;
      const method = isNew ? 'POST' : 'PUT';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to save blog');
      }

      const savedBlog = await response.json();

      toast({
        title: publish ? 'Published!' : 'Saved',
        description: publish
          ? 'Your blog post is now live'
          : 'Draft saved successfully',
      });

      // Redirect to the blog list or the saved blog
      if (isNew) {
        router.push(`/admin/blogs/${savedBlog.slug}`);
      } else {
        setFormData({
          ...savedBlog,
          date: savedBlog.date?.split('T')[0] || formData.date,
        });
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to save blog',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

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
                onClick={() => router.push('/admin/blogs')}
                className="text-muted-foreground hover:text-foreground -ml-3"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <span className="text-muted-foreground/40">|</span>
              <h1 className="text-lg font-semibold truncate">
                {isNew ? 'New Post' : formData.title || 'Edit Post'}
              </h1>
              {!isNew && formData.status && (
                <Badge
                  variant="outline"
                  className={
                    formData.status === 'published'
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : formData.status === 'draft'
                      ? 'bg-amber-50 text-amber-700 border-amber-200'
                      : 'bg-gray-50 text-gray-600 border-gray-200'
                  }
                >
                  {formData.status}
                </Badge>
              )}
            </div>

            <div className="flex items-center gap-2">
              {!isNew && formData.status === 'published' && (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open(`/blog/${formData.slug}`, '_blank')}
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    View
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setNotificationDialogOpen(true)}
                    className="text-blue-600 border-blue-200 hover:bg-blue-50"
                  >
                    <BellRing className="w-4 h-4 mr-2" />
                    Notify
                  </Button>
                </>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleSave(false)}
                disabled={saving}
              >
                {saving ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Save className="w-4 h-4 mr-2" />
                )}
                Save Draft
              </Button>
              <Button size="sm" onClick={() => handleSave(true)} disabled={saving}>
                {saving ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Send className="w-4 h-4 mr-2" />
                )}
                Publish
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Editor */}
          <div className="lg:col-span-2 space-y-6">
            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                placeholder="Post title..."
                value={formData.title}
                onChange={(e) => handleChange('title', e.target.value)}
                className="text-lg font-medium h-12"
              />
            </div>

            {/* Slug */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="slug">Slug</Label>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">Auto-generate</span>
                  <Switch
                    checked={autoSlug}
                    onCheckedChange={setAutoSlug}
                    className="scale-75"
                  />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">/blog/</span>
                <Input
                  id="slug"
                  placeholder="post-slug"
                  value={formData.slug}
                  onChange={(e) => handleChange('slug', e.target.value)}
                  disabled={autoSlug}
                  className="flex-1"
                />
              </div>
            </div>

            {/* Summary */}
            <div className="space-y-2">
              <Label htmlFor="summary">Summary</Label>
              <Textarea
                id="summary"
                placeholder="Brief summary of the post (required)..."
                value={formData.summary}
                onChange={(e) => handleChange('summary', e.target.value)}
                rows={2}
              />
              <p className="text-xs text-muted-foreground">
                Used in previews and meta descriptions
              </p>
            </div>

            {/* Content */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="content">Content</Label>
                <span className="text-xs text-muted-foreground">
                  {wordCount} words · {readingTime}
                </span>
              </div>
              <Textarea
                id="content"
                placeholder="Write your content here..."
                value={formData.content}
                onChange={(e) => handleChange('content', e.target.value)}
                rows={20}
                className="font-mono text-sm leading-relaxed"
              />
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Publish Settings */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Publish Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Status */}
                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(v) => handleChange('status', v as BlogStatus)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="published">Published</SelectItem>
                      <SelectItem value="archived">Archived</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Date */}
                <div className="space-y-2">
                  <Label>Publish Date</Label>
                  <Input
                    type="date"
                    value={formData.date}
                    onChange={(e) => handleChange('date', e.target.value)}
                  />
                </div>

                {/* Visibility */}
                <div className="space-y-2">
                  <Label>Visibility</Label>
                  <Select
                    value={formData.visibility}
                    onValueChange={(v) => handleChange('visibility', v as BlogVisibility)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="public">Public</SelectItem>
                      <SelectItem value="unlisted">Unlisted</SelectItem>
                      <SelectItem value="private">Private</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Audience */}
                <div className="space-y-2">
                  <Label>Audience</Label>
                  <Select
                    value={formData.audience}
                    onValueChange={(v) => handleChange('audience', v as BlogAudience)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="general">General</SelectItem>
                      <SelectItem value="students">Students</SelectItem>
                      <SelectItem value="professionals">Professionals</SelectItem>
                      <SelectItem value="collaborators">Collaborators</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Type & Version */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Classification</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Type */}
                <div className="space-y-2">
                  <Label>Type</Label>
                  <Select
                    value={formData.type}
                    onValueChange={(v) => handleChange('type', v as BlogType)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="blog">Blog</SelectItem>
                      <SelectItem value="note">Note</SelectItem>
                      <SelectItem value="essay">Essay</SelectItem>
                      <SelectItem value="project-log">Project Log</SelectItem>
                      <SelectItem value="tutorial">Tutorial</SelectItem>
                      <SelectItem value="research">Research</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Version */}
                <div className="space-y-2">
                  <Label>Version</Label>
                  <Input
                    placeholder="v1.0"
                    value={formData.version}
                    onChange={(e) => handleChange('version', e.target.value)}
                  />
                </div>

                {/* Canonical */}
                <div className="flex items-center justify-between">
                  <Label>Canonical post</Label>
                  <Switch
                    checked={formData.canonical}
                    onCheckedChange={(v) => handleChange('canonical', v)}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Tags */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Tags</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex gap-2">
                  <Input
                    placeholder="Add tag..."
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                  />
                  <Button variant="outline" size="icon" onClick={handleAddTag}>
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                {formData.tags && formData.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {formData.tags.map((tag) => (
                      <Badge
                        key={tag}
                        variant="secondary"
                        className="px-2 py-1 cursor-pointer hover:bg-destructive/10"
                        onClick={() => handleRemoveTag(tag)}
                      >
                        {tag}
                        <X className="w-3 h-3 ml-1" />
                      </Badge>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Links */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Linked Resources</CardTitle>
                <CardDescription className="text-xs">
                  Optional external links
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Project Link */}
                <div className="space-y-2">
                  <Label className="flex items-center gap-2 text-sm">
                    <FolderOpen className="w-4 h-4" />
                    Project
                  </Label>
                  <Input
                    placeholder="https://..."
                    value={formData.linked_project || ''}
                    onChange={(e) =>
                      handleChange('linked_project', e.target.value || null)
                    }
                  />
                </div>

                {/* Publication Link */}
                <div className="space-y-2">
                  <Label className="flex items-center gap-2 text-sm">
                    <LinkIcon className="w-4 h-4" />
                    Publication
                  </Label>
                  <Input
                    placeholder="https://..."
                    value={formData.linked_publication || ''}
                    onChange={(e) =>
                      handleChange('linked_publication', e.target.value || null)
                    }
                  />
                </div>

                {/* Video Link */}
                <div className="space-y-2">
                  <Label className="flex items-center gap-2 text-sm">
                    <Video className="w-4 h-4" />
                    Video
                  </Label>
                  <Input
                    placeholder="https://youtube.com/..."
                    value={formData.linked_video || ''}
                    onChange={(e) =>
                      handleChange('linked_video', e.target.value || null)
                    }
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      {/* Send Notification Dialog */}
      <SendNotificationDialog
        isOpen={notificationDialogOpen}
        onClose={() => setNotificationDialogOpen(false)}
        blog={formData as Blog}
      />
    </div>
  );
}
