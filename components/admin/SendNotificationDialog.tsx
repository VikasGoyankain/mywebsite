'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { 
  Bell, 
  Send, 
  Loader2, 
  Check, 
  AlertCircle, 
  Sparkles,
  Eye,
  Users,
  ExternalLink
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Blog } from '@/lib/types/Blog';

interface SendNotificationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  blog?: Blog | null;
  onSuccess?: () => void;
}

// Notification templates
const TEMPLATES = [
  {
    id: 'new-post',
    name: 'New Blog Post',
    icon: '📝',
    titleTemplate: '🆕 New: {title}',
    bodyTemplate: '{summary}',
  },
  {
    id: 'featured',
    name: 'Featured Article',
    icon: '⭐',
    titleTemplate: '⭐ Featured: {title}',
    bodyTemplate: 'Don\'t miss this important read! {summary}',
  },
  {
    id: 'legal-update',
    name: 'Legal Update',
    icon: '⚖️',
    titleTemplate: '⚖️ Legal Update: {title}',
    bodyTemplate: 'Important legal development you should know about.',
  },
  {
    id: 'research',
    name: 'Research Published',
    icon: '🔬',
    titleTemplate: '🔬 Research: {title}',
    bodyTemplate: 'New research findings published. {summary}',
  },
  {
    id: 'custom',
    name: 'Custom',
    icon: '✏️',
    titleTemplate: '',
    bodyTemplate: '',
  },
];

export function SendNotificationDialog({ 
  isOpen, 
  onClose, 
  blog,
  onSuccess 
}: SendNotificationDialogProps) {
  const { toast } = useToast();
  const [selectedTemplate, setSelectedTemplate] = useState(TEMPLATES[0].id);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [subscriberCount, setSubscriberCount] = useState<number | null>(null);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [result, setResult] = useState<{ sent: number; failed: number } | null>(null);

  // Apply template when blog changes or template is selected
  const applyTemplate = (templateId: string) => {
    setSelectedTemplate(templateId);
    const template = TEMPLATES.find(t => t.id === templateId);
    if (template && blog && templateId !== 'custom') {
      setTitle(template.titleTemplate.replace('{title}', blog.title));
      setBody(template.bodyTemplate.replace('{summary}', blog.summary || ''));
    }
  };

  // Fetch push subscriber count when dialog opens
  useEffect(() => {
    if (isOpen) {
      fetchSubscriberCount();
      if (blog && !title) {
        applyTemplate('new-post');
      }
    }
  }, [isOpen, blog]);

  const fetchSubscriberCount = async () => {
    try {
      const response = await fetch('/api/subscribers/push');
      const data = await response.json();
      setSubscriberCount(data.count || 0);
    } catch (error) {
      console.error('Error fetching push subscriber count:', error);
      setSubscriberCount(0);
    }
  };

  const handleSend = async () => {
    if (!title.trim() || !body.trim()) {
      toast({
        title: 'Missing fields',
        description: 'Please provide both title and message body',
        variant: 'destructive',
      });
      return;
    }

    setSending(true);
    try {
      const response = await fetch('/api/notifications/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('admin-token') || 'admin'}`,
        },
        body: JSON.stringify({
          title: title.trim(),
          body: body.trim(),
          url: blog ? `/blog/${blog.slug}` : '/blog',
          icon: '/icons/icon-192x192.png',
          tag: `blog-${blog?.id || Date.now()}`,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send notifications');
      }

      setResult({ sent: data.sent || 0, failed: data.failed || 0 });
      setSent(true);

      toast({
        title: 'Notifications sent!',
        description: `Successfully sent to ${data.sent} subscribers`,
      });

      if (onSuccess) onSuccess();
    } catch (error: any) {
      toast({
        title: 'Failed to send',
        description: error.message || 'Could not send notifications',
        variant: 'destructive',
      });
    } finally {
      setSending(false);
    }
  };

  const handleClose = () => {
    setSent(false);
    setResult(null);
    setTitle('');
    setBody('');
    setSelectedTemplate('new-post');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-blue-500" />
            Send Browser Push Notification
          </DialogTitle>
          <DialogDescription>
            Send push notification to all browser subscribers
          </DialogDescription>
        </DialogHeader>

        {sent ? (
          // Success state
          <div className="py-8 text-center">
            <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-900/30 mx-auto mb-4 flex items-center justify-center">
              <Check className="w-8 h-8 text-emerald-600" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Notifications Sent!</h3>
            <p className="text-muted-foreground mb-4">
              Successfully delivered to <span className="font-semibold text-foreground">{result?.sent}</span> subscribers
              {result?.failed ? ` (${result.failed} failed)` : ''}
            </p>
            <Button onClick={handleClose}>Done</Button>
          </div>
        ) : (
          <>
            {/* Subscriber count badge */}
            {subscriberCount !== null && (
              <div className="flex items-center gap-2 mb-4">
                <Badge variant="secondary" className="gap-1 bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                  <Bell className="w-3 h-3" />
                  {subscriberCount} browser push {subscriberCount === 1 ? 'subscriber' : 'subscribers'}
                </Badge>
                {subscriberCount === 0 && (
                  <span className="text-sm text-amber-600">
                    Users need to enable notifications on your blog
                  </span>
                )}
              </div>
            )}

            {/* Template selector */}
            <div className="space-y-3 mb-6">
              <Label>Choose Template</Label>
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                {TEMPLATES.map((template) => (
                  <button
                    key={template.id}
                    onClick={() => applyTemplate(template.id)}
                    className={`
                      p-3 rounded-lg border-2 text-center transition-all
                      ${selectedTemplate === template.id 
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
                        : 'border-gray-200 dark:border-gray-800 hover:border-gray-300'}
                    `}
                  >
                    <div className="text-2xl mb-1">{template.icon}</div>
                    <div className="text-xs font-medium truncate">{template.name}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Notification preview */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="notification-title">Notification Title</Label>
                <Input
                  id="notification-title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter notification title..."
                  maxLength={100}
                />
                <span className="text-xs text-muted-foreground">{title.length}/100</span>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notification-body">Message Body</Label>
                <Textarea
                  id="notification-body"
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  placeholder="Enter notification message..."
                  rows={3}
                  maxLength={200}
                />
                <span className="text-xs text-muted-foreground">{body.length}/200</span>
              </div>

              {/* Preview card */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Eye className="w-4 h-4" />
                  Preview
                </Label>
                <div className="border rounded-lg p-4 bg-gray-50 dark:bg-gray-900">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center flex-shrink-0">
                      <Bell className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs text-muted-foreground">vikasgoyanka.in</span>
                        <span className="text-xs text-muted-foreground">now</span>
                      </div>
                      <h4 className="font-semibold truncate">
                        {title || 'Notification Title'}
                      </h4>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {body || 'Notification message will appear here...'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <DialogFooter className="mt-6">
              <Button variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              <Button 
                onClick={handleSend} 
                disabled={sending || !title.trim() || !body.trim() || subscriberCount === 0}
                className="gap-2 bg-blue-600 hover:bg-blue-700"
              >
                {sending ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Bell className="w-4 h-4" />
                    Send Push Notification
                  </>
                )}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
