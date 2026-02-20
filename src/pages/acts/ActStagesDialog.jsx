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
  const availableEditions = []
  allStages.forEach(stage => {
    const stageEvents = stage.events || []
    stageEvents.forEach(event => {
      // Check if this specific combo is already attached
      const isAttached = currentStages.some(cs => cs.id === stage.id && cs.event_id === event.id)
      
      const matchesSearch = !search || 
        stage.name.toLowerCase().includes(search.toLowerCase()) || 
        event.name.toLowerCase().includes(search.toLowerCase())

      if (!isAttached && matchesSearch) {
        availableEditions.push({
          stageId: stage.id,
          stageName: stage.name,
          eventId: event.id,
          eventName: event.name,
          startDate: event.start_date
        })
      }
    })
  })

  // Sort by start date DESC (future first)
  const sortedEditions = [...availableEditions].sort((a, b) => {
    if (!a.startDate || !b.startDate) return 0
    return new Date(b.startDate) - new Date(a.startDate)
  })

  async function handleAttach(stageId, eventId) {
    try {
      await attachStage.mutateAsync({ actId: act.id, stageId, eventId })
      toast.success('Stage attached to edition')
      setComboboxOpen(false)
      setSearch('') // Clear search on attach
    } catch (error) {
      toast.error(error.message || 'Failed to attach stage')
    }
  }

  async function handleDetach(stageId, eventId) {
    const key = `${stageId}-${eventId}`
    setDetachingId(key)
    try {
      await detachStage.mutateAsync({ actId: act.id, stageId, eventId })
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
                    const eventA = a.events?.find(e => e.id === a.event_id)
                    const eventB = b.events?.find(e => e.id === b.event_id)
                    if (!eventA?.start_date || !eventB?.start_date) return 0
                    return new Date(eventB.start_date) - new Date(eventA.start_date)
                  })
                  .map((stage) => {
                  const parentEvent = stage.events?.find(e => e.id === stage.event_id)
                  const key = `${stage.id}-${stage.event_id}`
                  return (
                    <div
                      key={key}
                      className="flex items-center justify-between rounded-md border p-3"
                    >
                      <div>
                        <p className="text-sm font-medium">{stage.name}</p>
                        <p className="text-xs text-muted-foreground">
                          Edition: {parentEvent?.name || 'Unknown'}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDetach(stage.id, stage.event_id)}
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
                      {sortedEditions.map((edition) => (
                        <CommandItem
                          key={`${edition.stageId}-${edition.eventId}`}
                          value={`${edition.stageName} ${edition.eventName}`}
                          onSelect={() => handleAttach(edition.stageId, edition.eventId)}
                        >
                          <div className="flex flex-col">
                            <span>{edition.stageName}</span>
                            <span className="text-xs text-muted-foreground">
                              {edition.eventName}
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
