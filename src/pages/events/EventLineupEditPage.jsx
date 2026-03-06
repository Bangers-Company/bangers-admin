import { useState, useMemo, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router'
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  defaultDropAnimationSideEffects,
  useDndContext
} from '@dnd-kit/core'
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy
} from '@dnd-kit/sortable'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import { useActs } from '@/hooks/useActs'

import { useEvent, useSyncEventLineup } from '@/hooks/useEvents'
import { PageHeader } from '@/components/shared/PageHeader'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Loader2, ArrowLeft, Save, Plus } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

// Random ID generator for items
function generateId() {
  return Math.random().toString(36).substr(2, 9)
}

function AddActModal({ open, onOpenChange, onAdd }) {
  const [search, setSearch] = useState('')
  const { data: actsData } = useActs(1, { search, per_page: -1 })
  const allActs = actsData?.data || []

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Add Act to Line-up (Uncategorized)</DialogTitle>
        </DialogHeader>
        <Command shouldFilter={false} className="border rounded-md">
          <CommandInput
            placeholder="Search all acts..."
            value={search}
            onValueChange={setSearch}
          />
          <CommandList className="max-h-[300px] overflow-y-auto">
            <CommandEmpty>No acts found.</CommandEmpty>
            <CommandGroup>
              {allActs.map(act => (
                <CommandItem key={act.id} onSelect={() => onAdd(act)}>
                  <div className="flex flex-col gap-1 w-full">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="font-medium">{act.name}</span>
                      {act.is_live && <Badge variant="destructive" className="h-4 px-1 text-[8px] uppercase font-bold tracking-wider leading-none">Live</Badge>}
                    </div>
                    {act.artists?.length > 0 && (
                      <span className="text-xs text-muted-foreground">
                        {act.artists.map(a => a.name).join(', ')}
                      </span>
                    )}
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </DialogContent>
    </Dialog>
  )
}

// Custom Sortable Item Component
function SortableActItem({ item }) {
  const data = useMemo(() => ({ type: 'Act', item }), [item])
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.dragId, data })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
    cursor: 'grab',
  }

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <Card className="shadow-sm border-l-4 border-l-primary hover:bg-muted/30 transition-colors mb-2">
        <CardHeader className="p-2 space-y-1">
          <CardTitle className="text-sm font-bold leading-none flex items-center gap-1.5 flex-wrap">
            <span>{item.name}</span>
            {item.is_live && <Badge variant="destructive" className="h-4 px-1 text-[8px] uppercase font-bold tracking-wider leading-none">Live</Badge>}
          </CardTitle>
          <div className="flex flex-wrap gap-1">
            {item.artists?.map(artist => (
              <Badge key={artist.id} variant="secondary" className="text-[10px] h-4 px-1.5 py-0 font-normal">
                {artist.name}
              </Badge>
            ))}
          </div>
        </CardHeader>
      </Card>
    </div>
  )
}

import { useDroppable } from '@dnd-kit/core'

function DroppableColumn({ col, children }) {
  const { active } = useDndContext()
  const data = useMemo(() => ({ type: 'Column', col }), [col])
  const { setNodeRef, isOver } = useDroppable({
    id: col.id,
    data
  })

  const isActDragging = active?.data?.current?.type === 'Act'

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "flex flex-col w-[300px] shrink-0 h-[600px] rounded-md border p-3 flex-1 transition-all duration-200",
        isOver && isActDragging ? "bg-primary/20 ring-4 ring-inset ring-primary/40 shadow-[inset_0_0_40px_rgba(var(--primary-rgb),0.1)] border-primary" : "bg-muted/20"
      )}
    >
      <div className="mb-4 shrink-0">
        <h3 className="text-lg font-bold tracking-tight text-primary uppercase line-clamp-1">
          {col.title}
        </h3>
        <p className="text-xs text-muted-foreground font-medium">
          {col.description}
        </p>
      </div>

      <div className="flex-1 overflow-y-auto pr-1 pb-10">
        {children}
        {isOver && isActDragging && (
          <div className="h-16 border-2 border-dashed border-primary bg-primary/10 rounded-md animate-pulse mt-2 flex flex-col items-center justify-center gap-1">
            <div className="h-1.5 w-1.5 rounded-full bg-primary" />
            <span className="text-[10px] font-black text-primary uppercase tracking-tighter">Drop at end</span>
          </div>
        )}
      </div>
    </div>
  )
}

function ActItemOverlay({ item }) {
  return (
    <Card className="shadow-lg border-l-4 border-l-primary bg-background/90 opacity-80 rotate-2 scale-105 cursor-grabbing mb-2">
      <CardHeader className="p-2 space-y-1">
        <CardTitle className="text-sm font-bold leading-none flex items-center gap-1.5 flex-wrap">
          <span>{item.name}</span>
          {item.is_live && <Badge variant="destructive" className="h-4 px-1 text-[8px] uppercase font-bold tracking-wider leading-none">Live</Badge>}
        </CardTitle>
        <div className="flex flex-wrap gap-1">
          {item.artists?.map(artist => (
            <Badge key={artist.id} variant="secondary" className="text-[10px] h-4 px-1.5 py-0 font-normal">
              {artist.name}
            </Badge>
          ))}
        </div>
      </CardHeader>
    </Card>
  )
}

export default function EventLineupEditPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { data: response, isLoading: isEventLoading } = useEvent(id)
  const syncLineup = useSyncEventLineup()

  const event = response?.data

  const [columns, setColumns] = useState({})
  const [activeItem, setActiveItem] = useState(null)
  const [isInitialized, setIsInitialized] = useState(false)
  const [addActModalOpen, setAddActModalOpen] = useState(false)
  const [selectedDay, setSelectedDay] = useState('')

  // Extract unique days
  const days = useMemo(() => {
    if (!event) return []
    const start = new Date(event.start_date)
    const end = new Date(event.end_date)
    const dayList = []
    let current = new Date(start)
    while (current <= end) {
      dayList.push(new Date(current).toISOString().split('T')[0])
      current.setDate(current.getDate() + 1)
    }
    return dayList
  }, [event])

  // Initialize selectedDay
  useEffect(() => {
    if (days.length > 0 && !selectedDay) {
      setSelectedDay(days[0])
    }
  }, [days, selectedDay])

  // Initialize columns and items
  useEffect(() => {
    if (!event || isInitialized) return

    const initialColumns = {}

    // 1. Uncategorized Column
    initialColumns['uncategorized'] = {
      id: 'uncategorized',
      title: 'Uncategorized',
      description: 'Acts without day or stage',
      stageId: null,
      date: null,
      items: []
    }

    // 2. Day/Stage Columns
    const stages = event.stages || []

    let start = new Date(event.start_date)
    let end = new Date(event.end_date)
    const dayList = []
    let current = new Date(start)
    while (current <= end) {
      dayList.push(new Date(current).toISOString().split('T')[0])
      current.setDate(current.getDate() + 1)
    }

    dayList.forEach(day => {
      const dateObj = new Date(day)
      const dateStr = dateObj.toLocaleDateString(undefined, { weekday: 'short', day: 'numeric', month: 'short' })

      stages.forEach(stage => {
        const colId = `${stage.id}_${day}`
        initialColumns[colId] = {
          id: colId,
          title: stage.name,
          description: dateStr,
          stageId: stage.id,
          date: day,
          items: []
        }
      })
    })

    // 3. Populate acts
    const acts = event.acts || []
    acts.forEach(act => {
      const item = { ...act, dragId: generateId() }
      const colId = (act.stage_id && act.date) ? `${act.stage_id}_${act.date}` : null

      if (colId && initialColumns[colId]) {
        initialColumns[colId].items.push(item)
      } else {
        initialColumns['uncategorized'].items.push(item)
      }
    })

    setColumns(initialColumns)
    setIsInitialized(true)
  }, [event, isInitialized])

  // DnD Sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const handleAddAct = (act) => {
    // Check if the act already exists in ANY column (we only check the original id, not dragId)
    const existingCol = Object.values(columns).find(col =>
      col.items.some(i => i.id === act.id)
    )
    if (existingCol) {
      toast.error(`${act.name} is already in the lineup!`)
      return
    }

    const newItem = { ...act, dragId: generateId() }

    setColumns(prev => ({
      ...prev,
      uncategorized: {
        ...prev.uncategorized,
        items: [...prev.uncategorized.items, newItem]
      }
    }))

    toast.success(`Added ${act.name} to Uncategorized`)
  }

  const handleDragStart = (event) => {
    const { active } = event
    const activeColId = findColumnOfItem(active.id)
    if (activeColId) {
      const item = columns[activeColId].items.find(i => i.dragId === active.id)
      setActiveItem(item)
    }
  }

  const findColumnOfItem = (itemId) => {
    return Object.keys(columns).find(colId =>
      columns[colId].items.some(item => item.dragId === itemId)
    )
  }

  const handleDragOver = (event) => {
    const { active, over } = event
    if (!over) return

    setColumns(prev => {
      const activeId = active.id
      const overId = over.id

      const findCol = (id) => Object.keys(prev).find(c => prev[c].items.some(i => i.dragId === id))

      const activeColumnId = findCol(activeId)
      const overColumnId = prev[overId] ? overId : findCol(overId)

      if (!activeColumnId || !overColumnId || activeColumnId === overColumnId) {
        return prev
      }

      const activeItems = prev[activeColumnId].items
      const overItems = prev[overColumnId].items
      const activeIndex = activeItems.findIndex(i => i.dragId === activeId)
      const overIndex = prev[overId] ? overItems.length + 1 : overItems.findIndex(i => i.dragId === overId)

      if (activeIndex === -1) return prev

      return {
        ...prev,
        [activeColumnId]: {
          ...prev[activeColumnId],
          items: activeItems.filter(i => i.dragId !== activeId)
        },
        [overColumnId]: {
          ...prev[overColumnId],
          items: [
            ...overItems.slice(0, overIndex),
            activeItems[activeIndex],
            ...overItems.slice(overIndex)
          ]
        }
      }
    })
  }

  const handleDragEnd = (event) => {
    const { active, over } = event
    setActiveItem(null)
    if (!over) return

    setColumns(prev => {
      const activeId = active.id
      const overId = over.id

      const findCol = (id) => Object.keys(prev).find(c => prev[c].items.some(i => i.dragId === id))

      const activeColumnId = findCol(activeId)
      const overColumnId = prev[overId] ? overId : findCol(overId)

      if (!activeColumnId || !overColumnId || activeColumnId !== overColumnId) {
        return prev
      }

      const activeIndex = prev[activeColumnId].items.findIndex(i => i.dragId === activeId)
      const overIndex = prev[overColumnId].items.findIndex(i => i.dragId === overId)

      if (activeIndex !== overIndex && activeIndex !== -1 && overIndex !== -1) {
        return {
          ...prev,
          [activeColumnId]: {
            ...prev[activeColumnId],
            items: arrayMove(prev[activeColumnId].items, activeIndex, overIndex)
          }
        }
      }
      return prev
    })
  }

  const handleSave = async () => {
    const payloadItems = []

    Object.values(columns).forEach(col => {
      col.items.forEach(item => {
        payloadItems.push({
          act_id: item.id, // Original act ID
          stage_id: col.stageId,
          date: col.date
        })
      })
    })

    try {
      await syncLineup.mutateAsync({ id: event.id, lineup: payloadItems })
      toast.success('Lineup saved successfully')
      navigate(`/events/${event.id}/lineup`)
    } catch (error) {
      console.error('Failed to save lineup:', error)
      toast.error('Failed to save lineup')
    }
  }

  if (isEventLoading || !isInitialized) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  const renderColumn = (col) => (
    <DroppableColumn key={col.id} col={col}>
      <SortableContext
        id={col.id}
        items={col.items.map(i => i.dragId)}
        strategy={verticalListSortingStrategy}
      >
        {col.items.map(item => (
          <SortableActItem key={item.dragId} item={item} />
        ))}
      </SortableContext>
      {col.items.length === 0 && (
        <div className="h-20 border-2 border-dashed border-muted flex items-center justify-center rounded-md">
          <span className="text-xs text-muted-foreground">Drop acts here</span>
        </div>
      )}
    </DroppableColumn>
  )

  const dropAnimation = {
    sideEffects: defaultDropAnimationSideEffects({
      styles: {
        active: {
          opacity: '0.4',
        },
      },
    }),
  }

  // Split out uncategorized column
  const uncategorizedCol = columns['uncategorized']

  // Filter columns to only show the currently selected day
  const visibleStageCols = Object.values(columns).filter(c => c.id !== 'uncategorized' && c.date === selectedDay)

  return (
    <div className="space-y-6 flex flex-col h-[calc(100vh-6rem)]">
      <div className="flex items-center justify-between shrink-0">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(`/events/${event.id}/lineup`)}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <PageHeader
            title={`Edit Line-up: ${event.name}`}
            description="Drag acts to stages, or to Uncategorized to move them between days."
          />
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setAddActModalOpen(true)} className="gap-2">
            <Plus className="h-4 w-4" /> Add Act
          </Button>
          <Button onClick={handleSave} disabled={syncLineup.isPending} className="gap-2">
            {syncLineup.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Save Lineup
          </Button>
        </div>
      </div>

      <AddActModal open={addActModalOpen} onOpenChange={setAddActModalOpen} onAdd={handleAddAct} />

      {days.length > 1 && (
        <div className="shrink-0 flex gap-1 bg-muted/50 p-1 rounded-md overflow-x-auto">
          {days.map((day) => {
            const dateObj = new Date(day)
            const dayName = dateObj.toLocaleDateString(undefined, { weekday: 'long' })
            const dateStr = dateObj.toLocaleDateString(undefined, { day: 'numeric', month: 'short' })
            return (
              <Button
                key={day}
                variant={selectedDay === day ? "default" : "ghost"}
                className="flex-1 min-w-[120px] h-12 flex flex-col items-center gap-0.5"
                onClick={() => setSelectedDay(day)}
              >
                <span className="text-[10px] uppercase font-bold tracking-wider opacity-80">{dayName}</span>
                <span className="text-sm font-bold">{dateStr}</span>
              </Button>
            )
          })}
        </div>
      )}

      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <div className="flex-1 overflow-x-auto overflow-y-hidden border rounded-lg bg-card shadow-sm flex relative">

          {/* Main timeline scroller for the selected day */}
          <div className="flex gap-4 p-4 min-w-max h-full">
            {visibleStageCols.map(renderColumn)}
          </div>

          {/* Sticky Uncategorized sidebar */}
          <div className="sticky right-0 top-0 h-full p-4 bg-background border-l shadow-2xl z-10 w-[332px] shrink-0">
            {uncategorizedCol && renderColumn(uncategorizedCol)}
          </div>

        </div>

        <DragOverlay dropAnimation={dropAnimation}>
          {activeItem ? <ActItemOverlay item={activeItem} /> : null}
        </DragOverlay>
      </DndContext>
    </div>
  )
}
