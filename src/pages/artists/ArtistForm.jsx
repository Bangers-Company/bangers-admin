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
import { Button } from '@/components/ui/button'
import { useCreateArtist, useUpdateArtist } from '@/hooks/useArtists'

const artistSchema = z.object({
  name: z.string().min(1, 'Name is required').max(255),
  bio: z.string().optional().default(''),
  genre: z.string().max(255).optional().default(''),
  image_media_id: z.string().optional().default(''),
})

export function ArtistForm({ open, onOpenChange, artist }) {
  const isEditing = !!artist
  const createArtist = useCreateArtist()
  const updateArtist = useUpdateArtist()

  const form = useForm({
    resolver: zodResolver(artistSchema),
    defaultValues: {
      name: '',
      bio: '',
      genre: '',
      image_media_id: '',
    },
  })

  useEffect(() => {
    if (artist) {
      form.reset({
        name: artist.name || '',
        bio: artist.bio || '',
        genre: artist.genre || '',
        image_media_id: artist.image?.id || '',
      })
    } else {
      form.reset({ name: '', bio: '', genre: '', image_media_id: '' })
    }
  }, [artist, form])

  async function onSubmit(values) {
    const data = {
      name: values.name,
      bio: values.bio || null,
      genre: values.genre || null,
      image_media_id: values.image_media_id || null,
    }

    try {
      if (isEditing) {
        await updateArtist.mutateAsync({ id: artist.id, data })
        toast.success('Artist updated')
      } else {
        await createArtist.mutateAsync(data)
        toast.success('Artist created')
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

  const isPending = createArtist.isPending || updateArtist.isPending

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit Artist' : 'Create Artist'}</DialogTitle>
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
                    <Input placeholder="Artist name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="bio"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Bio</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Artist biography" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="genre"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Genre</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Rock, Jazz, Electronic" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="image_media_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Image Media ID</FormLabel>
                  <FormControl>
                    <Input placeholder="UUID (optional)" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
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
