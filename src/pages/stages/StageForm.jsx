import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { Loader2, Check, ChevronsUpDown } from 'lucide-react'
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
import { cn } from '@/lib/utils'
import { useEvents } from '@/hooks/useEvents'
import { useCreateStage, useUpdateStage } from '@/hooks/useStages'

const stageSchema = z.object({
  event_id: z.string().min(1, 'Must select an event'),
  name: z.string().min(1, 'Name is required').max(255),
  description: z.string().optional().default(''),
})

export function StageForm({ open, onOpenChange, stage }) {
  const isEditing = !!stage
  const [eventComboboxOpen, setEventComboboxOpen] = useState(false)

  const { data: eventsData } = useEvents(1, 100)
  const createStage = useCreateStage()
  const updateStage = useUpdateStage()

  const events = eventsData?.data || []

  const form = useForm({
    resolver: zodResolver(stageSchema),
    defaultValues: { event_id: '', name: '', description: '' },
  })

  useEffect(() => {
    if (stage) {
      form.reset({
        event_id: stage.event_id || '',
        name: stage.name || '',
        description: stage.description || '',
      })
    } else {
      form.reset({ event_id: '', name: '', description: '' })
    }
  }, [stage, form])

  async function onSubmit(values) {
    const data = {
      event_id: values.event_id,
      name: values.name,
      description: values.description || null,
    }

    try {
      if (isEditing) {
        await updateStage.mutateAsync({ id: stage.id, data })
        toast.success('Stage updated')
      } else {
        await createStage.mutateAsync(data)
        toast.success('Stage created')
      }
      onOpenChange(false)
    } catch (error) {
      if (error.status === 422 && error.errors) {
        Object.entries(error.errors).forEach(([field, messages]) => {
          form.setError(field, { message: messages[0] })
        })
      } else {
        toast.error(error.message || 'An error occurred')
      }
    }
  }

  const isPending = createStage.isPending || updateStage.isPending
  const { isDirty } = form.formState
  const selectedEventId = form.watch('event_id')
  const selectedEvent = events.find((e) => e.id === selectedEventId)

  function handleOpenChange(open) {
    if (!open && isDirty) {
      if (!window.confirm('You have unsaved changes. Are you sure you want to close?')) {
        return
      }
    }
    onOpenChange(open)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit Stage' : 'Create Stage'}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="event_id"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Event</FormLabel>
                  <Popover open={eventComboboxOpen} onOpenChange={setEventComboboxOpen}>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          role="combobox"
                          className={cn(
                            'w-full justify-between',
                            !field.value && 'text-muted-foreground'
                          )}
                          disabled={isEditing}
                        >
                          {selectedEvent?.name || 'Select an event...'}
                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-full p-0" align="start">
                      <Command>
                        <CommandInput placeholder="Search events..." />
                        <CommandList>
                          <CommandEmpty>No events found.</CommandEmpty>
                          <CommandGroup>
                            {events.map((event) => (
                              <CommandItem
                                key={event.id}
                                value={event.name}
                                onSelect={() => {
                                  form.setValue('event_id', event.id)
                                  setEventComboboxOpen(false)
                                }}
                              >
                                <Check
                                  className={cn(
                                    'mr-2 h-4 w-4',
                                    event.id === field.value
                                      ? 'opacity-100'
                                      : 'opacity-0'
                                  )}
                                />
                                {event.name}
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Stage name" autoFocus {...field} />
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
                    <Textarea placeholder="Stage description" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => handleOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isEditing ? 'Update' : 'Create'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
