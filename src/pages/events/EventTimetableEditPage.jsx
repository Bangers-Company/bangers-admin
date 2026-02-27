import { useState, useMemo, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router'
import { 
  DndContext, 
  DragOverlay, 
  closestCorners, 
  KeyboardSensor, 
  PointerSensor, 
  useSensor, 
  useSensors, 
  useDroppable 
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
import { Loader2, ArrowLeft, Save, Plus, GripVertical, Clock } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

const ROW_HEIGHT = 240 // 1 hour = 240px -> 1 minute = 4px
const SCALE = ROW_HEIGHT / 60
const GRID_HEIGHT = 17 * ROW_HEIGHT // 9 AM to 2 AM = 17 hours

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
                  <div className="flex flex-col">
                    <span className="font-medium">{act.name}</span>
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
              <h4 className="text-[15px] font-bold leading-tight text-foreground line-clamp-4">{item.name}</h4>
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

function PoolActItem({ item }) {
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

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners} className="mb-2">
      <Card className="p-2 border-l-4 border-l-muted hover:bg-muted/30 transition-colors">
        <div className="flex items-center gap-2">
          <GripVertical className="h-3 w-3 text-muted-foreground" />
          <div className="flex flex-col min-w-0">
             <span className="text-[13px] font-bold truncate leading-tight text-foreground">{item.name}</span>
             <span className="text-[11px] text-muted-foreground truncate italic">
               {item.artists?.map(a => a.name).join(', ')}
             </span>
          </div>
        </div>
      </Card>
    </div>
  )
}

function DroppableStageColumn({ stage, date, items, onResize, onRemove }) {
  const { setNodeRef, isOver } = useDroppable({
    id: `${stage.id}_${date}`,
    data: { type: 'Stage', stage, date }
  })

  return (
    <div className="flex flex-col w-[240px] shrink-0 border-r last:border-r-0 bg-muted/5">
      <div className="h-14 flex flex-col justify-center px-4 border-b sticky top-0 bg-background z-20">
        <h3 className="text-xs font-bold uppercase tracking-wider truncate text-primary">{stage.name}</h3>
      </div>
      
      <div 
        ref={setNodeRef}
        className={cn(
          "relative flex-1",
          isOver && "bg-primary/5"
        )}
        style={{ height: `${GRID_HEIGHT}px` }}
      >
        {/* Hour guide lines */}
        {Array.from({ length: 18 }).map((_, i) => (
          <div 
            key={i} 
            className="absolute left-0 right-0 border-b border-muted/50 z-0" 
            style={{ top: `${i * ROW_HEIGHT}px`, height: '1px' }}
          />
        ))}

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

    setEntries(initialEntries)
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
  }

  const handleDragOver = (e) => {
    // We handle movement between columns and pool here if needed
  }

  const handleDragEnd = (e) => {
    const { active, over, delta } = e
    setActiveItem(null)
    
    if (!over) return

    const draggedItem = [...pool, ...entries].find(i => i.dragId === active.id)
    if (!draggedItem) return

    // If dropped on a stage
    if (over.data.current?.type === 'Stage') {
      const { stage, date } = over.data.current
      
      // Calculate top relative to the droppable stage area, accounting for scroll
      const activeRect = active.rect.current.translated
      const overRect = over.rect
      
      if (!activeRect || !overRect || !scrollRef.current) return

      let newTop = ((activeRect.top - overRect.top) + scrollRef.current.scrollTop) / SCALE
 
      // Snap to 1 minute intervals
      newTop = Math.round(newTop)
      newTop = Math.max(0, Math.min(newTop, 1020 - (draggedItem.duration || 60)))

      const updatedItem = {
        ...draggedItem,
        top: newTop,
        duration: draggedItem.duration || 60,
        stageId: stage.id,
        date: date
      }

      // Overlap check - with 1-min tolerance
      const hasOverlap = entries.some(other => {
        if (other.dragId === draggedItem.dragId) return false
        if (other.stageId !== stage.id || other.date !== date) return false
        
        const otherEnd = other.top + other.duration
        const newEnd = updatedItem.top + updatedItem.duration
        
        // Use a tiny 1-minute tolerance to prevent "shooting back" on tight placements
        return (updatedItem.top < otherEnd - 1) && (newEnd > other.top + 1)
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
    // If dropped back to pool (implicitly if not on stage, or if we define a pool droppable)
    else if (over.id === 'pool') {
      setPool(prev => [...prev.filter(i => i.dragId !== active.id), { ...draggedItem, top: undefined, stageId: undefined, date: undefined }])
      setEntries(prev => prev.filter(i => i.dragId !== active.id))
    }
  }

   const handleResize = (dragId, newHeight) => {
    // Round to 1 minute. newHeight is in pixels, convert to minutes.
    const newDuration = Math.round(newHeight / SCALE)
    const snappedDuration = Math.max(15, newDuration) // 15 min minimum
    
    // Check for overlap while resizing
    const act = entries.find(i => i.dragId === dragId)
    if (!act) return

    const hasOverlap = entries.some(other => {
      if (other.dragId === dragId) return false
      if (other.stageId !== act.stageId || other.date !== act.date) return false
      
      const otherEnd = other.top + other.duration
      const newEnd = act.top + snappedDuration
      
      return act.top < otherEnd && newEnd > other.top
    })

    if (hasOverlap) return // Silently block resizing into other acts

    setEntries(prev => prev.map(item => 
      item.dragId === dragId ? { ...item, duration: snappedDuration } : item
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

      <DndContext 
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="flex-1 flex overflow-hidden border rounded-lg bg-card shadow-lg">
          {/* Layout: Fixed Time scale + Scrolling stages */}
          <div className="flex-1 flex overflow-hidden">
            <div ref={scrollRef} className="flex-1 flex overflow-y-auto overflow-x-auto relative">
                
                {/* Fixed Time Scale Column - Sticky Left */}
                <div className="w-24 shrink-0 border-r bg-muted/30 flex flex-col sticky left-0 z-40">
                  <div className="h-14 shrink-0 bg-background/95 backdrop-blur-sm border-b flex items-center justify-center font-black text-[10px] uppercase tracking-tighter text-muted-foreground">TIME</div>
                  <div className="relative" style={{ height: `${GRID_HEIGHT}px` }}>
                    {Array.from({ length: 18 }).map((_, i) => (
                      <div key={i} className="absolute left-0 right-0 border-b border-muted/20" style={{ top: `${i * ROW_HEIGHT}px`, height: `${ROW_HEIGHT}px` }}>
                        {/* Main Hour Label */}
                        <div className="absolute top-0 left-0 right-0 flex justify-center -translate-y-1/2">
                          <div className="px-2 py-1 bg-primary text-primary-foreground font-black text-xs rounded-md shadow-sm border-2 border-background">
                            {formatTime(i * 60)}
                          </div>
                        </div>
                        
                        {/* Half-hour marker */}
                        {i < 17 && (
                          <div className="absolute top-1/2 left-0 right-0 flex items-center justify-center -translate-y-1/2 opacity-30">
                            <span className="text-[10px] font-black">{formatTime(i * 60 + 30)}</span>
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
                    />
                  ))}
                </div>
              </div>
            </div>

          {/* Pool Sidebar */}
          <div className="w-72 border-l bg-background flex flex-col shrink-0">
             <div className="p-4 border-b flex items-center justify-between bg-primary/5">
               <h4 className="text-[11px] font-black uppercase tracking-widest text-primary">Unassigned Acts</h4>
               <Badge variant="secondary" className="font-black">{pool.length}</Badge>
             </div>
             
             <div className="flex-1 overflow-y-auto p-4 space-y-3">
               <DroppablePool id="pool">
                  {pool.map(item => (
                    <PoolActItem key={item.dragId} item={item} />
                  ))}
                  {pool.length === 0 && (
                    <div className="text-xs text-muted-foreground italic text-center py-12 px-4 border-2 border-dashed rounded-lg bg-muted/10">
                      Drag acts here to remove them from the timetable
                    </div>
                  )}
               </DroppablePool>
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

      <AddActModal open={addActModalOpen} onOpenChange={setAddActModalOpen} onAdd={handleAddActToPool} />
    </div>
  )
}

function DroppablePool({ id, children }) {
  const { setNodeRef, isOver } = useDroppable({ id })
  return (
    <div ref={setNodeRef} className={cn("min-h-[200px] h-full transition-colors rounded-md", isOver && "bg-primary/5")}>
      {children}
    </div>
  )
}
