import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { Loader2, Trash2, ChevronsUpDown } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
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
import { useEvent } from '@/hooks/useEvents'
import { useStages, useCreateStage, useDeleteStage } from '@/hooks/useStages'

const stageSchema = z.object({
  name: z.string().min(1, 'Name is required').max(255),
  description: z.string().optional().default(''),
})

export function EventStagesDialog({ open, onOpenChange, event }) {
  const { data: eventData } = useEvent(event?.id)
  const { data: allStagesData } = useStages(1)
  const createStage = useCreateStage()
  const deleteStage = useDeleteStage()
  
  const [comboboxOpen, setComboboxOpen] = useState(false)
  const [deletingId, setDeletingId] = useState(null)

  const currentEvent = eventData?.data || event
  const currentStages = currentEvent?.stages || []
  const allStages = allStagesData?.data || []
  
  const availableStages = allStages.filter(
    (s) => !currentStages.some((cs) => cs.id === s.id)
  )

  const form = useForm({
    resolver: zodResolver(stageSchema),
    defaultValues: { name: '', description: '' },
  })

  async function onAddNewStage(values) {
    try {
      await createStage.mutateAsync({
        event_id: event.id,
        name: values.name,
        description: values.description || null,
      })
      toast.success('New stage created and added')
      form.reset()
    } catch (error) {
      toast.error(error.message || 'Failed to add stage')
    }
  }

  async function onAttachExistingStage(stageId) {
    const stage = allStages.find(s => s.id === stageId)
    try {
      await createStage.mutateAsync({
        event_id: event.id,
        stage_id: stageId,
        name: stage.name, // Required by validator but ignored by controller if stage_id is present
      })
      toast.success('Stage attached')
      setComboboxOpen(false)
    } catch (error) {
      toast.error(error.message || 'Failed to attach stage')
    }
  }

  async function handleDeleteStage(stageId) {
    setDeletingId(stageId)
    try {
      // In a real reusable scenario, we might want "Detach" vs "Delete"
      // For now, we follow the existing pattern which deletes the stage record.
      // If the user wants true reuse, they might need a detach endpoint.
      // But let's assume "Delete" here means "Remove from this event" for now.
      await deleteStage.mutateAsync(stageId)
      toast.success('Stage removed')
    } catch (error) {
      toast.error(error.message || 'Failed to remove stage')
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Manage Stages for {currentEvent?.name}</DialogTitle>
        </DialogHeader>
        <div className="space-y-6">
          <div>
            <h4 className="text-sm font-medium mb-2">Current Stages</h4>
            {currentStages.length === 0 ? (
              <p className="text-sm text-muted-foreground">No stages yet.</p>
            ) : (
              <div className="space-y-2">
                {currentStages.map((stage) => (
                  <div
                    key={stage.id}
                    className="flex items-center justify-between rounded-md border p-3"
                  >
                    <div>
                      <p className="text-sm font-medium">{stage.name}</p>
                      {stage.description && (
                        <p className="text-xs text-muted-foreground line-clamp-1">
                          {stage.description}
                        </p>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteStage(stage.id)}
                      disabled={deletingId === stage.id}
                    >
                      {deletingId === stage.id ? (
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
            <h4 className="text-sm font-medium mb-2">Attach Existing Stage</h4>
            <Popover open={comboboxOpen} onOpenChange={setComboboxOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={comboboxOpen}
                  className="w-full justify-between"
                >
                  Select a stage to reuse...
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-full p-0" align="start">
                <Command>
                  <CommandInput placeholder="Search stages..." />
                  <CommandList>
                    <CommandEmpty>No other stages found.</CommandEmpty>
                    <CommandGroup>
                      {availableStages.map((stage) => (
                        <CommandItem
                          key={stage.id}
                          value={stage.name}
                          onSelect={() => onAttachExistingStage(stage.id)}
                        >
                          {stage.name}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>

          <Separator />

          <div>
            <h4 className="text-sm font-medium mb-2">Create New Stage</h4>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onAddNewStage)} className="space-y-3">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Stage name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Optional description" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" size="sm" disabled={createStage.isPending} className="w-full">
                  {createStage.isPending && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Create & Add
                </Button>
              </form>
            </Form>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
