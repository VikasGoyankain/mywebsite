"use client";

import { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import type { Competition, ExpertiseData } from '@/types/expertise';

interface CompetitionsFormProps {
  data: ExpertiseData;
  onDataChange: () => void;
}

export function CompetitionsForm({ data, onDataChange }: CompetitionsFormProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: '',
    year: '',
    role: '',
    teamContext: '',
    outcome: '',
    keyLearning: '',
  });

  const resetForm = () => {
    setForm({ name: '', year: '', role: '', teamContext: '', outcome: '', keyLearning: '' });
    setIsAdding(false);
    setEditingId(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        const response = await fetch(`/api/competitions/${editingId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form),
        });
        if (!response.ok) throw new Error('Failed to update');
      } else {
        const response = await fetch('/api/competitions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form),
        });
        if (!response.ok) throw new Error('Failed to create');
      }
      resetForm();
      onDataChange();
    } catch (error) {
      console.error('Error saving competition:', error);
      alert('Failed to save competition');
    }
  };

  const handleEdit = (comp: Competition) => {
    setForm({
      name: comp.name,
      year: comp.year,
      role: comp.role,
      teamContext: comp.teamContext || '',
      outcome: comp.outcome,
      keyLearning: comp.keyLearning,
    });
    setEditingId(comp.id);
    setIsAdding(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Delete this competition?')) {
      try {
        const response = await fetch(`/api/competitions/${id}`, {
          method: 'DELETE',
        });
        if (!response.ok) throw new Error('Failed to delete');
        onDataChange();
      } catch (error) {
        console.error('Error deleting competition:', error);
        alert('Failed to delete competition');
      }
    }
  };

  const sorted = [...data.competitions].sort((a, b) => a.order - b.order);

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-display text-lg font-medium">Competitions</h3>
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
              <Label htmlFor="comp-name">Competition Name</Label>
              <Input
                id="comp-name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="comp-year">Year</Label>
              <Input
                id="comp-year"
                value={form.year}
                onChange={(e) => setForm({ ...form, year: e.target.value })}
                placeholder="2024"
                required
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="comp-role">Your Role</Label>
              <Input
                id="comp-role"
                value={form.role}
                onChange={(e) => setForm({ ...form, role: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="team-context">Team Context (optional)</Label>
              <Input
                id="team-context"
                value={form.teamContext}
                onChange={(e) => setForm({ ...form, teamContext: e.target.value })}
              />
            </div>
          </div>
          <div>
            <Label htmlFor="outcome">Outcome</Label>
            <Input
              id="outcome"
              value={form.outcome}
              onChange={(e) => setForm({ ...form, outcome: e.target.value })}
              placeholder="e.g., First Place, Finalist"
              required
            />
          </div>
          <div>
            <Label htmlFor="key-learning">Key Learning</Label>
            <Textarea
              id="key-learning"
              value={form.keyLearning}
              onChange={(e) => setForm({ ...form, keyLearning: e.target.value })}
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
        {sorted.map((comp) => (
          <div
            key={comp.id}
            className="flex items-center gap-3 p-3 border border-border bg-card"
          >
            <div className="flex-1">
              <p className="font-medium">{comp.name}</p>
              <p className="text-sm text-muted-foreground">{comp.year} • {comp.outcome}</p>
            </div>
            <Button size="sm" variant="ghost" onClick={() => handleEdit(comp)}>
              Edit
            </Button>
            <Button size="sm" variant="ghost" onClick={() => handleDelete(comp.id)}>
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
