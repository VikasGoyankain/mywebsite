import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function FamilyHomePage() {
  return (
    <div className="container mx-auto py-8 px-4">
      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Family Area</h1>
        <p className="text-muted-foreground mt-1">
          Welcome to your private family space
        </p>
      </header>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Settings Card */}
        <Card>
          <CardHeader>
            <CardTitle>Account Settings</CardTitle>
            <CardDescription>
              Manage your family account preferences
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/family/settings">
              <Button className="w-full">
                Manage Settings
              </Button>
            </Link>
          </CardContent>
        </Card>
        
        {/* Add more feature cards here */}
      </div>
    </div>
  );
} 