import { useParams, useNavigate } from 'react-router'
import { useEvent } from '@/hooks/useEvents'
import { useTimetables, useDeleteTimetable, useCreateTimetable, usePublishTimetable } from '@/hooks/useTimetables'
import { PageHeader } from '@/components/shared/PageHeader'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Loader2, ArrowLeft, Plus, Calendar, Trash2, Edit2, ExternalLink, Download } from 'lucide-react'
import { toast } from 'sonner'

export default function EventTimetablesPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { data: eventResponse, isLoading: isEventLoading } = useEvent(id)
  const { data: timetables, isLoading: isTimetablesLoading } = useTimetables({ event_id: id })
  const createTimetable = useCreateTimetable()
  const deleteTimetable = useDeleteTimetable()

  const event = eventResponse?.data

  const handleCreateOfficial = async () => {
    try {
      await createTimetable.mutateAsync({
        event_id: id,
        name: 'Official Timetable',
        is_official: true,
        is_public: false
      })
      toast.success('Official Timetable created')
    } catch (error) {
      console.error(error)
    }
  }

  const handleDelete = async (tid) => {
    if (!confirm('Are you sure you want to delete this timetable?')) return
    try {
      await deleteTimetable.mutateAsync(tid)
      toast.success('Timetable deleted')
    } catch (error) {
      console.error(error)
    }
  }

  if (isEventLoading || isTimetablesLoading) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!event) return <div>Event not found</div>

  // Sort and Filter timetables: Only for this event, Official first, then by name
  const filteredTimetables = (timetables || [])
    .filter(t => String(t.event_id) === String(id))
    .sort((a, b) => {
      if (a.is_official && !b.is_official) return -1
      if (!a.is_official && b.is_official) return 1
      return a.name.localeCompare(b.name)
    })

  const officialExists = filteredTimetables.some(t => t.is_official)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/events')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <PageHeader 
            title={`Timetables: ${event.name}`} 
            description="Manage official and public schedules for this event."
          />
        </div>
        <div className="flex gap-2">
          <Button variant="outline" disabled>
            <Download className="h-4 w-4 mr-2" /> Import Event
          </Button>
          {!officialExists && (
            <Button onClick={handleCreateOfficial} disabled={createTimetable.isPending}>
              <Plus className="h-4 w-4 mr-2" /> Create Official Timetable
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTimetables.map((timetable) => (
          <Card key={timetable.id} className={timetable.is_official ? 'border-primary' : ''}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <CardTitle>{timetable.name}</CardTitle>
                {timetable.is_official && (
                  <Badge variant="default">Official</Badge>
                )}
              </div>
              <CardDescription>
                {timetable.entries_count || 0} Entries
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2">
                <Badge variant={timetable.is_public ? 'secondary' : 'outline'}>
                  {timetable.is_public ? 'Public' : 'Draft'}
                </Badge>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between items-center gap-2">
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => navigate(`/events/${id}/timetables/${timetable.id}/edit`)}>
                  <Edit2 className="h-4 w-4 mr-2" /> Edit
                </Button>
                {timetable.is_official && (
                  <PublishButton timetable={timetable} />
                )}
              </div>
              <Button variant="ghost" size="sm" className="text-destructive h-9 w-9 p-0" onClick={() => handleDelete(timetable.id)}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </CardFooter>
          </Card>
        ))}

        {filteredTimetables.length === 0 && (
          <div className="col-span-full py-12 text-center border-2 border-dashed rounded-lg bg-muted/20">
            <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No timetables found for this event.</p>
          </div>
        )}
      </div>
    </div>
  )
}
function PublishButton({ timetable }) {
  const publishTimetable = usePublishTimetable()
  
  const handleToggle = async () => {
    try {
      await publishTimetable.mutateAsync({
        id: timetable.id,
        is_public: !timetable.is_public
      })
      toast.success(timetable.is_public ? 'Timetable unpublished' : 'Timetable published')
    } catch (error) {
      console.error(error)
    }
  }

  return (
    <Button 
      variant={timetable.is_public ? "secondary" : "default"} 
      size="sm"
      disabled={publishTimetable.isPending}
      onClick={handleToggle}
    >
      {publishTimetable.isPending ? (
        <Loader2 className="h-4 w-4 animate-spin mr-2" />
      ) : (
        <ExternalLink className="h-4 w-4 mr-2" />
      )}
      {timetable.is_public ? 'Unpublish' : 'Publish'}
    </Button>
  )
}
