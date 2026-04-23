'use client';

import React, { useRef, useCallback, useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Link,
  Image,
  Undo,
  Redo,
  Code,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface SimpleRichEditorProps {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  className?: string;
  minHeight?: string;
}

interface ToolbarButtonProps {
  icon: React.ReactNode;
  command: string;
  value?: string;
  tooltip: string;
  isActive?: boolean;
  onClick?: () => void;
}

const ToolbarButton = ({ icon, command, value, tooltip, isActive, onClick }: ToolbarButtonProps) => {
  const handleClick = () => {
    if (onClick) {
      onClick();
    } else {
      document.execCommand(command, false, value);
    }
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className={cn(
              'h-8 w-8 p-0',
              isActive && 'bg-muted'
            )}
            onClick={handleClick}
            onMouseDown={(e) => e.preventDefault()}
          >
            {icon}
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>{tooltip}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export function SimpleRichEditor({
  value,
  onChange,
  placeholder = 'Start typing...',
  className,
  minHeight = '300px',
}: SimpleRichEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const [showLinkDialog, setShowLinkDialog] = useState(false);
  const [showImageDialog, setShowImageDialog] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [selection, setSelection] = useState<Range | null>(null);

  // Initialize content
  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = value || '';
    }
  }, []);

  const handleInput = useCallback(() => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  }, [onChange]);

  const saveSelection = () => {
    const sel = window.getSelection();
    if (sel && sel.rangeCount > 0) {
      setSelection(sel.getRangeAt(0).cloneRange());
    }
  };

  const restoreSelection = () => {
    if (selection) {
      const sel = window.getSelection();
      if (sel) {
        sel.removeAllRanges();
        sel.addRange(selection);
      }
    }
  };

  const insertLink = () => {
    if (linkUrl) {
      restoreSelection();
      const sel = window.getSelection();
      if (sel && sel.toString()) {
        document.execCommand('createLink', false, linkUrl);
      } else {
        document.execCommand('insertHTML', false, `<a href="${linkUrl}">${linkUrl}</a>`);
      }
      setLinkUrl('');
      setShowLinkDialog(false);
      handleInput();
    }
  };

  const insertImage = () => {
    if (imageUrl) {
      restoreSelection();
      document.execCommand('insertHTML', false, `<img src="${imageUrl}" style="max-width: 100%; height: auto;" />`);
      setImageUrl('');
      setShowImageDialog(false);
      handleInput();
    }
  };

  const formatBlock = (tag: string) => {
    document.execCommand('formatBlock', false, tag);
    handleInput();
  };

  return (
    <div className={cn('border rounded-lg overflow-hidden', className)}>
      {/* Toolbar */}
      <div className="flex flex-wrap gap-1 p-2 border-b bg-muted/30">
        {/* Undo/Redo */}
        <ToolbarButton icon={<Undo className="h-4 w-4" />} command="undo" tooltip="Undo" />
        <ToolbarButton icon={<Redo className="h-4 w-4" />} command="redo" tooltip="Redo" />
        
        <div className="w-px h-6 bg-border mx-1" />
        
        {/* Text formatting */}
        <ToolbarButton icon={<Bold className="h-4 w-4" />} command="bold" tooltip="Bold (Ctrl+B)" />
        <ToolbarButton icon={<Italic className="h-4 w-4" />} command="italic" tooltip="Italic (Ctrl+I)" />
        <ToolbarButton icon={<Underline className="h-4 w-4" />} command="underline" tooltip="Underline (Ctrl+U)" />
        <ToolbarButton icon={<Strikethrough className="h-4 w-4" />} command="strikeThrough" tooltip="Strikethrough" />
        <ToolbarButton icon={<Code className="h-4 w-4" />} command="insertHTML" value="<code></code>" tooltip="Inline Code" onClick={() => document.execCommand('insertHTML', false, `<code>${window.getSelection()?.toString() || 'code'}</code>`)} />
        
        <div className="w-px h-6 bg-border mx-1" />
        
        {/* Headings */}
        <ToolbarButton 
          icon={<Heading1 className="h-4 w-4" />} 
          command="formatBlock"
          tooltip="Heading 1"
          onClick={() => formatBlock('h1')}
        />
        <ToolbarButton 
          icon={<Heading2 className="h-4 w-4" />} 
          command="formatBlock"
          tooltip="Heading 2"
          onClick={() => formatBlock('h2')}
        />
        <ToolbarButton 
          icon={<Heading3 className="h-4 w-4" />} 
          command="formatBlock"
          tooltip="Heading 3"
          onClick={() => formatBlock('h3')}
        />
        
        <div className="w-px h-6 bg-border mx-1" />
        
        {/* Lists */}
        <ToolbarButton icon={<List className="h-4 w-4" />} command="insertUnorderedList" tooltip="Bullet List" />
        <ToolbarButton icon={<ListOrdered className="h-4 w-4" />} command="insertOrderedList" tooltip="Numbered List" />
        <ToolbarButton 
          icon={<Quote className="h-4 w-4" />} 
          command="formatBlock"
          tooltip="Block Quote"
          onClick={() => formatBlock('blockquote')}
        />
        
        <div className="w-px h-6 bg-border mx-1" />
        
        {/* Alignment */}
        <ToolbarButton icon={<AlignLeft className="h-4 w-4" />} command="justifyLeft" tooltip="Align Left" />
        <ToolbarButton icon={<AlignCenter className="h-4 w-4" />} command="justifyCenter" tooltip="Align Center" />
        <ToolbarButton icon={<AlignRight className="h-4 w-4" />} command="justifyRight" tooltip="Align Right" />
        
        <div className="w-px h-6 bg-border mx-1" />
        
        {/* Link */}
        <Dialog open={showLinkDialog} onOpenChange={setShowLinkDialog}>
          <DialogTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
              onClick={() => {
                saveSelection();
                setShowLinkDialog(true);
              }}
              onMouseDown={(e) => e.preventDefault()}
            >
              <Link className="h-4 w-4" />
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Insert Link</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="link-url">URL</Label>
                <Input
                  id="link-url"
                  placeholder="https://example.com"
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && insertLink()}
                />
              </div>
              <Button onClick={insertLink} disabled={!linkUrl}>
                Insert Link
              </Button>
            </div>
          </DialogContent>
        </Dialog>
        
        {/* Image */}
        <Dialog open={showImageDialog} onOpenChange={setShowImageDialog}>
          <DialogTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
              onClick={() => {
                saveSelection();
                setShowImageDialog(true);
              }}
              onMouseDown={(e) => e.preventDefault()}
            >
              <Image className="h-4 w-4" />
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Insert Image</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="image-url">Image URL</Label>
                <Input
                  id="image-url"
                  placeholder="https://example.com/image.jpg"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && insertImage()}
                />
              </div>
              <Button onClick={insertImage} disabled={!imageUrl}>
                Insert Image
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Editor */}
      <div
        ref={editorRef}
        contentEditable
        className={cn(
          'p-4 outline-none overflow-auto prose prose-sm dark:prose-invert max-w-none',
          'focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background',
          '[&_h1]:text-2xl [&_h1]:font-bold [&_h1]:mt-4 [&_h1]:mb-2',
          '[&_h2]:text-xl [&_h2]:font-bold [&_h2]:mt-3 [&_h2]:mb-2',
          '[&_h3]:text-lg [&_h3]:font-semibold [&_h3]:mt-2 [&_h3]:mb-1',
          '[&_blockquote]:border-l-4 [&_blockquote]:border-primary/30 [&_blockquote]:pl-4 [&_blockquote]:italic',
          '[&_ul]:list-disc [&_ul]:pl-6',
          '[&_ol]:list-decimal [&_ol]:pl-6',
          '[&_code]:bg-muted [&_code]:px-1 [&_code]:py-0.5 [&_code]:rounded [&_code]:font-mono [&_code]:text-sm',
          '[&_a]:text-primary [&_a]:underline',
          '[&_img]:max-w-full [&_img]:h-auto [&_img]:rounded'
        )}
        style={{ minHeight }}
        onInput={handleInput}
        onBlur={handleInput}
        data-placeholder={placeholder}
        suppressContentEditableWarning
      />

      <style jsx>{`
        [contenteditable]:empty:before {
          content: attr(data-placeholder);
          color: hsl(var(--muted-foreground));
          pointer-events: none;
        }
      `}</style>
    </div>
  );
}

export default SimpleRichEditor;
