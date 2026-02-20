import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { Plus, MoreHorizontal } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { DataTable, SortableHeader } from '@/components/shared/DataTable'
import { DeleteDialog } from '@/components/shared/DeleteDialog'
import { PageHeader } from '@/components/shared/PageHeader'
import { StageForm } from './StageForm'
import { useStages, useDeleteStage } from '@/hooks/useStages'

export default function StagesPage() {
  const [page, setPage] = useState(0)
  const [formOpen, setFormOpen] = useState(false)
  const [editingStage, setEditingStage] = useState(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [deletingStage, setDeletingStage] = useState(null)
  const [bulkDeleteDialogOpen, setBulkDeleteDialogOpen] = useState(false)
  const [bulkDeleteIds, setBulkDeleteIds] = useState([])
  const [bulkDeleting, setBulkDeleting] = useState(false)

  const [search, setSearch] = useState('')
  const { data, isLoading } = useStages(page + 1, { search })
  const deleteStage = useDeleteStage()

  useEffect(() => { document.title = 'Stages — Bangers Admin' }, [])

  const stages = data?.data || []
  const meta = data?.meta || {}

  const columns = [
    {
      accessorKey: 'name',
      header: ({ column }) => <SortableHeader column={column}>Name</SortableHeader>,
    },
    {
      id: 'events',
      header: 'Events',
      cell: ({ row }) => {
        const events = row.original.events || []
        if (events.length === 0) return '—'
        return (
          <div className="flex flex-wrap gap-1">
            {events.map((event) => (
              <Badge key={event.id} variant="secondary" className="text-[10px] px-1 py-0">
                {event.name}
              </Badge>
            ))}
          </div>
        )
      },
    },
    {
      accessorKey: 'description',
      header: 'Description',
      cell: ({ row }) => {
        const desc = row.original.description
        if (!desc) return '—'
        return desc.length > 50 ? desc.slice(0, 50) + '...' : desc
      },
    },
    {
      id: 'actions',
      header: '',
      cell: ({ row }) => {
        const stage = row.original
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={() => {
                  setEditingStage(stage)
                  setFormOpen(true)
                }}
              >
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem
                className="text-destructive"
                onClick={() => {
                  setDeletingStage(stage)
                  setDeleteDialogOpen(true)
                }}
              >
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
    },
  ]

  async function handleDelete() {
    try {
      await deleteStage.mutateAsync(deletingStage.id)
      toast.success('Stage deleted')
      setDeleteDialogOpen(false)
      setDeletingStage(null)
    } catch (error) {
      toast.error(error.message || 'Failed to delete stage')
    }
  }

  async function handleBulkDelete() {
    setBulkDeleting(true)
    try {
      await Promise.all(bulkDeleteIds.map((id) => deleteStage.mutateAsync(id)))
      toast.success(`${bulkDeleteIds.length} stage(s) deleted`)
      setBulkDeleteDialogOpen(false)
      setBulkDeleteIds([])
    } catch (error) {
      toast.error(error.message || 'Failed to delete some stages')
    } finally {
      setBulkDeleting(false)
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Stages"
        description="Manage event stages"
        action={
          <Button
            onClick={() => {
              setEditingStage(null)
              setFormOpen(true)
            }}
          >
            <Plus className="mr-2 h-4 w-4" />
            Create Stage
          </Button>
        }
      />
      <DataTable
        columns={columns}
        data={stages}
        pageCount={meta.last_page || 0}
        pageIndex={page}
        onPageChange={setPage}
        filterValue={search}
        onFilterChange={setSearch}
        filterColumn="name"
        filterPlaceholder="Search stages..."
        isLoading={isLoading}
        enableRowSelection
        enableColumnVisibility
        onBulkDelete={(ids) => {
          setBulkDeleteIds(ids)
          setBulkDeleteDialogOpen(true)
        }}
        emptyState={
          <div className="flex flex-col items-center gap-2 py-4">
            <p className="text-muted-foreground">No stages yet.</p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => { setEditingStage(null); setFormOpen(true) }}
            >
              <Plus className="mr-2 h-4 w-4" />
              Create your first stage
            </Button>
          </div>
        }
      />
      <StageForm
        open={formOpen}
        onOpenChange={(open) => {
          setFormOpen(open)
          if (!open) setEditingStage(null)
        }}
        stage={editingStage}
      />
      <DeleteDialog
        open={deleteDialogOpen}
        onOpenChange={(open) => {
          setDeleteDialogOpen(open)
          if (!open) setDeletingStage(null)
        }}
        onConfirm={handleDelete}
        title="Delete Stage"
        description={`Are you sure you want to delete "${deletingStage?.name}"? This action cannot be undone.`}
        isDeleting={deleteStage.isPending}
      />
      <DeleteDialog
        open={bulkDeleteDialogOpen}
        onOpenChange={(open) => {
          setBulkDeleteDialogOpen(open)
          if (!open) setBulkDeleteIds([])
        }}
        onConfirm={handleBulkDelete}
        title="Delete Stages"
        description={`Are you sure you want to delete ${bulkDeleteIds.length} stage(s)? This action cannot be undone.`}
        isDeleting={bulkDeleting}
      />
    </div>
  )
}
