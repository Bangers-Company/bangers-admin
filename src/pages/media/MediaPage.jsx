import { useState, useEffect, useCallback, useRef } from 'react'
import { toast } from 'sonner'
import { Upload, Trash2, Loader2, ImageIcon, ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { PageHeader } from '@/components/shared/PageHeader'
import { DeleteDialog } from '@/components/shared/DeleteDialog'
import { useMediaList, useUploadMedia, useDeleteMedia } from '@/hooks/useMedia'

const MEDIA_TYPES = [
  { value: 'event_banner', label: 'Event Banner' },
  { value: 'artist_image', label: 'Artist Image' },
  { value: 'profile_picture', label: 'Profile Picture' },
]

function formatBytes(bytes) {
  if (!bytes) return '—'
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
}

export default function MediaPage() {
  const [page, setPage] = useState(1)
  const [mediaType, setMediaType] = useState('event_banner')
  const [dragActive, setDragActive] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [deletingMedia, setDeletingMedia] = useState(null)
  const fileInputRef = useRef(null)

  const { data, isLoading } = useMediaList(page)
  const uploadMedia = useUploadMedia()
  const deleteMedia = useDeleteMedia()

  useEffect(() => { document.title = 'Media — Bangers Admin' }, [])

  const mediaItems = data?.data || []
  const meta = data?.meta || {}

  const handleUpload = useCallback(async (file) => {
    if (!file) return
    if (!file.type.startsWith('image/')) {
      toast.error('Only image files are allowed')
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File must be under 5MB')
      return
    }
    try {
      await uploadMedia.mutateAsync({ file, type: mediaType })
      toast.success('Image uploaded')
    } catch (error) {
      toast.error(error.message || 'Upload failed')
    }
  }, [mediaType, uploadMedia])

  function handleDrop(e) {
    e.preventDefault()
    setDragActive(false)
    const file = e.dataTransfer.files?.[0]
    handleUpload(file)
  }

  function handleDragOver(e) {
    e.preventDefault()
    setDragActive(true)
  }

  function handleDragLeave(e) {
    e.preventDefault()
    setDragActive(false)
  }

  function handleFileInput(e) {
    const file = e.target.files?.[0]
    handleUpload(file)
    e.target.value = ''
  }

  async function handleDelete() {
    try {
      await deleteMedia.mutateAsync(deletingMedia.id)
      toast.success('Media deleted')
      setDeleteDialogOpen(false)
      setDeletingMedia(null)
    } catch (error) {
      toast.error(error.message || 'Failed to delete media')
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Media"
        description="Upload and manage images"
      />

      {/* Upload Zone */}
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <Select value={mediaType} onValueChange={setMediaType}>
            <SelectTrigger className="w-[200px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {MEDIA_TYPES.map((t) => (
                <SelectItem key={t.value} value={t.value}>
                  {t.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => fileInputRef.current?.click()}
          className={`
            flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-8 cursor-pointer transition-colors
            ${dragActive ? 'border-primary bg-primary/5' : 'border-muted-foreground/25 hover:border-primary/50'}
          `}
        >
          {uploadMedia.isPending ? (
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          ) : (
            <Upload className="h-8 w-8 text-muted-foreground" />
          )}
          <p className="mt-2 text-sm text-muted-foreground">
            {uploadMedia.isPending
              ? 'Uploading...'
              : 'Drag and drop an image here, or click to browse'}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            Max 5MB. Images only.
          </p>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileInput}
            className="hidden"
          />
        </div>
      </div>

      {/* Media Grid */}
      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="aspect-square rounded-lg" />
          ))}
        </div>
      ) : mediaItems.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-12">
          <ImageIcon className="h-12 w-12 text-muted-foreground" />
          <p className="mt-4 text-sm text-muted-foreground">
            No media uploaded yet. Upload your first image above.
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {mediaItems.map((media) => (
              <Card key={media.id} className="overflow-hidden group">
                <div className="relative aspect-square bg-muted">
                  <img
                    src={media.url}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                  <Button
                    variant="destructive"
                    size="icon"
                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8"
                    onClick={() => {
                      setDeletingMedia(media)
                      setDeleteDialogOpen(true)
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                <CardContent className="p-3 space-y-1">
                  <Badge variant="secondary" className="text-xs">
                    {MEDIA_TYPES.find((t) => t.value === media.type)?.label || media.type}
                  </Badge>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    {media.width && media.height && (
                      <span>{media.width}x{media.height}</span>
                    )}
                    <span>{formatBytes(media.size_bytes)}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Pagination */}
          {meta.last_page > 1 && (
            <div className="flex items-center justify-center gap-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Previous
              </Button>
              <span className="text-sm text-muted-foreground">
                Page {meta.current_page} of {meta.last_page}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.min(meta.last_page, p + 1))}
                disabled={page >= meta.last_page}
              >
                Next
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          )}
        </>
      )}

      <DeleteDialog
        open={deleteDialogOpen}
        onOpenChange={(open) => {
          setDeleteDialogOpen(open)
          if (!open) setDeletingMedia(null)
        }}
        onConfirm={handleDelete}
        title="Delete Media"
        description="Are you sure you want to delete this image? This action cannot be undone."
        isDeleting={deleteMedia.isPending}
      />
    </div>
  )
}
