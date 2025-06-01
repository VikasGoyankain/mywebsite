export default function AdminSimpleLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-6xl mx-auto py-8">
        {children}
      </div>
    </div>
  )
} 