import { useState, useRef } from 'react'
import { toast } from 'sonner'
import { Upload, X, Loader2, ImageIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useUploadMedia } from '@/hooks/useMedia'

export function MediaPicker({ value, onChange, onUploadingChange, mediaType, label = 'Image', existingUrl }) {
  const [previewUrl, setPreviewUrl] = useState(null)
  const [isUploading, setIsUploading] = useState(false)
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
    setIsUploading(true)
    onUploadingChange?.(true)

    try {
      const result = await uploadMedia.mutateAsync({ file, type: mediaType })
      // Support both { data: { id } } (Laravel default) and { id } formats
      const mediaId = result?.data?.id || result?.id
      const mediaUrl = result?.data?.url || result?.url

      if (!mediaId) {
        throw new Error('Upload successful but no ID received')
      }

      onChange(mediaId)
      if (mediaUrl) {
        setPreviewUrl(mediaUrl)
      }
      toast.success(`${label} uploaded`)
    } catch (error) {
      setPreviewUrl(null)
      onChange('')
      toast.error(error.message || 'Upload failed')
    } finally {
      setIsUploading(false)
      onUploadingChange?.(false)
    }
  }

  function handleRemove() {
    setPreviewUrl(null)
    onChange('')
  }

  // Determine what to show: local preview, existing URL from props, or just the value (UUID)
  const showPreview = !!(previewUrl || value)
  const displayUrl = previewUrl || (value ? existingUrl : null)

  return (
    <div className="space-y-2">
      {showPreview ? (
        <div className="relative inline-block">
          <div className="relative h-32 w-48 rounded-lg border overflow-hidden bg-muted">
            {displayUrl ? (
              <>
                <img
                  src={displayUrl}
                  alt=""
                  className="h-full w-full object-cover"
                />
                {isUploading && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-[1px]">
                    <Loader2 className="h-8 w-8 animate-spin text-white" />
                  </div>
                )}
              </>
            ) : (
              <div className="flex items-center justify-center h-full">
                {isUploading ? (
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                ) : (
                  <ImageIcon className="h-8 w-8 text-muted-foreground" />
                )}
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
          disabled={isUploading}
        >
          {isUploading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Upload className="mr-2 h-4 w-4" />
          )}
          {isUploading ? 'Uploading...' : `Upload ${label}`}
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
