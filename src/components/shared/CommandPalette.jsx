import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router'
import { Calendar, Music, Mic } from 'lucide-react'
import {
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandSeparator,
} from '@/components/ui/command'
import { useSearch } from '@/hooks/useSearch'

export function CommandPalette({ open, onOpenChange }) {
  const navigate = useNavigate()
  const [inputValue, setInputValue] = useState('')
  const [debouncedQuery, setDebouncedQuery] = useState('')

  useEffect(() => {
    if (!open) {
      setInputValue('')
      setDebouncedQuery('')
    }
  }, [open])

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(inputValue)
    }, 300)
    return () => clearTimeout(timer)
  }, [inputValue])

  const { data, isLoading } = useSearch(debouncedQuery)

  const events = data?.events?.data || []
  const artists = data?.artists?.data || []
  const acts = data?.acts?.data || []
  const hasResults = events.length > 0 || artists.length > 0 || acts.length > 0

  function handleSelect(path) {
    onOpenChange(false)
    navigate(path)
  }

  return (
    <CommandDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Search"
      description="Search across events, artists, and acts"
    >
      <CommandInput
        placeholder="Type to search..."
        value={inputValue}
        onValueChange={setInputValue}
      />
      <CommandList>
        {debouncedQuery.length < 2 && (
          <CommandEmpty>Type to search...</CommandEmpty>
        )}
        {debouncedQuery.length >= 2 && isLoading && (
          <CommandEmpty>Searching...</CommandEmpty>
        )}
        {debouncedQuery.length >= 2 && !isLoading && !hasResults && (
          <CommandEmpty>No results found.</CommandEmpty>
        )}
        {events.length > 0 && (
          <CommandGroup heading="Events">
            {events.map((event) => (
              <CommandItem
                key={event.id}
                value={`event-${event.name}`}
                onSelect={() => handleSelect('/events')}
              >
                <Calendar className="mr-2 h-4 w-4" />
                <span>{event.name}</span>
                {event.location && (
                  <span className="ml-auto text-xs text-muted-foreground">{event.location}</span>
                )}
              </CommandItem>
            ))}
          </CommandGroup>
        )}
        {events.length > 0 && (artists.length > 0 || acts.length > 0) && (
          <CommandSeparator />
        )}
        {artists.length > 0 && (
          <CommandGroup heading="Artists">
            {artists.map((artist) => (
              <CommandItem
                key={artist.id}
                value={`artist-${artist.name}`}
                onSelect={() => handleSelect('/artists')}
              >
                <Music className="mr-2 h-4 w-4" />
                <span>{artist.name}</span>
                {artist.genre && (
                  <span className="ml-auto text-xs text-muted-foreground">{artist.genre}</span>
                )}
              </CommandItem>
            ))}
          </CommandGroup>
        )}
        {artists.length > 0 && acts.length > 0 && (
          <CommandSeparator />
        )}
        {acts.length > 0 && (
          <CommandGroup heading="Acts">
            {acts.map((act) => (
              <CommandItem
                key={act.id}
                value={`act-${act.name}`}
                onSelect={() => handleSelect('/acts')}
              >
                <Mic className="mr-2 h-4 w-4" />
                <span>{act.name}</span>
              </CommandItem>
            ))}
          </CommandGroup>
        )}
      </CommandList>
    </CommandDialog>
  )
}
