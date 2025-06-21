"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';

interface FamilyRegistrationFormProps {
  onSuccess?: () => void;
}

export default function FamilyRegistrationForm({ onSuccess }: FamilyRegistrationFormProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const formData = new FormData(e.currentTarget);
      const response = await fetch('/api/family/register', {
        method: 'POST',
        body: JSON.stringify({
          email: formData.get('email'),
          password: formData.get('password'),
          name: formData.get('name'),
          relationship: formData.get('relationship')
        }),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Registration failed');
      }

      toast({
        title: "Registration successful",
        description: "Your family member account has been created.",
      });

      onSuccess?.();
    } catch (error) {
      toast({
        title: "Registration failed",
        description: "There was an error registering the account. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="name">Full Name</Label>
        <Input
          id="name"
          name="name"
          type="text"
          required
          placeholder="Enter full name"
        />
      </div>
      
      <div>
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          name="email"
          type="email"
          required
          placeholder="Enter email"
        />
      </div>

      <div>
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          name="password"
          type="password"
          required
          placeholder="Create a password"
        />
      </div>

      <div>
        <Label htmlFor="relationship">Relationship</Label>
        <Input
          id="relationship"
          name="relationship"
          type="text"
          required
          placeholder="e.g., Spouse, Child, Parent"
        />
      </div>

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? "Registering..." : "Register Family Member"}
      </Button>
    </form>
  );
} 