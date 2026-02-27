import { useParams, useNavigate } from 'react-router'
import { useEvent } from '@/hooks/useEvents'
import { PageHeader } from '@/components/shared/PageHeader'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Loader2, ArrowLeft, Users, Calendar } from 'lucide-react'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useState, useMemo } from 'react'

export default function EventLineupPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { data: response, isLoading } = useEvent(id)
  const event = response?.data

  const days = useMemo(() => {
    if (!event) return []
    const start = new Date(event.start_date)
    const end = new Date(event.end_date)
    const dayList = []
    let current = new Date(start)
    while (current <= end) {
      dayList.push(new Date(current).toISOString().split('T')[0])
      current.setDate(current.getDate() + 1)
    }
    return dayList
  }, [event])

  const [selectedDay, setSelectedDay] = useState('')

  // Initialize selectedDay to the first day of the event
  useMemo(() => {
    if (days.length > 0 && !selectedDay) {
      setSelectedDay(days[0])
    }
  }, [days, selectedDay])

  const acts = event?.acts || []
  const filteredActs = useMemo(() => {
    if (!selectedDay) return acts
    // If an act has a date pivot, it MUST match exactly.
    // If it doesn't have a date pivot, it might be a general event attachment (legacy or intentional)
    // We'll show acts that MATCH the selected date or have NO date assigned if it's the only day.
    return acts.filter(act => {
      if (act.date) {
        return act.date === selectedDay
      }
      // If event has only one day, show it. Otherwise, acts without dates are "uncategorized" or "all-weekend"
      return days.length === 1
    })
  }, [acts, selectedDay, days])

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

  const stages = event?.stages || []
  const lineup = stages.map(stage => {
    return {
      ...stage,
      acts: filteredActs.filter(act => act.stage_id === stage.id)
    }
  })

  // Acts without a stage
  const uncategorizedActs = filteredActs.filter(act => !act.stage_id)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/events')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <PageHeader 
            title={`Line-up: ${event.name}`} 
            description={`${event.location} • ${new Date(event.start_date).toLocaleDateString()}`}
          />
        </div>
        <div className="flex gap-2">
          <Button onClick={() => navigate(`/events/${event.id}/lineup/edit`)}>
            Edit Lineup
          </Button>
        </div>
      </div>

      {days.length > 1 && (
        <Tabs value={selectedDay} onValueChange={setSelectedDay} className="w-full">
          <TabsList className="bg-muted/50 p-1 h-12 w-full">
            {days.map((day) => {
              const dateObj = new Date(day)
              const dayName = dateObj.toLocaleDateString(undefined, { weekday: 'long' })
              const dateStr = dateObj.toLocaleDateString(undefined, { day: 'numeric', month: 'short' })
              return (
                <TabsTrigger 
                  key={day} 
                  value={day}
                  className="flex-1 px-6 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                >
                  <div className="flex flex-col items-center gap-0.5">
                    <span className="text-[10px] uppercase font-bold tracking-wider opacity-80">{dayName}</span>
                    <span className="text-sm font-bold">{dateStr}</span>
                  </div>
                </TabsTrigger>
              )
            })}
          </TabsList>
        </Tabs>
      )}

      <div className="w-full overflow-x-auto rounded-md border bg-muted/20 pb-4">
        <div className="flex p-4 gap-6 min-w-max">
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
