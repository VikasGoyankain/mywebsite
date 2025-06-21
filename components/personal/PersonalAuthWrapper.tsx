"use client";

import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff, Lock, User, Loader2, X } from 'lucide-react';
import Cookies from 'js-cookie';

interface PersonalAuthWrapperProps {
  children: React.ReactNode;
}

interface AuthToken {
  username: string;
  role: string;
  exp: number;
}

export function PersonalAuthWrapper({ children }: PersonalAuthWrapperProps) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const validateToken = (token: string): boolean => {
    try {
      const tokenData = JSON.parse(token) as AuthToken;
      return tokenData.exp * 1000 > Date.now(); // Convert to milliseconds and compare
    } catch {
      return false;
    }
  };

  const checkAuth = async () => {
    try {
      // First check if we have a valid cookie
      const token = Cookies.get('personal-auth-token');
      
      if (token && validateToken(token)) {
        console.log('Valid token found in cookie');
        setIsAuthenticated(true);
        setIsLoading(false);
        return;
      }

      // If no valid cookie, check with server
      console.log('No valid token found, checking with server...');
      const response = await fetch('/api/personal/check-auth', {
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      });

      const data = await response.json();

      if (response.ok && data.authenticated) {
        console.log('Server authenticated successfully');
        setIsAuthenticated(true);
      } else {
        console.log('Server authentication failed');
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return; // Prevent double submission
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/personal/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (data.success) {
        // Set client-side cookie
        const token = {
          username: data.user.username,
          role: data.user.role,
          exp: Math.floor(Date.now() / 1000) + 3600 // 1 hour from now
        };
        
        Cookies.set('personal-auth-token', JSON.stringify(token), {
          expires: 1/24, // 1 hour
          path: '/',
          sameSite: 'strict'
        });

        console.log('Login successful, token set');
        setIsAuthenticated(true);
        
        // Clear form
        setUsername('');
        setPassword('');
        
        toast({
          title: 'Welcome back!',
          description: 'Logged in successfully',
          className: 'bg-green-500 text-white',
        });
      } else {
        console.log('Login failed:', data.message);
        toast({
          title: 'Login Failed',
          description: data.message || 'Please check your credentials',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Login failed:', error);
      toast({
        title: 'Error',
        description: 'An error occurred during login',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center"
        >
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="mt-2 text-sm text-muted-foreground">Loading...</p>
        </motion.div>
      </div>
    );
  }

  // If authenticated, render children
  if (isAuthenticated) {
    return <>{children}</>;
  }

  // If not authenticated and not loading, show login form
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.2 }}
        className="bg-background rounded-lg shadow-lg w-full max-w-md mx-4 relative overflow-hidden"
      >
        <div className="p-6">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold">Welcome Back</h2>
            <p className="text-muted-foreground">Please sign in to continue</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="username" className="text-sm font-medium">
                Username
              </Label>
              <div className="relative">
                <User className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                <Input
                  id="username"
                  placeholder="Enter your username"
                  className="pl-10"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  autoComplete="username"
                  disabled={isSubmitting}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium">
                Password
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  className="pl-10 pr-10"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                  disabled={isSubmitting}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground transition-colors"
                  disabled={isSubmitting}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full h-11 text-base font-medium"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex items-center space-x-2"
                >
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Signing in...</span>
                </motion.div>
              ) : (
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  Sign In
                </motion.span>
              )}
            </Button>
          </form>
        </div>
      </motion.div>
    </div>
  );
} 