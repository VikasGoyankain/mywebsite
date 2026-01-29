import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'CaseVault - Legal Research & Litigation Manager',
  description: 'Comprehensive legal research database with detailed case summaries and litigation records',
}

export default function CaseVaultLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div>
      {children}
    </div>
  )
} 