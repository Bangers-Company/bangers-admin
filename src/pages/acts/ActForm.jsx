import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'
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
import { Checkbox } from '@/components/ui/checkbox'
import { Button } from '@/components/ui/button'
import { useCreateAct, useUpdateAct } from '@/hooks/useActs'

const actSchema = z.object({
  name: z.string().min(1, 'Name is required').max(255),
  description: z.string().optional().default(''),
  is_live: z.boolean().default(false),
})

export function ActForm({ open, onOpenChange, act }) {
  const isEditing = !!act
  const createAct = useCreateAct()
  const updateAct = useUpdateAct()

  const form = useForm({
    resolver: zodResolver(actSchema),
    defaultValues: { name: '', description: '', is_live: false },
  })

  useEffect(() => {
    if (act) {
      form.reset({
        name: act.name || '',
        description: act.description || '',
        is_live: act.is_live ?? false,
      })
    } else {
      form.reset({ name: '', description: '', is_live: false })
    }
  }, [act, form])

  async function onSubmit(values) {
    const data = {
      name: values.name,
      description: values.description || null,
      is_live: values.is_live,
    }

    try {
      if (isEditing) {
        await updateAct.mutateAsync({ id: act.id, data })
        toast.success('Act updated')
      } else {
        await createAct.mutateAsync(data)
        toast.success('Act created')
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

  const isPending = createAct.isPending || updateAct.isPending
  const { isDirty } = form.formState

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
          <DialogTitle>{isEditing ? 'Edit Act' : 'Create Act'}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Act name" autoFocus {...field} />
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
                    <Textarea placeholder="Act description" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="is_live"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>
                      Live Act
                    </FormLabel>
                    <p className="text-sm text-muted-foreground">
                      Mark this act as a LIVE performance
                    </p>
                  </div>
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
