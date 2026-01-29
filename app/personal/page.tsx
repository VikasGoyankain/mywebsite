"use client";

import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FolderOpen, Image, Settings, User } from 'lucide-react';

export default function PersonalPage() {
  const router = useRouter();

  const menuItems = [
    {
      title: 'Gallery',
      description: 'Manage your photos and media files',
      icon: Image,
      href: '/personal/gallery'
    },
    {
      title: 'Settings',
      description: 'Configure your personal account settings',
      icon: Settings,
      href: '/personal/settings'
    }
  ];

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Personal Dashboard</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <Card 
                key={item.title} 
                className="hover:bg-accent cursor-pointer transition-colors"
                onClick={() => router.push(item.href)}
              >
                <CardHeader className="flex flex-row items-center gap-4">
                  <Icon className="h-8 w-8" />
                  <div>
                    <CardTitle>{item.title}</CardTitle>
                    <CardDescription>{item.description}</CardDescription>
                  </div>
                </CardHeader>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
} 