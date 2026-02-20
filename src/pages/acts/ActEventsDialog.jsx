import { useState } from 'react'
import { toast } from 'sonner'
import { Loader2, Trash2, ChevronsUpDown } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import { useEvents } from '@/hooks/useEvents'
import { useAttachEvent, useDetachEvent } from '@/hooks/useActs'

export function ActEventsDialog({ open, onOpenChange, act }) {
  const [search, setSearch] = useState('')
  const [comboboxOpen, setComboboxOpen] = useState(false)
  const [detachingId, setDetachingId] = useState(null)

  const { data: eventsData } = useEvents(1, { search, per_page: -1 })
  const attachEvent = useAttachEvent()
  const detachEvent = useDetachEvent()

  const currentEvents = act?.events || []
  const allEvents = eventsData?.data || []
  const availableEvents = allEvents
    .filter((e) => !currentEvents.some((ce) => ce.id === e.id))
    .sort((a, b) => {
      if (!a.start_date || !b.start_date) return 0
      return new Date(b.start_date) - new Date(a.start_date)
    })

  async function handleAttach(eventId) {
    try {
      await attachEvent.mutateAsync({ actId: act.id, eventId })
      toast.success('Event attached')
      setComboboxOpen(false)
    } catch (error) {
      toast.error(error.message || 'Failed to attach event')
    }
  }

  async function handleDetach(eventId) {
    setDetachingId(eventId)
    try {
      await detachEvent.mutateAsync({ actId: act.id, eventId })
      toast.success('Event detached')
    } catch (error) {
      toast.error(error.message || 'Failed to detach event')
    } finally {
      setDetachingId(null)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Manage Events for {act?.name}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <h4 className="text-sm font-medium mb-2">Current Direct Event Associations</h4>
            {currentEvents.length === 0 ? (
              <p className="text-sm text-muted-foreground">No direct event associations.</p>
            ) : (
              <div className="space-y-2">
                {currentEvents.map((event) => (
                  <div
                    key={event.id}
                    className="flex items-center justify-between rounded-md border p-3"
                  >
                    <div>
                      <p className="text-sm font-medium">{event.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {event.location}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDetach(event.id)}
                      disabled={detachingId === event.id}
                    >
                      {detachingId === event.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4 text-destructive" />
                      )}
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
          <Separator />
          <div>
            <h4 className="text-sm font-medium mb-2">Add Event</h4>
            <Popover open={comboboxOpen} onOpenChange={setComboboxOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={comboboxOpen}
                  className="w-full justify-between"
                >
                  Select an event...
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-full p-0" align="start">
                <Command shouldFilter={false}>
                  <CommandInput 
                    placeholder="Search events..." 
                    value={search}
                    onValueChange={setSearch}
                  />
                  <CommandList>
                    <CommandEmpty>No events found.</CommandEmpty>
                    <CommandGroup>
                      {availableEvents.map((event) => (
                        <CommandItem
                          key={event.id}
                          value={event.name}
                          onSelect={() => handleAttach(event.id)}
                        >
                          {event.name}
                          {event.location && (
                            <span className="ml-2 text-xs text-muted-foreground">
                              ({event.location})
                            </span>
                          )}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
