"use client";

import { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { addItem, updateItem, deleteItem } from '@/lib/expertise-storage';
import type { Certification, ExpertiseData } from '@/types/expertise';

interface CertificationsFormProps {
  data: ExpertiseData;
  onDataChange: () => void;
}

export function CertificationsForm({ data, onDataChange }: CertificationsFormProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: '',
    issuingBody: '',
    dateEarned: '',
    verificationLink: '',
    relevanceNote: '',
  });

  const resetForm = () => {
    setForm({ name: '', issuingBody: '', dateEarned: '', verificationLink: '', relevanceNote: '' });
    setIsAdding(false);
    setEditingId(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      updateItem<Certification>('certifications', editingId, form);
    } else {
      addItem<Certification>('certifications', form);
    }
    resetForm();
    onDataChange();
  };

  const handleEdit = (cert: Certification) => {
    setForm({
      name: cert.name,
      issuingBody: cert.issuingBody,
      dateEarned: cert.dateEarned,
      verificationLink: cert.verificationLink || '',
      relevanceNote: cert.relevanceNote,
    });
    setEditingId(cert.id);
    setIsAdding(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Delete this certification?')) {
      deleteItem('certifications', id);
      onDataChange();
    }
  };

  const sorted = [...data.certifications].sort((a, b) => a.order - b.order);

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-display text-lg font-medium">Certifications & Awards</h3>
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
              <Label htmlFor="cert-name">Certification Name</Label>
              <Input
                id="cert-name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="issuing-body">Issuing Body</Label>
              <Input
                id="issuing-body"
                value={form.issuingBody}
                onChange={(e) => setForm({ ...form, issuingBody: e.target.value })}
                required
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="date-earned">Date Earned (YYYY-MM)</Label>
              <Input
                id="date-earned"
                value={form.dateEarned}
                onChange={(e) => setForm({ ...form, dateEarned: e.target.value })}
                placeholder="2024-01"
                required
              />
            </div>
            <div>
              <Label htmlFor="verification-link">Verification Link (optional)</Label>
              <Input
                id="verification-link"
                type="url"
                value={form.verificationLink}
                onChange={(e) => setForm({ ...form, verificationLink: e.target.value })}
              />
            </div>
          </div>
          <div>
            <Label htmlFor="relevance-note">Relevance Note</Label>
            <Textarea
              id="relevance-note"
              value={form.relevanceNote}
              onChange={(e) => setForm({ ...form, relevanceNote: e.target.value })}
              rows={2}
            />
          </div>
          <div className="flex gap-2">
            <Button type="submit">{editingId ? 'Update' : 'Add'}</Button>
            <Button type="button" variant="outline" onClick={resetForm}>Cancel</Button>
          </div>
        </form>
      )}

      <div className="space-y-2">
        {sorted.map((cert) => (
          <div
            key={cert.id}
            className="flex items-center gap-3 p-3 border border-border bg-card"
          >
            <div className="flex-1">
              <p className="font-medium">{cert.name}</p>
              <p className="text-sm text-muted-foreground">{cert.issuingBody} • {cert.dateEarned}</p>
            </div>
            <Button size="sm" variant="ghost" onClick={() => handleEdit(cert)}>
              Edit
            </Button>
            <Button size="sm" variant="ghost" onClick={() => handleDelete(cert.id)}>
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
