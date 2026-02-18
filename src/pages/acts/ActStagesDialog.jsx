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
  const [comboboxOpen, setComboboxOpen] = useState(false)
  const [detachingId, setDetachingId] = useState(null)

  const { data: stagesData } = useStages(1)
  const attachStage = useAttachStage()
  const detachStage = useDetachStage()

  const currentStages = act?.stages || []
  const allStages = stagesData?.data || []
  const availableStages = allStages.filter(
    (s) => !currentStages.some((cs) => cs.id === s.id)
  )

  async function handleAttach(stageId) {
    try {
      await attachStage.mutateAsync({ actId: act.id, stageId })
      toast.success('Stage attached')
      setComboboxOpen(false)
    } catch (error) {
      toast.error(error.message || 'Failed to attach stage')
    }
  }

  async function handleDetach(stageId) {
    setDetachingId(stageId)
    try {
      await detachStage.mutateAsync({ actId: act.id, stageId })
      toast.success('Stage detached')
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
          <DialogTitle>Manage Stages for {act?.name}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <h4 className="text-sm font-medium mb-2">Current Stages</h4>
            {currentStages.length === 0 ? (
              <p className="text-sm text-muted-foreground">No stages attached.</p>
            ) : (
              <div className="space-y-2">
                {currentStages.map((stage) => (
                  <div
                    key={stage.id}
                    className="flex items-center justify-between rounded-md border p-3"
                  >
                    <div>
                      <p className="text-sm font-medium">{stage.name}</p>
                      {stage.event && (
                        <p className="text-xs text-muted-foreground">
                          Event: {stage.event.name}
                        </p>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDetach(stage.id)}
                      disabled={detachingId === stage.id}
                    >
                      {detachingId === stage.id ? (
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
            <h4 className="text-sm font-medium mb-2">Add Stage</h4>
            <Popover open={comboboxOpen} onOpenChange={setComboboxOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={comboboxOpen}
                  className="w-full justify-between"
                >
                  Select a stage...
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-full p-0" align="start">
                <Command>
                  <CommandInput placeholder="Search stages..." />
                  <CommandList>
                    <CommandEmpty>No stages found.</CommandEmpty>
                    <CommandGroup>
                      {availableStages.map((stage) => (
                        <CommandItem
                          key={stage.id}
                          value={stage.name}
                          onSelect={() => handleAttach(stage.id)}
                        >
                          {stage.name}
                          {stage.event && (
                            <span className="ml-2 text-xs text-muted-foreground">
                              ({stage.event.name})
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
