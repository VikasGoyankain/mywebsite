"use client";

import { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { addItem, updateItem, deleteItem } from '@/lib/expertise-storage';
import type { Book, ExpertiseData } from '@/types/expertise';

interface BooksFormProps {
  data: ExpertiseData;
  onDataChange: () => void;
}

export function BooksForm({ data, onDataChange }: BooksFormProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({
    title: '',
    author: '',
    commentary: '',
    impactOnThinking: '',
  });

  const resetForm = () => {
    setForm({ title: '', author: '', commentary: '', impactOnThinking: '' });
    setIsAdding(false);
    setEditingId(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      updateItem<Book>('books', editingId, form);
    } else {
      addItem<Book>('books', form);
    }
    resetForm();
    onDataChange();
  };

  const handleEdit = (book: Book) => {
    setForm({
      title: book.title,
      author: book.author,
      commentary: book.commentary,
      impactOnThinking: book.impactOnThinking,
    });
    setEditingId(book.id);
    setIsAdding(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Delete this book?')) {
      deleteItem('books', id);
      onDataChange();
    }
  };

  const sorted = [...data.books].sort((a, b) => a.order - b.order);

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-display text-lg font-medium">Books & Reading</h3>
        {!isAdding && (
          <Button size="sm" variant="outline" onClick={() => setIsAdding(true)}>
            <Plus className="h-4 w-4 mr-1" /> Add
          </Button>
        )}
      </div>

      {isAdding && (
        <form onSubmit={handleSubmit} className="border border-border p-4 mb-4 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="book-title">Title</Label>
              <Input
                id="book-title"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="book-author">Author</Label>
              <Input
                id="book-author"
                value={form.author}
                onChange={(e) => setForm({ ...form, author: e.target.value })}
                required
              />
            </div>
          </div>
          <div>
            <Label htmlFor="commentary">Your Commentary</Label>
            <Textarea
              id="commentary"
              value={form.commentary}
              onChange={(e) => setForm({ ...form, commentary: e.target.value })}
              rows={3}
              placeholder="What makes this book significant?"
            />
          </div>
          <div>
            <Label htmlFor="impact">Impact on Thinking</Label>
            <Textarea
              id="impact"
              value={form.impactOnThinking}
              onChange={(e) => setForm({ ...form, impactOnThinking: e.target.value })}
              rows={2}
              placeholder="How did it shape your practice?"
            />
          </div>
          <div className="flex gap-2">
            <Button type="submit">{editingId ? 'Update' : 'Add'}</Button>
            <Button type="button" variant="outline" onClick={resetForm}>Cancel</Button>
          </div>
        </form>
      )}

      <div className="space-y-2">
        {sorted.map((book) => (
          <div
            key={book.id}
            className="flex items-center gap-3 p-3 border border-border bg-card"
          >
            <div className="flex-1">
              <p className="font-medium italic">{book.title}</p>
              <p className="text-sm text-muted-foreground">by {book.author}</p>
            </div>
            <Button size="sm" variant="ghost" onClick={() => handleEdit(book)}>
              Edit
            </Button>
            <Button size="sm" variant="ghost" onClick={() => handleDelete(book.id)}>
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
