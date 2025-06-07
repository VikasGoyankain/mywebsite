"use client"

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table'
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog'
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu'
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from '@/components/ui/tabs'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { 
  ArrowLeft, 
  Mail, 
  Phone, 
  MoreVertical, 
  Trash2, 
  Search, 
  Download, 
  X, 
  Check, 
  AlertCircle,
  Send,
  MessageSquare,
  Loader2,
  Users
} from 'lucide-react'
import Link from 'next/link'
import { useToast } from '@/hooks/use-toast'

// Subscriber type definition
type Subscriber = {
  id: string
  fullName: string
  phoneNumber?: string
  email?: string
  dateJoined: string
  lastUpdated?: string
}

export default function AdminSubscribers() {
  const { toast } = useToast()
  const [subscribers, setSubscribers] = useState<Subscriber[]>([])
  const [filteredSubscribers, setFilteredSubscribers] = useState<Subscriber[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [subscriberToDelete, setSubscriberToDelete] = useState<Subscriber | null>(null)
  const [storageType, setStorageType] = useState<string>('unknown')
  
  // Message sending state
  const [isMessageDialogOpen, setIsMessageDialogOpen] = useState(false)
  const [messageSubject, setMessageSubject] = useState('')
  const [messageContent, setMessageContent] = useState('')
  const [messageType, setMessageType] = useState<'all' | 'sms' | 'email'>('all')
  const [isSendingMessage, setIsSendingMessage] = useState(false)
  
  // Fetch subscribers on component mount
  useEffect(() => {
    fetchSubscribers()
  }, [])
  
  // Filter subscribers when search query changes
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredSubscribers(subscribers)
      return
    }
    
    const query = searchQuery.toLowerCase().trim()
    const filtered = subscribers.filter(subscriber => 
      subscriber.fullName.toLowerCase().includes(query) || 
      subscriber.email?.toLowerCase().includes(query) || 
      subscriber.phoneNumber?.includes(query)
    )
    
    setFilteredSubscribers(filtered)
  }, [searchQuery, subscribers])
  
  const fetchSubscribers = async () => {
    setLoading(true)
    try {
      // Get the API key from local storage, environment variable, or hardcoded for production
      // This isn't ideal for security, but it's a temporary fix
      const apiKey = process.env.NEXT_PUBLIC_ADMIN_API_KEY || 'admin-secret-key-12345'
      
      console.log('Fetching subscribers with API key available:', !!apiKey)
      
      const response = await fetch(`/api/subscribers?apiKey=${apiKey}`)
      if (!response.ok) {
        throw new Error(`Failed to fetch subscribers: ${response.status} ${response.statusText}`)
      }
      
      const data = await response.json()
      
      // Convert the object of subscribers to an array
      const subscribersArray = Object.values(data.subscribers) as Subscriber[]
      
      // Sort by date joined (newest first)
      subscribersArray.sort((a, b) => 
        new Date(b.dateJoined).getTime() - new Date(a.dateJoined).getTime()
      )
      
      setSubscribers(subscribersArray)
      setFilteredSubscribers(subscribersArray)
      setStorageType(data.storageType || 'unknown')
    } catch (err: any) {
      setError(err.message || 'Failed to load subscribers')
      console.error('Error fetching subscribers:', err)
    } finally {
      setLoading(false)
    }
  }
  
  const confirmDelete = (subscriber: Subscriber) => {
    setSubscriberToDelete(subscriber)
    setIsDeleteDialogOpen(true)
  }
  
  const handleDelete = async () => {
    if (!subscriberToDelete) return
    
    try {
      // Get the API key from local storage, environment variable, or hardcoded for production
      const apiKey = process.env.NEXT_PUBLIC_ADMIN_API_KEY || 'admin-secret-key-12345'
      
      // Determine which parameter to use for deletion
      let url = `/api/subscribers?apiKey=${apiKey}&id=${subscriberToDelete.id}`
      
      const response = await fetch(url, {
        method: 'DELETE',
      })
      
      if (!response.ok) {
        throw new Error('Failed to delete subscriber')
      }
      
      // Remove the deleted subscriber from the state
      setSubscribers(prev => prev.filter(s => s.id !== subscriberToDelete.id))
      setFilteredSubscribers(prev => prev.filter(s => s.id !== subscriberToDelete.id))
      
      toast({
        title: "Subscriber deleted",
        description: `${subscriberToDelete.fullName} has been removed from your subscribers list.`,
        variant: "default"
      })
      
      // Close dialog
      setIsDeleteDialogOpen(false)
      setSubscriberToDelete(null)
    } catch (err: any) {
      console.error('Error deleting subscriber:', err)
      toast({
        title: "Deletion failed",
        description: err.message || "Failed to delete subscriber. Please try again.",
        variant: "destructive"
      })
    }
  }
  
  const exportSubscribers = () => {
    try {
      // Create CSV content
      let csvContent = "Full Name,Email,Phone Number,Date Joined\n"
      
      subscribers.forEach(sub => {
        const row = [
          `"${sub.fullName.replace(/"/g, '""')}"`,
          sub.email ? `"${sub.email}"` : "",
          sub.phoneNumber || "",
          new Date(sub.dateJoined).toLocaleDateString()
        ]
        csvContent += row.join(",") + "\n"
      })
      
      // Create a blob and download link
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      
      link.setAttribute('href', url)
      link.setAttribute('download', `subscribers_${new Date().toISOString().split('T')[0]}.csv`)
      link.style.visibility = 'hidden'
      
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      
      toast({
        title: "Export successful",
        description: `${subscribers.length} subscribers exported to CSV.`,
        variant: "default"
      })
    } catch (err: any) {
      console.error('Error exporting subscribers:', err)
      toast({
        title: "Export failed",
        description: err.message || "Failed to export subscribers.",
        variant: "destructive"
      })
    }
  }
  
  const handleSendMessage = async () => {
    if (!messageContent.trim()) {
      toast({
        title: "Message required",
        description: "Please enter a message to send.",
        variant: "destructive"
      })
      return
    }
    
    setIsSendingMessage(true)
    
    try {
      // Get the API key from local storage, environment variable, or hardcoded for production
      const apiKey = process.env.NEXT_PUBLIC_ADMIN_API_KEY || 'admin-secret-key-12345'
      
      const response = await fetch('/api/send-message', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          apiKey,
          message: messageContent,
          subject: messageSubject,
          messageType
        }),
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to send message')
      }
      
      // Success message
      toast({
        title: "Message sent successfully",
        description: `SMS: ${data.smsSentCount || 0}, Email: ${data.emailSentCount || 0}`,
        variant: "default"
      })
      
      // Reset form and close dialog
      setMessageContent('')
      setMessageSubject('')
      setIsMessageDialogOpen(false)
    } catch (err: any) {
      console.error('Error sending message:', err)
      toast({
        title: "Failed to send message",
        description: err.message || "An error occurred while sending the message.",
        variant: "destructive"
      })
    } finally {
      setIsSendingMessage(false)
    }
  }
  
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }
  
  // Count subscribers with email and phone
  const subscriberCounts = {
    total: subscribers.length,
    email: subscribers.filter(s => s.email).length,
    phone: subscribers.filter(s => s.phoneNumber).length,
    both: subscribers.filter(s => s.email && s.phoneNumber).length,
  }
  
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
        <div>
          <Link href="/admin" className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-2">
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back to Dashboard
          </Link>
          <h1 className="text-3xl font-bold">Subscribers</h1>
          <p className="text-gray-600">Manage your newsletter subscribers</p>
        </div>
        
        <div className="flex flex-wrap gap-3">
          <Dialog open={isMessageDialogOpen} onOpenChange={setIsMessageDialogOpen}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4" />
                Send Message
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[525px]">
              <DialogHeader>
                <DialogTitle>Send Message to Subscribers</DialogTitle>
                <DialogDescription>
                  Send a message to all your subscribers via SMS, email, or both.
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="messageType">Message Type</Label>
                  <Select 
                    value={messageType} 
                    onValueChange={(value) => setMessageType(value as 'all' | 'sms' | 'email')}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select message type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Both SMS & Email ({subscriberCounts.total})</SelectItem>
                      <SelectItem value="sms">SMS Only ({subscriberCounts.phone})</SelectItem>
                      <SelectItem value="email">Email Only ({subscriberCounts.email})</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                {(messageType === 'email' || messageType === 'all') && (
                  <div className="space-y-2">
                    <Label htmlFor="subject">Email Subject</Label>
                    <Input
                      id="subject"
                      placeholder="Enter email subject"
                      value={messageSubject}
                      onChange={(e) => setMessageSubject(e.target.value)}
                    />
                  </div>
                )}
                
                <div className="space-y-2">
                  <Label htmlFor="message">Message Content</Label>
                  <Textarea
                    id="message"
                    placeholder="Enter your message here"
                    value={messageContent}
                    onChange={(e) => setMessageContent(e.target.value)}
                    rows={6}
                    className="resize-none"
                  />
                </div>
                
                <div className="bg-blue-50 p-3 rounded-md text-sm text-gray-600">
                  <p className="flex items-center gap-1">
                    <AlertCircle className="h-4 w-4 text-blue-500" />
                    <span>
                      {messageType === 'all' && `Message will be sent to ${subscriberCounts.total} subscribers.`}
                      {messageType === 'sms' && `Message will be sent to ${subscriberCounts.phone} subscribers with phone numbers.`}
                      {messageType === 'email' && `Message will be sent to ${subscriberCounts.email} subscribers with email addresses.`}
                    </span>
                  </p>
                </div>
              </div>
              
              <DialogFooter>
                <Button 
                  variant="outline" 
                  onClick={() => setIsMessageDialogOpen(false)}
                  disabled={isSendingMessage}
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleSendMessage}
                  disabled={isSendingMessage || !messageContent.trim()}
                  className="gap-2"
                >
                  {isSendingMessage ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4" />
                      Send Message
                    </>
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          
          <Button 
            onClick={exportSubscribers} 
            variant="outline"
            className="flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Export CSV
          </Button>
        </div>
      </div>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm font-medium text-gray-500">Total Subscribers</p>
                <p className="text-3xl font-bold">{subscriberCounts.total}</p>
              </div>
              <div className="bg-blue-100 p-3 rounded-full">
                <Users className="h-6 w-6 text-blue-700" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm font-medium text-gray-500">Email Subscribers</p>
                <p className="text-3xl font-bold">{subscriberCounts.email}</p>
              </div>
              <div className="bg-green-100 p-3 rounded-full">
                <Mail className="h-6 w-6 text-green-700" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm font-medium text-gray-500">SMS Subscribers</p>
                <p className="text-3xl font-bold">{subscriberCounts.phone}</p>
              </div>
              <div className="bg-purple-100 p-3 rounded-full">
                <Phone className="h-6 w-6 text-purple-700" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm font-medium text-gray-500">Both Channels</p>
                <p className="text-3xl font-bold">{subscriberCounts.both}</p>
              </div>
              <div className="bg-amber-100 p-3 rounded-full">
                <MessageSquare className="h-6 w-6 text-amber-700" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Card className="mb-8">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="relative w-full sm:w-auto sm:min-w-[300px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search subscribers..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
            
            <div className="text-sm text-gray-500 flex items-center gap-1">
              <span className="font-medium">{filteredSubscribers.length}</span> 
              {filteredSubscribers.length === 1 ? 'subscriber' : 'subscribers'} 
              {searchQuery && `(filtered from ${subscribers.length})`}
            </div>
          </div>
        </CardContent>
      </Card>
      
      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-gray-300 border-t-gray-900"></div>
          <p className="text-gray-500 text-lg mt-4">Loading subscribers...</p>
        </div>
      ) : error ? (
        <div className="text-center py-12">
          <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-md">
            <p className="text-red-700 text-lg flex items-center gap-2">
              <AlertCircle className="w-5 h-5" />
              {error}
            </p>
            <button 
              onClick={fetchSubscribers} 
              className="mt-4 px-4 py-2 bg-red-100 text-red-700 rounded-md hover:bg-red-200 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[250px]">Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead>Last Updated</TableHead>
                <TableHead className="w-[80px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredSubscribers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-32 text-center">
                    {searchQuery ? (
                      <div>
                        <p className="text-gray-500">No subscribers match your search</p>
                        <Button 
                          variant="link" 
                          onClick={() => setSearchQuery('')}
                          className="mt-2"
                        >
                          Clear search
                        </Button>
                      </div>
                    ) : (
                      <p className="text-gray-500">No subscribers found</p>
                    )}
                  </TableCell>
                </TableRow>
              ) : (
                filteredSubscribers.map((subscriber) => (
                  <TableRow key={subscriber.id}>
                    <TableCell className="font-medium">{subscriber.fullName}</TableCell>
                    <TableCell>
                      {subscriber.email ? (
                        <div className="flex items-center gap-1">
                          <Mail className="w-4 h-4 text-gray-500" />
                          <span>{subscriber.email}</span>
                        </div>
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {subscriber.phoneNumber ? (
                        <div className="flex items-center gap-1">
                          <Phone className="w-4 h-4 text-gray-500" />
                          <span>{subscriber.phoneNumber}</span>
                        </div>
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </TableCell>
                    <TableCell>{formatDate(subscriber.dateJoined)}</TableCell>
                    <TableCell>
                      {subscriber.lastUpdated ? (
                        <div className="flex items-center gap-1 text-amber-600">
                          <span title={`Originally joined: ${formatDate(subscriber.dateJoined)}`}>
                            {formatDate(subscriber.lastUpdated)}
                          </span>
                        </div>
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem 
                            onClick={() => confirmDelete(subscriber)}
                            className="text-red-600 focus:text-red-600 cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      )}
      
      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this subscriber? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          
          {subscriberToDelete && (
            <div className="bg-gray-50 p-4 rounded-md my-4">
              <p className="font-medium">{subscriberToDelete.fullName}</p>
              <div className="text-sm text-gray-600 mt-1">
                {subscriberToDelete.email && (
                  <div className="flex items-center gap-1">
                    <Mail className="w-4 h-4" />
                    {subscriberToDelete.email}
                  </div>
                )}
                {subscriberToDelete.phoneNumber && (
                  <div className="flex items-center gap-1">
                    <Phone className="w-4 h-4" />
                    {subscriberToDelete.phoneNumber}
                  </div>
                )}
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsDeleteDialogOpen(false)}
              className="gap-2"
            >
              <X className="w-4 h-4" />
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleDelete}
              className="gap-2"
            >
              <Trash2 className="w-4 h-4" />
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
} 