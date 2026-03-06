import { useState, useMemo, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router'
import {
  DndContext,
  DragOverlay,
  closestCorners,
  pointerWithin,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  useDroppable,
  useDndContext
} from '@dnd-kit/core'
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
import { useEvent } from '@/hooks/useEvents'
import { useTimetable, useUpdateTimetable } from '@/hooks/useTimetables'
import { PageHeader } from '@/components/shared/PageHeader'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Loader2, ArrowLeft, Save, Plus, GripVertical, Clock, Calendar } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

const ROW_HEIGHT = 240 // 1 hour = 240px -> 1 minute = 4px
const SCALE = ROW_HEIGHT / 60
const GRID_HEIGHT = 17 * ROW_HEIGHT // 9 AM to 2 AM = 17 hours

const formatTimeMinutes = (minutes) => {
  const totalMinutes = (9 * 60) + minutes
  const hours = Math.floor(totalMinutes / 60) % 24
  const mins = totalMinutes % 60
  return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`
}

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
          <DialogTitle>Add Act to Pool</DialogTitle>
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

function TimetableActItem({ item, onResize, onRemove }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: item.dragId,
    data: { type: 'Act', item }
  })

  // item.top is minutes from 9 AM
  // item.duration is minutes
  const style = {
    transform: CSS.Translate.toString(transform),
    top: `${item.top}px`,
    height: `${item.duration}px`,
    transition,
    opacity: isDragging ? 0.4 : 1,
    position: 'absolute',
    left: '4px',
    right: '4px',
    zIndex: isDragging ? 50 : 10,
  }

  const handleResizeStart = (e) => {
    e.stopPropagation()
    e.preventDefault()
    const startY = e.pageY
    const startHeight = item.duration

    const onMouseMove = (moveEvent) => {
      const delta = moveEvent.pageY - startY
      const newHeight = Math.max(15 * SCALE, (startHeight * SCALE) + delta)
      onResize(item.dragId, newHeight)
    }

    const onMouseUp = () => {
      document.removeEventListener('mousemove', onMouseMove)
      document.removeEventListener('mouseup', onMouseUp)
    }

    document.addEventListener('mousemove', onMouseMove)
    document.addEventListener('mouseup', onMouseUp)
  }

  return (
    <div
      ref={setNodeRef}
      style={{
        ...style,
        top: `${item.top * SCALE}px`,
        height: `${item.duration * SCALE}px`,
        zIndex: isDragging ? 50 : 10
      }}
      {...attributes}
      className="group"
    >
      <Card className="h-full border-l-4 border-l-primary shadow-sm hover:shadow-md transition-shadow relative bg-card shadow-inner min-h-[50px]">
        <div {...listeners} className="absolute left-0 top-0 bottom-0 w-7 flex items-center justify-center cursor-grab active:cursor-grabbing text-muted-foreground/40 hover:text-muted-foreground transition-colors shrink-0 bg-muted/20 border-r z-20">
          <GripVertical className="h-4 w-4" />
        </div>

        <div className="pl-7 p-2 h-full flex flex-col justify-start gap-1 pb-4 min-w-[120px]">
          <div className="space-y-1">
            <h4 className="text-[15px] font-bold leading-tight text-foreground line-clamp-4 flex flex-wrap gap-1 items-center">
              <span>{item.name}</span>
              {item.is_live && <Badge variant="destructive" className="h-4 px-1 text-[8px] uppercase font-bold tracking-wider leading-none">Live</Badge>}
            </h4>
            <p className="text-[13px] text-foreground font-black tracking-tight whitespace-nowrap bg-background/60 w-fit px-1.5 py-0.5 rounded border border-primary/20">
              {formatTime(item.top)} - {formatTime(item.top + item.duration)}
            </p>
          </div>

          <div className="flex flex-wrap gap-1 max-h-[40%] overflow-hidden">
            {item.artists?.map(a => (
              <Badge key={a.id} variant="secondary" className="px-1 py-0 h-3 text-[8px]">{a.name}</Badge>
            ))}
          </div>

          <button
            onClick={() => onRemove(item.dragId)}
            className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity p-0.5 hover:bg-destructive/10 rounded text-destructive"
          >
            <Plus className="h-3 w-3 rotate-45" />
          </button>
        </div>

        {/* Resize Handle */}
        <div
          onMouseDown={handleResizeStart}
          className="absolute bottom-0 left-0 right-0 h-2 cursor-ns-resize hover:bg-primary/20 transition-colors z-20"
        >
          <div className="w-8 h-1 bg-muted-foreground/20 rounded-full mx-auto mt-0.5" />
        </div>
      </Card>
    </div>
  )
}

function PoolActItem({ item, stages }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: item.dragId,
    data: { type: 'Act', item }
  })

  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
    cursor: 'grab',
  }

  // Find suggested stage from lineup
  const suggestedStage = stages?.find(s => s.id === item.stageId)

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners} className="shrink-0">
      <Card className="p-2.5 border-l-4 border-l-muted hover:bg-muted/30 transition-colors w-48 shadow-sm">
        <div className="flex items-center gap-2">
          <GripVertical className="h-4 w-4 text-muted-foreground shrink-0" />
          <div className="flex flex-col min-w-0 flex-1 py-0.5">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-[13px] font-bold truncate leading-tight text-foreground">{item.name}</span>
              {item.is_live && <Badge variant="destructive" className="h-4 px-1 text-[8px] uppercase font-bold tracking-wider leading-none shrink-0">Live</Badge>}
            </div>
            {suggestedStage && (
              <Badge variant="outline" className="mt-1 h-4 text-[9px] px-1 py-0 w-fit border-primary/20 bg-primary/5 text-primary font-bold">
                Lineup: {suggestedStage.name}
              </Badge>
            )}
            {!suggestedStage && (
              <span className="text-[10px] text-muted-foreground truncate italic">
                Not in lineup
              </span>
            )}
          </div>
        </div>
      </Card>
    </div>
  )
}

function DroppableStageColumn({ stage, date, items, onResize, onRemove, scrollRef, pool }) {
  const { active, over } = useDndContext()
  const { setNodeRef, isOver } = useDroppable({
    id: `${stage.id}_${date}`,
    data: { type: 'Stage', stage, date }
  })

  // Filter pool acts for THIS stage and THIS date
  const stagePool = pool.filter(p => p.stageId === stage.id && p.date === date)
  const currentPoolAct = stagePool[0] // Only show the first one (carousel)

  // Determine if WE are the target (directly or via a child Act)
  const isDirectlyOver = isOver
  const isOverChild = over?.data?.current?.type === 'Act' &&
    (over.data.current.item?.stageId === stage.id || over.data.current.item?.stage_id === stage.id) &&
    over.data.current.item?.date === date

  const showVisualOver = (isDirectlyOver || isOverChild) && active?.data?.current?.type === 'Act'

  return (
    <div className="flex flex-col w-[240px] shrink-0 border-r last:border-r-0 bg-muted/5">
      {/* Pool Area - Outside time slots */}
      <div className="px-2 py-2 border-b bg-primary/5 h-[95px] flex flex-col justify-center shrink-0">
        {currentPoolAct ? (
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between px-1">
              <span className="text-[9px] font-black text-primary/60 uppercase tracking-tighter">Lineup Acts</span>
              <Badge variant="outline" className="h-4 text-[9px] px-1 font-black bg-background border-primary/20 text-primary">
                {stagePool.length} to assign
              </Badge>
            </div>
            <div className="relative group">
              {stagePool.length > 1 && (
                <>
                  <div className="absolute -right-1 -bottom-1 w-full h-full bg-muted border rounded-md -z-10 opacity-50" />
                  <div className="absolute -right-2 -bottom-2 w-full h-full bg-muted border rounded-md -z-20 opacity-30" />
                </>
              )}
              <PoolActItem item={currentPoolAct} />
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-2 border-2 border-dashed rounded-md bg-background/20 opacity-40 h-[60px]">
            <Clock className="h-3 w-3 mb-0.5 text-muted-foreground" />
            <span className="text-[8px] font-black text-muted-foreground uppercase tracking-widest text-center px-1 leading-tight">
              All assigned
            </span>
          </div>
        )}
      </div>

      <div className="h-14 flex flex-col justify-center px-4 border-b sticky top-0 bg-background z-20">
        <h3 className="text-xs font-bold uppercase tracking-wider truncate text-primary">{stage.name}</h3>
      </div>

      <div
        ref={setNodeRef}
        data-grid-id={`${stage.id}_${date}`}
        className={cn(
          "relative flex-1 transition-all duration-300",
          showVisualOver && "bg-primary/5 ring-4 ring-inset ring-primary/20"
        )}
        style={{ height: `${GRID_HEIGHT}px` }}
      >
        {/* Hour guide lines */}
        {Array.from({ length: 18 * 4 }).map((_, i) => (
          <div
            key={i}
            className={cn(
              "absolute left-0 right-0 z-0",
              i % 4 === 0 ? "border-b border-muted/60" : "border-b border-dashed border-muted/20"
            )}
            style={{ top: `${i * (ROW_HEIGHT / 4)}px`, height: '1px' }}
          />
        ))}

        {showVisualOver && (
          <DropPreview active={active} over={over} items={items} />
        )}

        {items.map(item => (
          <TimetableActItem
            key={item.dragId}
            item={item}
            onResize={onResize}
            onRemove={onRemove}
          />
        ))}
      </div>
    </div>
  )
}

const getSnappedTime = (minutes, items, activeDragId, duration) => {
  const SNAP_THRESHOLD = 15 // minutes

  // 1. Grid snapping (15 min)
  let snapped = Math.round(minutes / 15) * 15

  // 2. Neighbor snapping (magnetic)
  const myEnd = snapped + duration

  let bestSnap = snapped
  let minDelta = SNAP_THRESHOLD

  items.forEach(item => {
    if (item.dragId === activeDragId) return

    // Snap our START to their END
    const theirEnd = item.top + item.duration
    const deltaStart = Math.abs(minutes - theirEnd)
    if (deltaStart < minDelta) {
      minDelta = deltaStart
      bestSnap = theirEnd
    }

    // Snap our END to their START
    const deltaEnd = Math.abs((minutes + duration) - item.top)
    if (deltaEnd < minDelta) {
      minDelta = deltaEnd
      bestSnap = item.top - duration
    }
  })

  return Math.max(0, Math.min(bestSnap, 1020 - duration))
}

function DropPreview({ active, over, items }) {
  const activeItem = active?.data?.current?.item
  const activeRect = active?.rect?.current?.translated || active?.rect?.current?.initial

  // Find the column rect even if 'over' is an Act
  const overData = over?.data?.current
  const targetStageId = overData?.stage?.id || overData?.item?.stageId
  const targetDate = overData?.date || overData?.item?.date

  // We need the Rect of the droppable area (the Stage column grid)
  // Since we can be over a child, we find the column by ID
  const gridArea = document.querySelector(`[data-grid-id="${targetStageId}_${targetDate}"]`)
  const overRect = gridArea?.getBoundingClientRect()

  if (!activeItem || !activeRect || !overRect) return null

  // Calculate the local Y coordinate within the droppable area
  const topPx = activeRect.top - overRect.top
  const duration = activeItem.duration || 60

  let minutes = topPx / SCALE

  // Use magnetic snapping
  const snappedMinutes = getSnappedTime(minutes, items, active.id, duration)

  return (
    <div
      className="absolute left-0 right-0 border-[4px] border-primary border-dashed rounded-lg z-[300] pointer-events-none animate-pulse bg-primary/20"
      style={{
        top: `${snappedMinutes * SCALE}px`,
        height: `${duration * SCALE}px`,
        boxShadow: '0 0 50px rgba(var(--primary-rgb), 0.4)'
      }}
    >
      <div className="absolute inset-x-0 -top-8 flex justify-center">
        <div className="bg-primary text-primary-foreground px-3 py-1 rounded-md text-[11px] font-black shadow-2xl ring-2 ring-white/50 whitespace-nowrap">
          {formatTimeMinutes(snappedMinutes)} - {formatTimeMinutes(snappedMinutes + duration)}
        </div>
      </div>
    </div>
  )
}

function formatTime(minutes) {
  let h = Math.floor(minutes / 60) + 9
  let m = minutes % 60

  const hDisplay = h >= 24 ? h - 24 : h
  return `${hDisplay.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`
}

export default function EventTimetableEditPage() {
  const { eventId, timetableId } = useParams()
  const navigate = useNavigate()

  const { data: eventResponse, isLoading: isEventLoading } = useEvent(eventId)
  const { data: timetable, isLoading: isTimetableLoading } = useTimetable(timetableId)
  const updateTimetable = useUpdateTimetable()

  const event = eventResponse?.data

  const [pool, setPool] = useState([])
  const [entries, setEntries] = useState([]) // Normalized entries with top/duration/stageId/date
  const [activeItem, setActiveItem] = useState(null)
  const [selectedDay, setSelectedDay] = useState('')
  const [addActModalOpen, setAddActModalOpen] = useState(false)
  const [isInitialized, setIsInitialized] = useState(false)
  const [dragActive, setDragActive] = useState(null)
  const scrollRef = useRef(null)

  const days = useMemo(() => {
    if (!event) return []
    const start = new Date(event.start_date)
    const end = new Date(event.end_date)
    const list = []
    let curr = new Date(start)
    while (curr <= end) {
      list.push(curr.toISOString().split('T')[0])
      curr.setDate(curr.getDate() + 1)
    }
    return list
  }, [event])

  useEffect(() => {
    if (days.length > 0 && !selectedDay) setSelectedDay(days[0])
  }, [days, selectedDay])

  useEffect(() => {
    if (!event || !timetable || isInitialized) return

    // entries in DB are full datetime. We need to convert them to relative minutes from 9 AM of that day.
    const initialEntries = timetable.entries.map(entry => {
      const start = new Date(entry.start_time)
      const dateStr = start.toISOString().split('T')[0]

      // Calculate minutes since 9:00 AM of that day
      const baseTime = new Date(start)
      baseTime.setHours(9, 0, 0, 0)

      let top = Math.floor((start.getTime() - baseTime.getTime()) / 60000)

      // If start_time is e.g. 1 AM next day, top will be (25*60 - 9*60)
      // Verify logic...

      const end = new Date(entry.end_time)
      const duration = Math.floor((end.getTime() - start.getTime()) / 60000)

      return {
        ...entry.act,
        dragId: generateId(),
        stageId: entry.stage_id,
        date: dateStr,
        top,
        duration,
        actId: entry.act_id
      }
    })

    // Pre-fill pool with remaining acts from event lineup
    const assignedActIds = new Set(initialEntries.map(e => e.id))
    const initialPool = (event.acts || [])
      .filter(act => !assignedActIds.has(act.id))
      .map(act => ({
        ...act,
        dragId: generateId(),
        stageId: act.stage_id || act.pivot?.stage_id,
        date: act.date || act.pivot?.date
      }))

    setEntries(initialEntries)
    setPool(initialPool)
    setIsInitialized(true)
  }, [event, timetable, isInitialized])

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor)
  )

  const handleDragStart = (e) => {
    const { active } = e
    const item = [...pool, ...entries].find(i => i.dragId === active.id)
    setActiveItem(item)
    setDragActive(active)
  }

  const handleDragOver = (e) => {
    setDragActive(e.active)
  }

  const handleDragEnd = (e) => {
    const { active, over } = e
    setActiveItem(null)
    setDragActive(null)

    if (!over) return

    const draggedItem = [...pool, ...entries].find(i => i.dragId === active.id)
    if (!draggedItem) return

    // If dropped on a stage OR an act in a stage
    const overData = over.data.current
    let targetStageId = null
    let targetDate = null

    if (overData?.type === 'Stage') {
      targetStageId = overData.stage.id
      targetDate = overData.date
    } else if (overData?.type === 'Act') {
      targetStageId = overData.item.stageId
      targetDate = overData.item.date
    }

    if (targetStageId && targetDate) {
      // Calculate top relative to the droppable stage area, accounting for scroll
      const activeRect = active.rect.current.translated
      const gridArea = document.querySelector(`[data-grid-id="${targetStageId}_${targetDate}"]`)
      const overRect = gridArea?.getBoundingClientRect()

      if (!activeRect || !overRect) return

      let newTop = (activeRect.top - overRect.top) / SCALE

      // Use magnetic snapping
      const duration = draggedItem.duration || 60
      const dayEntries = entries.filter(e => e.date === targetDate && e.stageId === targetStageId)
      newTop = getSnappedTime(newTop, dayEntries, active.id, duration)

      const updatedItem = {
        ...draggedItem,
        top: newTop,
        duration: duration,
        stageId: targetStageId,
        date: targetDate
      }

      // Overlap check - with tiny tolerance
      const hasOverlap = entries.some(other => {
        if (other.dragId === draggedItem.dragId) return false
        if (other.stageId !== targetStageId || other.date !== targetDate) return false

        const otherEnd = other.top + other.duration
        const newEnd = updatedItem.top + updatedItem.duration

        // Use 0.1 tolerance to allow perfect alignment
        return (updatedItem.top < otherEnd - 0.1) && (newEnd > other.top + 0.1)
      })

      if (hasOverlap) {
        toast.warning('Acts cannot overlap on the same stage')
        return
      }

      setEntries(prev => {
        const filtered = prev.filter(i => i.dragId !== active.id)
        return [...filtered, updatedItem]
      })
      setPool(prev => prev.filter(i => i.dragId !== active.id))
    }
    // If dropped back to pool
    else if (over.id === 'pool') {
      setPool(prev => [...prev.filter(i => i.dragId !== active.id), { ...draggedItem, top: undefined, stageId: undefined, date: undefined }])
      setEntries(prev => prev.filter(i => i.dragId !== active.id))
    }
  }

  const handleResize = (dragId, newHeight) => {
    // Round to 1 minute. newHeight is in pixels, convert to minutes.
    let newDuration = Math.round(newHeight / SCALE)
    newDuration = Math.max(15, newDuration) // 15 min minimum

    // Check for overlap while resizing
    const act = entries.find(i => i.dragId === dragId)
    if (!act) return

    // Magnetic snapping for RESIZE (snap end of current act to start of next act)
    const dayEntries = entries.filter(e => e.date === act.date && e.stageId === act.stageId && e.dragId !== dragId)
    const nextAct = dayEntries
      .filter(e => e.top >= act.top + act.duration - 30) // Look ahead
      .sort((a, b) => a.top - b.top)[0]

    if (nextAct) {
      const snapDist = Math.abs((act.top + newDuration) - nextAct.top)
      if (snapDist < 15) {
        newDuration = nextAct.top - act.top
      }
    }

    const hasOverlap = entries.some(other => {
      if (other.dragId === dragId) return false
      if (other.stageId !== act.stageId || other.date !== act.date) return false

      const otherEnd = other.top + other.duration
      const newEnd = act.top + newDuration

      return (act.top < otherEnd - 0.1) && (newEnd > other.top + 0.1)
    })

    if (hasOverlap) return // Silently block resizing into other acts

    setEntries(prev => prev.map(item =>
      item.dragId === dragId ? { ...item, duration: newDuration } : item
    ))
  }

  const handleRemove = (dragId) => {
    const item = entries.find(i => i.dragId === dragId)
    if (item) {
      setPool(prev => [...prev, item])
      setEntries(prev => prev.filter(i => i.dragId !== dragId))
    }
  }

  const handleAddActToPool = (act) => {
    if ([...pool, ...entries].some(i => i.id === act.id)) {
      toast.error('Act already in editor')
      return
    }
    setPool(prev => [...prev, { ...act, dragId: generateId() }])
  }

  const handleSave = async () => {
    const payloadEntries = entries.map(item => {
      // Convert top (minutes from 9 AM) and date to full ISO
      const start = new Date(item.date)
      start.setHours(9, 0, 0, 0)
      start.setMinutes(item.top)

      const end = new Date(start)
      end.setMinutes(start.getMinutes() + item.duration)

      return {
        stage_id: item.stageId,
        act_id: item.id,
        start_time: start.toISOString(),
        end_time: end.toISOString()
      }
    })

    try {
      await updateTimetable.mutateAsync({
        id: timetableId,
        data: { entries: payloadEntries }
      })
      toast.success('Timetable saved')
      navigate(`/events/${eventId}/timetables`)
    } catch (e) {
      console.error(e)
    }
  }

  if (isEventLoading || isTimetableLoading || !isInitialized) return <div className="flex justify-center py-12"><Loader2 className="animate-spin" /></div>

  const visibleEntries = entries.filter(e => e.date === selectedDay)

  return (
    <div className="flex flex-col h-[calc(100vh-6rem)] space-y-4">
      <div className="flex items-center justify-between shrink-0">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(`/events/${eventId}/timetables`)}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <PageHeader title={`Edit Timetable: ${timetable.name}`} description="Drag acts to stages and set their duration." />
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setAddActModalOpen(true)}><Plus className="h-4 w-4 mr-2" /> Add Act</Button>
          <Button onClick={handleSave} disabled={updateTimetable.isPending}>
            {updateTimetable.isPending ? <Loader2 className="animate-spin h-4 w-4 mr-2" /> : <Save className="h-4 w-4 mr-2" />}
            Save Changes
          </Button>
        </div>
      </div>

      {days.length > 1 && (
        <div className="shrink-0 flex gap-1 bg-muted/50 p-1 rounded-md overflow-x-auto">
          {days.map((day) => {
            const dateObj = new Date(day)
            const dayName = dateObj.toLocaleDateString(undefined, { weekday: 'short' })
            const dateStr = dateObj.toLocaleDateString(undefined, { day: 'numeric', month: 'short' })
            return (
              <Button
                key={day}
                variant={selectedDay === day ? "default" : "ghost"}
                size="sm"
                className="flex-1 min-w-[100px] h-10 flex flex-col items-center gap-0"
                onClick={() => setSelectedDay(day)}
              >
                <span className="text-[9px] uppercase font-bold opacity-70">{dayName}</span>
                <span className="text-xs font-bold">{dateStr}</span>
              </Button>
            )
          })}
        </div>
      )}

      {event.stages?.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center bg-muted/10 border-2 border-dashed rounded-lg py-24">
          <PageHeader title="No Stages Found" description="You must add stages to the event lineup before you can create a timetable." />
          <Button variant="default" className="mt-6" onClick={() => navigate(`/events/${eventId}/lineup`)}>
            Go to Lineup Manager
          </Button>
        </div>
      ) : (
        <>
          <DndContext
            sensors={sensors}
            collisionDetection={closestCorners}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDragEnd={handleDragEnd}
          >
            {/* Top Area - Empty since pool is moving to stages */}
            <div className="flex-1 flex overflow-hidden border rounded-lg bg-card shadow-lg">
              {/* Layout: Fixed Time scale + Scrolling stages */}
              <div className="flex-1 flex overflow-hidden">
                <div ref={scrollRef} className="flex-1 flex overflow-y-auto overflow-x-auto relative">

                  {/* Fixed Time Scale Column - Sticky Left */}
                  <div className="w-24 shrink-0 border-r bg-muted/30 flex flex-col sticky left-0 z-40">
                    <div className="h-[95px] shrink-0 border-b bg-background/50 flex flex-col items-center justify-center">
                      <Calendar className="h-4 w-4 text-muted-foreground/30" />
                    </div>
                    <div className="h-14 shrink-0 bg-background/95 backdrop-blur-sm border-b flex flex-col justify-center px-4 font-black text-[10px] uppercase tracking-tighter text-muted-foreground sticky top-0 z-20">TIME</div>
                    <div className="relative" style={{ height: `${GRID_HEIGHT}px` }}>
                      {Array.from({ length: 18 }).map((_, i) => (
                        <div key={i} className="absolute left-0 right-0 border-b border-muted/20" style={{ top: `${i * ROW_HEIGHT}px`, height: `${ROW_HEIGHT}px` }}>
                          {/* Main Hour Label */}
                          <div className="absolute top-0 -translate-y-1/2 left-2 bg-background/80 backdrop-blur-sm px-1.5 py-0.5 rounded border shadow-sm font-black text-[11px] z-20">
                            {formatTimeMinutes(i * 60)}
                          </div>

                          {/* Half-hour marker */}
                          {i < 17 && (
                            <div className="absolute top-1/2 left-0 right-0 flex items-center justify-center -translate-y-1/2 opacity-30">
                              <span className="text-[10px] font-black">{formatTimeMinutes(i * 60 + 30)}</span>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Stages grid area */}
                  <div className="flex items-start">
                    {event.stages?.map(stage => (
                      <DroppableStageColumn
                        key={stage.id}
                        stage={stage}
                        date={selectedDay}
                        items={visibleEntries.filter(e => e.stageId === stage.id)}
                        onResize={handleResize}
                        onRemove={handleRemove}
                        scrollRef={scrollRef}
                        pool={pool}
                      />
                    ))}

                    {/* Floating Pool Column (for acts with no stage assigned in lineup) */}
                    <div className="flex flex-col w-[200px] shrink-0 border-r last:border-r-0 bg-muted/10 opacity-70">
                      <div className="h-[95px] shrink-0 border-b bg-background/50 flex flex-col items-center justify-center">
                        <span className="text-[8px] font-black uppercase tracking-tighter text-muted-foreground/40 text-center px-2">Unmapped<br />Lineup</span>
                      </div>
                      <div className="h-14 flex flex-col justify-center px-4 border-b sticky top-0 bg-background z-20">
                        <h3 className="text-[10px] font-black uppercase tracking-wider truncate text-muted-foreground">General Pool</h3>
                      </div>
                      <div className="p-2 space-y-2">
                        <DroppablePool id="pool">
                          {pool.filter(p => !p.stageId && p.date === selectedDay).map(item => (
                            <PoolActItem key={item.dragId} item={item} />
                          ))}
                          {pool.filter(p => !p.stageId && p.date === selectedDay).length === 0 && (
                            <div className="text-[10px] text-muted-foreground italic text-center py-12 px-4 border-2 border-dashed rounded-lg bg-background/30">
                              No general acts for this day
                            </div>
                          )}
                        </DroppablePool>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <DragOverlay>
              {activeItem ? (
                <Card className="p-3 border-l-8 border-l-primary shadow-2xl bg-background/95 backdrop-blur-sm scale-105 opacity-90 cursor-grabbing ring-4 ring-primary/20">
                  <div className="flex flex-col gap-1">
                    <span className="text-[14px] font-black leading-tight">{activeItem.name}</span>
                    <span className="text-[11px] font-bold text-primary">{activeItem.duration || 60} minutes</span>
                  </div>
                </Card>
              ) : null}
            </DragOverlay>
          </DndContext>
        </>
      )}

      <AddActModal open={addActModalOpen} onOpenChange={setAddActModalOpen} onAdd={handleAddActToPool} />
    </div>
  )
}

function DroppablePool({ id, children }) {
  const { setNodeRef, isOver } = useDroppable({ id })
  return (
    <div ref={setNodeRef} className={cn("min-w-full transition-colors rounded-md", isOver && "bg-primary/10 border-primary/20")}>
      {children}
    </div>
  )
}
