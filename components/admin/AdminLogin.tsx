"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { authenticateAdmin } from '@/lib/expertise-storage';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export function AdminLogin() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (authenticateAdmin(password)) {
      router.push('/admin/expertise');
      router.refresh();
    } else {
      setError('Invalid password');
      setPassword('');
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <h1 className="font-display text-2xl font-medium text-center mb-8">
          Admin Access
        </h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter admin password"
              className="mt-1"
            />
            {error && (
              <p className="text-sm text-destructive mt-1">{error}</p>
            )}
          </div>
          <Button type="submit" className="w-full">
            Enter
          </Button>
        </form>
        <p className="text-xs text-muted-foreground text-center mt-6">
          Default password: expertise2024
        </p>
      </div>
    </div>
  );
}
