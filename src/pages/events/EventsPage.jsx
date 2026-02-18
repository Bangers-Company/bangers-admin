import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { Plus, MoreHorizontal } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { DataTable, SortableHeader } from '@/components/shared/DataTable'
import { DeleteDialog } from '@/components/shared/DeleteDialog'
import { PageHeader } from '@/components/shared/PageHeader'
import { EventForm } from './EventForm'
import { EventStagesDialog } from './EventStagesDialog'
import { useEvents, useDeleteEvent } from '@/hooks/useEvents'

function formatDate(dateStr) {
  if (!dateStr) return '—'
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

export default function EventsPage() {
  const [page, setPage] = useState(0)
  const [formOpen, setFormOpen] = useState(false)
  const [editingEvent, setEditingEvent] = useState(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [deletingEvent, setDeletingEvent] = useState(null)
  const [stagesDialogOpen, setStagesDialogOpen] = useState(false)
  const [stagesEvent, setStagesEvent] = useState(null)

  const { data, isLoading } = useEvents(page + 1)
  const deleteEvent = useDeleteEvent()

  useEffect(() => { document.title = 'Events — Bangers Admin' }, [])

  const events = data?.data || []
  const meta = data?.meta || {}

  const columns = [
    {
      accessorKey: 'name',
      header: ({ column }) => <SortableHeader column={column}>Name</SortableHeader>,
    },
    {
      accessorKey: 'location',
      header: 'Location',
      cell: ({ row }) => row.original.location || '—',
    },
    {
      accessorKey: 'start_date',
      header: 'Start Date',
      cell: ({ row }) => formatDate(row.original.start_date),
    },
    {
      accessorKey: 'end_date',
      header: 'End Date',
      cell: ({ row }) => formatDate(row.original.end_date),
    },
    {
      id: 'stages',
      header: 'Stages',
      cell: ({ row }) => (
        <Badge variant="secondary">
          {row.original.stages?.length || 0}
        </Badge>
      ),
    },
    {
      id: 'actions',
      header: '',
      cell: ({ row }) => {
        const event = row.original
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={() => {
                  setEditingEvent(event)
                  setFormOpen(true)
                }}
              >
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => {
                  setStagesEvent(event)
                  setStagesDialogOpen(true)
                }}
              >
                Manage Stages
              </DropdownMenuItem>
              <DropdownMenuItem
                className="text-destructive"
                onClick={() => {
                  setDeletingEvent(event)
                  setDeleteDialogOpen(true)
                }}
              >
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
    },
  ]

  async function handleDelete() {
    try {
      await deleteEvent.mutateAsync(deletingEvent.id)
      toast.success('Event deleted')
      setDeleteDialogOpen(false)
      setDeletingEvent(null)
    } catch (error) {
      toast.error(error.message || 'Failed to delete event')
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Events"
        description="Manage festivals and events"
        action={
          <Button
            onClick={() => {
              setEditingEvent(null)
              setFormOpen(true)
            }}
          >
            <Plus className="mr-2 h-4 w-4" />
            Create Event
          </Button>
        }
      />
      <DataTable
        columns={columns}
        data={events}
        pageCount={meta.last_page || 0}
        pageIndex={page}
        onPageChange={setPage}
        filterColumn="name"
        filterPlaceholder="Filter events..."
        isLoading={isLoading}
        emptyState={
          <div className="flex flex-col items-center gap-2 py-4">
            <p className="text-muted-foreground">No events yet.</p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => { setEditingEvent(null); setFormOpen(true) }}
            >
              <Plus className="mr-2 h-4 w-4" />
              Create your first event
            </Button>
          </div>
        }
      />
      <EventForm
        open={formOpen}
        onOpenChange={(open) => {
          setFormOpen(open)
          if (!open) setEditingEvent(null)
        }}
        event={editingEvent}
      />
      <EventStagesDialog
        open={stagesDialogOpen}
        onOpenChange={(open) => {
          setStagesDialogOpen(open)
          if (!open) setStagesEvent(null)
        }}
        event={stagesEvent}
      />
      <DeleteDialog
        open={deleteDialogOpen}
        onOpenChange={(open) => {
          setDeleteDialogOpen(open)
          if (!open) setDeletingEvent(null)
        }}
        onConfirm={handleDelete}
        title="Delete Event"
        description={`Are you sure you want to delete "${deletingEvent?.name}"? This action cannot be undone.`}
        isDeleting={deleteEvent.isPending}
      />
    </div>
  )
}
