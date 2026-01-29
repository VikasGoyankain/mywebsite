import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts"

interface UsageAnalyticsProps {
  sectionUsage: Record<string, number>
  sections: AdminSection[]
}

export function UsageAnalytics({ sectionUsage, sections }: UsageAnalyticsProps) {
  const usageData = sections
    .map(section => ({
      name: section.title,
      usage: sectionUsage[section.id] || 0
    }))
    .sort((a, b) => b.usage - a.usage)
    .slice(0, 8)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Section Usage Analytics</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={usageData}>
            <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
            <YAxis />
            <Tooltip />
            <Bar dataKey="usage" fill="#3b82f6" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
} 