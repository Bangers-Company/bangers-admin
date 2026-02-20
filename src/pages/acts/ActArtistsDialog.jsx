import { useState } from 'react'
import { toast } from 'sonner'
import { Loader2, Trash2, Check, ChevronsUpDown } from 'lucide-react'
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
import { cn } from '@/lib/utils'
import { useArtists } from '@/hooks/useArtists'
import { useAttachArtist, useDetachArtist } from '@/hooks/useActs'

export function ActArtistsDialog({ open, onOpenChange, act }) {
  const [search, setSearch] = useState('')
  const [comboboxOpen, setComboboxOpen] = useState(false)
  const [detachingId, setDetachingId] = useState(null)

  const { data: artistsData } = useArtists(1, { search, per_page: -1 })
  const attachArtist = useAttachArtist()
  const detachArtist = useDetachArtist()

  const currentArtists = act?.artists || []
  const allArtists = artistsData?.data || []
  const availableArtists = allArtists.filter(
    (a) => !currentArtists.some((ca) => ca.id === a.id)
  )

  async function handleAttach(artistId) {
    try {
      await attachArtist.mutateAsync({ actId: act.id, artistId })
      toast.success('Artist attached')
      setComboboxOpen(false)
    } catch (error) {
      toast.error(error.message || 'Failed to attach artist')
    }
  }

  async function handleDetach(artistId) {
    setDetachingId(artistId)
    try {
      await detachArtist.mutateAsync({ actId: act.id, artistId })
      toast.success('Artist detached')
    } catch (error) {
      toast.error(error.message || 'Failed to detach artist')
    } finally {
      setDetachingId(null)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Manage Artists for {act?.name}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <h4 className="text-sm font-medium mb-2">Current Artists</h4>
            {currentArtists.length === 0 ? (
              <p className="text-sm text-muted-foreground">No artists attached.</p>
            ) : (
              <div className="space-y-2">
                {currentArtists.map((artist) => (
                  <div
                    key={artist.id}
                    className="flex items-center justify-between rounded-md border p-3"
                  >
                    <div>
                      <p className="text-sm font-medium">{artist.name}</p>
                      {artist.genre && (
                        <p className="text-xs text-muted-foreground">{artist.genre}</p>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDetach(artist.id)}
                      disabled={detachingId === artist.id}
                    >
                      {detachingId === artist.id ? (
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
            <h4 className="text-sm font-medium mb-2">Add Artist</h4>
            <Popover open={comboboxOpen} onOpenChange={setComboboxOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={comboboxOpen}
                  className="w-full justify-between"
                >
                  Select an artist...
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-full p-0" align="start">
                <Command shouldFilter={false}>
                  <CommandInput 
                    placeholder="Search artists..." 
                    value={search}
                    onValueChange={setSearch}
                  />
                  <CommandList>
                    <CommandEmpty>No artists found.</CommandEmpty>
                    <CommandGroup>
                      {availableArtists.map((artist) => (
                        <CommandItem
                          key={artist.id}
                          value={artist.name}
                          onSelect={() => handleAttach(artist.id)}
                        >
                          {artist.name}
                          {artist.genre && (
                            <span className="ml-2 text-xs text-muted-foreground">
                              {artist.genre}
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
