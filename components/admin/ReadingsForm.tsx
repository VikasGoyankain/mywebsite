"use client";

import { useState, useEffect } from 'react';
import { Plus, Trash2, BookOpen, GraduationCap, Image as ImageIcon, Loader2, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import dynamic from 'next/dynamic';
import type { ReadingItem, ReadingType, CreateReadingInput, UpdateReadingInput } from '@/types/expertise';

// Dynamically import simple rich text editor to avoid SSR issues
const SimpleRichEditor = dynamic(
  () => import('@/components/ui/simple-rich-editor').then(mod => mod.SimpleRichEditor),
  { 
    ssr: false,
    loading: () => (
      <div className="h-[400px] border rounded-lg flex items-center justify-center bg-muted/30">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    )
  }
);

interface ReadingsFormProps {
  onDataChange?: () => void;
}

const initialFormState = {
  title: '',
  author: '',
  type: 'book' as ReadingType,
  imageUrl: '',
  impactOnThinking: '',
  notes: '',
  platform: '',
  duration: '',
  completionDate: '',
};

export function ReadingsForm({ onDataChange }: ReadingsFormProps) {
  const [readings, setReadings] = useState<ReadingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(initialFormState);
  const [externalImageUrl, setExternalImageUrl] = useState('');
  const { toast } = useToast();

  // Fetch readings from API
  const fetchReadings = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/readings');
      if (response.ok) {
        const data = await response.json();
        setReadings(data);
      } else {
        toast({
          title: 'Error',
          description: 'Failed to fetch readings',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error fetching readings:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch readings',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReadings();
  }, []);

  const resetForm = () => {
    setForm(initialFormState);
    setExternalImageUrl('');
    setEditingId(null);
    setIsDialogOpen(false);
  };

  // Upload image from external URL to ImageKit CDN
  const handleImageUpload = async () => {
    if (!externalImageUrl.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter an image URL',
        variant: 'destructive',
      });
      return;
    }

    try {
      setUploadingImage(true);
      const response = await fetch('/api/readings/upload-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageUrl: externalImageUrl,
          title: form.title || 'reading',
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setForm({ ...form, imageUrl: data.imageUrl });
        setExternalImageUrl('');
        toast({
          title: 'Success',
          description: 'Image uploaded to CDN successfully',
        });
      } else {
        const error = await response.json();
        toast({
          title: 'Error',
          description: error.error || 'Failed to upload image',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      toast({
        title: 'Error',
        description: 'Failed to upload image',
        variant: 'destructive',
      });
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!form.title.trim() || !form.author.trim() || !form.impactOnThinking.trim()) {
      toast({
        title: 'Error',
        description: 'Please fill in all required fields',
        variant: 'destructive',
      });
      return;
    }

    try {
      setSaving(true);

      const payload: CreateReadingInput | UpdateReadingInput = {
        title: form.title,
        author: form.author,
        type: form.type,
        imageUrl: form.imageUrl || undefined,
        impactOnThinking: form.impactOnThinking,
        notes: form.notes || undefined,
        platform: form.type === 'course' ? form.platform || undefined : undefined,
        duration: form.type === 'course' ? form.duration || undefined : undefined,
        completionDate: form.type === 'course' ? form.completionDate || undefined : undefined,
      };

      let response;
      if (editingId) {
        response = await fetch(`/api/readings/${editingId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      } else {
        response = await fetch('/api/readings', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      }

      if (response.ok) {
        toast({
          title: 'Success',
          description: editingId ? 'Reading updated successfully' : 'Reading added successfully',
        });
        resetForm();
        fetchReadings();
        onDataChange?.();
      } else {
        const error = await response.json();
        toast({
          title: 'Error',
          description: error.error || 'Failed to save reading',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error saving reading:', error);
      toast({
        title: 'Error',
        description: 'Failed to save reading',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (reading: ReadingItem) => {
    setForm({
      title: reading.title,
      author: reading.author,
      type: reading.type,
      imageUrl: reading.imageUrl || '',
      impactOnThinking: reading.impactOnThinking,
      notes: reading.notes || '',
      platform: reading.platform || '',
      duration: reading.duration || '',
      completionDate: reading.completionDate || '',
    });
    setEditingId(reading.id);
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this reading?')) return;

    try {
      const response = await fetch(`/api/readings/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast({
          title: 'Success',
          description: 'Reading deleted successfully',
        });
        fetchReadings();
        onDataChange?.();
      } else {
        toast({
          title: 'Error',
          description: 'Failed to delete reading',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error deleting reading:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete reading',
        variant: 'destructive',
      });
    }
  };

  const sorted = [...readings].sort((a, b) => a.order - b.order);

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-display text-lg font-medium">Readings & Courses</h3>
          <p className="text-sm text-muted-foreground">
            Books and courses with detailed notes
          </p>
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={() => setIsDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-1" /> Add
          </Button>
        </div>
      </div>

      {/* Dialog for Add/Edit */}
      <Dialog open={isDialogOpen} onOpenChange={(open) => { if (!open) resetForm(); else setIsDialogOpen(true); }}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingId ? 'Edit Reading' : 'Add New Reading'}</DialogTitle>
            <DialogDescription>
              Add a book or course with your notes and learnings
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Type Selection */}
            <div className="space-y-2">
              <Label>Type *</Label>
              <Select
                value={form.type}
                onValueChange={(value: ReadingType) => setForm({ ...form, type: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="book">
                    <div className="flex items-center gap-2">
                      <BookOpen className="h-4 w-4" />
                      <span>Book</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="course">
                    <div className="flex items-center gap-2">
                      <GraduationCap className="h-4 w-4" />
                      <span>Course</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Basic Info */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="e.g., Deep Work"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="author">Author *</Label>
                <Input
                  id="author"
                  value={form.author}
                  onChange={(e) => setForm({ ...form, author: e.target.value })}
                  placeholder="e.g., Cal Newport"
                  required
                />
              </div>
            </div>

            {/* Course-specific fields */}
            {form.type === 'course' && (
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="platform">Platform</Label>
                  <Input
                    id="platform"
                    value={form.platform}
                    onChange={(e) => setForm({ ...form, platform: e.target.value })}
                    placeholder="e.g., Coursera, Udemy"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="duration">Duration</Label>
                  <Input
                    id="duration"
                    value={form.duration}
                    onChange={(e) => setForm({ ...form, duration: e.target.value })}
                    placeholder="e.g., 8 weeks, 40 hours"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="completionDate">Completion Date</Label>
                  <Input
                    id="completionDate"
                    type="date"
                    value={form.completionDate}
                    onChange={(e) => setForm({ ...form, completionDate: e.target.value })}
                  />
                </div>
              </div>
            )}

            {/* Cover Image Upload */}
            <div className="space-y-2">
              <Label>Cover Image (Optional)</Label>
              <Tabs defaultValue="url" className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-4">
                  <TabsTrigger value="url">External URL</TabsTrigger>
                  <TabsTrigger value="preview">Preview</TabsTrigger>
                </TabsList>
                <TabsContent value="url" className="space-y-3">
                  <div className="flex gap-2">
                    <Input
                      placeholder="Paste image URL (e.g., from Amazon, Goodreads)"
                      value={externalImageUrl}
                      onChange={(e) => setExternalImageUrl(e.target.value)}
                    />
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={handleImageUpload}
                      disabled={uploadingImage || !externalImageUrl.trim()}
                    >
                      {uploadingImage ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <>
                          <ImageIcon className="h-4 w-4 mr-1" />
                          Upload to CDN
                        </>
                      )}
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    The image will be downloaded and stored on our CDN for better performance
                  </p>
                  {form.imageUrl && (
                    <div className="flex items-center gap-2 text-sm text-green-600">
                      <ExternalLink className="h-4 w-4" />
                      <span>Image uploaded: </span>
                      <a href={form.imageUrl} target="_blank" rel="noopener noreferrer" className="underline truncate max-w-xs">
                        {form.imageUrl}
                      </a>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setForm({ ...form, imageUrl: '' })}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  )}
                </TabsContent>
                <TabsContent value="preview">
                  {form.imageUrl ? (
                    <div className="flex justify-center">
                      <img
                        src={form.imageUrl}
                        alt="Cover preview"
                        className="max-h-48 rounded-lg shadow-md"
                      />
                    </div>
                  ) : (
                    <div className="h-48 border-2 border-dashed rounded-lg flex items-center justify-center text-muted-foreground">
                      <div className="text-center">
                        <ImageIcon className="h-8 w-8 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">No image uploaded</p>
                      </div>
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </div>

            {/* Impact on Thinking */}
            <div className="space-y-2">
              <Label htmlFor="impact">How it changed my life *</Label>
              <Textarea
                id="impact"
                value={form.impactOnThinking}
                onChange={(e) => setForm({ ...form, impactOnThinking: e.target.value })}
                rows={3}
                placeholder="Describe the key impact this had on your thinking or practice..."
                required
              />
              <p className="text-xs text-muted-foreground">
                This will be shown on the card. Keep it concise but meaningful.
              </p>
            </div>

            {/* Rich Text Notes */}
            <div className="space-y-2">
              <Label>Detailed Notes</Label>
              <p className="text-xs text-muted-foreground mb-2">
                Write your comprehensive notes, learnings, and key takeaways. This will be displayed on the detail page.
              </p>
              <SimpleRichEditor
                value={form.notes}
                onChange={(html) => setForm({ ...form, notes: html })}
                placeholder="Start writing your detailed notes here..."
                minHeight="400px"
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={resetForm}>
                Cancel
              </Button>
              <Button type="submit" disabled={saving}>
                {saving ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : editingId ? (
                  'Update Reading'
                ) : (
                  'Add Reading'
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* List of readings */}
      {loading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : readings.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center">
            <BookOpen className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
            <p className="text-muted-foreground">No readings added yet</p>
            <p className="text-sm text-muted-foreground">Click "Add" to add your first book or course</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {sorted.map((reading) => (
            <Card key={reading.id} className="hover:bg-muted/50 transition-colors">
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  {/* Thumbnail */}
                  {reading.imageUrl && (
                    <img
                      src={reading.imageUrl}
                      alt={reading.title}
                      className="w-12 h-16 object-cover rounded shadow-sm flex-shrink-0"
                    />
                  )}
                  
                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant={reading.type === 'book' ? 'default' : 'secondary'} className="text-xs">
                        {reading.type === 'book' ? (
                          <><BookOpen className="h-3 w-3 mr-1" /> Book</>
                        ) : (
                          <><GraduationCap className="h-3 w-3 mr-1" /> Course</>
                        )}
                      </Badge>
                      {reading.notes && (
                        <Badge variant="outline" className="text-xs">Has Notes</Badge>
                      )}
                    </div>
                    <p className="font-medium italic truncate">{reading.title}</p>
                    <p className="text-sm text-muted-foreground">
                      by {reading.author}
                      {reading.type === 'course' && reading.platform && ` • ${reading.platform}`}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-1 flex-shrink-0">
                    <Button size="sm" variant="ghost" onClick={() => handleEdit(reading)}>
                      Edit
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => handleDelete(reading.id)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
