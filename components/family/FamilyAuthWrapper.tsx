"use client";

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { FamilyLoginModal } from './FamilyLoginModal';

interface FamilyAuthWrapperProps {
  children: React.ReactNode;
}

function FamilyAuthWrapperContent({ children }: FamilyAuthWrapperProps) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Check authentication on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/family/check-auth', {
          credentials: 'include' // Include cookies in the request
        });
        
        if (response.ok) {
          setIsAuthenticated(true);
        } else {
          setIsAuthenticated(false);
          setShowLoginModal(true);
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        setIsAuthenticated(false);
        setShowLoginModal(true);
      }
    };
    
    checkAuth();
  }, []);
  
  // Component is still checking auth status
  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }
  
  return (
    <>
      <FamilyLoginModal 
        isOpen={showLoginModal} 
        setIsOpen={(isOpen) => {
          setShowLoginModal(isOpen);
          // If the modal was closed and we're still not authenticated, redirect to home
          if (!isOpen && !isAuthenticated) {
            router.push('/');
          }
        }}
        onLoginSuccess={() => {
          setIsAuthenticated(true);
          setShowLoginModal(false);
          // Redirect to the original requested URL if available
          const redirect = searchParams?.get('redirect');
          if (redirect) {
            router.push(redirect);
          }
        }}
      />
      
      {isAuthenticated && children}
    </>
  );
}

export function FamilyAuthWrapper({ children }: FamilyAuthWrapperProps) {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    }>
      <FamilyAuthWrapperContent>{children}</FamilyAuthWrapperContent>
    </Suspense>
  );
} 