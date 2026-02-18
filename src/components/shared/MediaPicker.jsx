import { useState, useRef } from 'react'
import { toast } from 'sonner'
import { Upload, X, Loader2, ImageIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useUploadMedia } from '@/hooks/useMedia'

export function MediaPicker({ value, onChange, mediaType, label = 'Image', existingUrl }) {
  const [previewUrl, setPreviewUrl] = useState(null)
  const fileInputRef = useRef(null)
  const uploadMedia = useUploadMedia()

  async function handleFileSelect(e) {
    const file = e.target.files?.[0]
    if (!file) return
    e.target.value = ''

    if (!file.type.startsWith('image/')) {
      toast.error('Only image files are allowed')
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File must be under 5MB')
      return
    }

    // Show local preview immediately
    const localUrl = URL.createObjectURL(file)
    setPreviewUrl(localUrl)

    try {
      const result = await uploadMedia.mutateAsync({ file, type: mediaType })
      onChange(result.id)
      // Use the uploaded URL instead of the blob URL
      if (result.url) {
        setPreviewUrl(result.url)
      }
      toast.success(`${label} uploaded`)
    } catch (error) {
      setPreviewUrl(null)
      onChange('')
      toast.error(error.message || 'Upload failed')
    }
  }

  function handleRemove() {
    setPreviewUrl(null)
    onChange('')
  }

  // Determine what to show: local preview, existing URL from props, or just the value (UUID)
  const displayUrl = previewUrl || existingUrl
  const showPreview = displayUrl || value

  return (
    <div className="space-y-2">
      {showPreview ? (
        <div className="relative inline-block">
          <div className="relative h-32 w-48 rounded-lg border overflow-hidden bg-muted">
            {displayUrl ? (
              <img
                src={displayUrl}
                alt=""
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex items-center justify-center h-full">
                <ImageIcon className="h-8 w-8 text-muted-foreground" />
              </div>
            )}
          </div>
          <Button
            type="button"
            variant="destructive"
            size="icon"
            className="absolute -top-2 -right-2 h-6 w-6"
            onClick={handleRemove}
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      ) : (
        <Button
          type="button"
          variant="outline"
          className="w-full"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploadMedia.isPending}
        >
          {uploadMedia.isPending ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Upload className="mr-2 h-4 w-4" />
          )}
          {uploadMedia.isPending ? 'Uploading...' : `Upload ${label}`}
        </Button>
      )}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />
    </div>
  )
}
