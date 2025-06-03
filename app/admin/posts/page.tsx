"use client"

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Post } from '@/lib/types/Post'
import { PlusCircle, Pencil, Trash2, ArrowLeft, Image, FileText, Video } from 'lucide-react'
import Link from 'next/link'

export default function AdminPosts() {
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [currentPost, setCurrentPost] = useState<Post | null>(null)
  const [formData, setFormData] = useState<Partial<Post>>({
    type: 'text',
    title: '',
    content: '',
    author: 'You',
    tags: [],
    comments: [],
  })
  const [newTag, setNewTag] = useState('')

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

  const removeTag = (tagToRemove: string) => {
    const updatedTags = formData.tags?.filter(tag => tag !== tagToRemove) || []
    handleChange('tags', updatedTags)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const method = currentPost ? 'PUT' : 'POST'
      const url = currentPost ? `/api/posts?id=${currentPost.id}` : '/api/posts'
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          timestamp: new Date(),
        }),
      })
      
      if (!response.ok) {
        throw new Error(`Failed to ${currentPost ? 'update' : 'create'} post`)
      }
      
      // Refresh posts list
      await fetchPosts()
      
      // Reset form and close dialog
      resetForm()
      setIsDialogOpen(false)
    } catch (err: any) {
      console.error('Error saving post:', err)
      alert(err.message || `Failed to ${currentPost ? 'update' : 'create'} post`)
    }
  }

  const handleDelete = async () => {
    if (!currentPost) return
    
    try {
      const response = await fetch(`/api/posts?id=${currentPost.id}`, {
        method: 'DELETE',
      })
      
      if (!response.ok) {
        throw new Error('Failed to delete post')
      }
      
      // Refresh posts list
      await fetchPosts()
      
      // Close dialog
      setIsDeleteDialogOpen(false)
      setCurrentPost(null)
    } catch (err: any) {
      console.error('Error deleting post:', err)
      alert(err.message || 'Failed to delete post')
    }
  }

  const editPost = (post: Post) => {
    setCurrentPost(post)
    setFormData({
      type: post.type,
      title: post.title || '',
      content: post.content,
      author: post.author,
      tags: [...post.tags],
      imageUrl: post.imageUrl,
      videoUrl: post.videoUrl,
    })
    setIsDialogOpen(true)
  }

  const confirmDelete = (post: Post) => {
    setCurrentPost(post)
    setIsDeleteDialogOpen(true)
  }

  const resetForm = () => {
    setCurrentPost(null)
    setFormData({
      type: 'text',
      title: '',
      content: '',
      author: 'You',
      tags: [],
      comments: [],
    })
  }

  const formatDate = (dateString: Date) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex items-center justify-between mb-8">
        <div>
          <Link href="/admin" className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-2">
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back to Dashboard
          </Link>
          <h1 className="text-3xl font-bold">Manage Posts</h1>
          <p className="text-gray-600">Create, edit, and delete your professional insights</p>
        </div>
        <Button onClick={() => { resetForm(); setIsDialogOpen(true); }} className="bg-gray-900 hover:bg-gray-800">
          <PlusCircle className="w-4 h-4 mr-2" />
          New Post
        </Button>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <p className="text-gray-500">Loading posts...</p>
        </div>
      ) : error ? (
        <div className="text-center py-12">
          <p className="text-red-500">{error}</p>
          <Button onClick={fetchPosts} variant="outline" className="mt-4">
            Try Again
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          <Tabs defaultValue="all">
            <TabsList className="mb-6">
              <TabsTrigger value="all">All Posts</TabsTrigger>
              <TabsTrigger value="text">Articles</TabsTrigger>
              <TabsTrigger value="image">Images</TabsTrigger>
              <TabsTrigger value="video">Videos</TabsTrigger>
            </TabsList>
            
            <TabsContent value="all" className="space-y-6">
              {renderPostsList(posts)}
            </TabsContent>
            
            <TabsContent value="text" className="space-y-6">
              {renderPostsList(posts.filter(post => post.type === 'text'))}
            </TabsContent>
            
            <TabsContent value="image" className="space-y-6">
              {renderPostsList(posts.filter(post => post.type === 'image'))}
            </TabsContent>
            
            <TabsContent value="video" className="space-y-6">
              {renderPostsList(posts.filter(post => post.type === 'video'))}
            </TabsContent>
          </Tabs>
        </div>
      )}

      {/* Create/Edit Post Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{currentPost ? 'Edit Post' : 'Create New Post'}</DialogTitle>
            <DialogDescription>
              {currentPost ? 'Update your existing post' : 'Share your professional insights with your audience'}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="type">Post Type</Label>
                <Select 
                  value={formData.type} 
                  onValueChange={(value) => handleChange('type', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select post type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="text">Article</SelectItem>
                    <SelectItem value="image">Image</SelectItem>
                    <SelectItem value="video">Video</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="title">Title (Optional)</Label>
                <Input
                  id="title"
                  value={formData.title || ''}
                  onChange={(e) => handleChange('title', e.target.value)}
                  placeholder="Post title"
                />
              </div>

              <div>
                <Label htmlFor="content">Content</Label>
                <Textarea
                  id="content"
                  value={formData.content || ''}
                  onChange={(e) => handleChange('content', e.target.value)}
                  placeholder="Write your post content here"
                  rows={5}
                  required
                />
              </div>

              {formData.type === 'image' && (
                <div>
                  <Label htmlFor="imageUrl">Image URL</Label>
                  <Input
                    id="imageUrl"
                    value={formData.imageUrl || ''}
                    onChange={(e) => handleChange('imageUrl', e.target.value)}
                    placeholder="https://example.com/image.jpg"
                  />
                </div>
              )}

              {formData.type === 'video' && (
                <div>
                  <Label htmlFor="videoUrl">Video URL</Label>
                  <Input
                    id="videoUrl"
                    value={formData.videoUrl || ''}
                    onChange={(e) => handleChange('videoUrl', e.target.value)}
                    placeholder="https://example.com/video.mp4"
                  />
                </div>
              )}

              <div>
                <Label htmlFor="tags">Tags</Label>
                <div className="flex space-x-2">
                  <Input
                    id="newTag"
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    placeholder="Add a tag"
                    className="flex-1"
                  />
                  <Button 
                    type="button" 
                    onClick={addTag} 
                    variant="outline"
                    disabled={!newTag.trim()}
                  >
                    Add
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {formData.tags?.map((tag) => (
                    <div key={tag} className="flex items-center bg-gray-100 rounded-full px-3 py-1">
                      <span className="text-sm text-gray-700">{tag}</span>
                      <button
                        type="button"
                        onClick={() => removeTag(tag)}
                        className="ml-2 text-gray-500 hover:text-gray-700"
                      >
                        &times;
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">
                {currentPost ? 'Update Post' : 'Create Post'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this post? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )

  function renderPostsList(postsToRender: Post[]) {
    if (postsToRender.length === 0) {
      return (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-500">No posts found</p>
        </div>
      )
    }

    return postsToRender.map((post) => (
      <Card key={post.id} className="overflow-hidden">
        <CardContent className="p-0">
          <div className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-2 mb-2">
                {post.type === 'text' && <FileText className="w-4 h-4 text-blue-500" />}
                {post.type === 'image' && <Image className="w-4 h-4 text-green-500" />}
                {post.type === 'video' && <Video className="w-4 h-4 text-red-500" />}
                <span className="text-sm font-medium text-gray-500 capitalize">{post.type}</span>
              </div>
              <div className="flex space-x-2">
                <Button size="sm" variant="ghost" onClick={() => editPost(post)}>
                  <Pencil className="w-4 h-4" />
                </Button>
                <Button size="sm" variant="ghost" onClick={() => confirmDelete(post)}>
                  <Trash2 className="w-4 h-4 text-red-500" />
                </Button>
              </div>
            </div>
            
            {post.title && (
              <h3 className="text-xl font-semibold mb-2">{post.title}</h3>
            )}
            
            <p className="text-gray-600 mb-4">{post.content}</p>
            
            <div className="flex flex-wrap gap-2 mb-4">
              {post.tags.map((tag) => (
                <span key={tag} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                  {tag}
                </span>
              ))}
            </div>
            
            <div className="flex justify-between items-center text-sm text-gray-500">
              <span>By {post.author}</span>
              <span>{formatDate(post.timestamp)}</span>
            </div>
            
            <div className="mt-4 text-sm text-gray-500">
              {post.comments.length} comment{post.comments.length !== 1 ? 's' : ''}
            </div>
          </div>
        </CardContent>
      </Card>
    ))
  }
}