import { useState, useMemo } from 'react'
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
import { useStages } from '@/hooks/useStages'
import { useAttachStage, useDetachStage } from '@/hooks/useActs'

export function ActStagesDialog({ open, onOpenChange, act }) {
  const [search, setSearch] = useState('')
  const [comboboxOpen, setComboboxOpen] = useState(false)
  const [detachingId, setDetachingId] = useState(null)

  const { data: stagesData } = useStages(1, { search, per_page: -1 })
  const attachStage = useAttachStage()
  const detachStage = useDetachStage()

  const currentStages = act?.stages || []
  const allStages = stagesData?.data || []

  // Create "Available Editions" - Stage + Event combinations
  const availableEditions = useMemo(() => {
    const editions = []
    allStages.forEach(stage => {
      const stageEvents = stage.events || []
      stageEvents.forEach(event => {
        // Calculate days for the event
        const start = new Date(event.start_date)
        const end = new Date(event.end_date)
        const dayList = []
        let current = new Date(start)
        while (current <= end) {
          dayList.push(new Date(current).toISOString().split('T')[0])
          current.setDate(current.getDate() + 1)
        }

        dayList.forEach(day => {
          // Check if this specific combo (stage + event + date) is already attached
          const isAttached = currentStages.some(cs => 
            cs.id === stage.id && 
            cs.pivot?.event_id === event.id && 
            cs.pivot?.date === day
          )
          
          const dateObj = new Date(day)
          const dayName = dateObj.toLocaleDateString(undefined, { weekday: 'long' })
          const dateStr = dateObj.toLocaleDateString(undefined, { day: 'numeric', month: 'short' })
          const searchString = `${stage.name} ${event.name} ${dayName} ${dateStr}`.toLowerCase()

          if (!isAttached && (!search || searchString.includes(search.toLowerCase()))) {
            editions.push({
              stageId: stage.id,
              stageName: stage.name,
              eventId: event.id,
              eventName: event.name,
              date: day,
              dayName,
              dateStr
            })
          }
        })
      })
    })

    // Sort by date DESC (future first)
    return editions.sort((a, b) => new Date(b.date) - new Date(a.date))
  }, [allStages, currentStages, search])

  async function handleAttach(stageId, eventId, date) {
    try {
      await attachStage.mutateAsync({ actId: act.id, stageId, event_id: eventId, date })
      toast.success('Stage attached to edition')
      setComboboxOpen(false)
      setSearch('') // Clear search on attach
    } catch (error) {
      toast.error(error.message || 'Failed to attach stage')
    }
  }

  async function handleDetach(stageId, eventId, date) {
    const key = `${stageId}-${eventId}-${date}`
    setDetachingId(key)
    try {
      await detachStage.mutateAsync({ actId: act.id, stageId, event_id: eventId, date })
      toast.success('Stage detached from edition')
    } catch (error) {
      toast.error(error.message || 'Failed to detach stage')
    } finally {
      setDetachingId(null)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Manage Edition Lineups for {act?.name}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <h4 className="text-sm font-medium mb-2">Current Edition Associations</h4>
            {currentStages.length === 0 ? (
              <p className="text-sm text-muted-foreground">No edition-specific stages attached.</p>
            ) : (
              <div className="space-y-2">
                {[...currentStages]
                  .sort((a, b) => {
                    const dateA = a.pivot?.date || ''
                    const dateB = b.pivot?.date || ''
                    return new Date(dateB) - new Date(dateA)
                  })
                  .map((stage) => {
                  const parentEvent = stage.events?.find(e => e.id === stage.pivot?.event_id)
                  const key = `${stage.id}-${stage.pivot?.event_id}-${stage.pivot?.date}`
                  const dateObj = stage.pivot?.date ? new Date(stage.pivot.date) : null
                  return (
                    <div
                      key={key}
                      className="flex items-center justify-between rounded-md border p-3"
                    >
                      <div>
                        <p className="text-sm font-medium">{stage.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {parentEvent?.name} • {dateObj ? dateObj.toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'short' }) : 'All Weekend'}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDetach(stage.id, stage.pivot?.event_id, stage.pivot?.date)}
                        disabled={detachingId === key}
                      >
                        {detachingId === key ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4 text-destructive" />
                        )}
                      </Button>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
          <Separator />
          <div>
            <h4 className="text-sm font-medium mb-2">Add to Edition</h4>
            <Popover open={comboboxOpen} onOpenChange={setComboboxOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={comboboxOpen}
                  className="w-full justify-between"
                >
                  Select a stage and event...
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-full p-0" align="start">
                <Command shouldFilter={false}>
                  <CommandInput 
                    placeholder="Search stages/events..." 
                    value={search}
                    onValueChange={setSearch}
                  />
                  <CommandList>
                    <CommandEmpty>No available editions found.</CommandEmpty>
                    <CommandGroup>
                      {availableEditions.map((edition) => (
                        <CommandItem
                          key={`${edition.stageId}-${edition.eventId}-${edition.date}`}
                          value={`${edition.stageName} ${edition.eventName} ${edition.dayName} ${edition.dateStr}`}
                          onSelect={() => handleAttach(edition.stageId, edition.eventId, edition.date)}
                        >
                          <div className="flex flex-col">
                            <span className="font-medium">{edition.stageName}</span>
                            <span className="text-xs text-muted-foreground">
                              {edition.eventName} • {edition.dayName}, {edition.dateStr}
                            </span>
                          </div>
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
