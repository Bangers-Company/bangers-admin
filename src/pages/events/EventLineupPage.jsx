import { useParams, useNavigate } from 'react-router'
import { useEvent } from '@/hooks/useEvents'
import { PageHeader } from '@/components/shared/PageHeader'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Loader2, ArrowLeft, Users } from 'lucide-react'

export default function EventLineupPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { data: response, isLoading } = useEvent(id)

  const event = response?.data
  const stages = event?.stages || []
  const acts = event?.acts || []

  if (isLoading) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!event) {
    return (
      <div className="flex flex-col items-center gap-4 py-12">
        <p className="text-muted-foreground">Event not found.</p>
        <Button onClick={() => navigate('/events')}>Back to Events</Button>
      </div>
    )
  }

  // Group acts by stage
  const lineup = stages.map(stage => {
    return {
      ...stage,
      acts: acts.filter(act => act.stage_id === stage.id)
    }
  })

  // Acts without a stage
  const uncategorizedActs = acts.filter(act => !act.stage_id)

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/events')}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <PageHeader 
          title={`Line-up: ${event.name}`} 
          description={`${event.location} • ${new Date(event.start_date).toLocaleDateString()}`}
        />
      </div>

      <div className="w-full overflow-x-auto rounded-md border bg-muted/20 pb-4">
        <div className="flex p-4 gap-6">
          {lineup.map((column) => (
            <div key={column.id} className="flex flex-col gap-4 w-[300px] shrink-0">
              <div className="px-1">
                <h3 className="text-lg font-bold tracking-tight text-primary uppercase">
                  {column.name}
                </h3>
                <p className="text-xs text-muted-foreground line-clamp-1">
                  {column.description || 'No description'}
                </p>
              </div>
              
              <div className="space-y-2">
                {column.acts.length === 0 ? (
                  <p className="text-sm text-muted-foreground italic px-1">No acts assigned yet.</p>
                ) : (
                  column.acts.map((act) => (
                    <Card key={act.id} className="shadow-sm border-l-4 border-l-primary hover:bg-muted/30 transition-colors">
                      <CardHeader className="p-1 px-2 space-y-0.5">
                        <CardTitle className="text-[11px] font-bold leading-none">{act.name}</CardTitle>
                        <div className="flex flex-wrap gap-1">
                          {act.artists?.map(artist => (
                            <Badge key={artist.id} variant="secondary" className="text-[9px] h-3.5 px-1 py-0 font-normal">
                              {artist.name}
                            </Badge>
                          ))}
                        </div>
                      </CardHeader>
                    </Card>
                  ))
                )}
              </div>
            </div>
          ))}

          {/* Uncategorized Column */}
          {uncategorizedActs.length > 0 && (
            <div className="flex flex-col gap-4 w-[300px] shrink-0">
              <div className="px-1">
                <h3 className="text-lg font-bold tracking-tight text-destructive uppercase">
                  Uncategorized
                </h3>
                <p className="text-xs text-muted-foreground">
                  Acts not assigned to a stage
                </p>
              </div>

              <div className="space-y-3">
                {uncategorizedActs.map((act) => (
                  <Card key={act.id} className="shadow-sm border-l-4 border-l-destructive hover:bg-muted/30 transition-colors">
                    <CardHeader className="p-1 px-2 space-y-0.5">
                      <CardTitle className="text-[11px] font-bold leading-none">{act.name}</CardTitle>
                      <div className="flex flex-wrap gap-1">
                        {act.artists?.map(artist => (
                          <Badge key={artist.id} variant="secondary" className="text-[9px] h-3.5 px-1 py-0 font-normal">
                            {artist.name}
                          </Badge>
                        ))}
                      </div>
                    </CardHeader>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
