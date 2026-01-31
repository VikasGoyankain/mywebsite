"use client";

import { useState } from 'react';
import { Plus, Trash2, GripVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { addItem, updateItem, deleteItem } from '@/lib/expertise-storage';
import type { ExpertiseArea, ExpertiseData } from '@/types/expertise';

interface ExpertiseFormProps {
  data: ExpertiseData;
  onDataChange: () => void;
}

export function ExpertiseAreasForm({ data, onDataChange }: ExpertiseFormProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: '',
    descriptor: '',
    competencyNote: '',
    linkedCertifications: [] as string[],
    linkedCompetitions: [] as string[],
    linkedBooks: [] as string[],
  });

  const resetForm = () => {
    setForm({
      name: '',
      descriptor: '',
      competencyNote: '',
      linkedCertifications: [],
      linkedCompetitions: [],
      linkedBooks: [],
    });
    setIsAdding(false);
    setEditingId(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      updateItem<ExpertiseArea>('expertiseAreas', editingId, form);
    } else {
      addItem<ExpertiseArea>('expertiseAreas', form);
    }
    resetForm();
    onDataChange();
  };

  const handleEdit = (area: ExpertiseArea) => {
    setForm({
      name: area.name,
      descriptor: area.descriptor,
      competencyNote: area.competencyNote,
      linkedCertifications: area.linkedCertifications,
      linkedCompetitions: area.linkedCompetitions,
      linkedBooks: area.linkedBooks,
    });
    setEditingId(area.id);
    setIsAdding(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Delete this expertise area?')) {
      deleteItem('expertiseAreas', id);
      onDataChange();
    }
  };

  const toggleLinked = (type: 'linkedCertifications' | 'linkedCompetitions' | 'linkedBooks', id: string) => {
    setForm((prev) => ({
      ...prev,
      [type]: prev[type].includes(id)
        ? prev[type].filter((i) => i !== id)
        : [...prev[type], id],
    }));
  };

  const sorted = [...data.expertiseAreas].sort((a, b) => a.order - b.order);

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-display text-lg font-medium">Expertise Areas</h3>
        {!isAdding && (
          <Button size="sm" variant="outline" onClick={() => setIsAdding(true)}>
            <Plus className="h-4 w-4 mr-1" /> Add
          </Button>
        )}
      </div>

      {isAdding && (
        <form onSubmit={handleSubmit} className="border border-border p-4 mb-4 space-y-4">
          <div>
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
            />
          </div>
          <div>
            <Label htmlFor="descriptor">One-line descriptor</Label>
            <Input
              id="descriptor"
              value={form.descriptor}
              onChange={(e) => setForm({ ...form, descriptor: e.target.value })}
              required
            />
          </div>
          <div>
            <Label htmlFor="competencyNote">Competency note</Label>
            <Textarea
              id="competencyNote"
              value={form.competencyNote}
              onChange={(e) => setForm({ ...form, competencyNote: e.target.value })}
              rows={3}
            />
          </div>

          {/* Link certifications */}
          {data.certifications.length > 0 && (
            <div>
              <Label>Link Certifications</Label>
              <div className="mt-2 space-y-2">
                {data.certifications.map((cert) => (
                  <div key={cert.id} className="flex items-center gap-2">
                    <Checkbox
                      id={`cert-${cert.id}`}
                      checked={form.linkedCertifications.includes(cert.id)}
                      onCheckedChange={() => toggleLinked('linkedCertifications', cert.id)}
                    />
                    <label htmlFor={`cert-${cert.id}`} className="text-sm">{cert.name}</label>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Link competitions */}
          {data.competitions.length > 0 && (
            <div>
              <Label>Link Competitions</Label>
              <div className="mt-2 space-y-2">
                {data.competitions.map((comp) => (
                  <div key={comp.id} className="flex items-center gap-2">
                    <Checkbox
                      id={`comp-${comp.id}`}
                      checked={form.linkedCompetitions.includes(comp.id)}
                      onCheckedChange={() => toggleLinked('linkedCompetitions', comp.id)}
                    />
                    <label htmlFor={`comp-${comp.id}`} className="text-sm">{comp.name}</label>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Link books */}
          {data.books.length > 0 && (
            <div>
              <Label>Link Books</Label>
              <div className="mt-2 space-y-2">
                {data.books.map((book) => (
                  <div key={book.id} className="flex items-center gap-2">
                    <Checkbox
                      id={`book-${book.id}`}
                      checked={form.linkedBooks.includes(book.id)}
                      onCheckedChange={() => toggleLinked('linkedBooks', book.id)}
                    />
                    <label htmlFor={`book-${book.id}`} className="text-sm">{book.title}</label>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex gap-2">
            <Button type="submit">{editingId ? 'Update' : 'Add'}</Button>
            <Button type="button" variant="outline" onClick={resetForm}>Cancel</Button>
          </div>
        </form>
      )}

      <div className="space-y-2">
        {sorted.map((area) => (
          <div
            key={area.id}
            className="flex items-center gap-3 p-3 border border-border bg-card"
          >
            <GripVertical className="h-4 w-4 text-muted-foreground" />
            <div className="flex-1">
              <p className="font-medium">{area.name}</p>
              <p className="text-sm text-muted-foreground">{area.descriptor}</p>
            </div>
            <Button size="sm" variant="ghost" onClick={() => handleEdit(area)}>
              Edit
            </Button>
            <Button size="sm" variant="ghost" onClick={() => handleDelete(area.id)}>
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
