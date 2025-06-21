import React from "react";
import { FamilyAuthWrapper } from "@/components/family/FamilyAuthWrapper";
import { Toaster } from "@/components/ui/toaster";

export const metadata = {
  title: "Family Area | Private Access",
  description: "Secure family area for private content",
};

export default function FamilyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <FamilyAuthWrapper>
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
        {children}
        <Toaster />
      </div>
    </FamilyAuthWrapper>
  );
} 