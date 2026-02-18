import { useEffect } from 'react'
import { useNavigate } from 'react-router'
import { Calendar, Music, Mic, LayoutGrid, Image, Plus, ArrowRight } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Separator } from '@/components/ui/separator'
import { PageHeader } from '@/components/shared/PageHeader'
import { useDashboardStats } from '@/hooks/useDashboard'

function formatRelativeTime(dateStr) {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  const now = new Date()
  const diffMs = now - date
  const diffSecs = Math.floor(diffMs / 1000)
  const diffMins = Math.floor(diffSecs / 60)
  const diffHours = Math.floor(diffMins / 60)
  const diffDays = Math.floor(diffHours / 24)

  if (diffDays > 7) {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }
  if (diffDays > 0) return `${diffDays}d ago`
  if (diffHours > 0) return `${diffHours}h ago`
  if (diffMins > 0) return `${diffMins}m ago`
  return 'Just now'
}

const statCards = [
  { key: 'events', label: 'Events', icon: Calendar, path: '/events' },
  { key: 'artists', label: 'Artists', icon: Music, path: '/artists' },
  { key: 'acts', label: 'Acts', icon: Mic, path: '/acts' },
  { key: 'stages', label: 'Stages', icon: LayoutGrid, path: '/stages' },
  { key: 'media', label: 'Media', icon: Image, path: '/media' },
]

const recentPanels = [
  { key: 'events', label: 'Recent Events', icon: Calendar, path: '/events' },
  { key: 'artists', label: 'Recent Artists', icon: Music, path: '/artists' },
  { key: 'acts', label: 'Recent Acts', icon: Mic, path: '/acts' },
]

export default function DashboardPage() {
  const navigate = useNavigate()
  const { data, isLoading } = useDashboardStats()

  useEffect(() => { document.title = 'Dashboard — Bangers Admin' }, [])

  const counts = data?.counts || {}
  const recent = data?.recent || {}

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard"
        description="Overview of your festival management"
      />

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {statCards.map((stat) => {
          const Icon = stat.icon
          return (
            <Card
              key={stat.key}
              className="cursor-pointer transition-colors hover:bg-accent/50"
              onClick={() => navigate(stat.path)}
            >
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.label}
                </CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <Skeleton className="h-8 w-16" />
                ) : (
                  <div className="text-3xl font-bold">{counts[stat.key] ?? 0}</div>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {recentPanels.map((panel) => {
          const Icon = panel.icon
          const items = recent[panel.key] || []
          return (
            <Card key={panel.key}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Icon className="h-4 w-4" />
                  {panel.label}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                      <Skeleton key={i} className="h-5 w-full" />
                    ))}
                  </div>
                ) : items.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No items yet</p>
                ) : (
                  <ul className="space-y-3">
                    {items.slice(0, 5).map((item) => (
                      <li key={item.id} className="flex items-center justify-between text-sm">
                        <span className="truncate font-medium">{item.name}</span>
                        <span className="text-muted-foreground text-xs shrink-0 ml-2">
                          {formatRelativeTime(item.created_at)}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </CardContent>
              <CardFooter>
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full"
                  onClick={() => navigate(panel.path)}
                >
                  View All
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </CardFooter>
            </Card>
          )
        })}
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-lg font-semibold mb-3">Quick Actions</h2>
        <Separator className="mb-4" />
        <div className="flex flex-wrap gap-3">
          <Button variant="outline" onClick={() => navigate('/events')}>
            <Plus className="mr-2 h-4 w-4" />
            Create Event
          </Button>
          <Button variant="outline" onClick={() => navigate('/artists')}>
            <Plus className="mr-2 h-4 w-4" />
            Add Artist
          </Button>
          <Button variant="outline" onClick={() => navigate('/acts')}>
            <Plus className="mr-2 h-4 w-4" />
            Create Act
          </Button>
        </div>
      </div>
    </div>
  )
}
