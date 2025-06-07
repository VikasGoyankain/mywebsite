"use client"

import { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Post, Media } from '@/lib/types/Post'
import { 
  PlusCircle, 
  Pencil, 
  Trash2, 
  ArrowLeft, 
  Image as ImageIcon, 
  Video, 
  X, 
  Upload, 
  Link as LinkIcon,
  Tag,
  FileText,
  Save,
  CalendarIcon,
  LayoutGrid,
  ImagePlus
} from 'lucide-react'
import Link from 'next/link'
import { v4 as uuidv4 } from 'uuid'
import { useProfileStore } from '@/lib/profile-store'
import { useToast } from '@/hooks/use-toast'
import { uploadToImageKit, uploadUrlToImageKit } from '@/lib/imagekit'

// Create a function to convert file to base64
const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });
};

export default function AdminPosts() {
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [currentPost, setCurrentPost] = useState<Post | null>(null)
  const [activeTab, setActiveTab] = useState('content')
  const [isSaving, setIsSaving] = useState(false)
  const { profileData } = useProfileStore()
  const { toast } = useToast()
  const [formData, setFormData] = useState<Partial<Post>>({
    title: '',
    content: '',
    author: profileData.name,
    tags: [],
    media: [],
  })
  const [newTag, setNewTag] = useState('')
  const [dropzoneActive, setDropzoneActive] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Fetch posts on component mount
  useEffect(() => {
    fetchPosts()
  }, [])

  const fetchPosts = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/posts')
      if (!response.ok) {
        throw new Error('Failed to fetch posts')
      }
      const data = await response.json()
      setPosts(data)
    } catch (err: any) {
      setError(err.message || 'Failed to load posts')
      console.error('Error fetching posts:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (field: string, value: any) => {
    setFormData({ ...formData, [field]: value })
  }

  const addTag = () => {
    if (newTag.trim() && !formData.tags?.includes(newTag.trim())) {
      const updatedTags = [...(formData.tags || []), newTag.trim()]
      handleChange('tags', updatedTags)
      setNewTag('')
    }
  }

  const handleTagKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTag();
    }
  }

  const removeTag = (tagToRemove: string) => {
    const updatedTags = formData.tags?.filter(tag => tag !== tagToRemove) || []
    handleChange('tags', updatedTags)
  }

  const handleFileUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    
    const newMediaItems: Media[] = [];
    setIsSaving(true);
    
    try {
      // Convert each file to base64 and create media items
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        try {
          const base64Data = await fileToBase64(file);
          
          // Upload to ImageKit
          const imageUrl = await uploadToImageKit(
            base64Data, 
            file.name, 
            "posts"
          );
          
          newMediaItems.push({
            id: uuidv4(),
            type: file.type.startsWith('image/') ? 'image' : 'video',
            url: imageUrl,
            caption: file.name
          });
        } catch (err) {
          console.error('Error processing file:', err);
          toast({
            title: "Upload Failed",
            description: `Failed to process ${file.name}`,
            variant: "destructive"
          });
        }
      }
      
      if (newMediaItems.length > 0) {
        const updatedMedia = [...(formData.media || []), ...newMediaItems];
        handleChange('media', updatedMedia);
        
        toast({
          title: "Files Added",
          description: `Successfully added ${newMediaItems.length} media items`,
          variant: "default"
        });
      }
    } catch (error) {
      console.error("Error in file upload:", error);
      toast({
        title: "Upload Error",
        description: "There was a problem uploading your files",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDropzoneActive(false);
    
    if (e.dataTransfer.files) {
      await handleFileUpload(e.dataTransfer.files);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDropzoneActive(true);
  };
  
  const handleDragLeave = () => {
    setDropzoneActive(false);
  };

  const removeMedia = (mediaId: string) => {
    const updatedMedia = formData.media?.filter(item => item.id !== mediaId) || []
    handleChange('media', updatedMedia)
  }

  const updateMediaCaption = (mediaId: string, caption: string) => {
    const updatedMedia = formData.media?.map(item => 
      item.id === mediaId ? { ...item, caption } : item
    ) || [];
    
    handleChange('media', updatedMedia);
  };

  const handleAddUrlMedia = async (e: React.MouseEvent) => {
    e.preventDefault();
    
    const urlInput = document.getElementById('mediaUrl') as HTMLInputElement;
    const captionInput = document.getElementById('mediaCaption') as HTMLInputElement;
    const typeSelect = document.querySelector('[name="mediaType"]') as HTMLSelectElement;

    if (!urlInput.value.trim()) return;
    
    const mediaType = typeSelect.value as 'image' | 'video';
    const mediaUrl = urlInput.value.trim();
    const caption = captionInput.value.trim() || undefined;
    
    setIsSaving(true);
    
    try {
      // Upload URL to ImageKit
      const optimizedUrl = await uploadUrlToImageKit(
        mediaUrl,
        `url_media_${Date.now()}`,
        "posts"
      );
      
      const newMedia: Media = {
        id: uuidv4(),
        type: mediaType,
        url: optimizedUrl,
        caption: caption
      };

      const updatedMedia = [...(formData.media || []), newMedia];
      handleChange('media', updatedMedia);

      // Reset the inputs
      urlInput.value = '';
      captionInput.value = '';
      
      toast({
        title: "Media Added",
        description: "URL media has been successfully added",
        variant: "default"
      });
    } catch (error) {
      console.error("Error adding URL media:", error);
      toast({
        title: "Error",
        description: "Failed to add URL media",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.content?.trim()) {
      toast({
        title: "Content Required",
        description: "Please add some content to your post",
        variant: "destructive"
      });
      return;
    }
    
    setIsSaving(true);
    
    try {
      const method = currentPost ? 'PUT' : 'POST';
      const url = currentPost ? `/api/posts?id=${currentPost.id}` : '/api/posts';
      
      // Ensure author is set to the profile name
      const postData = {
        ...formData,
        author: profileData.name,
        timestamp: new Date()
      };
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(postData),
      });
      
      if (!response.ok) {
        throw new Error(`Failed to ${currentPost ? 'update' : 'create'} post`);
      }
      
      // Refresh posts list
      await fetchPosts();
      
      toast({
        title: currentPost ? "Post Updated" : "Post Created",
        description: currentPost 
          ? "Your post has been successfully updated"
          : "Your post has been successfully created",
        variant: "default"
      });
      
      // Reset form and close dialog
      resetForm();
      setIsDialogOpen(false);
    } catch (err: any) {
      console.error('Error saving post:', err);
      toast({
        title: "Error",
        description: err.message || `Failed to ${currentPost ? 'update' : 'create'} post`,
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  }

  const handleDelete = async () => {
    if (!currentPost) return;
    
    try {
      const response = await fetch(`/api/posts?id=${currentPost.id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete post');
      }
      
      toast({
        title: "Post Deleted",
        description: "Your post has been permanently deleted",
        variant: "default"
      });
      
      // Refresh posts list
      await fetchPosts();
      
      // Close dialog
      setIsDeleteDialogOpen(false);
      setCurrentPost(null);
    } catch (err: any) {
      console.error('Error deleting post:', err);
      toast({
        title: "Error",
        description: err.message || 'Failed to delete post',
        variant: "destructive"
      });
    }
  }

  const editPost = (post: Post) => {
    setCurrentPost(post);
    setFormData({
      title: post.title || '',
      content: post.content,
      author: post.author,
      tags: [...post.tags],
      media: [...post.media],
    });
    setActiveTab('content');
    setIsDialogOpen(true);
  }

  const confirmDelete = (post: Post) => {
    setCurrentPost(post);
    setIsDeleteDialogOpen(true);
  }

  const resetForm = () => {
    setCurrentPost(null);
    setFormData({
      title: '',
      content: '',
      author: profileData.name,
      tags: [],
      media: [],
    });
    setActiveTab('content');
  }

  const formatDate = (dateString: Date) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
        <div>
          <Link href="/admin" className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-2">
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back to Dashboard
          </Link>
          <h1 className="text-3xl font-bold">Manage Posts</h1>
          <p className="text-gray-600">Create, edit, and delete your professional insights</p>
        </div>
        <Button 
          onClick={() => { 
            resetForm(); 
            setIsDialogOpen(true); 
          }} 
          className="bg-gray-900 hover:bg-gray-800"
        >
          <PlusCircle className="w-4 h-4 mr-2" />
          New Post
        </Button>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-gray-300 border-t-gray-900"></div>
          <p className="text-gray-500 mt-4">Loading posts...</p>
        </div>
      ) : error ? (
        <div className="text-center py-12">
          <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-md inline-block">
            <p className="text-red-700">{error}</p>
            <Button onClick={fetchPosts} variant="outline" className="mt-4">
              Try Again
            </Button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {renderPostsList(posts)}
        </div>
      )}

      {/* Create/Edit Post Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={(open) => {
        if (!open && !isSaving) setIsDialogOpen(false);
      }}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] p-0">
          <DialogHeader className="p-6 pb-2">
            <DialogTitle className="text-xl">{currentPost ? 'Edit Post' : 'Create New Post'}</DialogTitle>
            <DialogDescription>
              {currentPost ? 'Update your existing post' : 'Share your professional insights with your audience'}
            </DialogDescription>
          </DialogHeader>
          
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <div className="px-6">
              <TabsList className="w-full justify-start mb-2">
                <TabsTrigger value="content" className="flex items-center gap-1">
                  <FileText className="w-4 h-4" />
                  <span>Content</span>
                </TabsTrigger>
                <TabsTrigger value="media" className="flex items-center gap-1">
                  <ImageIcon className="w-4 h-4" />
                  <span>Media</span> 
                  {formData.media && formData.media.length > 0 && (
                    <span className="ml-1 text-xs bg-gray-200 text-gray-800 px-1.5 rounded-full">
                      {formData.media.length}
                    </span>
                  )}
                </TabsTrigger>
                <TabsTrigger value="tags" className="flex items-center gap-1">
                  <Tag className="w-4 h-4" />
                  <span>Tags</span>
                  {formData.tags && formData.tags.length > 0 && (
                    <span className="ml-1 text-xs bg-gray-200 text-gray-800 px-1.5 rounded-full">
                      {formData.tags.length}
                    </span>
                  )}
                </TabsTrigger>
              </TabsList>
            </div>
            
            <ScrollArea className="max-h-[60vh] overflow-y-auto px-6">
              <form id="postForm" onSubmit={handleSubmit} className="space-y-6 py-4">
                <TabsContent value="content" className="space-y-4 mt-0">
                  <div>
                    <Label htmlFor="title" className="text-base">Title (Optional)</Label>
                    <Input
                      id="title"
                      value={formData.title || ''}
                      onChange={(e) => handleChange('title', e.target.value)}
                      placeholder="Add a title for your post"
                      className="mt-1.5"
                    />
                  </div>

                  <div>
                    <Label htmlFor="content" className="text-base">Content</Label>
                    <Textarea
                      id="content"
                      value={formData.content || ''}
                      onChange={(e) => handleChange('content', e.target.value)}
                      placeholder="Write your post content here..."
                      className="mt-1.5 min-h-[200px]"
                      required
                    />
                  </div>
                </TabsContent>

                <TabsContent value="media" className="space-y-6 mt-0">
                  <div
                    className={`border-2 border-dashed rounded-lg transition-colors ${
                      dropzoneActive ? 'border-primary bg-primary/5' : 'border-gray-300 hover:border-gray-400'
                    }`}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                  >
                    <div 
                      className="p-8 text-center cursor-pointer" 
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <div className="mx-auto w-16 h-16 mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                        <ImagePlus className="w-8 h-8 text-gray-500" />
                      </div>
                      <h3 className="text-lg font-medium mb-2">
                        {dropzoneActive ? 'Drop files here' : 'Add Media'}
                      </h3>
                      <p className="text-sm text-gray-600 mb-4">
                        Drag and drop files here or click to browse
                      </p>
                      <Button type="button" variant="outline" size="sm" className="mx-auto" disabled={isSaving}>
                        {isSaving ? (
                          <>
                            <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent mr-2" />
                            <span>Uploading...</span>
                          </>
                        ) : (
                          <>
                            <Upload className="w-4 h-4 mr-2" />
                            <span>Choose Files</span>
                          </>
                        )}
                      </Button>
                      <Input
                        type="file"
                        accept="image/*,video/*"
                        onChange={(e) => handleFileUpload(e.target.files)}
                        ref={fileInputRef}
                        className="hidden"
                        multiple
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <h3 className="text-lg font-medium">Add from URL</h3>
                    </div>
                    
                    <div className="flex flex-col gap-3">
                      <div className="flex flex-col sm:flex-row gap-3">
                        <Select name="mediaType" defaultValue="image">
                          <SelectTrigger className="w-full sm:w-[120px]">
                            <SelectValue placeholder="Type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="image">Image</SelectItem>
                            <SelectItem value="video">Video</SelectItem>
                          </SelectContent>
                        </Select>
                        
                        <Input 
                          id="mediaUrl"
                          name="mediaUrl"
                          placeholder="Enter URL" 
                          className="flex-1"
                        />
                      </div>
                      
                      <Input 
                        id="mediaCaption"
                        name="mediaCaption"
                        placeholder="Caption (optional)" 
                      />
                      
                      <Button 
                        type="button" 
                        variant="secondary" 
                        className="w-full sm:w-auto sm:self-end"
                        onClick={handleAddUrlMedia}
                        disabled={isSaving}
                      >
                        {isSaving ? (
                          <>
                            <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent mr-2" />
                            <span>Uploading...</span>
                          </>
                        ) : (
                          <>
                            <PlusCircle className="w-4 h-4 mr-2" />
                            <span>Add URL</span>
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                  
                  {formData.media && formData.media.length > 0 && (
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium flex items-center gap-2">
                        <LayoutGrid className="w-5 h-5" />
                        Media Gallery
                        <span className="text-sm font-normal text-gray-500">
                          ({formData.media.length} items)
                        </span>
                      </h3>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {formData.media.map((item) => (
                          <Card key={item.id} className="overflow-hidden">
                            <div className="aspect-video relative group">
                              {item.type === 'image' ? (
                                <img 
                                  src={item.url} 
                                  alt={item.caption || 'Image'} 
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                                  <Video className="w-8 h-8 text-gray-400" />
                                </div>
                              )}
                              <div className="absolute top-2 right-2">
                                <Button 
                                  type="button" 
                                  size="sm" 
                                  variant="destructive"
                                  className="opacity-0 group-hover:opacity-100 transition-opacity"
                                  onClick={() => removeMedia(item.id)}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                            <CardFooter className="p-3">
                              <Input
                                value={item.caption || ''}
                                onChange={(e) => updateMediaCaption(item.id, e.target.value)}
                                placeholder="Add caption"
                                className="text-sm"
                              />
                            </CardFooter>
                          </Card>
                        ))}
                      </div>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="tags" className="space-y-4 mt-0">
                  <div>
                    <Label htmlFor="tags" className="text-base mb-1 block">Add Tags</Label>
                    <p className="text-sm text-gray-500 mb-4">
                      Tags help categorize your post and make it easier to find
                    </p>
                    
                    <div className="flex space-x-2">
                      <Input
                        id="newTag"
                        value={newTag}
                        onChange={(e) => setNewTag(e.target.value)}
                        onKeyDown={handleTagKeyDown}
                        placeholder="Add a tag and press Enter"
                        className="flex-1"
                      />
                      <Button 
                        type="button" 
                        onClick={addTag} 
                        variant="secondary"
                        disabled={!newTag.trim()}
                      >
                        Add
                      </Button>
                    </div>
                  </div>
                  
                  {formData.tags && formData.tags.length > 0 ? (
                    <div className="mt-4">
                      <h3 className="text-sm font-medium text-gray-700 mb-2">Current Tags:</h3>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {formData.tags.map((tag) => (
                          <div key={tag} className="group flex items-center bg-gray-100 hover:bg-gray-200 transition-colors rounded-full px-3 py-1.5 text-sm text-gray-800">
                            {tag}
                            <button
                              type="button"
                              onClick={() => removeTag(tag)}
                              className="ml-1.5 text-gray-400 hover:text-red-500 transition-colors"
                              aria-label={`Remove tag ${tag}`}
                            >
                              <X className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="bg-gray-50 border border-gray-100 rounded-lg p-6 text-center">
                      <Tag className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                      <h3 className="text-sm font-medium text-gray-600 mb-1">No Tags Added</h3>
                      <p className="text-xs text-gray-500">Add tags to help categorize your post</p>
                    </div>
                  )}
                </TabsContent>
              </form>
            </ScrollArea>
            
            <div className="p-6 border-t flex justify-between items-center">
              <div className="text-sm text-gray-500 flex items-center">
                <CalendarIcon className="w-4 h-4 mr-1.5" />
                {currentPost ? 'Editing post from ' + formatDate(currentPost.timestamp) : 'Will be posted today'}
              </div>
              <div className="flex gap-3">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => !isSaving && setIsDialogOpen(false)}
                  disabled={isSaving}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit"
                  form="postForm"
                  disabled={isSaving}
                  className="flex items-center gap-1.5"
                >
                  {isSaving ? (
                    <>
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      <span>{currentPost ? 'Update' : 'Publish'}</span>
                    </>
                  )}
                </Button>
              </div>
            </div>
          </Tabs>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto p-6 w-[95%] md:w-auto">
          <DialogHeader className="mb-4">
            <DialogTitle className="text-xl">Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this post? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          
          {currentPost && (
            <div className="bg-gray-50 border border-gray-100 rounded-md p-4 mb-6 mt-2">
              <h3 className="font-medium truncate">{currentPost.title || 'Untitled Post'}</h3>
              <p className="text-sm text-gray-600 truncate mt-1">{currentPost.content}</p>
              <div className="text-xs text-gray-500 mt-2">Posted: {formatDate(currentPost.timestamp)}</div>
            </div>
          )}
          
          <div className="flex flex-col sm:flex-row justify-end gap-3 mt-2">
            <Button variant="outline" className="w-full sm:w-auto" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              className="w-full sm:w-auto flex items-center justify-center gap-1.5"
              onClick={handleDelete}
            >
              <Trash2 className="w-4 h-4" />
              Delete Post
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )

  function renderPostsList(postsToRender: Post[]) {
    if (postsToRender.length === 0) {
      return (
        <div className="col-span-full text-center py-16 bg-gray-50 rounded-lg border border-dashed border-gray-300">
          <div className="mx-auto w-16 h-16 mb-4 bg-gray-100 rounded-full flex items-center justify-center">
            <FileText className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-700 mb-1">No posts yet</h3>
          <p className="text-gray-500 mb-4">Create your first post to share with your audience</p>
          <Button 
            onClick={() => { resetForm(); setIsDialogOpen(true); }}
            size="sm"
          >
            <PlusCircle className="w-4 h-4 mr-1.5" />
            Create Post
          </Button>
        </div>
      )
    }

    return postsToRender.map((post) => (
      <Card key={post.id} className="overflow-hidden hover:shadow-lg transition-shadow">
        {post.media && post.media.length > 0 && post.media[0].type === 'image' && (
          <div className="aspect-video relative overflow-hidden">
            <img 
              src={post.media[0].url} 
              alt={post.media[0].caption || "Post image"} 
              className="w-full h-full object-cover transition-transform hover:scale-105 duration-300"
            />
            {post.media.length > 1 && (
              <div className="absolute top-2 right-2 bg-black/70 text-white text-xs px-1.5 py-0.5 rounded-md">
                +{post.media.length - 1}
              </div>
            )}
          </div>
        )}
        <CardContent className="p-5">
          <div className="flex justify-between items-start mb-2">
            <div>
              {post.title ? (
                <h3 className="text-lg font-semibold line-clamp-1">{post.title}</h3>
              ) : (
                <p className="text-sm text-gray-500 italic">Untitled Post</p>
              )}
              <div className="text-xs text-gray-500 mt-1 flex items-center">
                <CalendarIcon className="w-3.5 h-3.5 mr-1" />
                {formatDate(post.timestamp)}
              </div>
            </div>
            
            <div className="flex space-x-1">
              <Button size="sm" variant="ghost" onClick={() => editPost(post)} className="h-8 w-8 p-0">
                <Pencil className="w-4 h-4" />
                <span className="sr-only">Edit</span>
              </Button>
              <Button 
                size="sm" 
                variant="ghost" 
                onClick={() => confirmDelete(post)}
                className="h-8 w-8 p-0 text-red-500 hover:text-red-600 hover:bg-red-50"
              >
                <Trash2 className="w-4 h-4" />
                <span className="sr-only">Delete</span>
              </Button>
            </div>
          </div>
          
          <p className="text-gray-600 mt-2 line-clamp-2">{post.content}</p>
          
          {post.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-3">
              {post.tags.slice(0, 3).map((tag) => (
                <span key={tag} className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full">
                  {tag}
                </span>
              ))}
              {post.tags.length > 3 && (
                <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full">
                  +{post.tags.length - 3}
                </span>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    ))
  }
}