import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { Loader2, Trash2 } from 'lucide-react'
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
import { useEvent } from '@/hooks/useEvents'
import { useCreateStage, useDeleteStage } from '@/hooks/useStages'

const stageSchema = z.object({
  name: z.string().min(1, 'Name is required').max(255),
  description: z.string().optional().default(''),
})

export function EventStagesDialog({ open, onOpenChange, event }) {
  const { data: eventData } = useEvent(event?.id)
  const createStage = useCreateStage()
  const deleteStage = useDeleteStage()
  const [deletingId, setDeletingId] = useState(null)

  const currentEvent = eventData?.data || event
  const stages = currentEvent?.stages || []

  const form = useForm({
    resolver: zodResolver(stageSchema),
    defaultValues: { name: '', description: '' },
  })

  async function onAddStage(values) {
    try {
      await createStage.mutateAsync({
        event_id: event.id,
        name: values.name,
        description: values.description || null,
      })
      toast.success('Stage added')
      form.reset()
    } catch (error) {
      if (error.status === 422 && error.errors) {
        Object.entries(error.errors).forEach(([field, messages]) => {
          form.setError(field, { message: messages[0] })
        })
      } else {
        toast.error(error.message || 'Failed to add stage')
      }
    }
  }

  async function handleDeleteStage(stageId) {
    setDeletingId(stageId)
    try {
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
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Manage Stages for {currentEvent?.name}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <h4 className="text-sm font-medium mb-2">Current Stages</h4>
            {stages.length === 0 ? (
              <p className="text-sm text-muted-foreground">No stages yet.</p>
            ) : (
              <div className="space-y-2">
                {stages.map((stage) => (
                  <div
                    key={stage.id}
                    className="flex items-center justify-between rounded-md border p-3"
                  >
                    <div>
                      <p className="text-sm font-medium">{stage.name}</p>
                      {stage.description && (
                        <p className="text-xs text-muted-foreground">
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
            <h4 className="text-sm font-medium mb-2">Add Stage</h4>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onAddStage)} className="space-y-3">
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
                <Button type="submit" size="sm" disabled={createStage.isPending}>
                  {createStage.isPending && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Add Stage
                </Button>
              </form>
            </Form>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
